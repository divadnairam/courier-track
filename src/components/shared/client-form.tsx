"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRIES } from "@/lib/constants";

interface ClientFormProps {
  initialData?: {
    id?: string;
    type: string;
    name: string;
    companyName?: string | null;
    cui?: string | null;
    phone: string;
    email?: string | null;
    address: string;
    city: string;
    county: string;
    country?: string;
    notes?: string | null;
  };
  onSuccess?: (client: { id: string; name: string; city: string; country: string; address: string }) => void;
  compact?: boolean;
}

export function ClientForm({ initialData, onSuccess, compact }: ClientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState(initialData?.type || "INDIVIDUAL");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      type: formData.get("type") as string,
      name: formData.get("name") as string,
      companyName: formData.get("companyName") as string || undefined,
      cui: formData.get("cui") as string || undefined,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string || undefined,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      county: formData.get("county") as string,
      country: formData.get("country") as string || "RO",
      notes: formData.get("notes") as string || undefined,
    };

    try {
      const url = initialData?.id
        ? `/api/clienti/${initialData.id}`
        : "/api/clienti";
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

      const result = await res.json();

      if (onSuccess) {
        onSuccess(result);
      } else {
        router.push("/dashboard/clienti");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare necunoscută");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${compact ? "" : "max-w-2xl space-y-6"}`}>
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Tip Client</Label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="INDIVIDUAL">Persoană fizică</option>
            <option value="COMPANY">Companie</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nume {type === "INDIVIDUAL" ? "complet" : "reprezentant"}</Label>
          <Input
            id="name"
            name="name"
            defaultValue={initialData?.name}
            required
          />
        </div>
      </div>

      {type === "COMPANY" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="companyName">Denumire Firmă</Label>
            <Input
              id="companyName"
              name="companyName"
              defaultValue={initialData?.companyName || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cui">CUI</Label>
            <Input
              id="cui"
              name="cui"
              defaultValue={initialData?.cui || ""}
            />
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={initialData?.phone}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={initialData?.email || ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Țara</Label>
        <select
          id="country"
          name="country"
          defaultValue={initialData?.country || "RO"}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresa</Label>
        <Input
          id="address"
          name="address"
          defaultValue={initialData?.address}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">Oraș</Label>
          <Input
            id="city"
            name="city"
            defaultValue={initialData?.city}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="county">Județ / Provincie / Regiune</Label>
          <Input
            id="county"
            name="county"
            defaultValue={initialData?.county}
            required
          />
        </div>
      </div>

      {!compact && (
        <div className="space-y-2">
          <Label htmlFor="notes">Observații</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={initialData?.notes || ""}
            rows={3}
          />
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Se salvează..." : initialData?.id ? "Actualizează" : "Creează Client"}
        </Button>
        {!compact && (
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Anulează
          </Button>
        )}
      </div>
    </form>
  );
}
