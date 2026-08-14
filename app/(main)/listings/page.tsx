import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getListingsMeta } from "@/lib/listings-meta";
import ListingsFilters from "@/components/listings/ListingsFilters";

export const revalidate = 0;

interface Props {
  searchParams: Promise<{
    type?: string;
    subtype?: string;
    priceMax?: string;
    bedsMin?: string;
    sort?: string;
    category?: string;
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
  const { type, subtype, priceMax, bedsMin, sort, category } =
    await searchParams;

  const where: any = { status: "active" };

  if (type) where.type = type;
  if (subtype) where.subtype = subtype;
  if (priceMax) where.price = { lte: parseInt(priceMax) };
  if (bedsMin) where.beds = { gte: parseInt(bedsMin) };
  if (category) where.listingCategory = category;

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  if (sort === "price-desc") orderBy = { price: "desc" };
  if (sort === "newest") orderBy = { createdAt: "desc" };

  const listings = await db.property.findMany({
    where,
    orderBy,
    include: {
      images: {
        orderBy: { order: "asc" },
        take: 1,
      },
    },
  });

  const meta = getListingsMeta(type, subtype, category);
  const activeCategory = category || "all";

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

        {/* Category Tabs — preserve the active type/subtype when switching sale/rent */}
        <div className="flex gap-0 mb-8 border-b border-[#E2D9C8]">
          {[
            {
              label: "All",
              value: "all",
              href: (() => {
                const p = new URLSearchParams();
                if (type) p.set("type", type);
                if (subtype) p.set("subtype", subtype);
                const qs = p.toString();
                return `/listings${qs ? `?${qs}` : ""}`;
              })(),
            },
            {
              label: "For Sale",
              value: "sale",
              href: (() => {
                const p = new URLSearchParams();
                if (type) p.set("type", type);
                if (subtype) p.set("subtype", subtype);
                p.set("category", "sale");
                return `/listings?${p.toString()}`;
              })(),
            },
            {
              label: "For Rent",
              value: "rent",
              href: (() => {
                const p = new URLSearchParams();
                if (type) p.set("type", type);
                p.set("category", "rent");
                return `/listings?${p.toString()}`;
              })(),
            },
          ].map((tab) => (
            <Link
              key={tab.value}
              href={tab.href}
              className={`px-6 py-3 text-sm tracking-wider uppercase font-semibold border-b-2 transition -mb-px ${
                activeCategory === tab.value
                  ? "border-[#C9A96E] text-[#1A1A1A]"
                  : "border-transparent text-[#8B7355] hover:text-[#1A1A1A]"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Filters */}
        <ListingsFilters />

        {/* Results Count */}
        <p className="text-[#8B7355] text-sm mb-8">
          Showing {listings.length}{" "}
          {listings.length === 1 ? "property" : "properties"}
        </p>

        {/* Grid */}
        {listings.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-[#8B7355] text-lg">
              No listings match your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.slug}`}>
                <div className="group cursor-pointer">
                  {/* Image */}
                  <div className="relative overflow-hidden h-64 mb-4">
                    <img
                      src={listing.images[0]?.url || "/images/placeholder.jpg"}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition" />
                    <div className="absolute top-4 left-4 bg-[#1A1A1A] text-[#faf9f6] text-xs tracking-wider uppercase px-3 py-1 font-semibold">
                      {listing.type}
                    </div>
                    <div className="absolute top-4 right-4 bg-[#C9A96E] text-white text-xs tracking-wider uppercase px-3 py-1 font-semibold">
                      {listing.listingCategory === "rent"
                        ? "For Rent"
                        : "For Sale"}
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <p className="text-2xl font-bold mb-1 text-[#1A1A1A]">
                      ₱{listing.price.toLocaleString()}
                      {listing.listingCategory === "rent" && (
                        <span className="text-sm font-normal text-[#8B7355]">
                          /mo
                        </span>
                      )}
                    </p>
                    <p className="text-[#1A1A1A] mb-2 font-medium">
                      {listing.title}
                    </p>
                    <p className="text-[#8B7355] text-sm mb-1">
                      {listing.beds} bd · {listing.baths} ba ·{" "}
                      {listing.sqft === 0
                        ? "--"
                        : listing.sqft.toLocaleString()}{" "}
                      sqm
                    </p>
                    <p className="text-[#8B7355] text-sm">{listing.city}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
