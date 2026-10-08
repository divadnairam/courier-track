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
} from "recharts";

interface MonthlyData {
  month: string;
  revenue: number;
  parcelRevenue: number;
  passengerRevenue: number;
  parcelCount: number;
  passengerCount: number;
}

export default function VenituriPage() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rapoarte?type=revenue")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalParcelRevenue = data.reduce((sum, d) => sum + d.parcelRevenue, 0);
  const totalPassengerRevenue = data.reduce((sum, d) => sum + d.passengerRevenue, 0);
  const totalParcelCount = data.reduce((sum, d) => sum + d.parcelCount, 0);
  const totalPassengerCount = data.reduce((sum, d) => sum + d.passengerCount, 0);

  return (
    <div>
      <PageHeader title="Raport Venituri" description="Ultimele 12 luni" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Venituri Totale (12 luni)</p>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Venituri Colete</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalParcelRevenue)}</p>
            <p className="text-xs text-gray-400">{totalParcelCount} colete</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Venituri Transport Persoane</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPassengerRevenue)}</p>
            <p className="text-xs text-gray-400">{totalPassengerCount} pasageri</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Total Operațiuni</p>
            <p className="text-2xl font-bold">{totalParcelCount + totalPassengerCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Venituri Lunare</CardTitle>
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
                <Bar yAxisId="left" dataKey="parcelRevenue" name="Venituri Colete" fill="#3b82f6" stackId="revenue" />
                <Bar yAxisId="left" dataKey="passengerRevenue" name="Venituri Persoane" fill="#22c55e" stackId="revenue" />
                <Line yAxisId="right" dataKey="parcelCount" name="Nr. Colete" stroke="#f59e0b" />
                <Line yAxisId="right" dataKey="passengerCount" name="Nr. Pasageri" stroke="#8b5cf6" />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
