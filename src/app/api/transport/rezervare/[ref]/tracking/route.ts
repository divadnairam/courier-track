import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;

  const passenger = await prisma.passenger.findUnique({
    where: { bookingRef: ref.toUpperCase() },
    include: {
      trip: {
        include: {
          courierLocation: true,
        },
      },
    },
  });

  if (!passenger) {
    return NextResponse.json({ error: "Rezervarea nu a fost găsită" }, { status: 404 });
  }

  if (passenger.status === "ANULATA") {
    return NextResponse.json({ error: "Rezervarea a fost anulată" }, { status: 400 });
  }

  const trip = passenger.trip;
  const location = trip.courierLocation;

  // Consider location live if updated in the last 5 minutes and trip is in progress
  const isLive =
    trip.status === "IN_DESFASURARE" &&
    location != null &&
    new Date().getTime() - new Date(location.updatedAt).getTime() < 5 * 60 * 1000;

  return NextResponse.json({
    trip: {
      status: trip.status,
      originCity: trip.originCity,
      originCountry: trip.originCountry,
      destinationCity: trip.destinationCity,
      destinationCountry: trip.destinationCountry,
      departureDate: trip.departureDate,
      departureTime: trip.departureTime,
      estimatedArrival: trip.estimatedArrival,
      route: trip.route,
    },
    location: isLive
      ? {
          latitude: location!.latitude,
          longitude: location!.longitude,
          speed: location!.speed,
          heading: location!.heading,
          updatedAt: location!.updatedAt,
        }
      : null,
    live: isLive,
  });
}
