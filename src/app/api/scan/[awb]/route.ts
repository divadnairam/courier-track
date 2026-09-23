import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PARCEL_STATUS_FLOW } from "@/lib/constants";
import { sendStatusNotification } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ awb: string }> }
) {
  const { awb } = await params;
  const awbUpper = awb.trim().toUpperCase();
  const body = await req.json().catch(() => ({}));
  const location = body.location || "";

  const parcel = await prisma.parcel.findUnique({
    where: { awb: awbUpper },
    include: {
      sender: { select: { name: true, email: true } },
      receiver: { select: { name: true, email: true } },
    },
  });

  if (!parcel) {
    return NextResponse.json({ error: "Colet negăsit" }, { status: 404 });
  }

  // Determine next status in the flow
  const currentIndex = PARCEL_STATUS_FLOW.indexOf(parcel.status as typeof PARCEL_STATUS_FLOW[number]);

  if (currentIndex === -1 || currentIndex >= PARCEL_STATUS_FLOW.length - 1) {
    return NextResponse.json({
      message: "Coletul a fost deja livrat sau returnat. Nu mai poate fi actualizat.",
      awb: parcel.awb,
      status: parcel.status,
      alreadyCompleted: true,
    });
  }

  const nextStatus = PARCEL_STATUS_FLOW[currentIndex + 1];

  const updated = await prisma.parcel.update({
    where: { awb },
    data: {
      status: nextStatus,
      statusHistory: {
        create: {
          status: nextStatus,
          location,
          notes: `Status actualizat automat prin scanare QR`,
        },
      },
    },
    include: {
      statusHistory: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  // Send email notification
  sendStatusNotification({
    awb: parcel.awb,
    status: nextStatus,
    senderName: parcel.sender.name,
    senderEmail: parcel.sender.email,
    receiverName: parcel.receiver.name,
    receiverEmail: parcel.receiver.email,
    pickupCity: parcel.pickupCity,
    deliveryCity: parcel.deliveryCity,
    location,
    notes: "Status actualizat automat prin scanare QR",
  }).catch(() => {});

  return NextResponse.json({
    message: `Status actualizat: ${nextStatus}`,
    awb: updated.awb,
    previousStatus: parcel.status,
    newStatus: nextStatus,
  });
}

// GET - return current status (for tracking page after QR scan)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ awb: string }> }
) {
  const { awb } = await params;

  const parcel = await prisma.parcel.findUnique({
    where: { awb },
    include: {
      sender: { select: { name: true } },
      receiver: { select: { name: true } },
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!parcel) {
    return NextResponse.json({ error: "Colet negăsit" }, { status: 404 });
  }

  return NextResponse.json(parcel);
}
