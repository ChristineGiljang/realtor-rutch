import Link from "next/link";
import type { PropertyLinkTargets } from "@/lib/property-links";

// Crawlable links from a listing up to its area page, city page and the
// Cebu-wide hub. Server component, so the links are in the HTML.
export default function PropertyExploreLinks({
  targets,
}: {
  targets: PropertyLinkTargets;
}) {
  const links = [
    targets.area,
    targets.city,
    targets.hub && { label: targets.hub.label, href: targets.hub.path },
  ].filter((l): l is { label: string; href: string } => Boolean(l));

  if (links.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-[#E2D9C8] text-[#1A1A1A]">
        Explore more
      </h2>
      <ul className="flex flex-col gap-2 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-[#C9A96E] underline underline-offset-2 hover:text-[#1A1A1A] transition"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
