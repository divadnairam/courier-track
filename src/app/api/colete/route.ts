import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parcelSchema } from "@/lib/validators";
import { generateAWB } from "@/lib/awb";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { awb: { contains: search } },
      { sender: { name: { contains: search } } },
      { receiver: { name: { contains: search } } },
      { deliveryCity: { contains: search } },
    ];
  }
  if (status) {
    where.status = status;
  }

  // Couriers see only their assigned parcels (via trips)
  if (session.user.role === "COURIER") {
    where.trip = { driverId: session.user.id };
  }

  // Clients see only their own parcels (as sender or receiver)
  if (session.user.role === "CLIENT") {
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
    });
    if (client) {
      where.OR = [
        ...(Array.isArray(where.OR) ? where.OR : []),
        { senderId: client.id },
        { receiverId: client.id },
      ];
    } else {
      // No client profile linked — show nothing
      return NextResponse.json({ parcels: [], total: 0, page, limit });
    }
  }

  const [parcels, total] = await Promise.all([
    prisma.parcel.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        sender: { select: { name: true } },
        receiver: { select: { name: true } },
      },
    }),
    prisma.parcel.count({ where }),
  ]);

  return NextResponse.json({ parcels, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "OPERATOR", "CLIENT"].includes(session.user.role)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const body = await req.json();

  // For CLIENT users, force senderId to their linked client profile
  if (session.user.role === "CLIENT") {
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
    });
    if (!client) {
      return NextResponse.json(
        { error: "Nu aveți un profil de client asociat. Contactați administratorul." },
        { status: 400 }
      );
    }
    body.senderId = client.id;
  }

  const result = parcelSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Date invalide", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const awb = await generateAWB();

  const parcel = await prisma.parcel.create({
    data: {
      ...result.data,
      awb,
      statusHistory: {
        create: {
          status: "PRELUAT",
          location: result.data.pickupCity,
          updatedBy: session.user.id,
        },
      },
    },
  });

  return NextResponse.json(parcel, { status: 201 });
}
