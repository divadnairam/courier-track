"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { extractApiErrors } from "@/lib/utils";

interface TripStop {
  id: string;
  city: string;
  country: string;
  order: number;
  price: number;
}

export function PassengerForm({
  tripId,
  stops = [],
  destinationCity,
  pricePerSeat,
}: {
  tripId: string;
  stops?: TripStop[];
  destinationCity?: string;
  pricePerSeat?: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedStopId, setSelectedStopId] = useState("");
  const [parcelCount, setParcelCount] = useState(0);
  const [price, setPrice] = useState(0);

  const hasStops = stops.length > 0;

  function handleStopChange(stopId: string) {
    setSelectedStopId(stopId);
    if (stopId === "final") {
      setPrice(pricePerSeat || 0);
    } else if (stopId) {
      const stop = stops.find((s) => s.id === stopId);
      if (stop) setPrice(stop.price);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string || undefined,
      seatCount: Number(formData.get("seatCount")) || 1,
      price,
      notes: formData.get("notes") as string || undefined,
      tripStopId: selectedStopId || undefined,
      parcelCount,
      parcelWeight: Number(formData.get("parcelWeight")) || 0,
    };

    try {
      const res = await fetch(`/api/curse/${tripId}/pasageri`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(extractApiErrors(data));
      }

      form.reset();
      setSelectedStopId("");
      setParcelCount(0);
      setPrice(0);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      {/* Row 1: Name, Phone, Email */}
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
        <div>
          <Label className="text-xs">Nume</Label>
          <Input name="name" placeholder="Nume pasager" required className="text-sm" />
        </div>
        <div>
          <Label className="text-xs">Telefon</Label>
          <Input name="phone" placeholder="+40712345678" required className="text-sm" />
        </div>
        <div>
          <Label className="text-xs">Email</Label>
          <Input name="email" type="email" placeholder="email@..." className="text-sm" />
        </div>
      </div>

      {/* Row 2: Destination, Seats, Price */}
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
        {hasStops ? (
          <div>
            <Label className="text-xs">Destinație</Label>
            <select
              value={selectedStopId}
              onChange={(e) => handleStopChange(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">— Selectați —</option>
              {stops.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.city} — {stop.price} EUR
                </option>
              ))}
              <option value="final">
                {destinationCity} (finală) — {pricePerSeat} EUR
              </option>
            </select>
          </div>
        ) : (
          <div>
            <Label className="text-xs">Observații</Label>
            <Input name="notes" placeholder="Observații" className="text-sm" />
          </div>
        )}
        <div>
          <Label className="text-xs">Locuri</Label>
          <Input name="seatCount" type="number" defaultValue={1} min={1} className="text-sm" />
        </div>
        <div>
          <Label className="text-xs">Preț (EUR)</Label>
          <Input
            name="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
            min={0}
            step="0.01"
            className="text-sm"
          />
        </div>
        <div>
          <Label className="text-xs">Colete</Label>
          <select
            value={parcelCount}
            onChange={(e) => setParcelCount(parseInt(e.target.value))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value={0}>Fără colete</option>
            <option value={1}>1 colet</option>
            <option value={2}>2 colete</option>
          </select>
        </div>
      </div>

      {/* Row 3: Parcel weight + notes (if stops) + submit */}
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
        {parcelCount > 0 && (
          <div>
            <Label className="text-xs">Greutate colete (kg)</Label>
            <Input name="parcelWeight" type="number" min={0.1} max={40} step={0.5} placeholder="kg" required className="text-sm" />
          </div>
        )}
        {hasStops && (
          <div>
            <Label className="text-xs">Observații</Label>
            <Input name="notes" placeholder="Observații" className="text-sm" />
          </div>
        )}
        <div className="flex items-end col-start-[-2] sm:col-start-auto">
          <Button type="submit" size="sm" disabled={loading} className="w-full">
            <Plus className="h-4 w-4 mr-1" />
            {loading ? "..." : "Adaugă"}
          </Button>
        </div>
      </div>
    </form>
  );
}
