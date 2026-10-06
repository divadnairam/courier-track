import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      id: true,
      status: true,
      originCity: true,
      originCountry: true,
      destinationCity: true,
      destinationCountry: true,
      route: true,
      departureDate: true,
      departureTime: true,
      estimatedArrival: true,
      totalSeats: true,
      availableSeats: true,
      pricePerSeat: true,
      vehicleInfo: true,
      stops: { orderBy: { order: "asc" } },
    },
  });

  if (!trip) {
    return NextResponse.json({ error: "Cursa nu a fost găsită" }, { status: 404 });
  }

  if (trip.status !== "PROGRAMAT") {
    return NextResponse.json({ error: "Cursa nu mai acceptă rezervări" }, { status: 400 });
  }

  return NextResponse.json(trip);
}
