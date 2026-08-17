// ── City registry ─────────────────────────────────────────────
// The Property.city field is free text (entered via address
// autocomplete), so values aren't perfectly consistent — this maps
// each canonical city page to the substrings that count as a match.

export interface CityDef {
  slug: string;
  name: string;
  matches: string[]; // lowercase substrings checked against Property.city
}

export const CITIES: CityDef[] = [
  {
    slug: "cebu-city",
    name: "Cebu City",
    matches: ["cebu city", "cebu, cebu"],
  },
  {
    slug: "mandaue-city",
    name: "Mandaue City",
    matches: ["mandaue"],
  },
  {
    slug: "lapu-lapu-city",
    name: "Lapu-Lapu City",
    matches: ["lapu-lapu", "lapu lapu", "lapulapu"],
  },
  {
    slug: "cordova",
    name: "Cordova",
    matches: ["cordova"],
  },
];

export function getCityBySlug(slug: string): CityDef | undefined {
  return CITIES.find((c) => c.slug === slug);
}

// Reverse of the above — given a property's free-text city value, finds
// which registered city it belongs to (if any), so pages that only have
// the raw string (e.g. the property detail page) can still link to the
// right /[city] page in the breadcrumb.
export function getCityByFreeText(cityText: string): CityDef | undefined {
  const lower = cityText.toLowerCase();
  return CITIES.find((c) => c.matches.some((m) => lower.includes(m)));
}

// Prisma OR-clause fragment matching any of a city's known aliases
// against the free-text city field, case-insensitive.
export function cityWhereClause(city: CityDef) {
  return city.matches.map((m) => ({
    city: { contains: m, mode: "insensitive" as const },
  }));
}
