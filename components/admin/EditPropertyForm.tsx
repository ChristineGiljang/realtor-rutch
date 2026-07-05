"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Image {
  id: string;
  url: string;
  alt: string | null;
  order: number;
}

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  beds: number;
  baths: number;
  sqft: number;
  lotSize: number | null;
  garage: number | null;
  yearBuilt: number | null;
  type: string;
  status: string;
  featured: boolean;
  luxury: boolean;
  listingCategory: string;
  features: string | null;
  paymentTerms: string | null;
  lat: number | null;
  lng: number | null;
  slug: string;
  images: Image[];
}

interface Props {
  property: Property;
}

export default function EditPropertyForm({ property }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<Image[]>(
    property.images,
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages(files);
    setNewPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Remove this image?")) return;
    await fetch(`/api/properties/images/${imageId}`, { method: "DELETE" });
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    newImages.forEach((img) => formData.append("images", img));

    try {
      const res = await fetch(`/api/properties/${property.id}`, {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      router.push("/admin/listings");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-white border border-[#E2D9C8] text-[#1A1A1A] text-sm px-4 py-3 focus:outline-none focus:border-[#C9A96E] placeholder:text-[#8B7355]";
  const labelClass =
    "block text-xs tracking-widest uppercase text-[#8B7355] mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <section>
        <h2 className="text-lg font-semibold mb-6 pb-2 border-b border-[#E2D9C8]">
          Basic Info
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className={labelClass}>Title *</label>
            <input
              name="title"
              required
              defaultValue={property.title}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Description *</label>
            <textarea
              name="description"
              required
              rows={4}
              defaultValue={property.description}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Features</label>
            <textarea
              name="features"
              rows={6}
              defaultValue={property.features ?? ""}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Payment Terms</label>
            <textarea
              name="paymentTerms"
              rows={5}
              defaultValue={property.paymentTerms ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Listing Category *</label>
            <select
              name="listingCategory"
              required
              defaultValue={property.listingCategory}
              className={inputClass}
            >
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Price *</label>
            <input
              name="price"
              type="number"
              required
              defaultValue={property.price}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Type *</label>
            <select
              name="type"
              required
              defaultValue={property.type}
              className={inputClass}
            >
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="land">Land</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Status *</label>
            <select
              name="status"
              required
              defaultValue={property.status}
              className={inputClass}
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>
      </section>

      {/* Location */}
      <section>
        <h2 className="text-lg font-semibold mb-6 pb-2 border-b border-[#E2D9C8]">
          Location
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className={labelClass}>Address *</label>
            <input
              name="address"
              required
              defaultValue={property.address}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>City *</label>
            <input
              name="city"
              required
              defaultValue={property.city}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>ZIP *</label>
            <input
              name="zip"
              required
              defaultValue={property.zip}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Latitude</label>
            <input
              name="lat"
              type="number"
              step="any"
              defaultValue={property.lat ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Longitude</label>
            <input
              name="lng"
              type="number"
              step="any"
              defaultValue={property.lng ?? ""}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Details */}
      <section>
        <h2 className="text-lg font-semibold mb-6 pb-2 border-b border-[#E2D9C8]">
          Property Details
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <label className={labelClass}>Beds *</label>
            <input
              name="beds"
              type="number"
              required
              defaultValue={property.beds}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Baths *</label>
            <input
              name="baths"
              type="number"
              step="0.5"
              required
              defaultValue={property.baths}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Sqft *</label>
            <input
              name="sqft"
              type="number"
              required
              defaultValue={property.sqft}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Lot Size</label>
            <input
              name="lotSize"
              type="number"
              step="any"
              defaultValue={property.lotSize ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Garage</label>
            <input
              name="garage"
              type="number"
              defaultValue={property.garage ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Year Built</label>
            <input
              name="yearBuilt"
              type="number"
              defaultValue={property.yearBuilt ?? ""}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Flags */}
      <section>
        <h2 className="text-lg font-semibold mb-6 pb-2 border-b border-[#E2D9C8]">
          Flags
        </h2>
        <div className="flex gap-8">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              name="featured"
              type="checkbox"
              value="true"
              defaultChecked={property.featured}
              className="w-4 h-4 accent-[#C9A96E]"
            />
            <span className="text-sm text-[#1A1A1A]">Featured Listing</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              name="luxury"
              type="checkbox"
              value="true"
              defaultChecked={property.luxury}
              className="w-4 h-4 accent-[#C9A96E]"
            />
            <span className="text-sm text-[#1A1A1A]">Luxury Property</span>
          </label>
        </div>
      </section>

      {/* Existing Images */}
      <section>
        <h2 className="text-lg font-semibold mb-6 pb-2 border-b border-[#E2D9C8]">
          Current Images
        </h2>
        {existingImages.length === 0 ? (
          <p className="text-[#8B7355] text-sm">No images uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {existingImages.map((img) => (
              <div
                key={img.id}
                className="relative group aspect-square overflow-hidden"
              >
                <img
                  src={img.url}
                  alt={img.alt || ""}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* New Images */}
      <section>
        <h2 className="text-lg font-semibold mb-6 pb-2 border-b border-[#E2D9C8]">
          Add New Images
        </h2>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="w-full text-sm text-[#8B7355] file:mr-4 file:py-2 file:px-4 file:border file:border-[#E2D9C8] file:bg-white file:text-[#1A1A1A] file:text-sm file:cursor-pointer hover:file:bg-[#F5F0E8]"
        />
        {newPreviews.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-6">
            {newPreviews.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden">
                <img
                  src={src}
                  alt={`New ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Submit */}
      <div className="flex items-center gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#1A1A1A] text-[#F5F0E8] text-sm tracking-widest uppercase px-8 py-4 font-semibold hover:bg-[#C9A96E] transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/listings")}
          className="text-sm text-[#8B7355] hover:text-[#1A1A1A] transition underline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
