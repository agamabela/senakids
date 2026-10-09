/**
 * Bulletproof Site URL resolver for SEO, canonical tags, and structured data.
 * Always resolves to the official custom domain (https://senakids.web.id) unless
 * an explicit custom production domain is provided in NEXT_PUBLIC_SITE_URL.
 * Prevents Vercel preview URLs (*.vercel.app) or localhost from leaking into canonical tags.
 */
export function getSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && !envUrl.includes("vercel.app") && !envUrl.includes("localhost")) {
    return envUrl.startsWith("http") ? envUrl.replace(/\/$/, "") : `https://${envUrl.replace(/\/$/, "")}`;
  }
  return "https://senakids.web.id";
}
