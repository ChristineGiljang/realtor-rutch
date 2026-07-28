"use client";

import { sendGAEvent } from "@next/third-parties/google";

export function PhoneLink() {
  return (
    <a
      href="tel:+639817413929"
      onClick={() =>
        sendGAEvent("event", "phone_click", {
          location: "contact_page",
        })
      }
      className="text-[#1A1A1A] font-semibold hover:text-[#C9A96E] transition"
    >
      +639817413929
    </a>
  );
}

export function EmailLink() {
  return (
    <a
      href="mailto:rldreamspaces@gmail.com"
      onClick={() =>
        sendGAEvent("event", "email_click", {
          location: "contact_page",
        })
      }
      className="text-[#1A1A1A] font-semibold hover:text-[#C9A96E] transition"
    >
      rldreamspaces@gmail.com
    </a>
  );
}
