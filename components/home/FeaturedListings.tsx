import Link from "next/link";
import { db } from "@/lib/db";
import FeaturedListingCard from "@/components/home/FeaturedListingCard";

export default async function FeaturedListings() {
  const listings = await db.property.findMany({
    where: { status: "active", featured: true },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      images: { orderBy: { order: "asc" }, take: 5 },
    },
  });

  if (listings.length === 0) return null;

  return (
    <section className="bg-[#faf9f6] text-[#1A1A1A] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-3">
              Hand Selected
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A]">
              Featured Properties
            </h2>
          </div>
          <Link
            href="/listings"
            className="hidden md:block text-sm tracking-wider uppercase text-[#8B7355] hover:text-[#1A1A1A] transition border-b border-[#1A1A1A]/20 pb-1"
          >
            View All
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <FeaturedListingCard key={listing.id} listing={listing} />
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-10 text-center md:hidden">
          <Link
            href="/listings"
            className="text-sm tracking-wider uppercase text-[#8B7355] hover:text-[#1A1A1A] transition border-b border-[#1A1A1A]/20 pb-1"
          >
            View All Listings
          </Link>
        </div>
      </div>
    </section>
  );
}
