// lib/hub-suggestions.ts
// Finds buildings and barangays used by active listings that are not yet in
// lib/buildings.ts or lib/areas.ts, and builds a paste-ready snippet for each.
// Nothing is added automatically: you review the snippet and paste it.

import { db } from "@/lib/db";
import { getCityByFreeText, type CityDef } from "@/lib/cities";
import { AREAS, type AreaDef } from "@/lib/areas";
import { BUILDINGS, type BuildingDef } from "@/lib/buildings";
import { isHubIndexable } from "@/lib/hubs";

// Only suggest places used by at least this many active listings.
// You wanted hubs even for 1-2 listings, so this starts at 1. Raise it if the
// list gets noisy.
const SUGGEST_MIN_LISTINGS = 1;

// Values you don't want suggested (junk or one-off Building values).
// Put the `key` shown on a suggestion here to hide it.
const IGNORED_KEYS: string[] = [];

interface Row {
  title: string;
  city: string;
  barangay: string | null;
  address: string;
  building: string | null;
  type: string;
  listingCategory: string;
}

export interface BuildingSuggestion {
  key: string;
  name: string;
  spellings: string[];
  cityName: string;
  citySlug: string;
  areaSlug: string;
  areaName: string | null; // null when the area is not registered yet
  total: number;
  sale: number;
  rent: number;
  wouldIndex: boolean; // a sale or rent hub would reach the minimum
  snippet: string;
  warnings: string[];
}

export interface AreaSuggestion {
  key: string;
  name: string;
  spellings: string[];
  cityName: string;
  citySlug: string;
  total: number;
  snippet: string;
  warnings: string[];
}

export interface HubSuggestions {
  buildings: BuildingSuggestion[];
  areas: AreaSuggestion[];
  total: number;
}

// -- helpers ----------------------------------------------------------------

const lc = (s: string | null | undefined) => (s ?? "").toLowerCase();
const clean = (s: string | null | undefined) =>
  (s ?? "").replace(/\s+/g, " ").trim();
// "Avida Towers Riala " and "avida  towers riala" become the same key
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Same rule as areaWhereClause in lib/areas.ts
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

// Same preference as lib/property-links.ts: named district over broad barangay
function pickArea(row: Row, citySlug: string): AreaDef | undefined {
  const matching = AREAS.filter(
    (a) => a.citySlug === citySlug && areaMatches(row, a),
  );
  return matching.find((a) => a.matchTitle) ?? matching[0];
}

function groupBy<T>(items: T[], key: (t: T) => string): [string, T[]][] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    if (!k) continue;
    const group = map.get(k);
    if (group) group.push(item);
    else map.set(k, [item]);
  }
  return Array.from(map.entries());
}

// Distinct values, most common first
function spellingsOf(values: string[]): string[] {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([v]) => v);
}

// The most common item, by key
function topBy<T>(items: T[], key: (t: T) => string): T | undefined {
  const counts = new Map<string, { item: T; n: number }>();
  for (const item of items) {
    const k = key(item);
    const entry = counts.get(k);
    if (entry) entry.n++;
    else counts.set(k, { item, n: 1 });
  }
  let best: { item: T; n: number } | undefined;
  for (const entry of Array.from(counts.values())) {
    if (!best || entry.n > best.n) best = entry;
  }
  return best?.item;
}

const uniqueLower = (values: string[]) =>
  Array.from(new Set(values.map((v) => v.toLowerCase())));

const SHORT_MATCH_WARNING = (m: string) =>
  `"${m}" is short and may also match other words in addresses (like "luz" matching "Luzon Avenue"). Consider a longer text.`;

// -- main -------------------------------------------------------------------

export async function getHubSuggestions(): Promise<HubSuggestions> {
  const rows: Row[] = await db.property.findMany({
    where: { status: "active" },
    select: {
      title: true,
      city: true,
      barangay: true,
      address: true,
      building: true,
      type: true,
      listingCategory: true,
    },
  });

  // Areas: barangays in a registered city that no area matches yet
  const areaCandidates = rows.flatMap((row) => {
    const city = getCityByFreeText(row.city);
    const barangay = clean(row.barangay);
    if (!city || !barangay) return [];
    if (AREAS.some((a) => a.citySlug === city.slug && areaMatches(row, a))) {
      return [];
    }
    return [{ row, city, barangay }];
  });

  const areas: AreaSuggestion[] = groupBy(
    areaCandidates,
    (c) => `${c.city.slug}:${norm(c.barangay)}`,
  )
    .filter(
      ([key, group]) =>
        !IGNORED_KEYS.includes(key) && group.length >= SUGGEST_MIN_LISTINGS,
    )
    .map(([key, group]) => {
      const names = spellingsOf(group.map((c) => c.barangay));
      const name = names[0];
      const city = group[0].city;
      const matches = uniqueLower(names);
      const warnings: string[] = [];
      matches
        .filter((m) => m.length < 5)
        .forEach((m) => {
          warnings.push(SHORT_MATCH_WARNING(m));
        });
      if (names.length > 1) {
        warnings.push(
          `Several spellings found (${names.join(", ")}). All are included in matches.`,
        );
      }
      const snippet = [
        "  {",
        `    slug: ${JSON.stringify(slugify(name))},`,
        `    name: ${JSON.stringify(name)},`,
        `    citySlug: ${JSON.stringify(city.slug)},`,
        `    matches: ${JSON.stringify(matches)},`,
        "  },",
      ].join("\n");
      return {
        key,
        name,
        spellings: names,
        cityName: city.name,
        citySlug: city.slug,
        total: group.length,
        snippet,
        warnings,
      };
    })
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

  // Buildings: condos whose Building value no registered building matches
  const unregistered = rows.filter(
    (r) =>
      r.type === "condo" &&
      clean(r.building) !== "" &&
      !BUILDINGS.some((b) => buildingMatches(r, b)),
  );

  const buildings: BuildingSuggestion[] = groupBy(unregistered, (r) =>
    norm(clean(r.building)),
  )
    .filter(
      ([key, group]) =>
        !IGNORED_KEYS.includes(key) && group.length >= SUGGEST_MIN_LISTINGS,
    )
    .map(([key, group]) => {
      const names = spellingsOf(group.map((r) => clean(r.building)));
      const name = names[0];
      const warnings: string[] = [];

      const city = topBy(
        group
          .map((r) => getCityByFreeText(r.city))
          .filter((c): c is CityDef => Boolean(c)),
        (c) => c.slug,
      );
      const citySlug = city?.slug ?? "";
      if (!city) {
        warnings.push(
          `The city "${group[0].city}" is not in lib/cities.ts. Add the city first.`,
        );
      }

      const area = city
        ? topBy(
            group
              .map((r) => pickArea(r, city.slug))
              .filter((a): a is AreaDef => Boolean(a)),
            (a) => a.slug,
          )
        : undefined;

      let areaSlug = area?.slug ?? "";
      if (!area) {
        const barangay = spellingsOf(
          group.map((r) => clean(r.barangay)).filter(Boolean),
        )[0];
        areaSlug = barangay ? slugify(barangay) : "";
        warnings.push(
          barangay
            ? `Area not registered yet. Add the area suggestion for "${barangay}" to lib/areas.ts first, then paste this.`
            : "These listings have no barangay. Choose an areaSlug from lib/areas.ts by hand.",
        );
      }

      const matches = uniqueLower(names);
      matches
        .filter((m) => m.length < 5)
        .forEach((m) => {
          warnings.push(SHORT_MATCH_WARNING(m));
        });
      if (names.length > 1) {
        warnings.push(
          `Several spellings found (${names.join(", ")}). All are included in matches. Pick one spelling and use it in admin.`,
        );
      }

      const sale = group.filter((r) => r.listingCategory === "sale").length;
      const rent = group.filter((r) => r.listingCategory === "rent").length;
      const snippet = [
        "  {",
        `    slug: ${JSON.stringify(slugify(name))},`,
        `    name: ${JSON.stringify(name)},`,
        `    citySlug: ${JSON.stringify(citySlug)},`,
        `    areaSlug: ${JSON.stringify(areaSlug)},`,
        `    matches: ${JSON.stringify(matches)},`,
        "  },",
      ].join("\n");

      return {
        key,
        name,
        spellings: names,
        cityName: city?.name ?? group[0].city,
        citySlug,
        areaSlug,
        areaName: area?.name ?? null,
        total: group.length,
        sale,
        rent,
        wouldIndex: isHubIndexable(sale) || isHubIndexable(rent),
        snippet,
        warnings,
      };
    })
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

  return { buildings, areas, total: buildings.length + areas.length };
}
