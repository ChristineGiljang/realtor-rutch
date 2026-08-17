import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CITIES, cityWhereClause } from "@/lib/cities";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() || "";
  if (q.length < 2) {
    return NextResponse.json({ cities: [], addresses: [] });
  }

  const lowerQ = q.toLowerCase();

  // City matches — checked against each city's known name/aliases
  const matchedCities = CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQ) ||
      c.matches.some((m) => m.includes(lowerQ) || lowerQ.includes(m)),
  );

  const cities = await Promise.all(
    matchedCities.map(async (c) => {
      const count = await db.property.count({
        where: { status: "active", OR: cityWhereClause(c) },
      });
      return { slug: c.slug, label: c.name, count };
    }),
  );

  // Address-level matches — distinct addresses among active listings.
  // Grouped and counted from real data only, never fabricated.
  const properties = await db.property.findMany({
    where: {
      status: "active",
      OR: [
        { address: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { address: true, city: true },
    take: 300,
  });

  const counts = new Map<
    string,
    { address: string; city: string; count: number }
  >();
  for (const p of properties) {
    const key = `${p.address}|${p.city}`;
    const existing = counts.get(key);
    if (existing) existing.count += 1;
    else counts.set(key, { address: p.address, city: p.city, count: 1 });
  }

  const addresses = Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return NextResponse.json({
    cities: cities.filter((c) => c.count > 0),
    addresses,
  });
}
