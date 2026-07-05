"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ListingsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = searchParams.get("type") || "";
  const priceMax = searchParams.get("priceMax") || "";
  const bedsMin = searchParams.get("bedsMin") || "";
  const sort = searchParams.get("sort") || "";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/listings?${params.toString()}`);
  };

  const selectClass =
    "bg-white border border-[#E2D9C8] text-[#1A1A1A] text-sm px-4 py-2 tracking-wide focus:outline-none focus:border-[#C9A96E]";

  return (
    <div className="flex flex-wrap gap-4 mb-12 pb-8 border-b border-[#E2D9C8]">
      <select
        value={type}
        onChange={(e) => updateFilter("type", e.target.value)}
        className={selectClass}
      >
        <option value="">All Types</option>
        <option value="house">House</option>
        <option value="condo">Condo</option>
        <option value="land">Land</option>
        <option value="commercial">Commercial</option>
      </select>

      <select
        value={priceMax}
        onChange={(e) => updateFilter("priceMax", e.target.value)}
        className={selectClass}
      >
        <option value="">Any Price</option>
        <option value="1000000">Under ₱1M</option>
        <option value="3000000">Under ₱3M</option>
        <option value="5000000">Under ₱5M</option>
        <option value="10000000">Under ₱10M</option>
      </select>

      <select
        value={bedsMin}
        onChange={(e) => updateFilter("bedsMin", e.target.value)}
        className={selectClass}
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
        onChange={(e) => updateFilter("sort", e.target.value)}
        className={selectClass}
      >
        <option value="">Sort By</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="newest">Newest</option>
      </select>

      {(type || priceMax || bedsMin || sort) && (
        <button
          onClick={() => router.push("/listings")}
          className="text-sm text-[#8B7355] hover:text-[#1A1A1A] underline transition px-2"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
