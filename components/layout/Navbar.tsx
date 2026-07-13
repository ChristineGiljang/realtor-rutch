"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#F5F0E8]/95 backdrop-blur-sm border-b border-[#E2D9C8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/images/logo.svg"
              alt="Realtor Rutch - Cebu Real Estate"
              width={380}
              height={100}
              priority
              className="h-14 w-auto"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/listings"
              className="text-[#8B7355] hover:text-[#1A1A1A] text-sm tracking-wider uppercase transition"
            >
              Listings
            </Link>
            <Link
              href="/sold"
              className="text-[#8B7355] hover:text-[#1A1A1A] text-sm tracking-wider uppercase transition"
            >
              Sold
            </Link>
            <Link
              href="/about"
              className="text-[#8B7355] hover:text-[#1A1A1A] text-sm tracking-wider uppercase transition"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-[#8B7355] hover:text-[#1A1A1A] text-sm tracking-wider uppercase transition"
            >
              Contact
            </Link>

            <a
              href="tel:+639817413929"
              className="flex items-center gap-2 bg-[#1A1A1A] text-[#F5F0E8] px-4 py-2 text-sm tracking-wider uppercase font-semibold hover:bg-[#C9A96E] transition"
            >
              <Phone size={14} />
              <span>+639817413929</span>
            </a>
          </div>

          <button
            className="md:hidden text-[#1A1A1A]"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#F5F0E8] border-t border-[#E2D9C8]">
          <div className="flex flex-col px-4 py-6 gap-6">
            <Link
              href="/listings"
              className="text-[#8B7355] hover:text-[#1A1A1A] text-sm tracking-wider uppercase"
              onClick={() => setIsOpen(false)}
            >
              Listings
            </Link>
            <Link
              href="/sold"
              className="text-[#8B7355] hover:text-[#1A1A1A] text-sm tracking-wider uppercase"
              onClick={() => setIsOpen(false)}
            >
              Sold
            </Link>
            <Link
              href="/about"
              className="text-[#8B7355] hover:text-[#1A1A1A] text-sm tracking-wider uppercase"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-[#8B7355] hover:text-[#1A1A1A] text-sm tracking-wider uppercase"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            <a
              href="tel:+639817413929"
              className="text-[#8B7355] hover:text-[#1A1A1A] text-sm tracking-wider uppercase"
            >
              +639817413929
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
