import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getCityBySlug, cityWhereClause } from "@/lib/cities";
import { getAreaBySlug, areaWhereClause } from "@/lib/areas";
import { getBuildingBySlug, buildingWhereClause } from "@/lib/buildings";
import { getFilterBySlug, CATEGORY_LABELS } from "@/lib/filter-slugs";
import { getBuildingListingsMeta } from "@/lib/listings-meta";
import { queryListings } from "@/lib/listings-query";
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

export const revalidate = 0;

interface Props {
  params: Promise<{
    city: string;
    filterSlug: string;
    area: string;
    building: string;
  }>;
  searchParams: Promise<RawSearchParams>;
}

// generateMetadata and the page both need the results; cache() makes the
// database query run once per request.
const loadResults = cache(async (key: string) => {
  const { citySlug, filterSlug, areaSlug, buildingSlug, query } = JSON.parse(
    key,
  ) as {
    citySlug: string;
    filterSlug: string;
    areaSlug: string;
    buildingSlug: string;
    query: ListingParams;
  };
  const city = getCityBySlug(citySlug);
  const filter = getFilterBySlug(filterSlug);
  const area = city ? getAreaBySlug(city.slug, areaSlug) : undefined;
  const building =
    city && area
      ? getBuildingBySlug(city.slug, area.slug, buildingSlug)
      : undefined;
  if (!city || !filter || !area || !building) return null;

  const where: any = {
    status: "active",
    AND: [
      { OR: cityWhereClause(city) },
      { OR: areaWhereClause(area) },
      { OR: buildingWhereClause(building) },
    ],
    ...priceBedsWhere(query),
  };
  if (filter.type) where.type = filter.type;
  if (filter.subtype) where.subtype = filter.subtype;
  if (filter.category) where.listingCategory = filter.category;

  const results = await queryListings(
    where,
    String(query.page),
    listingsOrderBy(query.sort),
  );

  return { city, filter, area, building, ...results };
});

async function getResults(props: Props) {
  const {
    city: citySlug,
    filterSlug,
    area: areaSlug,
    building: buildingSlug,
  } = await props.params;
  const query = parseListingParams(await props.searchParams);

  const data = await loadResults(
    JSON.stringify({ citySlug, filterSlug, areaSlug, buildingSlug, query }),
  );
  if (!data) notFound();
  ensurePageInRange(query.page, data.totalPages);

  return { query, ...data };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { city, filter, area, building, totalCount } = await getResults(props);

  const meta = getBuildingListingsMeta(
    building.name,
    area.name,
    city.name,
    filter.label,
  );

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${city.slug}/${filter.slug}/${area.slug}/${building.slug}`,
    },
    openGraph: { title: meta.title, description: meta.description },
    // Keep pages with no listings out of Google's index but let it follow links.
    ...(totalCount === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function BuildingFilterListingsPage(props: Props) {
  const {
    query,
    city,
    filter,
    area,
    building,
    listings,
    totalCount,
    totalPages,
    currentPage,
  } = await getResults(props);

  const meta = getBuildingListingsMeta(
    building.name,
    area.name,
    city.name,
    filter.label,
  );

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
    { label: area.name, href: `/${city.slug}/${filter.slug}/${area.slug}` },
    { label: building.name },
  ];

  const hrefForPage = (targetPage: number) => {
    const p = new URLSearchParams();
    if (query.priceMax) p.set("priceMax", query.priceMax);
    if (query.bedsMin) p.set("bedsMin", query.bedsMin);
    if (query.sort) p.set("sort", query.sort);
    if (targetPage > 1) p.set("page", String(targetPage));
    const qs = p.toString();
    return `/${city.slug}/${filter.slug}/${area.slug}/${building.slug}${qs ? `?${qs}` : ""}`;
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
      </div>
    </div>
  );
}
