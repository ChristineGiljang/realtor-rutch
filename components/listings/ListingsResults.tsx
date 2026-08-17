import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ListingCard from "@/components/listings/ListingCard";
import { PAGE_SIZE } from "@/lib/listings-query";

interface Props {
  listings: any[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hrefForPage: (page: number) => string;
}

export default function ListingsResults({
  listings,
  totalCount,
  totalPages,
  currentPage,
  hrefForPage,
}: Props) {
  return (
    <>
      {/* Results Count — this also serves as the page's H2 signpost for the
          results section, since it's already dynamic per filter/page and
          more descriptive than a generic "Results" label would be. */}
      <h2 className="text-[#8B7355] text-sm font-normal mb-8">
        Showing {listings.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
        {"–"}
        {(currentPage - 1) * PAGE_SIZE + listings.length} of {totalCount}{" "}
        {totalCount === 1 ? "property" : "properties"}
      </h2>

      {/* Grid */}
      {listings.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-[#8B7355] text-lg">
            No listings match your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 mt-16">
          {currentPage > 1 ? (
            <Link
              href={hrefForPage(currentPage - 1)}
              aria-label="Previous page"
              className="flex items-center justify-center w-11 h-11 border border-[#E2D9C8] text-[#1A1A1A] hover:border-[#C9A96E] hover:text-[#C9A96E] transition"
            >
              <ChevronLeft size={18} />
            </Link>
          ) : (
            <span
              aria-hidden="true"
              className="flex items-center justify-center w-11 h-11 border border-[#E2D9C8] text-[#E2D9C8] cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </span>
          )}

          <span className="text-sm text-[#8B7355] tracking-wide">
            Page {currentPage} of {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link
              href={hrefForPage(currentPage + 1)}
              aria-label="Next page"
              className="flex items-center justify-center w-11 h-11 border border-[#E2D9C8] text-[#1A1A1A] hover:border-[#C9A96E] hover:text-[#C9A96E] transition"
            >
              <ChevronRight size={18} />
            </Link>
          ) : (
            <span
              aria-hidden="true"
              className="flex items-center justify-center w-11 h-11 border border-[#E2D9C8] text-[#E2D9C8] cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </span>
          )}
        </div>
      )}
    </>
  );
}
