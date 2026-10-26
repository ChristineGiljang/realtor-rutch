import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getCityBySlug, cityWhereClause } from "@/lib/cities";
import { getAreaBySlug, areaWhereClause } from "@/lib/areas";
import { getFilterBySlug, CATEGORY_LABELS } from "@/lib/filter-slugs";
import { getAreaListingsMeta } from "@/lib/listings-meta";
import { queryListings } from "@/lib/listings-query";
import {
  getMarketStats,
  formatPriceShort,
  type MarketStats,
} from "@/lib/market-stats";
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
import Breadcrumbs from "@/components/listings/Breadcrumbs";
import Link from "next/link";
import { getHub } from "@/lib/property-links";

export const revalidate = 0;

// 60 characters minus the " | Realtor Rutch" suffix the root layout adds
const TITLE_BUDGET = 44;
const DESCRIPTION_BUDGET = 155;

interface Props {
  params: Promise<{ city: string; filterSlug: string; area: string }>;
  searchParams: Promise<RawSearchParams>;
}

// Listings that belong to this city + area + filter, before any price/beds
// filters from the URL. The meta description stats use this, so ?priceMax=...
// URLs don't change the description.
function baseWhere(
  city: NonNullable<ReturnType<typeof getCityBySlug>>,
  area: NonNullable<ReturnType<typeof getAreaBySlug>>,
  filter: NonNullable<ReturnType<typeof getFilterBySlug>>,
) {
  const where: any = {
    status: "active",
    AND: [{ OR: cityWhereClause(city) }, { OR: areaWhereClause(area) }],
  };
  if (filter.type) where.type = filter.type;
  if (filter.subtype) where.subtype = filter.subtype;
  if (filter.category) where.listingCategory = filter.category;
  return where;
}

// Picks the first title that fits; falls back to the shortest one.
function fitTitle(candidates: string[]): string {
  return (
    candidates.find((c) => c.length <= TITLE_BUDGET) ??
    candidates[candidates.length - 1]
  );
}

function buildDescription(
  lead: string,
  stats: MarketStats,
  category?: string,
): string {
  const { minPrice, maxPrice } = stats;
  let range = "";
  const isRent = category === "rent";
  if (category && minPrice != null && maxPrice != null) {
    range =
      minPrice === maxPrice
        ? ` ${isRent ? "Rent" : "Priced"} at ${formatPriceShort(minPrice)}${isRent ? "/mo" : ""}.`
        : isRent
          ? ` Rents from ${formatPriceShort(minPrice)} to ${formatPriceShort(maxPrice)} per month.`
          : ` Prices from ${formatPriceShort(minPrice)} to ${formatPriceShort(maxPrice)}.`;
  }
  const full = `${lead}${range} Book a viewing with Realtor Rutch.`;
  return full.length <= DESCRIPTION_BUDGET ? full : `${lead}${range}`;
}

// generateMetadata and the page both need the results; cache() makes the
// database query run once per request.
const loadResults = cache(async (key: string) => {
  const { citySlug, filterSlug, areaSlug, query } = JSON.parse(key) as {
    citySlug: string;
    filterSlug: string;
    areaSlug: string;
    query: ListingParams;
  };
  const city = getCityBySlug(citySlug);
  const filter = getFilterBySlug(filterSlug);
  const area = city ? getAreaBySlug(city.slug, areaSlug) : undefined;
  if (!city || !filter || !area) return null;

  const where = { ...baseWhere(city, area, filter), ...priceBedsWhere(query) };

  const results = await queryListings(
    where,
    String(query.page),
    listingsOrderBy(query.sort),
  );

  return { city, filter, area, ...results };
});

async function getResults(props: Props) {
  const { city: citySlug, filterSlug, area: areaSlug } = await props.params;
  const query = parseListingParams(await props.searchParams);

  const data = await loadResults(
    JSON.stringify({ citySlug, filterSlug, areaSlug, query }),
  );
  if (!data) notFound();
  ensurePageInRange(query.page, data.totalPages);

  return { query, ...data };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { city, filter, area, totalCount } = await getResults(props);
  const meta = getAreaListingsMeta(city.name, area.name, filter.label);

  const title = fitTitle([meta.title, `${filter.label} in ${area.name}`]);

  // Live count and price range when the area has listings
  let description = meta.description;
  const stats = await getMarketStats(baseWhere(city, area, filter));
  if (stats.count > 0) {
    description = buildDescription(
      `Browse ${stats.count} ${filter.label.toLowerCase()} in ${area.name}, ${city.name}.`,
      stats,
      filter.category,
    );
  }

  return {
    title,
    description,
    alternates: { canonical: `/${city.slug}/${filter.slug}/${area.slug}` },
    openGraph: { title, description },
    // Keep pages with no listings out of Google's index but let it follow links.
    ...(totalCount === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function AreaFilterListingsPage(props: Props) {
  const {
    query,
    city,
    filter,
    area,
    listings,
    totalCount,
    totalPages,
    currentPage,
  } = await getResults(props);

  const meta = getAreaListingsMeta(city.name, area.name, filter.label);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...(filter.category
      ? [
          {
            label: CATEGORY_LABELS[filter.category],
            href: `/listings?category=${filter.category}`,
          },
        ]
      : []),
    { label: city.name, href: `/${city.slug}` },
    ...(filter.breadcrumbLabel !== "Properties"
      ? [
          {
            label: filter.breadcrumbLabel,
            href: `/${city.slug}/${filter.slug}`,
          },
        ]
      : []),
    { label: area.name },
  ];

  const hub = getHub(filter.type, filter.category);

  const hrefForPage = (targetPage: number) => {
    const p = new URLSearchParams();
    if (query.priceMax) p.set("priceMax", query.priceMax);
    if (query.bedsMin) p.set("bedsMin", query.bedsMin);
    if (query.sort) p.set("sort", query.sort);
    if (targetPage > 1) p.set("page", String(targetPage));
    const qs = p.toString();
    return `/${city.slug}/${filter.slug}/${area.slug}${qs ? `?${qs}` : ""}`;
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

        {hub && (
          <p className="mt-10 text-sm text-[#8B7355]">
            Looking beyond {area.name}?{" "}
            <Link
              href={hub.path}
              className="text-[#C9A96E] underline underline-offset-2 hover:text-[#1A1A1A] transition"
            >
              {hub.linkText}
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
