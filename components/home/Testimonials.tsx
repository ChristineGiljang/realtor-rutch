import { db } from "@/lib/db";

export default async function Testimonials() {
  const testimonials = await db.testimonial.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  if (testimonials.length === 0) return null;

  return (
    <section className="bg-[#1A1A1A] text-[#F5F0E8] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-3">
            Client Reviews
          </p>
          <h2 className="text-4xl md:text-5xl font-bold">What Clients Say</h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="border border-[#F5F0E8]/10 p-8 hover:border-[#C9A96E]/40 transition"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} className="text-[#C9A96E] text-sm">
                    ★
                  </span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-[#F5F0E8]/70 leading-relaxed mb-8 italic">
                "{t.quote}"
              </p>

              {/* Author */}
              <div>
                <p className="font-semibold text-[#F5F0E8]">{t.name}</p>
                {t.location && (
                  <p className="text-[#F5F0E8]/40 text-sm">{t.location}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
