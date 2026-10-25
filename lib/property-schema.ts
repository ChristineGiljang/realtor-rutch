import type { Property, PropertyImage } from "@prisma/client";

const SITE_URL = "https://realtor-rutch.com";
const NO_BEDS_TYPES = ["land", "commercial"];

type PropertyWithImages = Property & { images: PropertyImage[] };

// Assumes status values "active" and "sold". Anything else (pending,
// inactive, and so on) is reported as out of stock.
function availabilityFor(status: string): string {
  if (status === "active") return "https://schema.org/InStock";
  if (status === "sold") return "https://schema.org/SoldOut";
  return "https://schema.org/OutOfStock";
}

export function buildPropertySchema(p: PropertyWithImages) {
  const isRent = p.listingCategory === "rent";
  const hasBedrooms = !NO_BEDS_TYPES.includes(p.type);
  const url = `${SITE_URL}/property/${p.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${url}#listing`,
    name: p.title,
    description: p.description,
    url,
    image: p.images.length > 0 ? p.images.map((img) => img.url) : undefined,
    datePosted: p.createdAt.toISOString(),
    dateModified: p.updatedAt.toISOString(),
    about: {
      "@type":
        p.type === "condo"
          ? "Apartment"
          : hasBedrooms
            ? "SingleFamilyResidence"
            : "Place",
      name: p.title,
      address: {
        "@type": "PostalAddress",
        streetAddress: p.address || undefined,
        addressLocality: p.city,
        addressRegion: p.state || undefined,
        postalCode: p.zip || undefined,
        addressCountry: "PH",
      },
      geo:
        p.lat != null && p.lng != null
          ? {
              "@type": "GeoCoordinates",
              latitude: p.lat,
              longitude: p.lng,
            }
          : undefined,
      numberOfBedrooms: hasBedrooms ? p.beds : undefined,
      numberOfBathroomsTotal: hasBedrooms ? p.baths : undefined,
      yearBuilt: hasBedrooms && p.yearBuilt ? p.yearBuilt : undefined,
      floorSize: p.sqft
        ? {
            "@type": "QuantitativeValue",
            value: p.sqft,
            unitCode: "MTK",
          }
        : undefined,
    },
    offers: {
      "@type": "Offer",
      url,
      price: p.price,
      priceCurrency: "PHP",
      availability: availabilityFor(p.status),
      businessFunction: isRent
        ? "http://purl.org/goodrelations/v1#LeaseOut"
        : "http://purl.org/goodrelations/v1#Sell",
      priceSpecification: isRent
        ? {
            "@type": "UnitPriceSpecification",
            price: p.price,
            priceCurrency: "PHP",
            unitCode: "MON",
          }
        : undefined,
      seller: {
        "@type": "RealEstateAgent",
        "@id": `${SITE_URL}/#agent`,
        name: "Realtor Rutch",
        url: SITE_URL,
      },
    },
  };
}