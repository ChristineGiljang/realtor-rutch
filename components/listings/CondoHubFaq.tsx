import type { ReactNode } from "react";
import {
  formatPriceFull,
  formatPriceShort,
  type MarketStats,
} from "@/lib/market-stats";

interface Props {
  stats: MarketStats;
  areaNames: string[];
  buildingNames: string[];
}

export default function CondoHubFaq({
  stats,
  areaNames,
  buildingNames,
}: Props) {
  const { minPrice, maxPrice, medianPrice, medianPricePerSqm } = stats;

  const priceAnswer =
    minPrice != null && maxPrice != null
      ? `Asking prices on our current condo listings range from ${formatPriceShort(minPrice)} to ${formatPriceShort(maxPrice)}${
          medianPrice != null
            ? `, with a median of ${formatPriceShort(medianPrice)}`
            : ""
        }.${
          medianPricePerSqm != null
            ? ` The median asking price works out to about ${formatPriceFull(medianPricePerSqm)} per sqm of floor area.`
            : ""
        } Prices vary by building, floor level, view, unit size, and whether the unit is furnished.`
      : "Prices vary by building, floor level, view, unit size, and whether the unit is furnished. Browse the listings above to see current asking prices.";

  const cheapAnswer = `${
    minPrice != null
      ? `Our lowest asking price for a condo right now is ${formatPriceShort(minPrice)}. `
      : ""
  }Studios and smaller units are usually the most affordable way into a condo. Use the price filter at the top of the page to see what fits your budget.`;

  const areasAnswer = [
    "The best area depends on your priorities. Condos near business districts, malls, and schools, such as around Cebu IT Park in Lahug and the Cebu Business Park area, are popular with professionals who want a short commute. Buyers who want a quieter setting often look further out.",
    areaNames.length > 0
      ? `Right now we have condos in ${areaNames.join(", ")}.`
      : "",
    buildingNames.length > 0
      ? `Buildings you can browse include ${buildingNames.join(", ")}.`
      : "",
    "Use the links above to see what is available.",
  ]
    .filter(Boolean)
    .join(" ");

  const faqs: { q: string; a: ReactNode }[] = [
    { q: "How much is a condo in Cebu?", a: priceAnswer },
    { q: "Are there cheap condos for sale in Cebu?", a: cheapAnswer },
    { q: "What are the best areas to buy a condo in Cebu?", a: areasAnswer },
    {
      q: "Can foreigners buy a condo in Cebu?",
      a: "Philippine law generally allows foreigners to own condominium units, as long as foreign ownership of the whole project stays within the legal limit (currently 40%). Foreigners cannot own the land itself. Ask the developer or the condominium corporation whether the project still has room under that limit, and speak with a lawyer before making any offer.",
    },
    {
      q: "What is a CCT, and why does it matter?",
      a: "A Condominium Certificate of Title (CCT) is the title document for a condo unit, similar to a TCT for land. Ask for a copy and have a certified true copy checked at the Registry of Deeds. Confirm the seller's name matches the title, and look for liens, mortgages, or annotations. Also ask for the latest tax declaration and proof that real property tax is paid.",
    },
    {
      q: "What are condo association dues?",
      a: "Association dues are monthly fees paid to the condominium corporation for upkeep of the common areas, security, and shared services. The amount differs by building, so ask for the current rate before you buy, and ask whether any special assessments are planned. Also ask whether parking is included in the price or sold separately.",
    },
    {
      q: "What other costs should I expect when buying a condo?",
      a: "Budget beyond the price: documentary stamp tax, local transfer tax, registration fees, and notarial fees usually apply, and the contract should say who pays which. Confirm current rates with the BIR, the local assessor, or a lawyer before closing.",
    },
    {
      q: "What is the difference between pre-selling and ready for occupancy?",
      a: "A pre-selling condo is sold before it is finished, usually at a lower price with staged payments, and you wait until turnover. A ready-for-occupancy unit is complete and can be inspected before you buy. For pre-selling projects, ask the developer for its license to sell and the project's registration with the DHSUD.",
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
