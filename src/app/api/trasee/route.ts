import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "OPERATOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const routes = await prisma.routeTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ routes });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "OPERATOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const body = await req.json();
  const { name, stops } = body;

  if (!name || !Array.isArray(stops) || stops.length < 2) {
    return NextResponse.json(
      { error: "Numele și minimum 2 opriri sunt obligatorii" },
      { status: 400 }
    );
  }

  // Validate stops format
  for (const stop of stops) {
    if (!stop.city || !stop.country) {
      return NextResponse.json(
        { error: "Fiecare oprire trebuie să aibă oraș și țară" },
        { status: 400 }
      );
    }
  }

  const route = await prisma.routeTemplate.create({
    data: { name, stops },
  });

  return NextResponse.json(route, { status: 201 });
}
