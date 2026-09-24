import { getNearbyPlaces } from "@/lib/nearby-places";
import NearbyAmenitiesWrapper from "@/components/listings/NearbyAmenitiesWrapper";

interface Props {
  lat: number;
  lng: number;
}

export default async function NearbyAmenitiesSection({ lat, lng }: Props) {
  const { places, isoline } = await getNearbyPlaces(lat, lng);
  return (
    <NearbyAmenitiesWrapper
      lat={lat}
      lng={lng}
      initialPlaces={places}
      initialIsoline={isoline}
    />
  );
}
