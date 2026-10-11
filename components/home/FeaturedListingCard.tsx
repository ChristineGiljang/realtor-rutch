"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  status: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  city: string;
  images: ListingImage[];
}

export default function FeaturedListingCard({ listing }: { listing: Listing }) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Only photos the visitor has reached (plus neighbors) are mounted,
  // so the rest don't download on page load and compete with the hero.
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0]));
  const count = listing.images.length;
  const hasMultiple = count > 1;

  const goTo = (index: number) => {
    setActiveIndex(index);
    setLoaded((prev) => {
      const nextSet = new Set(prev);
      nextSet.add(index);
      nextSet.add((index + 1) % count);
      nextSet.add((index - 1 + count) % count);
      return nextSet;
    });
  };

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    goTo(activeIndex === 0 ? count - 1 : activeIndex - 1);
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    goTo(activeIndex === count - 1 ? 0 : activeIndex + 1);
  };

  return (
    <Link href={`/property/${listing.slug}`}>
      <div className="group cursor-pointer">
        {/* Image */}
        <div className="relative overflow-hidden h-72 mb-4">
          {count > 0 ? (
            <div
              className="flex h-full transition-transform duration-300 ease-out"
              style={{
                width: `${count * 100}%`,
                transform: `translateX(-${(activeIndex * 100) / count}%)`,
              }}
            >
              {listing.images.map((img, i) => (
                <div
                  key={img.id}
                  className="relative h-full flex-shrink-0 overflow-hidden"
                  style={{ width: `${100 / count}%` }}
                >
                  {loaded.has(i) && (
                    <Image
                      src={img.url}
                      alt={img.alt || listing.title}
                      fill
                      sizes="(max-width: 768px) calc(100vw - 32px), 420px"
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                  )}
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
            {listing.status}
          </div>

          {hasMultiple && (
            <>
              <button
                onClick={prev}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8 flex items-center justify-center rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={next}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8 flex items-center justify-center rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"
              >
                <ChevronRight size={16} />
              </button>

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
          <p className="text-xl font-bold mb-1 text-[#C9A96E]">
            ₱{listing.price.toLocaleString()}
          </p>
          <p className="text-[#1A1A1A] mb-2 font-medium">{listing.title}</p>
          <p className="text-[#8B7355] text-sm">
            {listing.beds} bd · {listing.baths} ba ·{" "}
            {listing.sqft.toLocaleString()} sqm · {listing.city}
          </p>
        </div>
      </div>
    </Link>
  );
}
