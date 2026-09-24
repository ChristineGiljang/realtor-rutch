import { NextRequest, NextResponse } from "next/server";
import { getNearbyPlaces } from "@/lib/nearby-places";

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "lat and lng are required" },
      { status: 400 },
    );
  }

  if (!process.env.GEOAPIFY_API_KEY) {
    return NextResponse.json(
      { error: "Geoapify API key not configured" },
      { status: 500 },
    );
  }

  const result = await getNearbyPlaces(parseFloat(lat), parseFloat(lng));
  return NextResponse.json(result);
}
