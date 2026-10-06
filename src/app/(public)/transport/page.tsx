"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Package, ArrowRight, Search, MapPin, Calendar, Users, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { COUNTRY_LABELS } from "@/lib/constants";
import { formatDate, formatCurrency, getOccupancyLevel } from "@/lib/utils";

const LIMIT = 10;

interface TripResult {
  id: string;
  originCity: string;
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  route: string | null;
  departureDate: string;
  departureTime: string;
  estimatedArrival: string | null;
  totalSeats: number;
  availableSeats: number;
  pricePerSeat: number;
  vehicleInfo: string | null;
  stops?: { price: number }[];
}

function TransportSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");
  const [date, setDate] = useState(searchParams.get("date") || "");
  const [passengers, setPassengers] = useState(parseInt(searchParams.get("passengers") || "1") || 1);
  const [trips, setTrips] = useState<TripResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const today = new Date().toISOString().split("T")[0];

  async function doSearch(searchPage: number) {
    setLoading(true);

    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (date) params.set("date", date);
    params.set("passengers", String(passengers));
    params.set("page", String(searchPage));
    params.set("limit", String(LIMIT));

    try {
      const res = await fetch(`/api/transport/cautare?${params}`);
      const data = await res.json();
      setTrips(data.trips || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 0);
    } catch {
      setTrips([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearched(true);
    doSearch(1);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    doSearch(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <Package className="h-6 w-6 text-blue-300" />
            <span className="text-lg font-semibold">CourierTrack</span>
          </Link>
          <Link href="/" className="text-sm text-blue-200 hover:text-white">
            ← Înapoi
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transport Persoane</h1>
          <p className="text-gray-600">Caută curse disponibile și rezervă locuri online</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="rounded-xl border bg-white p-6 shadow-sm mb-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Plecare
              </label>
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="ex: București, Galați..."
                className="w-full rounded-lg border px-3 py-2.5 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Destinație
              </label>
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="ex: Amsterdam, Berlin..."
                className="w-full rounded-lg border px-3 py-2.5 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                className="w-full rounded-lg border px-3 py-2.5 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Users className="h-3 w-3" /> Pasageri
              </label>
              <input
                type="number"
                value={passengers}
                onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
                min={1}
                max={10}
                className="w-full rounded-lg border px-3 py-2.5 text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Search className="h-4 w-4" />
                {loading ? "Se caută..." : "Caută"}
              </button>
            </div>
          </div>
        </form>

        {/* Results */}
        {searched && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {total > 0
                ? `${total} ${total === 1 ? "cursă găsită" : "curse găsite"}`
                : "Nicio cursă găsită"}
            </h2>

            {trips.length === 0 && (
              <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
                <p>Nu am găsit curse pentru căutarea ta.</p>
                <p className="text-sm mt-2">Încearcă o altă dată sau destinație.</p>
              </div>
            )}

            {trips.map((trip) => {
              const occupancy = getOccupancyLevel(trip.totalSeats, trip.availableSeats);
              return (
                <div key={trip.id} className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Route Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <p className="text-xl font-bold text-gray-900">{trip.departureTime}</p>
                          <p className="text-sm text-gray-600">{trip.originCity}</p>
                          {trip.originCountry !== "RO" && (
                            <p className="text-xs text-gray-400">{COUNTRY_LABELS[trip.originCountry] || trip.originCountry}</p>
                          )}
                        </div>
                        <div className="flex-1 flex items-center gap-2 px-2">
                          <div className="flex-1 border-t border-dashed border-gray-300" />
                          <ArrowRight className="h-4 w-4 text-gray-400 shrink-0" />
                          <div className="flex-1 border-t border-dashed border-gray-300" />
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            {trip.estimatedArrival
                              ? new Date(trip.estimatedArrival).toLocaleDateString("ro-RO", { day: "numeric", month: "short" })
                              : "—"}
                          </p>
                          <p className="text-sm text-gray-600">{trip.destinationCity}</p>
                          {trip.destinationCountry !== "RO" && (
                            <p className="text-xs text-gray-400">{COUNTRY_LABELS[trip.destinationCountry] || trip.destinationCountry}</p>
                          )}
                        </div>
                      </div>
                      {trip.route && (
                        <p className="text-xs text-gray-400 mt-1">
                          <Clock className="h-3 w-3 inline mr-1" />
                          Ruta: {trip.route}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(trip.departureDate)}
                      </p>
                    </div>

                    {/* Occupancy & Price */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 sm:min-w-[140px]">
                      <span className={`text-xs font-medium ${occupancy.color}`}>
                        {occupancy.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {trip.availableSeats} locuri libere
                      </span>
                      {(() => {
                        const hasStops = trip.stops && trip.stops.length > 0;
                        const minPrice = hasStops
                          ? Math.min(...trip.stops!.map((s) => s.price), trip.pricePerSeat)
                          : trip.pricePerSeat;
                        if (minPrice > 0) {
                          return (
                            <span className="text-lg font-bold text-blue-700">
                              {hasStops && "de la "}{formatCurrency(minPrice)}
                              <span className="text-xs font-normal text-gray-400"> /loc</span>
                            </span>
                          );
                        }
                        return <span className="text-sm text-gray-500">Preț la cerere</span>;
                      })()}
                    </div>

                    {/* Book Button */}
                    <div>
                      <button
                        onClick={() => router.push(`/transport/rezervare/${trip.id}?passengers=${passengers}`)}
                        className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 whitespace-nowrap"
                      >
                        Rezervă
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1 || loading}
                  className="flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Pagina {page} din {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages || loading}
                  className="flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Următor
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TransportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">Se încarcă...</div>}>
      <TransportSearchContent />
    </Suspense>
  );
}
