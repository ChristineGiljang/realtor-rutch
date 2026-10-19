import { notFound } from "next/navigation";

// Next.js hands search params over as string | string[] | undefined.
export type RawSearchParams = Record<string, string | string[] | undefined>;

export interface ListingParams {
  type?: string;
  category?: string;
  // Kept as digit-only strings so they can go straight into the search bar and
  // pagination links. Use priceBedsWhere() to turn them into a query.
  priceMax?: string;
  bedsMin?: string;
  sort?: string;
  page: number;
}

const MAX_PRICE = 1_000_000_000_000;
const MAX_BEDS = 100; // beds is a 32-bit Int column; huge values would make Prisma throw
const MAX_PAGE = 10_000;
const SORTS = ["price-asc", "price-desc", "newest"];

// ?type=a&type=b arrives as an array; keep the first value.
function first(value: string | string[] | undefined): string | undefined {
  const picked = Array.isArray(value) ? value[0] : value;
  const trimmed = picked?.trim();
  return trimmed ? trimmed.slice(0, 64) : undefined;
}

// Digits only, clamped to a safe range. "abc", "-5" and "1e9" are ignored.
function boundedInt(
  value: string | undefined,
  min: number,
  max: number,
): number | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.min(Math.max(parsed, min), max);
}

export function parseListingParams(raw: RawSearchParams): ListingParams {
  const priceMax = boundedInt(first(raw.priceMax), 0, MAX_PRICE);
  const bedsMin = boundedInt(first(raw.bedsMin), 0, MAX_BEDS);
  const sort = first(raw.sort);

  return {
    type: first(raw.type),
    category: first(raw.category),
    priceMax: priceMax !== undefined ? String(priceMax) : undefined,
    bedsMin: bedsMin !== undefined ? String(bedsMin) : undefined,
    sort: sort && SORTS.includes(sort) ? sort : undefined,
    page: boundedInt(first(raw.page), 1, MAX_PAGE) ?? 1,
  };
}

// Price and bedroom filters for a Prisma where clause.
export function priceBedsWhere(params: ListingParams) {
  return {
    ...(params.priceMax ? { price: { lte: Number(params.priceMax) } } : {}),
    ...(params.bedsMin ? { beds: { gte: Number(params.bedsMin) } } : {}),
  };
}

export function listingsOrderBy(sort?: string) {
  if (sort === "price-asc") return { price: "asc" as const };
  if (sort === "price-desc") return { price: "desc" as const };
  return { createdAt: "desc" as const };
}

// A page number past the last page is a real 404, not an empty 200.
export function ensurePageInRange(page: number, totalPages: number) {
  if (page > 1 && page > totalPages) notFound();
}
