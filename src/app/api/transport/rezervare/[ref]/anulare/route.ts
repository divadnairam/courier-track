import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingNotification } from "@/lib/email";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;

  const passenger = await prisma.passenger.findUnique({
    where: { bookingRef: ref.toUpperCase() },
    include: {
      trip: true,
    },
  });

  if (!passenger) {
    return NextResponse.json({ error: "Rezervarea nu a fost găsită" }, { status: 404 });
  }

  if (passenger.status === "ANULATA") {
    return NextResponse.json({ error: "Rezervarea este deja anulată" }, { status: 400 });
  }

  if (passenger.trip.status !== "PROGRAMAT") {
    return NextResponse.json(
      { error: "Cursa a început deja, anularea nu mai este posibilă" },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.passenger.update({
      where: { id: passenger.id },
      data: { status: "ANULATA" },
    }),
    prisma.trip.update({
      where: { id: passenger.tripId },
      data: { availableSeats: { increment: passenger.seatCount } },
    }),
  ]);

  // Fire-and-forget email
  sendBookingNotification("cancellation", {
    bookingRef: passenger.bookingRef!,
    passengerName: passenger.name,
    passengerEmail: passenger.email,
    passengerPhone: passenger.phone,
    seatCount: passenger.seatCount,
    price: passenger.price,
    originCity: passenger.trip.originCity,
    originCountry: passenger.trip.originCountry,
    destinationCity: passenger.trip.destinationCity,
    destinationCountry: passenger.trip.destinationCountry,
    departureDate: passenger.trip.departureDate.toISOString(),
    departureTime: passenger.trip.departureTime,
    route: passenger.trip.route,
  }).catch(() => {});

  return NextResponse.json({ success: true, bookingRef: ref.toUpperCase() });
}
