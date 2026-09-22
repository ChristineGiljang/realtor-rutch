// ── Area (barangay) registry ─────────────────────────────────
// Same pattern as lib/cities.ts. One entry per barangay you want
// its own SEO landing page for, scoped to a city.

export interface AreaDef {
  slug: string;
  name: string;
  citySlug: string; // matches CityDef.slug in lib/cities.ts
  matches: string[]; // lowercase substrings checked against barangay/address
}

export const AREAS: AreaDef[] = [
  {
    slug: "banawa",
    name: "Banawa",
    citySlug: "cebu-city",
    matches: ["banawa"],
  },
  { slug: "lahug", name: "Lahug", citySlug: "cebu-city", matches: ["lahug"] },
  {
    slug: "guadalupe",
    name: "Guadalupe",
    citySlug: "cebu-city",
    matches: ["guadalupe"],
  },
  {
    slug: "mabolo",
    name: "Mabolo",
    citySlug: "cebu-city",
    matches: ["mabolo"],
  },
  // add more barangays as you get listings there
];

export function getAreaBySlug(
  citySlug: string,
  areaSlug: string,
): AreaDef | undefined {
  return AREAS.find((a) => a.citySlug === citySlug && a.slug === areaSlug);
}

export function getAreasForCity(citySlug: string): AreaDef[] {
  return AREAS.filter((a) => a.citySlug === citySlug);
}

// Prisma OR-clause fragment — combine with city's clause via AND, since
// both need to independently match (city on `city`, area on `barangay`/`address`).
export function areaWhereClause(area: AreaDef) {
  return area.matches.flatMap((m) => [
    { barangay: { contains: m, mode: "insensitive" as const } },
    { address: { contains: m, mode: "insensitive" as const } },
  ]);
}
