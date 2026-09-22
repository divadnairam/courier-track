import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { id } = await params;
  const parcel = await prisma.parcel.findUnique({
    where: { id },
    include: {
      sender: { select: { name: true, phone: true, city: true, county: true, country: true } },
      receiver: { select: { name: true, phone: true, city: true, county: true, country: true, address: true } },
    },
  });

  if (!parcel) {
    return NextResponse.json({ error: "Colet negăsit" }, { status: 404 });
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
  const scanUrl = `${baseUrl}/scan?awb=${parcel.awb}`;
  const trackingUrl = `${baseUrl}/tracking?awb=${parcel.awb}`;

  const qrDataUrl = await QRCode.toDataURL(scanUrl, {
    width: 200,
    margin: 1,
    errorCorrectionLevel: "M",
  });

  return NextResponse.json({
    parcel,
    qrDataUrl,
    trackingUrl,
    scanUrl,
  });
}
