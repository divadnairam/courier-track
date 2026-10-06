"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Suspense } from "react";
import { Package, MapPin, Calendar, Clock, Navigation, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { COUNTRY_LABELS, TRIP_STATUS_LABELS, TRIP_STATUS_COLORS, type TripStatus } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { use } from "react";

interface TrackingData {
  trip: {
    status: string;
    originCity: string;
    originCountry: string;
    destinationCity: string;
    destinationCountry: string;
    departureDate: string;
    departureTime: string;
    estimatedArrival: string | null;
    route: string | null;
  };
  location: {
    latitude: number;
    longitude: number;
    speed: number | null;
    heading: number | null;
    updatedAt: string;
  } | null;
  live: boolean;
}

function TrackingContent({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = use(params);
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchTracking = useCallback(async () => {
    try {
      const res = await fetch(`/api/transport/rezervare/${ref}/tracking`);
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Eroare la încărcarea datelor");
      }
      const json = await res.json();
      setData(json);
      setLastRefresh(new Date());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la încărcarea datelor");
    } finally {
      setLoading(false);
    }
  }, [ref]);

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 30000);
    return () => clearInterval(interval);
  }, [fetchTracking]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const tripStatus = data?.trip.status as TripStatus;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <header className="bg-blue-900 text-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <Package className="h-6 w-6 text-blue-300" />
            <span className="text-lg font-semibold">CourierTrack</span>
          </Link>
          <Link href={`/transport/confirmare/${ref}`} className="text-sm text-blue-200 hover:text-white">
            ← Detalii rezervare
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {error ? (
          <div className="rounded-xl border bg-white p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-700">{error}</p>
            <Link href="/transport" className="text-sm text-blue-600 hover:underline mt-4 inline-block">
              Caută altă cursă
            </Link>
          </div>
        ) : data && (
          <div className="space-y-6">
            {/* Tracking Header */}
            <div className="rounded-xl border bg-white p-6 shadow-sm text-center">
              <Navigation className="h-10 w-10 text-blue-500 mx-auto mb-3" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Urmărire Cursă</h1>
              <p className="text-sm text-gray-500 font-mono">{ref.toUpperCase()}</p>

              <div className="mt-4">
                <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${TRIP_STATUS_COLORS[tripStatus]}`}>
                  {TRIP_STATUS_LABELS[tripStatus]}
                </span>
              </div>
            </div>

            {/* Route Info */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      {data.trip.originCity}
                      {data.trip.originCountry !== "RO" && `, ${COUNTRY_LABELS[data.trip.originCountry]}`}
                    </p>
                    <p className="text-xs text-gray-400">Plecare</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      {data.trip.destinationCity}
                      {data.trip.destinationCountry !== "RO" && `, ${COUNTRY_LABELS[data.trip.destinationCountry]}`}
                    </p>
                    <p className="text-xs text-gray-400">Destinație</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{formatDate(data.trip.departureDate)}</p>
                    <p className="text-xs text-gray-400">Data plecare</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{data.trip.departureTime}</p>
                    <p className="text-xs text-gray-400">Ora plecare</p>
                  </div>
                </div>
              </div>
              {data.trip.route && (
                <p className="text-xs text-gray-400 mt-4">Ruta: {data.trip.route}</p>
              )}
            </div>

            {/* Live Location / Status Message */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              {data.live && data.location ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <h2 className="text-sm font-semibold text-green-700">Poziție curier - Live</h2>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-gray-400">Latitudine</p>
                      <p className="text-sm font-mono">{data.location.latitude.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Longitudine</p>
                      <p className="text-sm font-mono">{data.location.longitude.toFixed(6)}</p>
                    </div>
                    {data.location.speed != null && (
                      <div>
                        <p className="text-xs text-gray-400">Viteză</p>
                        <p className="text-sm">{Math.round(data.location.speed)} km/h</p>
                      </div>
                    )}
                    {data.location.heading != null && (
                      <div>
                        <p className="text-xs text-gray-400">Direcție</p>
                        <p className="text-sm">{Math.round(data.location.heading)}°</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-4">
                    Ultima actualizare: {new Date(data.location.updatedAt).toLocaleString("ro-RO")}
                  </p>
                </>
              ) : data.trip.status === "PROGRAMAT" ? (
                <div className="text-center py-4">
                  <Clock className="h-10 w-10 text-blue-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium">Cursa nu a început încă</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Plecare programată: {formatDate(data.trip.departureDate)}, ora {data.trip.departureTime}
                  </p>
                </div>
              ) : data.trip.status === "FINALIZAT" ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium">Cursa s-a încheiat</p>
                  <p className="text-sm text-gray-500 mt-1">Călătorie finalizată cu succes</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Navigation className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium">Cursa este în desfășurare</p>
                  <p className="text-sm text-gray-500 mt-1">Poziția curierului nu este disponibilă momentan</p>
                </div>
              )}
            </div>

            {/* Auto-refresh indicator */}
            <div className="text-center">
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Actualizare automată la fiecare 30 secunde
                <span className="mx-1">·</span>
                Ultima verificare: {lastRefresh.toLocaleTimeString("ro-RO")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackingPage({ params }: { params: Promise<{ ref: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>}>
      <TrackingContent params={params} />
    </Suspense>
  );
}
