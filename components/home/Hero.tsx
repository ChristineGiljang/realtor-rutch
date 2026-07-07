import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
        <p className="text-sm tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
          Real Estate
        </p>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Find Your Dream Home
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Specializing in properties across Cebu City. Let us help you find the
          perfect home.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/listings"
            className="bg-[#F5F0E8] text-[#1A1A1A] px-8 py-4 text-sm tracking-wider uppercase font-semibold hover:bg-[#C9A96E] transition"
          >
            View Listings
          </Link>
          <Link
            href="/contact"
            className="border border-white text-white px-8 py-4 text-sm tracking-wider uppercase font-semibold hover:bg-white/10 transition"
          >
            Contact Us
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-12 bg-white/30" />
      </div>
    </section>
  );
}
