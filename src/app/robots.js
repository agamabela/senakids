export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://senakids.web.id";

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
