import { z } from "zod";

// Accepts: +40712345678, 0040712345678, 0712345678, +31612345678, etc.
// Minimum 10 digits (local) or 11+ with international prefix
const phoneRegex = /^(\+|00)?[1-9]\d{8,14}$/;
const phoneValidator = z.string()
  .min(1, "Telefonul este obligatoriu")
  .transform((val) => val.replace(/[\s\-().]/g, "")) // strip spaces, dashes, parens
  .pipe(z.string().regex(phoneRegex, "Număr de telefon invalid. Folosiți formatul: +40712345678 sau 0712345678"));

// Requires: user@domain.tld — domain must have at least one dot and 2+ char TLD
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const emailValidator = z.string()
  .trim()
  .toLowerCase()
  .regex(emailRegex, "Adresă de email invalidă. Exemplu: nume@domeniu.ro");
const optionalEmailValidator = emailValidator.optional().or(z.literal(""));

export const loginSchema = z.object({
  email: emailValidator,
  password: z.string().min(1, "Parola este obligatorie"),
});

export const userSchema = z.object({
  name: z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere"),
  email: emailValidator,
  password: z.string().min(6, "Parola trebuie să aibă cel puțin 6 caractere"),
  role: z.enum(["ADMIN", "OPERATOR", "COURIER", "CLIENT"]),
  phone: z.string().optional(),
});

export const userUpdateSchema = userSchema.partial().omit({ password: true }).extend({
  password: z.string().min(6).optional().or(z.literal("")),
  active: z.boolean().optional(),
});

export const clientSchema = z.object({
  type: z.enum(["INDIVIDUAL", "COMPANY"]),
  name: z.string().min(2, "Numele este obligatoriu"),
  companyName: z.string().optional(),
  cui: z.string().optional(),
  phone: phoneValidator,
  email: optionalEmailValidator,
  address: z.string().min(1, "Adresa este obligatorie"),
  city: z.string().min(1, "Orașul este obligatoriu"),
  county: z.string().min(1, "Județul/Provincia este obligatoriu"),
  country: z.string().min(1, "Țara este obligatorie").default("RO"),
  notes: z.string().optional(),
});

export const parcelSchema = z.object({
  senderId: z.string().min(1, "Expeditorul este obligatoriu"),
  receiverId: z.string().min(1, "Destinatarul este obligatoriu"),
  weight: z.coerce.number().positive().optional(),
  width: z.coerce.number().positive().optional(),
  height: z.coerce.number().positive().optional(),
  length: z.coerce.number().positive().optional(),
  declaredValue: z.coerce.number().min(0).optional(),
  cashOnDelivery: z.coerce.number().min(0).optional(),
  content: z.string().optional(),
  notes: z.string().optional(),
  pickupAddress: z.string().min(1, "Adresa de ridicare este obligatorie"),
  pickupCity: z.string().min(1, "Orașul de ridicare este obligatoriu"),
  pickupCountry: z.string().min(1).default("RO"),
  deliveryAddress: z.string().min(1, "Adresa de livrare este obligatorie"),
  deliveryCity: z.string().min(1, "Orașul de livrare este obligatoriu"),
  deliveryCountry: z.string().min(1).default("RO"),
  price: z.coerce.number().min(0).default(0),
});

export const parcelStatusSchema = z.object({
  status: z.enum(["PRELUAT", "IN_TRANZIT", "IN_LIVRARE", "LIVRAT", "RETURNAT"]),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const tripSchema = z.object({
  originCity: z.string().min(1, "Orașul de plecare este obligatoriu"),
  originCountry: z.string().min(1).default("RO"),
  destinationCity: z.string().min(1, "Orașul de destinație este obligatoriu"),
  destinationCountry: z.string().min(1).default("RO"),
  route: z.string().optional(),
  departureDate: z.string().min(1, "Data plecării este obligatorie"),
  departureTime: z.string().min(1, "Ora plecării este obligatorie"),
  estimatedArrival: z.string().optional(),
  totalSeats: z.coerce.number().int().min(0).default(0),
  availableSeats: z.coerce.number().int().min(0).default(0),
  pricePerSeat: z.coerce.number().min(0).default(0),
  driverId: z.string().optional(),
  vehicleInfo: z.string().optional(),
  notes: z.string().optional(),
});

export const publicBookingSchema = z.object({
  tripId: z.string().min(1, "Cursa este obligatorie"),
  name: z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere"),
  phone: phoneValidator,
  email: optionalEmailValidator,
  seatCount: z.coerce.number().int().min(1, "Minimum 1 loc").max(10, "Maximum 10 locuri"),
  parcelCount: z.coerce.number().int().min(0).max(2, "Maximum 2 colete").default(0),
  parcelWeight: z.coerce.number().min(0).max(40, "Greutatea maximă este 40 kg").default(0),
  tripStopId: z.string().optional(),
}).refine(
  (data) => data.parcelCount === 0 || data.parcelWeight > 0,
  { message: "Specificați greutatea coletelor", path: ["parcelWeight"] }
);

export const tripSearchSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  date: z.string().optional(),
  passengers: z.coerce.number().int().min(1).default(1),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const recurringTripSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6).default(3),
  originCity: z.string().min(1, "Orașul de plecare este obligatoriu").default("Galați"),
  originCountry: z.string().min(1).default("RO"),
  destinationCity: z.string().min(1, "Orașul de destinație este obligatoriu"),
  destinationCountry: z.string().min(1).default("NL"),
  route: z.string().optional(),
  departureTime: z.string().min(1, "Ora plecării este obligatorie"),
  estimatedArrivalDays: z.coerce.number().int().min(0).optional(),
  totalSeats: z.coerce.number().int().min(1).default(12),
  pricePerSeat: z.coerce.number().min(0).default(0),
  stops: z.array(z.object({
    city: z.string().min(1),
    country: z.string().min(1).default("RO"),
    order: z.number().int().min(0),
    price: z.number().min(0).default(0),
  })).optional(),
  driverId: z.string().optional(),
  vehicleInfo: z.string().optional(),
  notes: z.string().optional(),
  active: z.boolean().default(true),
  weeksInAdvance: z.coerce.number().int().min(1).max(12).default(4),
});

export const passengerSchema = z.object({
  name: z.string().min(1, "Numele pasagerului este obligatoriu"),
  phone: phoneValidator,
  email: optionalEmailValidator,
  seatCount: z.coerce.number().int().min(1).default(1),
  notes: z.string().optional(),
  price: z.coerce.number().min(0).default(0),
  tripStopId: z.string().optional(),
  parcelCount: z.coerce.number().int().min(0).max(2).default(0),
  parcelWeight: z.coerce.number().min(0).max(40).default(0),
});
