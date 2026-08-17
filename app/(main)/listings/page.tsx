import type { Metadata } from "next";
import { getListingsMeta } from "@/lib/listings-meta";
import { queryListings } from "@/lib/listings-query";
import PropertySearchBar from "@/components/listings/PropertySearchBar";
import ListingsResults from "@/components/listings/ListingsResults";

export const revalidate = 0;

interface Props {
  searchParams: Promise<{
    type?: string;
    subtype?: string;
    priceMax?: string;
    bedsMin?: string;
    sort?: string;
    category?: string;
    q?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { type, subtype, category } = await searchParams;
  const meta = getListingsMeta(type, subtype, category);

  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (subtype) params.set("subtype", subtype);
  if (category) params.set("category", category);
  const qs = params.toString();

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/listings${qs ? `?${qs}` : ""}`,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
    },
  };
}

export default async function ListingsPage({ searchParams }: Props) {
  const { type, subtype, priceMax, bedsMin, sort, category, q, page } =
    await searchParams;

  const where: any = { status: "active" };

  if (type) where.type = type;
  if (subtype) where.subtype = subtype;
  if (priceMax) where.price = { lte: parseInt(priceMax) };
  if (bedsMin) where.beds = { gte: parseInt(bedsMin) };
  if (category) where.listingCategory = category;
  if (q) {
    where.OR = [
      { address: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { state: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } },
    ];
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  if (sort === "price-desc") orderBy = { price: "desc" };
  if (sort === "newest") orderBy = { createdAt: "desc" };

  const { listings, totalCount, totalPages, currentPage } = await queryListings(
    where,
    page,
    orderBy,
  );

  const meta = getListingsMeta(type, subtype, category);

  const hrefForPage = (targetPage: number) => {
    const p = new URLSearchParams();
    if (type) p.set("type", type);
    if (subtype) p.set("subtype", subtype);
    if (category) p.set("category", category);
    if (priceMax) p.set("priceMax", priceMax);
    if (bedsMin) p.set("bedsMin", bedsMin);
    if (sort) p.set("sort", sort);
    if (q) p.set("q", q);
    if (targetPage > 1) p.set("page", String(targetPage));
    const qs = p.toString();
    return `/listings${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="pt-[120px] min-h-screen bg-[#faf9f6] text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-3">
            Available Now
          </p>
          <h1 className="text-5xl font-bold text-[#1A1A1A]">{meta.h1}</h1>
        </div>

        {/* Breadcrumb + Search / Filters */}
        <PropertySearchBar />

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
