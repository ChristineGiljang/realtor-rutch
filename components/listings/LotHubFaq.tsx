import type { ReactNode } from "react";
import {
  formatPriceFull,
  formatPriceShort,
  type MarketStats,
} from "@/lib/market-stats";

interface Props {
  stats: MarketStats;
  areaNames: string[];
}

export default function LotHubFaq({ stats, areaNames }: Props) {
  const { count, minPrice, maxPrice, medianPrice, medianPricePerSqm } = stats;

  const priceAnswer =
    minPrice != null && maxPrice != null
      ? `Asking prices on our current lot listings range from ${formatPriceShort(minPrice)} to ${formatPriceShort(maxPrice)}${
          medianPrice != null
            ? `, with a median of ${formatPriceShort(medianPrice)}`
            : ""
        }. Prices vary a lot with location, lot size, road access, and whether the lot is residential, commercial, or beachfront.`
      : "Prices vary a lot with location, lot size, road access, and whether the lot is residential, commercial, or beachfront. Browse the listings above to see current asking prices.";

  const perSqmAnswer =
    medianPricePerSqm != null
      ? `Across our ${count} current lot listings, the median asking price is about ${formatPriceFull(medianPricePerSqm)} per sqm. The spread is wide: a lot in a busy commercial area of Cebu City or Mandaue costs many times more per sqm than a lot in a provincial town. Treat the median as a rough starting point, then compare lots in the same area as the one you like. Each listing shows the asking price and size, so you can work out the per-sqm price yourself.`
      : "Lot prices per sqm vary widely by area, road access, and lot shape, so there is no single price. Each listing above shows the asking price and size, so you can work out the per-sqm price yourself and compare lots in the same area.";

  const cheapAnswer = `${
    minPrice != null
      ? `Our lowest asking price for a lot right now is ${formatPriceShort(minPrice)}. `
      : ""
  }Lower-priced lots are usually smaller, farther from main roads, or in provincial areas. Use the price filter at the top of the page to see what fits your budget.`;

  const areasAnswer = `The best area depends on what you plan to build. Lots in Cebu City and Mandaue suit commercial use and investment, while Cordova, Liloan, and other towns offer more land for the money.${
    areaNames.length > 0
      ? ` Right now we have lots in ${areaNames.join(", ")}.`
      : ""
  } Use the links above to see what is available.`;

  const faqs: { q: string; a: ReactNode }[] = [
    { q: "How much is a lot for sale in Cebu?", a: priceAnswer },
    { q: "How much per sqm is a lot in Cebu?", a: perSqmAnswer },
    { q: "Are there cheap lots for sale in Cebu?", a: cheapAnswer },
    { q: "What are the best areas to buy a lot in Cebu?", a: areasAnswer },
    {
      q: "What should I check before buying a lot?",
      a: "Ask for a copy of the Transfer Certificate of Title (TCT) and have a certified true copy verified at the Registry of Deeds. Confirm the seller's name matches the title, and look for liens, mortgages, or annotations. Also ask for the latest tax declaration and proof that real property tax is paid. Have the boundaries checked by a licensed geodetic engineer so you know the lot's actual size and corners match the title.",
    },
    {
      q: "Can I build a house on any lot?",
      a: "Not always. Check the lot's zoning or land classification with the city or municipal planning office before you buy. Residential, commercial, and agricultural land follow different rules, and agricultural land may need a conversion clearance before it can be used for housing. Also confirm there is legal road access and ask about utilities such as water and electricity.",
    },
    {
      q: "Can foreigners buy a lot in Cebu?",
      a: "Philippine law generally restricts foreign ownership of land. Foreign buyers often look at condominium units instead, or consider a long-term lease with legal advice. Speak with a lawyer before making any offer.",
    },
    {
      q: "What should I know about beachfront or seafront lots?",
      a: "Land along the shore is subject to legal easement rules, so part of a seafront lot may not be buildable. Ask a lawyer or the local government how much of the lot you can actually use, and check that the title covers the full area being sold.",
    },
    {
      q: "What other costs should I expect when buying a lot?",
      a: "Budget beyond the price: capital gains tax, documentary stamp tax, local transfer tax, registration fees, and notarial fees usually apply, and the contract should say who pays which. Confirm current rates with the BIR, the local assessor, or a lawyer before closing.",
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
