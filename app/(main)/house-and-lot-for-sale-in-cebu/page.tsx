import type { Metadata } from "next";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { CITIES, cityWhereClause } from "@/lib/cities";
import { AREAS } from "@/lib/areas";
import { queryListings } from "@/lib/listings-query";
import {
  getMarketStats,
  getAreaCounts,
  formatPriceShort,
} from "@/lib/market-stats";
import { getCebuCityLotStats } from "@/lib/lot-stats";
import Breadcrumbs from "@/components/listings/Breadcrumbs";
import PropertySearchBar from "@/components/search/PropertySearchBar";
import ListingsResults from "@/components/listings/ListingsResults";
import MarketSnapshot from "@/components/listings/MarketSnapshot";
import LinkPills from "@/components/listings/LinkPills";
import HubFaq from "@/components/listings/HubFaq";

export const revalidate = 0;

const SITE_URL = "https://realtor-rutch.com";
const PATH = "/house-and-lot-for-sale-in-cebu";
const TITLE = "House and Lot for Sale in Cebu | Realtor Rutch";
const CITY_FILTER_SLUG = "house-and-lot-for-sale";

const CEBU_PLACES = [
  "Cebu",
  "Mandaue",
  "Lapu-Lapu",
  "Talisay",
  "Consolacion",
  "Liloan",
  "Minglanilla",
  "Naga",
  "Compostela",
  "Danao",
  "Carcar",
  "Cordova",
];

const baseWhere: Prisma.PropertyWhereInput = {
  status: "active",
  listingCategory: "sale",
  type: "house",
  OR: [
    { state: { contains: "Cebu", mode: "insensitive" } },
    ...CEBU_PLACES.map((c) => ({
      city: { contains: c, mode: "insensitive" as const },
    })),
  ],
};

// generateMetadata and the page both need the stats; cache() runs it once.
const getStats = cache(() => getMarketStats(baseWhere));

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { page } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const { count, minPrice, maxPrice } = await getStats();

  const description =
    count > 0 && minPrice != null && maxPrice != null
      ? `Browse ${count} house and lot for sale in Cebu. Prices from ${formatPriceShort(minPrice)} to ${formatPriceShort(maxPrice)}. Cebu City, Mandaue, Lapu-Lapu, Talisay and more.`
      : "Browse house and lot for sale in Cebu City, Mandaue, Lapu-Lapu, Talisay and more with Realtor Rutch.";

  const title =
    pageNum > 1
      ? `House and Lot for Sale in Cebu - Page ${pageNum} | Realtor Rutch`
      : TITLE;

  const canonical = `${PATH}${pageNum > 1 ? `?page=${pageNum}` : ""}`;

  return {
    // `absolute` stops the layout's "%s | Realtor Rutch" template from
    // adding the brand a second time
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonical}`,
      type: "website",
    },
  };
}

export default async function HouseAndLotForSaleInCebuPage({
  searchParams,
}: Props) {
  const { page } = await searchParams;

  const [
    { listings, totalCount, totalPages, currentPage },
    stats,
    cityCounts,
    areaCounts,
    lotStats,
  ] = await Promise.all([
    queryListings(baseWhere, page, { createdAt: "desc" }),
    getStats(),
    Promise.all(
      CITIES.map(async (city) => ({
        city,
        count: await db.property.count({
          where: {
            status: "active",
            listingCategory: "sale",
            type: "house",
            OR: cityWhereClause(city),
          },
        }),
      })),
    ),
    getAreaCounts(AREAS, baseWhere),
    getCebuCityLotStats(),
  ]);

  // The long text only shows on page 1, so paginated URLs don't repeat it
  const isFirstPage = currentPage === 1;

  const cityLinks = cityCounts
    .filter((c) => c.count > 0)
    .map(({ city, count }) => ({
      label: `House and lot for sale in ${city.name}`,
      href: `/${city.slug}/${CITY_FILTER_SLUG}`,
      count,
    }));

  const areaLinks = areaCounts.map(({ area, count }) => ({
    label: `House and lot in ${area.name}`,
    href: `/${area.citySlug}/${CITY_FILTER_SLUG}/${area.slug}`,
    count,
  }));

  const hrefForPage = (targetPage: number) =>
    `${PATH}${targetPage > 1 ? `?page=${targetPage}` : ""}`;

  const rangeText =
    stats.minPrice != null && stats.maxPrice != null
      ? ` with prices from ${formatPriceShort(stats.minPrice)} to ${formatPriceShort(stats.maxPrice)}`
      : "";

  // Last crumb has no href, same as your property page
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "House and Lot for Sale in Cebu" },
  ];

  return (
    <div className="pt-[120px] min-h-screen bg-[#faf9f6] text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbs} />
          <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-3">
            Available Now
          </p>
          <h1 className="text-5xl font-bold text-[#1A1A1A]">
            House and Lot for Sale in Cebu
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#8B7355]">
            Browse {stats.count} house and lot for sale in Cebu{rangeText}.
            Compare homes across Cebu City, Mandaue, Lapu-Lapu, Talisay and
            nearby towns, then book a viewing with Realtor Rutch.
          </p>
        </div>

        <PropertySearchBar initialType="house" initialCategory="sale" />

        <ListingsResults
          listings={listings}
          totalCount={totalCount}
          totalPages={totalPages}
          currentPage={currentPage}
          hrefForPage={hrefForPage}
        />

        {isFirstPage && (
          <>
            <MarketSnapshot
              heading="Cebu house and lot market snapshot"
              stats={stats}
            />

            <LinkPills heading="Browse by area" links={cityLinks} />
            <LinkPills heading="Popular neighborhoods" links={areaLinks} />

            {/* Original text, server-rendered. Uses the same .blog-content
                styles as your blog posts, so headings and paragraphs match. */}
            <section className="blog-content mt-16 max-w-3xl text-[#8B7355] leading-relaxed">
              <h2>Buying a house and lot in Cebu</h2>
              <p>
                A house and lot means you own both the structure and the land it
                sits on, which is why the title matters as much as the house
                itself. Cebu has options across the whole metro area: homes in
                Cebu City close to schools and offices, subdivisions in Mandaue
                and Consolacion, properties on Mactan in Lapu-Lapu and Cordova,
                and larger lots further south in Talisay and Minglanilla.
              </p>

              <h3>Check the title first</h3>
              <p>
                Ask for a copy of the Transfer Certificate of Title (TCT) and
                have a certified true copy verified at the Registry of Deeds.
                Confirm the seller&apos;s name matches the title, and look for
                liens, mortgages, or annotations. Also ask for the latest tax
                declaration and proof that real property tax is paid up.
              </p>

              <h3>Pag-IBIG or bank financing</h3>
              <p>
                Pag-IBIG housing loans are open to active members and are a
                common choice for first-time buyers. Banks can be faster and may
                lend more for higher-priced homes. Rates and terms change, so
                compare current offers from both before you commit.
              </p>

              <h3>Taxes and fees</h3>
              <p>
                Budget beyond the price: documentary stamp tax, local transfer
                tax, registration fees, and notarial fees all apply, and the
                contract should say who pays which. Confirm current rates with
                the BIR, the local assessor, or a lawyer before closing.
              </p>

              <h3>Flood and slope risks</h3>
              <p>
                Visit the property after heavy rain if you can, ask neighbors
                about flooding, and check official hazard maps for the area. For
                homes on or near slopes, look at retaining walls and drainage.
              </p>
            </section>

            <HubFaq
              stats={stats}
              lotStats={lotStats}
              areaNames={areaCounts.map(({ area }) => area.name)}
            />
          </>
        )}
      </div>
    </div>
  );
}
