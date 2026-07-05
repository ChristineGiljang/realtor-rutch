export default function Stats() {
  const stats = [
    { number: "500+", label: "Homes Sold" },
    { number: "$2B+", label: "In Sales Volume" },
    { number: "15+", label: "Years Experience" },
    { number: "98%", label: "Client Satisfaction" },
  ];

  return (
    <section className="bg-[#F5F0E8] text-[#1A1A1A] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl md:text-5xl font-bold tracking-tight mb-2 text-[#C9A96E]">
                {stat.number}
              </p>
              <p className="text-sm tracking-widest uppercase text-[#8B7355]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
