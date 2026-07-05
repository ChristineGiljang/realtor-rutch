import { db } from "../lib/db";

async function main() {
  const properties = await db.property.findMany();

  for (const property of properties) {
    const slug = property.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    await db.property.update({
      where: { id: property.id },
      data: { slug },
    });

    console.log(`✔ Updated: ${property.title} → ${slug}`);
  }

  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
