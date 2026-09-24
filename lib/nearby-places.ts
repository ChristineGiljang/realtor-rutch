import { unstable_cache } from "next/cache";

const CATEGORY_CAPS: { category: string; cap: number }[] = [
  { category: "education.school", cap: 4 },
  { category: "commercial.shopping_mall", cap: 3 },
  { category: "commercial.convenience", cap: 3 },
];
const WALK_RANGE_SECONDS = 1800;

export interface NearbyPlace {
  name: string;
  category: string;
  lat: number;
  lon: number;
  walkSeconds: number;
}

export interface NearbyPlacesResult {
  places: NearbyPlace[];
  isoline: any | null;
}

async function fetchNearbyPlaces(
  lat: number,
  lng: number,
): Promise<NearbyPlacesResult> {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) {
    console.error("GEOAPIFY_API_KEY not configured");
    return { places: [], isoline: null };
  }

  try {
    // Isoline doesn't depend on the places search or the routing matrix at
    // all — it only needs lat/lng — so fetch it in parallel with them
    // instead of waiting for them to finish first.
    const [categoryResults, isolineData] = await Promise.all([
      Promise.all(
        CATEGORY_CAPS.map(async ({ category }) => {
          const placesUrl = new URL("https://api.geoapify.com/v2/places");
          placesUrl.searchParams.set("categories", category);
          placesUrl.searchParams.set("filter", `circle:${lng},${lat},5000`);
          placesUrl.searchParams.set("bias", `proximity:${lng},${lat}`);
          placesUrl.searchParams.set("limit", "10");
          placesUrl.searchParams.set("apiKey", apiKey);

          const res = await fetch(placesUrl.toString());
          const data = await res.json();
          const features = data.features || [];
          return features.map((f: any) => ({
            ...f,
            __sourceCategory: category,
          }));
        }),
      ),
      (async () => {
        const isolineUrl = new URL("https://api.geoapify.com/v1/isoline");
        isolineUrl.searchParams.set("lat", String(lat));
        isolineUrl.searchParams.set("lon", String(lng));
        isolineUrl.searchParams.set("type", "time");
        isolineUrl.searchParams.set("mode", "walk");
        isolineUrl.searchParams.set("range", String(WALK_RANGE_SECONDS));
        isolineUrl.searchParams.set("apiKey", apiKey);
        const res = await fetch(isolineUrl.toString());
        return res.json();
      })(),
    ]);

    const allFeatures = categoryResults.flat();
    if (allFeatures.length === 0) {
      return { places: [], isoline: isolineData.features?.[0] ?? null };
    }

    const matrixRes = await fetch(
      `https://api.geoapify.com/v1/routematrix?apiKey=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "walk",
          sources: [{ location: [lng, lat] }],
          targets: allFeatures.map((f: any) => ({
            location: [f.properties.lon, f.properties.lat],
          })),
        }),
      },
    );
    const matrixData = await matrixRes.json();
    const times = matrixData.sources_to_targets?.[0] || [];

    const withTimes = allFeatures.map((f: any, i: number) => ({
      name: f.properties.name || f.properties.address_line1 || "Unnamed place",
      category: f.__sourceCategory as string,
      lat: f.properties.lat,
      lon: f.properties.lon,
      walkSeconds: times[i]?.time ?? null,
    }));

    let places: NearbyPlace[] = [];
    for (const { category, cap } of CATEGORY_CAPS) {
      const inCategory = withTimes
        .filter(
          (p) =>
            p.category === category &&
            p.walkSeconds !== null &&
            p.walkSeconds <= WALK_RANGE_SECONDS,
        )
        .sort((a, b) => (a.walkSeconds as number) - (b.walkSeconds as number))
        .slice(0, cap);
      places = places.concat(inCategory as NearbyPlace[]);
    }
    places.sort((a, b) => a.walkSeconds - b.walkSeconds);

    return { places, isoline: isolineData.features?.[0] ?? null };
  } catch (err) {
    console.error("getNearbyPlaces error:", err);
    return { places: [], isoline: null };
  }
}

// Cached per (lat, lng) pair for 24 hours, shared across every visitor —
// not per-browser. The first person to view a given listing each day pays
// the Geoapify round trip; everyone else after that gets an instant hit.
export const getNearbyPlaces = unstable_cache(
  fetchNearbyPlaces,
  ["nearby-places"],
  { revalidate: 60 * 60 * 24 },
);
