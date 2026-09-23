import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ awb: string }> }
) {
  const { awb } = await params;
  const awbUpper = awb.trim().toUpperCase();

  const parcel = await prisma.parcel.findUnique({
    where: { awb: awbUpper },
    select: {
      awb: true,
      status: true,
      pickupCity: true,
      deliveryCity: true,
      createdAt: true,
      sender: { select: { name: true, city: true } },
      receiver: { select: { name: true, city: true } },
      statusHistory: {
        orderBy: { createdAt: "asc" },
        select: {
          status: true,
          location: true,
          latitude: true,
          longitude: true,
          notes: true,
          createdAt: true,
        },
      },
    },
  });

  if (!parcel) {
    return NextResponse.json({ error: "Colet negăsit" }, { status: 404 });
  }

  return NextResponse.json(parcel);
}
