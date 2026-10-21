/** Use one HTTPS origin for canonicals, structured data, robots and sitemap. */
export function getSiteUrl() {
  const fallback = 'https://senakids.web.id';
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configured) return fallback;
  try {
    const url = new URL(configured.includes('://') ? configured : `https://${configured}`);
    const host = url.hostname;
    if (url.protocol !== 'https:' || url.username || url.password || url.port ||
      host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.vercel.app') ||
      /^[\d.]+$/.test(host) || host.includes(':')) return fallback;
    return url.origin;
  } catch {
    return fallback;
  }
}
