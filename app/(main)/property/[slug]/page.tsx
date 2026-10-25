import { db } from "@/lib/db";
import { cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import PropertyGallery from "@/components/listings/PropertyGallery";
import ContactForm from "@/components/listings/ContactForm";
import { Suspense } from "react";
import NearbyAmenitiesSection from "@/components/listings/NearbyAmenitiesSection";
import Breadcrumbs from "@/components/listings/Breadcrumbs";
import { CATEGORY_LABELS } from "@/lib/filter-slugs";
import { getCityByFreeText } from "@/lib/cities";
import { optimizedUrl } from "@/lib/cloudinary-url";
import { findCurrentSlug } from "@/lib/slug-redirects";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

const getPropertyBySlug = cache(async (slug: string) => {
  return db.property.findUnique({
    where: { slug },
    include: { images: { orderBy: { order: "asc" } } },
  });
});

const TITLE_BUDGET = 43; // 60 minus the " | Realtor Rutch" suffix from layout.tsx
const NO_BEDS_TYPES = ["land", "commercial"];

// On this site, type "house" means house and lot. If some house-type listings
// are not (for example townhouses), add their subtype here and they get that
// wording instead of "House and Lot".
const NOT_HOUSE_AND_LOT_SUBTYPES = ["townhouse"];

function safeTitle(title: string): string {
  if (title.length <= TITLE_BUDGET) return title;
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `[SEO] Title exceeds ${TITLE_BUDGET} chars and was truncated: "${title}"`,
    );
  }
  return title.slice(0, TITLE_BUDGET - 1).trimEnd() + "\u2026";
}

function getTypeLabel(type: string, subtype: string | null): string {
  if (type === "house") {
    if (subtype && NOT_HOUSE_AND_LOT_SUBTYPES.includes(subtype)) {
      const words = subtype.replace(/-/g, " ");
      return words.charAt(0).toUpperCase() + words.slice(1);
    }
    return "House and Lot";
  }
  const labels: Record<string, string> = {
    condo: "Condo",
    land: "Lot",
    commercial: "Commercial Property",
  };
  return labels[type] || type;
}

// Picks the longest wording that fits the title budget.
function buildTitle(p: {
  type: string;
  subtype: string | null;
  beds: number;
  city: string;
  listingCategory: string;
}): string {
  const label = getTypeLabel(p.type, p.subtype);
  const action = p.listingCategory === "rent" ? "for Rent" : "for Sale";
  // Studio condos have 0 beds, so call them "Studio"
  const beds = NO_BEDS_TYPES.includes(p.type)
    ? null
    : p.beds
      ? `${p.beds}BR`
      : p.type === "condo"
        ? "Studio"
        : null;

  const candidates = [
    beds ? `${beds} ${label} ${action} in ${p.city}` : null,
    `${label} ${action} in ${p.city}`,
    beds ? `${beds} ${label} in ${p.city}` : null,
    `${label} in ${p.city}`,
  ].filter((c): c is string => Boolean(c));

  return (
    candidates.find((c) => c.length <= TITLE_BUDGET) ??
    safeTitle(candidates[candidates.length - 1])
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return { title: "Listing Not Found" };

  const priceLabel = `\u20B1${property.price.toLocaleString()}${property.listingCategory === "rent" ? "/mo" : ""}`;
  const label = getTypeLabel(property.type, property.subtype);
  const title = buildTitle(property);

  const location = [property.city, property.state].filter(Boolean).join(", ");
  const action = property.listingCategory === "rent" ? "for rent" : "for sale";
  const DESCRIPTION_BUDGET = 155;

  // Condos: name the building when there is one (trimmed, in case the
  // value in admin has stray spaces)
  const buildingName = property.building?.trim();
  const where =
    property.type === "condo" && buildingName
      ? `${buildingName}, ${location}`
      : location;

  // "2 bed, 1 bath", leaving out any count that is 0 or blank
  const bedBath = [
    property.beds ? `${property.beds} bed` : null,
    property.baths ? `${property.baths} bath` : null,
  ]
    .filter(Boolean)
    .join(", ");

  // Price lives in the description instead of the title
  let prefix: string;
  if (NO_BEDS_TYPES.includes(property.type)) {
    prefix = `${label} ${action} in ${where}. ${priceLabel}. `;
  } else if (property.type === "condo" && !property.beds) {
    prefix = `Studio ${label.toLowerCase()} ${action} in ${where}. ${priceLabel}. `;
  } else if (bedBath) {
    prefix = `${bedBath} ${label.toLowerCase()} ${action} in ${where}. ${priceLabel}. `;
  } else {
    prefix = `${label} ${action} in ${where}. ${priceLabel}. `;
  }

  const remaining = DESCRIPTION_BUDGET - prefix.length;
  let snippet = property.description.slice(0, Math.max(remaining, 0));
  if (property.description.length > remaining) {
    snippet = snippet.slice(0, snippet.lastIndexOf(" ")).trimEnd() + "\u2026";
  }
  const description = `${prefix}${snippet}`.trim();

  const ogImage = property.images[0]?.url;
  return {
    title,
    description,
    alternates: { canonical: `/property/${property.slug}` },
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

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-start py-3 border-b border-[#E2D9C8] last:border-0">
      <span className="text-sm text-[#8B7355]">{label}</span>
      <span className="text-sm text-[#1A1A1A] font-medium capitalize text-right max-w-[60%]">
        {value}
      </span>
    </div>
  );
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) {
    // The listing's URL may have changed after a title edit. Send old URLs
    // to the current one instead of returning a 404.
    const currentSlug = await findCurrentSlug(slug);
    if (currentSlug) permanentRedirect(`/property/${currentSlug}`);
    notFound();
  }

  const amenityList = property.amenities
    ? property.amenities
        .split("\n")
        .map((a) => a.trim())
        .filter(Boolean)
    : [];

  const TYPE_LABELS: Record<string, string> = {
    house: "House and Lot",
    condo: "Condo",
    land: "Lot Only",
    commercial: "Commercial",
  };
  const matchedCity = getCityByFreeText(property.city);
  // Every crumb except the last must have a URL, otherwise the breadcrumb
  // structured data is invalid. Cities that aren't in lib/cities (for example
  // Liloan) fall back to a search link instead of having no href.
  const searchHref = (q: string) =>
    `/listings?q=${encodeURIComponent(q)}&type=${property.type}&category=${property.listingCategory}`;
  const breadcrumbs = [
    { label: "Home", href: "/" },
    {
      label: CATEGORY_LABELS[property.listingCategory] || "Listings",
      href: `/listings?category=${property.listingCategory}`,
    },
    {
      label: TYPE_LABELS[property.type] || property.type,
      href: `/listings?type=${property.type}&category=${property.listingCategory}`,
    },
    {
      label: property.city,
      href: matchedCity ? `/${matchedCity.slug}` : searchHref(property.city),
    },
    // Barangay crumb: only shown when the listing has one
    ...(property.barangay
      ? [
          {
            label: property.barangay,
            href: searchHref(property.barangay),
          },
        ]
      : []),
    { label: property.title },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: `https://realtor-rutch.com/property/${property.slug}`,
    image: property.images.map((img) => img.url),
    datePosted: property.createdAt,
    about: {
      "@type": "SingleFamilyResidence",
      name: property.title,
      address: {
        "@type": "PostalAddress",
        streetAddress: property.address,
        addressLocality: property.city,
        addressRegion: property.state || undefined,
        postalCode: property.zip,
        addressCountry: "PH",
      },
      numberOfBedrooms: property.beds,
      numberOfBathroomsTotal: property.baths,
      floorSize: property.sqft
        ? {
            "@type": "QuantitativeValue",
            value: property.sqft,
            unitCode: "MTK",
          }
        : undefined,
    },
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "PHP",
      availability: "https://schema.org/InStock",
      businessFunction:
        property.listingCategory === "rent"
          ? "http://purl.org/goodrelations/v1#LeaseOut"
          : "http://purl.org/goodrelations/v1#Sell",
    },
  };

  return (
    <div className="pt-[120px] min-h-screen bg-[#faf9f6] text-[#1A1A1A]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      {/* Gallery */}
      <PropertyGallery
        images={property.images}
        title={property.title}
        featured={property.featured}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* ── LEFT COLUMN ─────────────────────────────── */}
          <div className="lg:col-span-2 space-y-10">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs tracking-widest uppercase bg-[#1A1A1A] text-[#faf9f6] px-3 py-1 font-semibold">
                {property.type}
              </span>
              <span className="text-xs tracking-widest uppercase bg-[#C9A96E] text-white px-3 py-1 font-semibold">
                {property.listingCategory === "rent" ? "For Rent" : "For Sale"}
              </span>
              {property.subtype && (
                <span className="text-xs tracking-widest uppercase border border-[#C9A96E] text-[#C9A96E] px-3 py-1">
                  {property.subtype.replace(/-/g, " ")}
                </span>
              )}
              {property.featured && (
                <span className="text-xs tracking-widest uppercase border border-[#8B7355] text-[#8B7355] px-3 py-1">
                  Featured
                </span>
              )}
              {property.luxury && (
                <span className="text-xs tracking-widest uppercase border border-[#8B7355] text-[#8B7355] px-3 py-1">
                  Luxury
                </span>
              )}
            </div>

            {/* Title, Address, Price */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-[#1A1A1A] leading-tight">
                {property.title}
              </h1>
              <p className="text-[#8B7355] mb-4 text-sm">
                {[property.address, property.city, property.state]
                  .filter(Boolean)
                  .join(", ")}{" "}
                {property.zip}
              </p>
              <p className="text-3xl font-bold text-[#C9A96E]">
                ₱{property.price.toLocaleString()}
                {property.listingCategory === "rent" && (
                  <span className="text-base font-normal text-[#8B7355]">
                    /mo
                  </span>
                )}
              </p>
            </div>

            {/* Quick Stats Bar */}
            {(() => {
              const stats = NO_BEDS_TYPES.includes(property.type)
                ? []
                : [
                    { label: "Bedrooms", value: property.beds },
                    { label: "Bathrooms", value: property.baths },
                    {
                      label: "Floor Area (sqm)",
                      value: property.sqft
                        ? property.sqft.toLocaleString()
                        : "--",
                    },
                    { label: "Car Parks", value: property.garage ?? "--" },
                  ];
              if (stats.length === 0) return null;
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#E2D9C8]">
                  {stats.map((s) => (
                    <div
                      key={s.label}
                      className="bg-[#faf9f6] px-5 py-5 text-center"
                    >
                      <p className="text-2xl font-bold text-[#1A1A1A]">
                        {s.value}
                      </p>
                      <p className="text-xs tracking-widest uppercase text-[#8B7355] mt-1">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Property Overview */}
            <div>
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-[#E2D9C8] text-[#1A1A1A]">
                Overview
              </h2>
              <div className="divide-y divide-[#E2D9C8]">
                <DetailRow
                  label="Category"
                  value={
                    property.type.charAt(0).toUpperCase() +
                    property.type.slice(1)
                  }
                />
                <DetailRow
                  label="Listing Type"
                  value={
                    property.listingCategory === "rent"
                      ? "For Rent"
                      : "For Sale"
                  }
                />
                <DetailRow
                  label="Built In"
                  value={property.yearBuilt ? property.yearBuilt : null}
                />
                <DetailRow
                  label="Car Parks"
                  value={property.garage ? `${property.garage}` : null}
                />
                <DetailRow
                  label="Type of Ownership"
                  value={property.ownershipType ?? "Freehold"}
                />
                <DetailRow
                  label="Total Area"
                  value={
                    property.sqft
                      ? `${property.sqft.toLocaleString()} sqm`
                      : null
                  }
                />
                <DetailRow
                  label="Land Size"
                  value={
                    property.lotSize && property.type !== "condo"
                      ? `${property.lotSize.toLocaleString()} sqm`
                      : null
                  }
                />
                <DetailRow
                  label="Property Floor"
                  value={property.propertyFloor}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-[#E2D9C8] text-[#1A1A1A]">
                Description
              </h2>
              <div className="text-[#8B7355] leading-relaxed space-y-2 text-sm">
                {property.description.split("\n").map((line, i) =>
                  line.trim() ? (
                    <p
                      key={i}
                      className={
                        line.endsWith(":")
                          ? "font-semibold text-[#1A1A1A] mt-4"
                          : ""
                      }
                    >
                      {line.trim()}
                    </p>
                  ) : (
                    <div key={i} className="h-2" />
                  ),
                )}
              </div>
            </div>

            {/* Amenities / Details chips */}
            {amenityList.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-[#E2D9C8] text-[#1A1A1A]">
                  Details
                </h2>
                <div className="space-y-4">
                  {(() => {
                    const groups: {
                      heading: string | null;
                      items: string[];
                    }[] = [];
                    let current: { heading: string | null; items: string[] } = {
                      heading: null,
                      items: [],
                    };
                    amenityList.forEach((item) => {
                      if (item.endsWith(":")) {
                        if (current.heading || current.items.length)
                          groups.push(current);
                        current = { heading: item.slice(0, -1), items: [] };
                      } else {
                        current.items.push(item);
                      }
                    });
                    if (current.heading || current.items.length)
                      groups.push(current);

                    return groups.map((group, i) => (
                      <div key={i}>
                        {group.heading && (
                          <p className="text-sm font-semibold text-[#1A1A1A] mb-2">
                            {group.heading}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3">
                          {group.items.map((item) => (
                            <span
                              key={item}
                              className="px-4 py-2 border border-[#E2D9C8] bg-white text-sm text-[#1A1A1A] rounded-sm"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* Features */}
            {property.features && (
              <div>
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-[#E2D9C8] text-[#1A1A1A]">
                  Features
                </h2>
                <div className="text-[#8B7355] leading-relaxed space-y-1 text-sm">
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
                <div className="text-[#8B7355] leading-relaxed space-y-1 text-sm">
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

            {/* Location & What's Nearby */}
            {/* Location & What's Nearby */}
            {property.lat && property.lng && (
              <div>
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-[#E2D9C8] text-[#1A1A1A]">
                  Location & What's Nearby
                </h2>
                <Suspense
                  fallback={
                    <div className="w-full h-[420px] bg-[#E2D9C8] flex items-center justify-center text-[#8B7355] text-sm border border-[#E2D9C8]">
                      Loading nearby amenities…
                    </div>
                  }
                >
                  <NearbyAmenitiesSection
                    lat={property.lat}
                    lng={property.lng}
                  />
                </Suspense>
                <a
                  href={`https://maps.google.com/?q=${property.lat},${property.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-xs text-[#8B7355] hover:text-[#C9A96E] underline transition"
                >
                  Open in Google Maps ↗
                </a>
              </div>
            )}

            {/* Recommended Properties */}
            {/* Mobile-only contact form — shows after map, before recommended */}
            <div className="lg:hidden">
              <ContactForm
                propertyId={property.id}
                propertyTitle={property.title}
              />
            </div>

            <RecommendedProperties
              currentSlug={property.slug}
              type={property.type}
              city={property.city}
              listingCategory={property.listingCategory}
            />
          </div>

          {/* ── RIGHT COLUMN — sticky contact form, hidden on mobile ────── */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-[132px]">
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

// ── Recommended Properties (server component, reuses db) ──
async function RecommendedProperties({
  currentSlug,
  type,
  city,
  listingCategory,
}: {
  currentSlug: string;
  type: string;
  city: string;
  listingCategory: string;
}) {
  const candidates = await db.property.findMany({
    where: {
      slug: { not: currentSlug },
      status: "active",
      listingCategory,
      OR: [{ city }, { type }],
    },
    take: 12,
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });

  const recommended = candidates
    .map((p) => ({
      property: p,
      score: (p.city === city ? 2 : 0) + (p.type === type ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => r.property);

  if (recommended.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6 pb-2 border-b border-[#E2D9C8] text-[#1A1A1A]">
        More {listingCategory === "rent" ? "Rentals" : "Listings"} in {city}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommended.map((p) => (
          <Link key={p.id} href={`/property/${p.slug}`} className="group">
            <div className="relative overflow-hidden h-44 mb-3">
              <img
                src={
                  p.images[0]?.url
                    ? optimizedUrl(p.images[0].url, { width: 500 })
                    : "/images/placeholder.jpg"
                }
                alt={p.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute top-3 left-3 bg-[#C9A96E] text-white text-xs px-2 py-1 uppercase tracking-wider font-semibold">
                {p.listingCategory === "rent" ? "For Rent" : "For Sale"}
              </div>
            </div>
            <p className="font-bold text-[#C9A96E] text-base">
              ₱{p.price.toLocaleString()}
              {p.listingCategory === "rent" && (
                <span className="text-xs font-normal text-[#8B7355]">/mo</span>
              )}
            </p>
            <p className="text-sm font-medium text-[#1A1A1A] leading-snug line-clamp-2">
              {p.title}
            </p>
            <p className="text-xs text-[#8B7355] mt-1">{p.city}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
