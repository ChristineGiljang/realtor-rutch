import { db } from "@/lib/db";

export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
  return slug || "listing";
}

/**
 * Returns a slug that doesn't exist yet on Property.
 * Pass excludeId when editing so a listing doesn't clash with itself.
 */
export async function uniquePropertySlug(
  title: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(title);
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
