"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

type FilterTab = "category" | "type" | "price" | "more";

const CATEGORY_OPTIONS = [
  { label: "All", value: "" },
  { label: "For Sale", value: "sale" },
  { label: "For Rent", value: "rent" },
];

const TYPE_OPTIONS = [
  { label: "All Types", value: "" },
  { label: "House", value: "house" },
  { label: "Condo", value: "condo" },
  { label: "Land", value: "land" },
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
  { label: "Newest", value: "" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

function labelFor(options: { label: string; value: string }[], value: string) {
  return options.find((o) => o.value === value)?.label ?? options[0].label;
}

export default function PropertySearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const type = searchParams.get("type") || "";
  const priceMax = searchParams.get("priceMax") || "";
  const bedsMin = searchParams.get("bedsMin") || "";
  const sort = searchParams.get("sort") || "";

  const [locationInput, setLocationInput] = useState(q);
  const [desktopOpenTab, setDesktopOpenTab] = useState<FilterTab | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"all" | FilterTab>("all");

  const activeFilterCount = [category, type, priceMax, bedsMin, sort].filter(
    Boolean,
  ).length;
  const hasAnyFilter = Boolean(q || activeFilterCount);

  const buildParams = (overrides: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    return params;
  };

  const updateFilter = (key: string, value: string) => {
    router.push(`/listings?${buildParams({ [key]: value }).toString()}`);
  };

  const submitLocation = () => {
    setDesktopOpenTab(null);
    router.push(`/listings?${buildParams({ q: locationInput }).toString()}`);
  };

  const clearAll = () => {
    setLocationInput("");
    router.push("/listings");
    setMobileSheetOpen(false);
  };

  // Breadcrumb label: reflects the active category/subtype
  const subtype = searchParams.get("subtype") || "";
  const breadcrumbLabel =
    subtype === "preselling"
      ? "Project Selling"
      : category === "rent"
        ? "For Rent"
        : category === "sale"
          ? "For Sale"
          : "All Properties";

  const pillClass =
    "flex items-center gap-1.5 bg-white border border-[#E2D9C8] text-[#1A1A1A] text-sm px-4 py-2.5 rounded-full hover:border-[#C9A96E] transition whitespace-nowrap";

  return (
    <div className="mb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#8B7355] mb-4">
        <Link href="/" className="hover:text-[#1A1A1A] transition">
          Home
        </Link>
        <span>/</span>
        <span className="text-[#1A1A1A] font-medium">{breadcrumbLabel}</span>
      </div>

      {/* ── Desktop search bar ── */}
      <div className="hidden md:flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-[#E2D9C8] rounded-full px-4 py-2.5 flex-1 min-w-[260px] focus-within:border-[#C9A96E] transition">
          <MapPin size={16} className="text-[#8B7355] shrink-0" />
          <input
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitLocation()}
            placeholder="Enter an address, street, barangay, city or province"
            className="flex-1 text-sm text-[#1A1A1A] placeholder:text-[#8B7355]/70 outline-none bg-transparent"
          />
          <button
            type="button"
            onClick={submitLocation}
            aria-label="Search location"
            className="text-[#8B7355] hover:text-[#1A1A1A] transition shrink-0"
          >
            <Search size={16} />
          </button>
        </div>

        {/* Category */}
        <div
          className="relative"
          onMouseEnter={() => setDesktopOpenTab("category")}
          onMouseLeave={() => setDesktopOpenTab(null)}
        >
          <button type="button" className={pillClass}>
            {labelFor(CATEGORY_OPTIONS, category)}
            {category && (
              <span className="bg-[#C9A96E] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                1
              </span>
            )}
            <ChevronDown size={14} />
          </button>
          {desktopOpenTab === "category" && (
            <div className="absolute top-full left-0 pt-2 z-50">
              <div className="bg-white border border-[#E2D9C8] shadow-lg rounded-xl py-2 min-w-[180px]">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      updateFilter("category", opt.value);
                      setDesktopOpenTab(null);
                    }}
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
                    onClick={() => {
                      updateFilter("type", opt.value);
                      setDesktopOpenTab(null);
                    }}
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
                    onClick={() => {
                      updateFilter("priceMax", opt.value);
                      setDesktopOpenTab(null);
                    }}
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

        {/* More Filters */}
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
                    onChange={(e) => updateFilter("bedsMin", e.target.value)}
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
                    onChange={(e) => updateFilter("sort", e.target.value)}
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
        <div className="flex items-center gap-2 bg-white border border-[#E2D9C8] rounded-full px-4 py-2.5 flex-1 min-w-0">
          <MapPin size={16} className="text-[#8B7355] shrink-0" />
          <input
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitLocation()}
            placeholder="Enter an address, street, barangay..."
            className="flex-1 min-w-0 text-sm text-[#1A1A1A] placeholder:text-[#8B7355]/70 outline-none bg-transparent"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setMobileTab("all");
            setMobileSheetOpen(true);
          }}
          className="relative flex items-center gap-1.5 bg-white border border-[#E2D9C8] text-[#1A1A1A] text-sm px-4 py-2.5 rounded-full shrink-0"
        >
          <SlidersHorizontal size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#C9A96E] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
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

            {/* Tabs */}
            <div className="flex items-center gap-2 px-5 pb-3 overflow-x-auto">
              {(
                [
                  { key: "all", label: "All" },
                  { key: "category", label: "Category" },
                  { key: "type", label: "Type" },
                  { key: "price", label: "Price" },
                  { key: "more", label: "More" },
                ] as { key: "all" | FilterTab; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setMobileTab(tab.key)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm border transition ${
                    mobileTab === tab.key
                      ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                      : "bg-white text-[#8B7355] border-[#E2D9C8]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-5 flex flex-col gap-6">
              {(mobileTab === "all" || mobileTab === "category") && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#8B7355] mb-2">
                    Category
                  </p>
                  <select
                    value={category}
                    onChange={(e) => updateFilter("category", e.target.value)}
                    className="w-full bg-[#F5F0E8] border border-[#E2D9C8] text-sm text-[#1A1A1A] px-3 py-2.5 rounded-lg outline-none"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(mobileTab === "all" || mobileTab === "type") && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#8B7355] mb-2">
                    Property Type
                  </p>
                  <select
                    value={type}
                    onChange={(e) => updateFilter("type", e.target.value)}
                    className="w-full bg-[#F5F0E8] border border-[#E2D9C8] text-sm text-[#1A1A1A] px-3 py-2.5 rounded-lg outline-none"
                  >
                    {TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(mobileTab === "all" || mobileTab === "price") && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#8B7355] mb-2">
                    Price Range
                  </p>
                  <select
                    value={priceMax}
                    onChange={(e) => updateFilter("priceMax", e.target.value)}
                    className="w-full bg-[#F5F0E8] border border-[#E2D9C8] text-sm text-[#1A1A1A] px-3 py-2.5 rounded-lg outline-none"
                  >
                    {PRICE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(mobileTab === "all" || mobileTab === "more") && (
                <>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#8B7355] mb-2">
                      Bedrooms
                    </p>
                    <select
                      value={bedsMin}
                      onChange={(e) => updateFilter("bedsMin", e.target.value)}
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
                      onChange={(e) => updateFilter("sort", e.target.value)}
                      className="w-full bg-[#F5F0E8] border border-[#E2D9C8] text-sm text-[#1A1A1A] px-3 py-2.5 rounded-lg outline-none"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex items-center gap-3 px-5 py-4 border-t border-[#E2D9C8]">
              <button
                type="button"
                onClick={clearAll}
                className="flex-1 border border-[#E2D9C8] text-[#1A1A1A] text-sm font-semibold py-3 rounded-full"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => {
                  submitLocation();
                  setMobileSheetOpen(false);
                }}
                className="flex-1 bg-[#1A1A1A] text-white text-sm font-semibold py-3 rounded-full"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
