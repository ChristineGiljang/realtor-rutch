export default function AboutPage() {
  const values = [
    {
      title: "Integrity",
      description:
        "Every transaction is handled with complete transparency and honesty. My clients always come first.",
    },
    {
      title: "Expertise",
      description:
        "15+ years of deep market knowledge across luxury neighborhoods gives my clients a decisive edge.",
    },
    {
      title: "Results",
      description:
        "I don't just list homes — I sell them. My properties consistently close above asking price.",
    },
    {
      title: "Service",
      description:
        "Available 7 days a week. From first showing to closing day, I'm with you every step of the way.",
    },
  ];

  return (
    <div className="pt-20 min-h-screen bg-[#F5F0E8] text-[#1A1A1A]">
      {/* Hero Banner */}
      <div className="bg-[#1A1A1A] text-[#F5F0E8] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
            About Me
          </p>
          <h1 className="text-5xl md:text-6xl font-bold max-w-2xl">
            Your Trusted Luxury Real Estate Expert
          </h1>
        </div>
      </div>

      {/* Bio Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative h-[600px] overflow-hidden bg-[#E2D9C8]">
            <img
              src="/images/agent.jpeg"
              alt="Agent Name"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Bio */}
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
              My Story
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#1A1A1A]">
              Agent Name
            </h2>
            <p className="text-[#8B7355] leading-relaxed mb-4">
              Hi, I'm a young and passionate real estate agent based in Cebu,
              dedicated to helping clients find the right property with
              confidence and ease. Whether you're buying your first home,
              searching for an investment, or selling your property, I strive to
              make every step of the process smooth, transparent, and
              stress-free.
            </p>
            <p className="text-[#8B7355] leading-relaxed mb-4">
              With a strong understanding of the Cebu real estate market, I
              specialize in connecting clients with quality residential,
              commercial, and investment properties that match their goals and
              lifestyle. I believe that real estate is more than just buying and
              selling—it's about building relationships, earning trust, and
              helping people make informed decisions.
            </p>
            <p className="text-[#8B7355] leading-relaxed mb-8">
              I take pride in providing honest advice, prompt communication, and
              personalized service tailored to each client's unique needs. My
              commitment is to deliver a professional experience while ensuring
              that every client feels supported from the initial inquiry to the
              final transaction.
            </p>
            <p className="text-[#8B7355] leading-relaxed mb-8">
              If you're looking for a reliable real estate partner in Cebu, I'd
              be honored to help you find the perfect property or maximize the
              value of your investment.
            </p>

            {/* License & Credentials */}
            <div className="border-t border-[#E2D9C8] pt-6 flex flex-wrap gap-6">
              <div>
                <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-1">
                  Accreditation No.
                </p>
                <p className="font-semibold text-[#1A1A1A]">#29866</p>
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-1">
                  DSHUD
                </p>
                <p className="font-semibold text-[#1A1A1A]">#R7-A-01/26-8595</p>
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-1">
                  Brokerage
                </p>
                <p className="font-semibold text-[#1A1A1A]">
                  Dreamers House Next Level Realty and Training Services
                </p>
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-1">
                  Member Since
                </p>
                <p className="font-semibold text-[#1A1A1A]">2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-[#1A1A1A] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
              What I Stand For
            </p>
            <h2 className="text-4xl font-bold text-[#F5F0E8]">
              My Core Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="border border-[#F5F0E8]/10 p-8 hover:border-[#C9A96E] transition"
              >
                <h3 className="text-lg font-bold mb-3 text-[#F5F0E8]">
                  {value.title}
                </h3>
                <p className="text-[#F5F0E8]/60 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#F5F0E8] border-t border-[#E2D9C8] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
            Ready to Work Together?
          </p>
          <h2 className="text-4xl font-bold mb-6 text-[#1A1A1A]">
            Let's Find Your Dream Home
          </h2>
          <p className="text-[#8B7355] max-w-xl mx-auto mb-10">
            I'd love to hear about your real estate goals. Reach out today and
            let's start the conversation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-[#1A1A1A] text-[#F5F0E8] px-8 py-4 text-sm tracking-wider uppercase font-semibold hover:bg-[#C9A96E] transition"
            >
              Contact Me
            </a>
            <a
              href="/listings"
              className="border border-[#1A1A1A] text-[#1A1A1A] px-8 py-4 text-sm tracking-wider uppercase font-semibold hover:bg-[#1A1A1A]/5 transition"
            >
              View Listings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
