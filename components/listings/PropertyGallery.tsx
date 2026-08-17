"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";

interface Image {
  id: string;
  url: string;
  alt: string | null;
}

interface Props {
  images: Image[];
  title: string;
  featured?: boolean;
}

export default function PropertyGallery({ images, title, featured }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () =>
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () =>
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  if (images.length === 0) {
    return (
      <div className="w-full h-[420px] bg-[#E2D9C8] flex items-center justify-center">
        <p className="text-[#8B7355]">No images available</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#faf9f6]">
      <div className="max-w-7xl mx-auto">
        {/* Main image — fixed height, contain so nothing gets cropped weirdly */}
        <div className="relative w-full h-[420px] md:h-[540px] overflow-hidden">
          <div
            className="flex h-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {images.map((img) => (
              <div
                key={img.id}
                className="w-full h-full flex-shrink-0 flex items-center justify-center"
              >
                <img
                  src={img.url}
                  alt={img.alt || title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ))}
          </div>

          {/* Bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

          {/* Featured badge */}
          {featured && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white text-[#1A1A1A] text-xs font-semibold px-3 py-1.5 rounded-full shadow">
              <span className="text-yellow-500">★</span>
              FEATURED
            </div>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
            <Images size={13} />
            <span>
              {activeIndex + 1}/{images.length}
            </span>
          </div>

          {/* Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Previous"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-10 h-10 flex items-center justify-center rounded-sm transition"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={next}
                aria-label="Next"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-10 h-10 flex items-center justify-center rounded-sm transition"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-1.5 px-3 py-3 overflow-x-auto scrollbar-hide bg-[#F5F0E8]">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveIndex(i)}
                className={`flex-shrink-0 w-[72px] h-[52px] overflow-hidden transition-all ${
                  i === activeIndex
                    ? "ring-2 ring-[#C9A96E] opacity-100"
                    : "opacity-45 hover:opacity-75"
                }`}
              >
                <img
                  src={img.url}
                  alt={img.alt || title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
