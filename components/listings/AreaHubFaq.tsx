import {
  formatPriceFull,
  formatPriceShort,
  type MarketStats,
} from "@/lib/market-stats";

interface Props {
  stats: MarketStats;
  areaName: string; // the area, or the building when isBuilding is true
  cityName: string;
  filterLabel: string; // e.g. "House and Lot for Sale"
  type?: string; // house | condo | land | commercial
  category?: string; // sale | rent
  isBuilding?: boolean;
}

export default function AreaHubFaq({
  stats,
  areaName,
  cityName,
  filterLabel,
  type,
  category,
  isBuilding = false,
}: Props) {
  const { count, minPrice, maxPrice, medianPrice, medianPricePerSqm } = stats;
  const isRent = category === "rent";
  const label = filterLabel.toLowerCase();
  const per = isRent ? " per month" : "";

  const priceAnswer =
    minPrice != null && maxPrice != null
      ? `${isRent ? "Asking rents" : "Asking prices"} on our current ${label} listings in ${areaName} range from ${formatPriceShort(minPrice)} to ${formatPriceShort(maxPrice)}${per}${
          medianPrice != null
            ? `, with a median of ${formatPriceShort(medianPrice)}${per}`
            : ""
        }.${
          !isRent && medianPricePerSqm != null
            ? ` The median works out to about ${formatPriceFull(medianPricePerSqm)} per sqm of floor area.`
            : ""
        } ${
          isBuilding
            ? "These vary with unit size, floor level, view, furnishing, and whether parking is included."
            : "These vary with size, condition, floor level or lot size, and exact location within the barangay."
        }`
      : `${isRent ? "Rents" : "Prices"} in ${areaName} vary with ${
          isBuilding
            ? "unit size, floor level, view, and furnishing"
            : "size, condition, and exact location within the barangay"
        }. There are no matching listings at the moment, so send an inquiry and Realtor Rutch can let you know when something comes up.`;

  const availabilityAnswer =
    count > 0
      ? `We currently have ${count} ${label} listing${count === 1 ? "" : "s"} in ${areaName}, ${cityName}. Listings change often, so check back or send an inquiry for new ones.`
      : `We have no ${label} listings in ${areaName} right now. Check the related links on this page, or send an inquiry and we will look for you.`;

  const goodAreaAnswer = isBuilding
    ? `Whether ${areaName} suits you depends on unit size, floor level and view, association dues, parking, and how close it is to work, schools, and malls. Visit the building, and ask the building administration about dues, house rules, and amenities before you decide.`
    : `Whether ${areaName} suits you depends on your priorities: commute to work or school, nearby malls and hospitals, parking, and the neighborhood itself. Visit at different times of day to check traffic and noise, and visit after heavy rain if you can to see how the area handles flooding. Ask neighbors what living there is like.`;

  const faqs: { q: string; a: string }[] = [
    {
      q: `How much is ${isRent ? "the rent for " : ""}${label} in ${areaName}?`,
      a: priceAnswer,
    },
    {
      q: `How many ${label} listings are there in ${areaName}?`,
      a: availabilityAnswer,
    },
    {
      q: `Is ${areaName} a good place to ${isRent ? "rent" : "buy"}?`,
      a: goodAreaAnswer,
    },
  ];

  if (isRent) {
    faqs.push({
      q: "How much deposit and advance rent should I expect?",
      a: "Landlords commonly ask for a security deposit plus advance rent, often a few months combined, but the exact terms differ by owner. Get the amounts, the lease length, and the rules on repairs and early termination in writing before you pay anything.",
    });
  } else if (type === "condo") {
    faqs.push(
      {
        q: "What is a CCT, and why does it matter?",
        a: "A Condominium Certificate of Title (CCT) is the title document for a condo unit. Ask for a copy and have a certified true copy checked at the Registry of Deeds. Confirm the seller's name matches the title, and look for liens, mortgages, or annotations. Also ask for the latest tax declaration and proof that real property tax is paid.",
      },
      {
        q: "What are condo association dues?",
        a: "Association dues are monthly fees paid to the condominium corporation for upkeep of the common areas, security, and shared services. The amount differs by building, so ask for the current rate and whether any special assessments are planned. Also ask whether parking is included in the price or sold separately.",
      },
      {
        q: "Can foreigners buy a condo here?",
        a: "Philippine law generally allows foreigners to own condominium units, as long as foreign ownership of the whole project stays within the legal limit (currently 40%). Foreigners cannot own the land itself. Speak with a lawyer before making any offer.",
      },
    );
  } else {
    faqs.push(
      {
        q: "What should I check on the title?",
        a: "Ask for a copy of the Transfer Certificate of Title (TCT) and have a certified true copy verified at the Registry of Deeds. Confirm the seller's name matches the title, and look for liens, mortgages, or annotations. Also ask for the latest tax declaration and proof that real property tax is paid.",
      },
      {
        q: "Can foreigners buy a house or lot here?",
        a: "Philippine law generally restricts foreign ownership of land. Foreign buyers often look at condominium units instead, or structure a purchase with legal advice. Speak with a lawyer before making any offer.",
      },
    );
  }

  if (!isRent) {
    faqs.push({
      q: "What other costs should I expect when buying?",
      a: "Budget beyond the price: documentary stamp tax, local transfer tax, registration fees, and notarial fees usually apply, and the contract should say who pays which. Confirm current rates with the BIR, the local assessor, or a lawyer before closing.",
    });
  }

  faqs.push({
    q: "How do I schedule a viewing?",
    a: "Open any listing above and send an inquiry, and Realtor Rutch will arrange a viewing with you.",
  });

  return (
    <section className="mt-12 max-w-3xl">
      <h2 className="text-2xl font-bold text-[#1A1A1A]">
        Frequently asked questions about {label} in {areaName}
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
