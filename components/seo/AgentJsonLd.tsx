const SITE_URL = "https://realtor-rutch.com";

const agent = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "@id": `${SITE_URL}/#agent`,
  name: "Realtor Rutch",
  alternateName: "Rutchilyn Llagoso",
  url: SITE_URL,
  image:
    "https://res.cloudinary.com/drczxmxfb/image/upload/v1791157777/IMG_1570_ekapmg.jpg",
  description:
    "Rutchilyn Llagoso is a Cebu-based real estate agent helping clients buy, sell, and rent houses and lots, condos, and lots in Cebu City, Mandaue, Lapu-Lapu, and nearby areas.",
  telephone: "+639817413929",
  email: "rldreamspaces@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Cebu City",
    addressCountry: "PH",
  },
  areaServed: ["Cebu City", "Mandaue City", "Lapu-Lapu City", "Cordova"].map(
    (name) => ({ "@type": "City", name }),
  ),
  parentOrganization: {
    "@type": "Organization",
    name: "Dreamers House Next Level Realty and Training Services",
  },
  identifier: [
    {
      "@type": "PropertyValue",
      name: "Accreditation No.",
      value: "29866",
    },
    {
      "@type": "PropertyValue",
      name: "DHSUD Accreditation No.",
      value: "R7-A-01/26-8595",
    },
  ],
  sameAs: [
    "https://www.facebook.com/rutchilynllagoso2026",
    "https://www.instagram.com/rutch_rldreamspaces",
  ],
};

export default function AgentJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(agent).replace(/</g, "\\u003c"),
      }}
    />
  );
}
