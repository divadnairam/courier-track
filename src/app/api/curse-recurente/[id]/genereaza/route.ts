import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNextDaysOfWeek } from "@/lib/utils";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "OPERATOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { id } = await params;
  const template = await prisma.recurringTrip.findUnique({ where: { id } }) as (Awaited<ReturnType<typeof prisma.recurringTrip.findUnique>> & { stops?: { city: string; country: string; order: number; price: number }[] | null });

  if (!template || !template.active) {
    return NextResponse.json(
      { error: "Șablon negăsit sau inactiv" },
      { status: 404 }
    );
  }

  const dates = getNextDaysOfWeek(template.dayOfWeek, template.weeksInAdvance);

  // Check which trips already exist for this template
  const existingTrips = await prisma.trip.findMany({
    where: {
      recurringTripId: template.id,
      departureDate: { in: dates },
    },
    select: { departureDate: true },
  });

  const existingDateStrings = new Set(
    existingTrips.map((t) => t.departureDate.toISOString().split("T")[0])
  );

  const newDates = dates.filter(
    (d) => !existingDateStrings.has(d.toISOString().split("T")[0])
  );

  if (newDates.length === 0) {
    return NextResponse.json({
      message: "Toate cursele pentru perioadă sunt deja generate",
      created: 0,
      trips: [],
    });
  }

  const templateStops = (template.stops as { city: string; country: string; order: number; price: number }[] | null) || [];

  const createdTrips = await prisma.$transaction(
    newDates.map((date) => {
      const estimatedArrival = template.estimatedArrivalDays
        ? new Date(date.getTime() + template.estimatedArrivalDays * 86400000)
        : null;

      return prisma.trip.create({
        data: {
          originCity: template.originCity,
          originCountry: template.originCountry,
          destinationCity: template.destinationCity,
          destinationCountry: template.destinationCountry,
          route: template.route,
          departureDate: date,
          departureTime: template.departureTime,
          estimatedArrival: estimatedArrival,
          totalSeats: template.totalSeats,
          availableSeats: template.totalSeats,
          pricePerSeat: template.pricePerSeat,
          driverId: template.driverId,
          vehicleInfo: template.vehicleInfo,
          notes: template.notes,
          recurringTripId: template.id,
          status: "PROGRAMAT",
          stops: templateStops.length > 0 ? {
            create: templateStops.map((s) => ({
              city: s.city,
              country: s.country,
              order: s.order,
              price: s.price,
            })),
          } : undefined,
        },
      });
    })
  );

  return NextResponse.json({
    message: `${createdTrips.length} curse create cu succes`,
    created: createdTrips.length,
    trips: createdTrips,
  });
}
