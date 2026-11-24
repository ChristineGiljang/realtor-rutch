import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uniquePropertySlug, isUniqueViolation } from "@/lib/slug";

// Left side = what n8n sends. Right side = value stored by your admin form.
const CATEGORY: Record<string, string> = {
  "For Sale": "sale",
  "For Rent": "rent",
};
const TYPE: Record<string, string> = {
  House: "house",
  Condo: "condo",
  Land: "land",
  Commercial: "commercial",
};
const SUBTYPE: Record<string, string> = {
  Preselling: "preselling",
  "Preselling Condo": "preselling",
  "Rent to Own": "rent-to-own",
  "Rent to Own Condo": "rent-to-own",
  Warehouse: "warehouse",
  Office: "office",
  Retail: "retail",
};
const OWNERSHIP: Record<string, string> = {
  Freehold: "freehold",
  Leasehold: "leasehold",
  Condominium: "condominium",
};
const IMPORT_STATUS = "pending"; // review in admin, then switch to active

const lines = (v: unknown) =>
  Array.isArray(v)
    ? v.filter(Boolean).join("\n") || null
    : v
      ? String(v)
      : null;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (
    !process.env.IMPORT_API_SECRET ||
    authHeader !== `Bearer ${process.env.IMPORT_API_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const b = await req.json();

    const title = String(b.title ?? "").trim();
    const price = Number(b.price);
    const zip = String(b.zip ?? "").trim();
    const city = String(b.city ?? "").trim();
    const address = String(b.address ?? "").trim();
    const description = String(b.description ?? "").trim();

    const missing: string[] = [];
    if (!title) missing.push("title");
    if (!description) missing.push("description");
    if (!(price > 0)) missing.push("price");
    if (!address) missing.push("address");
    if (!city) missing.push("city");
    if (!/^\d{4}$/.test(zip)) missing.push("zip (4 digits)");
    if (!TYPE[b.type]) missing.push("type");
    if (!CATEGORY[b.listingCategory]) missing.push("listingCategory");
    if (missing.length) {
      return NextResponse.json(
        { error: `Missing/invalid: ${missing.join(", ")}` },
        { status: 400 },
      );
    }

    const floorNum = parseInt(String(b.floor ?? ""), 10);
    const lot = Number(b.lotSize);
    const garage = Number(b.garage);
    const lat = Number(b.lat);
    const lng = Number(b.lng);
    const hasCoords =
      Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0;

    const images = (Array.isArray(b.images) ? b.images : []).map(
      (img: { url: string; alt?: string; order?: number }, i: number) => ({
        url: img.url,
        alt: img.alt?.trim() || title,
        order: img.order ?? i,
      }),
    );

    let property;
    for (let attempt = 0; attempt < 3; attempt++) {
      const slug = await uniquePropertySlug(title);
      try {
        property = await db.property.create({
          data: {
            title,
            description,
            price,
            address,
            city,
            barangay: b.barangay || null,
            building: b.propertyName || null,
            state: String(b.state ?? ""),
            zip,
            beds: Math.round(Number(b.beds) || 0),
            baths: Number(b.baths) || 0,
            sqft: Math.round(Number(b.floorArea) || lot || 0),
            lotSize: lot > 0 ? lot : null,
            garage: garage > 0 ? Math.round(garage) : null,
            lat: hasCoords ? lat : null,
            lng: hasCoords ? lng : null,
            type: TYPE[b.type],
            subtype: SUBTYPE[b.subtype] ?? null,
            status: IMPORT_STATUS,
            ownershipType: OWNERSHIP[b.ownershipType] ?? null,
            propertyFloor: Number.isNaN(floorNum) ? null : floorNum,
            amenities: lines(b.amenities),
            referenceName: b.reference || null,
            features: lines(b.features),
            paymentTerms: b.paymentTerms || null,
            listingCategory: CATEGORY[b.listingCategory],
            slug,
            images: { create: images },
          },
          include: { images: true },
        });
        break;
      } catch (err) {
        if (isUniqueViolation(err) && attempt < 2) continue;
        throw err;
      }
    }

    return NextResponse.json(
      { ok: true, id: property?.id, slug: property?.slug },
      { status: 201 },
    );
  } catch (error) {
    console.error("Property import error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import failed" },
      { status: 500 },
    );
  }
}
