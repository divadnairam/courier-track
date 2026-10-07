"use client";

import dynamic from "next/dynamic";

const CookieConsent = dynamic(
  () => import("./cookie-consent").then((mod) => mod.CookieConsent),
  { ssr: false }
);

export function CookieConsentWrapper() {
  return <CookieConsent />;
}
