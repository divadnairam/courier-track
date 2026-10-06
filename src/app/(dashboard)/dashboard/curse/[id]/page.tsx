import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { TripStatusBadge } from "@/components/shared/status-badge";
import { PassengerForm } from "@/components/shared/passenger-form";
import { DeletePassengerButton } from "@/components/shared/delete-passenger-button";
import { EditPassengerButton } from "@/components/shared/edit-passenger-button";
import { PassengerQRButton } from "@/components/shared/passenger-qr-button";
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
      stops: { orderBy: { order: "asc" } },
    },
  });

  if (!trip) notFound();

  const canEdit = ["ADMIN", "OPERATOR"].includes(session?.user?.role || "");
  const totalPassengerRevenue = trip.passengers.reduce((sum, p) => sum + p.price, 0);
  const totalParcelRevenue = trip.parcels.reduce((sum, p) => sum + p.price, 0);
  const passengersWithParcels = trip.passengers.filter((p) => p.parcelCount > 0);
  const totalParcels = passengersWithParcels.reduce((sum, p) => sum + p.parcelCount, 0);
  const totalParcelWeight = passengersWithParcels.reduce((sum, p) => sum + p.parcelWeight, 0);

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
          <TabsTrigger value="colete">Colete pasageri ({totalParcels})</TabsTrigger>
          <TabsTrigger value="pasageri">Pasageri ({trip.passengers.length})</TabsTrigger>
          {trip.stops && trip.stops.length > 0 && (
            <TabsTrigger value="opriri">Opriri ({trip.stops.length})</TabsTrigger>
          )}
          <TabsTrigger value="detalii">Detalii</TabsTrigger>
        </TabsList>

        <TabsContent value="colete">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Colete pasageri</CardTitle>
                <span className="text-sm text-gray-500">
                  {totalParcels} {totalParcels === 1 ? "colet" : "colete"} — {totalParcelWeight} kg total
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pasager</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Destinație</TableHead>
                    <TableHead>Colete</TableHead>
                    <TableHead>Greutate</TableHead>
                    <TableHead>Ref. rezervare</TableHead>
                    {canEdit && <TableHead>QR</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {passengersWithParcels.map((passenger) => (
                    <TableRow key={passenger.id}>
                      <TableCell className="font-medium">{passenger.name}</TableCell>
                      <TableCell>{passenger.phone}</TableCell>
                      <TableCell className="text-xs">
                        {passenger.destinationCity || trip.destinationCity}
                      </TableCell>
                      <TableCell>{passenger.parcelCount}</TableCell>
                      <TableCell>{passenger.parcelWeight} kg</TableCell>
                      <TableCell className="font-mono text-xs">
                        {passenger.bookingRef || "-"}
                      </TableCell>
                      {canEdit && (
                        <TableCell>
                          {passenger.bookingRef && (
                            <PassengerQRButton
                              bookingRef={passenger.bookingRef}
                              passengerName={passenger.name}
                              destinationCity={passenger.destinationCity || trip.destinationCity}
                              parcelCount={passenger.parcelCount}
                              seatCount={passenger.seatCount}
                            />
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {passengersWithParcels.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={canEdit ? 7 : 6} className="text-center py-4 text-gray-500">
                        Niciun pasager cu colete pe această cursă
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
              {canEdit && (
                <PassengerForm
                  tripId={trip.id}
                  stops={trip.stops?.map((s) => ({
                    id: s.id,
                    city: s.city,
                    country: s.country,
                    order: s.order,
                    price: s.price,
                  })) || []}
                  destinationCity={trip.destinationCity}
                  pricePerSeat={trip.pricePerSeat}
                />
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nume</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Destinație</TableHead>
                    <TableHead>Locuri</TableHead>
                    <TableHead>Colete</TableHead>
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
                      <TableCell className="text-xs">
                        {passenger.destinationCity || trip.destinationCity}
                      </TableCell>
                      <TableCell>{passenger.seatCount}</TableCell>
                      <TableCell>
                        {passenger.parcelCount > 0
                          ? `${passenger.parcelCount} (${passenger.parcelWeight} kg)`
                          : "-"}
                      </TableCell>
                      <TableCell>{formatCurrency(passenger.price)}</TableCell>
                      <TableCell className="text-sm text-gray-500">{passenger.notes || "-"}</TableCell>
                      {canEdit && (
                        <TableCell className="flex gap-1">
                          {passenger.bookingRef && (
                            <PassengerQRButton
                              bookingRef={passenger.bookingRef}
                              passengerName={passenger.name}
                              destinationCity={passenger.destinationCity || trip.destinationCity}
                              parcelCount={passenger.parcelCount}
                              seatCount={passenger.seatCount}
                            />
                          )}
                          <EditPassengerButton
                            tripId={trip.id}
                            passengerId={passenger.id}
                            currentPrice={passenger.price}
                            passengerName={passenger.name}
                          />
                          <DeletePassengerButton tripId={trip.id} passengerId={passenger.id} />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {trip.passengers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={canEdit ? 8 : 7} className="text-center py-4 text-gray-500">
                        Niciun pasager
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {trip.stops && trip.stops.length > 0 && (
          <TabsContent value="opriri">
            <Card>
              <CardHeader>
                <CardTitle>Opriri și prețuri</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Oraș</TableHead>
                      <TableHead>Țara</TableHead>
                      <TableHead>Preț (EUR)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trip.stops.map((stop, i) => (
                      <TableRow key={stop.id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell className="font-medium">{stop.city}</TableCell>
                        <TableCell>{stop.country}</TableCell>
                        <TableCell>{formatCurrency(stop.price)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-blue-50">
                      <TableCell>{trip.stops.length + 1}</TableCell>
                      <TableCell className="font-medium">{trip.destinationCity} (finală)</TableCell>
                      <TableCell>{trip.destinationCountry}</TableCell>
                      <TableCell>{formatCurrency(trip.pricePerSeat)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

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
