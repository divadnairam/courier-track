import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { TripStatusBadge } from "@/components/shared/status-badge";
import { TRIP_STATUS_LABELS, COUNTRY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function CursePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const status = params.status || "";
  const page = parseInt(params.page || "1");
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (session?.user.role === "COURIER") {
    where.driverId = session.user.id;
  }

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      orderBy: { departureDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        driver: { select: { name: true } },
        _count: { select: { parcels: true, passengers: true } },
      },
    }),
    prisma.trip.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const canCreate = ["ADMIN", "OPERATOR"].includes(session?.user.role || "");

  return (
    <div>
      <PageHeader
        title="Curse"
        description={`${total} curse în total`}
        createHref={canCreate ? "/dashboard/curse/noua" : undefined}
        createLabel={canCreate ? "Cursă Nouă" : undefined}
      />

      <div className="mb-4">
        <form className="flex gap-2">
          <select name="status" defaultValue={status} className="rounded-lg border px-3 py-2 text-sm">
            <option value="">Toate statusurile</option>
            {Object.entries(TRIP_STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/80">
            Filtrează
          </button>
        </form>
      </div>

      <div className="rounded-lg border bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rută</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Ora</TableHead>
              <TableHead>Șofer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Colete</TableHead>
              <TableHead className="hidden sm:table-cell">Pasageri</TableHead>
              <TableHead className="hidden md:table-cell">Locuri</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trips.map((trip) => (
              <TableRow key={trip.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/curse/${trip.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {trip.originCity}{trip.originCountry !== "RO" ? ` (${COUNTRY_LABELS[trip.originCountry] || trip.originCountry})` : ""} → {trip.destinationCity}{trip.destinationCountry !== "RO" ? ` (${COUNTRY_LABELS[trip.destinationCountry] || trip.destinationCountry})` : ""}
                  </Link>
                </TableCell>
                <TableCell>{formatDate(trip.departureDate)}</TableCell>
                <TableCell>{trip.departureTime}</TableCell>
                <TableCell>{trip.driver?.name || "-"}</TableCell>
                <TableCell>
                  <TripStatusBadge status={trip.status} />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {trip._count.parcels}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {trip._count.passengers}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {trip.availableSeats}/{trip.totalSeats}
                </TableCell>
              </TableRow>
            ))}
            {trips.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Nu au fost găsite curse
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/dashboard/curse?status=${status}&page=${p}`}
              className={`px-3 py-1 rounded text-sm ${
                p === page ? "bg-primary text-primary-foreground" : "bg-white border hover:bg-gray-50"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
