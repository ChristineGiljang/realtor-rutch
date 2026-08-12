import { db } from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await db.blogPost.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const formData = await request.formData();

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const published = formData.get("published") === "true";

    const existing = await db.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const slug = slugify(title);

    let coverImage = existing.coverImage;
    const coverFile = formData.get("coverImage") as File | null;
    if (coverFile && coverFile.size > 0) {
      const bytes = await coverFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const result: any = await uploadToCloudinary(
        buffer,
        `blog-${slug}-${Date.now()}`,
      );
      coverImage = result.secure_url;
    }

    // Only set publishedAt the first time a post goes live
    const publishedAt = published
      ? (existing.publishedAt ?? new Date())
      : existing.publishedAt;

    const post = await db.blogPost.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        coverImage,
        published,
        publishedAt,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error updating blog post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 },
    );
  }
}
