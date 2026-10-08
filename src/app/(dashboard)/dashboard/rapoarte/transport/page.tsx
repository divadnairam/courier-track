"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface MonthlyData {
  month: string;
  passengers: number;
  cancelled: number;
  revenue: number;
  trips: number;
  parcels: number;
}

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444"];

export default function TransportPage() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rapoarte?type=transport")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  const totalPassengers = data.reduce((sum, d) => sum + d.passengers, 0);
  const totalCancelled = data.reduce((sum, d) => sum + d.cancelled, 0);
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalTrips = data.reduce((sum, d) => sum + d.trips, 0);
  const totalParcels = data.reduce((sum, d) => sum + d.parcels, 0);
  const cancelRate = totalPassengers + totalCancelled > 0
    ? ((totalCancelled / (totalPassengers + totalCancelled)) * 100).toFixed(1)
    : "0";

  const pieData = [
    { name: "Confirmați", value: totalPassengers },
    { name: "Anulați", value: totalCancelled },
  ];

  return (
    <div>
      <PageHeader title="Raport Transport Persoane" description="Ultimele 12 luni" backHref="/dashboard/rapoarte" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Total Pasageri</p>
            <p className="text-2xl font-bold">{totalPassengers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Venituri Transport</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Total Curse</p>
            <p className="text-2xl font-bold text-blue-600">{totalTrips}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Colete Pasageri</p>
            <p className="text-2xl font-bold text-purple-600">{totalParcels}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Rată Anulare</p>
            <p className="text-2xl font-bold text-red-500">{cancelRate}%</p>
            <p className="text-xs text-gray-400">{totalCancelled} anulări</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Main chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pasageri și Venituri Lunare</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Se încarcă...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis yAxisId="left" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="passengers" name="Pasageri" fill="#3b82f6" />
                  <Bar yAxisId="left" dataKey="cancelled" name="Anulări" fill="#ef4444" />
                  <Line yAxisId="right" dataKey="revenue" name="Venituri (EUR)" stroke="#22c55e" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie chart */}
        <Card>
          <CardHeader>
            <CardTitle>Confirmări vs Anulări</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Se încarcă...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#3b82f6" : "#ef4444"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trips and parcels chart */}
      <Card>
        <CardHeader>
          <CardTitle>Curse și Colete Pasageri</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Se încarcă...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="trips" name="Curse" fill="#f59e0b" />
                <Bar dataKey="parcels" name="Colete Pasageri" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
