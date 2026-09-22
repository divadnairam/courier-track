"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CourierStats {
  name: string;
  totalTrips: number;
  completedTrips: number;
  deliveries: number;
}

export default function CurieriPage() {
  const [data, setData] = useState<CourierStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rapoarte?type=couriers")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <PageHeader title="Performanță Curieri" description="Statistici per curier" />

      <Card>
        <CardHeader>
          <CardTitle>Curieri</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-32 flex items-center justify-center text-gray-500">
              Se încarcă...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curier</TableHead>
                  <TableHead>Total Curse</TableHead>
                  <TableHead>Curse Finalizate</TableHead>
                  <TableHead>Livrări Efectuate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((courier, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{courier.name}</TableCell>
                    <TableCell>{courier.totalTrips}</TableCell>
                    <TableCell>{courier.completedTrips}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {courier.deliveries}
                    </TableCell>
                  </TableRow>
                ))}
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                      Nu există curieri în sistem
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
