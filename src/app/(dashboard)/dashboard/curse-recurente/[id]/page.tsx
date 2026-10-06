"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { RecurringTripForm } from "@/components/shared/recurring-trip-form";
import { Button } from "@/components/ui/button";
import { DAYS_OF_WEEK, TRIP_STATUS_LABELS, TRIP_STATUS_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Play } from "lucide-react";

interface GeneratedTrip {
  id: string;
  departureDate: string;
  departureTime: string;
  status: string;
  availableSeats: number;
  totalSeats: number;
  _count: { passengers: number };
}

interface RecurringTripDetail {
  id: string;
  dayOfWeek: number;
  originCity: string;
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  route: string | null;
  departureTime: string;
  estimatedArrivalDays: number | null;
  totalSeats: number;
  pricePerSeat: number;
  stops: { city: string; country: string; order: number; price: number }[] | null;
  driverId: string | null;
  vehicleInfo: string | null;
  notes: string | null;
  active: boolean;
  weeksInAdvance: number;
  driver: { name: string } | null;
  generatedTrips: GeneratedTrip[];
}

export default function RecurringTripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [template, setTemplate] = useState<RecurringTripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchTemplate();
  }, [id]);

  function fetchTemplate() {
    fetch(`/api/curse-recurente/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setTemplate)
      .catch(() => router.push("/dashboard/curse-recurente"))
      .finally(() => setLoading(false));
  }

  async function handleGenerate() {
    setGenerating(true);
    setMessage("");

    try {
      const res = await fetch(`/api/curse-recurente/${id}/genereaza`, {
        method: "POST",
      });
      const data = await res.json();
      setMessage(data.message);
      fetchTemplate();
    } catch {
      setMessage("Eroare la generare");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return <div className="p-6">Se încarcă...</div>;
  }

  if (!template) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Editare Șablon — {DAYS_OF_WEEK[template.dayOfWeek]}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {template.originCity} → {template.destinationCity}
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={generating || !template.active}>
          <Play className="h-4 w-4 mr-2" />
          {generating ? "Se generează..." : "Generează Curse"}
        </Button>
      </div>

      {message && (
        <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
          {message}
        </div>
      )}

      <RecurringTripForm initialData={template} />

      {/* Generated Trips */}
      {template.generatedTrips.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Curse Generate ({template.generatedTrips.length})
          </h2>
          <div className="rounded-xl border bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Data</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Oră</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Locuri</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Pasageri</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {template.generatedTrips.map((trip) => (
                  <tr
                    key={trip.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/dashboard/curse/${trip.id}`)}
                  >
                    <td className="px-4 py-3">{formatDate(trip.departureDate)}</td>
                    <td className="px-4 py-3">{trip.departureTime}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          TRIP_STATUS_COLORS[trip.status as keyof typeof TRIP_STATUS_COLORS] || "bg-gray-100"
                        }`}
                      >
                        {TRIP_STATUS_LABELS[trip.status as keyof typeof TRIP_STATUS_LABELS] || trip.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {trip.availableSeats} / {trip.totalSeats}
                    </td>
                    <td className="px-4 py-3">{trip._count.passengers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
