"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const email = form.email.value;
    const password = form.password.value;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push("/admin/listings");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-3">
            Admin
          </p>
          <h1 className="text-4xl font-bold text-[#1A1A1A]">Sign In</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-2">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="admin@yourdomain.com"
              className="w-full bg-white border border-[#E2D9C8] text-[#1A1A1A] text-sm px-4 py-3 focus:outline-none focus:border-[#C9A96E] placeholder:text-[#8B7355]"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-2">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-white border border-[#E2D9C8] text-[#1A1A1A] text-sm px-4 py-3 focus:outline-none focus:border-[#C9A96E] placeholder:text-[#8B7355]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1A1A] text-[#F5F0E8] text-sm tracking-widest uppercase py-4 font-semibold hover:bg-[#C9A96E] transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
