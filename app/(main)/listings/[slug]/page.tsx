import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
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

// ── SEO label map ─────────────────────────────────────────
function getPageMeta(type?: string, subtype?: string, category?: string) {
  // Subtype-specific pages
  if (subtype === "preselling" && type === "house")
    return {
      h1: "Preselling House and Lot in Cebu",
      title: "Preselling House and Lot in Cebu | Realtor Rutch",
      description:
        "Browse preselling house and lot properties in Cebu City and nearby areas. Early-bird pricing, flexible payment terms. Inquire with Realtor Rutch.",
    };
  if (subtype === "rfo" && type === "house")
    return {
      h1: "RFO House and Lot in Cebu",
      title: "RFO House and Lot in Cebu — Ready for Occupancy | Realtor Rutch",
      description:
        "Ready-for-occupancy house and lot listings in Cebu City. Move in now — no waiting, verified properties. Browse with Realtor Rutch.",
    };
  if (subtype === "rent-to-own" && type === "house")
    return {
      h1: "Rent to Own House and Lot in Cebu",
      title: "Rent to Own House and Lot in Cebu | Realtor Rutch",
      description:
        "Find rent-to-own house and lot deals in Cebu City. Affordable path to homeownership. Inquire with Realtor Rutch today.",
    };
  if (subtype === "rfo-subdivision")
    return {
      h1: "RFO Subdivision in Cebu",
      title: "RFO Subdivision in Cebu — Ready for Occupancy | Realtor Rutch",
      description:
        "Ready-for-occupancy subdivision lots and homes in Cebu. Gated communities, complete amenities. Browse with Realtor Rutch.",
    };
  if (subtype === "preselling" && type === "condo")
    return {
      h1: "Preselling Condo in Cebu",
      title: "Preselling Condo in Cebu | Realtor Rutch",
      description:
        "Preselling condominium units in Cebu City. Lock in the best prices before turnover. Inquire with Realtor Rutch.",
    };
  if (subtype === "rfo" && type === "condo")
    return {
      h1: "RFO Condo in Cebu",
      title: "RFO Condo in Cebu — Ready for Occupancy | Realtor Rutch",
      description:
        "Ready-for-occupancy condo units in Cebu City. Move in now — verified listings. Browse with Realtor Rutch.",
    };
  if (subtype === "rent-to-own" && type === "condo")
    return {
      h1: "Rent to Own Condo in Cebu",
      title: "Rent to Own Condo in Cebu | Realtor Rutch",
      description:
        "Rent-to-own condominium units in Cebu City. Affordable monthly payments toward ownership. Inquire with Realtor Rutch.",
    };
  if (subtype === "warehouse")
    return {
      h1: "Warehouse for Rent in Cebu",
      title: "Warehouse for Rent in Cebu | Realtor Rutch",
      description:
        "Warehouse and storage spaces for rent in Cebu City and Metro Cebu. Various sizes available. Inquire with Realtor Rutch.",
    };

  // Type-only pages
  if (type === "house" && category === "rent")
    return {
      h1: "House for Rent in Cebu",
      title: "House for Rent in Cebu | Realtor Rutch",
      description:
        "Houses for rent in Cebu City and nearby areas. Various sizes, gated subdivisions available. Browse with Realtor Rutch.",
    };
  if (type === "condo" && category === "rent")
    return {
      h1: "Condo for Rent in Cebu",
      title: "Condo for Rent in Cebu | Realtor Rutch",
      description:
        "Condominium units for rent in Cebu City. Studio to 3-bedroom units near business districts. Browse with Realtor Rutch.",
    };
  if (type === "commercial" && category === "rent")
    return {
      h1: "Commercial Space for Rent in Cebu",
      title: "Commercial Space for Rent in Cebu | Realtor Rutch",
      description:
        "Office, retail, and commercial spaces for rent in Cebu City. Prime locations, flexible terms. Inquire with Realtor Rutch.",
    };
  if (type === "land")
    return {
      h1: "Lot for Sale in Cebu",
      title: "Lot for Sale in Cebu | Realtor Rutch",
      description:
        "Residential and commercial lots for sale in Cebu City and nearby areas. Browse with Realtor Rutch.",
    };
  if (type === "house")
    return {
      h1: "House and Lot for Sale in Cebu",
      title: "House and Lot for Sale in Cebu | Realtor Rutch",
      description:
        "Find your ideal house and lot for sale in Cebu City. Verified listings, gated subdivisions, and luxury homes. Browse with Realtor Rutch.",
    };
  if (type === "condo")
    return {
      h1: "Condo for Sale in Cebu",
      title: "Condo for Sale in Cebu | Realtor Rutch",
      description:
        "Condominium units for sale in Cebu City. Studio to penthouse units in prime locations. Browse with Realtor Rutch.",
    };
  if (type === "commercial")
    return {
      h1: "Commercial Properties in Cebu",
      title: "Commercial Properties in Cebu | Realtor Rutch",
      description:
        "Commercial real estate for sale and rent in Cebu City. Office, warehouse, and retail spaces. Browse with Realtor Rutch.",
    };
  if (category === "rent")
    return {
      h1: "Properties for Rent in Cebu",
      title: "Properties for Rent in Cebu | Realtor Rutch",
      description:
        "Houses, condos, and commercial spaces for rent in Cebu City. Updated listings. Browse with Realtor Rutch.",
    };
  if (category === "sale")
    return {
      h1: "Properties for Sale in Cebu",
      title: "Properties for Sale in Cebu | Realtor Rutch",
      description:
        "Houses, condos, lots, and commercial properties for sale in Cebu City. Browse with Realtor Rutch.",
    };

  // Default
  return {
    h1: "All Listings in Cebu",
    title: "Property Listings in Cebu | Realtor Rutch",
    description:
      "Browse houses, condos, lots, and commercial properties for sale or rent in Cebu City with Realtor Rutch.",
  };
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { type, subtype, category } = await searchParams;
  const meta = getPageMeta(type, subtype, category);
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/listings${
        type || subtype || category
          ? `?${new URLSearchParams({ ...(type && { type }), ...(subtype && { subtype }), ...(category && { category }) }).toString()}`
          : ""
      }`,
    },
  };
}

export default async function ListingsPage({ searchParams }: Props) {
  const { type, subtype, priceMax, bedsMin, sort, category } =
    await searchParams;

  const where: any = { status: "active" };
  if (type) where.type = type;
  if (subtype) where.subtype = subtype;
  if (category) where.listingCategory = category;
  if (priceMax) where.price = { lte: parseInt(priceMax) };
  if (bedsMin) where.beds = { gte: parseInt(bedsMin) };

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  if (sort === "price-desc") orderBy = { price: "desc" };
  if (sort === "newest") orderBy = { createdAt: "desc" };

  const listings = await db.property.findMany({
    where,
    orderBy,
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
    },
  });

  const meta = getPageMeta(type, subtype, category);
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

        {/* Category Tabs */}
        <div className="flex gap-0 mb-8 border-b border-[#E2D9C8]">
          {[
            {
              label: "All",
              value: "all",
              href: type ? `/listings?type=${type}` : "/listings",
            },
            {
              label: "For Sale",
              value: "sale",
              href: type
                ? `/listings?type=${type}&category=sale`
                : "/listings?category=sale",
            },
            {
              label: "For Rent",
              value: "rent",
              href: type
                ? `/listings?type=${type}&category=rent`
                : "/listings?category=rent",
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
