"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRIES } from "@/lib/constants";

interface Driver {
  id: string;
  name: string;
  phone: string;
}

interface TripFormProps {
  initialData?: {
    id?: string;
    originCity: string;
    destinationCity: string;
    route?: string | null;
    departureDate: string | Date;
    departureTime: string;
    estimatedArrival?: string | Date | null;
    originCountry?: string;
    destinationCountry?: string;
    totalSeats: number;
    availableSeats: number;
    driverId?: string | null;
    vehicleInfo?: string | null;
    notes?: string | null;
  };
}

export function TripForm({ initialData }: TripFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    fetch("/api/utilizatori?role=COURIER")
      .then((res) => res.json())
      .then((data) => setDrivers(data.users || []))
      .catch(() => {});
  }, []);

  const departureDateStr = initialData?.departureDate
    ? new Date(initialData.departureDate).toISOString().split("T")[0]
    : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      originCity: formData.get("originCity") as string,
      originCountry: formData.get("originCountry") as string || "RO",
      destinationCity: formData.get("destinationCity") as string,
      destinationCountry: formData.get("destinationCountry") as string || "RO",
      route: formData.get("route") as string || undefined,
      departureDate: formData.get("departureDate") as string,
      departureTime: formData.get("departureTime") as string,
      estimatedArrival: formData.get("estimatedArrival") as string || undefined,
      totalSeats: Number(formData.get("totalSeats")) || 0,
      availableSeats: Number(formData.get("availableSeats")) || 0,
      driverId: formData.get("driverId") as string || undefined,
      vehicleInfo: formData.get("vehicleInfo") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    };

    try {
      const url = initialData?.id ? `/api/curse/${initialData.id}` : "/api/curse";
      const method = initialData?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Eroare la salvare");
      }

      router.push("/dashboard/curse");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare necunoscută");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="originCity">Oraș Plecare</Label>
          <Input id="originCity" name="originCity" defaultValue={initialData?.originCity} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="originCountry">Țara Plecare</Label>
          <select id="originCountry" name="originCountry" defaultValue={initialData?.originCountry || "RO"} className="w-full rounded-lg border px-3 py-2 text-sm">
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="destinationCity">Oraș Destinație</Label>
          <Input id="destinationCity" name="destinationCity" defaultValue={initialData?.destinationCity} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="destinationCountry">Țara Destinație</Label>
          <select id="destinationCountry" name="destinationCountry" defaultValue={initialData?.destinationCountry || "RO"} className="w-full rounded-lg border px-3 py-2 text-sm">
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="route">Rută (opriri intermediare)</Label>
        <Input id="route" name="route" defaultValue={initialData?.route || ""} placeholder="ex: București → Pitești → Sibiu → Cluj-Napoca" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="departureDate">Data Plecare</Label>
          <Input id="departureDate" name="departureDate" type="date" defaultValue={departureDateStr} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="departureTime">Ora Plecare</Label>
          <Input id="departureTime" name="departureTime" type="time" defaultValue={initialData?.departureTime} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedArrival">Data Sosire Estimată</Label>
          <Input id="estimatedArrival" name="estimatedArrival" type="date" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="totalSeats">Total Locuri</Label>
          <Input id="totalSeats" name="totalSeats" type="number" defaultValue={initialData?.totalSeats || 0} min={0} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="availableSeats">Locuri Disponibile</Label>
          <Input id="availableSeats" name="availableSeats" type="number" defaultValue={initialData?.availableSeats || 0} min={0} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="driverId">Șofer / Curier</Label>
          <select id="driverId" name="driverId" defaultValue={initialData?.driverId || ""} className="w-full rounded-lg border px-3 py-2 text-sm">
            <option value="">Neasignat</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleInfo">Vehicul</Label>
          <Input id="vehicleInfo" name="vehicleInfo" defaultValue={initialData?.vehicleInfo || ""} placeholder="ex: Mercedes Sprinter - B-123-ABC" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observații</Label>
        <Textarea id="notes" name="notes" defaultValue={initialData?.notes || ""} rows={2} />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Se salvează..." : initialData?.id ? "Actualizează" : "Creează Cursă"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Anulează
        </Button>
      </div>
    </form>
  );
}
