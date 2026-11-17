import { NextRequest, NextResponse, after } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validators";
import { randomBytes } from "crypto";
import { sendEmailVerification } from "@/lib/email";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "OPERATOR", "CLIENT"].includes(session.user.role)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
      { email: { contains: search } },
      { city: { contains: search } },
    ];
  }
  if (type) {
    where.type = type;
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.client.count({ where }),
  ]);

  return NextResponse.json({ clients, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "OPERATOR", "CLIENT"].includes(session.user.role)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const body = await req.json();
  const result = clientSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Date invalide", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const data = { ...result.data };

  // Generate verification token if email is provided
  let verificationToken: string | null = null;
  if (data.email) {
    verificationToken = randomBytes(32).toString("hex");
    (data as Record<string, unknown>).emailVerificationToken = verificationToken;
    (data as Record<string, unknown>).emailVerified = false;
  }

  const client = await prisma.client.create({ data });

  // Send verification email after the response (kept alive on Vercel)
  if (data.email && verificationToken) {
    const { email, name } = data;
    const token = verificationToken;
    after(() =>
      sendEmailVerification(email, token, name).catch((err) =>
        console.error("[Email] Eroare trimitere verificare:", err)
      )
    );
  }

  return NextResponse.json(client, { status: 201 });
}
