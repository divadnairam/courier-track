import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalid"),
  password: z.string().min(1, "Parola este obligatorie"),
});

export const userSchema = z.object({
  name: z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere"),
  email: z.string().email("Email invalid"),
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
  phone: z.string().min(1, "Telefonul este obligatoriu"),
  email: z.string().email("Email invalid").optional().or(z.literal("")),
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
  driverId: z.string().optional(),
  vehicleInfo: z.string().optional(),
  notes: z.string().optional(),
});

export const passengerSchema = z.object({
  name: z.string().min(1, "Numele pasagerului este obligatoriu"),
  phone: z.string().min(1, "Telefonul este obligatoriu"),
  seatCount: z.coerce.number().int().min(1).default(1),
  notes: z.string().optional(),
  price: z.coerce.number().min(0).default(0),
});
