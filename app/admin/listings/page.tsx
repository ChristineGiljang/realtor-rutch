export const revalidate = 0;

import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";
import SignOutButton from "@/components/admin/SignOutButton";

const TYPE_OPTIONS = [
  { value: "house", label: "House" },
  { value: "condo", label: "Condo" },
  { value: "land", label: "Lot" },
  { value: "commercial", label: "Commercial" },
];

const CATEGORY_OPTIONS = [
  { value: "sale", label: "For sale" },
  { value: "rent", label: "For rent" },
];

const NO_BEDS_TYPES = ["land", "commercial"];

// image | property | reference | price | beds | type | status | actions
const GRID =
  "grid grid-cols-[56px_minmax(0,4fr)_minmax(0,1.2fr)_130px_64px_120px_90px_150px] gap-4";

interface Props {
  searchParams: Promise<{ type?: string; category?: string; q?: string }>;
}

const pick = (v: unknown) => (typeof v === "string" ? v : "");

function listHref(next: { type?: string; category?: string; q?: string }) {
  const p = new URLSearchParams();
  if (next.type) p.set("type", next.type);
  if (next.category) p.set("category", next.category);
  if (next.q) p.set("q", next.q);
  const qs = p.toString();
  return qs ? `/admin/listings?${qs}` : "/admin/listings";
}

function Pill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`text-xs tracking-wider uppercase px-3 py-2 border transition ${
        active
          ? "bg-[#1A1A1A] text-[#faf9f6] border-[#1A1A1A]"
          : "border-[#E2D9C8] text-[#8B7355] hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
      }`}
    >
      {children}
    </Link>
  );
}

function bedsLabel(type: string, beds: number) {
  if (NO_BEDS_TYPES.includes(type)) return "\u2014";
  if (beds === 0 && type === "condo") return "Studio";
  return `${beds} bd`;
}

export default async function AdminListingsPage({ searchParams }: Props) {
  const raw = await searchParams;

  // Only accept known values from the address bar
  const type = TYPE_OPTIONS.some((o) => o.value === pick(raw.type))
    ? pick(raw.type)
    : "";
  const category = CATEGORY_OPTIONS.some((o) => o.value === pick(raw.category))
    ? pick(raw.category)
    : "";
  const q = pick(raw.q).trim().slice(0, 100);

  const where: Prisma.PropertyWhereInput = {};
  if (type) where.type = type;
  if (category) where.listingCategory = category;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { referenceName: { contains: q, mode: "insensitive" } },
      { building: { contains: q, mode: "insensitive" } },
      { barangay: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ];
  }

  const [properties, total] = await Promise.all([
    db.property.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        images: { take: 1, orderBy: { order: "asc" } },
      },
    }),
    db.property.count(),
  ]);

  const filtersActive = Boolean(type || category || q);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2">
              Admin
            </p>
            <h1 className="text-4xl font-bold">Listings</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/blog">
              <button className="border border-[#1A1A1A] text-[#1A1A1A] text-sm tracking-widest uppercase px-6 py-3 hover:bg-[#1A1A1A]/5 transition">
                Blog
              </button>
            </Link>
            <Link href="/admin/listings/new">
              <button className="bg-[#1A1A1A] text-[#faf9f6] text-sm tracking-widest uppercase px-6 py-3 hover:bg-[#C9A96E] transition">
                + New Listing
              </button>
            </Link>
            <SignOutButton />
          </div>
        </div>

        {/* Filters */}
        {total > 0 && (
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs tracking-widest uppercase text-[#8B7355] mr-1">
                  Type
                </span>
                <Pill href={listHref({ category, q })} active={!type}>
                  All
                </Pill>
                {TYPE_OPTIONS.map((o) => (
                  <Pill
                    key={o.value}
                    href={listHref({ type: o.value, category, q })}
                    active={type === o.value}
                  >
                    {o.label}
                  </Pill>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs tracking-widest uppercase text-[#8B7355] mr-1">
                  Listing
                </span>
                <Pill href={listHref({ type, q })} active={!category}>
                  All
                </Pill>
                {CATEGORY_OPTIONS.map((o) => (
                  <Pill
                    key={o.value}
                    href={listHref({ type, category: o.value, q })}
                    active={category === o.value}
                  >
                    {o.label}
                  </Pill>
                ))}
              </div>
            </div>

            <form
              action="/admin/listings"
              method="get"
              className="flex flex-wrap items-center gap-3"
            >
              {type && <input type="hidden" name="type" value={type} />}
              {category && (
                <input type="hidden" name="category" value={category} />
              )}
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search title, building, area, reference..."
                className="w-full max-w-md border border-[#E2D9C8] bg-white px-4 py-2 text-sm focus:outline-none focus:border-[#1A1A1A]"
              />
              <button
                type="submit"
                className="border border-[#1A1A1A] text-[#1A1A1A] text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-[#1A1A1A]/5 transition"
              >
                Search
              </button>
              {filtersActive && (
                <Link
                  href="/admin/listings"
                  className="text-xs text-[#8B7355] hover:text-[#1A1A1A] underline transition"
                >
                  Clear filters
                </Link>
              )}
            </form>
          </div>
        )}

        {/* Table */}
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-[#E2D9C8]">
            <p className="text-[#8B7355] mb-4">No properties yet.</p>
            <Link href="/admin/listings/new">
              <button className="bg-[#1A1A1A] text-[#faf9f6] text-sm tracking-widest uppercase px-6 py-3 hover:bg-[#C9A96E] transition">
                Add First Listing
              </button>
            </Link>
          </div>
        ) : properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-[#E2D9C8]">
            <p className="text-[#8B7355] mb-4">
              No listings match these filters.
            </p>
            <Link
              href="/admin/listings"
              className="text-sm text-[#8B7355] hover:text-[#1A1A1A] underline transition"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="border border-[#E2D9C8] overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* Table Header */}
              <div
                className={`${GRID} px-6 py-4 bg-[#1A1A1A] text-[#faf9f6] text-xs tracking-widest uppercase`}
              >
                <div>Image</div>
                <div>Property</div>
                <div>Reference</div>
                <div>Price</div>
                <div>Beds</div>
                <div>Type</div>
                <div>Status</div>
                <div>Actions</div>
              </div>

              {/* Table Rows */}
              {properties.map((property, index) => {
                const location = [
                  property.building?.trim(),
                  property.barangay?.trim(),
                  property.city,
                  property.state,
                ]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <div
                    key={property.id}
                    className={`${GRID} px-6 py-4 items-center border-b border-[#E2D9C8] hover:bg-[#EDE8DF] transition ${
                      index % 2 === 0 ? "bg-[#faf9f6]" : "bg-[#FAF7F2]"
                    }`}
                  >
                    {/* Image */}
                    <div>
                      <div className="w-12 h-12 overflow-hidden">
                        {property.images[0] ? (
                          <img
                            src={property.images[0].url}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#E2D9C8] flex items-center justify-center text-[#8B7355] text-xs">
                            No img
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Title & Location (full title, wraps onto more lines) */}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm leading-snug break-words">
                        {property.title}
                      </p>
                      <p className="text-[#8B7355] text-xs mt-1 break-words">
                        {location}
                      </p>
                    </div>

                    {/* Reference (listing owner) */}
                    <div className="min-w-0">
                      <p
                        className="text-xs text-[#8B7355] break-words"
                        title={property.referenceName ?? ""}
                      >
                        {property.referenceName || "\u2014"}
                      </p>
                    </div>

                    {/* Price */}
                    <div>
                      <p className="text-sm font-semibold text-[#C9A96E]">
                        {"\u20B1"}
                        {property.price.toLocaleString()}
                        {property.listingCategory === "rent" && (
                          <span className="text-xs font-normal text-[#8B7355]">
                            /mo
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Beds */}
                    <div>
                      <p className="text-sm">
                        {bedsLabel(property.type, property.beds)}
                      </p>
                    </div>

                    {/* Type + For sale / For rent */}
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-xs tracking-wider uppercase bg-[#E2D9C8] text-[#1A1A1A] px-2 py-1">
                        {property.type}
                      </span>
                      <span
                        className={`text-[10px] tracking-wider uppercase border px-2 py-0.5 ${
                          property.listingCategory === "rent"
                            ? "border-[#8B7355] text-[#8B7355]"
                            : "border-[#C9A96E] text-[#C9A96E]"
                        }`}
                      >
                        {property.listingCategory === "rent"
                          ? "For rent"
                          : "For sale"}
                      </span>
                    </div>

                    {/* Status */}
                    <div>
                      <span
                        className={`text-xs tracking-wider uppercase px-2 py-1 ${
                          property.status === "active"
                            ? "bg-green-100 text-green-700"
                            : property.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {property.status}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/property/${property.slug}`}
                        target="_blank"
                        className="text-xs text-[#8B7355] hover:text-[#1A1A1A] transition underline"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/listings/${property.id}/edit`}
                        className="text-xs text-[#8B7355] hover:text-[#1A1A1A] transition underline"
                      >
                        Edit
                      </Link>
                      <DeleteButton propertyId={property.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary */}
        {total > 0 && (
          <p className="text-[#8B7355] text-sm mt-6">
            {filtersActive
              ? `Showing ${properties.length} of ${total} ${total === 1 ? "property" : "properties"}`
              : `${total} ${total === 1 ? "property" : "properties"} total`}
          </p>
        )}
      </div>
    </div>
  );
}
