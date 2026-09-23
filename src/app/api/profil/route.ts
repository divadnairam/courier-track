import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const profileUpdateSchema = z.object({
  name: z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere"),
  phone: z.string().min(1, "Telefonul este obligatoriu"),
  email: z.string().email("Email invalid").optional().or(z.literal("")),
  address: z.string().min(1, "Adresa este obligatorie"),
  city: z.string().min(1, "Orașul este obligatoriu"),
  county: z.string().min(1, "Județul/Provincia este obligatoriu"),
  country: z.string().min(1, "Țara este obligatorie").default("RO"),
  companyName: z.string().optional(),
  cui: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
  });

  if (!client) {
    return NextResponse.json({ error: "Profil negăsit" }, { status: 404 });
  }

  return NextResponse.json(client);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
  });

  if (!client) {
    return NextResponse.json({ error: "Profil negăsit" }, { status: 404 });
  }

  const body = await req.json();
  const result = profileUpdateSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Date invalide", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const updated = await prisma.client.update({
    where: { id: client.id },
    data: result.data,
  });

  // Also update user name to keep in sync
  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: result.data.name, phone: result.data.phone },
  });

  return NextResponse.json(updated);
}
