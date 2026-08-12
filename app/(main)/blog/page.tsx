import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Real estate tips, market updates, and buying guides for Cebu City from Realtor Rutch — financing, titles, neighborhoods, and more.",
};

export default async function BlogPage() {
  const posts = await db.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="pt-20 min-h-screen bg-[#faf9f6] text-[#1A1A1A]">
      {/* Header */}
      <div className="bg-[#1A1A1A] text-[#faf9f6] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
            Blog
          </p>
          <h1 className="text-5xl md:text-6xl font-bold max-w-2xl">
            Cebu Real Estate Insights
          </h1>
        </div>
      </div>

      {/* Post grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-[#E2D9C8]">
            <p className="text-[#8B7355]">No posts yet — check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <div className="relative h-56 overflow-hidden bg-[#E2D9C8] mb-4">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#8B7355] text-sm">
                      Realtor Rutch
                    </div>
                  )}
                </div>
                <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-2">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : ""}
                </p>
                <h2 className="text-xl font-bold group-hover:text-[#C9A96E] transition">
                  {post.title}
                </h2>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
