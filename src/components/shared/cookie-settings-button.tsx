"use client";

import { openCookieSettings } from "./cookie-consent";

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openCookieSettings} className={className}>
      Setări cookie-uri
    </button>
  );
}
