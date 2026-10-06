"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Suspense } from "react";
import { Package, CheckCircle, XCircle, Calendar, MapPin, User, Phone, Mail, Ticket, Navigation, QrCode } from "lucide-react";
import { COUNTRY_LABELS } from "@/lib/constants";
import { formatDate, formatCurrency } from "@/lib/utils";
import { use } from "react";
import QRCode from "qrcode";

interface BookingInfo {
  bookingRef: string;
  status: string;
  name: string;
  phone: string;
  email: string | null;
  seatCount: number;
  price: number;
  parcelCount: number;
  parcelWeight: number;
  destinationCity: string | null;
  destinationCountry: string | null;
  createdAt: string;
  trip: {
    originCity: string;
    originCountry: string;
    destinationCity: string;
    destinationCountry: string;
    route: string | null;
    departureDate: string;
    departureTime: string;
    estimatedArrival: string | null;
    vehicleInfo: string | null;
    status: string;
  };
}

function ConfirmationContent({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = use(params);
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/transport/rezervare/${ref}`)
      .then((res) => {
        if (!res.ok) throw new Error("Rezervarea nu a fost găsită");
        return res.json();
      })
      .then((data) => {
        setBooking(data);
        // Generate QR code if booking has parcels
        if (data.parcelCount > 0) {
          const qrData = JSON.stringify({
            ref: data.bookingRef,
            name: data.name,
            dest: data.destinationCity || data.trip.destinationCity,
            seats: data.seatCount,
            parcels: data.parcelCount,
            weight: data.parcelWeight,
          });
          QRCode.toDataURL(qrData, { width: 200, margin: 2 }).then(setQrUrl);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [ref]);

  async function handleCancel() {
    if (!confirm("Sunteți sigur că doriți să anulați rezervarea?")) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/transport/rezervare/${ref}/anulare`, { method: "PUT" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la anulare");
      setBooking((prev) => prev ? { ...prev, status: "ANULATA" } : null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Eroare la anulare");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        Se încarcă...
      </div>
    );
  }

  const isCancelled = booking?.status === "ANULATA";
  const canCancel = booking?.status === "CONFIRMATA" && booking?.trip.status === "PROGRAMAT";
  const canTrack = booking?.status === "CONFIRMATA" && booking?.trip.status !== "PROGRAMAT";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <header className="bg-blue-900 text-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <Package className="h-6 w-6 text-blue-300" />
            <span className="text-lg font-semibold">CourierTrack</span>
          </Link>
          <Link href="/transport" className="text-sm text-blue-200 hover:text-white">
            Caută altă cursă
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {error ? (
          <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
            {error}
          </div>
        ) : booking && (
          <div className="space-y-6">
            {/* Status Header */}
            <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
              {isCancelled ? (
                <>
                  <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Rezervare Anulată</h1>
                  <p className="text-gray-600 mb-6">Această rezervare a fost anulată</p>
                </>
              ) : (
                <>
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Rezervare Confirmată!</h1>
                  <p className="text-gray-600 mb-6">Salvați numărul de referință pentru verificare ulterioară</p>
                </>
              )}
              <div className="inline-block rounded-lg bg-blue-50 border-2 border-blue-200 px-8 py-4">
                <p className="text-xs text-gray-500 mb-1">Referință rezervare</p>
                <p className="text-3xl font-mono font-bold text-blue-700 tracking-wider">{booking.bookingRef}</p>
              </div>
            </div>

            {/* Trip Details */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">Detalii Cursă</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      {booking.trip.originCity}
                      {booking.trip.originCountry !== "RO" && `, ${COUNTRY_LABELS[booking.trip.originCountry]}`}
                    </p>
                    <p className="text-xs text-gray-400">Plecare</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      {booking.destinationCity || booking.trip.destinationCity}
                      {(booking.destinationCountry || booking.trip.destinationCountry) !== "RO" &&
                        `, ${COUNTRY_LABELS[booking.destinationCountry || booking.trip.destinationCountry]}`}
                    </p>
                    <p className="text-xs text-gray-400">Destinație pasager</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{formatDate(booking.trip.departureDate)}</p>
                    <p className="text-xs text-gray-400">Data plecare</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Ticket className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{booking.trip.departureTime}</p>
                    <p className="text-xs text-gray-400">Ora plecare</p>
                  </div>
                </div>
              </div>
              {booking.trip.route && (
                <p className="text-xs text-gray-400 mt-4">Ruta: {booking.trip.route}</p>
              )}
              {booking.trip.vehicleInfo && (
                <p className="text-xs text-gray-400 mt-1">Vehicul: {booking.trip.vehicleInfo}</p>
              )}
            </div>

            {/* Passenger Details */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">Detalii Pasager</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{booking.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{booking.phone}</span>
                </div>
                {booking.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{booking.email}</span>
                  </div>
                )}
              </div>
              {booking.parcelCount > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {booking.parcelCount} {booking.parcelCount === 1 ? "colet" : "colete"} — {booking.parcelWeight} kg
                    </span>
                  </div>
                </div>
              )}
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <span className="text-sm text-gray-600">{booking.seatCount} {booking.seatCount === 1 ? "loc" : "locuri"}</span>
                <span className="text-xl font-bold text-blue-700">
                  {booking.price > 0 ? formatCurrency(booking.price) : "Preț la cerere"}
                </span>
              </div>
            </div>

            {/* QR Code for parcels */}
            {qrUrl && booking.parcelCount > 0 && !isCancelled && (
              <div className="rounded-xl border bg-white p-6 shadow-sm text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <QrCode className="h-5 w-5 text-blue-500" />
                  <h2 className="text-sm font-semibold text-gray-500 uppercase">Cod QR Colete</h2>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Prezentați acest cod la îmbarcare pentru verificarea coletelor
                </p>
                <img src={qrUrl} alt="QR Code colete" className="mx-auto mb-4" />
                <div className="text-sm text-gray-600 mb-4">
                  <p className="font-medium">{booking.name}</p>
                  <p>Ref: {booking.bookingRef}</p>
                  <p>{booking.parcelCount} {booking.parcelCount === 1 ? "colet" : "colete"} — {booking.parcelWeight} kg</p>
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.download = `QR-colete-${booking.bookingRef}.png`;
                      link.href = qrUrl;
                      link.click();
                    }}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Descarcă QR
                  </button>
                  <button
                    onClick={() => {
                      const w = window.open();
                      if (w) {
                        w.document.write(`
                          <html><head><title>QR Colete - ${booking.bookingRef}</title></head>
                          <body style="text-align:center;font-family:sans-serif;padding:40px">
                            <h2>${booking.name}</h2>
                            <p>Ref: ${booking.bookingRef}</p>
                            <p>Destinație: ${booking.destinationCity || booking.trip.destinationCity}</p>
                            <p>${booking.parcelCount} ${booking.parcelCount === 1 ? "colet" : "colete"} — ${booking.parcelWeight} kg</p>
                            <img src="${qrUrl}" />
                          </body></html>
                        `);
                        w.document.close();
                        w.print();
                      }
                    }}
                    className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                  >
                    Printează QR
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => window.print()}
                className="rounded-lg border px-6 py-2.5 text-sm font-medium hover:bg-gray-50"
              >
                Printează
              </button>
              {canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="rounded-lg border border-red-300 text-red-600 px-6 py-2.5 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                >
                  {cancelling ? "Se anulează..." : "Anulează rezervarea"}
                </button>
              )}
              {canTrack && (
                <Link
                  href={`/transport/tracking/${booking.bookingRef}`}
                  className="rounded-lg border border-blue-300 text-blue-600 px-6 py-2.5 text-sm font-medium hover:bg-blue-50 flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  Urmărește cursa live
                </Link>
              )}
              <Link
                href="/transport"
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Caută altă cursă
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmationPage({ params }: { params: Promise<{ ref: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">Se încarcă...</div>}>
      <ConfirmationContent params={params} />
    </Suspense>
  );
}
