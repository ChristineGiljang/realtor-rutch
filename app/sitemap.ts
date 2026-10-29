import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { CITIES, cityWhereClause, getCityBySlug } from "@/lib/cities";
import { FILTERS } from "@/lib/filter-slugs";
import { AREAS, areaWhereClause, getAreaBySlug } from "@/lib/areas";
import {
  BUILDINGS,
  buildingWhereClause,
  getBuildingBySlug,
} from "@/lib/buildings";

// Next.js builds sitemap.ts once at deploy time unless told otherwise, so new
// and removed listings would not show up until the next deploy. Rebuild hourly.
export const revalidate = 3600;

interface FilterLike {
  slug: string;
  type?: string;
  subtype?: string;
  category?: string;
}

// Same filter fields the /[city]/[filterSlug] pages use in their queries.
const filterFields = (filter: FilterLike) => ({
  ...(filter.type ? { type: filter.type } : {}),
  ...(filter.subtype ? { subtype: filter.subtype } : {}),
  ...(filter.category ? { listingCategory: filter.category } : {}),
});

// True if at least one active listing matches. Empty pages are left out of the
// sitemap because Google treats them as soft 404s.
async function exists(where: any): Promise<boolean> {
  if (!where) return false;
  const row = await db.property.findFirst({ where, select: { id: true } });
  return row !== null;
}

// Runs the checks a few at a time so a long list can't exhaust the database
// connection pool.
async function mapInChunks<T, R>(
  items: T[],
  size: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    const chunk = items.slice(i, i + size);
    results.push(...(await Promise.all(chunk.map(fn))));
  }
  return results;
}

// Mirrors the where clauses in the area and building pages.
function areaWhere(area: (typeof AREAS)[number]) {
  const city = getCityBySlug(area.citySlug);
  if (!city) return null;
  return {
    status: "active",
    AND: [{ OR: cityWhereClause(city) }, { OR: areaWhereClause(area) }],
  };
}

function buildingWhere(building: (typeof BUILDINGS)[number]) {
  const city = getCityBySlug(building.citySlug);
  const area = city ? getAreaBySlug(city.slug, building.areaSlug) : undefined;
  const found =
    city && area
      ? getBuildingBySlug(city.slug, area.slug, building.slug)
      : undefined;
  if (!city || !area || !found) return null;
  return {
    status: "active",
    AND: [
      { OR: cityWhereClause(city) },
      { OR: areaWhereClause(area) },
      { OR: buildingWhereClause(found) },
    ],
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://realtor-rutch.com"
  ).replace(/\/$/, "");

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl },
    { url: `${baseUrl}/listings` },
    { url: `${baseUrl}/blog` },
    { url: `${baseUrl}/about` },
    { url: `${baseUrl}/contact` },
  ];

  try {
    const active = { status: "active" };

    const [properties, posts] = await Promise.all([
      db.property.findMany({
        where: active,
        select: { slug: true, updatedAt: true },
      }),
      db.blogPost.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    // Landing pages change when any listing changes, so use the newest listing
    // update as their lastModified. Using new Date() on every page teaches
    // Google to ignore lastModified.
    const latestListingUpdate = properties.reduce<Date | undefined>(
      (latest, p) => (!latest || p.updatedAt > latest ? p.updatedAt : latest),
      undefined,
    );
    const landing = (url: string) => ({
      url,
      ...(latestListingUpdate ? { lastModified: latestListingUpdate } : {}),
    });

    // City pages: /[city]
    const cityChecks = await mapInChunks(CITIES, 8, (city) =>
      exists({ ...active, OR: cityWhereClause(city) }),
    );
    const activeCities = CITIES.filter((_, i) => cityChecks[i]);
    const cityPages = activeCities.map((city) =>
      landing(`${baseUrl}/${city.slug}`),
    );

    // City + filter pages: /[city]/[filterSlug]
    const cityFilterPairs = activeCities.flatMap((city) =>
      FILTERS.map((filter) => ({ city, filter })),
    );
    const cityFilterChecks = await mapInChunks(
      cityFilterPairs,
      8,
      ({ city, filter }) =>
        exists({
          ...active,
          OR: cityWhereClause(city),
          ...filterFields(filter),
        }),
    );
    const cityFilterPages = cityFilterPairs
      .filter((_, i) => cityFilterChecks[i])
      .map(({ city, filter }) =>
        landing(`${baseUrl}/${city.slug}/${filter.slug}`),
      );

    // Area pages: /[city]/[filterSlug]/[area]
    const activeCitySlugs = new Set(activeCities.map((city) => city.slug));
    const areaCandidates = AREAS.filter((area) =>
      activeCitySlugs.has(area.citySlug),
    );
    const areaChecks = await mapInChunks(areaCandidates, 8, (area) =>
      exists(areaWhere(area)),
    );
    const activeAreas = areaCandidates.filter((_, i) => areaChecks[i]);

    const areaFilterPairs = activeAreas.flatMap((area) =>
      FILTERS.map((filter) => ({ area, filter })),
    );
    const areaFilterChecks = await mapInChunks(
      areaFilterPairs,
      8,
      ({ area, filter }) => {
        const where = areaWhere(area);
        return exists(where ? { ...where, ...filterFields(filter) } : null);
      },
    );
    const areaFilterPages = areaFilterPairs
      .filter((_, i) => areaFilterChecks[i])
      .map(({ area, filter }) =>
        landing(`${baseUrl}/${area.citySlug}/${filter.slug}/${area.slug}`),
      );

    // Building pages: /[city]/[filterSlug]/[area]/[building] (condo filters)
    const condoFilters = FILTERS.filter((filter) => filter.type === "condo");
    const buildingChecks = await mapInChunks(BUILDINGS, 8, (building) =>
      exists(buildingWhere(building)),
    );
    const activeBuildings = BUILDINGS.filter((_, i) => buildingChecks[i]);

    const buildingFilterPairs = activeBuildings.flatMap((building) =>
      condoFilters.map((filter) => ({ building, filter })),
    );
    const buildingFilterChecks = await mapInChunks(
      buildingFilterPairs,
      8,
      ({ building, filter }) => {
        const where = buildingWhere(building);
        return exists(where ? { ...where, ...filterFields(filter) } : null);
      },
    );
    const buildingFilterPages = buildingFilterPairs
      .filter((_, i) => buildingFilterChecks[i])
      .map(({ building, filter }) =>
        landing(
          `${baseUrl}/${building.citySlug}/${filter.slug}/${building.areaSlug}/${building.slug}`,
        ),
      );

    // /listings query-param pages: the broad "<type> for <sale/rent> in Cebu"
    // pages, e.g. /listings?type=house&category=sale.
    //
    // NOTE: the "&" between query params is written as "&amp;" on purpose.
    // This version of Next.js does not escape URLs in sitemap.xml, and a bare
    // "&" breaks XML parsing. After deploying, open /sitemap.xml and confirm
    // each URL shows "&amp;" exactly once (not "&amp;amp;").
    const comboCandidates = [
      { type: "house", category: "sale" },
      { type: "condo", category: "sale" },
      { type: "land", category: "sale" },
      { type: "house", category: "rent" },
      { type: "condo", category: "rent" },
    ];
    const comboChecks = await mapInChunks(comboCandidates, 5, (combo) =>
      exists({ ...active, type: combo.type, listingCategory: combo.category }),
    );
    const listingsComboPages = comboCandidates
      .filter((_, i) => comboChecks[i])
      .map(({ type, category }) =>
        landing(`${baseUrl}/listings?type=${type}&amp;category=${category}`),
      );

    // Main Cebu landing page. comboCandidates[0] is house + sale, so this is
    // only listed when there is at least one active house and lot for sale.
    const cebuHouseLotPage = comboChecks[0]
      ? [landing(`${baseUrl}/house-and-lot-for-sale-in-cebu`)]
      : [];

    // Condo landing page. comboChecks[1] is condo + sale, so this is only
    // listed when there is at least one active condo for sale.
    const cebuCondoPage = comboChecks[1]
      ? [landing(`${baseUrl}/condo-for-sale-in-cebu`)]
      : [];

    // Lot landing page. comboChecks[2] is land + sale, so this is only
    // listed when there is at least one active lot for sale.
    const cebuLotPage = comboChecks[2]
      ? [landing(`${baseUrl}/lot-for-sale-in-cebu`)]
      : [];

    // Property detail pages: /property/[slug] (active listings only)
    const listingPages = properties.map((property) => ({
      url: `${baseUrl}/property/${property.slug}`,
      lastModified: property.updatedAt,
    }));

    // Blog posts: /blog/[slug]
    const blogPages = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
    }));

    return [
      ...staticPages,
      ...cebuHouseLotPage,
      ...cebuCondoPage,
      ...cebuLotPage,
      ...cityPages,
      ...cityFilterPages,
      ...areaFilterPages,
      ...buildingFilterPages,
      ...listingsComboPages,
      ...listingPages,
      ...blogPages,
    ];
  } catch (error) {
    // A failing sitemap is worse than a short one: return the static pages
    // instead of a 500.
    console.error("sitemap: failed to build dynamic entries", error);
    return staticPages;
  }
}
