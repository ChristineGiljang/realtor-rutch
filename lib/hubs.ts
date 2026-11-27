// lib/hubs.ts
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { getCityBySlug, type CityDef } from "@/lib/cities";
import { AREAS, getAreaBySlug, type AreaDef } from "@/lib/areas";
import { BUILDINGS, type BuildingDef } from "@/lib/buildings";
import { FILTERS, type FilterDef } from "@/lib/filter-slugs";

// Minimum active listings a building or area hub needs before it is shown to
// Google (listed in the sitemap, allowed to be indexed) and linked from the
// home page, footer and directory.
export const MIN_LISTINGS_FOR_INDEX = 3;

export function isHubIndexable(listingCount: number): boolean {
  return listingCount >= MIN_LISTINGS_FOR_INDEX;
}

// Use in generateMetadata of area and building pages so the meta robots tag
// always agrees with the sitemap.
export function hubRobots(listingCount: number) {
  return isHubIndexable(listingCount)
    ? { index: true, follow: true }
    : { index: false, follow: true };
}

// ---------------------------------------------------------------------------
// Hub directory: every building and area hub that has enough listings.
// Same matching rules as the sitemap and the hub pages.
// ---------------------------------------------------------------------------

interface Row {
  title: string;
  city: string;
  barangay: string | null;
  address: string;
  building: string | null;
  type: string;
  subtype: string | null;
  listingCategory: string;
}

const lc = (s: string | null | undefined) => (s ?? "").toLowerCase();

function cityMatches(row: Row, city: CityDef): boolean {
  const c = lc(row.city);
  return city.matches.some((m) => c.includes(m.toLowerCase()));
}

function areaMatches(row: Row, area: AreaDef): boolean {
  const barangay = lc(row.barangay);
  const address = lc(row.address);
  const title = lc(row.title);
  return area.matches.some((raw) => {
    const m = raw.toLowerCase();
    return (
      barangay.includes(m) ||
      address.includes(m) ||
      (area.matchTitle === true && title.includes(m))
    );
  });
}

function buildingMatches(row: Row, building: BuildingDef): boolean {
  const b = lc(row.building);
  const title = lc(row.title);
  return building.matches.some((raw) => {
    const m = raw.toLowerCase();
    return b.includes(m) || title.includes(m);
  });
}

function filterMatches(row: Row, filter: FilterDef): boolean {
  if (filter.type && row.type !== filter.type) return false;
  if (filter.subtype && row.subtype !== filter.subtype) return false;
  if (filter.category && row.listingCategory !== filter.category) return false;
  return true;
}

export interface HubLink {
  name: string; // "The Alcoves", "Lahug"
  href: string; // the hub page with the most listings for this place
  count: number; // listings on that hub page
  filterLabel: string; // e.g. the filter's label, for link text
  cityName: string;
  areaName?: string; // set for buildings
}

export interface HubDirectory {
  buildings: HubLink[];
  areas: HubLink[];
}

async function buildHubDirectory(): Promise<HubDirectory> {
  const rows: Row[] = await db.property.findMany({
    where: { status: "active" },
    select: {
      title: true,
      city: true,
      barangay: true,
      address: true,
      building: true,
      type: true,
      subtype: true,
      listingCategory: true,
    },
  });

  // Buildings: condo filters only, same as the sitemap.
  const condoFilters = FILTERS.filter((f) => f.type === "condo");
  const buildings: HubLink[] = [];
  for (const building of BUILDINGS) {
    const city = getCityBySlug(building.citySlug);
    const area = city ? getAreaBySlug(city.slug, building.areaSlug) : undefined;
    if (!city || !area) continue;

    const inBuilding = rows.filter(
      (r) =>
        cityMatches(r, city) &&
        areaMatches(r, area) &&
        buildingMatches(r, building),
    );

    let best: { filter: FilterDef; count: number } | null = null;
    for (const filter of condoFilters) {
      const count = inBuilding.filter((r) => filterMatches(r, filter)).length;
      if (isHubIndexable(count) && (!best || count > best.count)) {
        best = { filter, count };
      }
    }
    if (best) {
      buildings.push({
        name: building.name,
        href: `/${city.slug}/${best.filter.slug}/${area.slug}/${building.slug}`,
        count: best.count,
        filterLabel: best.filter.label,
        cityName: city.name,
        areaName: area.name,
      });
    }
  }

  // Areas: every filter, keeping the one with the most listings per area.
  const areas: HubLink[] = [];
  for (const area of AREAS) {
    const city = getCityBySlug(area.citySlug);
    if (!city) continue;

    const inArea = rows.filter(
      (r) => cityMatches(r, city) && areaMatches(r, area),
    );

    let best: { filter: FilterDef; count: number } | null = null;
    for (const filter of FILTERS) {
      const count = inArea.filter((r) => filterMatches(r, filter)).length;
      if (isHubIndexable(count) && (!best || count > best.count)) {
        best = { filter, count };
      }
    }
    if (best) {
      areas.push({
        name: area.name,
        href: `/${city.slug}/${best.filter.slug}/${area.slug}`,
        count: best.count,
        filterLabel: best.filter.label,
        cityName: city.name,
      });
    }
  }

  const byCountThenName = (a: HubLink, b: HubLink) =>
    b.count - a.count || a.name.localeCompare(b.name);
  buildings.sort(byCountThenName);
  areas.sort(byCountThenName);

  return { buildings, areas };
}

// Cached for an hour so the home page, footer and directory don't each run the
// query. Call revalidateTag("hub-directory") from the import route to refresh
// it right after a new listing is added.
export const getHubDirectory = unstable_cache(
  buildHubDirectory,
  ["hub-directory"],
  { revalidate: 3600, tags: ["hub-directory"] },
);
