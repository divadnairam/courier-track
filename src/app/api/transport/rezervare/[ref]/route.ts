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

  // Mask PII for privacy — booking ref acts as access token but we still minimize exposure
  const maskedPhone = passenger.phone
    ? passenger.phone.slice(0, -4).replace(/\d/g, "*") + passenger.phone.slice(-4)
    : null;
  const maskedEmail = passenger.email
    ? passenger.email.replace(/^(.{2})(.*)(@.*)$/, "$1***$3")
    : null;

  return NextResponse.json({
    bookingRef: passenger.bookingRef,
    status: passenger.status,
    name: passenger.name,
    phone: maskedPhone,
    email: maskedEmail,
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
