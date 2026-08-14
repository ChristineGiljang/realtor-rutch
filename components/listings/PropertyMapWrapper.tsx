"use client";

import dynamic from "next/dynamic";

const PropertyMap = dynamic(() => import("@/components/listings/PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] bg-[#E2D9C8] flex items-center justify-center text-[#8B7355] text-sm border border-[#E2D9C8]">
      Loading map…
    </div>
  ),
});

interface Props {
  lat: number;
  lng: number;
  title: string;
  address: string;
}

export default function PropertyMapWrapper({
  lat,
  lng,
  title,
  address,
}: Props) {
  return <PropertyMap lat={lat} lng={lng} title={title} address={address} />;
}
