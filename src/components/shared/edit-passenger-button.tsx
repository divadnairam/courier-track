"use client";

import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { useState } from "react";

export function EditPassengerButton({
  tripId,
  passengerId,
  currentPrice,
  passengerName,
}: {
  tripId: string;
  passengerId: string;
  currentPrice: number;
  passengerName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleEdit() {
    const input = prompt(
      `Introduceți noul preț (EUR) pentru ${passengerName}:`,
      String(currentPrice)
    );
    if (input === null) return;

    const price = parseFloat(input);
    if (isNaN(price) || price < 0) {
      alert("Preț invalid");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/curse/${tripId}/pasageri/${passengerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Eroare la actualizare");
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleEdit}
      disabled={loading}
      className="text-blue-500 hover:text-blue-700 p-1"
      title="Editează preț"
    >
      <Pencil className="h-4 w-4" />
    </button>
  );
}
