"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { COUNTRY_LABELS } from "@/lib/constants";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface LabelData {
  parcel: {
    awb: string;
    pickupAddress: string;
    pickupCity: string;
    pickupCountry: string;
    deliveryAddress: string;
    deliveryCity: string;
    deliveryCountry: string;
    weight: number | null;
    content: string | null;
    cashOnDelivery: number | null;
    sender: { name: string; phone: string; city: string; county: string; country: string };
    receiver: { name: string; phone: string; city: string; county: string; country: string; address: string };
  };
  qrDataUrl: string;
  trackingUrl: string;
}

export default function EtichetaPage() {
  const params = useParams();
  const [data, setData] = useState<LabelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/colete/${params.id}/eticheta`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Se generează eticheta...
      </div>
    );
  }

  if (!data) return null;

  const { parcel, qrDataUrl } = data;

  function formatLocation(city: string, country: string) {
    const countryLabel = COUNTRY_LABELS[country] || country;
    return country === "RO" ? city : `${city}, ${countryLabel}`;
  }

  return (
    <div>
      {/* Controls - hidden when printing */}
      <div className="print:hidden mb-6 flex items-center gap-4">
        <Link
          href={`/dashboard/colete/${params.id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Înapoi la colet
        </Link>
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />
          Printează Eticheta
        </Button>
      </div>

      {/* Label - printable area */}
      <div className="flex justify-center">
        <div className="label-container w-[400px] border-2 border-black bg-white p-0 font-sans text-black">
          {/* Header */}
          <div className="bg-black text-white text-center py-2 px-4">
            <h1 className="text-xl font-bold tracking-wider">CourierTrack</h1>
          </div>

          {/* AWB + QR */}
          <div className="flex border-b-2 border-black">
            <div className="flex-1 p-3 border-r-2 border-black">
              <div className="text-[10px] text-gray-500 uppercase font-bold">AWB</div>
              <div className="text-lg font-mono font-bold tracking-wide">{parcel.awb}</div>
              <div className="mt-2 text-[10px] text-gray-500 uppercase font-bold">Rută</div>
              <div className="text-sm font-bold">
                {formatLocation(parcel.pickupCity, parcel.pickupCountry)}
                {" → "}
                {formatLocation(parcel.deliveryCity, parcel.deliveryCountry)}
              </div>
            </div>
            <div className="p-2 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="QR Code Tracking"
                width={120}
                height={120}
                className="block"
              />
            </div>
          </div>

          {/* Sender */}
          <div className="p-3 border-b-2 border-black">
            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Expeditor</div>
            <div className="text-sm font-bold">{parcel.sender.name}</div>
            <div className="text-xs">{parcel.pickupAddress}</div>
            <div className="text-xs">
              {parcel.pickupCity}
              {parcel.sender.county ? `, ${parcel.sender.county}` : ""}
              {parcel.pickupCountry !== "RO" ? `, ${COUNTRY_LABELS[parcel.pickupCountry]}` : ""}
            </div>
            <div className="text-xs">Tel: {parcel.sender.phone}</div>
          </div>

          {/* Receiver - larger, more prominent */}
          <div className="p-3 border-b-2 border-black bg-gray-50">
            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Destinatar</div>
            <div className="text-base font-bold">{parcel.receiver.name}</div>
            <div className="text-sm">{parcel.deliveryAddress}</div>
            <div className="text-sm font-semibold">
              {parcel.deliveryCity}
              {parcel.receiver.county ? `, ${parcel.receiver.county}` : ""}
              {parcel.deliveryCountry !== "RO" ? `, ${COUNTRY_LABELS[parcel.deliveryCountry]}` : ""}
            </div>
            <div className="text-sm">Tel: {parcel.receiver.phone}</div>
          </div>

          {/* Details row */}
          <div className="flex text-center border-b border-black">
            <div className="flex-1 p-2 border-r border-black">
              <div className="text-[10px] text-gray-500 uppercase font-bold">Greutate</div>
              <div className="text-sm font-bold">{parcel.weight ? `${parcel.weight} kg` : "-"}</div>
            </div>
            <div className="flex-1 p-2 border-r border-black">
              <div className="text-[10px] text-gray-500 uppercase font-bold">Conținut</div>
              <div className="text-sm font-bold">{parcel.content || "-"}</div>
            </div>
            <div className="flex-1 p-2">
              <div className="text-[10px] text-gray-500 uppercase font-bold">Ramburs</div>
              <div className={`text-sm font-bold ${parcel.cashOnDelivery ? "text-red-600" : ""}`}>
                {parcel.cashOnDelivery ? `${parcel.cashOnDelivery} RON` : "-"}
              </div>
            </div>
          </div>

          {/* QR instruction */}
          <div className="text-center py-2 text-[9px] text-gray-400">
            Scanați codul QR pentru a urmări coletul în timp real
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .label-container,
          .label-container * {
            visibility: visible;
          }
          .label-container {
            position: absolute;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
            width: 100mm !important;
            border: 2px solid black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            size: 100mm auto;
            margin: 5mm;
          }
        }
      `}</style>
    </div>
  );
}
