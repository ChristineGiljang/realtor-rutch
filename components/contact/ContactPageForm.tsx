"use client";

import { useState } from "react";

export default function ContactPageForm() {
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
      budgetMin: formData.get("budgetMin")
        ? parseFloat(formData.get("budgetMin") as string)
        : null,
      budgetMax: formData.get("budgetMax")
        ? parseFloat(formData.get("budgetMax") as string)
        : null,
      timeline: formData.get("timeline"),
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to send message");
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
      <div className="border border-[#E2D9C8] bg-white p-12 text-center">
        <p className="text-4xl mb-4 text-[#C9A96E]">✓</p>
        <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
        <p className="text-[#8B7355]">
          Thank you for reaching out. I'll get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[#E2D9C8] bg-white p-8">
      <h3 className="text-xl font-bold mb-2">Send a Message</h3>
      <p className="text-[#8B7355] text-sm mb-8">
        Fill out the form below and I'll be in touch shortly.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              <option value="both">Buyer & Seller</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Budget Min</label>
            <input
              name="budgetMin"
              type="number"
              placeholder="500000"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Budget Max</label>
            <input
              name="budgetMax"
              type="number"
              placeholder="2000000"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Timeline</label>
          <select name="timeline" className={inputClass}>
            <option value="">Select timeline</option>
            <option value="asap">As soon as possible</option>
            <option value="1-3months">1 – 3 months</option>
            <option value="3-6months">3 – 6 months</option>
            <option value="6-12months">6 – 12 months</option>
            <option value="exploring">Just exploring</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Message</label>
          <textarea
            name="message"
            rows={5}
            placeholder="Tell me about what you're looking for..."
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1A1A1A] text-[#F5F0E8] text-sm tracking-widest uppercase py-4 font-semibold hover:bg-[#C9A96E] transition disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
