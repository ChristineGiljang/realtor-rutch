import type { Metadata } from "next";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { CITIES, cityWhereClause, getCityBySlug } from "@/lib/cities";
import { AREAS, areaWhereClause, getAreaBySlug } from "@/lib/areas";
import {
  BUILDINGS,
  buildingWhereClause,
  getBuildingBySlug,
} from "@/lib/buildings";
import { queryListings } from "@/lib/listings-query";
import {
  getMarketStats,
  getAreaCounts,
  formatPriceShort,
} from "@/lib/market-stats";
import Breadcrumbs from "@/components/listings/Breadcrumbs";
import PropertySearchBar from "@/components/search/PropertySearchBar";
import ListingsResults from "@/components/listings/ListingsResults";
import MarketSnapshot from "@/components/listings/MarketSnapshot";
import LinkPills from "@/components/listings/LinkPills";
import CondoHubFaq from "@/components/listings/CondoHubFaq";

export const revalidate = 0;

const SITE_URL = "https://realtor-rutch.com";
const PATH = "/condo-for-sale-in-cebu";
const TITLE = "Condo for Sale in Cebu | Realtor Rutch";
const CITY_FILTER_SLUG = "condo-for-sale";

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
  type: "condo",
  OR: [
    { state: { contains: "Cebu", mode: "insensitive" } },
    ...CEBU_PLACES.map((c) => ({
      city: { contains: c, mode: "insensitive" as const },
    })),
  ],
};

// generateMetadata and the page both need the stats; cache() runs it once.
const getStats = cache(() => getMarketStats(baseWhere));

// Number of active condos for sale in one building.
async function countBuilding(b: (typeof BUILDINGS)[number]) {
  const city = getCityBySlug(b.citySlug);
  const area = city ? getAreaBySlug(city.slug, b.areaSlug) : undefined;
  const found =
    city && area ? getBuildingBySlug(city.slug, area.slug, b.slug) : undefined;
  if (!city || !area || !found) return 0;
  return db.property.count({
    where: {
      status: "active",
      listingCategory: "sale",
      type: "condo",
      AND: [
        { OR: cityWhereClause(city) },
        { OR: areaWhereClause(area) },
        { OR: buildingWhereClause(found) },
      ],
    },
  });
}

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
      ? `Browse ${count} condo for sale in Cebu. Prices from ${formatPriceShort(minPrice)} to ${formatPriceShort(maxPrice)}. Book a viewing with Realtor Rutch.`
      : "Browse condo for sale in Cebu with Realtor Rutch. Studios to multi-bedroom units in Cebu City and nearby areas.";

  const title =
    pageNum > 1
      ? `Condo for Sale in Cebu - Page ${pageNum} | Realtor Rutch`
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

export default async function CondoForSaleInCebuPage({ searchParams }: Props) {
  const { page } = await searchParams;

  const [
    { listings, totalCount, totalPages, currentPage },
    stats,
    cityCounts,
    areaCounts,
    buildingCounts,
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
            type: "condo",
            OR: cityWhereClause(city),
          },
        }),
      })),
    ),
    getAreaCounts(AREAS, baseWhere),
    Promise.all(
      BUILDINGS.map(async (building) => ({
        building,
        count: await countBuilding(building),
      })),
    ),
  ]);

  // The long text only shows on page 1, so paginated URLs don't repeat it
  const isFirstPage = currentPage === 1;

  const cityLinks = cityCounts
    .filter((c) => c.count > 0)
    .map(({ city, count }) => ({
      label: `Condo for sale in ${city.name}`,
      href: `/${city.slug}/${CITY_FILTER_SLUG}`,
      count,
    }));

  const areaLinks = areaCounts.map(({ area, count }) => ({
    label: `Condo in ${area.name}`,
    href: `/${area.citySlug}/${CITY_FILTER_SLUG}/${area.slug}`,
    count,
  }));

  const activeBuildings = buildingCounts.filter((b) => b.count > 0);
  const buildingLinks = activeBuildings.map(({ building, count }) => ({
    label: building.name,
    href: `/${building.citySlug}/${CITY_FILTER_SLUG}/${building.areaSlug}/${building.slug}`,
    count,
  }));

  const hrefForPage = (targetPage: number) =>
    `${PATH}${targetPage > 1 ? `?page=${targetPage}` : ""}`;

  const rangeText =
    stats.minPrice != null && stats.maxPrice != null
      ? ` with prices from ${formatPriceShort(stats.minPrice)} to ${formatPriceShort(stats.maxPrice)}`
      : "";

  // Last crumb has no href, same as your other pages
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Condo for Sale in Cebu" },
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
            Condo for Sale in Cebu
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#8B7355]">
            {stats.count > 0
              ? `Browse ${stats.count} condo for sale in Cebu${rangeText}. `
              : "Browse condo for sale in Cebu. "}
            Compare studios and larger units across Cebu City and nearby areas,
            then book a viewing with Realtor Rutch.
          </p>
        </div>

        <PropertySearchBar initialType="condo" initialCategory="sale" />

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
              heading="Cebu condo market snapshot"
              stats={stats}
              note="Based on our current listings and updated automatically. Price per sqm is the asking price divided by the unit's floor area."
            />

            <LinkPills heading="Browse by city" links={cityLinks} />
            <LinkPills heading="Popular areas" links={areaLinks} />
            <LinkPills heading="Condo buildings" links={buildingLinks} />

            {/* Original text, server-rendered. Uses the same .blog-content
                styles as your blog posts. */}
            <section className="blog-content mt-16 max-w-3xl text-[#8B7355] leading-relaxed">
              <h2>Buying a condo in Cebu</h2>
              <p>
                When you buy a condo, you own a specific unit and share
                ownership of the common areas, such as the lobby, amenities, and
                grounds, through the condominium corporation. Cebu has condo
                projects in Cebu City, Mandaue, and on Mactan Island, with units
                ranging from studios to larger multi-bedroom homes.
              </p>

              <h3>Check the title and the developer</h3>
              <p>
                Ask for a copy of the Condominium Certificate of Title (CCT) and
                have a certified true copy verified at the Registry of Deeds.
                Confirm the seller&apos;s name matches the title, and look for
                liens, mortgages, or annotations. For a pre-selling project, ask
                the developer for its license to sell and the project&apos;s
                registration with the DHSUD, and visit the site if you can.
              </p>

              <h3>Know the monthly costs</h3>
              <p>
                Most buildings charge monthly association dues for upkeep of the
                common areas and security. Ask for the current rate and whether
                any special assessments are planned. Also ask whether parking is
                included in the price or sold separately, since it often is.
              </p>

              <h3>Pag-IBIG or bank financing</h3>
              <p>
                Pag-IBIG and banks both lend for condo units, subject to each
                lender&apos;s requirements and the project&apos;s approval.
                Rates and terms change, so compare current offers from both
                before you commit.
              </p>

              <h3>Taxes and fees</h3>
              <p>
                Budget beyond the price: documentary stamp tax, local transfer
                tax, registration fees, and notarial fees all apply, and the
                contract should say who pays which. Confirm current rates with
                the BIR, the local assessor, or a lawyer before closing.
              </p>

              <h3>Pre-selling or ready for occupancy</h3>
              <p>
                Pre-selling units usually cost less but you wait for turnover.
                Ready-for-occupancy units can be inspected before you buy. When
                you view one, check the water pressure, windows, aircon, and
                signs of leaks, and look at the common areas too.
              </p>
            </section>

            <CondoHubFaq
              stats={stats}
              areaNames={areaCounts.map(({ area }) => area.name)}
              buildingNames={activeBuildings.map(
                ({ building }) => building.name,
              )}
            />
          </>
        )}
      </div>
    </div>
  );
}
