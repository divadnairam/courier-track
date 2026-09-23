import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - courier sends GPS position
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "OPERATOR", "COURIER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const body = await req.json();
  const { tripId, latitude, longitude, speed, heading } = body;

  if (!tripId || latitude == null || longitude == null) {
    return NextResponse.json({ error: "Date incomplete" }, { status: 400 });
  }

  // Verify trip exists and belongs to this courier
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) {
    return NextResponse.json({ error: "Cursa nu a fost găsită" }, { status: 404 });
  }

  // Upsert courier location
  await prisma.courierLocation.upsert({
    where: { tripId },
    create: {
      tripId,
      latitude: Number(latitude),
      longitude: Number(longitude),
      speed: speed ? Number(speed) : null,
      heading: heading ? Number(heading) : null,
    },
    update: {
      latitude: Number(latitude),
      longitude: Number(longitude),
      speed: speed ? Number(speed) : null,
      heading: heading ? Number(heading) : null,
    },
  });

  return NextResponse.json({ success: true });
}
