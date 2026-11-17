"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "cookie-consent";
const OPEN_EVENT = "cookie-consent:open";
// Consent is re-requested after 6 months
const CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;

type ConsentValue = "accepted" | "rejected";

function readConsent(): ConsentValue | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    // Old format stored a bare string without a date: ask again
    const parsed = JSON.parse(raw) as { value?: ConsentValue; date?: number };
    if (!parsed.value || !parsed.date) return null;
    if (Date.now() - parsed.date > CONSENT_MAX_AGE_MS) return null;
    return parsed.value;
  } catch {
    return null;
  }
}

function saveConsent(value: ConsentValue) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, date: Date.now() }));
  } catch {
    // Storage unavailable (private mode): the banner will simply show again next visit
  }
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function CookieConsent() {
  // Rendered client-only (ssr: false in the wrapper), so localStorage is available here
  const [current, setCurrent] = useState<ConsentValue | null>(readConsent);
  const [visible, setVisible] = useState(() => current === null);

  useEffect(() => {
    function handleOpen() {
      setCurrent(readConsent());
      setVisible(true);
    }
    window.addEventListener(OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_EVENT, handleOpen);
  }, []);

  function handleAccept() {
    saveConsent("accepted");
    setCurrent("accepted");
    setVisible(false);
  }

  function handleReject() {
    saveConsent("rejected");
    setCurrent("rejected");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white p-4 shadow-lg">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm flex-1">
          Acest site folosește cookie-uri strict necesare pentru funcționarea platformei (autentificare și sesiune).
          Nu folosim cookie-uri de tracking sau publicitate.
          Consultați{" "}
          <Link href="/politica-confidentialitate" className="underline text-blue-300 hover:text-blue-200">
            Politica de Confidențialitate
          </Link>{" "}
          pentru detalii.
          {current && (
            <span className="block mt-1 text-xs text-gray-400">
              Alegerea dumneavoastră actuală: {current === "accepted" ? "acceptat" : "refuzat"}.
            </span>
          )}
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleReject}
            className="px-4 py-2 text-sm border border-gray-500 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Refuz
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
