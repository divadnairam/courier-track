import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tripSchema } from "@/lib/validators";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { id } = await params;
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      driver: { select: { id: true, name: true, phone: true } },
      parcels: {
        include: {
          sender: { select: { name: true } },
          receiver: { select: { name: true } },
        },
      },
      passengers: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!trip) {
    return NextResponse.json({ error: "Cursă negăsită" }, { status: 404 });
  }

  return NextResponse.json(trip);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "OPERATOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  // Handle status-only update
  if (body.status && Object.keys(body).length === 1) {
    const trip = await prisma.trip.update({
      where: { id },
      data: { status: body.status },
    });
    return NextResponse.json(trip);
  }

  const result = tripSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Date invalide", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { departureDate, estimatedArrival, ...rest } = result.data;
  const trip = await prisma.trip.update({
    where: { id },
    data: {
      ...rest,
      departureDate: new Date(departureDate),
      estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : null,
    },
  });

  return NextResponse.json(trip);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.trip.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
