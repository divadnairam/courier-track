import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "OPERATOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { id } = await params;
  const { parcelIds } = await req.json();

  if (!Array.isArray(parcelIds) || parcelIds.length === 0) {
    return NextResponse.json({ error: "Selectați cel puțin un colet" }, { status: 400 });
  }

  await prisma.parcel.updateMany({
    where: { id: { in: parcelIds } },
    data: { tripId: id },
  });

  return NextResponse.json({ success: true });
}
