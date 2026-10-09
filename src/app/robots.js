import { getSiteUrl } from "@/lib/site-url";

export default function robots() {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/home",
          "/books",
          "/books/stories/*",
          "/buku-cerita",
          "/tv",
          "/games",
          "/games/built/*",
          "/create",
          "/owly",
          "/belajar-membaca",
          "/sejarah-sepeda",
          "/petualangan-tetes-air",
          "/mengenal-hujan",
          "/privacy",
          "/terms",
          "/parents",
          "/contact",
          "/images/*",
          "/_next/static/*",
          "/_next/image*",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
