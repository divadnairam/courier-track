"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DAYS_OF_WEEK, COUNTRY_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { Plus, Play, Repeat } from "lucide-react";

interface RecurringTripItem {
  id: string;
  dayOfWeek: number;
  originCity: string;
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  departureTime: string;
  totalSeats: number;
  pricePerSeat: number;
  active: boolean;
  weeksInAdvance: number;
  driver: { name: string } | null;
  _count: { generatedTrips: number };
}

export default function RecurringTripsPage() {
  const [templates, setTemplates] = useState<RecurringTripItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, []);

  function fetchTemplates() {
    fetch("/api/curse-recurente")
      .then((res) => res.json())
      .then((data) => setTemplates(data.templates || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  async function handleGenerate(id: string) {
    setGenerating(id);
    setMessage("");

    try {
      const res = await fetch(`/api/curse-recurente/${id}/genereaza`, {
        method: "POST",
      });
      const data = await res.json();
      setMessage(data.message);
      fetchTemplates();
    } catch {
      setMessage("Eroare la generare");
    } finally {
      setGenerating(null);
    }
  }

  if (loading) {
    return <div className="p-6">Se încarcă...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Curse Recurente</h1>
          <p className="text-sm text-gray-500 mt-1">
            Șabloane pentru generare automată de curse
          </p>
        </div>
        <Link href="/dashboard/curse-recurente/nou">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Adaugă Șablon
          </Button>
        </Link>
      </div>

      {message && (
        <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
          {message}
        </div>
      )}

      {templates.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
          <Repeat className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Nu există șabloane de curse recurente.</p>
          <p className="text-sm mt-1">Creează primul șablon pentru a genera curse automat.</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Rută</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Zi</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Oră</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Locuri</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Preț</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Șofer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Curse</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {templates.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/curse-recurente/${t.id}`} className="hover:text-blue-600">
                      {t.originCity}
                      {t.originCountry !== "RO" && ` (${COUNTRY_LABELS[t.originCountry] || t.originCountry})`}
                      {" → "}
                      {t.destinationCity}
                      {t.destinationCountry !== "RO" && ` (${COUNTRY_LABELS[t.destinationCountry] || t.destinationCountry})`}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{DAYS_OF_WEEK[t.dayOfWeek]}</td>
                  <td className="px-4 py-3">{t.departureTime}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">{t.totalSeats}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {t.pricePerSeat > 0 ? formatCurrency(t.pricePerSeat) : "—"}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {t.driver?.name || "—"}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {t._count.generatedTrips}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        t.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {t.active ? "Activ" : "Inactiv"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={generating === t.id || !t.active}
                      onClick={() => handleGenerate(t.id)}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      {generating === t.id ? "..." : "Generează"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
