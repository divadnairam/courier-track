"use client";

import { useState } from "react";
import { Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResendVerificationButton({ clientId }: { clientId: string }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleResend() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/clienti/${clientId}/retrimite-verificare`, {
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
      <span className="inline-flex items-center gap-1 text-sm text-green-600">
        <Check className="h-4 w-4" />
        Email trimis
      </span>
    );
  }

  return (
    <div className="inline-flex flex-col">
      <Button
        variant="outline"
        size="sm"
        onClick={handleResend}
        disabled={loading}
        className="border-blue-300 text-blue-600 hover:bg-blue-50"
      >
        <Mail className="h-4 w-4 mr-1" />
        {loading ? "Se trimite..." : "Retrimite verificare"}
      </Button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
