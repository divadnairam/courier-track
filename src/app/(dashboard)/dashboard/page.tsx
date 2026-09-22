import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Package, Truck, Users, DollarSign } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { ParcelStatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { AwbSearchBox } from "@/components/shared/awb-search-box";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // For CLIENT role, filter parcels to only show their own
  let parcelFilter: Record<string, unknown> = {};
  if (role === "CLIENT") {
    const client = await prisma.client.findUnique({
      where: { userId: session?.user?.id },
    });
    if (client) {
      parcelFilter = {
        OR: [{ senderId: client.id }, { receiverId: client.id }],
      };
    } else {
      parcelFilter = { id: "__none__" }; // no results
    }
  } else if (role === "COURIER") {
    parcelFilter = { trip: { driverId: session?.user?.id } };
  }

  const [totalParcels, deliveriesToday, activeTrips, monthlyRevenue, recentParcels] =
    await Promise.all([
      prisma.parcel.count({ where: parcelFilter }),
      prisma.parcel.count({
        where: {
          ...parcelFilter,
          status: "LIVRAT",
          updatedAt: { gte: startOfDay },
        },
      }),
      prisma.trip.count({
        where: { status: { in: ["PROGRAMAT", "IN_DESFASURARE"] } },
      }),
      prisma.parcel.aggregate({
        _sum: { price: true },
        where: { ...parcelFilter, createdAt: { gte: startOfMonth } },
      }),
      prisma.parcel.findMany({
        where: parcelFilter,
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          sender: { select: { name: true } },
          receiver: { select: { name: true } },
        },
      }),
    ]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <AwbSearchBox />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Colete"
          value={totalParcels}
          description="Toate coletele din sistem"
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Livrări Azi"
          value={deliveriesToday}
          description="Colete livrate astăzi"
          icon={<Package className="h-4 w-4 text-green-600" />}
        />
        {role !== "CLIENT" && (
          <StatCard
            title="Curse Active"
            value={activeTrips}
            description="Curse programate sau în desfășurare"
            icon={<Truck className="h-4 w-4 text-blue-600" />}
          />
        )}
        {(role === "ADMIN" || role === "OPERATOR") && (
          <StatCard
            title="Venituri Luna"
            value={formatCurrency(monthlyRevenue._sum.price || 0)}
            description="Venituri luna curentă"
            icon={<DollarSign className="h-4 w-4 text-yellow-600" />}
          />
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Colete Recente</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>AWB</TableHead>
              <TableHead>Expeditor</TableHead>
              <TableHead>Destinatar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Ultima actualizare</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentParcels.map((parcel) => (
              <TableRow key={parcel.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/colete/${parcel.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {parcel.awb}
                  </Link>
                </TableCell>
                <TableCell>{parcel.sender.name}</TableCell>
                <TableCell>{parcel.receiver.name}</TableCell>
                <TableCell>
                  <ParcelStatusBadge status={parcel.status} />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {formatDate(parcel.updatedAt)}
                </TableCell>
              </TableRow>
            ))}
            {recentParcels.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Nu există colete încă
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
