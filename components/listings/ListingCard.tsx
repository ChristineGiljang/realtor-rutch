"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ListingImage {
  id: string;
  url: string;
  alt: string | null;
}

interface Listing {
  id: string;
  slug: string;
  title: string;
  type: string;
  listingCategory: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  city: string;
  images: ListingImage[];
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultiple = listing.images.length > 1;

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex((i) => (i === 0 ? listing.images.length - 1 : i - 1));
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex((i) => (i === listing.images.length - 1 ? 0 : i + 1));
  };

  return (
    <Link href={`/property/${listing.slug}`}>
      <div className="group cursor-pointer">
        {/* Image */}
        <div className="relative overflow-hidden h-64 mb-4">
          {listing.images.length > 0 ? (
            <div
              className="flex h-full transition-transform duration-300 ease-out"
              style={{
                width: `${listing.images.length * 100}%`,
                transform: `translateX(-${
                  (activeIndex * 100) / listing.images.length
                }%)`,
              }}
            >
              {listing.images.map((img) => (
                <div
                  key={img.id}
                  className="h-full flex-shrink-0 overflow-hidden"
                  style={{ width: `${100 / listing.images.length}%` }}
                >
                  <img
                    src={img.url}
                    alt={img.alt || listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
              ))}
            </div>
          ) : (
            <img
              src="/images/placeholder.jpg"
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          )}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition pointer-events-none" />
          <div className="absolute top-4 left-4 bg-[#1A1A1A] text-[#faf9f6] text-xs tracking-wider uppercase px-3 py-1 font-semibold">
            {listing.type}
          </div>
          <div className="absolute top-4 right-4 bg-[#C9A96E] text-white text-xs tracking-wider uppercase px-3 py-1 font-semibold">
            {listing.listingCategory === "rent" ? "For Rent" : "For Sale"}
          </div>

          {/* Mini carousel arrows — only when there's more than one photo */}
          {hasMultiple && (
            <>
              <button
                onClick={prev}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={next}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                <ChevronRight size={16} />
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {listing.images.map((img, i) => (
                  <span
                    key={img.id}
                    className={`w-1.5 h-1.5 rounded-full transition ${
                      i === activeIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-2xl font-bold mb-1 text-[#1A1A1A]">
            ₱{listing.price.toLocaleString()}
            {listing.listingCategory === "rent" && (
              <span className="text-sm font-normal text-[#8B7355]">/mo</span>
            )}
          </p>
          <p className="text-[#1A1A1A] mb-2 font-medium">{listing.title}</p>
          <p className="text-[#8B7355] text-sm mb-1">
            {listing.beds} bd · {listing.baths} ba ·{" "}
            {listing.sqft === 0 ? "--" : listing.sqft.toLocaleString()} sqm
          </p>
          <p className="text-[#8B7355] text-sm">{listing.city}</p>
        </div>
      </div>
    </Link>
  );
}
