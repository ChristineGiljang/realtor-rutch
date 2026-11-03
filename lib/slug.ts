import { db } from "@/lib/db";

function toSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function slugify(input: string): string {
  return toSlug(input).slice(0, 80) || "listing";
}

// Words that add length but no SEO value in a property URL. The /property/
// path and the page content already say "for sale", so they can be dropped.
const FILLER_WORDS = new Set([
  "fully",
  "semi",
  "furnished",
  "modern",
  "subdivision",
  "for",
  "sale",
  "at",
  "in",
  "the",
  "a",
  "an",
  "of",
  "and",
]);

// Slugs are kept at or under this length, cut at a whole word.
const MAX_SHORT_SLUG_LENGTH = 60;

/**
 * Shorter, keyword-first slug for NEW listings only.
 * "Fully Furnished 1 Bedroom Condo for Sale at Sedona Parc Cebu Business Park"
 *   -> "1-bedroom-condo-sedona-parc-cebu-business-park"
 * Existing listings keep their old slug (see the PUT handler), so old URLs
 * don't change.
 */
export function shortSlugify(input: string): string {
  const words = toSlug(input)
    .split("-")
    .filter((word) => word && !FILLER_WORDS.has(word));

  // If every word was filler, fall back to the normal slug.
  if (words.length === 0) return slugify(input);

  const kept: string[] = [];
  let length = 0;
  for (const word of words) {
    const next = length + word.length + (kept.length ? 1 : 0);
    if (next > MAX_SHORT_SLUG_LENGTH) break;
    kept.push(word);
    length = next;
  }

  // A single very long word still gets a slug (cut hard) instead of an empty one.
  return kept.length > 0
    ? kept.join("-")
    : words[0].slice(0, MAX_SHORT_SLUG_LENGTH);
}

/**
 * Returns a slug that doesn't exist yet on Property.
 * Pass excludeId when editing so a listing doesn't clash with itself.
 * Only called when a listing has no slug yet, so existing URLs never change.
 */
export async function uniquePropertySlug(
  title: string,
  excludeId?: string,
): Promise<string> {
  const base = shortSlugify(title);
  let candidate = base;
  let counter = 2;

  while (true) {
    const existing = await db.property.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) return candidate;

    candidate = `${base}-${counter}`;
    counter++;
  }
}

/** True if the error is a Prisma unique-constraint violation (P2002) */
export function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  );
}
