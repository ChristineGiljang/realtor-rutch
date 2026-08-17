// ── SEO label map for /listings ──────────────────────────────────
// Keyed off the exact type/subtype/category combos used by
// components/layout/Navbar.tsx, so every nav click lands on a page
// with its own H1, <title>, and meta description.

export interface ListingsMeta {
  h1: string;
  title: string;
  description: string;
}

export function getListingsMeta(
  type?: string,
  subtype?: string,
  category?: string,
): ListingsMeta {
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

// ── SEO label map for /[city] and /[city]/[filterSlug] ──────────
// One entry per CityDef in lib/cities.ts. Add a case here whenever a
// new city is added there, or it falls back to the generic template.
// filterLabel (from lib/filter-slugs.ts) is optional — pass it on the
// combined /[city]/[filterSlug] route to get filter-specific copy
// instead of the generic "Properties for Sale and Rent" text.
export function getCityListingsMeta(
  cityName: string,
  filterLabel?: string,
): ListingsMeta {
  if (filterLabel) {
    return {
      h1: `${filterLabel} in ${cityName}`,
      title: `${filterLabel} in ${cityName} | Realtor Rutch`,
      description: `Browse ${filterLabel.toLowerCase()} listings in ${cityName}. Verified listings, updated daily. Inquire with Realtor Rutch.`,
    };
  }

  switch (cityName) {
    case "Cebu City":
      return {
        h1: "Properties for Sale and Rent in Cebu City",
        title: "Cebu City Real Estate — Houses, Condos & Lots | Realtor Rutch",
        description:
          "Browse houses, condos, lots, and commercial properties for sale or rent in Cebu City. Verified listings, updated daily. Inquire with Realtor Rutch.",
      };
    case "Mandaue City":
      return {
        h1: "Properties for Sale and Rent in Mandaue City",
        title:
          "Mandaue City Real Estate — Houses, Condos & Lots | Realtor Rutch",
        description:
          "Browse houses, condos, lots, and commercial properties for sale or rent in Mandaue City. Verified listings, updated daily. Inquire with Realtor Rutch.",
      };
    case "Lapu-Lapu City":
      return {
        h1: "Properties for Sale and Rent in Lapu-Lapu City",
        title:
          "Lapu-Lapu City Real Estate — Houses, Condos & Lots | Realtor Rutch",
        description:
          "Browse houses, condos, lots, and commercial properties for sale or rent in Lapu-Lapu City, including Mactan. Verified listings. Inquire with Realtor Rutch.",
      };
    case "Cordova":
      return {
        h1: "Properties for Sale and Rent in Cordova",
        title: "Cordova Real Estate — Houses, Condos & Lots | Realtor Rutch",
        description:
          "Browse houses, condos, lots, and commercial properties for sale or rent in Cordova, Cebu. Verified listings, updated daily. Inquire with Realtor Rutch.",
      };
    default:
      return {
        h1: `Properties for Sale and Rent in ${cityName}`,
        title: `${cityName} Real Estate — Houses, Condos & Lots | Realtor Rutch`,
        description: `Browse houses, condos, lots, and commercial properties for sale or rent in ${cityName}. Verified listings, updated daily. Inquire with Realtor Rutch.`,
      };
  }
}
