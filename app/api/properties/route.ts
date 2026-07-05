import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract form fields
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = (formData.get("state") as string) || "";
    const zip = formData.get("zip") as string;
    const beds = parseInt(formData.get("beds") as string);
    const baths = parseFloat(formData.get("baths") as string);
    const sqft = parseInt(formData.get("sqft") as string);
    const type = formData.get("type") as string;
    const status = formData.get("status") as string;

    // Optional fields
    const lotSize = formData.get("lotSize")
      ? parseFloat(formData.get("lotSize") as string)
      : null;
    const garage = formData.get("garage")
      ? parseInt(formData.get("garage") as string)
      : null;
    const yearBuilt = formData.get("yearBuilt")
      ? parseInt(formData.get("yearBuilt") as string)
      : null;
    const lat = formData.get("lat")
      ? parseFloat(formData.get("lat") as string)
      : null;
    const lng = formData.get("lng")
      ? parseFloat(formData.get("lng") as string)
      : null;
    const featured = formData.get("featured") === "true";
    const luxury = formData.get("luxury") === "true";

    const features = (formData.get("features") as string) || null;
    const paymentTerms = (formData.get("paymentTerms") as string) || null;
    const listingCategory =
      (formData.get("listingCategory") as string) || "sale";
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    // Validate required fields
    if (
      !title ||
      !description ||
      !price ||
      !address ||
      !city ||
      !state ||
      !zip
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Upload images to Cloudinary
    const imageFiles = formData.getAll("images") as File[];
    const imageUrls: { url: string; order: number }[] = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "real-estate/properties",
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        uploadStream.end(buffer);
      });

      if (result && typeof result === "object" && "secure_url" in result) {
        imageUrls.push({
          url: (result as any).secure_url,
          order: i,
        });
      }
    }

    // Create property with images in transaction
    const property = await db.property.create({
      data: {
        title,
        description,
        price,
        address,
        city,
        state,
        zip,
        beds,
        baths,
        sqft,
        type,
        status,
        lotSize,
        garage,
        yearBuilt,
        lat,
        lng,
        featured,
        listingCategory,
        luxury,
        features,
        paymentTerms,
        slug,
        images: {
          create: imageUrls.map((img) => ({
            url: img.url,
            alt: title,
            order: img.order,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("Property creation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create property",
      },
      { status: 500 },
    );
  }
}
