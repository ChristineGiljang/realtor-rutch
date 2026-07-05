import { db } from "@/lib/db";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";
import SignOutButton from "@/components/admin/SignOutButton";

export default async function AdminListingsPage() {
  const properties = await db.property.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      images: { take: 1, orderBy: { order: "asc" } },
    },
  });

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2">
              Admin
            </p>
            <h1 className="text-4xl font-bold">Listings</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/listings/new">
              <button className="bg-[#1A1A1A] text-[#F5F0E8] text-sm tracking-widest uppercase px-6 py-3 hover:bg-[#C9A96E] transition">
                + New Listing
              </button>
            </Link>
            <SignOutButton />
          </div>
        </div>

        {/* Table */}
        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-[#E2D9C8]">
            <p className="text-[#8B7355] mb-4">No properties yet.</p>
            <Link href="/admin/listings/new">
              <button className="bg-[#1A1A1A] text-[#F5F0E8] text-sm tracking-widest uppercase px-6 py-3 hover:bg-[#C9A96E] transition">
                Add First Listing
              </button>
            </Link>
          </div>
        ) : (
          <div className="border border-[#E2D9C8] overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#1A1A1A] text-[#F5F0E8] text-xs tracking-widest uppercase">
              <div className="col-span-1">Image</div>
              <div className="col-span-4">Property</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-1">Beds</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2">Actions</div>
            </div>

            {/* Table Rows */}
            {properties.map((property, index) => (
              <div
                key={property.id}
                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-[#E2D9C8] hover:bg-[#EDE8DF] transition ${
                  index % 2 === 0 ? "bg-[#F5F0E8]" : "bg-[#FAF7F2]"
                }`}
              >
                {/* Image */}
                <div className="col-span-1">
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

                {/* Title & Location */}
                <div className="col-span-4">
                  <p className="font-semibold text-sm truncate">
                    {property.title}
                  </p>
                  <p className="text-[#8B7355] text-xs mt-1">
                    {property.city}, {property.state}
                  </p>
                </div>

                {/* Price */}
                <div className="col-span-2">
                  <p className="text-sm font-semibold text-[#C9A96E]">
                    ₱{property.price.toLocaleString()}
                  </p>
                </div>

                {/* Beds */}
                <div className="col-span-1">
                  <p className="text-sm">{property.beds} bd</p>
                </div>

                {/* Type */}
                <div className="col-span-1">
                  <span className="text-xs tracking-wider uppercase bg-[#E2D9C8] text-[#1A1A1A] px-2 py-1">
                    {property.type}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-1">
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
                <div className="col-span-2 flex items-center gap-3">
                  <Link
                    href={`/listings/${property.slug}`}
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
            ))}
          </div>
        )}

        {/* Summary */}
        <p className="text-[#8B7355] text-sm mt-6">
          {properties.length}{" "}
          {properties.length === 1 ? "property" : "properties"} total
        </p>
      </div>
    </div>
  );
}
