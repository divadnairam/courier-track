"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRIES, DAYS_OF_WEEK } from "@/lib/constants";
import { Plus, Trash2 } from "lucide-react";

interface Driver {
  id: string;
  name: string;
}

interface StopEntry {
  city: string;
  country: string;
  price: number;
}

interface RecurringTripFormProps {
  initialData?: {
    id?: string;
    dayOfWeek: number;
    originCity: string;
    originCountry: string;
    destinationCity: string;
    destinationCountry: string;
    route?: string | null;
    departureTime: string;
    estimatedArrivalDays?: number | null;
    totalSeats: number;
    pricePerSeat: number;
    stops?: { city: string; country: string; order: number; price: number }[] | null;
    driverId?: string | null;
    vehicleInfo?: string | null;
    notes?: string | null;
    active: boolean;
    weeksInAdvance: number;
  };
}

export function RecurringTripForm({ initialData }: RecurringTripFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [stops, setStops] = useState<StopEntry[]>(
    initialData?.stops?.map((s) => ({ city: s.city, country: s.country, price: s.price })) || []
  );

  useEffect(() => {
    fetch("/api/utilizatori?role=COURIER")
      .then((res) => res.json())
      .then((data) => setDrivers(data.users || []))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const originCity = formData.get("originCity") as string;
    const destinationCity = formData.get("destinationCity") as string;

    // Auto-generate route from stops
    const validStops = stops.filter((s) => s.city.trim());
    const routeParts = [originCity, ...validStops.map((s) => s.city), destinationCity];
    const autoRoute = routeParts.join(" → ");

    const data = {
      dayOfWeek: Number(formData.get("dayOfWeek")) || 3,
      originCity,
      originCountry: (formData.get("originCountry") as string) || "RO",
      destinationCity,
      destinationCountry: (formData.get("destinationCountry") as string) || "NL",
      route: autoRoute,
      departureTime: formData.get("departureTime") as string,
      estimatedArrivalDays: Number(formData.get("estimatedArrivalDays")) || undefined,
      totalSeats: Number(formData.get("totalSeats")) || 12,
      pricePerSeat: Number(formData.get("pricePerSeat")) || 0,
      stops: validStops.map((s, i) => ({ city: s.city, country: s.country, order: i, price: s.price })),
      driverId: (formData.get("driverId") as string) || undefined,
      vehicleInfo: (formData.get("vehicleInfo") as string) || undefined,
      notes: (formData.get("notes") as string) || undefined,
      active: formData.get("active") === "on",
      weeksInAdvance: Number(formData.get("weeksInAdvance")) || 4,
    };

    try {
      const url = initialData?.id
        ? `/api/curse-recurente/${initialData.id}`
        : "/api/curse-recurente";
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

      router.push("/dashboard/curse-recurente");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare necunoscută");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dayOfWeek">Zi Plecare</Label>
          <select
            id="dayOfWeek"
            name="dayOfWeek"
            defaultValue={initialData?.dayOfWeek ?? 3}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            {DAYS_OF_WEEK.map((day, i) => (
              <option key={i} value={i}>{day}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="departureTime">Ora Plecare</Label>
          <Input
            id="departureTime"
            name="departureTime"
            type="time"
            defaultValue={initialData?.departureTime || "08:00"}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="originCity">Oraș Plecare</Label>
          <Input
            id="originCity"
            name="originCity"
            defaultValue={initialData?.originCity || "Galați"}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="originCountry">Țara Plecare</Label>
          <select
            id="originCountry"
            name="originCountry"
            defaultValue={initialData?.originCountry || "RO"}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="destinationCity">Oraș Destinație</Label>
          <Input
            id="destinationCity"
            name="destinationCity"
            defaultValue={initialData?.destinationCity}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="destinationCountry">Țara Destinație</Label>
          <select
            id="destinationCountry"
            name="destinationCountry"
            defaultValue={initialData?.destinationCountry || "NL"}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Opriri intermediare */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="font-semibold">Opriri intermediare & Prețuri</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setStops([...stops, { city: "", country: "RO", price: 0 }])}
          >
            <Plus className="h-4 w-4 mr-1" /> Adaugă oprire
          </Button>
        </div>

        {stops.length === 0 && (
          <p className="text-sm text-gray-500">Nicio oprire intermediară. Adăugați opriri pentru a seta prețuri pe destinație.</p>
        )}

        {stops.map((stop, index) => (
          <div key={index} className="grid gap-2 grid-cols-[1fr_auto_auto_auto] items-end">
            <div>
              <Label className="text-xs">Oraș #{index + 1}</Label>
              <Input
                value={stop.city}
                onChange={(e) => {
                  const updated = [...stops];
                  updated[index] = { ...updated[index], city: e.target.value };
                  setStops(updated);
                }}
                placeholder="ex: București"
              />
            </div>
            <div>
              <Label className="text-xs">Țara</Label>
              <select
                value={stop.country}
                onChange={(e) => {
                  const updated = [...stops];
                  updated[index] = { ...updated[index], country: e.target.value };
                  setStops(updated);
                }}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Preț (EUR)</Label>
              <Input
                type="number"
                value={stop.price}
                onChange={(e) => {
                  const updated = [...stops];
                  updated[index] = { ...updated[index], price: Number(e.target.value) || 0 };
                  setStops(updated);
                }}
                min={0}
                step="0.01"
                className="w-24"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700"
              onClick={() => setStops(stops.filter((_, i) => i !== index))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="totalSeats">Total Locuri</Label>
          <Input
            id="totalSeats"
            name="totalSeats"
            type="number"
            defaultValue={initialData?.totalSeats || 12}
            min={1}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pricePerSeat">Preț destinație finală (EUR)</Label>
          <Input
            id="pricePerSeat"
            name="pricePerSeat"
            type="number"
            step="0.01"
            defaultValue={initialData?.pricePerSeat || 0}
            min={0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedArrivalDays">Durată (zile)</Label>
          <Input
            id="estimatedArrivalDays"
            name="estimatedArrivalDays"
            type="number"
            defaultValue={initialData?.estimatedArrivalDays || ""}
            min={0}
            placeholder="ex: 2"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weeksInAdvance">Săptămâni în avans</Label>
          <Input
            id="weeksInAdvance"
            name="weeksInAdvance"
            type="number"
            defaultValue={initialData?.weeksInAdvance || 4}
            min={1}
            max={12}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="driverId">Șofer / Curier</Label>
          <select
            id="driverId"
            name="driverId"
            defaultValue={initialData?.driverId || ""}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">Neasignat</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleInfo">Vehicul</Label>
          <Input
            id="vehicleInfo"
            name="vehicleInfo"
            defaultValue={initialData?.vehicleInfo || ""}
            placeholder="ex: Mercedes Sprinter - B-123-ABC"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observații</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={initialData?.notes || ""}
          rows={2}
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="active"
          name="active"
          defaultChecked={initialData?.active ?? true}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="active" className="cursor-pointer">Activ</Label>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Se salvează..." : initialData?.id ? "Actualizează" : "Creează Șablon"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Anulează
        </Button>
      </div>
    </form>
  );
}
