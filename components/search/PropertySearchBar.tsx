"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, RotateCcw, SlidersHorizontal, X } from "lucide-react";
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

const CATEGORY_OPTIONS = [
  { label: "For Sale or Rent", value: "" },
  { label: "For Sale", value: "sale" },
  { label: "For Rent", value: "rent" },
];

const TYPE_OPTIONS = [
  { label: "All Property Types", value: "" },
  { label: "House and Lot", value: "house" },
  { label: "Condo", value: "condo" },
  { label: "Lot Only", value: "land" },
  { label: "Commercial", value: "commercial" },
];

const PRICE_OPTIONS = [
  { label: "Any Price", value: "" },
  { label: "Under ₱1M", value: "1000000" },
  { label: "Under ₱3M", value: "3000000" },
  { label: "Under ₱5M", value: "5000000" },
  { label: "Under ₱10M", value: "10000000" },
];

const BEDS_OPTIONS = [
  { label: "Any Beds", value: "" },
  { label: "1+ Beds", value: "1" },
  { label: "2+ Beds", value: "2" },
  { label: "3+ Beds", value: "3" },
  { label: "4+ Beds", value: "4" },
  { label: "5+ Beds", value: "5" },
];

const SORT_OPTIONS = [
  { label: "Sort By", value: "" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

function labelFor(options: { label: string; value: string }[], value: string) {
  return options.find((o) => o.value === value)?.label ?? options[0].label;
}

type FilterTab = "category" | "type" | "price" | "more";

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

  const [desktopOpenTab, setDesktopOpenTab] = useState<FilterTab | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const locationDisplayValue =
    location || (city ? getCityBySlug(city)?.name || "" : "");

  const hasAnyFilter = Boolean(
    city || location || category || type || priceMax || bedsMin || sort,
  );

  // Every filter/location change navigates immediately — merges the
  // change with current state, computes the right destination (a
  // /[city] or /[city]/[filterSlug] page when a city is set, /listings
  // otherwise), and pushes it.
  const runNavigation = (
    overrides: Partial<{
      city: string;
      location: string;
      category: string;
      type: string;
      priceMax: string;
      bedsMin: string;
      sort: string;
    }>,
    opts: { closeMobileSheet?: boolean } = {},
  ) => {
    const next = {
      city: overrides.city ?? city,
      location: overrides.location ?? location,
      category: overrides.category ?? category,
      type: overrides.type ?? type,
      priceMax: overrides.priceMax ?? priceMax,
      bedsMin: overrides.bedsMin ?? bedsMin,
      sort: overrides.sort ?? sort,
    };

    setCity(next.city);
    setLocation(next.location);
    setCategory(next.category);
    setType(next.type);
    setPriceMax(next.priceMax);
    setBedsMin(next.bedsMin);
    setSort(next.sort);

    const filterSlug = findFilterSlug({
      type: next.type,
      category: next.category,
    });
    const qp = new URLSearchParams();
    if (next.sort) qp.set("sort", next.sort);
    if (next.priceMax) qp.set("priceMax", next.priceMax);
    if (next.bedsMin) qp.set("bedsMin", next.bedsMin);

    let base: string;
    if (next.city) {
      base = filterSlug ? `/${next.city}/${filterSlug}` : `/${next.city}`;
      if (!filterSlug) {
        if (next.type) qp.set("type", next.type);
        if (next.category) qp.set("category", next.category);
      }
    } else if (next.location) {
      base = "/listings";
      qp.set("q", next.location);
      if (next.type) qp.set("type", next.type);
      if (next.category) qp.set("category", next.category);
    } else {
      base = "/listings";
      if (next.type) qp.set("type", next.type);
      if (next.category) qp.set("category", next.category);
    }

    const qs = qp.toString();
    router.push(qs ? `${base}?${qs}` : base);
    setDesktopOpenTab(null);
    if (opts.closeMobileSheet) setMobileSheetOpen(false);
  };

  const clearAll = () => {
    setCity("");
    setLocation("");
    setCategory("");
    setType("");
    setPriceMax("");
    setBedsMin("");
    setSort("");
    router.push("/listings");
    setMobileSheetOpen(false);
  };

  const pillClass =
    "flex items-center gap-1.5 bg-white border border-[#E2D9C8] text-[#1A1A1A] text-sm px-4 py-2.5 rounded-full hover:border-[#C9A96E] transition whitespace-nowrap";

  return (
    <div className="mb-8">
      {/* ── Desktop search bar ── */}
      <div className="hidden md:flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[260px]">
          <LocationAutocomplete
            value={locationDisplayValue}
            pill
            onSelectCity={(slug) =>
              runNavigation(
                { city: slug, location: "" },
                { closeMobileSheet: true },
              )
            }
            onSelectAddress={(address) =>
              runNavigation(
                { location: address, city: "" },
                { closeMobileSheet: true },
              )
            }
            onClear={() => {
              setCity("");
              setLocation("");
            }}
          />
        </div>

        {/* Category */}
        <div
          className="relative"
          onMouseEnter={() => setDesktopOpenTab("category")}
          onMouseLeave={() => setDesktopOpenTab(null)}
        >
          <button type="button" className={pillClass}>
            {labelFor(CATEGORY_OPTIONS, category)}
            <ChevronDown size={14} />
          </button>
          {desktopOpenTab === "category" && (
            <div className="absolute top-full left-0 pt-2 z-50">
              <div className="bg-white border border-[#E2D9C8] shadow-lg rounded-xl py-2 min-w-[180px]">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => runNavigation({ category: opt.value })}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-[#F5F0E8] transition ${
                      category === opt.value
                        ? "text-[#1A1A1A] font-semibold"
                        : "text-[#8B7355]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Type */}
        <div
          className="relative"
          onMouseEnter={() => setDesktopOpenTab("type")}
          onMouseLeave={() => setDesktopOpenTab(null)}
        >
          <button type="button" className={pillClass}>
            {labelFor(TYPE_OPTIONS, type)}
            <ChevronDown size={14} />
          </button>
          {desktopOpenTab === "type" && (
            <div className="absolute top-full left-0 pt-2 z-50">
              <div className="bg-white border border-[#E2D9C8] shadow-lg rounded-xl py-2 min-w-[180px]">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => runNavigation({ type: opt.value })}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-[#F5F0E8] transition ${
                      type === opt.value
                        ? "text-[#1A1A1A] font-semibold"
                        : "text-[#8B7355]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Price */}
        <div
          className="relative"
          onMouseEnter={() => setDesktopOpenTab("price")}
          onMouseLeave={() => setDesktopOpenTab(null)}
        >
          <button type="button" className={pillClass}>
            {labelFor(PRICE_OPTIONS, priceMax)}
            <ChevronDown size={14} />
          </button>
          {desktopOpenTab === "price" && (
            <div className="absolute top-full left-0 pt-2 z-50">
              <div className="bg-white border border-[#E2D9C8] shadow-lg rounded-xl py-2 min-w-[180px]">
                {PRICE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => runNavigation({ priceMax: opt.value })}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-[#F5F0E8] transition ${
                      priceMax === opt.value
                        ? "text-[#1A1A1A] font-semibold"
                        : "text-[#8B7355]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* More Filters (Beds + Sort) */}
        <div
          className="relative"
          onMouseEnter={() => setDesktopOpenTab("more")}
          onMouseLeave={() => setDesktopOpenTab(null)}
        >
          <button type="button" className={pillClass}>
            <SlidersHorizontal size={14} />
            More Filters
            <ChevronDown size={14} />
          </button>
          {desktopOpenTab === "more" && (
            <div className="absolute top-full right-0 pt-2 z-50">
              <div className="bg-white border border-[#E2D9C8] shadow-lg rounded-xl p-4 min-w-[240px] flex flex-col gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#8B7355] mb-2">
                    Bedrooms
                  </p>
                  <select
                    value={bedsMin}
                    onChange={(e) => runNavigation({ bedsMin: e.target.value })}
                    className="w-full bg-[#F5F0E8] border border-[#E2D9C8] text-sm text-[#1A1A1A] px-3 py-2 rounded-lg outline-none"
                  >
                    {BEDS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#8B7355] mb-2">
                    Sort By
                  </p>
                  <select
                    value={sort}
                    onChange={(e) => runNavigation({ sort: e.target.value })}
                    className="w-full bg-[#F5F0E8] border border-[#E2D9C8] text-sm text-[#1A1A1A] px-3 py-2 rounded-lg outline-none"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {hasAnyFilter && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1.5 text-sm text-[#8B7355] hover:text-[#1A1A1A] transition px-2"
          >
            <RotateCcw size={14} />
            Clear filters
          </button>
        )}
      </div>

      {/* ── Mobile search bar ── */}
      <div className="flex md:hidden items-center gap-2">
        <div className="flex-1 min-w-0">
          <LocationAutocomplete
            value={locationDisplayValue}
            pill
            stacked
            onSelectCity={(slug) =>
              runNavigation(
                { city: slug, location: "" },
                { closeMobileSheet: true },
              )
            }
            onSelectAddress={(address) =>
              runNavigation(
                { location: address, city: "" },
                { closeMobileSheet: true },
              )
            }
            onClear={() => {
              setCity("");
              setLocation("");
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => setMobileSheetOpen(true)}
          className="relative flex items-center gap-1.5 bg-white border border-[#E2D9C8] text-[#1A1A1A] text-sm px-4 py-2.5 rounded-full shrink-0"
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>

      {/* ── Mobile filter bottom sheet ── */}
      {mobileSheetOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileSheetOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="w-10 h-1 bg-[#E2D9C8] rounded-full absolute left-1/2 -translate-x-1/2 top-2" />
              <span />
              <button
                type="button"
                onClick={() => setMobileSheetOpen(false)}
                aria-label="Close filters"
                className="text-[#1A1A1A]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-5 flex flex-col gap-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#8B7355] mb-2">
                  Category
                </p>
                <select
                  value={category}
                  onChange={(e) => runNavigation({ category: e.target.value })}
                  className="w-full bg-[#F5F0E8] border border-[#E2D9C8] text-sm text-[#1A1A1A] px-3 py-2.5 rounded-lg outline-none"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-[#8B7355] mb-2">
                  Property Type
                </p>
                <select
                  value={type}
                  onChange={(e) => runNavigation({ type: e.target.value })}
                  className="w-full bg-[#F5F0E8] border border-[#E2D9C8] text-sm text-[#1A1A1A] px-3 py-2.5 rounded-lg outline-none"
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-[#8B7355] mb-2">
                  Price Range
                </p>
                <select
                  value={priceMax}
                  onChange={(e) => runNavigation({ priceMax: e.target.value })}
                  className="w-full bg-[#F5F0E8] border border-[#E2D9C8] text-sm text-[#1A1A1A] px-3 py-2.5 rounded-lg outline-none"
                >
                  {PRICE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-[#8B7355] mb-2">
                  Bedrooms
                </p>
                <select
                  value={bedsMin}
                  onChange={(e) => runNavigation({ bedsMin: e.target.value })}
                  className="w-full bg-[#F5F0E8] border border-[#E2D9C8] text-sm text-[#1A1A1A] px-3 py-2.5 rounded-lg outline-none"
                >
                  {BEDS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-[#8B7355] mb-2">
                  Sort By
                </p>
                <select
                  value={sort}
                  onChange={(e) => runNavigation({ sort: e.target.value })}
                  className="w-full bg-[#F5F0E8] border border-[#E2D9C8] text-sm text-[#1A1A1A] px-3 py-2.5 rounded-lg outline-none"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center gap-3 px-5 py-4 border-t border-[#E2D9C8]">
              {hasAnyFilter && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="flex-1 border border-[#E2D9C8] text-[#1A1A1A] text-sm font-semibold py-3 rounded-full"
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={() => setMobileSheetOpen(false)}
                className="flex-[2] bg-[#1A1A1A] text-white text-sm font-semibold py-3 rounded-full"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
