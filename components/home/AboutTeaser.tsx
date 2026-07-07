import Link from "next/link";

export default function AboutTeaser() {
  return (
    <section className="bg-[#1A1A1A] text-[#F5F0E8] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative h-[500px] overflow-hidden">
            <img
              src="/images/agent.JPEG"
              alt="Agent Name"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
              About Me
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-[#F5F0E8]">
              Your Trusted Real Estate Expert
            </h2>
            <p className="text-[#F5F0E8]/70 leading-relaxed mb-4">
              Hi, I'm a young and passionate real estate agent based in Cebu,
              dedicated to helping clients find the right property with
              confidence and ease. Whether you're buying your first home,
              searching for an investment, or selling your property, I strive to
              make every step of the process smooth, transparent, and
              stress-free.
            </p>
            <p className="text-[#F5F0E8]/70 leading-relaxed mb-8">
              With a strong understanding of the Cebu real estate market, I
              specialize in connecting clients with quality residential,
              commercial, and investment properties that match their goals and
              lifestyle. I believe that real estate is more than just buying and
              selling—it's about building relationships, earning trust, and
              helping people make informed decisions.
            </p>
            <Link
              href="/about"
              className="inline-block bg-[#F5F0E8] text-[#1A1A1A] px-8 py-4 text-sm tracking-wider uppercase font-semibold hover:bg-[#C9A96E] transition"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
