import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
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
import Breadcrumbs from "@/components/listings/Breadcrumbs";
import PropertySearchBar from "@/components/search/PropertySearchBar";
import ListingsResults from "@/components/listings/ListingsResults";
import MarketSnapshot from "@/components/listings/MarketSnapshot";
import LinkPills from "@/components/listings/LinkPills";
import LotHubFaq from "@/components/listings/LotHubFaq";

export const revalidate = 0;

const SITE_URL = "https://realtor-rutch.com";
const PATH = "/lot-for-sale-in-cebu";
const TITLE = "Lot for Sale in Cebu | Realtor Rutch";
const CITY_FILTER_SLUG = "lot-for-sale";

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
  "Santander",
];

const baseWhere: Prisma.PropertyWhereInput = {
  status: "active",
  listingCategory: "sale",
  type: "land",
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
      ? `Browse ${count} ${count === 1 ? "lot" : "lots"} for sale in Cebu. Prices from ${formatPriceShort(minPrice)} to ${formatPriceShort(maxPrice)}. Cebu City, Mandaue, Cordova, Liloan and more.`
      : "Browse lots for sale in Cebu City, Mandaue, Cordova, Liloan and more with Realtor Rutch.";

  const title =
    pageNum > 1
      ? `Lot for Sale in Cebu - Page ${pageNum} | Realtor Rutch`
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
    // Keep an empty hub out of Google's index but let it follow links.
    ...(count === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function LotForSaleInCebuPage({ searchParams }: Props) {
  const { page } = await searchParams;

  const [
    { listings, totalCount, totalPages, currentPage },
    stats,
    cityCounts,
    areaCounts,
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
            type: "land",
            OR: cityWhereClause(city),
          },
        }),
      })),
    ),
    getAreaCounts(AREAS, baseWhere),
  ]);

  // The long text only shows on page 1, so paginated URLs don't repeat it
  const isFirstPage = currentPage === 1;

  const cityLinks = cityCounts
    .filter((c) => c.count > 0)
    .map(({ city, count }) => ({
      label: `Lot for sale in ${city.name}`,
      href: `/${city.slug}/${CITY_FILTER_SLUG}`,
      count,
    }));

  const areaLinks = areaCounts.map(({ area, count }) => ({
    label: `Lot for sale in ${area.name}`,
    href: `/${area.citySlug}/${CITY_FILTER_SLUG}/${area.slug}`,
    count,
  }));

  const hrefForPage = (targetPage: number) =>
    `${PATH}${targetPage > 1 ? `?page=${targetPage}` : ""}`;

  const rangeText =
    stats.minPrice != null && stats.maxPrice != null
      ? ` with prices from ${formatPriceShort(stats.minPrice)} to ${formatPriceShort(stats.maxPrice)}`
      : "";

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Lot for Sale in Cebu" },
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
            Lot for Sale in Cebu
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#8B7355]">
            {stats.count > 0
              ? `Browse ${stats.count} ${stats.count === 1 ? "lot" : "lots"} for sale in Cebu${rangeText}. Compare lots across Cebu City, Mandaue, Cordova, Liloan and nearby towns, then book a viewing with Realtor Rutch.`
              : "There are no lots for sale listed in Cebu right now. Send an inquiry and Realtor Rutch will look for one for you."}
          </p>
        </div>

        <PropertySearchBar initialType="land" initialCategory="sale" />

        <ListingsResults
          listings={listings}
          totalCount={totalCount}
          totalPages={totalPages}
          currentPage={currentPage}
          hrefForPage={hrefForPage}
        />

        {isFirstPage && (
          <>
            {stats.count > 0 && (
              <MarketSnapshot
                heading="Cebu lot market snapshot"
                stats={stats}
              />
            )}

            {cityLinks.length > 0 && (
              <LinkPills heading="Browse by area" links={cityLinks} />
            )}
            {areaLinks.length > 0 && (
              <LinkPills heading="Popular neighborhoods" links={areaLinks} />
            )}

            {/* Original text, server-rendered. Uses the same .blog-content
                styles as your blog posts, so headings and paragraphs match. */}
            <section className="blog-content mt-16 max-w-3xl text-[#8B7355] leading-relaxed">
              <h2>Buying a lot in Cebu</h2>
              <p>
                Buying a lot is different from buying a finished home: you are
                paying for land, so the title, the boundaries, and what you are
                allowed to build matter more than anything else. Cebu has lots
                across the whole province, from commercial lots in Cebu City and
                Mandaue to residential and investment lots in Cordova, Liloan,
                and coastal towns.
              </p>

              <h3>Check the title first</h3>
              <p>
                Ask for a copy of the Transfer Certificate of Title (TCT) and
                have a certified true copy verified at the Registry of Deeds.
                Confirm the seller&apos;s name matches the title, and look for
                liens, mortgages, or annotations. Also ask for the latest tax
                declaration and proof that real property tax is paid up.
              </p>

              <h3>Verify the boundaries and size</h3>
              <p>
                Have a licensed geodetic engineer check that the corners on the
                ground match the title. This protects you from paying for land
                that is smaller than advertised or that overlaps a neighbor.
              </p>

              <h3>Zoning, access, and utilities</h3>
              <p>
                Check the lot&apos;s zoning or land classification with the
                city or municipal planning office, since it decides what you can
                build. Confirm there is legal road access, and ask about water,
                electricity, and drainage before you commit.
              </p>

              <h3>Taxes and fees</h3>
              <p>
                Budget beyond the price: capital gains tax, documentary stamp
                tax, local transfer tax, registration fees, and notarial fees
                all apply, and the contract should say who pays which. Confirm
                current rates with the BIR, the local assessor, or a lawyer
                before closing.
              </p>
            </section>

            <LotHubFaq
              stats={stats}
              areaNames={areaCounts.map(({ area }) => area.name)}
            />

            <p className="mt-10 text-sm text-[#8B7355]">
              Looking for something else?{" "}
              <Link
                href="/house-and-lot-for-sale-in-cebu"
                className="text-[#C9A96E] underline underline-offset-2 hover:text-[#1A1A1A] transition"
              >
                House and lot for sale in Cebu
              </Link>
              {" or "}
              <Link
                href="/condo-for-sale-in-cebu"
                className="text-[#C9A96E] underline underline-offset-2 hover:text-[#1A1A1A] transition"
              >
                condo for sale in Cebu
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </div>
  );
}