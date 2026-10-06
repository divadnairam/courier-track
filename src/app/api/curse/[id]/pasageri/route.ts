import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { passengerSchema } from "@/lib/validators";
import { generateBookingRef } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "OPERATOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const result = passengerSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Date invalide", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { stops: true },
  });
  if (!trip) {
    return NextResponse.json({ error: "Cursă negăsită" }, { status: 404 });
  }
  if (trip.availableSeats < result.data.seatCount) {
    return NextResponse.json({ error: "Nu sunt suficiente locuri disponibile" }, { status: 400 });
  }

  const { tripStopId, email, parcelCount, parcelWeight, ...passengerData } = result.data;

  // Resolve destination from stop
  let destinationCity = trip.destinationCity;
  let destinationCountry = trip.destinationCountry;
  let resolvedStopId: string | null = null;

  if (tripStopId && tripStopId !== "final") {
    const stop = trip.stops.find((s) => s.id === tripStopId);
    if (stop) {
      destinationCity = stop.city;
      destinationCountry = stop.country;
      resolvedStopId = stop.id;
    }
  }

  // Generate booking ref
  let bookingRef = generateBookingRef();
  let retries = 0;
  while (retries < 3) {
    const existing = await prisma.passenger.findUnique({ where: { bookingRef } });
    if (!existing) break;
    bookingRef = generateBookingRef();
    retries++;
  }

  const [passenger] = await prisma.$transaction([
    prisma.passenger.create({
      data: {
        ...passengerData,
        tripId: id,
        email: email || null,
        parcelCount: parcelCount || 0,
        parcelWeight: parcelWeight || 0,
        destinationCity,
        destinationCountry,
        tripStopId: resolvedStopId,
        bookingRef,
        status: "CONFIRMATA",
      },
    }),
    prisma.trip.update({
      where: { id },
      data: { availableSeats: { decrement: result.data.seatCount } },
    }),
  ]);

  return NextResponse.json(passenger, { status: 201 });
}
