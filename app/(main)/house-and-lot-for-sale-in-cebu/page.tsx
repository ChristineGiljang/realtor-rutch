import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { CITIES, cityWhereClause } from "@/lib/cities";
import { queryListings } from "@/lib/listings-query";
import Breadcrumbs from "@/components/listings/Breadcrumbs";
import PropertySearchBar from "@/components/search/PropertySearchBar";
import ListingsResults from "@/components/listings/ListingsResults";

export const revalidate = 0;

const SITE_URL = "https://realtor-rutch.com";
const PATH = "/house-and-lot-for-sale-in-cebu";
const TITLE = "House and Lot for Sale in Cebu | Realtor Rutch";
const CITY_FILTER_SLUG = "house-and-lot-for-sale";

const CEBU_PLACES = [
  "Cebu",
  "Mandaue",
  "Lapu-Lapu",
  "Talisay",
  "Consolacion",
  "Liloan",
  "Minglanilla",
  "Naga",
  "Compostela",
  "Danao",
  "Carcar",
  "Cordova",
];

const baseWhere: Prisma.PropertyWhereInput = {
  status: "active",
  listingCategory: "sale",
  type: "house",
  OR: [
    { state: { contains: "Cebu", mode: "insensitive" } },
    ...CEBU_PLACES.map((c) => ({
      city: { contains: c, mode: "insensitive" as const },
    })),
  ],
};

const getStats = cache(async () => {
  const agg = await db.property.aggregate({
    where: baseWhere,
    _count: { _all: true },
    _min: { price: true },
    _max: { price: true },
  });
  return {
    count: agg._count._all,
    min: agg._min.price,
    max: agg._max.price,
  };
});

function formatPrice(n: number) {
  if (n >= 1_000_000) {
    return `₱${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  return `₱${Math.round(n).toLocaleString("en-PH")}`;
}

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { page } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const { count, min, max } = await getStats();

  const description =
    count > 0 && min != null && max != null
      ? `Browse ${count} house and lot for sale in Cebu. Prices from ${formatPrice(min)} to ${formatPrice(max)}. Cebu City, Mandaue, Lapu-Lapu, Talisay and more.`
      : "Browse house and lot for sale in Cebu City, Mandaue, Lapu-Lapu, Talisay and more with Realtor Rutch.";

  const title =
    pageNum > 1
      ? `House and Lot for Sale in Cebu - Page ${pageNum} | Realtor Rutch`
      : TITLE;

  const canonical = `${PATH}${pageNum > 1 ? `?page=${pageNum}` : ""}`;

  return {
    // `absolute` stops the layout's "%s | Realtor Rutch" template from
    // adding the brand a second time
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonical}`,
      type: "website",
    },
  };
}

export default async function HouseAndLotForSaleInCebuPage({
  searchParams,
}: Props) {
  const { page } = await searchParams;

  const [{ listings, totalCount, totalPages, currentPage }, stats, cityCounts] =
    await Promise.all([
      queryListings(baseWhere, page, { createdAt: "desc" }),
      getStats(),
      Promise.all(
        CITIES.map(async (city) => ({
          city,
          count: await db.property.count({
            where: {
              status: "active",
              listingCategory: "sale",
              type: "house",
              OR: cityWhereClause(city),
            },
          }),
        })),
      ),
    ]);

  // Only link to city pages that actually have listings
  const cityLinks = cityCounts.filter((c) => c.count > 0);

  const hrefForPage = (targetPage: number) =>
    `${PATH}${targetPage > 1 ? `?page=${targetPage}` : ""}`;

  const rangeText =
    stats.min != null && stats.max != null
      ? ` with prices from ${formatPrice(stats.min)} to ${formatPrice(stats.max)}`
      : "";

  // Last crumb has no href, same as your property page
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "House and Lot for Sale in Cebu" },
  ];

  return (
    <div className="pt-[120px] min-h-screen bg-[#faf9f6] text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbs} />
          <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-3">
            Available Now
          </p>
          <h1 className="text-5xl font-bold text-[#1A1A1A]">
            House and Lot for Sale in Cebu
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#8B7355]">
            Browse {stats.count} house and lot for sale in Cebu{rangeText}.
            Compare homes across Cebu City, Mandaue, Lapu-Lapu, Talisay and
            nearby towns, then book a viewing with Realtor Rutch.
          </p>
        </div>

        <PropertySearchBar initialType="house" initialCategory="sale" />

        <ListingsResults
          listings={listings}
          totalCount={totalCount}
          totalPages={totalPages}
          currentPage={currentPage}
          hrefForPage={hrefForPage}
        />

        {/* Browse by area: crawlable links down to the city pages */}
        {cityLinks.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">
              Browse by area
            </h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {cityLinks.map(({ city, count }) => (
                <li key={city.slug}>
                  <Link
                    href={`/${city.slug}/${CITY_FILTER_SLUG}`}
                    className="inline-block bg-white border border-[#E2D9C8] text-[#1A1A1A] text-sm px-4 py-2.5 rounded-full hover:border-[#C9A96E] transition"
                  >
                    House and lot for sale in {city.name}{" "}
                    <span className="text-[#8B7355]">({count})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Original text, server-rendered. Uses the same .blog-content
            styles as your blog posts, so headings and paragraphs match. */}
        <section className="blog-content mt-16 max-w-3xl text-[#8B7355] leading-relaxed">
          <h2>Buying a house and lot in Cebu</h2>
          <p>
            A house and lot means you own both the structure and the land it
            sits on, which is why the title matters as much as the house itself.
            Cebu has options across the whole metro area: homes in Cebu City
            close to schools and offices, subdivisions in Mandaue and
            Consolacion, properties on Mactan in Lapu-Lapu and Cordova, and
            larger lots further south in Talisay and Minglanilla.
          </p>

          <h3>Check the title first</h3>
          <p>
            Ask for a copy of the Transfer Certificate of Title (TCT) and have a
            certified true copy verified at the Registry of Deeds. Confirm the
            seller&apos;s name matches the title, and look for liens, mortgages,
            or annotations. Also ask for the latest tax declaration and proof
            that real property tax is paid up.
          </p>

          <h3>Pag-IBIG or bank financing</h3>
          <p>
            Pag-IBIG housing loans are open to active members and are a common
            choice for first-time buyers. Banks can be faster and may lend more
            for higher-priced homes. Rates and terms change, so compare current
            offers from both before you commit.
          </p>

          <h3>Taxes and fees</h3>
          <p>
            Budget beyond the price: documentary stamp tax, local transfer tax,
            registration fees, and notarial fees all apply, and the contract
            should say who pays which. Confirm current rates with the BIR, the
            local assessor, or a lawyer before closing.
          </p>

          <h3>Flood and slope risks</h3>
          <p>
            Visit the property after heavy rain if you can, ask neighbors about
            flooding, and check official hazard maps for the area. For homes on
            or near slopes, look at retaining walls and drainage.
          </p>
        </section>

        <section className="mt-12 max-w-3xl">
          <h2 className="text-2xl font-bold text-[#1A1A1A]">
            Frequently asked questions
          </h2>
          <div className="mt-4 space-y-3">
            <details className="border border-[#E2D9C8] bg-white p-4">
              <summary className="cursor-pointer font-medium text-[#1A1A1A]">
                How much is a house and lot in Cebu?
              </summary>
              <p className="mt-2 leading-relaxed text-[#8B7355]">
                Our current listings{rangeText || ""}. Prices vary by location,
                lot size, and whether the home is newly built or pre-owned.
              </p>
            </details>
            <details className="border border-[#E2D9C8] bg-white p-4">
              <summary className="cursor-pointer font-medium text-[#1A1A1A]">
                Can foreigners buy a house and lot in Cebu?
              </summary>
              <p className="mt-2 leading-relaxed text-[#8B7355]">
                Philippine law generally restricts foreign ownership of land.
                Foreign buyers often look at condominium units instead, or
                structure a purchase with legal advice. Speak with a lawyer
                before making any offer.
              </p>
            </details>
            <details className="border border-[#E2D9C8] bg-white p-4">
              <summary className="cursor-pointer font-medium text-[#1A1A1A]">
                What is the difference between pre-selling and ready for
                occupancy?
              </summary>
              <p className="mt-2 leading-relaxed text-[#8B7355]">
                A pre-selling home is sold before it is finished, usually at a
                lower price with staged payments. A ready-for-occupancy home is
                complete and can be inspected before you buy.
              </p>
            </details>
            <details className="border border-[#E2D9C8] bg-white p-4">
              <summary className="cursor-pointer font-medium text-[#1A1A1A]">
                How do I schedule a viewing?
              </summary>
              <p className="mt-2 leading-relaxed text-[#8B7355]">
                Open any listing above and send an inquiry, and Realtor Rutch
                will arrange a viewing with you.
              </p>
            </details>
          </div>
        </section>
      </div>
    </div>
  );
}
