import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Extract readable error messages from API validation response */
export function extractApiErrors(data: { error?: string; details?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] } }): string {
  const messages: string[] = [];
  if (data.details?.fieldErrors) {
    for (const [, errs] of Object.entries(data.details.fieldErrors)) {
      messages.push(...errs);
    }
  }
  if (data.details?.formErrors?.length) {
    messages.push(...data.details.formErrors);
  }
  return messages.length > 0 ? messages.join(". ") : data.error || "Eroare necunoscută";
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("ro-RO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("ro-RO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrency(amount: number, currency: "EUR" | "RON" = "EUR"): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency,
  }).format(amount);
}

export function generateBookingRef(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "";
  for (let i = 0; i < 4; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  return `BK-${date}-${rand}`;
}

export function toUTCMidnight(date: Date | string): Date {
  const d = new Date(date);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

export function getNextDaysOfWeek(dayOfWeek: number, weeksCount: number): Date[] {
  const dates: Date[] = [];
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  // Find next occurrence of dayOfWeek
  const daysUntil = (dayOfWeek - today.getUTCDay() + 7) % 7;
  const next = new Date(today);
  next.setUTCDate(today.getUTCDate() + (daysUntil === 0 ? 7 : daysUntil));

  for (let i = 0; i < weeksCount; i++) {
    const d = new Date(next);
    d.setUTCDate(next.getUTCDate() + i * 7);
    dates.push(d);
  }
  return dates;
}

export function getOccupancyLevel(totalSeats: number, availableSeats: number) {
  if (totalSeats === 0) return { label: "Indisponibil", color: "text-gray-500" };
  const freePercent = (availableSeats / totalSeats) * 100;
  if (freePercent > 60) return { label: "Aproape gol", color: "text-green-600" };
  if (freePercent > 30) return { label: "Jumătate plin", color: "text-yellow-600" };
  return { label: "Aproape plin", color: "text-red-600" };
}
