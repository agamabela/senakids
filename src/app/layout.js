import { Fredoka, Nunito } from "next/font/google";
import Navbar from "@/components/Navbar";
import { LanguageProvider } from "@/components/LanguageProvider";
import { SessionProvider } from "@/components/SessionProvider";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata = {
  title: "Sena Kids — Aplikasi untuk anak",
  description: "Belajar, bermain, dan bereksplorasi dengan Sena Kids!",
  icons: {
    icon: "/sena-logo.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#8BA888",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${fredoka.variable} ${nunito.variable}`}>
      <body>
        <SessionProvider>
          <div className="app-wrapper">
            <LanguageProvider>
              <Navbar />
              <main className="main-content">
                {children}
              </main>
            </LanguageProvider>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
