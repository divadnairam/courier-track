"use client";

import { useEffect, useState, useRef } from "react";

interface LiveMapProps {
  latitude: number;
  longitude: number;
}

export default function LiveMap({ latitude, longitude }: LiveMapProps) {
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: typeof import("react-leaflet").MapContainer;
    TileLayer: typeof import("react-leaflet").TileLayer;
    Marker: typeof import("react-leaflet").Marker;
    useMap: typeof import("react-leaflet").useMap;
    L: typeof import("leaflet");
  } | null>(null);

  useEffect(() => {
    async function load() {
      const [rl, L] = await Promise.all([
        import("react-leaflet"),
        import("leaflet"),
      ]);

      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;

      setMapComponents({
        MapContainer: rl.MapContainer,
        TileLayer: rl.TileLayer,
        Marker: rl.Marker,
        useMap: rl.useMap,
        L,
      });
    }
    load();
  }, []);

  if (!MapComponents) {
    return (
      <div className="rounded-lg bg-gray-50 h-[400px] flex items-center justify-center text-sm text-gray-500">
        Se încarcă harta...
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, useMap, L } = MapComponents;

  const courierIcon = L.divIcon({
    className: "",
    html: `<div style="position:relative">
      <div style="
        background: #ef4444;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(239,68,68,0.5);
      "></div>
      <div style="
        position: absolute;
        inset: -8px;
        border-radius: 50%;
        border: 2px solid #ef4444;
        animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
        opacity: 0.4;
      "></div>
    </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });

  function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    const firstRender = useRef(true);

    useEffect(() => {
      if (firstRender.current) {
        firstRender.current = false;
        return;
      }
      map.panTo([lat, lng], { animate: true, duration: 1 });
    }, [lat, lng, map]);

    return null;
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div className="rounded-lg overflow-hidden border" style={{ height: 400 }}>
        <MapContainer
          center={[latitude, longitude]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[latitude, longitude]} icon={courierIcon} />
          <RecenterMap lat={latitude} lng={longitude} />
        </MapContainer>
      </div>
    </>
  );
}
