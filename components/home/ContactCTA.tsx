import Link from "next/link";

export default function ContactCTA() {
  return (
    <section className="bg-[#F5F0E8] text-[#1A1A1A] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
          Get In Touch
        </p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Ready to Find Your Dream Home?
        </h2>
        <p className="text-[#8B7355] max-w-xl mx-auto mb-10 leading-relaxed">
          Whether you are buying or selling, I am here to guide you every step
          of the way. Let us start the conversation today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="bg-[#1A1A1A] text-[#F5F0E8] px-8 py-4 text-sm tracking-wider uppercase font-semibold hover:bg-[#C9A96E] transition"
          >
            Contact Me
          </Link>

          <a
            href="tel:+63 9817413929"
            className="border border-[#1A1A1A] text-[#1A1A1A] px-8 py-4 text-sm tracking-wider uppercase font-semibold hover:bg-[#1A1A1A]/5 transition"
          >
            +63 981 741 3929
          </a>
        </div>
      </div>
    </section>
  );
}
