import BlogForm from "@/components/admin/BlogForm";

export default function NewBlogPostPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1A1A1A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-3">
            Admin
          </p>
          <h1 className="text-4xl font-bold text-[#1A1A1A]">New Blog Post</h1>
        </div>
        <BlogForm mode="create" />
      </div>
    </div>
  );
}
