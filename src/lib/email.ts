import nodemailer from "nodemailer";
import { PARCEL_STATUS_LABELS, TRIP_STATUS_LABELS, COUNTRY_LABELS } from "@/lib/constants";

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

// --- Transport Booking Notifications ---

interface BookingEmailData {
  bookingRef: string;
  passengerName: string;
  passengerEmail?: string | null;
  passengerPhone: string;
  seatCount: number;
  price: number;
  originCity: string;
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  departureDate: string;
  departureTime: string;
  route?: string | null;
  tripStatus?: string;
}

type BookingNotificationType = "confirmation" | "cancellation" | "trip_update";

function buildBookingEmailHtml(type: BookingNotificationType, data: BookingEmailData): string {
  const originLabel = `${data.originCity}${data.originCountry !== "RO" ? `, ${COUNTRY_LABELS[data.originCountry] || data.originCountry}` : ""}`;
  const destLabel = `${data.destinationCity}${data.destinationCountry !== "RO" ? `, ${COUNTRY_LABELS[data.destinationCountry] || data.destinationCountry}` : ""}`;
  const depDate = new Date(data.departureDate).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" });

  const config: Record<BookingNotificationType, { color: string; title: string; message: string }> = {
    confirmation: {
      color: "#16a34a",
      title: "Rezervare Confirmată",
      message: `Rezervarea dumneavoastră <strong>${data.bookingRef}</strong> a fost confirmată cu succes.`,
    },
    cancellation: {
      color: "#dc2626",
      title: "Rezervare Anulată",
      message: `Rezervarea <strong>${data.bookingRef}</strong> a fost anulată.`,
    },
    trip_update: {
      color: "#d97706",
      title: "Actualizare Cursă",
      message: `Cursa pentru rezervarea <strong>${data.bookingRef}</strong> a fost actualizată. Noul status: <strong>${TRIP_STATUS_LABELS[data.tripStatus as keyof typeof TRIP_STATUS_LABELS] || data.tripStatus}</strong>.`,
    },
  };

  const { color, title, message } = config[type];

  return `
<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: #1e40af; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">CourierTrack</h1>
    <p style="margin: 5px 0 0; opacity: 0.9;">Transport Persoane</p>
  </div>

  <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="background: ${color}; color: white; padding: 8px 20px; border-radius: 20px; font-size: 16px; font-weight: bold;">
        ${title}
      </span>
    </div>

    <p>Bună ziua, <strong>${data.passengerName}</strong>,</p>
    <p>${message}</p>

    <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Referință:</td>
          <td style="padding: 8px 0; font-weight: bold; font-family: monospace; font-size: 16px;">${data.bookingRef}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Rută:</td>
          <td style="padding: 8px 0;">${originLabel} → ${destLabel}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Data plecare:</td>
          <td style="padding: 8px 0;">${depDate}, ora ${data.departureTime}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Locuri:</td>
          <td style="padding: 8px 0;">${data.seatCount}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Preț total:</td>
          <td style="padding: 8px 0; font-weight: bold;">${data.price > 0 ? `${data.price.toFixed(2)} EUR` : "La cerere"}</td>
        </tr>
        ${data.route ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Traseu:</td>
          <td style="padding: 8px 0;">${data.route}</td>
        </tr>` : ""}
      </table>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
      Acest email a fost trimis automat de CourierTrack. Vă rugăm să nu răspundeți la acest mesaj.
    </p>
  </div>
</body>
</html>`;
}

export async function sendBookingNotification(type: BookingNotificationType, data: BookingEmailData): Promise<void> {
  if (!data.passengerEmail) return;

  const subjects: Record<BookingNotificationType, string> = {
    confirmation: `Rezervare confirmată — ${data.bookingRef}`,
    cancellation: `Rezervare anulată — ${data.bookingRef}`,
    trip_update: `Actualizare cursă — ${data.bookingRef}`,
  };

  try {
    await transporter.sendMail({
      from: `"CourierTrack" <${FROM_ADDRESS}>`,
      to: data.passengerEmail,
      subject: subjects[type],
      encoding: "utf-8",
      html: buildBookingEmailHtml(type, data),
    });
    console.log(`[Email] Notificare ${type} trimisă către ${data.passengerEmail} pentru ${data.bookingRef}`);
  } catch (error) {
    console.error(`[Email] Eroare trimitere ${type} către ${data.passengerEmail}:`, error);
  }
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
