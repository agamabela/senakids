import { Fredoka, Nunito } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/components/LanguageProvider";
import { SessionProvider } from "@/components/SessionProvider";
import AmbientSound from "@/components/AmbientSound";
import JourneyTracker from "@/components/JourneyTracker";
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

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://senakids.web.id"),
  title: {
    default: "Sena Kids - Platform Belajar & Bermain Ceria Ramah Anak",
    template: "%s | Sena Kids",
  },
  description: "Platform belajar ramah anak: buku cerita bergambar Let's Read, video edukasi aman, ensiklopedia cilik, dan game logika interaktif tanpa iklan pengganggu.",
  icons: {
    icon: "/sena-logo.svg",
    apple: "/sena-logo.svg",
  },
  openGraph: {
    title: "Sena Kids - Belajar & Bermain Ramah Anak",
    description: "Buku cerita bergambar anak, video edukasi aman, dan game logika interaktif tanpa iklan pengganggu.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://senakids.web.id",
    siteName: "Sena Kids",
    images: [
      {
        url: "/asset.png",
        width: 1200,
        height: 630,
        alt: "Sena Kids - Dunia Belajar & Bermain Ramah Anak",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sena Kids - Belajar & Bermain Ceria",
    description: "Platform belajar ramah anak: cerita bergambar, video edukasi, dan game logika.",
    images: ["/asset.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3D7843",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${fredoka.variable} ${nunito.variable}`} suppressHydrationWarning>
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
            </LanguageProvider>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
