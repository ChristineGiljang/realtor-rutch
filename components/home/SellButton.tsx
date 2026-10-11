"use client";

import Link from "next/link";
import { sendGAEvent } from "@next/third-parties/google";

export default function SellButton() {
  return (
    <Link
      href="/contact?intent=seller"
      onClick={() =>
        sendGAEvent("event", "sell_click", {
          location: "hero",
        })
      }
      className="bg-[#C9A96E] text-[#1A1A1A] px-8 py-4 text-sm tracking-wider uppercase font-semibold hover:bg-[#faf9f6] transition"
    >
      Sell Your Property
    </Link>
  );
}
