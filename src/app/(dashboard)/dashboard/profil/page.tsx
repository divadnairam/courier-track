"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COUNTRIES } from "@/lib/constants";

interface ClientProfile {
  id: string;
  type: string;
  name: string;
  companyName?: string;
  cui?: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  county: string;
  country: string;
}

export default function ProfilPage() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/profil")
      .then((res) => {
        if (!res.ok) throw new Error("Profilul nu a fost găsit");
        return res.json();
      })
      .then(setProfile)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      county: formData.get("county") as string,
      country: formData.get("country") as string,
      companyName: formData.get("companyName") as string || undefined,
      cui: formData.get("cui") as string || undefined,
    };

    try {
      const res = await fetch("/api/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.details ? JSON.stringify(err.details.fieldErrors) : err.error);
      }

      const updated = await res.json();
      setProfile(updated);
      setSuccess("Profilul a fost actualizat cu succes!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la salvare");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Profilul Meu" description="Datele contului tău" />
        <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
          Se încarcă...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <PageHeader title="Profilul Meu" description="Datele contului tău" />
        <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
          {error || "Nu există un profil de client asociat contului tău."}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Profilul Meu" description="Vizualizează și editează datele contului tău" />

      <div className="rounded-lg border bg-white p-6 max-w-2xl">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}
        {success && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-600">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Nume complet</Label>
            <Input id="name" name="name" defaultValue={profile.name} required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" name="phone" defaultValue={profile.phone} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={profile.email || ""} />
            </div>
          </div>

          {profile.type === "COMPANY" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="companyName">Nume Firmă</Label>
                <Input id="companyName" name="companyName" defaultValue={profile.companyName || ""} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cui">CUI</Label>
                <Input id="cui" name="cui" defaultValue={profile.cui || ""} />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="address">Adresă</Label>
            <Input id="address" name="address" defaultValue={profile.address} required />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="city">Oraș</Label>
              <Input id="city" name="city" defaultValue={profile.city} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="county">Județ / Provincie</Label>
              <Input id="county" name="county" defaultValue={profile.county} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="country">Țara</Label>
              <select
                id="country"
                name="country"
                defaultValue={profile.country || "RO"}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-500">
            Tip cont: <strong>{profile.type === "COMPANY" ? "Companie" : "Persoană fizică"}</strong>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? "Se salvează..." : "Salvează Modificările"}
          </Button>
        </form>
      </div>
    </div>
  );
}
