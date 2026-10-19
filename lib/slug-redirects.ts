import { db } from "@/lib/db";

// Returns the current slug for a listing's old slug, or null if there is none.
// Never throws: if the table is missing or the database hiccups, the caller
// falls back to a normal 404 instead of a 500.
export async function findCurrentSlug(oldSlug: string): Promise<string | null> {
  try {
    const redirect = await db.slugRedirect.findUnique({
      where: { oldSlug },
      select: { property: { select: { slug: true } } },
    });
    return redirect?.property.slug ?? null;
  } catch (error) {
    console.error("slug-redirects: lookup failed", error);
    return null;
  }
}

// Call this whenever a listing's slug changes, passing the slug it had before
// the update. Rows point at the listing (not at the new slug), so a listing
// renamed several times still sends every old URL to its current one.
export async function recordSlugChange(
  propertyId: string,
  oldSlug: string | null | undefined,
  newSlug: string,
): Promise<void> {
  if (!oldSlug || oldSlug === newSlug) return;

  try {
    await db.$transaction([
      // If the listing goes back to a slug it used before, that old slug is a
      // real URL again and must not redirect.
      db.slugRedirect.deleteMany({ where: { oldSlug: newSlug } }),
      db.slugRedirect.upsert({
        where: { oldSlug },
        update: { propertyId },
        create: { oldSlug, propertyId },
      }),
    ]);
  } catch (error) {
    // Losing a redirect row is better than failing the listing update.
    console.error("slug-redirects: failed to record slug change", error);
  }
}
