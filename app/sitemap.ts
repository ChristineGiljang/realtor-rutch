import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { CITIES } from "@/lib/cities";
import { FILTERS } from "@/lib/filter-slugs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://realtor-rutch.com"
  ).replace(/\/$/, "");

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/listings`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  // City pages — /[city], e.g. /mandaue-city
  const cityPages = CITIES.map((city) => ({
    url: `${baseUrl}/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  // City + filter combo pages — /[city]/[filterSlug], e.g.
  // /mandaue-city/house-and-lot-for-sale. This is the main SEO surface
  // for "<property type> in <city>" searches.
  const cityFilterPages = CITIES.flatMap((city) =>
    FILTERS.map((filter) => ({
      url: `${baseUrl}/${city.slug}/${filter.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.75,
    })),
  );

  // Dynamic property detail pages (matches app/(main)/property/[slug]/page.tsx)
  const properties = await db.property.findMany({
    select: { slug: true, updatedAt: true },
  });

  const listingPages = properties.map((property) => ({
    url: `${baseUrl}/property/${property.slug}`,
    lastModified: property.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic blog pages (matches app/(main)/blog/[slug]/page.tsx)
  const posts = await db.blogPost.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  const blogPages = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...cityPages,
    ...cityFilterPages,
    ...listingPages,
    ...blogPages,
  ];
}
