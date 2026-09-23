"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParcelStatusBadge } from "@/components/shared/status-badge";
import { StatusTimeline } from "@/components/shared/status-timeline";
import { ParcelMap } from "@/components/shared/parcel-map";
import { Package, Search, ArrowLeft, LayoutDashboard } from "lucide-react";
import { Suspense } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Footer } from "@/components/shared/footer";

function TrackingContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const initialAwb = searchParams.get("awb") || "";
  const isStaff = session?.user?.role && ["ADMIN", "OPERATOR", "COURIER"].includes(session.user.role);
  const [awb, setAwb] = useState(initialAwb);
  const [parcel, setParcel] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const searchAwb = useCallback(async (awbToSearch: string) => {
    if (!awbToSearch.trim()) return;

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const res = await fetch(`/api/tracking/${awbToSearch.trim()}`);
      if (!res.ok) {
        throw new Error("Coletul nu a fost găsit");
      }
      const data = await res.json();
      setParcel(data);
    } catch {
      setParcel(null);
      setError("Coletul cu acest AWB nu a fost găsit. Verificați numărul și încercați din nou.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialAwb) {
      searchAwb(initialAwb);
    }
  }, [initialAwb, searchAwb]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    searchAwb(awb);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
      <div className="bg-white/10 backdrop-blur-sm text-white py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Link href="/" className="inline-flex justify-center mb-4 hover:opacity-80 transition-opacity">
            <Package className="h-10 w-10" />
          </Link>
          <h1 className="text-3xl font-bold mb-2">
            <Link href="/" className="hover:opacity-80 transition-opacity">CourierTrack</Link>
          </h1>
          <p className="text-blue-200">Urmărește-ți coletul în timp real</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 flex gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Pagina principală
        </Link>
        {isStaff && (
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                value={awb}
                onChange={(e) => setAwb(e.target.value)}
                placeholder="Introdu numărul AWB (ex: RO-20260919-00001)"
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Se caută..." : "Caută"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && searched && (
          <Card className="mt-6 shadow-lg">
            <CardContent className="pt-6 text-center text-red-600">
              {error}
            </CardContent>
          </Card>
        )}

        {parcel && (
          <div className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle>Colet: {parcel.awb as string}</CardTitle>
                  <ParcelStatusBadge status={parcel.status as string} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">De la</p>
                    <p className="font-medium">{(parcel.sender as { name: string }).name}</p>
                    <p className="text-sm text-gray-600">{parcel.pickupCity as string}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Către</p>
                    <p className="font-medium">{(parcel.receiver as { name: string }).name}</p>
                    <p className="text-sm text-gray-600">{parcel.deliveryCity as string}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Localizare Colet</CardTitle>
              </CardHeader>
              <CardContent>
                <ParcelMap
                  awb={parcel.awb as string}
                  entries={
                    parcel.statusHistory as {
                      status: string;
                      location?: string | null;
                      latitude?: number | null;
                      longitude?: number | null;
                      createdAt: string | Date;
                    }[]
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Istoric Actualizări</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusTimeline
                  entries={
                    parcel.statusHistory as {
                      status: string;
                      location?: string | null;
                      notes?: string | null;
                      createdAt: string | Date;
                    }[]
                  }
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <div className="flex-1" />
      <Footer />
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense>
      <TrackingContent />
    </Suspense>
  );
}
