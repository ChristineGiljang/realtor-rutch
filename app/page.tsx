import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import FeaturedListings from "@/components/home/FeaturedListings";
import PopularSearches from "@/components/home/PopularSearches";
import AboutTeaser from "@/components/home/AboutTeaser";
import Testimonials from "@/components/home/Testimonials";
import ContactCTA from "@/components/home/ContactCTA";

export const metadata: Metadata = {
  title: "Cebu Real Estate: Houses, Condos & Lots | Realtor Rutch",
  description:
    "Realtor Rutch helps you buy, sell, or rent property in Cebu. Browse verified house and lot, condo, and lot listings in Cebu City, Mandaue, Lapu-Lapu, and nearby areas.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedListings />
      <PopularSearches />
      <AboutTeaser />
      <Testimonials />
      <ContactCTA />
    </>
  );
}
