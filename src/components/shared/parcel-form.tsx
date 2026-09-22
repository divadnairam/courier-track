"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRIES, COUNTRY_LABELS, WEIGHT_PRICE_RANGES, getPriceForWeight } from "@/lib/constants";
import { ClientForm } from "./client-form";
import { Plus, X } from "lucide-react";

interface Client {
  id: string;
  name: string;
  phone: string;
  city: string;
  country: string;
  address: string;
}

interface ParcelFormProps {
  initialData?: {
    id?: string;
    senderId: string;
    receiverId: string;
    weight?: number | null;
    width?: number | null;
    height?: number | null;
    length?: number | null;
    declaredValue?: number | null;
    cashOnDelivery?: number | null;
    content?: string | null;
    notes?: string | null;
    pickupAddress: string;
    pickupCity: string;
    pickupCountry?: string;
    deliveryAddress: string;
    deliveryCity: string;
    deliveryCountry?: string;
    price: number;
  };
}

export function ParcelForm({ initialData }: ParcelFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [senderId, setSenderId] = useState(initialData?.senderId || "");
  const [receiverId, setReceiverId] = useState(initialData?.receiverId || "");
  const [showNewSender, setShowNewSender] = useState(false);
  const [showNewReceiver, setShowNewReceiver] = useState(false);

  function loadClients() {
    fetch("/api/clienti?limit=200")
      .then((res) => res.json())
      .then((data) => setClients(data.clients || []));
  }

  useEffect(() => {
    loadClients();
  }, []);

  function onSenderChange(clientId: string) {
    setSenderId(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client && !initialData?.id) {
      const form = document.getElementById("parcel-form") as HTMLFormElement;
      const pickupAddress = form.elements.namedItem("pickupAddress") as HTMLInputElement;
      const pickupCity = form.elements.namedItem("pickupCity") as HTMLInputElement;
      const pickupCountry = form.elements.namedItem("pickupCountry") as HTMLSelectElement;
      if (pickupAddress) pickupAddress.value = client.address;
      if (pickupCity) pickupCity.value = client.city;
      if (pickupCountry) pickupCountry.value = client.country || "RO";
    }
  }

  function onReceiverChange(clientId: string) {
    setReceiverId(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client && !initialData?.id) {
      const form = document.getElementById("parcel-form") as HTMLFormElement;
      const deliveryAddress = form.elements.namedItem("deliveryAddress") as HTMLInputElement;
      const deliveryCity = form.elements.namedItem("deliveryCity") as HTMLInputElement;
      const deliveryCountry = form.elements.namedItem("deliveryCountry") as HTMLSelectElement;
      if (deliveryAddress) deliveryAddress.value = client.address;
      if (deliveryCity) deliveryCity.value = client.city;
      if (deliveryCountry) deliveryCountry.value = client.country || "RO";
    }
  }

  function onNewSenderCreated(client: { id: string; name: string; city: string; country: string; address: string }) {
    loadClients();
    setSenderId(client.id);
    setShowNewSender(false);
    // Auto-fill pickup address
    const form = document.getElementById("parcel-form") as HTMLFormElement;
    if (form) {
      const pickupAddress = form.elements.namedItem("pickupAddress") as HTMLInputElement;
      const pickupCity = form.elements.namedItem("pickupCity") as HTMLInputElement;
      const pickupCountry = form.elements.namedItem("pickupCountry") as HTMLSelectElement;
      if (pickupAddress) pickupAddress.value = client.address;
      if (pickupCity) pickupCity.value = client.city;
      if (pickupCountry) pickupCountry.value = client.country || "RO";
    }
  }

  function onNewReceiverCreated(client: { id: string; name: string; city: string; country: string; address: string }) {
    loadClients();
    setReceiverId(client.id);
    setShowNewReceiver(false);
    // Auto-fill delivery address
    const form = document.getElementById("parcel-form") as HTMLFormElement;
    if (form) {
      const deliveryAddress = form.elements.namedItem("deliveryAddress") as HTMLInputElement;
      const deliveryCity = form.elements.namedItem("deliveryCity") as HTMLInputElement;
      const deliveryCountry = form.elements.namedItem("deliveryCountry") as HTMLSelectElement;
      if (deliveryAddress) deliveryAddress.value = client.address;
      if (deliveryCity) deliveryCity.value = client.city;
      if (deliveryCountry) deliveryCountry.value = client.country || "RO";
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      senderId: formData.get("senderId") as string,
      receiverId: formData.get("receiverId") as string,
      weight: formData.get("weight") ? Number(formData.get("weight")) : undefined,
      width: formData.get("width") ? Number(formData.get("width")) : undefined,
      height: formData.get("height") ? Number(formData.get("height")) : undefined,
      length: formData.get("length") ? Number(formData.get("length")) : undefined,
      declaredValue: formData.get("declaredValue") ? Number(formData.get("declaredValue")) : undefined,
      cashOnDelivery: formData.get("cashOnDelivery") ? Number(formData.get("cashOnDelivery")) : undefined,
      content: formData.get("content") as string || undefined,
      notes: formData.get("notes") as string || undefined,
      pickupAddress: formData.get("pickupAddress") as string,
      pickupCity: formData.get("pickupCity") as string,
      pickupCountry: formData.get("pickupCountry") as string || "RO",
      deliveryAddress: formData.get("deliveryAddress") as string,
      deliveryCity: formData.get("deliveryCity") as string,
      deliveryCountry: formData.get("deliveryCountry") as string || "RO",
      price: Number(formData.get("price")) || 0,
    };

    try {
      const url = initialData?.id ? `/api/colete/${initialData.id}` : "/api/colete";
      const method = initialData?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.details ? JSON.stringify(err.details.fieldErrors) : err.error || "Eroare la salvare");
      }

      router.push("/dashboard/colete");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare necunoscută");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form id="parcel-form" onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {/* Expeditor */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Expeditor</h3>
          {!showNewSender && (
            <button
              type="button"
              onClick={() => setShowNewSender(true)}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> Client nou
            </button>
          )}
        </div>

        {showNewSender ? (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Expeditor nou</span>
              <button type="button" onClick={() => setShowNewSender(false)}>
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <ClientForm onSuccess={onNewSenderCreated} compact />
          </div>
        ) : (
          <div>
            <select
              name="senderId"
              value={senderId}
              onChange={(e) => onSenderChange(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              required
            >
              <option value="">Selectează expeditorul</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.city}{c.country && c.country !== "RO" ? `, ${COUNTRY_LABELS[c.country] || c.country}` : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Destinatar */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Destinatar</h3>
          {!showNewReceiver && (
            <button
              type="button"
              onClick={() => setShowNewReceiver(true)}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> Client nou
            </button>
          )}
        </div>

        {showNewReceiver ? (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Destinatar nou</span>
              <button type="button" onClick={() => setShowNewReceiver(false)}>
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <ClientForm onSuccess={onNewReceiverCreated} compact />
          </div>
        ) : (
          <div>
            <select
              name="receiverId"
              value={receiverId}
              onChange={(e) => onReceiverChange(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              required
            >
              <option value="">Selectează destinatarul</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.city}{c.country && c.country !== "RO" ? `, ${COUNTRY_LABELS[c.country] || c.country}` : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Adrese Ridicare */}
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="font-semibold text-sm">Adresa Ridicare</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="pickupAddress" className="text-xs">Adresa</Label>
            <Input id="pickupAddress" name="pickupAddress" defaultValue={initialData?.pickupAddress} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pickupCity" className="text-xs">Oraș</Label>
            <Input id="pickupCity" name="pickupCity" defaultValue={initialData?.pickupCity} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pickupCountry" className="text-xs">Țara</Label>
            <select id="pickupCountry" name="pickupCountry" defaultValue={initialData?.pickupCountry || "RO"} className="w-full rounded-lg border px-3 py-2 text-sm">
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Adrese Livrare */}
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="font-semibold text-sm">Adresa Livrare</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="deliveryAddress" className="text-xs">Adresa</Label>
            <Input id="deliveryAddress" name="deliveryAddress" defaultValue={initialData?.deliveryAddress} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="deliveryCity" className="text-xs">Oraș</Label>
            <Input id="deliveryCity" name="deliveryCity" defaultValue={initialData?.deliveryCity} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="deliveryCountry" className="text-xs">Țara</Label>
            <select id="deliveryCountry" name="deliveryCountry" defaultValue={initialData?.deliveryCountry || "RO"} className="w-full rounded-lg border px-3 py-2 text-sm">
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Greutate & Preț automat */}
      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="font-semibold text-sm">Greutate & Preț Transport</h3>

        {/* Tabel prețuri */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border">
            <thead>
              <tr className="bg-gray-100">
                {WEIGHT_PRICE_RANGES.map((r, i) => (
                  <th key={i} className="px-2 py-1 border text-center font-medium">
                    {r.minKg}-{r.maxKg} kg
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {WEIGHT_PRICE_RANGES.map((r, i) => (
                  <td key={i} className="px-2 py-1 border text-center font-bold text-blue-700">
                    {r.priceEur} €
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="weight">Greutate (kg)</Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              step="0.1"
              defaultValue={initialData?.weight || ""}
              onChange={(e) => {
                const w = parseFloat(e.target.value);
                if (!isNaN(w) && w > 0) {
                  const autoPrice = getPriceForWeight(w);
                  if (autoPrice !== null) {
                    const priceInput = document.getElementById("price") as HTMLInputElement;
                    if (priceInput) priceInput.value = String(autoPrice);
                  }
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Preț Transport (EUR)</Label>
            <Input id="price" name="price" type="number" step="0.01" defaultValue={initialData?.price || 0} required />
            <p className="text-[10px] text-gray-400">Se calculează automat din greutate, dar poate fi modificat manual</p>
          </div>
        </div>
      </div>

      {/* Dimensiuni & Alte detalii */}
      <div className="grid gap-4 grid-cols-3 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="length">Lungime (cm)</Label>
          <Input id="length" name="length" type="number" step="1" defaultValue={initialData?.length || ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="width">Lățime (cm)</Label>
          <Input id="width" name="width" type="number" step="1" defaultValue={initialData?.width || ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Înălțime (cm)</Label>
          <Input id="height" name="height" type="number" step="1" defaultValue={initialData?.height || ""} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="declaredValue">Valoare Declarată (EUR)</Label>
          <Input id="declaredValue" name="declaredValue" type="number" step="0.01" defaultValue={initialData?.declaredValue || ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cashOnDelivery">Ramburs (EUR)</Label>
          <Input id="cashOnDelivery" name="cashOnDelivery" type="number" step="0.01" defaultValue={initialData?.cashOnDelivery || ""} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Conținut</Label>
        <Input id="content" name="content" defaultValue={initialData?.content || ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observații</Label>
        <Textarea id="notes" name="notes" defaultValue={initialData?.notes || ""} rows={2} />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Se salvează..." : initialData?.id ? "Actualizează" : "Creează Colet"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Anulează
        </Button>
      </div>
    </form>
  );
}
