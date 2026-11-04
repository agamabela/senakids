import { Fredoka, Nunito } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/components/LanguageProvider";
import { SessionProvider } from "@/components/SessionProvider";
import AmbientSound from "@/components/AmbientSound";
import ScreenTimeReminder from "@/components/ScreenTimeReminder";
import JourneyTracker from "@/components/JourneyTracker";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sena Kids - Aktivitas Belajar dan Bermain Anak",
    template: "%s | Sena Kids",
  },
  description: "Temukan aktivitas belajar dan bermain anak di Sena Kids: permainan edukatif interaktif, buku cerita bergambar, dan video belajar yang aman untuk keluarga.",
  keywords: [
    "Sena Kids",
    "aktivitas anak",
    "belajar anak",
    "permainan edukatif anak",
    "game edukasi anak",
    "buku cerita anak bergambar",
    "belajar membaca anak tk",
    "latihan berhitung anak",
    "media belajar anak usia dini",
    "lets read indonesia",
  ],
  icons: {
    icon: "/sena-logo.svg",
    apple: "/sena-logo.svg",
  },
  openGraph: {
    title: "Sena Kids - Aktivitas Belajar dan Bermain Anak",
    description: "Temukan aktivitas belajar dan bermain anak di Sena Kids: permainan edukatif interaktif, buku cerita bergambar, dan video belajar yang aman.",
    url: siteUrl,
    siteName: "Sena Kids",
    images: [
      {
        url: "/asset.png",
        width: 1200,
        height: 630,
        alt: "Sena Kids - Aktivitas Belajar dan Bermain Anak",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sena Kids - Aktivitas Belajar dan Bermain Anak",
    description: "Aktivitas belajar dan bermain anak di Sena Kids: buku cerita bergambar, video edukasi aman, dan aneka permainan edukatif.",
    images: ["/asset.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "c55rVqLzV3qXG7Jd4_H_T-F7zY4V0X9Q3Y",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3D7843",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className={`${fredoka.variable} ${nunito.variable}`} suppressHydrationWarning>
      <body className={`${fredoka.variable} ${nunito.variable}`} suppressHydrationWarning>
        <a href="#main-content" className="skip-to-content">
          Lewati ke konten utama (Skip to main content)
        </a>
        <SessionProvider>
          <div className="app-wrapper">
            <LanguageProvider>
              <JourneyTracker />
              <Navbar />
              <main id="main-content" className="main-content" tabIndex={-1}>
                {children}
              </main>
              <Footer />
              <AmbientSound />
              <ScreenTimeReminder />
            </LanguageProvider>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
