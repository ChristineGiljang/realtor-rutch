import { permanentRedirect, notFound } from "next/navigation";
import { db } from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

// Property detail pages used to live at /listings/[slug]; they moved to
// /property/[slug] to free up /listings/[...] for the city + filter SEO
// routes. This keeps any old bookmarked or indexed links working.
export default async function LegacyListingRedirect({ params }: Props) {
  const { slug } = await params;
  const property = await db.property.findUnique({
    where: { slug },
    select: { slug: true },
  });

  if (!property) notFound();
  permanentRedirect(`/property/${property.slug}`);
}
