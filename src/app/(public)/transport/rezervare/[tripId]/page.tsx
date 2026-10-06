"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Package, MapPin, Calendar, Clock, ArrowRight, BoxIcon } from "lucide-react";
import { COUNTRY_LABELS } from "@/lib/constants";
import { formatDate, formatCurrency, extractApiErrors } from "@/lib/utils";
import { use } from "react";

interface TripStop {
  id: string;
  city: string;
  country: string;
  order: number;
  price: number;
}

interface TripInfo {
  id: string;
  originCity: string;
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  route: string | null;
  departureDate: string;
  departureTime: string;
  estimatedArrival: string | null;
  availableSeats: number;
  pricePerSeat: number;
  stops: TripStop[];
}

function BookingFormContent({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPassengers = parseInt(searchParams.get("passengers") || "1") || 1;

  const [trip, setTrip] = useState<TripInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [seatCount, setSeatCount] = useState(initialPassengers);
  const [parcelCount, setParcelCount] = useState(0);
  const [parcelWeight, setParcelWeight] = useState(0);
  const [selectedStopId, setSelectedStopId] = useState("");

  useEffect(() => {
    fetch(`/api/transport/cursa/${tripId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Cursa nu a fost găsită sau nu mai este disponibilă.");
        return res.json();
      })
      .then(setTrip)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tripId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      tripId,
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string || undefined,
      seatCount,
      parcelCount,
      parcelWeight,
      tripStopId: selectedStopId || undefined,
    };

    try {
      const res = await fetch("/api/transport/rezervare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(extractApiErrors(data));
      }

      const result = await res.json();
      router.push(`/transport/confirmare/${result.bookingRef}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare necunoscută");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        Se încarcă...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <header className="bg-blue-900 text-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <Package className="h-6 w-6 text-blue-300" />
            <span className="text-lg font-semibold">CourierTrack</span>
          </Link>
          <Link href="/transport" className="text-sm text-blue-200 hover:text-white">
            ← Înapoi la căutare
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Rezervare Cursă</h1>

        {error && !trip && (
          <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
            {error}
          </div>
        )}

        {trip && (
          <>
            {/* Trip Summary */}
            <div className="rounded-xl border bg-white p-5 mb-6 shadow-sm">
              <div className="flex items-center gap-4 mb-3">
                <div>
                  <p className="text-xl font-bold">{trip.departureTime}</p>
                  <p className="text-sm text-gray-600">{trip.originCity}</p>
                  {trip.originCountry !== "RO" && (
                    <p className="text-xs text-gray-400">{COUNTRY_LABELS[trip.originCountry]}</p>
                  )}
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">{trip.destinationCity}</p>
                  {trip.destinationCountry !== "RO" && (
                    <p className="text-xs text-gray-400">{COUNTRY_LABELS[trip.destinationCountry]}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {formatDate(trip.departureDate)}
                </span>
                {trip.route && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {trip.route}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {trip.availableSeats} locuri libere
                </span>
              </div>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
              )}

              <div className="space-y-1">
                <label htmlFor="name" className="text-sm font-medium">Nume complet *</label>
                <input id="name" name="name" required className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Ion Popescu" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="phone" className="text-sm font-medium">Telefon *</label>
                  <input id="phone" name="phone" required className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="+40712345678" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="email" className="text-sm font-medium">Email (opțional)</label>
                  <input id="email" name="email" type="email" className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="email@exemplu.ro" />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="seatCount" className="text-sm font-medium">Număr locuri</label>
                <input
                  id="seatCount"
                  type="number"
                  value={seatCount}
                  onChange={(e) => setSeatCount(Math.max(1, Math.min(trip.availableSeats, parseInt(e.target.value) || 1)))}
                  min={1}
                  max={trip.availableSeats}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>

              {/* Destination selection (if trip has stops) */}
              {trip.stops && trip.stops.length > 0 && (
                <div className="space-y-1">
                  <label htmlFor="destination" className="text-sm font-medium">Destinație *</label>
                  <select
                    id="destination"
                    value={selectedStopId}
                    onChange={(e) => setSelectedStopId(e.target.value)}
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="">— Alegeți destinația —</option>
                    {trip.stops.map((stop) => (
                      <option key={stop.id} value={stop.id}>
                        {stop.city} — {stop.price > 0 ? `${stop.price} EUR` : "Preț la cerere"}
                      </option>
                    ))}
                    <option value="final">
                      {trip.destinationCity} (destinație finală) — {trip.pricePerSeat > 0 ? `${trip.pricePerSeat} EUR` : "Preț la cerere"}
                    </option>
                  </select>
                </div>
              )}

              {/* Parcels Section */}
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <BoxIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Colete (opțional)</span>
                </div>
                <p className="text-xs text-gray-500">Puteți adăuga până la 2 colete, greutate maximă totală 40 kg</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="parcelCount" className="text-sm font-medium">Număr colete</label>
                    <select
                      id="parcelCount"
                      value={parcelCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setParcelCount(val);
                        if (val === 0) setParcelWeight(0);
                      }}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                    >
                      <option value={0}>Fără colete</option>
                      <option value={1}>1 colet</option>
                      <option value={2}>2 colete</option>
                    </select>
                  </div>
                  {parcelCount > 0 && (
                    <div className="space-y-1">
                      <label htmlFor="parcelWeight" className="text-sm font-medium">Greutate totală (kg)</label>
                      <input
                        id="parcelWeight"
                        type="number"
                        value={parcelWeight || ""}
                        onChange={(e) => setParcelWeight(Math.min(40, Math.max(0, parseFloat(e.target.value) || 0)))}
                        min={0.1}
                        max={40}
                        step={0.5}
                        required
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        placeholder="ex: 15"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Price Summary */}
              {(() => {
                const hasStops = trip.stops && trip.stops.length > 0;
                const selectedStop = hasStops ? trip.stops.find((s) => s.id === selectedStopId) : null;
                const isFinalDest = selectedStopId === "final";
                const unitPrice = hasStops
                  ? (selectedStop ? selectedStop.price : isFinalDest ? trip.pricePerSeat : 0)
                  : trip.pricePerSeat;
                const showPrice = hasStops ? (selectedStopId !== "") : true;
                const destLabel = selectedStop ? selectedStop.city : isFinalDest ? trip.destinationCity : null;

                return (
                  <div className="rounded-lg bg-blue-50 p-4">
                    {!showPrice ? (
                      <p className="text-sm text-gray-500 text-center">Selectați destinația pentru a vedea prețul</p>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {seatCount} {seatCount === 1 ? "loc" : "locuri"}
                          {destLabel && ` → ${destLabel}`}
                          {" × "}{unitPrice > 0 ? formatCurrency(unitPrice) : "Preț la cerere"}
                        </span>
                        {unitPrice > 0 ? (
                          <span className="text-xl font-bold text-blue-700">
                            {formatCurrency(unitPrice * seatCount)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">Prețul va fi comunicat</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? "Se procesează..." : "Confirmă Rezervarea"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function BookingPage({ params }: { params: Promise<{ tripId: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">Se încarcă...</div>}>
      <BookingFormContent params={params} />
    </Suspense>
  );
}
