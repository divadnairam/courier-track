import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { COUNTRY_LABELS } from "@/lib/constants";
import Link from "next/link";
import { Package, MapPin, Truck } from "lucide-react";
import QRCode from "qrcode";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function NotificarePage({
  params,
}: {
  params: Promise<{ awb: string }>;
}) {
  const { awb } = await params;

  const parcel = await prisma.parcel.findUnique({
    where: { awb: awb.toUpperCase() },
    select: {
      awb: true,
      pickupCity: true,
      pickupCountry: true,
      deliveryCity: true,
      deliveryCountry: true,
      weight: true,
      length: true,
      width: true,
      height: true,
      sender: { select: { name: true, companyName: true } },
      receiver: { select: { name: true, companyName: true } },
    },
  });

  if (!parcel) notFound();

  const senderName = parcel.sender.companyName || parcel.sender.name;
  const originCountryLabel = COUNTRY_LABELS[parcel.pickupCountry] || parcel.pickupCountry;
  const destCountryLabel = COUNTRY_LABELS[parcel.deliveryCountry] || parcel.deliveryCountry;

  const baseUrl = process.env.NEXTAUTH_URL || "https://aplicatie-pi.vercel.app";
  const trackingUrl = `${baseUrl}/tracking?awb=${parcel.awb}`;

  const qrCodeSvg = await QRCode.toString(trackingUrl, {
    type: "svg",
    width: 160,
    margin: 1,
    color: { dark: "#1e3a5f", light: "#ffffff" },
  });

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-blue-800 text-white px-5 py-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase tracking-wide opacity-80">De la:</p>
              <p className="font-bold">{senderName}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <Truck className="h-3.5 w-3.5" />
                <div>
                  <p className="font-semibold text-sm">{parcel.pickupCity},</p>
                  <p className="text-xs">{originCountryLabel.toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-end mt-2">
            <div>
              <p className="text-[10px] uppercase tracking-wide opacity-80">Livrare estimată:</p>
              <p className="font-semibold text-sm">În curând</p>
            </div>
            <div className="text-right flex items-center gap-1.5 justify-end">
              <MapPin className="h-3.5 w-3.5" />
              <div>
                <p className="font-semibold text-sm">{parcel.deliveryCity},</p>
                <p className="text-xs">{destCountryLabel.toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-white">
          {/* Hero message */}
          <div className="px-5 py-6">
            <h1 className="text-xl font-bold text-blue-700 mb-3">
              Coletul tău va ajunge în curând!
            </h1>
            <p className="text-sm text-gray-600">
              Vești bune! <strong>{senderName}</strong> a expediat un colet pentru tine.
              Coletul va fi livrat la adresa indicată.
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Numărul de urmărire este <strong>{parcel.awb}</strong>
            </p>

            {/* QR Code */}
            <div className="mt-5 flex flex-col items-center">
              <p className="text-xs text-gray-500 mb-2">Scanează pentru urmărire:</p>
              <div
                className="bg-white rounded-lg border border-gray-200 p-3"
                dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
              />
              <p className="text-[11px] text-gray-400 mt-1.5 font-mono">{parcel.awb}</p>
            </div>

            <Link
              href={`/tracking?awb=${parcel.awb}`}
              className="mt-5 block w-full text-center bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              Urmărește coletul
            </Link>
          </div>

          {/* Shipment details */}
          <div className="border-t px-5 py-5">
            <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              Detalii colet
            </h2>
            <div className="space-y-1.5 text-sm">
              {parcel.weight && (
                <p><span className="font-semibold">Greutate:</span> {parcel.weight} kg</p>
              )}
              <p><span className="font-semibold">Referință:</span> {parcel.awb}</p>
              {(parcel.width || parcel.height || parcel.length) && (
                <p>
                  <span className="font-semibold">Dimensiuni:</span>{" "}
                  {[parcel.length, parcel.width, parcel.height].filter(Boolean).join(" × ")} cm
                </p>
              )}
            </div>
          </div>

          {/* Customer information */}
          <div className="border-t bg-gray-50 px-5 py-5">
            <h2 className="text-base font-bold text-gray-800 mb-3">Informații expediere</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-gray-500 mb-1">Expeditor:</p>
                <p className="font-medium">{senderName}</p>
                <p className="text-gray-600">{parcel.pickupCity}</p>
                <p className="text-gray-600">{originCountryLabel}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-500 mb-1">Destinatar:</p>
                <p className="font-medium">{parcel.receiver.companyName || parcel.receiver.name}</p>
                <p className="text-gray-600">{parcel.deliveryCity}</p>
                <p className="text-gray-600">{destCountryLabel}</p>
              </div>
            </div>
          </div>

          {/* Help section */}
          <div className="border-t px-5 py-4">
            <h2 className="text-base font-bold text-gray-800 mb-1">Ai nevoie de ajutor?</h2>
            <p className="text-sm text-gray-600">
              Dacă ai întrebări despre coletul tău,{" "}
              <a href="mailto:contact@couriertrack.ro" className="text-blue-600 hover:underline">contactează-ne</a>.
            </p>
          </div>

          {/* Footer */}
          <div className="border-t px-5 py-3 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-600">
              <Package className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">CourierTrack</span>
            </Link>
            <p className="text-[10px] text-gray-400 mt-1">
              Acest mesaj a fost generat automat. Vă rugăm să nu răspundeți la acest email.
            </p>
            <div className="mt-2 text-[10px] text-gray-400">
              <Link href="/politica-confidentialitate" className="hover:underline">Politica de Confidențialitate</Link>
              {" · "}
              <Link href="/termeni" className="hover:underline">Termeni și Condiții</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
