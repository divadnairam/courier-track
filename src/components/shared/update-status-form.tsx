"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PARCEL_STATUS_LABELS, PARCEL_STATUS_FLOW, type ParcelStatus } from "@/lib/constants";

interface UpdateStatusFormProps {
  parcelId: string;
  currentStatus: string;
}

export function UpdateStatusForm({ parcelId, currentStatus }: UpdateStatusFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const currentIndex = PARCEL_STATUS_FLOW.indexOf(currentStatus as ParcelStatus);
  const availableStatuses = [
    ...PARCEL_STATUS_FLOW.filter((_, i) => i > currentIndex),
    "RETURNAT" as ParcelStatus,
  ].filter((s) => s !== currentStatus);

  if (currentStatus === "LIVRAT" || currentStatus === "RETURNAT") {
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      status: formData.get("status") as string,
      location: formData.get("location") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    };

    await fetch(`/api/colete/${parcelId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-medium text-sm">Actualizare Status</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="status" className="text-xs">Status Nou</Label>
          <select name="status" className="w-full rounded-lg border px-3 py-2 text-sm" required>
            {availableStatuses.map((s) => (
              <option key={s} value={s}>
                {PARCEL_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="location" className="text-xs">Locație</Label>
          <Input name="location" placeholder="ex: Depozit București" className="text-sm" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="notes" className="text-xs">Observații</Label>
          <Input name="notes" placeholder="Opțional" className="text-sm" />
        </div>
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Se actualizează..." : "Actualizează Status"}
      </Button>
    </form>
  );
}
