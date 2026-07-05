"use client";

import { useState } from "react";

interface Image {
  id: string;
  url: string;
  alt: string | null;
}

interface Props {
  images: Image[];
  title: string;
}

export default function PropertyGallery({ images, title }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="w-full h-[60vh] bg-[#E2D9C8] flex items-center justify-center">
        <p className="text-[#8B7355]">No images available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Main Image */}
      <div className="relative w-full bg-[#1A1A1A] flex justify-center">
        <img
          src={images[activeIndex].url}
          alt={images[activeIndex].alt || title}
          className="max-h-[85vh] w-auto object-contain"
        />

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs tracking-widest px-3 py-2">
          {activeIndex + 1} / {images.length}
        </div>

        {/* Prev/Next Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white w-10 h-10 flex items-center justify-center transition"
            >
              ‹
            </button>
            <button
              onClick={() =>
                setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white w-10 h-10 flex items-center justify-center transition"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 p-4 bg-[#1A1A1A] overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 w-20 h-16 overflow-hidden border-2 transition ${
                i === activeIndex
                  ? "border-white"
                  : "border-transparent opacity-50 hover:opacity-80"
              }`}
            >
              <img
                src={img.url}
                alt={img.alt || title}
                className="w-full h-full object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
