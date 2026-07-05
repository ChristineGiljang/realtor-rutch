import Link from "next/link";
import { db } from "@/lib/db";

export default async function FeaturedListings() {
  const listings = await db.property.findMany({
    where: { status: "active", featured: true },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
    },
  });

  if (listings.length === 0) return null;

  return (
    <section className="bg-[#1A1A1A] text-[#F5F0E8] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-3">
              Hand Selected
            </p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Featured Properties
            </h2>
          </div>
          <Link
            href="/listings"
            className="hidden md:block text-sm tracking-wider uppercase text-[#F5F0E8]/60 hover:text-[#C9A96E] transition border-b border-[#F5F0E8]/20 pb-1"
          >
            View All
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Link key={listing.id} href={`/listings/${listing.slug}`}>
              <div className="group cursor-pointer">
                {/* Image */}
                <div className="relative overflow-hidden h-72 mb-4">
                  <img
                    src={listing.images[0]?.url || "/images/placeholder.jpg"}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />
                  <div className="absolute top-4 left-4 bg-[#F5F0E8] text-[#1A1A1A] text-xs tracking-wider uppercase px-3 py-1 font-semibold">
                    {listing.status}
                  </div>
                </div>

                {/* Info */}
                <div>
                  <p className="text-xl font-bold mb-1 text-[#C9A96E]">
                    ${listing.price.toLocaleString()}
                  </p>
                  <p className="text-[#F5F0E8]/90 mb-2">{listing.title}</p>
                  <p className="text-[#F5F0E8]/50 text-sm">
                    {listing.beds} bd · {listing.baths} ba ·{" "}
                    {listing.sqft.toLocaleString()} sqm · {listing.city}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-10 text-center md:hidden">
          <Link
            href="/listings"
            className="text-sm tracking-wider uppercase text-[#F5F0E8]/60 hover:text-[#C9A96E] transition border-b border-[#F5F0E8]/20 pb-1"
          >
            View All Listings
          </Link>
        </div>
      </div>
    </section>
  );
}
