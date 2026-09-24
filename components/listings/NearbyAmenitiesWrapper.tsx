"use client";

import dynamic from "next/dynamic";
import type { NearbyPlace } from "@/lib/nearby-places";

const NearbyAmenities = dynamic(
  () => import("@/components/listings/NearbyAmenities"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[420px] bg-[#E2D9C8] flex items-center justify-center text-[#8B7355] text-sm border border-[#E2D9C8]">
        Loading nearby amenities…
      </div>
    ),
  },
);

interface Props {
  lat: number;
  lng: number;
  initialPlaces?: NearbyPlace[];
  initialIsoline?: any;
}

export default function NearbyAmenitiesWrapper({
  lat,
  lng,
  initialPlaces,
  initialIsoline,
}: Props) {
  return (
    <NearbyAmenities
      lat={lat}
      lng={lng}
      initialPlaces={initialPlaces}
      initialIsoline={initialIsoline}
    />
  );
}
