import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tripSchema } from "@/lib/validators";
import { toUTCMidnight } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: Record<string, unknown> = {};
  if (status === "active") {
    where.status = { in: ["PROGRAMAT", "IN_DESFASURARE"] };
  } else if (status) {
    where.status = status;
  }
  if (session.user.role === "COURIER") {
    where.driverId = session.user.id;
  }

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      orderBy: { departureDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        driver: { select: { name: true } },
        _count: { select: { parcels: true, passengers: true } },
      },
    }),
    prisma.trip.count({ where }),
  ]);

  return NextResponse.json({ trips, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "OPERATOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const body = await req.json();
  const result = tripSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Date invalide", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { departureDate, estimatedArrival, ...rest } = result.data;
  // Auto-set availableSeats to totalSeats when creating a new trip
  if (!rest.availableSeats && rest.totalSeats) {
    rest.availableSeats = rest.totalSeats;
  }
  const stops = body.stops as { city: string; country: string; order: number; price: number }[] | undefined;

  const trip = await prisma.trip.create({
    data: {
      ...rest,
      departureDate: toUTCMidnight(departureDate),
      estimatedArrival: estimatedArrival ? toUTCMidnight(estimatedArrival) : null,
      ...(stops && stops.length > 0
        ? {
            stops: {
              create: stops.map((s) => ({
                city: s.city,
                country: s.country || "RO",
                order: s.order,
                price: Number(s.price) || 0,
              })),
            },
          }
        : {}),
    },
    include: { stops: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(trip, { status: 201 });
}
