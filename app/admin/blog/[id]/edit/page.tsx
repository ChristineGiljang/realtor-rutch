import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import BlogForm from "@/components/admin/BlogForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;

  const post = await db.blogPost.findUnique({ where: { id } });

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#1A1A1A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-3">
            Admin
          </p>
          <h1 className="text-4xl font-bold text-[#1A1A1A]">Edit Post</h1>
        </div>
        <BlogForm
          mode="edit"
          postId={post.id}
          initialValues={{
            title: post.title,
            content: post.content,
            coverImage: post.coverImage,
            published: post.published,
          }}
        />
      </div>
    </div>
  );
}
