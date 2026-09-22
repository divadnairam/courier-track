"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function DeletePassengerButton({
  tripId,
  passengerId,
}: {
  tripId: string;
  passengerId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Sigur doriți să eliminați acest pasager?")) return;
    setLoading(true);

    await fetch(`/api/curse/${tripId}/pasageri/${passengerId}`, {
      method: "DELETE",
    });

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:text-red-700 p-1"
      title="Elimină pasager"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
