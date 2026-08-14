"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

type DropdownItem = { label: string; href: string };

const houseLotItems: DropdownItem[] = [
  {
    label: "Preselling House and Lot",
    href: "/listings?type=house&subtype=preselling",
  },
  { label: "RFO - House and Lot", href: "/listings?type=house&subtype=rfo" },
  { label: "Rent to Own", href: "/listings?type=house&subtype=rent-to-own" },
  {
    label: "RFO Subdivision",
    href: "/listings?type=house&subtype=rfo-subdivision",
  },
  { label: "Lot only", href: "/listings?type=land" },
];

const condoItems: DropdownItem[] = [
  {
    label: "Preselling Condo",
    href: "/listings?type=condo&subtype=preselling",
  },
  { label: "RFO Condo", href: "/listings?type=condo&subtype=rfo" },
  { label: "Rent to Own", href: "/listings?type=condo&subtype=rent-to-own" },
];

const forRentItems: DropdownItem[] = [
  { label: "House for Rent", href: "/listings?type=house&category=rent" },
  { label: "Condo for Rent", href: "/listings?type=condo&category=rent" },
  {
    label: "Warehouse for Rent",
    href: "/listings?type=commercial&category=rent&subtype=warehouse",
  },
  {
    label: "Commercial Space for Rent",
    href: "/listings?type=commercial&category=rent",
  },
];

function DesktopDropdown({
  label,
  items,
}: {
  label: string;
  items: DropdownItem[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="flex items-center gap-1 text-[#8B7355] hover:text-[#1A1A1A] text-sm tracking-wider uppercase transition"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {label}
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
                className="block px-4 py-2 text-sm text-[#8B7355] hover:text-[#1A1A1A] hover:bg-[#F5F0E8] transition whitespace-nowrap"
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
  items,
  onNavigate,
}: {
  label: string;
  items: DropdownItem[];
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        className="flex items-center justify-between w-full text-[#8B7355] hover:text-[#1A1A1A] text-sm tracking-wider uppercase"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {label}
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-4 ml-4 flex flex-col gap-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[#8B7355]/80 hover:text-[#1A1A1A] text-sm tracking-wider uppercase"
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
              src="/images/favicon.png"
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
                className="text-[#8B7355] text-xs tracking-[0.3em] uppercase"
                style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
              >
                Cebu Real Estate
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <DesktopDropdown label="House and Lot" items={houseLotItems} />
            <DesktopDropdown label="Condo" items={condoItems} />
            <DesktopDropdown label="For Rent" items={forRentItems} />
            <Link
              href="/listings?type=commercial"
              className="text-[#8B7355] hover:text-[#1A1A1A] text-sm tracking-wider uppercase transition"
            >
              Commercial
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
            <MobileDropdown
              label="House and Lot"
              items={houseLotItems}
              onNavigate={() => setIsOpen(false)}
            />
            <MobileDropdown
              label="Condo"
              items={condoItems}
              onNavigate={() => setIsOpen(false)}
            />
            <MobileDropdown
              label="For Rent"
              items={forRentItems}
              onNavigate={() => setIsOpen(false)}
            />
            <Link
              href="/listings?type=commercial"
              className="text-[#8B7355] hover:text-[#1A1A1A] text-sm tracking-wider uppercase"
              onClick={() => setIsOpen(false)}
            >
              Commercial
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
          </div>
        </div>
      )}
    </nav>
  );
}
