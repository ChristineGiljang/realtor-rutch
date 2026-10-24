import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getCityBySlug, cityWhereClause } from "@/lib/cities";
import { getFilterBySlug, CATEGORY_LABELS } from "@/lib/filter-slugs";
import { getCityListingsMeta } from "@/lib/listings-meta";
import { queryListings } from "@/lib/listings-query";
import { getMarketStats, formatPriceShort } from "@/lib/market-stats";
import {
  parseListingParams,
  listingsOrderBy,
  priceBedsWhere,
  ensurePageInRange,
  type ListingParams,
  type RawSearchParams,
} from "@/lib/listing-params";
import PropertySearchBar from "@/components/search/PropertySearchBar";
import ListingsResults from "@/components/listings/ListingsResults";
import Breadcrumbs, { type Crumb } from "@/components/listings/Breadcrumbs";
import CityHouseLotContent from "@/components/listings/CityHouseLotContent";

export const revalidate = 0;

const HUB_PATH = "/house-and-lot-for-sale-in-cebu";

interface Props {
  params: Promise<{ city: string; filterSlug: string }>;
  searchParams: Promise<RawSearchParams>;
}

// Listings that belong to this city + filter, before any price/beds filters
// from the URL. Stats for the meta description use this, so ?priceMax=...
// URLs don't change the description.
function baseWhere(
  city: NonNullable<ReturnType<typeof getCityBySlug>>,
  filter: NonNullable<ReturnType<typeof getFilterBySlug>>,
) {
  const where: any = {
    status: "active",
    OR: cityWhereClause(city),
  };
  if (filter.type) where.type = filter.type;
  if (filter.subtype) where.subtype = filter.subtype;
  if (filter.category) where.listingCategory = filter.category;
  return where;
}

// generateMetadata and the page both need the results; cache() makes the
// database query run once per request.
const loadResults = cache(async (key: string) => {
  const { citySlug, filterSlug, query } = JSON.parse(key) as {
    citySlug: string;
    filterSlug: string;
    query: ListingParams;
  };
  const city = getCityBySlug(citySlug);
  const filter = getFilterBySlug(filterSlug);
  if (!city || !filter) return null;

  const where = { ...baseWhere(city, filter), ...priceBedsWhere(query) };

  const results = await queryListings(
    where,
    String(query.page),
    listingsOrderBy(query.sort),
  );

  return { city, filter, ...results };
});

async function getResults(props: Props) {
  const { city: citySlug, filterSlug } = await props.params;
  const query = parseListingParams(await props.searchParams);

  const data = await loadResults(
    JSON.stringify({ citySlug, filterSlug, query }),
  );
  if (!data) notFound();
  ensurePageInRange(query.page, data.totalPages);

  return { query, ...data };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { city, filter, totalCount } = await getResults(props);
  const meta = getCityListingsMeta(city.name, filter.label);

  let description = meta.description;

  // House and lot for sale pages get a live count and price range
  if (filter.type === "house" && filter.category === "sale") {
    const stats = await getMarketStats(baseWhere(city, filter));
    if (stats.count > 0 && stats.minPrice != null && stats.maxPrice != null) {
      description = `Browse ${stats.count} house and lot for sale in ${city.name}. Prices from ${formatPriceShort(stats.minPrice)} to ${formatPriceShort(stats.maxPrice)}. Book a viewing with Realtor Rutch.`;
    }
  }

  return {
    title: meta.title,
    description,
    alternates: { canonical: `/${city.slug}/${filter.slug}` },
    openGraph: { title: meta.title, description },
    // Keep pages with no listings out of Google's index but let it follow links.
    ...(totalCount === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function CityFilterListingsPage(props: Props) {
  const { query, city, filter, listings, totalCount, totalPages, currentPage } =
    await getResults(props);

  const meta = getCityListingsMeta(city.name, filter.label);

  // House and lot for sale pages sit under the Cebu-wide hub page.
  const isHouseForSale = filter.type === "house" && filter.category === "sale";

  // Every crumb except the last must have a URL, otherwise the breadcrumb
  // structured data is invalid. Filters without a type (for example ones
  // defined by subtype or category) used to get no href at all.
  const filterCrumbHref = filter.type
    ? `/listings?type=${filter.type}`
    : filter.subtype
      ? `/listings?subtype=${filter.subtype}`
      : filter.category
        ? `/listings?category=${filter.category}`
        : "/listings";

  const breadcrumbs: Crumb[] = isHouseForSale
    ? [
        { label: "Home", href: "/" },
        { label: "House and Lot for Sale in Cebu", href: HUB_PATH },
        { label: city.name },
      ]
    : [
        { label: "Home", href: "/" },
        ...(filter.category
          ? [
              {
                label: CATEGORY_LABELS[filter.category],
                href: `/listings?category=${filter.category}`,
              },
            ]
          : []),
        ...(filter.breadcrumbLabel !== "Properties"
          ? [
              {
                label: filter.breadcrumbLabel,
                href: filterCrumbHref,
              },
            ]
          : []),
        { label: city.name },
      ];

  const hrefForPage = (targetPage: number) => {
    const p = new URLSearchParams();
    if (query.priceMax) p.set("priceMax", query.priceMax);
    if (query.bedsMin) p.set("bedsMin", query.bedsMin);
    if (query.sort) p.set("sort", query.sort);
    if (targetPage > 1) p.set("page", String(targetPage));
    const qs = p.toString();
    return `/${city.slug}/${filter.slug}${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="pt-[120px] min-h-screen bg-[#faf9f6] text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbs} />
          <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-3">
            Available Now
          </p>
          <h1 className="text-5xl font-bold text-[#1A1A1A]">{meta.h1}</h1>
        </div>

        <PropertySearchBar
          initialCity={city.slug}
          initialType={filter.type}
          initialCategory={filter.category}
          initialPriceMax={query.priceMax}
          initialBedsMin={query.bedsMin}
          initialSort={query.sort}
        />

        <ListingsResults
          listings={listings}
          totalCount={totalCount}
          totalPages={totalPages}
          currentPage={currentPage}
          hrefForPage={hrefForPage}
        />

        {/* Page 1 only, so paginated URLs don't repeat the text */}
        {isHouseForSale && currentPage === 1 && (
          <CityHouseLotContent city={city} />
        )}

        {isHouseForSale && (
          <p className="mt-10 text-sm text-[#8B7355]">
            Looking beyond {city.name}?{" "}
            <Link
              href={HUB_PATH}
              className="text-[#C9A96E] underline underline-offset-2 hover:text-[#1A1A1A] transition"
            >
              View all house and lot for sale in Cebu
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
