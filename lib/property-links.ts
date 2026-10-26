// -- Internal-link targets for a single listing ---------------
// Works out which hub, city page and area page a listing belongs to, so
// the property page can link up to them (breadcrumbs + "Explore more").
// Area matching uses the same rule as areaWhereClause in lib/areas.ts
// (barangay or address contains the area name), so a listing only links
// to an area page that actually lists it.

import { getCityByFreeText } from "@/lib/cities";
import { AREAS } from "@/lib/areas";
import { FILTERS, findFilterSlug } from "@/lib/filter-slugs";

export interface LinkTarget {
  label: string;
  href: string;
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
};

export function getHub(type?: string, category?: string): Hub | null {
  if (!type || !category) return null;
  return HUBS[`${type}:${category}`] ?? null;
}

export interface PropertyLinkInput {
  type: string;
  listingCategory: string;
  city: string;
  barangay: string | null;
  address: string;
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
  const area = AREAS.find(
    (a) =>
      a.citySlug === city.slug && a.matches.some((m) => haystack.includes(m)),
  );

  return {
    hub,
    city: {
      label: `${filter.label} in ${city.name}`,
      href: `/${city.slug}/${filter.slug}`,
    },
    area: area
      ? {
          label: `${filter.label} in ${area.name}`,
          href: `/${city.slug}/${filter.slug}/${area.slug}`,
        }
      : null,
  };
}
