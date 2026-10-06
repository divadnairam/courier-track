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
        select: {
          originCity: true,
          originCountry: true,
          destinationCity: true,
          destinationCountry: true,
          route: true,
          departureDate: true,
          departureTime: true,
          estimatedArrival: true,
          vehicleInfo: true,
          status: true,
        },
      },
    },
  });

  if (!passenger) {
    return NextResponse.json({ error: "Rezervarea nu a fost găsită" }, { status: 404 });
  }

  return NextResponse.json({
    bookingRef: passenger.bookingRef,
    status: passenger.status,
    name: passenger.name,
    phone: passenger.phone,
    email: passenger.email,
    seatCount: passenger.seatCount,
    price: passenger.price,
    parcelCount: passenger.parcelCount,
    parcelWeight: passenger.parcelWeight,
    destinationCity: passenger.destinationCity,
    destinationCountry: passenger.destinationCountry,
    createdAt: passenger.createdAt,
    trip: passenger.trip,
  });
}
