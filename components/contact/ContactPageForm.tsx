"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";

const VALID_INTENTS = ["buyer", "seller", "both"];

export default function ContactPageForm() {
  const searchParams = useSearchParams();
  const intentParam = searchParams.get("intent");

  const [intent, setIntent] = useState(
    intentParam && VALID_INTENTS.includes(intentParam) ? intentParam : "buyer",
  );
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const isSeller = intent === "seller";

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

      sendGAEvent("event", "form_submit", {
        form_type: "general_contact",
        intent: body.intent,
        timeline: body.timeline,
      });

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
      <h3 className="text-xl font-bold mb-2">
        {isSeller ? "Sell Your Property" : "Send a Message"}
      </h3>
      <p className="text-[#8B7355] text-sm mb-8">
        {isSeller
          ? "Tell me about your property and I'll get back to you with next steps."
          : "Fill out the form below and I'll be in touch shortly."}
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
              placeholder="+63 9XX XXX XXXX"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>I am a</label>
            <select
              name="intent"
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              className={inputClass}
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="both">Buyer & Seller</option>
            </select>
          </div>
        </div>

        {!isSeller && (
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
        )}

        <div>
          <label className={labelClass}>
            {isSeller ? "When do you want to sell?" : "Timeline"}
          </label>
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
          <label className={labelClass}>
            {isSeller ? "Property Details" : "Message"}
          </label>
          <textarea
            name="message"
            rows={5}
            placeholder={
              isSeller
                ? "Property type, location, lot/floor area, asking price, title status..."
                : "Tell me about what you're looking for..."
            }
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1A1A1A] text-[#faf9f6] text-sm tracking-widest uppercase py-4 font-semibold hover:bg-[#C9A96E] transition disabled:opacity-50"
        >
          {loading
            ? "Sending..."
            : isSeller
              ? "Submit Property"
              : "Send Message"}
        </button>
      </form>
    </div>
  );
}
