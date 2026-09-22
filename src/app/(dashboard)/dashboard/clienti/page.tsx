import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { CLIENT_TYPE_LABELS, COUNTRY_LABELS, type ClientType } from "@/lib/constants";
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
import { Badge } from "@/components/ui/badge";

export default async function ClientiPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const type = params.type || "";
  const page = parseInt(params.page || "1");
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
      { email: { contains: search } },
      { city: { contains: search } },
    ];
  }
  if (type) {
    where.type = type;
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.client.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <PageHeader
        title="Clienți"
        description={`${total} clienți în total`}
        createHref="/dashboard/clienti/nou"
        createLabel="Client Nou"
      />

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <form className="flex gap-2 flex-1">
          <input
            name="search"
            defaultValue={search}
            placeholder="Caută după nume, telefon, email, oraș..."
            className="flex-1 rounded-lg border px-3 py-2 text-sm"
          />
          <select name="type" defaultValue={type} className="rounded-lg border px-3 py-2 text-sm">
            <option value="">Toate tipurile</option>
            <option value="INDIVIDUAL">Persoană fizică</option>
            <option value="COMPANY">Companie</option>
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
              <TableHead>Nume</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Oraș</TableHead>
              <TableHead className="hidden lg:table-cell">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/clienti/${client.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {client.name}
                    {client.companyName && (
                      <span className="block text-xs text-gray-500">
                        {client.companyName}
                      </span>
                    )}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {CLIENT_TYPE_LABELS[client.type as ClientType]}
                  </Badge>
                </TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {client.email || "-"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {client.city}, {client.country !== "RO" ? COUNTRY_LABELS[client.country] || client.country : client.county}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {formatDate(client.createdAt)}
                </TableCell>
              </TableRow>
            ))}
            {clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Nu au fost găsiți clienți
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/dashboard/clienti?search=${search}&type=${type}&page=${p}`}
              className={`px-3 py-1 rounded text-sm ${
                p === page
                  ? "bg-primary text-primary-foreground"
                  : "bg-white border hover:bg-gray-50"
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
