import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PropertyGallery from "@/components/listings/PropertyGallery";
import ContactForm from "@/components/listings/ContactForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const property = await db.property.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
    },
  });

  if (!property) {
    return { title: "Listing Not Found" };
  }

  const priceLabel = `₱${property.price.toLocaleString()}${
    property.listingCategory === "rent" ? "/mo" : ""
  }`;

  const title = `${property.title} | ${priceLabel} — ${property.city}`;
  const description = `${property.beds} bed, ${property.baths} bath ${property.type} in ${property.city}, ${property.state}. ${property.description.slice(0, 140)}`;

  const ogImage = property.images[0]?.url;

  return {
    title,
    description,
    alternates: {
      canonical: `/listings/${property.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;

  const property = await db.property.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
    },
  });

  if (!property) notFound();

  return (
    <div className="pt-20 min-h-screen bg-[#F5F0E8] text-[#1A1A1A]">
      {/* Gallery */}
      <PropertyGallery images={property.images} title={property.title} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left: Property Details */}
          <div className="lg:col-span-2 space-y-10">
            {/* Title & Price */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="text-xs tracking-widest uppercase bg-[#1A1A1A] text-[#F5F0E8] px-3 py-1 font-semibold">
                  {property.type}
                </span>
                <span className="text-xs tracking-widest uppercase bg-[#C9A96E] text-white px-3 py-1 font-semibold">
                  {property.listingCategory === "rent"
                    ? "For Rent"
                    : "For Sale"}
                </span>
                {property.featured && (
                  <span className="text-xs tracking-widest uppercase border border-[#C9A96E] text-[#C9A96E] px-3 py-1">
                    Featured
                  </span>
                )}
                {property.luxury && (
                  <span className="text-xs tracking-widest uppercase border border-[#C9A96E] text-[#C9A96E] px-3 py-1">
                    Luxury
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-3 text-[#1A1A1A]">
                {property.title}
              </h1>
              <p className="text-[#8B7355] mb-4">
                {property.address}, {property.city}, {property.state}{" "}
                {property.zip}
              </p>
              <p className="text-4xl font-bold text-[#C9A96E]">
                ₱{property.price.toLocaleString()}
                {property.listingCategory === "rent" && (
                  <span className="text-lg font-normal text-[#8B7355]">
                    /mo
                  </span>
                )}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#E2D9C8]">
              {[
                { label: "Beds", value: property.beds },
                { label: "Baths", value: property.baths },
                {
                  label: "Sqm",
                  value:
                    property.sqft === 0 ? "--" : property.sqft.toLocaleString(),
                },
                { label: "Year Built", value: property.yearBuilt ?? "--" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#F5F0E8] px-6 py-5">
                  <p className="text-2xl font-bold mb-1 text-[#1A1A1A]">
                    {stat.value}
                  </p>
                  <p className="text-xs tracking-widest uppercase text-[#8B7355]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-[#E2D9C8] text-[#1A1A1A]">
                About This Property
              </h2>
              <div className="text-[#8B7355] leading-relaxed space-y-1">
                {property.description.split("\n").map((line, i) =>
                  line.trim() ? (
                    <p
                      key={i}
                      className={
                        line.endsWith(":")
                          ? "font-semibold text-[#1A1A1A] mt-3"
                          : ""
                      }
                    >
                      {line.trim()}
                    </p>
                  ) : null,
                )}
              </div>
            </div>

            {/* Features */}
            {property.features && (
              <div>
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-[#E2D9C8] text-[#1A1A1A]">
                  Features
                </h2>
                <div className="text-[#8B7355] leading-relaxed space-y-1">
                  {property.features.split("\n").map((line, i) =>
                    line.trim() ? (
                      <p
                        key={i}
                        className={
                          line.endsWith(":")
                            ? "font-semibold text-[#1A1A1A] mt-3"
                            : ""
                        }
                      >
                        {line.trim()}
                      </p>
                    ) : null,
                  )}
                </div>
              </div>
            )}

            {/* Payment Terms */}
            {property.paymentTerms && (
              <div>
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-[#E2D9C8] text-[#1A1A1A]">
                  Payment Terms
                </h2>
                <div className="text-[#8B7355] leading-relaxed space-y-1">
                  {property.paymentTerms.split("\n").map((line, i) =>
                    line.trim() ? (
                      <p
                        key={i}
                        className={
                          line.endsWith(":")
                            ? "font-semibold text-[#1A1A1A] mt-3"
                            : ""
                        }
                      >
                        {line.trim()}
                      </p>
                    ) : null,
                  )}
                </div>
              </div>
            )}

            {/* Property Details */}
            <div>
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-[#E2D9C8] text-[#1A1A1A]">
                Property Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Property Type", value: property.type },
                  { label: "Status", value: property.status },
                  {
                    label: "Lot Size",
                    value: property.lotSize
                      ? `${property.lotSize.toLocaleString()} sqm`
                      : "--",
                  },
                  {
                    label: "Garage",
                    value: property.garage ? `${property.garage} cars` : "--",
                  },
                  { label: "City", value: property.city },
                  { label: "ZIP", value: property.zip },
                  { label: "Year Built", value: property.yearBuilt ?? "--" },
                ].map((detail) => (
                  <div
                    key={detail.label}
                    className="flex justify-between py-3 border-b border-[#E2D9C8]"
                  >
                    <span className="text-[#8B7355] text-sm">
                      {detail.label}
                    </span>
                    <span className="text-[#1A1A1A] text-sm capitalize">
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <ContactForm
                propertyId={property.id}
                propertyTitle={property.title}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
