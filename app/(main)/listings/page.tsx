import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import ListingsFilters from "@/components/listings/ListingsFilters";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Property Listings",
  description:
    "Browse houses, lots, and luxury properties for sale or rent in Cebu City with Realtor Rutch. Filter by price, bedrooms, and property type.",
};

interface Props {
  searchParams: Promise<{
    type?: string;
    priceMax?: string;
    bedsMin?: string;
    sort?: string;
    category?: string;
  }>;
}

export default async function ListingsPage({ searchParams }: Props) {
  const { type, priceMax, bedsMin, sort, category } = await searchParams;

  const where: any = { status: "active" };

  if (type) where.type = type;
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

  const activeCategory = category || "all";

  return (
    <div className="pt-20 min-h-screen bg-[#F5F0E8] text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-3">
            Available Now
          </p>
          <h1 className="text-5xl font-bold text-[#1A1A1A]">All Listings</h1>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-0 mb-8 border-b border-[#E2D9C8]">
          {[
            { label: "All", value: "all" },
            { label: "For Sale", value: "sale" },
            { label: "For Rent", value: "rent" },
          ].map((tab) => (
            <Link
              key={tab.value}
              href={
                tab.value === "all"
                  ? "/listings"
                  : `/listings?category=${tab.value}`
              }
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
                    <div className="absolute top-4 left-4 bg-[#1A1A1A] text-[#F5F0E8] text-xs tracking-wider uppercase px-3 py-1 font-semibold">
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
