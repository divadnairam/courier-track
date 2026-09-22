import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "OPERATOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "summary";

  if (type === "summary") {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalParcels, deliveredParcels, deliveriesToday, activeTrips, monthlyRevenue, totalClients] =
      await Promise.all([
        prisma.parcel.count(),
        prisma.parcel.count({ where: { status: "LIVRAT" } }),
        prisma.parcel.count({ where: { status: "LIVRAT", updatedAt: { gte: startOfDay } } }),
        prisma.trip.count({ where: { status: { in: ["PROGRAMAT", "IN_DESFASURARE"] } } }),
        prisma.parcel.aggregate({ _sum: { price: true }, where: { createdAt: { gte: startOfMonth } } }),
        prisma.client.count(),
      ]);

    return NextResponse.json({
      totalParcels,
      deliveredParcels,
      deliveriesToday,
      activeTrips,
      monthlyRevenue: monthlyRevenue._sum.price || 0,
      totalClients,
    });
  }

  if (type === "deliveries") {
    // Last 30 days deliveries grouped by date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const parcels = await prisma.parcel.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, status: true },
    });

    const dailyData: Record<string, { total: number; delivered: number }> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().split("T")[0];
      dailyData[key] = { total: 0, delivered: 0 };
    }

    parcels.forEach((p) => {
      const key = p.createdAt.toISOString().split("T")[0];
      if (dailyData[key]) {
        dailyData[key].total++;
        if (p.status === "LIVRAT") dailyData[key].delivered++;
      }
    });

    const data = Object.entries(dailyData).map(([date, vals]) => ({
      date,
      total: vals.total,
      delivered: vals.delivered,
    }));

    return NextResponse.json(data);
  }

  if (type === "revenue") {
    // Last 12 months revenue
    const data: { month: string; revenue: number; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);

      const result = await prisma.parcel.aggregate({
        _sum: { price: true },
        _count: true,
        where: { createdAt: { gte: start, lt: end } },
      });

      data.push({
        month: start.toLocaleDateString("ro-RO", { month: "short", year: "numeric" }),
        revenue: result._sum.price || 0,
        count: result._count,
      });
    }

    return NextResponse.json(data);
  }

  if (type === "couriers") {
    const couriers = await prisma.user.findMany({
      where: { role: "COURIER" },
      select: {
        id: true,
        name: true,
        assignedTrips: {
          select: {
            _count: { select: { parcels: true } },
            status: true,
          },
        },
        statusUpdates: {
          where: { status: "LIVRAT" },
          select: { id: true },
        },
      },
    });

    const data = couriers.map((c) => ({
      name: c.name,
      totalTrips: c.assignedTrips.length,
      completedTrips: c.assignedTrips.filter((t) => t.status === "FINALIZAT").length,
      deliveries: c.statusUpdates.length,
    }));

    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "Tip raport invalid" }, { status: 400 });
}
