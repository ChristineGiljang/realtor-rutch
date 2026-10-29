import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { CITIES, getCityBySlug, type CityDef } from "@/lib/cities";
import { FILTERS, type FilterDef } from "@/lib/filter-slugs";
import { AREAS, getAreaBySlug, type AreaDef } from "@/lib/areas";
import {
  BUILDINGS,
  getBuildingBySlug,
  type BuildingDef,
} from "@/lib/buildings";

// Next.js builds sitemap.ts once at deploy time unless told otherwise, so new
// and removed listings would not show up until the next deploy. Rebuild hourly.
export const revalidate = 3600;

// The sitemap loads every active listing once and checks the city, area,
// building and filter rules in memory. Doing one database query per page
// (hundreds of them) was slow enough to break the Vercel build.
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

// Same rule as cityWhereClause in lib/cities.ts
function cityMatches(row: Row, city: CityDef): boolean {
  const c = lc(row.city);
  return city.matches.some((m) => c.includes(m.toLowerCase()));
}

// Same rule as areaWhereClause in lib/areas.ts (title only when matchTitle is on)
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

// Same rule as buildingWhereClause in lib/buildings.ts
function buildingMatches(row: Row, building: BuildingDef): boolean {
  const b = lc(row.building);
  const title = lc(row.title);
  return building.matches.some((raw) => {
    const m = raw.toLowerCase();
    return b.includes(m) || title.includes(m);
  });
}

// Same filter fields the /[city]/[filterSlug] pages use in their queries.
function filterMatches(row: Row, filter: FilterDef): boolean {
  if (filter.type && row.type !== filter.type) return false;
  if (filter.subtype && row.subtype !== filter.subtype) return false;
  if (filter.category && row.listingCategory !== filter.category) return false;
  return true;
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
    const [properties, posts] = await Promise.all([
      db.property.findMany({
        where: { status: "active" },
        select: {
          slug: true,
          updatedAt: true,
          title: true,
          city: true,
          barangay: true,
          address: true,
          building: true,
          type: true,
          subtype: true,
          listingCategory: true,
        },
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

    // Empty pages are left out of the sitemap because Google treats them as
    // soft 404s, so every page below needs at least one matching listing.

    // City pages: /[city]
    const activeCities = CITIES.filter((city) =>
      properties.some((p) => cityMatches(p, city)),
    );
    const cityPages = activeCities.map((city) =>
      landing(`${baseUrl}/${city.slug}`),
    );

    // City + filter pages: /[city]/[filterSlug]
    const cityFilterPages = activeCities.flatMap((city) =>
      FILTERS.filter((filter) =>
        properties.some(
          (p) => cityMatches(p, city) && filterMatches(p, filter),
        ),
      ).map((filter) => landing(`${baseUrl}/${city.slug}/${filter.slug}`)),
    );

    // Area pages: /[city]/[filterSlug]/[area]
    const areaFilterPages = AREAS.flatMap((area) => {
      const city = getCityBySlug(area.citySlug);
      if (!city) return [];
      const inArea = properties.filter(
        (p) => cityMatches(p, city) && areaMatches(p, area),
      );
      return FILTERS.filter((filter) =>
        inArea.some((p) => filterMatches(p, filter)),
      ).map((filter) =>
        landing(`${baseUrl}/${area.citySlug}/${filter.slug}/${area.slug}`),
      );
    });

    // Building pages: /[city]/[filterSlug]/[area]/[building] (condo filters)
    const condoFilters = FILTERS.filter((filter) => filter.type === "condo");
    const buildingFilterPages = BUILDINGS.flatMap((building) => {
      const city = getCityBySlug(building.citySlug);
      const area = city
        ? getAreaBySlug(city.slug, building.areaSlug)
        : undefined;
      const found =
        city && area
          ? getBuildingBySlug(city.slug, area.slug, building.slug)
          : undefined;
      if (!city || !area || !found) return [];

      const inBuilding = properties.filter(
        (p) =>
          cityMatches(p, city) &&
          areaMatches(p, area) &&
          buildingMatches(p, found),
      );
      return condoFilters
        .filter((filter) => inBuilding.some((p) => filterMatches(p, filter)))
        .map((filter) =>
          landing(
            `${baseUrl}/${building.citySlug}/${filter.slug}/${building.areaSlug}/${building.slug}`,
          ),
        );
    });

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
    const comboChecks = comboCandidates.map((combo) =>
      properties.some(
        (p) => p.type === combo.type && p.listingCategory === combo.category,
      ),
    );
    const listingsComboPages = comboCandidates
      .filter((_, i) => comboChecks[i])
      .map(({ type, category }) =>
        landing(`${baseUrl}/listings?type=${type}&amp;category=${category}`),
      );

    // Main Cebu landing pages. comboCandidates[0] is house + sale, [1] is
    // condo + sale, [2] is land + sale. Each is only listed when there is at
    // least one active listing of that kind.
    const cebuHouseLotPage = comboChecks[0]
      ? [landing(`${baseUrl}/house-and-lot-for-sale-in-cebu`)]
      : [];
    const cebuCondoPage = comboChecks[1]
      ? [landing(`${baseUrl}/condo-for-sale-in-cebu`)]
      : [];
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
