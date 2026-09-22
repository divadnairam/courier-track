import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parcelStatusSchema } from "@/lib/validators";
import { sendStatusNotification } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "OPERATOR", "COURIER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const result = parcelStatusSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Date invalide", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const parcel = await prisma.parcel.update({
    where: { id },
    data: {
      status: result.data.status,
      statusHistory: {
        create: {
          status: result.data.status,
          location: result.data.location,
          notes: result.data.notes,
          updatedBy: session.user.id,
        },
      },
    },
    include: {
      statusHistory: { orderBy: { createdAt: "asc" } },
      sender: { select: { name: true, email: true } },
      receiver: { select: { name: true, email: true } },
    },
  });

  // Trimite notificare email (async, fără a bloca răspunsul)
  sendStatusNotification({
    awb: parcel.awb,
    status: result.data.status,
    senderName: parcel.sender.name,
    senderEmail: parcel.sender.email,
    receiverName: parcel.receiver.name,
    receiverEmail: parcel.receiver.email,
    pickupCity: parcel.pickupCity,
    deliveryCity: parcel.deliveryCity,
    location: result.data.location,
    notes: result.data.notes,
  }).catch(() => {});

  return NextResponse.json(parcel);
}
