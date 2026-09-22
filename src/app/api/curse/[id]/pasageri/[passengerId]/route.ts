import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; passengerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "OPERATOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { id, passengerId } = await params;

  const passenger = await prisma.passenger.findUnique({ where: { id: passengerId } });
  if (!passenger || passenger.tripId !== id) {
    return NextResponse.json({ error: "Pasager negăsit" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.passenger.delete({ where: { id: passengerId } }),
    prisma.trip.update({
      where: { id },
      data: { availableSeats: { increment: passenger.seatCount } },
    }),
  ]);

  return NextResponse.json({ success: true });
}
