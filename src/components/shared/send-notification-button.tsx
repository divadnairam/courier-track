"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SendNotificationButton({ parcelId }: { parcelId: string }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/colete/${parcelId}/notificare`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Eroare la trimitere");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <Button variant="outline" size="sm" disabled className="text-green-600 border-green-300">
        <Check className="h-4 w-4 mr-1" />
        Notificare trimisă
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-end">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSend}
        disabled={loading}
        className="border-blue-300 text-blue-600 hover:bg-blue-50"
      >
        <Bell className="h-4 w-4 mr-1" />
        {loading ? "Se trimite..." : "Notifică destinatarul"}
      </Button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
