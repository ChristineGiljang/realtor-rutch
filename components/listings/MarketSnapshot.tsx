import {
  formatPriceFull,
  formatPriceShort,
  type MarketStats,
} from "@/lib/market-stats";

const DEFAULT_NOTE =
  "Based on our current listings and updated automatically. Price per sqm is the asking price divided by floor area, so it includes the lot.";

export default function MarketSnapshot({
  heading,
  stats,
  note = DEFAULT_NOTE,
}: {
  heading: string;
  stats: MarketStats;
  note?: string;
}) {
  if (stats.count === 0 || stats.minPrice == null || stats.maxPrice == null) {
    return null;
  }

  const tiles = [
    { label: "Active listings", value: String(stats.count) },
    {
      label: "Price range",
      value:
        stats.minPrice === stats.maxPrice
          ? formatPriceShort(stats.minPrice)
          : `${formatPriceShort(stats.minPrice)} – ${formatPriceShort(stats.maxPrice)}`,
    },
    ...(stats.medianPrice != null
      ? [{ label: "Median price", value: formatPriceShort(stats.medianPrice) }]
      : []),
    ...(stats.medianPricePerSqm != null
      ? [
          {
            label: "Median price per sqm",
            value: formatPriceFull(stats.medianPricePerSqm),
          },
        ]
      : []),
  ];

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-[#1A1A1A]">{heading}</h2>
      <dl className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <div key={t.label} className="bg-white border border-[#E2D9C8] p-5">
            <dt className="text-xs tracking-[0.2em] uppercase text-[#8B7355]">
              {t.label}
            </dt>
            <dd className="mt-2 text-2xl font-bold text-[#1A1A1A]">
              {t.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-[#8B7355]">{note}</p>
    </section>
  );
}
