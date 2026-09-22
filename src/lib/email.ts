import nodemailer from "nodemailer";
import { PARCEL_STATUS_LABELS } from "@/lib/constants";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
});

const FROM_ADDRESS = process.env.SMTP_FROM || "noreply@couriertrack.ro";

interface ParcelEmailData {
  awb: string;
  status: string;
  senderName: string;
  senderEmail?: string | null;
  receiverName: string;
  receiverEmail?: string | null;
  pickupCity: string;
  deliveryCity: string;
  location?: string | null;
  notes?: string | null;
}

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    PRELUAT: "a fost preluat de curier și urmează să fie expediat",
    IN_TRANZIT: "este în tranzit către destinație",
    IN_LIVRARE: "a ajuns în orașul destinație și este în curs de livrare",
    LIVRAT: "a fost livrat cu succes la destinație",
    RETURNAT: "a fost returnat către expeditor",
  };
  return messages[status] || "a fost actualizat";
}

function buildEmailHtml(data: ParcelEmailData, recipientType: "sender" | "receiver"): string {
  const statusLabel = PARCEL_STATUS_LABELS[data.status as keyof typeof PARCEL_STATUS_LABELS] || data.status;
  const statusMessage = getStatusMessage(data.status);
  const recipientName = recipientType === "sender" ? data.senderName : data.receiverName;

  const statusColor: Record<string, string> = {
    PRELUAT: "#2563eb",
    IN_TRANZIT: "#d97706",
    IN_LIVRARE: "#ea580c",
    LIVRAT: "#16a34a",
    RETURNAT: "#dc2626",
  };

  const color = statusColor[data.status] || "#6b7280";

  return `
<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: #1e40af; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">📦 CourierTrack</h1>
    <p style="margin: 5px 0 0; opacity: 0.9;">Notificare status colet</p>
  </div>

  <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p>Bună ziua, <strong>${recipientName}</strong>,</p>

    <p>Coletul cu AWB <strong>${data.awb}</strong> ${statusMessage}.</p>

    <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">AWB:</td>
          <td style="padding: 8px 0; font-weight: bold;">${data.awb}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Status:</td>
          <td style="padding: 8px 0;">
            <span style="background: ${color}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 14px;">
              ${statusLabel}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Rută:</td>
          <td style="padding: 8px 0;">${data.pickupCity} → ${data.deliveryCity}</td>
        </tr>
        ${data.location ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Locație curentă:</td>
          <td style="padding: 8px 0;">${data.location}</td>
        </tr>` : ""}
        ${data.notes ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Observații:</td>
          <td style="padding: 8px 0;">${data.notes}</td>
        </tr>` : ""}
      </table>
    </div>

    <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">
      Puteți urmări coletul oricând accesând pagina de tracking cu AWB-ul <strong>${data.awb}</strong>.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
      Acest email a fost trimis automat de CourierTrack. Vă rugăm să nu răspundeți la acest mesaj.
    </p>
  </div>
</body>
</html>`;
}

export async function sendStatusNotification(data: ParcelEmailData): Promise<void> {
  const emails: { to: string; name: string; type: "sender" | "receiver" }[] = [];

  if (data.senderEmail) {
    emails.push({ to: data.senderEmail, name: data.senderName, type: "sender" });
  }
  if (data.receiverEmail) {
    emails.push({ to: data.receiverEmail, name: data.receiverName, type: "receiver" });
  }

  const statusLabel = PARCEL_STATUS_LABELS[data.status as keyof typeof PARCEL_STATUS_LABELS] || data.status;

  for (const recipient of emails) {
    try {
      await transporter.sendMail({
        from: `"CourierTrack" <${FROM_ADDRESS}>`,
        to: recipient.to,
        subject: `Colet ${data.awb} — ${statusLabel}`,
        encoding: "utf-8",
        html: buildEmailHtml(data, recipient.type),
      });
      console.log(`[Email] Notificare trimisă către ${recipient.to} pentru AWB ${data.awb} (${data.status})`);
    } catch (error) {
      console.error(`[Email] Eroare trimitere către ${recipient.to}:`, error);
    }
  }
}
