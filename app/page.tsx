import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import FeaturedListings from "@/components/home/FeaturedListings";
import PopularSearches from "@/components/home/PopularSearches";
import AboutTeaser from "@/components/home/AboutTeaser";
import Testimonials from "@/components/home/Testimonials";
import ContactCTA from "@/components/home/ContactCTA";
import AgentJsonLd from "@/components/seo/AgentJsonLd";

const TITLE = "Cebu Real Estate: Houses, Condos & Lots | Realtor Rutch";
const DESCRIPTION =
  "Buy, sell, or rent house and lot, condo, and commercial property in Cebu City, Mandaue, and Lapu-Lapu with Realtor Rutch. Inquire today.";

export const metadata: Metadata = {
  // "absolute" skips the layout's "%s | Realtor Rutch" template,
  // which would otherwise repeat the brand name in the title.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Realtor Rutch",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "https://res.cloudinary.com/drczxmxfb/image/upload/v1791157777/IMG_1570_ekapmg.jpg",
        alt: "Realtor Rutch - Cebu real estate agent",
      },
    ],
  },
};

export default function Home() {
  return (
    <>
      <AgentJsonLd />
      <Hero />
      <FeaturedListings />
      <PopularSearches />
      <AboutTeaser />
      <Testimonials />
      <ContactCTA />
    </>
  );
}
