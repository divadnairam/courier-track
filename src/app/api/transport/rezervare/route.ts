import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicBookingSchema } from "@/lib/validators";
import { generateBookingRef } from "@/lib/utils";
import { sendBookingNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = publicBookingSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Date invalide", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { tripId, name, phone, email, seatCount, parcelCount, parcelWeight, tripStopId } = result.data;

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { stops: true },
  });

  if (!trip) {
    return NextResponse.json({ error: "Cursa nu a fost găsită" }, { status: 404 });
  }

  if (trip.status !== "PROGRAMAT") {
    return NextResponse.json({ error: "Cursa nu mai acceptă rezervări" }, { status: 400 });
  }

  // Check if departure time has already passed
  const now = new Date();
  const tripDate = new Date(trip.departureDate);
  tripDate.setHours(0, 0, 0, 0);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const currentTime = now.toTimeString().slice(0, 5);

  if (tripDate < todayStart || (tripDate.getTime() === todayStart.getTime() && trip.departureTime <= currentTime)) {
    return NextResponse.json({ error: "Cursa a plecat deja, nu se mai pot face rezervări" }, { status: 400 });
  }

  if (trip.availableSeats < seatCount) {
    return NextResponse.json(
      { error: `Doar ${trip.availableSeats} locuri disponibile` },
      { status: 400 }
    );
  }

  // Generate unique booking reference
  let bookingRef = generateBookingRef();
  let retries = 0;
  while (retries < 3) {
    const existing = await prisma.passenger.findUnique({ where: { bookingRef } });
    if (!existing) break;
    bookingRef = generateBookingRef();
    retries++;
  }

  // Determine price and destination from stop or final destination
  let pricePerSeat = trip.pricePerSeat;
  let destinationCity = trip.destinationCity;
  let destinationCountry = trip.destinationCountry;
  let resolvedStopId: string | null = null;

  if (tripStopId && tripStopId !== "final" && trip.stops.length > 0) {
    const stop = trip.stops.find((s) => s.id === tripStopId);
    if (!stop) {
      return NextResponse.json({ error: "Oprirea selectată nu există" }, { status: 400 });
    }
    pricePerSeat = stop.price;
    destinationCity = stop.city;
    destinationCountry = stop.country;
    resolvedStopId = stop.id;
  }

  const totalPrice = pricePerSeat * seatCount;

  const passenger = await prisma.$transaction(async (tx) => {
    const created = await tx.passenger.create({
      data: {
        tripId,
        name,
        phone,
        email: email || null,
        seatCount,
        price: totalPrice,
        parcelCount,
        parcelWeight,
        destinationCity,
        destinationCountry,
        tripStopId: resolvedStopId,
        bookingRef,
        status: "CONFIRMATA",
      },
    });

    await tx.trip.update({
      where: { id: tripId },
      data: { availableSeats: { decrement: seatCount } },
    });

    return created;
  });

  // Fire-and-forget confirmation email
  sendBookingNotification("confirmation", {
    bookingRef: passenger.bookingRef!,
    passengerName: passenger.name,
    passengerEmail: passenger.email,
    passengerPhone: passenger.phone,
    seatCount: passenger.seatCount,
    price: passenger.price,
    originCity: trip.originCity,
    originCountry: trip.originCountry,
    destinationCity: passenger.destinationCity || trip.destinationCity,
    destinationCountry: passenger.destinationCountry || trip.destinationCountry,
    departureDate: trip.departureDate.toISOString(),
    departureTime: trip.departureTime,
    route: trip.route,
  }).catch(() => {});

  return NextResponse.json({
    bookingRef: passenger.bookingRef,
    name: passenger.name,
    phone: passenger.phone,
    email: passenger.email,
    seatCount: passenger.seatCount,
    price: passenger.price,
    destinationCity: passenger.destinationCity,
    tripId: trip.id,
    originCity: trip.originCity,
    departureDate: trip.departureDate,
    departureTime: trip.departureTime,
    route: trip.route,
  }, { status: 201 });
}
