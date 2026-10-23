import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { cityWhereClause, getCityBySlug } from "@/lib/cities";
import { areaWhereClause, type AreaDef } from "@/lib/areas";

export interface MarketStats {
  count: number;
  minPrice: number | null;
  maxPrice: number | null;
  // null when there are fewer than MIN_FOR_MEDIAN listings
  medianPrice: number | null;
  // asking price / floor area, null when fewer than MIN_FOR_MEDIAN listings have an area
  medianPricePerSqm: number | null;
}

// A median of one or two listings is just a listing, so it is not shown.
const MIN_FOR_MEDIAN = 3;

function median(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export async function getMarketStats(
  where: Prisma.PropertyWhereInput,
): Promise<MarketStats> {
  const rows = await db.property.findMany({
    where,
    select: { price: true, sqft: true },
  });

  const prices = rows.map((r) => r.price).filter((p) => p > 0);
  const perSqm = rows
    .filter((r) => r.price > 0 && r.sqft > 0)
    .map((r) => r.price / r.sqft);

  return {
    count: rows.length,
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
    medianPrice: prices.length >= MIN_FOR_MEDIAN ? median(prices) : null,
    medianPricePerSqm: perSqm.length >= MIN_FOR_MEDIAN ? median(perSqm) : null,
  };
}

export interface AreaCount {
  area: AreaDef;
  count: number;
}

// Counts listings per area (barangay). `base` must not already contain an AND
// key. Areas with no listings are left out.
export async function getAreaCounts(
  areas: AreaDef[],
  base: Prisma.PropertyWhereInput,
): Promise<AreaCount[]> {
  const results = await Promise.all(
    areas.map(async (area) => {
      const city = getCityBySlug(area.citySlug);
      if (!city) return { area, count: 0 };
      const count = await db.property.count({
        where: {
          ...base,
          AND: [{ OR: cityWhereClause(city) }, { OR: areaWhereClause(area) }],
        },
      });
      return { area, count };
    }),
  );
  return results.filter((r) => r.count > 0);
}

export function formatPriceShort(n: number): string {
  if (n >= 1_000_000) {
    return `₱${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  return `₱${Math.round(n).toLocaleString("en-PH")}`;
}

export function formatPriceFull(n: number): string {
  return `₱${Math.round(n).toLocaleString("en-PH")}`;
}
