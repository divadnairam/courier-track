export const ROLES = {
  ADMIN: "ADMIN",
  OPERATOR: "OPERATOR",
  COURIER: "COURIER",
  CLIENT: "CLIENT",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  OPERATOR: "Operator",
  COURIER: "Curier",
  CLIENT: "Client",
};

export const PARCEL_STATUSES = {
  PRELUAT: "PRELUAT",
  IN_TRANZIT: "IN_TRANZIT",
  IN_LIVRARE: "IN_LIVRARE",
  LIVRAT: "LIVRAT",
  RETURNAT: "RETURNAT",
} as const;

export type ParcelStatus =
  (typeof PARCEL_STATUSES)[keyof typeof PARCEL_STATUSES];

export const PARCEL_STATUS_LABELS: Record<ParcelStatus, string> = {
  PRELUAT: "Preluat",
  IN_TRANZIT: "În tranzit",
  IN_LIVRARE: "În livrare",
  LIVRAT: "Livrat",
  RETURNAT: "Returnat",
};

export const PARCEL_STATUS_COLORS: Record<ParcelStatus, string> = {
  PRELUAT: "bg-blue-100 text-blue-800",
  IN_TRANZIT: "bg-yellow-100 text-yellow-800",
  IN_LIVRARE: "bg-orange-100 text-orange-800",
  LIVRAT: "bg-green-100 text-green-800",
  RETURNAT: "bg-red-100 text-red-800",
};

export const PARCEL_STATUS_FLOW: ParcelStatus[] = [
  "PRELUAT",
  "IN_TRANZIT",
  "IN_LIVRARE",
  "LIVRAT",
];

export const TRIP_STATUSES = {
  PROGRAMAT: "PROGRAMAT",
  IN_DESFASURARE: "IN_DESFASURARE",
  FINALIZAT: "FINALIZAT",
} as const;

export type TripStatus = (typeof TRIP_STATUSES)[keyof typeof TRIP_STATUSES];

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  PROGRAMAT: "Programat",
  IN_DESFASURARE: "În desfășurare",
  FINALIZAT: "Finalizat",
};

export const TRIP_STATUS_COLORS: Record<TripStatus, string> = {
  PROGRAMAT: "bg-blue-100 text-blue-800",
  IN_DESFASURARE: "bg-yellow-100 text-yellow-800",
  FINALIZAT: "bg-green-100 text-green-800",
};

export const CLIENT_TYPES = {
  INDIVIDUAL: "INDIVIDUAL",
  COMPANY: "COMPANY",
} as const;

export type ClientType = (typeof CLIENT_TYPES)[keyof typeof CLIENT_TYPES];

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  INDIVIDUAL: "Persoană fizică",
  COMPANY: "Companie",
};

export const COUNTRIES = [
  { code: "RO", label: "România" },
  { code: "NL", label: "Olanda" },
  { code: "IE", label: "Irlanda" },
  { code: "GB", label: "Anglia (UK)" },
  { code: "IT", label: "Italia" },
  { code: "ES", label: "Spania" },
  { code: "FR", label: "Franța" },
  { code: "DE", label: "Germania" },
  { code: "HU", label: "Ungaria" },
  { code: "CZ", label: "Cehia" },
  { code: "SI", label: "Slovenia" },
  { code: "HR", label: "Croația" },
  { code: "SK", label: "Slovacia" },
  { code: "BE", label: "Belgia" },
] as const;

export const WEIGHT_PRICE_RANGES = [
  { minKg: 0, maxKg: 25, priceEur: 40 },
  { minKg: 25, maxKg: 40, priceEur: 60 },
  { minKg: 40, maxKg: 60, priceEur: 80 },
  { minKg: 60, maxKg: 80, priceEur: 90 },
  { minKg: 80, maxKg: 100, priceEur: 100 },
  { minKg: 100, maxKg: 120, priceEur: 120 },
] as const;

export function getPriceForWeight(weightKg: number): number | null {
  const range = WEIGHT_PRICE_RANGES.find(
    (r) => weightKg > r.minKg && weightKg <= r.maxKg
  );
  // Special case: exactly 0 or very small
  if (weightKg > 0 && weightKg <= WEIGHT_PRICE_RANGES[0].maxKg) {
    return WEIGHT_PRICE_RANGES[0].priceEur;
  }
  return range ? range.priceEur : null;
}

export const COUNTRY_LABELS: Record<string, string> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c.label])
);

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/dashboard/colete", label: "Colete", icon: "Package" },
  { href: "/dashboard/arhiva", label: "Arhivă", icon: "Archive" },
  { href: "/dashboard/curse", label: "Curse", icon: "Truck" },
  { href: "/dashboard/clienti", label: "Clienți", icon: "Users" },
  { href: "/dashboard/rapoarte", label: "Rapoarte", icon: "BarChart3" },
  { href: "/dashboard/setari/utilizatori", label: "Utilizatori", icon: "Settings" },
];
