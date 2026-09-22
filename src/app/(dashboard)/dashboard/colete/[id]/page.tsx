import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { ParcelStatusBadge } from "@/components/shared/status-badge";
import { StatusTimeline } from "@/components/shared/status-timeline";
import { UpdateStatusForm } from "@/components/shared/update-status-form";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Printer } from "lucide-react";

export default async function ColetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const parcel = await prisma.parcel.findUnique({
    where: { id },
    include: {
      sender: true,
      receiver: true,
      trip: { select: { id: true, originCity: true, destinationCity: true, status: true } },
      statusHistory: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!parcel) notFound();

  const canUpdateStatus = ["ADMIN", "OPERATOR", "COURIER"].includes(session?.user?.role || "");

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Colet {parcel.awb}</h1>
          <p className="text-sm text-gray-500">{parcel.pickupCity} → {parcel.deliveryCity}</p>
        </div>
        <Link
          href={`/dashboard/colete/${parcel.id}/eticheta`}
          className="inline-flex items-center justify-center rounded-lg h-8 gap-1.5 px-3 bg-primary text-primary-foreground hover:bg-primary/80 text-sm font-medium"
        >
          <Printer className="h-4 w-4" />
          Printează Eticheta
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informații Colet</CardTitle>
                <ParcelStatusBadge status={parcel.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">Expeditor</p>
                  <p className="font-medium">{parcel.sender.name}</p>
                  <p className="text-sm text-gray-600">{parcel.pickupAddress}</p>
                  <p className="text-sm text-gray-600">{parcel.pickupCity}</p>
                  <p className="text-sm text-gray-600">{parcel.sender.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Destinatar</p>
                  <p className="font-medium">{parcel.receiver.name}</p>
                  <p className="text-sm text-gray-600">{parcel.deliveryAddress}</p>
                  <p className="text-sm text-gray-600">{parcel.deliveryCity}</p>
                  <p className="text-sm text-gray-600">{parcel.receiver.phone}</p>
                </div>
              </div>

              <div className="border-t pt-4 grid gap-4 grid-cols-2 sm:grid-cols-4">
                {parcel.weight && (
                  <div>
                    <p className="text-xs text-gray-500">Greutate</p>
                    <p className="font-medium">{parcel.weight} kg</p>
                  </div>
                )}
                {parcel.content && (
                  <div>
                    <p className="text-xs text-gray-500">Conținut</p>
                    <p className="font-medium">{parcel.content}</p>
                  </div>
                )}
                {parcel.declaredValue && (
                  <div>
                    <p className="text-xs text-gray-500">Valoare Declarată</p>
                    <p className="font-medium">{formatCurrency(parcel.declaredValue)}</p>
                  </div>
                )}
                {parcel.cashOnDelivery && (
                  <div>
                    <p className="text-xs text-gray-500">Ramburs</p>
                    <p className="font-medium">{formatCurrency(parcel.cashOnDelivery)}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-gray-500">Preț Transport</p>
                <p className="text-lg font-bold">{formatCurrency(parcel.price)}</p>
              </div>

              {parcel.trip && (
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500">Cursă Asignată</p>
                  <p className="font-medium">
                    {parcel.trip.originCity} → {parcel.trip.destinationCity}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Update status */}
          {canUpdateStatus && (
            <Card>
              <CardContent className="pt-6">
                <UpdateStatusForm parcelId={parcel.id} currentStatus={parcel.status} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Timeline */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Istoric Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline entries={parcel.statusHistory} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
