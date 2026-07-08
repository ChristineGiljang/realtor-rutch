import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] border-t border-[#E2D9C8]/20 text-[#F5F0E8]/70 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-[#F5F0E8] text-xl font-bold tracking-widest uppercase mb-3">
              Rutchilyn Llagoso
            </h3>
            <p className="text-sm leading-relaxed">
              Luxury real estate specialist serving Cebu City and surrounding
              areas.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[#F5F0E8] text-sm tracking-wider uppercase mb-4">
              Navigation
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link
                href="/listings"
                className="hover:text-[#C9A96E] transition"
              >
                Listings
              </Link>
              <Link href="/sold" className="hover:text-[#C9A96E] transition">
                Sold
              </Link>
              <Link href="/about" className="hover:text-[#C9A96E] transition">
                About
              </Link>
              <Link href="/contact" className="hover:text-[#C9A96E] transition">
                Contact
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[#F5F0E8] text-sm tracking-wider uppercase mb-4">
              Contact
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              <a
                href="tel:+63 9817413929"
                className="hover:text-[#C9A96E] transition"
              >
                +639817413929
              </a>
              <a
                href="mailto:agent@email.com"
                className="hover:text-[#C9A96E] transition"
              >
                rldreamspaces@gmail.com
              </a>
              <p>Accreditation No. 29866</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E2D9C8]/20 mt-10 pt-6 text-xs text-center">
          © {new Date().getFullYear()} Rutchilyn Llagoso. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
