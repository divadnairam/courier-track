"use client";

import { useState } from "react";
import { QrCode } from "lucide-react";
import QRCode from "qrcode";

interface PassengerQRProps {
  bookingRef: string;
  passengerName: string;
  destinationCity: string | null;
  parcelCount: number;
  seatCount: number;
}

export function PassengerQRButton({
  bookingRef,
  passengerName,
  destinationCity,
  parcelCount,
  seatCount,
}: PassengerQRProps) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  async function showQR() {
    const data = JSON.stringify({
      ref: bookingRef,
      name: passengerName,
      dest: destinationCity,
      seats: seatCount,
      parcels: parcelCount,
    });

    const url = await QRCode.toDataURL(data, { width: 300, margin: 2 });
    setQrUrl(url);
  }

  return (
    <>
      <button
        onClick={showQR}
        className="text-gray-500 hover:text-gray-700 p-1"
        title="Cod QR"
      >
        <QrCode className="h-4 w-4" />
      </button>

      {qrUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setQrUrl(null)}
        >
          <div
            className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-lg mb-1">{passengerName}</h3>
            <p className="text-sm text-gray-500 mb-1">Ref: {bookingRef}</p>
            {destinationCity && (
              <p className="text-sm text-gray-500 mb-1">Destinație: {destinationCity}</p>
            )}
            {parcelCount > 0 && (
              <p className="text-sm text-gray-500 mb-1">{parcelCount} {parcelCount === 1 ? "colet" : "colete"}</p>
            )}
            <img src={qrUrl} alt="QR Code" className="mx-auto my-4" />
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.download = `QR-${bookingRef}.png`;
                  link.href = qrUrl;
                  link.click();
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Descarcă
              </button>
              <button
                onClick={() => {
                  const w = window.open();
                  if (w) {
                    w.document.write(`
                      <html><head><title>QR - ${bookingRef}</title></head>
                      <body style="text-align:center;font-family:sans-serif;padding:40px">
                        <h2>${passengerName}</h2>
                        <p>Ref: ${bookingRef}</p>
                        ${destinationCity ? `<p>Destinație: ${destinationCity}</p>` : ""}
                        ${parcelCount > 0 ? `<p>${parcelCount} colet(e)</p>` : ""}
                        <img src="${qrUrl}" />
                      </body></html>
                    `);
                    w.document.close();
                    w.print();
                  }
                }}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Printează
              </button>
              <button
                onClick={() => setQrUrl(null)}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
