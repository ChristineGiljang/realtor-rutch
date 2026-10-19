// One-time script: adds the two old-URL redirects, removes redirects that point
// a listing at itself, and prints every redirect so you can see what the site
// will do.
// Run from the project folder:
//   node --env-file=.env scripts/add-slug-redirects.mjs
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const TARGETS = [
  {
    oldSlug:
      "505-sqm-waterfront-property-for-sale-in-mactan-cebu--direct-water-access--sea--marina-views",
    titleWords: ["waterfront", "mactan"],
  },
  {
    oldSlug:
      "exclusive-townhouse-for-sale-in-san-antonio-village-apas-cebu-city--4-bedrooms--2-car-garage",
    titleWords: ["san antonio", "townhouse"],
  },
];

async function main() {
  for (const { oldSlug, titleWords } of TARGETS) {
    console.log(`\nOld URL slug: ${oldSlug}`);

    const stillLive = await db.property.findUnique({
      where: { slug: oldSlug },
      select: { title: true },
    });
    if (stillLive) {
      console.log(
        `  SKIPPED: a listing already uses this slug ("${stillLive.title}"), so it is not a 404.`,
      );
      continue;
    }

    const matches = await db.property.findMany({
      where: {
        AND: titleWords.map((word) => ({
          title: { contains: word, mode: "insensitive" },
        })),
      },
      select: { id: true, title: true, slug: true, status: true },
    });

    if (matches.length !== 1) {
      console.log(
        `  SKIPPED: found ${matches.length} listings matching [${titleWords.join(", ")}]${matches.length ? ":" : "."}`,
      );
      for (const m of matches) {
        console.log(`    - ${m.title} | slug: ${m.slug} | status: ${m.status}`);
      }
      continue;
    }

    const [property] = matches;
    await db.slugRedirect.upsert({
      where: { oldSlug },
      update: { propertyId: property.id },
      create: { oldSlug, propertyId: property.id },
    });
    console.log(
      `  OK: redirects to /property/${property.slug}  ("${property.title}", status: ${property.status})`,
    );
  }

  // A redirect from a listing's current slug to itself does nothing, so remove it.
  const before = await db.slugRedirect.findMany({
    include: { property: { select: { slug: true } } },
  });
  const selfRedirects = before.filter((r) => r.oldSlug === r.property.slug);
  if (selfRedirects.length) {
    await db.slugRedirect.deleteMany({
      where: { id: { in: selfRedirects.map((r) => r.id) } },
    });
    console.log(`\nRemoved ${selfRedirects.length} self-redirect(s).`);
  }

  console.log("\nAll redirects now in the database:");
  const all = await db.slugRedirect.findMany({
    include: { property: { select: { slug: true } } },
    orderBy: { createdAt: "asc" },
  });
  for (const r of all) {
    console.log(`  /property/${r.oldSlug}  ->  /property/${r.property.slug}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
