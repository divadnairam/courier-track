import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const userId = session.user.id;

  // Gather all user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      createdAt: true,
    },
  });

  const client = await prisma.client.findUnique({
    where: { userId },
    select: {
      id: true,
      type: true,
      name: true,
      companyName: true,
      cui: true,
      phone: true,
      email: true,
      address: true,
      city: true,
      county: true,
      country: true,
      createdAt: true,
    },
  });

  let parcels: unknown[] = [];
  if (client) {
    parcels = await prisma.parcel.findMany({
      where: { OR: [{ senderId: client.id }, { receiverId: client.id }] },
      select: {
        awb: true,
        status: true,
        pickupCity: true,
        pickupCountry: true,
        deliveryCity: true,
        deliveryCountry: true,
        weight: true,
        price: true,
        createdAt: true,
      },
    });
  }

  // Passenger bookings (match by phone or email)
  const passengerFilters: Record<string, unknown>[] = [];
  if (user?.phone) passengerFilters.push({ phone: user.phone });
  if (user?.email) passengerFilters.push({ email: user.email });
  if (client?.phone) passengerFilters.push({ phone: client.phone });
  if (client?.email && client.email) passengerFilters.push({ email: client.email });

  let passengers: unknown[] = [];
  if (passengerFilters.length > 0) {
    passengers = await prisma.passenger.findMany({
      where: { OR: passengerFilters },
      select: {
        name: true,
        phone: true,
        email: true,
        seatCount: true,
        parcelCount: true,
        parcelWeight: true,
        destinationCity: true,
        price: true,
        bookingRef: true,
        status: true,
        createdAt: true,
        trip: {
          select: {
            originCity: true,
            destinationCity: true,
            departureDate: true,
            departureTime: true,
          },
        },
      },
    });
  }

  const exportData = {
    exportDate: new Date().toISOString(),
    user,
    clientProfile: client,
    parcels,
    passengerBookings: passengers,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="couriertrack-date-personale-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
