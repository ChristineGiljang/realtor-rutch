import { db } from "@/lib/db";
import { cityWhereClause, getCityBySlug } from "@/lib/cities";

// A median of one or two lots is just a lot, so it is not shown.
const MIN_LOTS = 3;

export interface LotStats {
  count: number;
  // asking price / lot area, null when fewer than MIN_LOTS lots have an area
  medianPricePerSqm: number | null;
}

function median(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export async function getCebuCityLotStats(): Promise<LotStats> {
  const city = getCityBySlug("cebu-city");
  if (!city) return { count: 0, medianPricePerSqm: null };

  const rows = await db.property.findMany({
    where: {
      status: "active",
      type: "land",
      listingCategory: "sale",
      OR: cityWhereClause(city),
    },
    select: { price: true, lotSize: true, sqft: true },
  });

  const perSqm = rows
    .map((r) => {
      // Use lotSize when it is filled in, otherwise fall back to sqft
      const area = r.lotSize && r.lotSize > 0 ? r.lotSize : r.sqft;
      return area > 0 && r.price > 0 ? r.price / area : null;
    })
    .filter((n): n is number => n !== null);

  return {
    count: rows.length,
    medianPricePerSqm: perSqm.length >= MIN_LOTS ? median(perSqm) : null,
  };
}
