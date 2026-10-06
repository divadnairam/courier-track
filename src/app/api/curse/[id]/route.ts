import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tripSchema } from "@/lib/validators";
import { VALID_TRIP_TRANSITIONS, TRIP_STATUS_LABELS, type TripStatus } from "@/lib/constants";
import { sendBookingNotification } from "@/lib/email";
import { toUTCMidnight } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

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

  if (!trip) {
    return NextResponse.json({ error: "Cursă negăsită" }, { status: 404 });
  }

  return NextResponse.json(trip);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "OPERATOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  // Handle status-only update
  if (body.status && Object.keys(body).length === 1) {
    const currentTrip = await prisma.trip.findUnique({ where: { id } });
    if (!currentTrip) {
      return NextResponse.json({ error: "Cursă negăsită" }, { status: 404 });
    }

    const currentStatus = currentTrip.status as TripStatus;
    const newStatus = body.status as TripStatus;
    const allowed = VALID_TRIP_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `Tranziția de la "${TRIP_STATUS_LABELS[currentStatus]}" la "${TRIP_STATUS_LABELS[newStatus]}" nu este permisă. Tranziții valide: ${allowed.length > 0 ? allowed.map((s) => TRIP_STATUS_LABELS[s]).join(", ") : "niciuna"}`,
        },
        { status: 400 }
      );
    }

    const trip = await prisma.trip.update({
      where: { id },
      data: { status: newStatus },
    });

    // Notify all confirmed passengers with email
    const passengers = await prisma.passenger.findMany({
      where: { tripId: id, status: "CONFIRMATA", email: { not: null } },
    });

    Promise.allSettled(
      passengers.map((p) =>
        sendBookingNotification("trip_update", {
          bookingRef: p.bookingRef!,
          passengerName: p.name,
          passengerEmail: p.email,
          passengerPhone: p.phone,
          seatCount: p.seatCount,
          price: p.price,
          originCity: trip.originCity,
          originCountry: trip.originCountry,
          destinationCity: trip.destinationCity,
          destinationCountry: trip.destinationCountry,
          departureDate: trip.departureDate.toISOString(),
          departureTime: trip.departureTime,
          route: trip.route,
          tripStatus: newStatus,
        })
      )
    ).catch(() => {});

    return NextResponse.json(trip);
  }

  const result = tripSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Date invalide", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { departureDate, estimatedArrival, ...rest } = result.data;
  const stops = body.stops as { city: string; country: string; order: number; price: number }[] | undefined;

  const trip = await prisma.$transaction(async (tx) => {
    const updated = await tx.trip.update({
      where: { id },
      data: {
        ...rest,
        departureDate: toUTCMidnight(departureDate),
        estimatedArrival: estimatedArrival ? toUTCMidnight(estimatedArrival) : null,
      },
    });

    if (stops !== undefined) {
      // Delete old stops that have no passengers linked
      await tx.tripStop.deleteMany({
        where: { tripId: id, passengers: { none: {} } },
      });
      // Upsert or create stops
      for (const s of stops) {
        await tx.tripStop.create({
          data: {
            tripId: id,
            city: s.city,
            country: s.country || "RO",
            order: s.order,
            price: Number(s.price) || 0,
          },
        });
      }
    }

    return updated;
  });

  const tripWithStops = await prisma.trip.findUnique({
    where: { id },
    include: { stops: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(tripWithStops);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.trip.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
