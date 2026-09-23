"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ParcelStatusBadge } from "@/components/shared/status-badge";
import { StatusTimeline } from "@/components/shared/status-timeline";
import { ParcelMap } from "@/components/shared/parcel-map";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialAwb = searchParams.get("awb") || "";
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
    <div>
      <PageHeader
        title="Urmărire AWB"
        description="Caută și urmărește statusul unui colet"
      />

      <div className="rounded-lg border bg-white p-4 mb-6">
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
      </div>

      {error && searched && (
        <div className="rounded-lg border bg-white p-6 text-center text-red-600 mb-6">
          {error}
        </div>
      )}

      {parcel && (
        <div className="space-y-4">
          <div className="rounded-lg border bg-white p-6">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <h2 className="text-lg font-semibold">Colet: {parcel.awb as string}</h2>
              <ParcelStatusBadge status={parcel.status as string} />
            </div>
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
          </div>

          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Localizare Colet</h2>
            <ParcelMap
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
          </div>

          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Istoric Actualizări</h2>
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
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardTrackingPage() {
  return (
    <Suspense>
      <TrackingContent />
    </Suspense>
  );
}
