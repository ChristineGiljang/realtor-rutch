// -- Internal-link targets for a single listing ---------------
// Works out which hub, city page and area page a listing belongs to, so
// the property page can link up to them (breadcrumbs + "Explore more").
// Area matching uses the same rule as areaWhereClause in lib/areas.ts
// (barangay or address contains the area name, plus the title when the
// area has matchTitle on), so a listing only links to an area page that
// actually lists it.

import { getCityByFreeText } from "@/lib/cities";
import { AREAS } from "@/lib/areas";
import { FILTERS, findFilterSlug } from "@/lib/filter-slugs";

export interface LinkTarget {
  label: string;
  href: string;
  // Short name of the place (e.g. "Cebu IT Park"), used for breadcrumbs.
  name?: string;
}

export interface Hub {
  path: string;
  label: string;
  linkText: string;
}

// Cebu-wide hub pages. Keyed by "type:category".
export const HUBS: Record<string, Hub> = {
  "house:sale": {
    path: "/house-and-lot-for-sale-in-cebu",
    label: "House and Lot for Sale in Cebu",
    linkText: "View all house and lot for sale in Cebu",
  },
  "condo:sale": {
    path: "/condo-for-sale-in-cebu",
    label: "Condo for Sale in Cebu",
    linkText: "View all condo for sale in Cebu",
  },
  "land:sale": {
    path: "/lot-for-sale-in-cebu",
    label: "Lot for Sale in Cebu",
    linkText: "View all lots for sale in Cebu",
  },
};

export function getHub(type?: string, category?: string): Hub | null {
  if (!type) return null;
  // The lot filter has no category (lots are only listed for sale), so
  // lot pages still find their hub.
  if (type === "land") return HUBS["land:sale"];
  if (!category) return null;
  return HUBS[`${type}:${category}`] ?? null;
}

export interface PropertyLinkInput {
  type: string;
  listingCategory: string;
  city: string;
  barangay: string | null;
  address: string;
  // Needed for areas with matchTitle on (Mandani Bay, Cebu IT Park,
  // Cebu Business Park). Without it those areas can't be matched.
  title?: string;
}

export interface PropertyLinkTargets {
  hub: Hub | null;
  city: LinkTarget | null;
  area: LinkTarget | null;
}

export function getPropertyLinkTargets(
  p: PropertyLinkInput,
): PropertyLinkTargets {
  const hub = getHub(p.type, p.listingCategory);
  const city = getCityByFreeText(p.city);
  const filterSlug = findFilterSlug({
    type: p.type,
    category: p.listingCategory,
  });
  const filter = FILTERS.find((f) => f.slug === filterSlug);

  if (!city || !filter) return { hub, city: null, area: null };

  const haystack = `${p.barangay ?? ""} ${p.address}`.toLowerCase();
  const titleText = (p.title ?? "").toLowerCase();

  const matching = AREAS.filter(
    (a) =>
      a.citySlug === city.slug &&
      a.matches.some(
        (m) => haystack.includes(m) || (a.matchTitle && titleText.includes(m)),
      ),
  );

  // A listing can match several areas (an Avida condo is in Apas and in Cebu
  // IT Park). Prefer the named development or district (matchTitle areas)
  // over the broad barangay.
  const area = matching.find((a) => a.matchTitle) ?? matching[0];

  return {
    hub,
    city: {
      label: `${filter.label} in ${city.name}`,
      href: `/${city.slug}/${filter.slug}`,
      name: city.name,
    },
    area: area
      ? {
          label: `${filter.label} in ${area.name}`,
          href: `/${city.slug}/${filter.slug}/${area.slug}`,
          name: area.name,
        }
      : null,
  };
}
