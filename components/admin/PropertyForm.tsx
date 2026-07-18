"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";

export default function PropertyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [compressing, setCompressing] = useState(false);
  const [parsed, setParsed] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);
  const bedsRef = useRef<HTMLInputElement>(null);
  const bathsRef = useRef<HTMLInputElement>(null);
  const sqmRef = useRef<HTMLInputElement>(null);
  const lotRef = useRef<HTMLInputElement>(null);
  const garageRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const featuresRef = useRef<HTMLTextAreaElement>(null);
  const paymentRef = useRef<HTMLTextAreaElement>(null);

  const parseTemplate = (text: string) => {
    const lines = text.split("\n");
    const data: Record<string, string> = {};
    let currentKey = "";
    let multilineValue = "";

    for (const line of lines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) {
        if (currentKey) multilineValue += (multilineValue ? "\n" : "") + line;
        continue;
      }

      const key = line.substring(0, colonIndex).trim().toUpperCase();

      if (
        [
          "TITLE",
          "PRICE",
          "TYPE",
          "CATEGORY",
          "STATUS",
          "ADDRESS",
          "CITY",
          "ZIP",
          "BEDS",
          "BATHS",
          "SQM",
          "LOT",
          "GARAGE",
          "YEAR",
        ].includes(key)
      ) {
        if (currentKey) data[currentKey] = multilineValue.trim();
        currentKey = key;
        multilineValue = line.substring(colonIndex + 1).trim();
      } else if (["DESCRIPTION", "FEATURES", "PAYMENT"].includes(key)) {
        if (currentKey) data[currentKey] = multilineValue.trim();
        currentKey = key;
        multilineValue = "";
      } else if (currentKey) {
        multilineValue += (multilineValue ? "\n" : "") + line;
      }
    }
    if (currentKey) data[currentKey] = multilineValue.trim();

    if (titleRef.current && data.TITLE) titleRef.current.value = data.TITLE;
    if (priceRef.current && data.PRICE)
      priceRef.current.value = data.PRICE.replace(/[^0-9.]/g, "");
    if (typeRef.current && data.TYPE)
      typeRef.current.value = data.TYPE.toLowerCase();
    if (categoryRef.current && data.CATEGORY)
      categoryRef.current.value = data.CATEGORY.toLowerCase();
    if (statusRef.current && data.STATUS)
      statusRef.current.value = data.STATUS.toLowerCase();
    if (addressRef.current && data.ADDRESS)
      addressRef.current.value = data.ADDRESS;
    if (cityRef.current && data.CITY) cityRef.current.value = data.CITY;
    if (zipRef.current && data.ZIP) zipRef.current.value = data.ZIP;
    if (bedsRef.current && data.BEDS) bedsRef.current.value = data.BEDS;
    if (bathsRef.current && data.BATHS) bathsRef.current.value = data.BATHS;
    if (sqmRef.current && data.SQM) sqmRef.current.value = data.SQM;
    if (lotRef.current && data.LOT) lotRef.current.value = data.LOT;
    if (garageRef.current && data.GARAGE) garageRef.current.value = data.GARAGE;
    if (yearRef.current && data.YEAR) yearRef.current.value = data.YEAR;
    if (descriptionRef.current && data.DESCRIPTION)
      descriptionRef.current.value = data.DESCRIPTION;
    if (featuresRef.current && data.FEATURES)
      featuresRef.current.value = data.FEATURES;
    if (paymentRef.current && data.PAYMENT)
      paymentRef.current.value = data.PAYMENT;

    setParsed(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseTemplate(text);
    };
    reader.readAsText(file);
  };

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

      {/* Upload from Notepad */}
      <section className="bg-white border border-[#E2D9C8] p-6">
        <h2 className="text-lg font-semibold mb-2 text-[#1A1A1A]">
          Upload from Notepad
        </h2>
        <p className="text-[#8B7355] text-sm mb-4">
          Upload a .txt file to auto-fill the form instantly.
        </p>
        <input
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          className="w-full text-sm text-[#8B7355] file:mr-4 file:py-2 file:px-4 file:border file:border-[#E2D9C8] file:bg-[#1A1A1A] file:text-[#F5F0E8] file:text-sm file:cursor-pointer hover:file:bg-[#C9A96E] file:transition"
        />
        {parsed && (
          <p className="text-green-600 text-sm mt-3">
            ✓ Form filled successfully! Review the fields below, upload images,
            then save.
          </p>
        )}

        <details className="mt-4">
          <summary className="text-xs tracking-widest uppercase text-[#C9A96E] cursor-pointer">
            View Template Format
          </summary>
          <pre className="bg-[#F5F0E8] p-4 text-xs text-[#8B7355] leading-relaxed overflow-x-auto mt-2 whitespace-pre-wrap">{`TITLE: Property Title Here
PRICE: 5000000
TYPE: house
CATEGORY: sale
STATUS: active
ADDRESS: 123 Street, Subdivision
CITY: Cebu City
ZIP: 6000
BEDS: 3
BATHS: 2
SQM: 120
LOT: 150
GARAGE: 1
YEAR: 2020
DESCRIPTION:
Write your description here...
FEATURES:
3 Bedrooms
2 Bathrooms
Living Room
Kitchen
PAYMENT:
Reservation: 50000
20% Downpayment
80% Loanable`}</pre>
        </details>
      </section>

      {/* Basic Info */}
      <section>
        <h2 className="text-lg font-semibold mb-6 pb-2 border-b border-[#E2D9C8] text-[#1A1A1A]">
          Basic Info
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className={labelClass}>Title *</label>
            <input
              ref={titleRef}
              name="title"
              required
              placeholder="Property Title"
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Description *</label>
            <textarea
              ref={descriptionRef}
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
              ref={featuresRef}
              name="features"
              rows={6}
              placeholder={`3 Bedrooms\n2 Bathrooms\nLiving Room`}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Payment Terms</label>
            <textarea
              ref={paymentRef}
              name="paymentTerms"
              rows={5}
              placeholder={`Reservation: 50,000\n20% Downpayment\n80% Loanable`}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Price *</label>
            <input
              ref={priceRef}
              name="price"
              type="number"
              required
              placeholder="5000000"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Type *</label>
            <select ref={typeRef} name="type" required className={inputClass}>
              <option value="">Select type</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="land">Land</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Listing Category *</label>
            <select
              ref={categoryRef}
              name="listingCategory"
              required
              className={inputClass}
            >
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Status *</label>
            <select
              ref={statusRef}
              name="status"
              required
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
        <h2 className="text-lg font-semibold mb-6 pb-2 border-b border-[#E2D9C8] text-[#1A1A1A]">
          Location
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className={labelClass}>Address *</label>
            <input
              ref={addressRef}
              name="address"
              required
              placeholder="123 Street, Subdivision"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>City *</label>
            <input
              ref={cityRef}
              name="city"
              required
              placeholder="Cebu City"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>ZIP *</label>
            <input
              ref={zipRef}
              name="zip"
              required
              placeholder="6000"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Latitude (optional)</label>
            <input
              name="lat"
              type="number"
              step="any"
              placeholder="10.3157"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Longitude (optional)</label>
            <input
              name="lng"
              type="number"
              step="any"
              placeholder="123.8854"
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
              ref={bedsRef}
              name="beds"
              type="number"
              required
              placeholder="3"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Baths *</label>
            <input
              ref={bathsRef}
              name="baths"
              type="number"
              step="0.5"
              required
              placeholder="2"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Sqm *</label>
            <input
              ref={sqmRef}
              name="sqft"
              type="number"
              required
              placeholder="120"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Lot Size (sqm)</label>
            <input
              ref={lotRef}
              name="lotSize"
              type="number"
              step="any"
              placeholder="150"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Garage (cars)</label>
            <input
              ref={garageRef}
              name="garage"
              type="number"
              placeholder="1"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Year Built</label>
            <input
              ref={yearRef}
              name="yearBuilt"
              type="number"
              placeholder="2020"
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
