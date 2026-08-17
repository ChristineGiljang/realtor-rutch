"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { getCityBySlug } from "@/lib/cities";
import { findFilterSlug } from "@/lib/filter-slugs";
import LocationAutocomplete from "@/components/search/LocationAutocomplete";

interface Props {
  initialCity?: string;
  initialLocation?: string;
  initialType?: string;
  initialCategory?: string;
  initialPriceMax?: string;
  initialBedsMin?: string;
  initialSort?: string;
}

export default function PropertySearchBar({
  initialCity = "",
  initialLocation = "",
  initialType = "",
  initialCategory = "",
  initialPriceMax = "",
  initialBedsMin = "",
  initialSort = "",
}: Props) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // city = a recognized /[city] slug (from CITIES). location = free-text
  // address/subdivision search that doesn't map to a dedicated city page.
  // Only one is ever set at a time — picking one clears the other.
  const [city, setCity] = useState(initialCity);
  const [location, setLocation] = useState(initialLocation);
  const [category, setCategory] = useState(initialCategory);
  const [type, setType] = useState(initialType);
  const [priceMax, setPriceMax] = useState(initialPriceMax);
  const [bedsMin, setBedsMin] = useState(initialBedsMin);
  const [sort, setSort] = useState(initialSort);

  const locationDisplayValue =
    location || (city ? getCityBySlug(city)?.name || "" : "");

  const activeCount = [
    city,
    location,
    category,
    type,
    priceMax,
    bedsMin,
    sort,
  ].filter(Boolean).length;

  const runSearch = () => {
    const filterSlug = findFilterSlug({ type, category });
    const qp = new URLSearchParams();
    if (sort) qp.set("sort", sort);
    if (priceMax) qp.set("priceMax", priceMax);
    if (bedsMin) qp.set("bedsMin", bedsMin);

    let base: string;
    if (city) {
      base = filterSlug ? `/${city}/${filterSlug}` : `/${city}`;
      if (!filterSlug) {
        if (type) qp.set("type", type);
        if (category) qp.set("category", category);
      }
    } else if (location) {
      base = "/listings";
      qp.set("location", location);
      if (type) qp.set("type", type);
      if (category) qp.set("category", category);
    } else {
      base = "/listings";
      if (type) qp.set("type", type);
      if (category) qp.set("category", category);
    }

    const qs = qp.toString();
    router.push(qs ? `${base}?${qs}` : base);
    setMobileOpen(false);
  };

  const clearAll = () => {
    setCity("");
    setLocation("");
    setCategory("");
    setType("");
    setPriceMax("");
    setBedsMin("");
    setSort("");
  };

  const selectClass =
    "bg-white border border-[#E2D9C8] text-[#1A1A1A] text-sm px-4 py-2 tracking-wide focus:outline-none focus:border-[#C9A96E]";

  const fields = (stacked: boolean) => (
    <>
      <div className={stacked ? "w-full" : "w-64"}>
        <LocationAutocomplete
          value={locationDisplayValue}
          stacked={stacked}
          onSelectCity={(slug) => {
            setCity(slug);
            setLocation("");
          }}
          onSelectAddress={(address) => {
            setLocation(address);
            setCity("");
          }}
          onClear={() => {
            setCity("");
            setLocation("");
          }}
        />
      </div>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className={stacked ? `${selectClass} w-full` : selectClass}
      >
        <option value="">For Sale or Rent</option>
        <option value="sale">For Sale</option>
        <option value="rent">For Rent</option>
      </select>

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className={stacked ? `${selectClass} w-full` : selectClass}
      >
        <option value="">All Property Types</option>
        <option value="house">House and Lot</option>
        <option value="condo">Condo</option>
        <option value="land">Lot Only</option>
        <option value="commercial">Commercial</option>
      </select>

      <select
        value={priceMax}
        onChange={(e) => setPriceMax(e.target.value)}
        className={stacked ? `${selectClass} w-full` : selectClass}
      >
        <option value="">Any Price</option>
        <option value="1000000">Under ₱1M</option>
        <option value="3000000">Under ₱3M</option>
        <option value="5000000">Under ₱5M</option>
        <option value="10000000">Under ₱10M</option>
      </select>

      <select
        value={bedsMin}
        onChange={(e) => setBedsMin(e.target.value)}
        className={stacked ? `${selectClass} w-full` : selectClass}
      >
        <option value="">Any Beds</option>
        <option value="1">1+ Beds</option>
        <option value="2">2+ Beds</option>
        <option value="3">3+ Beds</option>
        <option value="4">4+ Beds</option>
        <option value="5">5+ Beds</option>
      </select>

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className={stacked ? `${selectClass} w-full` : selectClass}
      >
        <option value="">Sort By</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="newest">Newest</option>
      </select>
    </>
  );

  return (
    <div className="mb-12 pb-8 border-b border-[#E2D9C8]">
      {/* Desktop — inline row, same field style as before */}
      <div className="hidden md:flex flex-wrap items-center gap-4">
        {fields(false)}
        <button
          onClick={runSearch}
          className="bg-[#1A1A1A] text-[#faf9f6] text-sm tracking-wider uppercase px-6 py-2 font-semibold hover:bg-[#C9A96E] transition"
        >
          Search
        </button>
        {activeCount > 0 && (
          <button
            onClick={() => {
              clearAll();
              router.push("/listings");
            }}
            className="text-sm text-[#8B7355] hover:text-[#1A1A1A] underline transition px-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Mobile — trigger button + full-screen sheet */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-white border border-[#E2D9C8] text-[#1A1A1A] text-sm tracking-wider uppercase px-4 py-3 font-semibold"
        >
          <SlidersHorizontal size={16} />
          Search Properties
          {activeCount > 0 && (
            <span className="bg-[#C9A96E] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-[100] bg-[#faf9f6] flex flex-col">
            <div className="flex items-center justify-between px-4 h-16 border-b border-[#E2D9C8]">
              <p className="text-sm font-bold tracking-widest uppercase">
                Search Properties
              </p>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close"
                className="text-[#1A1A1A] p-2"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4">
              {fields(true)}
            </div>

            <div className="p-4 border-t border-[#E2D9C8] flex gap-3">
              {activeCount > 0 && (
                <button
                  onClick={clearAll}
                  className="flex-1 border border-[#E2D9C8] text-[#1A1A1A] text-sm tracking-wider uppercase py-3 font-semibold"
                >
                  Clear
                </button>
              )}
              <button
                onClick={runSearch}
                className="flex-[2] bg-[#1A1A1A] text-[#faf9f6] text-sm tracking-wider uppercase py-3 font-semibold hover:bg-[#C9A96E] transition"
              >
                Show Results
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
