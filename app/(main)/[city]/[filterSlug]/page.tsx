import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCityBySlug, cityWhereClause } from "@/lib/cities";
import { getFilterBySlug, CATEGORY_LABELS } from "@/lib/filter-slugs";
import { getCityListingsMeta } from "@/lib/listings-meta";
import { queryListings } from "@/lib/listings-query";
import PropertySearchBar from "@/components/search/PropertySearchBar";
import ListingsResults from "@/components/listings/ListingsResults";
import Breadcrumbs from "@/components/listings/Breadcrumbs";

export const revalidate = 0;

interface Props {
  params: Promise<{ city: string; filterSlug: string }>;
  searchParams: Promise<{
    priceMax?: string;
    bedsMin?: string;
    sort?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug, filterSlug } = await params;
  const city = getCityBySlug(citySlug);
  const filter = getFilterBySlug(filterSlug);
  if (!city || !filter) return {};

  const meta = getCityListingsMeta(city.name, filter.label);

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/${city.slug}/${filter.slug}` },
    openGraph: { title: meta.title, description: meta.description },
  };
}

export default async function CityFilterListingsPage({
  params,
  searchParams,
}: Props) {
  const { city: citySlug, filterSlug } = await params;
  const city = getCityBySlug(citySlug);
  const filter = getFilterBySlug(filterSlug);
  if (!city || !filter) notFound();

  const { priceMax, bedsMin, sort, page } = await searchParams;

  const where: any = {
    status: "active",
    OR: cityWhereClause(city),
  };
  if (filter.type) where.type = filter.type;
  if (filter.subtype) where.subtype = filter.subtype;
  if (filter.category) where.listingCategory = filter.category;
  if (priceMax) where.price = { lte: parseInt(priceMax) };
  if (bedsMin) where.beds = { gte: parseInt(bedsMin) };

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  if (sort === "price-desc") orderBy = { price: "desc" };

  const { listings, totalCount, totalPages, currentPage } = await queryListings(
    where,
    page,
    orderBy,
  );

  const meta = getCityListingsMeta(city.name, filter.label);

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
    ...(filter.breadcrumbLabel !== "Properties"
      ? [
          {
            label: filter.breadcrumbLabel,
            href: filter.type ? `/listings?type=${filter.type}` : undefined,
          },
        ]
      : []),
    { label: city.name },
  ];

  const hrefForPage = (targetPage: number) => {
    const p = new URLSearchParams();
    if (priceMax) p.set("priceMax", priceMax);
    if (bedsMin) p.set("bedsMin", bedsMin);
    if (sort) p.set("sort", sort);
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
          initialPriceMax={priceMax}
          initialBedsMin={bedsMin}
          initialSort={sort}
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
