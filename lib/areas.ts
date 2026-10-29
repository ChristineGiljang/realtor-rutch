// -- Area (barangay) registry -----------------------------------
// Same pattern as lib/cities.ts. One entry per barangay you want
// its own SEO landing page for, scoped to a city.

export interface AreaDef {
  slug: string;
  name: string;
  citySlug: string; // matches CityDef.slug in lib/cities.ts
  matches: string[]; // lowercase substrings checked against barangay/address
  // Also check the listing title. Turn this on for named developments or
  // districts (Mandani Bay, Cebu IT Park) whose name is often only in the
  // title. Leave it off for short barangay names that could match inside
  // other words.
  matchTitle?: boolean;
  // Optional hand-written text shown on the hub page. Plain paragraphs,
  // one string per paragraph. Only write things you know are true.
  blurb?: string[];
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
  { slug: "apas", name: "Apas", citySlug: "cebu-city", matches: ["apas"] },
  {
    slug: "labangon",
    name: "Labangon",
    citySlug: "cebu-city",
    matches: ["labangon"],
  },
  { slug: "tisa", name: "Tisa", citySlug: "cebu-city", matches: ["tisa"] },
  {
    slug: "cebu-it-park",
    name: "Cebu IT Park",
    citySlug: "cebu-city",
    matches: ["cebu it park", "it park"],
    matchTitle: true,
  },
  {
    slug: "cebu-business-park",
    name: "Cebu Business Park",
    citySlug: "cebu-city",
    // "alcoves" keeps The Alcoves listings in this area even when the title
    // or address doesn't say "Cebu Business Park".
    matches: ["cebu business park", "alcoves"],
    matchTitle: true,
  },
  {
    slug: "mandani-bay",
    name: "Mandani Bay",
    citySlug: "mandaue-city",
    matches: ["mandani bay", "mandani"],
    matchTitle: true,
  },
  {
    slug: "punta-engano",
    name: "Punta Engaño",
    citySlug: "lapu-lapu-city",
    // Both spellings, in case an address is typed without the ñ.
    matches: ["punta engaño", "punta engano"],
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

// Prisma OR-clause fragment - combine with city's clause via AND, since
// both need to independently match (city on `city`, area on `barangay`/`address`,
// and on `title` when the area has matchTitle on).
export function areaWhereClause(area: AreaDef) {
  return area.matches.flatMap((m) => [
    { barangay: { contains: m, mode: "insensitive" as const } },
    { address: { contains: m, mode: "insensitive" as const } },
    ...(area.matchTitle
      ? [{ title: { contains: m, mode: "insensitive" as const } }]
      : []),
  ]);
}
