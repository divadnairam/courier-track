import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { ClientForm } from "@/components/shared/client-form";
import { ParcelStatusBadge } from "@/components/shared/status-badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      sentParcels: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { receiver: { select: { name: true } } },
      },
      receivedParcels: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { sender: { select: { name: true } } },
      },
    },
  });

  if (!client) notFound();

  return (
    <div>
      <PageHeader
        title={client.name}
        description={client.companyName || `Client ${client.type === "COMPANY" ? "companie" : "persoană fizică"}`}
      />

      <Tabs defaultValue="detalii">
        <TabsList>
          <TabsTrigger value="detalii">Detalii</TabsTrigger>
          <TabsTrigger value="expediate">
            Colete Expediate ({client.sentParcels.length})
          </TabsTrigger>
          <TabsTrigger value="primite">
            Colete Primite ({client.receivedParcels.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="detalii">
          <div className="rounded-lg border bg-white p-6">
            <ClientForm initialData={client} />
          </div>
        </TabsContent>

        <TabsContent value="expediate">
          <div className="rounded-lg border bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>AWB</TableHead>
                  <TableHead>Destinatar</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Preț</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.sentParcels.map((parcel) => (
                  <TableRow key={parcel.id}>
                    <TableCell>
                      <Link href={`/dashboard/colete/${parcel.id}`} className="text-blue-600 hover:underline font-medium">
                        {parcel.awb}
                      </Link>
                    </TableCell>
                    <TableCell>{parcel.receiver.name}</TableCell>
                    <TableCell><ParcelStatusBadge status={parcel.status} /></TableCell>
                    <TableCell>{formatCurrency(parcel.price)}</TableCell>
                    <TableCell>{formatDate(parcel.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {client.sentParcels.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                      Niciun colet expediat
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="primite">
          <div className="rounded-lg border bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>AWB</TableHead>
                  <TableHead>Expeditor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.receivedParcels.map((parcel) => (
                  <TableRow key={parcel.id}>
                    <TableCell>
                      <Link href={`/dashboard/colete/${parcel.id}`} className="text-blue-600 hover:underline font-medium">
                        {parcel.awb}
                      </Link>
                    </TableCell>
                    <TableCell>{parcel.sender.name}</TableCell>
                    <TableCell><ParcelStatusBadge status={parcel.status} /></TableCell>
                    <TableCell>{formatDate(parcel.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {client.receivedParcels.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                      Niciun colet primit
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
