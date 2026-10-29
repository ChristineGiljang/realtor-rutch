// -- Building/project registry ----------------------------------
// One entry per condo building or subdivision you want its own
// landing page for, scoped to a city + area.

export interface BuildingDef {
  slug: string;
  name: string;
  citySlug: string;
  areaSlug: string;
  matches: string[];
}

export const BUILDINGS: BuildingDef[] = [
  {
    slug: "appleone-banawa",
    name: "AppleOne Banawa",
    citySlug: "cebu-city",
    areaSlug: "banawa",
    matches: ["appleone banawa", "apple one banawa"],
  },
  {
    slug: "the-alcoves",
    name: "The Alcoves",
    citySlug: "cebu-city",
    areaSlug: "cebu-business-park",
    matches: ["alcoves"],
  },
  {
    slug: "avida-towers-riala",
    name: "Avida Towers Riala",
    citySlug: "cebu-city",
    areaSlug: "cebu-it-park",
    // Your listings say "Avida Towers 2" and "Avida Riala Tower 3" in the
    // title, but the Building field says "Avida Towers Riala", so it matches there.
    matches: ["avida towers riala", "avida riala"],
  },
];

export function getBuildingBySlug(
  citySlug: string,
  areaSlug: string,
  buildingSlug: string,
): BuildingDef | undefined {
  return BUILDINGS.find(
    (b) =>
      b.citySlug === citySlug &&
      b.areaSlug === areaSlug &&
      b.slug === buildingSlug,
  );
}

export function getBuildingsForArea(
  citySlug: string,
  areaSlug: string,
): BuildingDef[] {
  return BUILDINGS.filter(
    (b) => b.citySlug === citySlug && b.areaSlug === areaSlug,
  );
}

export function buildingWhereClause(building: BuildingDef) {
  return building.matches.flatMap((m) => [
    { building: { contains: m, mode: "insensitive" as const } },
    { title: { contains: m, mode: "insensitive" as const } },
  ]);
}
