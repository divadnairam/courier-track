import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendShipmentNotification } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "OPERATOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { id } = await params;

  const parcel = await prisma.parcel.findUnique({
    where: { id },
    include: {
      sender: true,
      receiver: true,
    },
  });

  if (!parcel) {
    return NextResponse.json({ error: "Coletul nu a fost găsit" }, { status: 404 });
  }

  if (!parcel.receiver.email) {
    return NextResponse.json(
      { error: "Destinatarul nu are o adresă de email configurată" },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXTAUTH_URL || "https://aplicatie-pi.vercel.app";

  try {
    await sendShipmentNotification({
      to: parcel.receiver.email,
      awb: parcel.awb,
      senderName: parcel.sender.companyName || parcel.sender.name,
      receiverName: parcel.receiver.companyName || parcel.receiver.name,
      pickupCity: parcel.pickupCity,
      pickupCountry: parcel.pickupCountry,
      deliveryCity: parcel.deliveryCity,
      deliveryCountry: parcel.deliveryCountry,
      pickupAddress: parcel.pickupAddress,
      deliveryAddress: parcel.deliveryAddress,
      weight: parcel.weight,
      content: parcel.content,
      senderPhone: parcel.sender.phone,
      receiverPhone: parcel.receiver.phone,
      trackingUrl: `${baseUrl}/tracking?awb=${parcel.awb}`,
      notificationUrl: `${baseUrl}/notificare/${parcel.awb}`,
    });

    return NextResponse.json({ message: "Notificarea a fost trimisă cu succes" });
  } catch {
    return NextResponse.json(
      { error: "Eroare la trimiterea notificării. Verificați configurarea SMTP." },
      { status: 500 }
    );
  }
}
