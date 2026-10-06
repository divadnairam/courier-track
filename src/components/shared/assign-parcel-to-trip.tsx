"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface UnassignedParcel {
  id: string;
  awb: string;
  sender: { name: string };
  receiver: { name: string };
  pickupCity: string;
  deliveryCity: string;
  price: number;
}

export function AssignParcelToTrip({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [parcels, setParcels] = useState<UnassignedParcel[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch("/api/colete?unassigned=true&limit=100")
        .then((res) => res.json())
        .then((data) => setParcels(data.parcels || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open]);

  async function handleAssign(parcelId: string) {
    setAssigning(parcelId);
    try {
      const res = await fetch(`/api/colete/${parcelId}/asigneaza`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Eroare la asignare");
        return;
      }
      setParcels((prev) => prev.filter((p) => p.id !== parcelId));
      router.refresh();
    } catch {
      alert("Eroare la asignare");
    } finally {
      setAssigning(null);
    }
  }

  async function handleUnassign(parcelId: string) {
    setAssigning(parcelId);
    try {
      const res = await fetch(`/api/colete/${parcelId}/asigneaza`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: null }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Eroare la dezasignare");
        return;
      }
      router.refresh();
    } catch {
      alert("Eroare la dezasignare");
    } finally {
      setAssigning(null);
    }
  }

  return (
    <div>
      {!open ? (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Asignează Colet
        </Button>
      ) : (
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Colete neasignate</span>
            <button type="button" onClick={() => setOpen(false)}>
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Se încarcă...</p>
          ) : parcels.length === 0 ? (
            <p className="text-sm text-gray-500">Nu există colete neasignate</p>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {parcels.map((parcel) => (
                <div
                  key={parcel.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <div>
                    <span className="font-medium text-blue-600">{parcel.awb}</span>
                    <span className="text-gray-500 ml-2">
                      {parcel.pickupCity} → {parcel.deliveryCity}
                    </span>
                    <span className="text-gray-400 ml-2 text-xs">
                      {parcel.sender.name} → {parcel.receiver.name}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={assigning === parcel.id}
                    onClick={() => handleAssign(parcel.id)}
                  >
                    {assigning === parcel.id ? "..." : "Asignează"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function UnassignParcelButton({
  parcelId,
  onUnassign,
}: {
  parcelId: string;
  onUnassign?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleUnassign() {
    if (!confirm("Dezasignați coletul de pe această cursă?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/colete/${parcelId}/asigneaza`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: null }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Eroare");
        return;
      }
      router.refresh();
      onUnassign?.();
    } catch {
      alert("Eroare");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleUnassign}
      disabled={loading}
      className="text-red-500 hover:text-red-700 text-xs"
      title="Dezasignează"
    >
      {loading ? "..." : <X className="h-4 w-4" />}
    </button>
  );
}
