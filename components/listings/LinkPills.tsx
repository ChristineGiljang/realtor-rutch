import Link from "next/link";

export interface PillLink {
  label: string;
  href: string;
  count?: number;
}

export default function LinkPills({
  heading,
  links,
}: {
  heading: string;
  links: PillLink[];
}) {
  if (links.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-[#1A1A1A]">{heading}</h2>
      <ul className="mt-4 flex flex-wrap gap-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="inline-block bg-white border border-[#E2D9C8] text-[#1A1A1A] text-sm px-4 py-2.5 rounded-full hover:border-[#C9A96E] transition"
            >
              {l.label}
              {l.count != null && (
                <span className="ml-1 text-[#8B7355]">({l.count})</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
