import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendEmailVerification } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "OPERATOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { id } = await params;

  const client = await prisma.client.findUnique({ where: { id } });

  if (!client) {
    return NextResponse.json({ error: "Clientul nu a fost găsit" }, { status: 404 });
  }

  if (!client.email) {
    return NextResponse.json({ error: "Clientul nu are adresă de email" }, { status: 400 });
  }

  if (client.emailVerified) {
    return NextResponse.json({ error: "Email-ul este deja verificat" }, { status: 400 });
  }

  const token = randomBytes(32).toString("hex");

  await prisma.client.update({
    where: { id },
    data: { emailVerificationToken: token },
  });

  try {
    await sendEmailVerification(client.email, token, client.name);
  } catch {
    return NextResponse.json(
      { error: "Eroare la trimiterea emailului. Verificați configurarea SMTP." },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Email de verificare retrimis cu succes" });
}
