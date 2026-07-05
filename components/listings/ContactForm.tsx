"use client";

import { useState } from "react";

interface Props {
  propertyId: string;
  propertyTitle: string;
}

export default function ContactForm({ propertyId, propertyTitle }: Props) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const body = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      message: formData.get("message"),
      intent: formData.get("intent"),
      propertyId,
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to send inquiry");
      setSubmitted(true);
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

  if (submitted) {
    return (
      <div className="border border-[#E2D9C8] bg-white p-8 text-center">
        <p className="text-3xl mb-2 text-[#C9A96E]">✓</p>
        <p className="font-semibold mb-2 text-[#1A1A1A]">Inquiry Sent!</p>
        <p className="text-[#8B7355] text-sm">
          We'll be in touch shortly regarding {propertyTitle}.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[#E2D9C8] bg-white p-8">
      <h3 className="text-lg font-semibold mb-1 text-[#1A1A1A]">
        Interested in this property?
      </h3>
      <p className="text-[#8B7355] text-sm mb-8">
        Fill out the form and we'll get back to you shortly.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className={labelClass}>Name *</label>
          <input
            name="name"
            required
            placeholder="John Smith"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Email *</label>
          <input
            name="email"
            type="email"
            required
            placeholder="john@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Phone</label>
          <input
            name="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>I am a</label>
          <select name="intent" className={inputClass}>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="both">Both</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Message</label>
          <textarea
            name="message"
            rows={4}
            placeholder={`I'm interested in ${propertyTitle}...`}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1A1A1A] text-[#F5F0E8] text-sm tracking-widest uppercase py-4 font-semibold hover:bg-[#C9A96E] transition disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Inquiry"}
        </button>
      </form>
    </div>
  );
}
