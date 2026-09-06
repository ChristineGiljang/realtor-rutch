import Link from "next/link";

const SEARCHES = [
  {
    label: "House and Lot for Sale in Cebu City",
    href: "/cebu-city/house-and-lot-for-sale",
  },
  { label: "Condo for Sale in Cebu City", href: "/cebu-city/condo-for-sale" },
  { label: "Lot for Sale in Cebu City", href: "/cebu-city/lot-for-sale" },
  {
    label: "House and Lot for Sale in Mandaue City",
    href: "/mandaue-city/house-and-lot-for-sale",
  },
  {
    label: "House and Lot for Sale in Lapu-Lapu City",
    href: "/lapu-lapu-city/house-and-lot-for-sale",
  },
  { label: "Condo for Rent in Cebu City", href: "/cebu-city/condo-for-rent" },
  {
    label: "Preselling House and Lot in Cebu",
    href: "/cebu-city/preselling-house-and-lot",
  },
  {
    label: "All House and Lot Listings in Cebu",
    href: "/listings?type=house&category=sale",
  },
];

export default function PopularSearches() {
  return (
    <section className="bg-[#faf9f6] py-16 border-t border-[#E2D9C8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-3">
          Popular Searches
        </p>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-8">
          Browse Cebu Real Estate by Type and Location
        </h2>
        <div className="flex flex-wrap gap-3">
          {SEARCHES.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="border border-[#E2D9C8] bg-white text-[#6B5842] text-sm px-4 py-2 hover:bg-[#1A1A1A] hover:text-[#faf9f6] hover:border-[#1A1A1A] transition"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
