export const revalidate = 0;

import { db } from "@/lib/db";
import Link from "next/link";
import DeleteBlogButton from "@/components/admin/DeleteBlogButton";
import SignOutButton from "@/components/admin/SignOutButton";

export default async function AdminBlogPage() {
  const posts = await db.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2">
              Admin
            </p>
            <h1 className="text-4xl font-bold">Blog Posts</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/listings">
              <button className="border border-[#1A1A1A] text-[#1A1A1A] text-sm tracking-widest uppercase px-6 py-3 hover:bg-[#1A1A1A]/5 transition">
                Listings
              </button>
            </Link>
            <Link href="/admin/blog/new">
              <button className="bg-[#1A1A1A] text-[#faf9f6] text-sm tracking-widest uppercase px-6 py-3 hover:bg-[#C9A96E] transition">
                + New Post
              </button>
            </Link>
            <SignOutButton />
          </div>
        </div>

        {/* Table */}
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-[#E2D9C8]">
            <p className="text-[#8B7355] mb-4">No posts yet.</p>
            <Link href="/admin/blog/new">
              <button className="bg-[#1A1A1A] text-[#faf9f6] text-sm tracking-widest uppercase px-6 py-3 hover:bg-[#C9A96E] transition">
                Write First Post
              </button>
            </Link>
          </div>
        ) : (
          <div className="border border-[#E2D9C8] overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#1A1A1A] text-[#faf9f6] text-xs tracking-widest uppercase">
              <div className="col-span-1">Image</div>
              <div className="col-span-5">Title</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Published</div>
              <div className="col-span-2">Actions</div>
            </div>

            {/* Table Rows */}
            {posts.map((post, index) => (
              <div
                key={post.id}
                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-[#E2D9C8] hover:bg-[#EDE8DF] transition ${
                  index % 2 === 0 ? "bg-[#faf9f6]" : "bg-[#FAF7F2]"
                }`}
              >
                {/* Image */}
                <div className="col-span-1">
                  <div className="w-12 h-12 overflow-hidden">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#E2D9C8] flex items-center justify-center text-[#8B7355] text-xs">
                        No img
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div className="col-span-5">
                  <p className="font-semibold text-sm truncate">{post.title}</p>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <span
                    className={`text-xs tracking-wider uppercase px-2 py-1 ${
                      post.published
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                </div>

                {/* Published date */}
                <div className="col-span-2">
                  <p className="text-sm text-[#8B7355]">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("en-PH")
                      : "--"}
                  </p>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center gap-3">
                  {post.published && (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="text-xs text-[#8B7355] hover:text-[#1A1A1A] transition underline"
                    >
                      View
                    </Link>
                  )}
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="text-xs text-[#8B7355] hover:text-[#1A1A1A] transition underline"
                  >
                    Edit
                  </Link>
                  <DeleteBlogButton postId={post.id} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        <p className="text-[#8B7355] text-sm mt-6">
          {posts.length} {posts.length === 1 ? "post" : "posts"} total
        </p>
      </div>
    </div>
  );
}
