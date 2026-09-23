"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Package, QrCode, MapPin, CheckCircle2, AlertCircle, ArrowLeft, Camera, X } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/shared/footer";

const STATUS_LABELS: Record<string, string> = {
  PRELUAT: "Preluat",
  IN_TRANZIT: "În tranzit",
  IN_LIVRARE: "În livrare",
  LIVRAT: "Livrat",
  RETURNAT: "Returnat",
};

function ScanContent() {
  const searchParams = useSearchParams();
  const [awb, setAwb] = useState("");
  const [location, setLocation] = useState("");
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    awb?: string;
    previousStatus?: string;
    newStatus?: string;
    status?: string;
    alreadyCompleted?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<unknown>(null);

  useEffect(() => {
    const awbParam = searchParams.get("awb");
    if (awbParam) setAwb(awbParam);
  }, [searchParams]);

  // Capture GPS location automatically
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => {} // ignore errors - GPS is optional
      );
    }
  }, []);

  const stopCamera = useCallback(async () => {
    try {
      const scanner = html5QrCodeRef.current as { stop: () => Promise<void>; clear: () => void } | null;
      if (scanner) {
        await scanner.stop();
        scanner.clear();
        html5QrCodeRef.current = null;
      }
    } catch {
      // ignore cleanup errors
    }
    setCameraActive(false);
    setCameraError("");
  }, []);

  async function startCamera() {
    setCameraError("");
    setCameraActive(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      // Wait for DOM element
      await new Promise((r) => setTimeout(r, 100));

      if (!scannerRef.current) return;

      const scanner = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText: string) => {
          // Extract AWB from scanned URL or use as-is
          let scannedAwb = decodedText;
          try {
            const url = new URL(decodedText);
            const awbParam = url.searchParams.get("awb");
            if (awbParam) scannedAwb = awbParam;
          } catch {
            // Not a URL, use as-is
          }

          setAwb(scannedAwb);
          stopCamera();
        },
        () => {
          // QR not found in frame - ignore
        }
      );
    } catch (err) {
      setCameraError(
        err instanceof Error && err.message.includes("Permission")
          ? "Camera nu a fost permisă. Permite accesul la cameră din setările browserului."
          : "Nu s-a putut porni camera. Verifică dacă dispozitivul are cameră."
      );
      setCameraActive(false);
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!awb.trim()) return;

    setLoading(true);
    setResult(null);

    // Get fresh GPS coordinates at scan time
    let gpsCoords = coords;
    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        gpsCoords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setCoords(gpsCoords);
      } catch {
        // GPS unavailable - continue without it
      }
    }

    try {
      const res = await fetch(`/api/scan/${encodeURIComponent(awb.trim())}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: location.trim(),
          latitude: gpsCoords?.latitude ?? null,
          longitude: gpsCoords?.longitude ?? null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ success: false, message: data.error || "Eroare la scanare" });
      } else {
        setResult({
          success: !data.alreadyCompleted,
          message: data.message,
          awb: data.awb,
          previousStatus: data.previousStatus,
          newStatus: data.newStatus,
          status: data.status,
          alreadyCompleted: data.alreadyCompleted,
        });
      }
    } catch {
      setResult({ success: false, message: "Eroare de conexiune" });
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setAwb("");
    setLocation("");
    setResult(null);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Pagina principală
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <QrCode className="h-7 w-7 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Scanare Colet</h1>
            <p className="text-sm text-gray-500 mt-1">
              Scanează QR-ul cu camera sau introdu AWB-ul manual
            </p>
          </div>

          {!result ? (
            <div className="space-y-4">
              {/* Camera Scanner */}
              {cameraActive ? (
                <div className="relative">
                  <div
                    id="qr-reader"
                    ref={scannerRef}
                    className="rounded-xl overflow-hidden"
                  />
                  <button
                    onClick={stopCamera}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors z-10"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={startCamera}
                  type="button"
                  className="w-full h-14 border-2 border-dashed border-blue-300 rounded-xl flex items-center justify-center gap-3 text-blue-600 font-medium hover:bg-blue-50 transition-colors"
                >
                  <Camera className="h-5 w-5" />
                  Deschide camera pentru scanare QR
                </button>
              )}

              {cameraError && (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  {cameraError}
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-400">sau introdu manual</span>
                </div>
              </div>

              <form onSubmit={handleScan} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Număr AWB
                  </label>
                  <input
                    type="text"
                    value={awb}
                    onChange={(e) => setAwb(e.target.value)}
                    placeholder="RO-20260921-00001"
                    className="w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Locația curentă (opțional)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Depozit București, Vamă Nădlac..."
                    className="w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Se procesează..." : "Actualizează Status"}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center">
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                result.success ? "bg-green-100" : "bg-red-100"
              }`}>
                {result.success ? (
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-red-600" />
                )}
              </div>

              <p className="text-lg font-semibold text-gray-900 mb-2">
                {result.message}
              </p>

              {result.awb && (
                <p className="text-sm text-gray-500 mb-1">
                  <Package className="h-4 w-4 inline mr-1" />
                  AWB: <span className="font-mono font-medium">{result.awb}</span>
                </p>
              )}

              {result.previousStatus && result.newStatus && (
                <div className="mt-3 flex items-center justify-center gap-2 text-sm">
                  <span className="bg-gray-100 px-3 py-1 rounded-full">
                    {STATUS_LABELS[result.previousStatus] || result.previousStatus}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                    {STATUS_LABELS[result.newStatus] || result.newStatus}
                  </span>
                </div>
              )}

              {result.alreadyCompleted && result.status && (
                <div className="mt-3">
                  <span className="bg-green-100 text-green-800 px-4 py-1.5 rounded-full font-medium text-sm">
                    {STATUS_LABELS[result.status] || result.status}
                  </span>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 h-11 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Scanează alt colet
                </button>
                <Link
                  href={`/tracking?awb=${result.awb || ""}`}
                  className="flex-1 h-11 border border-gray-300 rounded-xl font-semibold flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-700"
                >
                  Vezi tracking
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense>
      <ScanContent />
    </Suspense>
  );
}
