import Link from "next/link";

const linkClass =
  "text-[#C9A96E] underline underline-offset-2 hover:text-[#1A1A1A] transition";

// Shown at the end of every blog post, so every post (old and new) links to
// the Cebu-wide pages with keyword anchors, without editing each post.
export default function BlogBrowseLinks() {
  return (
    <section className="mt-12 pt-8 border-t border-[#E2D9C8]">
      <h2 className="text-lg font-semibold text-[#1A1A1A] mb-3">
        Looking for a home in Cebu?
      </h2>
      <p className="text-[#8B7355] leading-relaxed">
        Browse{" "}
        <Link href="/house-and-lot-for-sale-in-cebu" className={linkClass}>
          house and lot for sale in Cebu
        </Link>
        , or see{" "}
        <Link href="/condo-for-sale-in-cebu" className={linkClass}>
          condo for sale in Cebu
        </Link>{" "}
        in Cebu City, Mandaue, and Lapu-Lapu. You can also{" "}
        <Link href="/listings?category=sale" className={linkClass}>
          view all properties for sale
        </Link>
        .
      </p>
    </section>
  );
}
