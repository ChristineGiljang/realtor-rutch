"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  mode: "create" | "edit";
  postId?: string;
  initialValues?: {
    title: string;
    content: string;
    coverImage: string | null;
    published: boolean;
  };
}

export default function BlogForm({ mode, postId, initialValues }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(
    initialValues?.coverImage ?? null,
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const inputClass =
    "w-full bg-white border border-[#E2D9C8] text-[#1A1A1A] text-sm px-4 py-3 focus:outline-none focus:border-[#C9A96E] placeholder:text-[#8B7355]";
  const labelClass =
    "block text-xs tracking-widest uppercase text-[#8B7355] mb-2";

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    if (coverFile) formData.set("coverImage", coverFile);

    try {
      const url = mode === "create" ? "/api/blog" : `/api/blog/${postId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      router.push("/admin/blog");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <section>
        <h2 className="text-lg font-semibold mb-6 pb-2 border-b border-[#E2D9C8] text-[#1A1A1A]">
          Post
        </h2>
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Title *</label>
            <input
              name="title"
              required
              defaultValue={initialValues?.title}
              placeholder="e.g. How to Check if a Property Title is Clean in Cebu"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Cover Image</label>
            {preview && (
              <img
                src={preview}
                alt="Cover preview"
                className="w-full h-56 object-cover mb-3 border border-[#E2D9C8]"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="w-full text-sm text-[#8B7355] file:mr-4 file:py-2 file:px-4 file:border file:border-[#E2D9C8] file:bg-[#1A1A1A] file:text-[#F5F0E8] file:text-sm file:cursor-pointer hover:file:bg-[#C9A96E] file:transition"
            />
            <p className="text-xs text-[#8B7355] mt-2">
              {mode === "edit"
                ? "Leave blank to keep the current cover image."
                : "Optional — recommended for blog and social previews."}
            </p>
          </div>

          <div>
            <label className={labelClass}>Content *</label>
            <textarea
              name="content"
              required
              rows={16}
              defaultValue={initialValues?.content}
              placeholder="Write the post here. Leave a blank line between paragraphs."
              className={inputClass}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="published"
              name="published"
              value="true"
              defaultChecked={initialValues?.published ?? false}
              className="w-4 h-4"
            />
            <label
              htmlFor="published"
              className="text-sm text-[#1A1A1A] cursor-pointer"
            >
              Publish now (visible on the public blog and included in the
              sitemap)
            </label>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#1A1A1A] text-[#F5F0E8] text-sm tracking-widest uppercase px-8 py-4 hover:bg-[#C9A96E] transition disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : mode === "create"
              ? "Create Post"
              : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
