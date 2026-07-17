"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";

export default function PropertyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [compressing, setCompressing] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setCompressing(true);

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFiles = await Promise.all(
        files.map((file) => imageCompression(file, options)),
      );
      setImages(compressedFiles);
      const urls = compressedFiles.map((f) => URL.createObjectURL(f));
      setPreviews(urls);
    } catch (err) {
      console.error("Compression error:", err);
      setImages(files);
      const urls = files.map((f) => URL.createObjectURL(f));
      setPreviews(urls);
    } finally {
      setCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    images.forEach((img) => formData.append("images", img));

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
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
        <h2 className="text-lg font-semibold mb-6 pb-2 border-b border-[#E2D9C8] text-[#1A1A1A]">
          Basic Info
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className={labelClass}>Title *</label>
            <input
              name="title"
              required
              placeholder="Modern Beverly Hills Estate"
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Description *</label>
            <textarea
              name="description"
              required
              rows={4}
              placeholder="Property description..."
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Features</label>
            <textarea
              name="features"
              rows={6}
              placeholder={`1 Master Bedroom with Toilet and Bath\n2 Bedrooms with split type aircon\n1 Guest Room\n2 Toilet and Bath\nLiving Room\nKitchen\n2 Car Garage`}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Payment Terms</label>
            <textarea
              name="paymentTerms"
              rows={5}
              placeholder={`Selling Price: ₱14,500,000\nReservation: ₱100,000 (Non Refundable)\n20% Downpayment (Cash or Payable within 6 months)\n80% Cash or Loanable to Bank`}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Price *</label>
            <input
              name="price"
              type="number"
              required
              placeholder="4500000"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Type *</label>
            <select name="type" required className={inputClass}>
              <option value="">Select type</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="land">Land</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Listing Category *</label>
            <select name="listingCategory" required className={inputClass}>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Status *</label>
            <select name="status" required className={inputClass}>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>
      </section>

      {/* Location */}
      <section>
        <h2 className="text-lg font-semibold mb-6 pb-2 border-b border-[#E2D9C8] text-[#1A1A1A]">
          Location
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className={labelClass}>Address *</label>
            <input
              name="address"
              required
              placeholder="123 Sunset Blvd"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>City *</label>
            <input
              name="city"
              required
              placeholder="Beverly Hills"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>ZIP *</label>
            <input
              name="zip"
              required
              placeholder="90210"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Latitude (optional)</label>
            <input
              name="lat"
              type="number"
              step="any"
              placeholder="34.0736"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Longitude (optional)</label>
            <input
              name="lng"
              type="number"
              step="any"
              placeholder="-118.4004"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Details */}
      <section>
        <h2 className="text-lg font-semibold mb-6 pb-2 border-b border-[#E2D9C8] text-[#1A1A1A]">
          Property Details
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <label className={labelClass}>Beds *</label>
            <input
              name="beds"
              type="number"
              required
              placeholder="4"
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
              placeholder="3.5"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Sqm *</label>
            <input
              name="sqft"
              type="number"
              required
              placeholder="3200"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Lot Size (sqm)</label>
            <input
              name="lotSize"
              type="number"
              step="any"
              placeholder="8000"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Garage (cars)</label>
            <input
              name="garage"
              type="number"
              placeholder="2"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Year Built</label>
            <input
              name="yearBuilt"
              type="number"
              placeholder="2018"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Flags */}
      <section>
        <h2 className="text-lg font-semibold mb-6 pb-2 border-b border-[#E2D9C8] text-[#1A1A1A]">
          Flags
        </h2>
        <div className="flex gap-8">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              name="featured"
              type="checkbox"
              value="true"
              className="w-4 h-4 accent-[#C9A96E]"
            />
            <span className="text-sm text-[#1A1A1A]">Featured Listing</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              name="luxury"
              type="checkbox"
              value="true"
              className="w-4 h-4 accent-[#C9A96E]"
            />
            <span className="text-sm text-[#1A1A1A]">Luxury Property</span>
          </label>
        </div>
      </section>

      {/* Images */}
      <section>
        <h2 className="text-lg font-semibold mb-6 pb-2 border-b border-[#E2D9C8] text-[#1A1A1A]">
          Images
        </h2>
        <div>
          <label className={labelClass}>Upload Photos</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full text-sm text-[#8B7355] file:mr-4 file:py-2 file:px-4 file:border file:border-[#E2D9C8] file:bg-white file:text-[#1A1A1A] file:text-sm file:cursor-pointer hover:file:bg-[#F5F0E8]"
          />
          {compressing && (
            <p className="text-[#8B7355] text-sm mt-2">
              Compressing images, please wait...
            </p>
          )}
        </div>

        {previews.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-6">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden">
                <img
                  src={src}
                  alt={`Preview ${i + 1}`}
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
          disabled={loading || compressing}
          className="bg-[#1A1A1A] text-[#F5F0E8] text-sm tracking-widest uppercase px-8 py-4 font-semibold hover:bg-[#C9A96E] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Create Listing"}
        </button>
        {loading && (
          <p className="text-[#8B7355] text-sm">
            Uploading images, please wait...
          </p>
        )}
      </div>
    </form>
  );
}
