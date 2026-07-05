import Link from "next/link";

export default function AboutTeaser() {
  return (
    <section className="bg-[#F5F0E8] text-[#1A1A1A] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative h-[500px] overflow-hidden">
            <img
              src="/images/agent.jpeg"
              alt="Agent Name"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
              About Me
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Your Trusted Real Estate Expert
            </h2>
            <p className="text-[#8B7355] leading-relaxed mb-4">
              With over 15 years of experience in luxury real estate, I have
              helped hundreds of clients find their dream homes across the most
              prestigious neighborhoods.
            </p>
            <p className="text-[#8B7355] leading-relaxed mb-8">
              My deep market knowledge, extensive network, and commitment to
              client satisfaction sets me apart. Whether buying or selling, I am
              dedicated to achieving the best results for you.
            </p>
            <Link
              href="/about"
              className="inline-block bg-[#1A1A1A] text-[#F5F0E8] px-8 py-4 text-sm tracking-wider uppercase font-semibold hover:bg-[#C9A96E] transition"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
