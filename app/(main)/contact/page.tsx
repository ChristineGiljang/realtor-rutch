import ContactPageForm from "@/components/contact/ContactPageForm";

export default function ContactPage() {
  return (
    <div className="pt-20 min-h-screen bg-[#F5F0E8] text-[#1A1A1A]">
      {/* Header */}
      <div className="bg-[#1A1A1A] text-[#F5F0E8] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
            Get In Touch
          </p>
          <h1 className="text-5xl md:text-6xl font-bold">Contact Us</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: Info */}
          <div>
            <h2 className="text-3xl font-bold mb-6">
              Let's Start a Conversation
            </h2>
            <p className="text-[#8B7355] leading-relaxed mb-10">
              Whether you're looking to buy, sell, or just explore your options,
              I'm here to help. Reach out and I'll get back to you within 24
              hours.
            </p>

            {/* Contact Details */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#C9A96E] text-sm">✆</span>
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-1">
                    Phone
                  </p>
                  <a
                    href="tel:+63 9817413929"
                    className="text-[#1A1A1A] font-semibold hover:text-[#C9A96E] transition"
                  >
                    +639817413929
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#C9A96E] text-sm">✉</span>
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-1">
                    Email
                  </p>
                  <a
                    href="mailto:rutchilynllagoso@gmail.com"
                    className="text-[#1A1A1A] font-semibold hover:text-[#C9A96E] transition"
                  >
                    rldreamspaces@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#C9A96E] text-sm">⊙</span>
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-1">
                    Office
                  </p>
                  <p className="text-[#1A1A1A] font-semibold">
                    Next Level Realty and Training Services
                    <br />
                    Unit 2 I-J Baseline Residences, Juana Osmeñ Street Capitol
                    Site, Cebu City 6000,
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#C9A96E] text-sm">◷</span>
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-1">
                    Hours
                  </p>
                  <p className="text-[#1A1A1A] font-semibold">
                    Available for inquiries 24/7
                    <br />
                    Property viewings: By appointment
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div>
            <ContactPageForm />
          </div>
        </div>
      </div>
    </div>
  );
}
