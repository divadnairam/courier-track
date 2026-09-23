"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export function PassengerForm({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      seatCount: Number(formData.get("seatCount")) || 1,
      price: Number(formData.get("price")) || 0,
      notes: formData.get("notes") as string || undefined,
    };

    try {
      const res = await fetch(`/api/curse/${tripId}/pasageri`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Eroare la salvare");
      }

      form.reset();
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
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-5">
        <div>
          <Label className="text-xs">Nume</Label>
          <Input name="name" placeholder="Nume pasager" required className="text-sm" />
        </div>
        <div>
          <Label className="text-xs">Telefon</Label>
          <Input name="phone" placeholder="07..." required className="text-sm" />
        </div>
        <div>
          <Label className="text-xs">Locuri</Label>
          <Input name="seatCount" type="number" defaultValue={1} min={1} className="text-sm" />
        </div>
        <div>
          <Label className="text-xs">Preț (RON)</Label>
          <Input name="price" type="number" defaultValue={0} min={0} className="text-sm" />
        </div>
        <div className="flex items-end">
          <Button type="submit" size="sm" disabled={loading} className="w-full">
            <Plus className="h-4 w-4 mr-1" />
            {loading ? "..." : "Adaugă"}
          </Button>
        </div>
      </div>
    </form>
  );
}
