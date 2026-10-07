import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const userId = session.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return NextResponse.json({ error: "Utilizator negăsit" }, { status: 404 });
  }

  // Admins cannot self-delete (safety measure)
  if (user.role === "ADMIN") {
    return NextResponse.json(
      { error: "Contul de administrator nu poate fi șters prin auto-serviciu. Contactați un alt administrator." },
      { status: 403 }
    );
  }

  // Find linked client profile
  const client = await prisma.client.findUnique({ where: { userId } });

  await prisma.$transaction(async (tx) => {
    // Anonymize passenger bookings linked to this user's phone/email
    const anonymizeFilters: Record<string, unknown>[] = [];
    if (user.phone) anonymizeFilters.push({ phone: user.phone });
    if (user.email) anonymizeFilters.push({ email: user.email });
    if (client?.phone) anonymizeFilters.push({ phone: client.phone });
    if (client?.email) anonymizeFilters.push({ email: client.email });

    if (anonymizeFilters.length > 0) {
      await tx.passenger.updateMany({
        where: { OR: anonymizeFilters },
        data: {
          name: "Utilizator Șters",
          phone: "0000000000",
          email: null,
          notes: null,
        },
      });
    }

    // Anonymize parcels (keep for business records but remove PII from client)
    if (client) {
      // Anonymize the client profile instead of deleting to preserve parcel history integrity
      await tx.client.update({
        where: { id: client.id },
        data: {
          name: "Client Șters",
          phone: "0000000000",
          email: null,
          companyName: null,
          cui: null,
          address: "Șters conform GDPR",
          notes: null,
          userId: null, // Unlink from user
        },
      });
    }

    // Delete the user account
    await tx.user.delete({ where: { id: userId } });
  });

  return NextResponse.json({
    message: "Contul a fost șters cu succes. Datele personale au fost anonimizate.",
  });
}
