import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recurringTripSchema } from "@/lib/validators";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "OPERATOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { id } = await params;
  const template = await prisma.recurringTrip.findUnique({
    where: { id },
    include: {
      driver: { select: { name: true } },
      generatedTrips: {
        orderBy: { departureDate: "asc" },
        select: {
          id: true,
          departureDate: true,
          departureTime: true,
          status: true,
          availableSeats: true,
          totalSeats: true,
          _count: { select: { passengers: true } },
        },
      },
    },
  });

  if (!template) {
    return NextResponse.json({ error: "Șablon negăsit" }, { status: 404 });
  }

  return NextResponse.json(template);
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
  const result = recurringTripSchema.partial().safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Date invalide", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const template = await prisma.recurringTrip.update({
    where: { id },
    data: result.data,
  });

  return NextResponse.json(template);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "OPERATOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.recurringTrip.update({
    where: { id },
    data: { active: false },
  });

  return NextResponse.json({ success: true });
}
