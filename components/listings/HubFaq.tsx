import Link from "next/link";
import type { ReactNode } from "react";
import {
  formatPriceFull,
  formatPriceShort,
  type MarketStats,
} from "@/lib/market-stats";
import type { LotStats } from "@/lib/lot-stats";

interface Props {
  stats: MarketStats;
  lotStats: LotStats;
  areaNames: string[];
}

export default function HubFaq({ stats, lotStats, areaNames }: Props) {
  const { minPrice, maxPrice, medianPrice } = stats;

  const priceAnswer =
    minPrice != null && maxPrice != null
      ? `Asking prices on our current listings range from ${formatPriceShort(minPrice)} to ${formatPriceShort(maxPrice)}${
          medianPrice != null
            ? `, with a median of ${formatPriceShort(medianPrice)}`
            : ""
        }. Prices vary by location, lot size, and whether the home is newly built or pre-owned.`
      : "Prices vary by location, lot size, and whether the home is newly built or pre-owned. Browse the listings above to see current asking prices.";

  const cheapAnswer = `${
    minPrice != null
      ? `Our lowest asking price for a house and lot right now is ${formatPriceShort(minPrice)}. ${
          minPrice >= 1_000_000
            ? "We don't have any listed under ₱1 million at the moment. Lower-priced homes are usually smaller, farther from the city center, or in need of repair. "
            : ""
        }`
      : ""
  }Use the price filter at the top of the page to see what fits your budget.`;

  const lotAnswer: ReactNode =
    lotStats.medianPricePerSqm != null ? (
      <>
        Based on our {lotStats.count} current lot listings in Cebu City, the
        median asking price is about{" "}
        {formatPriceFull(lotStats.medianPricePerSqm)} per sqm. At that rate, a
        200 sqm lot would cost around{" "}
        {formatPriceShort(lotStats.medianPricePerSqm * 200)}. Prices vary a lot
        by neighborhood, road access, and lot shape, so use this as a starting
        point and compare current{" "}
        <Link
          href="/cebu-city/lot-for-sale"
          className="text-[#C9A96E] underline underline-offset-2 hover:text-[#1A1A1A] transition"
        >
          lots for sale in Cebu City
        </Link>
        .
      </>
    ) : (
      <>
        Lot prices in Cebu City vary widely by neighborhood, road access, and
        lot shape, so there is no single price. Each listing on our{" "}
        <Link
          href="/cebu-city/lot-for-sale"
          className="text-[#C9A96E] underline underline-offset-2 hover:text-[#1A1A1A] transition"
        >
          lots for sale in Cebu City
        </Link>{" "}
        page shows the asking price and size, so you can work out the price per
        sqm yourself.
      </>
    );

  const areasAnswer = `The best area depends on your priorities. Cebu City suits buyers who want to be near schools, hospitals, malls, and offices. Mandaue is next door and has strong commercial areas. Lapu-Lapu and Cordova on Mactan Island are popular for island living and airport access, and Talisay and Minglanilla offer more space further south.${
    areaNames.length > 0
      ? ` Right now we have homes in ${areaNames.join(", ")}.`
      : ""
  } Use the area links above to see what is available.`;

  const faqs: { q: string; a: ReactNode }[] = [
    { q: "How much is a house and lot in Cebu?", a: priceAnswer },
    { q: "Are there cheap house and lot for sale in Cebu?", a: cheapAnswer },
    { q: "How much per sqm is a lot in Cebu City?", a: lotAnswer },
    { q: "What are the best areas to live in Cebu?", a: areasAnswer },
    {
      q: "Is a 200 sqm lot enough for a house?",
      a: "For most families, yes. A 200 sqm lot can fit a two-storey home with a garage and a small yard. How much you can build depends on local zoning rules, required setbacks, and how much of the lot the building may cover, so check with the city building office or an architect before you design. There is no single ideal lot size: it depends on your budget, parking needs, and whether you want a garden. The shape of the lot and its road frontage matter as much as the size.",
    },
    {
      q: "Is 1 million pesos enough to build a house?",
      a: "If you also need to buy the lot, usually not in Metro Cebu. If you already own the lot, ₱1 million can build a small, basic house, but the final cost depends on floor area, materials, finishes, and labor rates, which change over time. Get itemized quotes from a few contractors before you decide, and keep a buffer for permits and unexpected costs.",
    },
    {
      q: "Can foreigners buy a house and lot in Cebu?",
      a: "Philippine law generally restricts foreign ownership of land. Foreign buyers often look at condominium units instead, or structure a purchase with legal advice. Speak with a lawyer before making any offer.",
    },
    {
      q: "What is the difference between pre-selling and ready for occupancy?",
      a: "A pre-selling home is sold before it is finished, usually at a lower price with staged payments. A ready-for-occupancy home is complete and can be inspected before you buy.",
    },
    {
      q: "How do I schedule a viewing?",
      a: "Open any listing above and send an inquiry, and Realtor Rutch will arrange a viewing with you.",
    },
  ];

  return (
    <section className="mt-12 max-w-3xl">
      <h2 className="text-2xl font-bold text-[#1A1A1A]">
        Frequently asked questions
      </h2>
      <div className="mt-4 space-y-3">
        {faqs.map((f) => (
          <details key={f.q} className="border border-[#E2D9C8] bg-white p-4">
            <summary className="cursor-pointer font-medium text-[#1A1A1A]">
              {f.q}
            </summary>
            <p className="mt-2 leading-relaxed text-[#8B7355]">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
