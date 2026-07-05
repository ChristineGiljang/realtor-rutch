"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="text-xs tracking-widest uppercase text-[#8B7355] hover:text-[#1A1A1A] transition"
    >
      Sign Out
    </button>
  );
}
