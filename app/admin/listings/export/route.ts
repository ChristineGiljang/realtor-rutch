import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPES = ["house", "condo", "land", "commercial"];
const CATEGORIES = ["sale", "rent"];

const pick = (v: string | null) => (typeof v === "string" ? v : "");

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  // Same filters as the admin listings page. Only known values are accepted.
  const type = TYPES.includes(pick(params.get("type")))
    ? pick(params.get("type"))
    : "";
  const category = CATEGORIES.includes(pick(params.get("category")))
    ? pick(params.get("category"))
    : "";
  const q = pick(params.get("q")).trim().slice(0, 100);

  const where: Prisma.PropertyWhereInput = {};
  if (type) where.type = type;
  if (category) where.listingCategory = category;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { referenceName: { contains: q, mode: "insensitive" } },
      { building: { contains: q, mode: "insensitive" } },
      { barangay: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ];
  }

  const properties = await db.property.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://realtor-rutch.com"
  ).replace(/\/$/, "");

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Realtor Rutch";
  const sheet = workbook.addWorksheet("Listings");

  sheet.columns = [
    { header: "Title", key: "title", width: 60 },
    { header: "Reference", key: "referenceName", width: 22 },
    { header: "Status", key: "status", width: 11 },
    { header: "Listing", key: "listingCategory", width: 10 },
    { header: "Type", key: "type", width: 12 },
    { header: "Subtype", key: "subtype", width: 14 },
    { header: "Price (PHP)", key: "price", width: 16 },
    { header: "City", key: "city", width: 16 },
    { header: "Barangay", key: "barangay", width: 16 },
    { header: "Building", key: "building", width: 22 },
    { header: "Address", key: "address", width: 45 },
    { header: "Beds", key: "beds", width: 7 },
    { header: "Baths", key: "baths", width: 7 },
    { header: "Floor area (sqm)", key: "sqft", width: 16 },
    { header: "Lot size", key: "lotSize", width: 10 },
    { header: "Garage", key: "garage", width: 8 },
    { header: "Year built", key: "yearBuilt", width: 11 },
    { header: "Floor", key: "propertyFloor", width: 8 },
    { header: "Ownership", key: "ownershipType", width: 16 },
    { header: "Featured", key: "featured", width: 10 },
    { header: "Luxury", key: "luxury", width: 9 },
    { header: "Slug", key: "slug", width: 40 },
    { header: "URL", key: "url", width: 50 },
    { header: "Created", key: "createdAt", width: 18 },
    { header: "Updated", key: "updatedAt", width: 18 },
  ];

  for (const p of properties) {
    sheet.addRow({
      title: p.title,
      referenceName: p.referenceName ?? "",
      status: p.status,
      listingCategory: p.listingCategory,
      type: p.type,
      subtype: p.subtype ?? "",
      price: p.price,
      city: p.city,
      barangay: p.barangay ?? "",
      building: p.building ?? "",
      address: p.address,
      beds: p.beds,
      baths: p.baths,
      sqft: p.sqft,
      lotSize: p.lotSize ?? "",
      garage: p.garage ?? "",
      yearBuilt: p.yearBuilt ?? "",
      propertyFloor: p.propertyFloor ?? "",
      ownershipType: p.ownershipType ?? "",
      featured: p.featured ? "Yes" : "No",
      luxury: p.luxury ? "Yes" : "No",
      slug: p.slug,
      url: `${siteUrl}/property/${p.slug}`,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    });
  }

  // Header styling, frozen header row, filter dropdowns
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFAF9F6" } };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1A1A1A" },
  };
  header.alignment = { vertical: "middle" };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columns.length },
  };

  sheet.getColumn("price").numFmt = "#,##0";
  sheet.getColumn("createdAt").numFmt = "yyyy-mm-dd hh:mm";
  sheet.getColumn("updatedAt").numFmt = "yyyy-mm-dd hh:mm";

  const buffer = await workbook.xlsx.writeBuffer();
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="listings-${date}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}