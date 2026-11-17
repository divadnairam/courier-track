// Public base URL used for SEO (canonical links, sitemap, robots).
// Set NEXT_PUBLIC_SITE_URL on Vercel once the own domain is connected.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://aplicatie-pi.vercel.app").replace(/\/$/, "");

export const SITE_NAME = "CourierTrack";
