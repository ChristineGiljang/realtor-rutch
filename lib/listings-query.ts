import { db } from "@/lib/db";

export const PAGE_SIZE = 12;

export async function queryListings(
  where: any,
  page: string | undefined,
  orderBy: any = { createdAt: "desc" },
) {
  const totalCount = await db.property.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(
    Math.max(1, parseInt(page || "1") || 1),
    totalPages,
  );

  const listings = await db.property.findMany({
    where,
    orderBy,
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      images: { orderBy: { order: "asc" }, take: 5 },
    },
  });

  return { listings, totalCount, totalPages, currentPage };
}
