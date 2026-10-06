import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function removeDiacritics(str: string): string {
  const map: Record<string, string> = {
    "ă": "a", "â": "a", "î": "i", "ș": "s", "ț": "t",
    "Ă": "A", "Â": "A", "Î": "I", "Ș": "S", "Ț": "T",
    "ş": "s", "ţ": "t", "Ş": "S", "Ţ": "T",
  };
  return str.replace(/[ăâîșțĂÂÎȘȚşţŞŢ]/g, (ch) => map[ch] || ch);
}

// Known Romanian city name diacritics mappings
const CITY_DIACRITICS: Record<string, string> = {
  galati: "Galați",
  bucuresti: "București",
  brasov: "Brașov",
  timisoara: "Timișoara",
  iasi: "Iași",
  constanta: "Constanța",
  craiova: "Craiova",
  ploiesti: "Ploiești",
  targu: "Târgu",
  bacau: "Bacău",
  focsani: "Focșani",
  targoviste: "Târgoviște",
};

function cityFilter(field: string, value: string) {
  const plain = removeDiacritics(value).toLowerCase();
  const variants = new Set([value, removeDiacritics(value)]);
  // Check if input matches a known city and add the diacritics version
  for (const [key, correct] of Object.entries(CITY_DIACRITICS)) {
    if (plain === key || plain.includes(key)) {
      variants.add(value.toLowerCase() === key ? correct : correct);
    }
  }
  return {
    OR: [...variants].map((v) => ({ [field]: { contains: v, mode: "insensitive" as const } })),
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const date = searchParams.get("date") || "";
  const passengers = parseInt(searchParams.get("passengers") || "1") || 1;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10") || 10));

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const andConditions: any[] = [
    { status: "PROGRAMAT" },
    { availableSeats: { gte: passengers } },
    // Exclude past trips: future dates OR today but only if departure time hasn't passed
    {
      OR: [
        { departureDate: { gte: tomorrowStart } },
        {
          AND: [
            { departureDate: { gte: todayStart, lt: tomorrowStart } },
            { departureTime: { gt: currentTime } },
          ],
        },
      ],
    },
  ];

  if (from) {
    andConditions.push(cityFilter("originCity", from));
  }
  if (to) {
    // Search in both final destination and intermediate stops
    const destFilter = cityFilter("destinationCity", to);
    const plain = removeDiacritics(to).toLowerCase();
    const stopVariants = new Set([to, removeDiacritics(to)]);
    for (const [key, correct] of Object.entries(CITY_DIACRITICS)) {
      if (plain === key || plain.includes(key)) stopVariants.add(correct);
    }
    andConditions.push({
      OR: [
        destFilter,
        {
          stops: {
            some: {
              OR: [...stopVariants].map((v) => ({ city: { contains: v, mode: "insensitive" as const } })),
            },
          },
        },
      ],
    });
  }

  if (date) {
    // Dates are stored normalized as UTC midnight (YYYY-MM-DDT00:00:00Z)
    const start = new Date(date + "T00:00:00.000Z");
    const end = new Date(date + "T00:00:00.000Z");
    end.setUTCDate(end.getUTCDate() + 1);
    andConditions.push({ departureDate: { gte: start, lt: end } });
  }

  const where = { AND: andConditions };

  const [total, trips] = await prisma.$transaction([
    prisma.trip.count({ where }),
    prisma.trip.findMany({
      where,
      orderBy: [{ departureDate: "asc" }, { departureTime: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        originCity: true,
        originCountry: true,
        destinationCity: true,
        destinationCountry: true,
        route: true,
        departureDate: true,
        departureTime: true,
        estimatedArrival: true,
        totalSeats: true,
        availableSeats: true,
        pricePerSeat: true,
        vehicleInfo: true,
        stops: { orderBy: { order: "asc" as const }, select: { price: true } },
      },
    }),
  ]);

  return NextResponse.json({
    trips,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
