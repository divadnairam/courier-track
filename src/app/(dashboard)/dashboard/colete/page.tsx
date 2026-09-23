import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { ParcelStatusBadge } from "@/components/shared/status-badge";
import { PARCEL_STATUS_LABELS, COUNTRY_LABELS, type ParcelStatus } from "@/lib/constants";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ColetePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const search = params.search || "";
  const status = params.status || "";
  const page = parseInt(params.page || "1");
  const limit = 20;

  const where: Record<string, unknown> = {
    status: { notIn: status ? [] : ["LIVRAT", "RETURNAT"] },
  };
  if (search) {
    where.OR = [
      { awb: { contains: search } },
      { sender: { name: { contains: search } } },
      { receiver: { name: { contains: search } } },
      { deliveryCity: { contains: search } },
    ];
  }
  if (status) {
    where.status = status;
  }
  if (session?.user.role === "COURIER") {
    where.trip = { driverId: session.user.id };
  }

  if (session?.user.role === "CLIENT") {
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
    });
    if (client) {
      const existingOr = Array.isArray(where.OR) ? where.OR : [];
      where.OR = [...existingOr, { senderId: client.id }, { receiverId: client.id }];
    } else {
      return (
        <div>
          <PageHeader title="Colete" description="0 colete în total" />
          <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
            Nu au fost găsite colete
          </div>
        </div>
      );
    }
  }

  const [parcels, total] = await Promise.all([
    prisma.parcel.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        sender: { select: { name: true } },
        receiver: { select: { name: true } },
      },
    }),
    prisma.parcel.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const canCreate = ["ADMIN", "OPERATOR", "CLIENT"].includes(session?.user.role || "");

  return (
    <div>
      <PageHeader
        title="Colete"
        description={`${total} colete în total`}
        createHref={canCreate ? "/dashboard/colete/nou" : undefined}
        createLabel={canCreate ? "Colet Nou" : undefined}
      />

      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <form className="flex gap-2 flex-1 flex-wrap">
          <input
            name="search"
            defaultValue={search}
            placeholder="Caută după AWB, expeditor, destinatar, oraș..."
            className="flex-1 min-w-[200px] rounded-lg border px-3 py-2 text-sm"
          />
          <select name="status" defaultValue={status} className="rounded-lg border px-3 py-2 text-sm">
            <option value="">Toate statusurile</option>
            {Object.entries(PARCEL_STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/80">
            Caută
          </button>
        </form>
      </div>

      <div className="rounded-lg border bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>AWB</TableHead>
              <TableHead>Expeditor</TableHead>
              <TableHead>Destinatar</TableHead>
              <TableHead>Rută</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Preț</TableHead>
              <TableHead className="hidden md:table-cell">Ultima actualizare</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parcels.map((parcel) => (
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
                <TableCell className="text-xs">
                  {parcel.pickupCity}{parcel.pickupCountry !== "RO" ? `, ${COUNTRY_LABELS[parcel.pickupCountry] || parcel.pickupCountry}` : ""} → {parcel.deliveryCity}{parcel.deliveryCountry !== "RO" ? `, ${COUNTRY_LABELS[parcel.deliveryCountry] || parcel.deliveryCountry}` : ""}
                </TableCell>
                <TableCell>
                  <ParcelStatusBadge status={parcel.status} />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {formatCurrency(parcel.price)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatDate(parcel.updatedAt)}
                </TableCell>
              </TableRow>
            ))}
            {parcels.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Nu au fost găsite colete
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
              href={`/dashboard/colete?search=${search}&status=${status}&page=${p}`}
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
