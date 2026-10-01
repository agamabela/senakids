/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // removes X-Powered-By: Next.js

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "data.cabocil.com" },
      { protocol: "https", hostname: "toytheater.com" },
      { protocol: "https", hostname: "images.seeklogo.com" },
    ],
  },

  async redirects() {
    return [
      {
        source: "/",
        destination: "/home",
        permanent: true, // 308 Permanent Redirect for canonical homepage
      },
    ];
  },

  async headers() {
    // Child safety Content Security Policy
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com https://s.ytimg.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://storage.googleapis.com https://img.youtube.com https://i.ytimg.com https://data.cabocil.com https://toytheater.com https://images.seeklogo.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.googleapis.com https://www.youtube-nocookie.com https://www.youtube.com",
      "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com https://www.letsreadasia.org https://toytheater.com https://kindahardgolf.com https://plastelina.net https://game.rodocodo.com https://genshin-music.specy.app",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspDirectives,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
