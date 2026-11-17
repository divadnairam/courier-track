import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/verificare-email?status=invalid", req.url));
  }

  const client = await prisma.client.findFirst({
    where: { emailVerificationToken: token },
  });

  if (!client) {
    return NextResponse.redirect(new URL("/verificare-email?status=invalid", req.url));
  }

  if (client.emailVerified) {
    return NextResponse.redirect(new URL("/verificare-email?status=already", req.url));
  }

  await prisma.client.update({
    where: { id: client.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
    },
  });

  return NextResponse.redirect(new URL("/verificare-email?status=success", req.url));
}
