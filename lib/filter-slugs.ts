// ── Filter-slug registry ─────────────────────────────────────
// Each entry is a canonical, SEO-readable slug for a type/subtype/
// category combo (matching what the navbar already offers), used
// as the second segment of /[city]/[filterSlug] pages.

export interface FilterDef {
  slug: string;
  type?: string;
  subtype?: string;
  category?: string;
  label: string; // combined with a city name to build the H1
  breadcrumbLabel: string; // shorter form used in the breadcrumb trail
}

export const CATEGORY_LABELS: Record<string, string> = {
  sale: "For Sale",
  rent: "For Rent",
};

export const FILTERS: FilterDef[] = [
  {
    slug: "house-and-lot-for-sale",
    type: "house",
    category: "sale",
    label: "House and Lot for Sale",
    breadcrumbLabel: "House and Lot",
  },
  {
    slug: "house-and-lot-for-rent",
    type: "house",
    category: "rent",
    label: "House for Rent",
    breadcrumbLabel: "House and Lot",
  },
  {
    slug: "preselling-house-and-lot",
    type: "house",
    subtype: "preselling",
    label: "Preselling House and Lot",
    breadcrumbLabel: "Preselling House and Lot",
  },
  {
    slug: "rfo-house-and-lot",
    type: "house",
    subtype: "rfo",
    label: "RFO Ready for Occupancy House and Lot",
    breadcrumbLabel: "RFO House and Lot",
  },
  {
    slug: "rent-to-own-house-and-lot",
    type: "house",
    subtype: "rent-to-own",
    label: "Rent to Own House and Lot",
    breadcrumbLabel: "Rent to Own House and Lot",
  },
  {
    slug: "rfo-subdivision",
    subtype: "rfo-subdivision",
    label: "RFO Ready for Occupancy Subdivision",
    breadcrumbLabel: "RFO Subdivision",
  },
  {
    slug: "condo-for-sale",
    type: "condo",
    category: "sale",
    label: "Condo for Sale",
    breadcrumbLabel: "Condo",
  },
  {
    slug: "condo-for-rent",
    type: "condo",
    category: "rent",
    label: "Condo for Rent",
    breadcrumbLabel: "Condo",
  },
  {
    slug: "preselling-condo",
    type: "condo",
    subtype: "preselling",
    label: "Preselling Condo",
    breadcrumbLabel: "Preselling Condo",
  },
  {
    slug: "rfo-condo",
    type: "condo",
    subtype: "rfo",
    label: "RFO Condo",
    breadcrumbLabel: "RFO Condo",
  },
  {
    slug: "rent-to-own-condo",
    type: "condo",
    subtype: "rent-to-own",
    label: "Rent to Own Condo",
    breadcrumbLabel: "Rent to Own Condo",
  },
  {
    slug: "lot-for-sale",
    type: "land",
    label: "Lot for Sale",
    breadcrumbLabel: "Lot Only",
  },
  {
    slug: "commercial-for-sale",
    type: "commercial",
    category: "sale",
    label: "Commercial Properties for Sale",
    breadcrumbLabel: "Commercial",
  },
  {
    slug: "commercial-for-rent",
    type: "commercial",
    category: "rent",
    label: "Commercial Space for Rent",
    breadcrumbLabel: "Commercial",
  },
  {
    slug: "warehouse-for-rent",
    subtype: "warehouse",
    label: "Warehouse for Rent",
    breadcrumbLabel: "Warehouse",
  },
  {
    slug: "properties-for-sale",
    category: "sale",
    label: "Properties for Sale",
    breadcrumbLabel: "Properties",
  },
  {
    slug: "properties-for-rent",
    category: "rent",
    label: "Properties for Rent",
    breadcrumbLabel: "Properties",
  },
];

export function getFilterBySlug(slug: string): FilterDef | undefined {
  return FILTERS.find((f) => f.slug === slug);
}

// Finds the most specific matching slug for a given combo — mirrors
// the priority order in lib/listings-meta.ts (subtype match beats a
// type+category match, which beats type or category alone).
export function findFilterSlug(filters: {
  type?: string;
  subtype?: string;
  category?: string;
}): string | undefined {
  const { type, subtype, category } = filters;

  const bySubtype = FILTERS.find(
    (f) => f.subtype && f.subtype === subtype && (!f.type || f.type === type),
  );
  if (subtype && bySubtype) return bySubtype.slug;

  const byTypeAndCategory = FILTERS.find(
    (f) => !f.subtype && f.type === type && f.category === category,
  );
  if (type && category && byTypeAndCategory) return byTypeAndCategory.slug;

  const byTypeOnly = FILTERS.find(
    (f) => !f.subtype && !f.category && f.type === type,
  );
  if (type && byTypeOnly) return byTypeOnly.slug;

  const byCategoryOnly = FILTERS.find(
    (f) => !f.subtype && !f.type && f.category === category,
  );
  if (category && byCategoryOnly) return byCategoryOnly.slug;

  return undefined;
}
