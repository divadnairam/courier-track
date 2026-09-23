"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Navigation, Radio, RadioOff, MapPin } from "lucide-react";
import dynamic from "next/dynamic";

const LiveMap = dynamic(() => import("@/components/shared/live-map"), { ssr: false });

interface Trip {
  id: string;
  originCity: string;
  destinationCity: string;
  status: string;
  departureDate: string;
}

export default function LiveTrackingPage() {
  const { data: session } = useSession();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<string>("");
  const [tracking, setTracking] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState("");
  const [sendCount, setSendCount] = useState(0);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const latestPositionRef = useRef<{ lat: number; lng: number } | null>(null);

  // Fetch active trips
  useEffect(() => {
    fetch("/api/curse?status=active")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTrips(data);
        else if (data.trips) setTrips(data.trips);
      })
      .catch(() => {});
  }, []);

  const sendPosition = useCallback(async () => {
    const pos = latestPositionRef.current;
    if (!pos || !selectedTrip) return;

    try {
      await fetch("/api/courier-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: selectedTrip,
          latitude: pos.lat,
          longitude: pos.lng,
        }),
      });
      setSendCount((c) => c + 1);
    } catch {
      // ignore send errors
    }
  }, [selectedTrip]);

  function startTracking() {
    if (!selectedTrip) {
      setError("Selectează o cursă mai întâi");
      return;
    }
    setError("");
    setTracking(true);
    setSendCount(0);

    if (!navigator.geolocation) {
      setError("GPS-ul nu este disponibil pe acest dispozitiv");
      setTracking(false);
      return;
    }

    // Watch position continuously
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        latestPositionRef.current = coords;
      },
      (err) => {
        setError(
          err.code === 1
            ? "Permite accesul la locație din setările browserului"
            : "Nu s-a putut obține locația GPS"
        );
        setTracking(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );

    // Send position every 30 seconds
    sendPosition();
    intervalRef.current = setInterval(sendPosition, 30000);
  }

  function stopTracking() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTracking(false);
    latestPositionRef.current = null;
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Tracking Live</h1>
        <p className="text-sm text-gray-500 mt-1">
          Transmite poziția ta GPS în timp real pentru o cursă activă
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border bg-white p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selectează cursa
            </label>
            <select
              value={selectedTrip}
              onChange={(e) => setSelectedTrip(e.target.value)}
              disabled={tracking}
              className="w-full rounded-lg border px-3 py-2.5 text-sm disabled:opacity-50"
            >
              <option value="">-- Alege cursa --</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.originCity} → {trip.destinationCity} ({new Date(trip.departureDate).toLocaleDateString("ro-RO")})
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {!tracking ? (
            <button
              onClick={startTracking}
              className="w-full h-14 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-3 text-lg"
            >
              <Radio className="h-6 w-6" />
              Pornește Tracking Live
            </button>
          ) : (
            <button
              onClick={stopTracking}
              className="w-full h-14 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-3 text-lg"
            >
              <RadioOff className="h-6 w-6" />
              Oprește Tracking
            </button>
          )}
        </div>

        {tracking && (
          <div className="rounded-lg border bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <div className="absolute inset-0 h-3 w-3 rounded-full bg-green-500 animate-ping" />
                </div>
                <span className="font-semibold text-green-700">Tracking activ</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Navigation className="h-4 w-4" />
                <span>Poziții trimise: {sendCount}</span>
              </div>
            </div>

            {position && <LiveMap latitude={position.lat} longitude={position.lng} />}

            <p className="text-xs text-gray-400 mt-3">
              Poziția se actualizează automat la fiecare 30 de secunde.
              Păstrează pagina deschisă pe telefon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
