import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

// Used by the rich text editor's "Insert Image" toolbar button to upload
// an image that goes *inside* the post body (separate from the cover image,
// which is handled by /api/blog and /api/blog/[id]).
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const result: any = await uploadToCloudinary(
      buffer,
      `blog-body-${Date.now()}`,
    );

    return NextResponse.json({ url: result.secure_url }, { status: 201 });
  } catch (error) {
    console.error("Blog body image upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload image",
      },
      { status: 500 },
    );
  }
}
