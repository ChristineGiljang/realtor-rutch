import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import FeaturedListings from "@/components/home/FeaturedListings";
import AboutTeaser from "@/components/home/AboutTeaser";
import Testimonials from "@/components/home/Testimonials";
import ContactCTA from "@/components/home/ContactCTA";

export const metadata: Metadata = {
  title: "House and Lot in Cebu | Realtor Rutch",
  description:
    "Find your ideal house and lot in Cebu with Realtor Rutch. Browse verified listings across Cebu City and nearby areas, from starter homes to luxury properties, for sale or rent.",
};

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedListings />
      <AboutTeaser />
      <Testimonials />
      <ContactCTA />
    </>
  );
}
