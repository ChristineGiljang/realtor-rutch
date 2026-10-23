import type { Prisma } from "@prisma/client";
import { cityWhereClause, type CityDef } from "@/lib/cities";
import { getAreasForCity } from "@/lib/areas";
import {
  getMarketStats,
  getAreaCounts,
  formatPriceShort,
  formatPriceFull,
} from "@/lib/market-stats";
import MarketSnapshot from "@/components/listings/MarketSnapshot";
import LinkPills from "@/components/listings/LinkPills";

const FILTER_SLUG = "house-and-lot-for-sale";

// Short city descriptions. Add a line when you add a city in lib/cities.ts.
const CITY_BLURBS: Record<string, string> = {
  "cebu-city":
    "Cebu City is the main business and residential center of the province, with established neighborhoods close to schools, hospitals, malls, and offices.",
  "mandaue-city":
    "Mandaue City sits right beside Cebu City and is known for its commercial and industrial areas, which makes it a practical choice for buyers who work nearby.",
  "lapu-lapu-city":
    "Lapu-Lapu City is on Mactan Island, home to the international airport and many resorts, and is popular with buyers who want island living within reach of Cebu City.",
  cordova:
    "Cordova is a quieter coastal town on Mactan Island, often chosen by buyers who want more space and a slower pace than the city.",
};

export default async function CityHouseLotContent({ city }: { city: CityDef }) {
  const base: Prisma.PropertyWhereInput = {
    status: "active",
    type: "house",
    listingCategory: "sale",
  };

  const [stats, areaCounts] = await Promise.all([
    getMarketStats({ ...base, OR: cityWhereClause(city) }),
    getAreaCounts(getAreasForCity(city.slug), base),
  ]);

  if (stats.count === 0 || stats.minPrice == null || stats.maxPrice == null) {
    return null;
  }

  const blurb =
    CITY_BLURBS[city.slug] ??
    `${city.name} is part of Metro Cebu, with a mix of subdivisions and established neighborhoods.`;

  const rangeText =
    stats.minPrice === stats.maxPrice
      ? `at ${formatPriceShort(stats.minPrice)}`
      : `with asking prices from ${formatPriceShort(stats.minPrice)} to ${formatPriceShort(stats.maxPrice)}`;

  const medianText =
    stats.medianPrice != null
      ? ` The median asking price is ${formatPriceShort(stats.medianPrice)}${
          stats.medianPricePerSqm != null
            ? `, or about ${formatPriceFull(stats.medianPricePerSqm)} per sqm of floor area`
            : ""
        }.`
      : "";

  const areaLinks = areaCounts.map(({ area, count }) => ({
    label: `House and lot in ${area.name}`,
    href: `/${city.slug}/${FILTER_SLUG}/${area.slug}`,
    count,
  }));

  const areaAnswer =
    areaCounts.length > 0
      ? `Right now we have listings in ${areaCounts
          .map(({ area, count }) => `${area.name} (${count})`)
          .join(
            ", ",
          )}. Availability changes often, so check back or contact us for what is coming up.`
      : `Our listings change often, so check back or contact us for what is coming up in ${city.name}.`;

  return (
    <>
      <section className="blog-content mt-16 max-w-3xl text-[#8B7355] leading-relaxed">
        <h2>House and lot for sale in {city.name}</h2>
        <p>{blurb}</p>
        <p>
          We currently list {stats.count} house and lot for sale in {city.name},{" "}
          {rangeText}.{medianText}
        </p>
      </section>

      <MarketSnapshot
        heading={`${city.name} house and lot market snapshot`}
        stats={stats}
      />

      <LinkPills
        heading={`Browse by neighborhood in ${city.name}`}
        links={areaLinks}
      />

      <section className="blog-content mt-16 max-w-3xl text-[#8B7355] leading-relaxed">
        <h2>Before you buy a house and lot in {city.name}</h2>
        <ul>
          <li>
            <strong>Check the title.</strong> Ask for the Transfer Certificate
            of Title (TCT) and verify a certified true copy at the Registry of
            Deeds.
          </li>
          <li>
            <strong>Confirm taxes.</strong> Ask for the latest tax declaration
            and proof that real property tax is paid.
          </li>
          <li>
            <strong>Compare financing.</strong> Pag-IBIG and bank loans differ
            in rates, terms, and approval time.
          </li>
          <li>
            <strong>Budget for closing costs.</strong> Expect transfer tax,
            documentary stamp tax, registration, and notarial fees.
          </li>
          <li>
            <strong>Check flood and slope risks.</strong> Visit after heavy rain
            and look at official hazard maps.
          </li>
        </ul>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-bold text-[#1A1A1A]">
          Frequently asked questions
        </h2>
        <div className="mt-4 space-y-3">
          <details className="border border-[#E2D9C8] bg-white p-4">
            <summary className="cursor-pointer font-medium text-[#1A1A1A]">
              How much is a house and lot in {city.name}?
            </summary>
            <p className="mt-2 leading-relaxed text-[#8B7355]">
              Asking prices on our current listings in {city.name} range from{" "}
              {formatPriceShort(stats.minPrice)} to{" "}
              {formatPriceShort(stats.maxPrice)}.{medianText} Prices depend on
              location, lot size, and whether the home is new or pre-owned.
            </p>
          </details>
          <details className="border border-[#E2D9C8] bg-white p-4">
            <summary className="cursor-pointer font-medium text-[#1A1A1A]">
              Which areas of {city.name} have a house and lot for sale?
            </summary>
            <p className="mt-2 leading-relaxed text-[#8B7355]">{areaAnswer}</p>
          </details>
          <details className="border border-[#E2D9C8] bg-white p-4">
            <summary className="cursor-pointer font-medium text-[#1A1A1A]">
              How do I schedule a viewing?
            </summary>
            <p className="mt-2 leading-relaxed text-[#8B7355]">
              Open any listing above and send an inquiry, and Realtor Rutch will
              arrange a viewing with you.
            </p>
          </details>
        </div>
      </section>
    </>
  );
}
