"use client";

import { useEffect, useRef, useState } from "react";
import {
  GraduationCap,
  Store,
  ShoppingCart,
  MapPin,
  PersonStanding,
} from "lucide-react";

interface NearbyPlace {
  name: string;
  category: string;
  lat: number;
  lon: number;
  walkSeconds: number;
}

interface Props {
  lat: number;
  lng: number;
  initialPlaces?: NearbyPlace[];
  initialIsoline?: any;
}

function formatWalk(seconds: number) {
  return `${Math.round(seconds / 60)} min`;
}

function iconFor(category: string) {
  if (category.startsWith("education")) return GraduationCap;
  if (category.startsWith("commercial.shopping_mall")) return Store;
  if (category.startsWith("commercial.convenience")) return ShoppingCart;
  return MapPin;
}

function colorFor(category: string): string {
  if (category.startsWith("education")) return "#4B7F52";
  if (category.startsWith("commercial.shopping_mall")) return "#6B5FA8";
  if (category.startsWith("commercial.convenience")) return "#C97B3D";
  return "#1A1A1A";
}

export default function NearbyAmenities({
  lat,
  lng,
  initialPlaces,
  initialIsoline,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>(initialPlaces ?? []);
  const [loading, setLoading] = useState(initialPlaces === undefined);

  useEffect(() => {
    let cancelled = false;

    function renderMap(places: NearbyPlace[], isoline: any) {
      if (!mapRef.current || mapInstanceRef.current) return;

      import("leaflet").then((L) => {
        if (!mapRef.current || mapInstanceRef.current) return;

        delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
          ._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        const map = L.map(mapRef.current).setView([lat, lng], 14);
        mapInstanceRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        if (isoline) {
          L.geoJSON(isoline, {
            style: {
              color: "#8B7355",
              fillColor: "#C9A96E",
              fillOpacity: 0.15,
              weight: 1.5,
            },
          }).addTo(map);
        }

        L.marker([lat, lng]).addTo(map);

        places.forEach((p) => {
          const color = colorFor(p.category);
          const amenityIcon = L.divIcon({
            className: "",
            html: `<div style="background:${color};width:20px;height:20px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20],
          });
          L.marker([p.lat, p.lon], { icon: amenityIcon })
            .addTo(map)
            .bindPopup(
              `<strong>${p.name}</strong><br/>${formatWalk(p.walkSeconds)} walk`,
            );
        });

        if (isoline) {
          map.fitBounds(L.geoJSON(isoline).getBounds(), { padding: [20, 20] });
        }

        const resizeObserver = new ResizeObserver(() => {
          map.invalidateSize();
        });
        resizeObserver.observe(mapRef.current!);
        resizeObserverRef.current = resizeObserver;
      });
    }

    if (initialPlaces !== undefined) {
      // Server already fetched this (the normal path via
      // NearbyAmenitiesSection) — just render the map, no fetch needed.
      renderMap(initialPlaces, initialIsoline);
    } else {
      // Fallback for any usage outside that server path.
      setLoading(true);
      fetch(`/api/nearby-places?lat=${lat}&lng=${lng}`)
        .then((res) => res.json())
        .then((data) => {
          if (cancelled) return;
          setPlaces(data.places || []);
          setLoading(false);
          renderMap(data.places || [], data.isoline);
        })
        .catch(() => !cancelled && setLoading(false));
    }

    return () => {
      cancelled = true;
      resizeObserverRef.current?.disconnect();
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, initialPlaces, initialIsoline]);

  return (
    <div className="border border-[#E2D9C8] rounded-sm overflow-hidden isolate relative z-0">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
        <div className="max-h-[420px] overflow-y-auto border-b md:border-b-0 md:border-r border-[#E2D9C8]">
          {loading && (
            <p className="p-4 text-sm text-[#8B7355]">
              Finding nearby schools, malls, and convenience stores…
            </p>
          )}
          {!loading && places.length === 0 && (
            <p className="p-4 text-sm text-[#8B7355]">
              No amenities found within a 30-minute walk.
            </p>
          )}
          {places.map((p, i) => {
            const Icon = iconFor(p.category);
            const color = colorFor(p.category);
            return (
              <div
                key={i}
                className="flex items-start gap-3 px-4 py-3 border-b border-[#E2D9C8] last:border-b-0"
              >
                <Icon size={18} style={{ color }} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A] leading-snug">
                    {p.name}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1 text-xs text-[#6B5842] bg-[#F5F0E8] px-2 py-0.5 rounded-full">
                    <PersonStanding size={12} />
                    {formatWalk(p.walkSeconds)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div ref={mapRef} className="w-full h-[380px] md:h-auto" />
      </div>
    </div>
  );
}
