"use client";

import { useEffect, useState } from "react";

const STATUS_LABELS: Record<string, string> = {
  PRELUAT: "Preluat",
  IN_TRANZIT: "În tranzit",
  IN_LIVRARE: "În livrare",
  LIVRAT: "Livrat",
  RETURNAT: "Returnat",
};

interface MapEntry {
  status: string;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string | Date;
}

interface LivePosition {
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export function ParcelMap({
  entries,
  awb,
}: {
  entries: MapEntry[];
  awb?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [livePos, setLivePos] = useState<LivePosition | null>(null);

  const points = entries.filter((e) => e.latitude && e.longitude);

  // Poll for live courier position
  useEffect(() => {
    if (!awb) return;

    let active = true;
    async function poll() {
      try {
        const res = await fetch(`/api/tracking/${awb}/live`);
        const data = await res.json();
        if (active && data.live) {
          setLivePos(data);
        } else if (active) {
          setLivePos(null);
        }
      } catch {
        // ignore
      }
    }

    poll();
    const interval = setInterval(poll, 15000); // poll every 15 seconds
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [awb]);

  const hasData = points.length > 0 || livePos;

  useEffect(() => {
    if (hasData) setMounted(true);
  }, [hasData]);

  if (!hasData) {
    return (
      <div className="rounded-lg border bg-gray-50 p-6 text-center text-sm text-gray-500">
        Nu sunt disponibile date de localizare GPS pentru acest colet.
      </div>
    );
  }

  if (!mounted) return null;

  return <MapInner points={points} livePos={livePos} />;
}

function MapInner({ points, livePos }: { points: MapEntry[]; livePos: LivePosition | null }) {
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: typeof import("react-leaflet").MapContainer;
    TileLayer: typeof import("react-leaflet").TileLayer;
    Marker: typeof import("react-leaflet").Marker;
    Popup: typeof import("react-leaflet").Popup;
    Polyline: typeof import("react-leaflet").Polyline;
    L: typeof import("leaflet");
  } | null>(null);

  useEffect(() => {
    async function loadMap() {
      const [rl, L] = await Promise.all([
        import("react-leaflet"),
        import("leaflet"),
      ]);

      // Fix default marker icons
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      setMapComponents({
        MapContainer: rl.MapContainer,
        TileLayer: rl.TileLayer,
        Marker: rl.Marker,
        Popup: rl.Popup,
        Polyline: rl.Polyline,
        L,
      });
    }
    loadMap();
  }, []);

  if (!MapComponents) {
    return (
      <div className="rounded-lg border bg-gray-50 p-6 text-center text-sm text-gray-500 h-[350px] flex items-center justify-center">
        Se încarcă harta...
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, Polyline, L } = MapComponents;

  const positions = points.map((p) => [p.latitude!, p.longitude!] as [number, number]);

  // Add live position to bounds calculation
  const allPositions = livePos
    ? [...positions, [livePos.latitude, livePos.longitude] as [number, number]]
    : positions;

  // Calculate bounds
  const bounds = L.latLngBounds(allPositions.length > 0 ? allPositions : [[45.9, 25.0]]);

  // Color markers by status
  const statusColors: Record<string, string> = {
    PRELUAT: "#3b82f6",
    IN_TRANZIT: "#f59e0b",
    IN_LIVRARE: "#8b5cf6",
    LIVRAT: "#22c55e",
    RETURNAT: "#ef4444",
  };

  function createIcon(status: string) {
    const color = statusColors[status] || "#3b82f6";
    return L.divIcon({
      className: "",
      html: `<div style="
        background: ${color};
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div className="rounded-lg overflow-hidden border" style={{ height: 350 }}>
        <MapContainer
          bounds={bounds}
          boundsOptions={{ padding: [40, 40] }}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {positions.length > 1 && (
            <Polyline
              positions={positions}
              pathOptions={{ color: "#3b82f6", weight: 3, dashArray: "8 8" }}
            />
          )}
          {points.map((point, i) => (
            <Marker
              key={i}
              position={[point.latitude!, point.longitude!]}
              icon={createIcon(point.status)}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{STATUS_LABELS[point.status] || point.status}</p>
                  {point.location && <p className="text-gray-600">{point.location}</p>}
                  <p className="text-gray-400 text-xs">
                    {new Date(point.createdAt).toLocaleString("ro-RO")}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
          {livePos && (
            <Marker
              position={[livePos.latitude, livePos.longitude]}
              icon={L.divIcon({
                className: "",
                html: `<div style="position:relative">
                  <div style="
                    background: #ef4444;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(239,68,68,0.5);
                  "></div>
                  <div style="
                    position: absolute;
                    inset: -6px;
                    border-radius: 50%;
                    border: 2px solid #ef4444;
                    animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
                    opacity: 0.5;
                  "></div>
                </div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              })}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold text-red-600">Curier - Poziție Live</p>
                  <p className="text-gray-400 text-xs">
                    Actualizat: {new Date(livePos.updatedAt).toLocaleString("ro-RO")}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      {livePos && (
        <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Tracking live activ — se actualizează automat
        </div>
      )}
    </>
  );
}
