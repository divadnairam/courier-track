import type { Metadata } from "next";
import Link from "next/link";
import { Package, ArrowLeft, Truck, Users, MapPin, Clock, CalendarDays, Search } from "lucide-react";
import { Footer } from "@/components/shared/footer";
import { prisma } from "@/lib/prisma";
import { WEIGHT_PRICE_RANGES } from "@/lib/constants";
import { SITE_URL, SITE_NAME } from "@/lib/site";

// Re-read passenger prices from upcoming trips at most once per hour
export const revalidate = 3600;

const PAGE_PATH = "/transport-olanda";
const TITLE = "Transport Colete și Persoane România – Olanda | Plecări Săptămânale";
const DESCRIPTION =
  "Transport colete și persoane din România în Olanda: Amsterdam, Rotterdam, Den Haag, Utrecht, Eindhoven și alte orașe. Plecări în fiecare miercuri din Galați, livrare în aproximativ 2 zile, colete de la 40 €.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_PATH,
    type: "website",
    locale: "ro_RO",
    siteName: SITE_NAME,
  },
};

const MAJOR_CITIES = [
  "Amsterdam",
  "Rotterdam",
  "Den Haag",
  "Utrecht",
  "Eindhoven",
  "Groningen",
  "Tilburg",
  "Almere",
  "Breda",
  "Nijmegen",
];

const MIN_PARCEL_PRICE = Math.min(...WEIGHT_PRICE_RANGES.map((r) => r.priceEur));
const MAX_PARCEL_KG = Math.max(...WEIGHT_PRICE_RANGES.map((r) => r.maxKg));

async function getMinSeatPrice(): Promise<number | null> {
  try {
    const trip = await prisma.trip.findFirst({
      where: {
        destinationCountry: "NL",
        status: "PROGRAMAT",
        departureDate: { gte: new Date() },
        pricePerSeat: { gt: 0 },
      },
      orderBy: { pricePerSeat: "asc" },
      select: { pricePerSeat: true },
    });
    return trip?.pricePerSeat ?? null;
  } catch {
    return null;
  }
}

function buildFaq(minSeatPrice: number | null) {
  return [
    {
      q: "Cât durează transportul din România în Olanda?",
      a: "Drumul durează în jur de 2 zile de la plecarea din Galați până la livrarea în Olanda.",
    },
    {
      q: "Când sunt plecările spre Olanda?",
      a: "Avem plecări săptămânale, în fiecare miercuri, din Galați.",
    },
    {
      q: "În ce orașe din Olanda livrați?",
      a: `Livrăm în toate orașele mari din Olanda (${MAJOR_CITIES.slice(0, 6).join(", ")} și altele). La cerere livrăm și în orașe mai mici.`,
    },
    {
      q: "Cât costă trimiterea unui colet în Olanda?",
      a: `Prețul depinde de greutate: de la ${MIN_PARCEL_PRICE} € pentru colete de până la ${WEIGHT_PRICE_RANGES[0].maxKg} kg. Pentru colete de peste ${MAX_PARCEL_KG} kg vă rugăm să ne contactați pentru o ofertă.`,
    },
    {
      q: "Cât costă un loc pentru transport persoane în Olanda?",
      a: minSeatPrice
        ? `Un loc în microbuz spre Olanda costă de la ${minSeatPrice} €. Prețul exact depinde de cursă și de stația de urcare și se vede la rezervarea online.`
        : "Prețul unui loc depinde de cursă și de stația de urcare și se vede la rezervarea online.",
    },
    {
      q: "Pot urmări coletul pe drum?",
      a: "Da. Fiecare colet primește un număr AWB cu care îl puteți urmări online, pe site, în orice moment.",
    },
  ];
}

export default async function TransportOlandaPage() {
  const minSeatPrice = await getMinSeatPrice();
  const faq = buildFaq(minSeatPrice);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Transport colete și persoane România – Olanda",
      serviceType: "Transport colete și persoane",
      url: `${SITE_URL}${PAGE_PATH}`,
      description: DESCRIPTION,
      provider: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        address: { "@type": "PostalAddress", addressLocality: "Galați", addressCountry: "RO" },
      },
      areaServed: [
        { "@type": "Country", name: "România" },
        { "@type": "Country", name: "Olanda" },
      ],
      offers: {
        "@type": "Offer",
        priceCurrency: "EUR",
        price: MIN_PARCEL_PRICE,
        description: `Colet de până la ${WEIGHT_PRICE_RANGES[0].maxKg} kg`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <header className="bg-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <Package className="h-6 w-6 text-blue-300" />
            <span className="text-lg font-semibold">CourierTrack</span>
          </Link>
          <Link href="/" className="text-sm text-blue-200 hover:text-white flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Înapoi
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
          <div className="max-w-5xl mx-auto px-4 py-14 sm:py-20 text-center">
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5">
              Transport Colete și Persoane
              <span className="block text-blue-300">România – Olanda</span>
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
              Plecări săptămânale din Galați, în fiecare miercuri. Livrăm în toate orașele mari din Olanda
              în aproximativ 2 zile, iar la cerere și în orașe mai mici.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/transport"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-800 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Users className="h-5 w-5" /> Rezervă un loc
              </Link>
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center gap-2 border border-blue-300 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors"
              >
                <Truck className="h-5 w-5" /> Trimite un colet
              </Link>
            </div>
          </div>
        </section>

        {/* Key facts */}
        <section className="max-w-5xl mx-auto px-4 -mt-8">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: CalendarDays, title: "Plecare în fiecare miercuri", text: "Din Galați, săptămânal" },
              { icon: Clock, title: "Aproximativ 2 zile", text: "Durata drumului până în Olanda" },
              { icon: Package, title: `Colete de la ${MIN_PARCEL_PRICE} €`, text: `Până la ${WEIGHT_PRICE_RANGES[0].maxKg} kg` },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-white rounded-xl shadow-md border p-5 text-center">
                <Icon className="h-7 w-7 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">{title}</p>
                <p className="text-sm text-gray-500">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Parcels */}
        <section className="max-w-5xl mx-auto px-4 py-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Transport colete în Olanda</h2>
          <p className="text-gray-600 mb-6 max-w-3xl">
            Trimite colete din România în Olanda: bagaje, pachete pentru familie, produse românești,
            electrocasnice sau mobilier de mici dimensiuni. Coletul primește un număr AWB și poate fi urmărit
            online pe tot parcursul drumului.
          </p>
          <div className="overflow-hidden rounded-xl border max-w-md">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 text-blue-900">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold">Greutate colet</th>
                  <th className="text-right px-4 py-2.5 font-semibold">Preț</th>
                </tr>
              </thead>
              <tbody>
                {WEIGHT_PRICE_RANGES.map((r, i) => (
                  <tr key={r.maxKg} className="border-t">
                    <td className="px-4 py-2.5 text-gray-700">
                      {i === 0 ? `Până la ${r.maxKg} kg` : `${r.minKg} – ${r.maxKg} kg`}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{r.priceEur} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Pentru colete de peste {MAX_PARCEL_KG} kg sau transporturi speciale, contactați-ne pentru o ofertă.
          </p>
        </section>

        {/* Passengers */}
        <section className="bg-gray-50 border-y">
          <div className="max-w-5xl mx-auto px-4 py-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Transport persoane România – Olanda</h2>
            <p className="text-gray-600 mb-6 max-w-3xl">
              Călătorește confortabil cu microbuzul din România în Olanda.
              {minSeatPrice ? <> Locurile pornesc de la <strong>{minSeatPrice} €</strong>.</> : null}{" "}
              Rezervarea se face online, în câteva minute, iar prețul final depinde de cursă și de stația de urcare.
            </p>
            <Link
              href="/transport"
              className="inline-flex items-center gap-2 bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-colors"
            >
              <Search className="h-4 w-4" /> Vezi cursele disponibile
            </Link>
          </div>
        </section>

        {/* Cities */}
        <section className="max-w-5xl mx-auto px-4 py-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Orașe deservite în Olanda</h2>
          <p className="text-gray-600 mb-6 max-w-3xl">
            Livrăm în toate orașele mari din Olanda. Dacă locuiești într-un oraș mai mic, livrăm la cerere,
            contactează-ne înainte de plecare.
          </p>
          <ul className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {MAJOR_CITIES.map((city) => (
              <li key={city} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm text-gray-700">
                <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                {city}
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section className="bg-blue-50">
          <div className="max-w-5xl mx-auto px-4 py-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Cum funcționează</h2>
            <ol className="grid sm:grid-cols-3 gap-6">
              {[
                { title: "Ne contactezi sau rezervi online", text: "Ne spui ce trimiți și unde, sau rezervi un loc pentru călătorie." },
                { title: "Plecăm miercuri din Galați", text: "Preluăm coletul și pornim la drum spre Olanda." },
                { title: "Livrare în aproximativ 2 zile", text: "Urmărești coletul online cu numărul AWB până la livrare." },
              ].map((step, i) => (
                <li key={step.title} className="bg-white rounded-xl p-5 border">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold mb-3">
                    {i + 1}
                  </span>
                  <p className="font-semibold text-gray-900 mb-1">{step.title}</p>
                  <p className="text-sm text-gray-600">{step.text}</p>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-gray-600">
              Ai deja un AWB?{" "}
              <Link href="/tracking" className="text-blue-700 font-medium hover:underline">Urmărește coletul aici</Link>.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-4 py-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Întrebări frecvente</h2>
          <div className="space-y-3">
            {faq.map((item) => (
              <details key={item.q} className="group rounded-lg border px-4 py-3">
                <summary className="cursor-pointer font-medium text-gray-900 list-none flex justify-between items-center">
                  {item.q}
                  <span className="text-blue-600 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="mt-2 text-gray-600 text-sm">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
