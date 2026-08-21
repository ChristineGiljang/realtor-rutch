"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

type DropdownItem = { label: string; href: string };

const propertiesItems: DropdownItem[] = [
  { label: "For Sale", href: "/listings?category=sale" },
  { label: "For Rent", href: "/listings?category=rent" },
  { label: "Project Selling", href: "/listings?subtype=preselling" },
];

function DesktopDropdown({
  label,
  href,
  items,
}: {
  label: string;
  href: string;
  items: DropdownItem[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={href}
        className="flex items-center gap-1 text-[#6B5842] hover:text-[#1A1A1A] text-sm tracking-wider uppercase transition"
      >
        {label}
      </Link>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Toggle ${label} submenu`}
        className="text-[#6B5842] hover:text-[#1A1A1A] transition p-1 -ml-1"
      >
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 pt-3 z-50">
          <div className="bg-white border border-[#E2D9C8] shadow-lg py-2 min-w-[220px]">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-sm text-[#6B5842] hover:text-[#1A1A1A] hover:bg-[#F5F0E8] transition whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileDropdown({
  label,
  href,
  items,
  onNavigate,
}: {
  label: string;
  href: string;
  items: DropdownItem[];
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between w-full">
        <Link
          href={href}
          className="text-[#6B5842] hover:text-[#1A1A1A] text-sm tracking-wider uppercase"
          onClick={onNavigate}
        >
          {label}
        </Link>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={`Toggle ${label} submenu`}
          className="text-[#6B5842] hover:text-[#1A1A1A] p-1"
        >
          <ChevronDown
            size={16}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {open && (
        <div className="mt-4 ml-4 flex flex-col gap-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[#6B5842]/80 hover:text-[#1A1A1A] text-sm tracking-wider uppercase"
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-[#F5F0E8]/95 backdrop-blur-sm border-b border-[#E2D9C8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="favicon_vvtfxk.png"
              alt="Realtor Rutch"
              width={40}
              height={40}
              priority
              className="h-10 w-10 object-contain"
            />
            <div>
              <p
                className="text-[#1A1A1A] font-bold text-xl leading-tight"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Realtor Rutch
              </p>
              <p
                className="text-[#6B5842] text-xs tracking-[0.3em] uppercase"
                style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
              >
                Cebu Real Estate
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <DesktopDropdown
              label="Properties"
              href="/listings"
              items={propertiesItems}
            />
            <Link
              href="/blog"
              className="text-[#6B5842] hover:text-[#1A1A1A] text-sm tracking-wider uppercase transition"
            >
              Blogs
            </Link>
            <Link
              href="/about"
              className="text-[#6B5842] hover:text-[#1A1A1A] text-sm tracking-wider uppercase transition"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-[#6B5842] hover:text-[#1A1A1A] text-sm tracking-wider uppercase transition"
            >
              Contact
            </Link>
          </div>

          <button
            className="md:hidden text-[#1A1A1A]"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#F5F0E8] border-t border-[#E2D9C8]">
          <div className="flex flex-col px-4 py-6 gap-6">
            <MobileDropdown
              label="Properties"
              href="/listings"
              items={propertiesItems}
              onNavigate={() => setIsOpen(false)}
            />
            <Link
              href="/blog"
              className="text-[#6B5842] hover:text-[#1A1A1A] text-sm tracking-wider uppercase"
              onClick={() => setIsOpen(false)}
            >
              Blogs
            </Link>
            <Link
              href="/about"
              className="text-[#6B5842] hover:text-[#1A1A1A] text-sm tracking-wider uppercase"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-[#6B5842] hover:text-[#1A1A1A] text-sm tracking-wider uppercase"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
