import Link from "next/link";

interface Props {
  city: { name: string; slug: string };
}

const CITY_BLURBS: Record<string, { heading: string; body: string }> = {
  "lapu-lapu-city": {
    heading: "Why buy a condo in Lapu-Lapu City (Mactan)?",
    body: "Lapu-Lapu City sits on Mactan Island, home to the Mactan-Cebu International Airport, beach resorts, and a growing number of residential developments. Buyers here often look for sea-view units, vacation homes, or condos to rent out. Popular areas include Maribago, Mactan Newtown, and Punta Engaño.",
  },
  "cebu-city": {
    heading: "Why buy a condo in Cebu City?",
    body: "Most condos in Cebu City are clustered around Cebu IT Park, Cebu Business Park, and other central areas close to offices, malls, and schools. That makes them popular with professionals, young families, and investors looking for rental demand.",
  },
  "mandaue-city": {
    heading: "Why buy a condo in Mandaue City?",
    body: "Mandaue City sits between Cebu City and Mactan, with easy access to both. Seaside developments like Mandani Bay attract buyers who want a mix of city access and sea views.",
  },
};

export default function CityCondoContent({ city }: Props) {
  const blurb = CITY_BLURBS[city.slug] ?? {
    heading: `Why buy a condo in ${city.name}?`,
    body: `Condos in ${city.name} suit buyers who want a lower-maintenance home, a first property, or an investment unit. Browse the listings above, or message me about units that are not listed yet.`,
  };

  return (
    <section className="mt-16 max-w-3xl text-[#1A1A1A]">
      <h2 className="text-2xl font-bold mb-4">{blurb.heading}</h2>
      <p className="text-[#1A1A1A]/80 leading-relaxed mb-10">{blurb.body}</p>

      <h2 className="text-2xl font-bold mb-6">
        Condo buying questions in {city.name}
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-1">
            Can foreigners buy a condo in {city.name}?
          </h3>
          <p className="text-[#1A1A1A]/80 leading-relaxed">
            Yes. Foreigners can own condominium units in the Philippines as long
            as foreign ownership in the whole project stays within 40%. They
            cannot own the land itself. Check the project&apos;s current
            foreign-ownership status with the developer before you reserve a
            unit.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-1">
            What documents do I need to buy a condo?
          </h3>
          <p className="text-[#1A1A1A]/80 leading-relaxed">
            Buyers are usually asked for a valid government ID and a TIN, and
            for proof of income if you are financing the purchase. The seller or
            developer will confirm the full list for your unit. For the full
            process, read the{" "}
            <Link
              href="/blog/how-to-buy-a-condo-in-cebu-philippines-a-step-by-step-buyers-guide-for-cebu-city-lapu-lapu--mandaue"
              className="text-[#8B7355] underline underline-offset-2 hover:text-[#1A1A1A] transition"
            >
              step-by-step condo buying guide
            </Link>
            .
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-1">Can I book a viewing?</h3>
          <p className="text-[#1A1A1A]/80 leading-relaxed">
            Yes. Send a message through the{" "}
            <Link
              href="/contact"
              className="text-[#8B7355] underline underline-offset-2 hover:text-[#1A1A1A] transition"
            >
              contact page
            </Link>{" "}
            or call, and I will arrange a schedule.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-1">
            Are the condos furnished or unfurnished?
          </h3>
          <p className="text-[#1A1A1A]/80 leading-relaxed">
            It depends on the unit. Each listing says whether it is fully
            furnished, semi-furnished, or unfurnished.
          </p>
        </div>
      </div>
    </section>
  );
}
