import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - get live courier position for a parcel
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ awb: string }> }
) {
  const { awb } = await params;
  const awbUpper = awb.trim().toUpperCase();

  const parcel = await prisma.parcel.findUnique({
    where: { awb: awbUpper },
    select: {
      tripId: true,
      status: true,
      trip: {
        select: {
          id: true,
          status: true,
          courierLocation: {
            select: {
              latitude: true,
              longitude: true,
              speed: true,
              heading: true,
              updatedAt: true,
            },
          },
        },
      },
    },
  });

  if (!parcel || !parcel.trip?.courierLocation) {
    return NextResponse.json({ live: false });
  }

  // Only show live tracking for active trips and non-delivered parcels
  const isActive = ["IN_TRANZIT", "IN_LIVRARE"].includes(parcel.status) &&
    ["PROGRAMAT", "IN_DESFASURARE"].includes(parcel.trip.status);

  // Check if location is recent (last 5 minutes)
  const locationAge = Date.now() - new Date(parcel.trip.courierLocation.updatedAt).getTime();
  const isRecent = locationAge < 5 * 60 * 1000;

  if (!isActive || !isRecent) {
    return NextResponse.json({ live: false });
  }

  return NextResponse.json({
    live: true,
    latitude: parcel.trip.courierLocation.latitude,
    longitude: parcel.trip.courierLocation.longitude,
    speed: parcel.trip.courierLocation.speed,
    heading: parcel.trip.courierLocation.heading,
    updatedAt: parcel.trip.courierLocation.updatedAt,
  });
}
