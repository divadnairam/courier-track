import { NextResponse, after } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendEmailVerification } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Toate câmpurile sunt obligatorii" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Parola trebuie să aibă cel puțin 6 caractere" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Există deja un cont cu această adresă de email" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "CLIENT",
      },
    });

    // Create a linked Client profile with email verification
    const verificationToken = randomBytes(32).toString("hex");

    await prisma.client.create({
      data: {
        name,
        email,
        emailVerified: false,
        emailVerificationToken: verificationToken,
        phone: "",
        address: "",
        city: "",
        county: "",
        country: "RO",
        userId: user.id,
      },
    });

    // Send verification email after the response (kept alive on Vercel)
    after(() =>
      sendEmailVerification(email, verificationToken, name).catch((err) =>
        console.error("[Email] Eroare trimitere verificare:", err)
      )
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Eroare la crearea contului" },
      { status: 500 }
    );
  }
}
