import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { CookieConsentWrapper } from "@/components/shared/cookie-consent-wrapper";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "CourierTrack — Transport Colete și Persoane România – Europa",
  description:
    "Transport colete și persoane din România spre Olanda, Germania, Anglia și Italia. Plecări săptămânale din Galați și urmărire online a coletului.",
  openGraph: {
    siteName: SITE_NAME,
    locale: "ro_RO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ro"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <CookieConsentWrapper />
        </Providers>
      </body>
    </html>
  );
}
