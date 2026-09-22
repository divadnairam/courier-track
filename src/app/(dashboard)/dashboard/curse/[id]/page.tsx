import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { TripStatusBadge, ParcelStatusBadge } from "@/components/shared/status-badge";
import { PassengerForm } from "@/components/shared/passenger-form";
import { DeletePassengerButton } from "@/components/shared/delete-passenger-button";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { MapPin, Clock, Truck, Users } from "lucide-react";

export default async function CursaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      driver: { select: { id: true, name: true, phone: true } },
      parcels: {
        include: {
          sender: { select: { name: true } },
          receiver: { select: { name: true } },
        },
      },
      passengers: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!trip) notFound();

  const canEdit = ["ADMIN", "OPERATOR"].includes(session?.user?.role || "");
  const totalPassengerRevenue = trip.passengers.reduce((sum, p) => sum + p.price, 0);
  const totalParcelRevenue = trip.parcels.reduce((sum, p) => sum + p.price, 0);

  return (
    <div>
      <PageHeader
        title={`${trip.originCity} → ${trip.destinationCity}`}
        description={trip.route || undefined}
      />

      {/* Trip info cards */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-xs text-gray-500">Plecare</p>
              <p className="font-medium">{formatDate(trip.departureDate)} {trip.departureTime}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <TripStatusBadge status={trip.status} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <Truck className="h-5 w-5 text-gray-600" />
            <div>
              <p className="text-xs text-gray-500">Șofer</p>
              <p className="font-medium">{trip.driver?.name || "Neasignat"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-xs text-gray-500">Locuri</p>
              <p className="font-medium">{trip.availableSeats}/{trip.totalSeats} disponibile</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="colete">
        <TabsList>
          <TabsTrigger value="colete">Colete ({trip.parcels.length})</TabsTrigger>
          <TabsTrigger value="pasageri">Pasageri ({trip.passengers.length})</TabsTrigger>
          <TabsTrigger value="detalii">Detalii</TabsTrigger>
        </TabsList>

        <TabsContent value="colete">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Colete pe această cursă</CardTitle>
                <span className="text-sm text-gray-500">
                  Venit colete: {formatCurrency(totalParcelRevenue)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>AWB</TableHead>
                    <TableHead>Expeditor</TableHead>
                    <TableHead>Destinatar</TableHead>
                    <TableHead>Rută</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Preț</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trip.parcels.map((parcel) => (
                    <TableRow key={parcel.id}>
                      <TableCell>
                        <Link href={`/dashboard/colete/${parcel.id}`} className="text-blue-600 hover:underline font-medium">
                          {parcel.awb}
                        </Link>
                      </TableCell>
                      <TableCell>{parcel.sender.name}</TableCell>
                      <TableCell>{parcel.receiver.name}</TableCell>
                      <TableCell className="text-xs">{parcel.pickupCity} → {parcel.deliveryCity}</TableCell>
                      <TableCell><ParcelStatusBadge status={parcel.status} /></TableCell>
                      <TableCell>{formatCurrency(parcel.price)}</TableCell>
                    </TableRow>
                  ))}
                  {trip.parcels.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                        Niciun colet asignat
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pasageri">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pasageri</CardTitle>
                <span className="text-sm text-gray-500">
                  Venit pasageri: {formatCurrency(totalPassengerRevenue)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {canEdit && <PassengerForm tripId={trip.id} />}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nume</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Locuri</TableHead>
                    <TableHead>Preț</TableHead>
                    <TableHead>Observații</TableHead>
                    {canEdit && <TableHead></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trip.passengers.map((passenger) => (
                    <TableRow key={passenger.id}>
                      <TableCell className="font-medium">{passenger.name}</TableCell>
                      <TableCell>{passenger.phone}</TableCell>
                      <TableCell>{passenger.seatCount}</TableCell>
                      <TableCell>{formatCurrency(passenger.price)}</TableCell>
                      <TableCell className="text-sm text-gray-500">{passenger.notes || "-"}</TableCell>
                      {canEdit && (
                        <TableCell>
                          <DeletePassengerButton tripId={trip.id} passengerId={passenger.id} />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {trip.passengers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={canEdit ? 6 : 5} className="text-center py-4 text-gray-500">
                        Niciun pasager
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detalii">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">Vehicul</p>
                  <p className="font-medium">{trip.vehicleInfo || "Nespecificat"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Șofer</p>
                  <p className="font-medium">{trip.driver?.name || "Neasignat"}</p>
                  {trip.driver?.phone && (
                    <p className="text-sm text-gray-600">{trip.driver.phone}</p>
                  )}
                </div>
              </div>
              {trip.notes && (
                <div>
                  <p className="text-xs text-gray-500">Observații</p>
                  <p className="text-sm">{trip.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
