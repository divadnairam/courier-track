import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { passengerSchema } from "@/lib/validators";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "OPERATOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const result = passengerSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Date invalide", details: result.error.flatten() },
      { status: 400 }
    );
  }

  // Check available seats
  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip) {
    return NextResponse.json({ error: "Cursă negăsită" }, { status: 404 });
  }
  if (trip.availableSeats < result.data.seatCount) {
    return NextResponse.json({ error: "Nu sunt suficiente locuri disponibile" }, { status: 400 });
  }

  const [passenger] = await prisma.$transaction([
    prisma.passenger.create({ data: { ...result.data, tripId: id } }),
    prisma.trip.update({
      where: { id },
      data: { availableSeats: { decrement: result.data.seatCount } },
    }),
  ]);

  return NextResponse.json(passenger, { status: 201 });
}
