import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const published = formData.get("published") === "true";

    if (!title || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const slug = slugify(title);

    let coverImage: string | null = null;
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

    const post = await db.blogPost.create({
      data: {
        title,
        slug,
        content,
        coverImage,
        published,
        publishedAt: published ? new Date() : null,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Blog post creation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create post",
      },
      { status: 500 },
    );
  }
}
