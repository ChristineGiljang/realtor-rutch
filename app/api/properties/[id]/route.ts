import { db } from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await db.property.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      { error: "Failed to delete property" },
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
    const featured = formData.get("featured") === "true";
    const luxury = formData.get("luxury") === "true";
    const features = (formData.get("features") as string) || null;
    const paymentTerms = (formData.get("paymentTerms") as string) || null;
    const listingCategory =
      (formData.get("listingCategory") as string) || "sale";
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

    const slug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const property = await db.property.update({
      where: { id },
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
        featured,
        luxury,
        listingCategory,
        features,
        paymentTerms,
        lotSize,
        garage,
        yearBuilt,
        lat,
        lng,
        slug,
      },
    });

    // Handle new image uploads
    const images = formData.getAll("images") as File[];
    if (images && images.length > 0 && images[0].size > 0) {
      const imageUploadPromises = images.map(async (image, index) => {
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const result: any = await uploadToCloudinary(
          buffer,
          `${slug}-${Date.now()}-${index}`,
        );

        return db.propertyImage.create({
          data: {
            url: result.secure_url,
            alt: title,
            order: index,
            propertyId: property.id,
          },
        });
      });

      await Promise.all(imageUploadPromises);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 },
    );
  }
}
