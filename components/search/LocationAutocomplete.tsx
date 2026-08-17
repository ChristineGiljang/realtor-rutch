"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, X } from "lucide-react";

interface CityResult {
  kind: "city";
  slug: string;
  label: string;
  count: number;
}
interface AddressResult {
  kind: "address";
  label: string;
  city: string;
  count: number;
}
type Result = CityResult | AddressResult;

interface Props {
  value: string;
  onSelectCity: (slug: string, label: string) => void;
  onSelectAddress: (address: string) => void;
  onClear: () => void;
  stacked?: boolean;
}

export default function LocationAutocomplete({
  value,
  onSelectCity,
  onSelectAddress,
  onClear,
  stacked = false,
}: Props) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(value), [value]);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/location-search?q=${encodeURIComponent(query.trim())}`,
        );
        const data = await res.json();
        const combined: Result[] = [
          ...data.cities.map((c: any) => ({
            kind: "city" as const,
            slug: c.slug,
            label: c.label,
            count: c.count,
          })),
          ...data.addresses.map((a: any) => ({
            kind: "address" as const,
            label: a.address,
            city: a.city,
            count: a.count,
          })),
        ];
        setResults(combined);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query, open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex items-center gap-2 bg-white border border-[#E2D9C8] focus-within:border-[#C9A96E] px-3 ${
          stacked ? "w-full" : ""
        }`}
      >
        <MapPin size={15} className="text-[#8B7355] shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="City, subdivision, or address"
          className="flex-1 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#8B7355] focus:outline-none min-w-0"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              onClear();
              setResults([]);
            }}
            aria-label="Clear location"
            className="text-[#8B7355] hover:text-[#1A1A1A] transition shrink-0"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E2D9C8] shadow-lg z-[70] max-h-72 overflow-y-auto">
          {loading ? (
            <p className="px-4 py-3 text-sm text-[#8B7355]">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[#8B7355]">
              No matches for &ldquo;{query}&rdquo;
            </p>
          ) : (
            results.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setQuery(r.label);
                  if (r.kind === "city") onSelectCity(r.slug, r.label);
                  else onSelectAddress(r.label);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#F5F0E8] transition border-b border-[#E2D9C8] last:border-0"
              >
                <span className="text-sm text-[#1A1A1A] truncate">
                  {r.kind === "city" ? (
                    <span className="font-medium">{r.label}</span>
                  ) : (
                    <>
                      {r.label}
                      <span className="text-[#8B7355]"> · {r.city}</span>
                    </>
                  )}
                </span>
                <span className="shrink-0 text-xs text-[#C9A96E] font-semibold bg-[#F5F0E8] px-2 py-0.5">
                  {r.count} {r.count === 1 ? "listing" : "listings"}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
