import Link from "next/link";
import { Home, BookOpen, Tv, Gamepad2 } from "lucide-react";

export const metadata = {
  title: "404 - Halaman Tidak Ditemukan | Sena Kids",
  description: "Wah, petualanganmu sampai di halaman yang belum ada. Ayo kembali ke tempat yang seru!",
};

export default function NotFound() {
  return (
    <div style={{
      maxWidth: "680px",
      margin: "60px auto",
      padding: "32px 20px",
      textAlign: "center",
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow-card)",
    }}>
      <div style={{ fontSize: "64px", marginBottom: "16px" }}>🧭</div>
      <h1 style={{
        fontFamily: "var(--font-family-heading)",
        fontSize: "28px",
        fontWeight: "700",
        color: "var(--color-text-heading)",
        marginBottom: "12px",
      }}>
        Halaman Tidak Ditemukan (404)
      </h1>
      <p style={{
        fontSize: "16px",
        color: "var(--color-text-muted)",
        lineHeight: "1.6",
        marginBottom: "32px",
      }}>
        Wah, petualanganmu sampai di halaman yang belum ada! Jangan khawatir, kamu bisa memilih petualangan seru lainnya di bawah ini:
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
        gap: "12px",
        marginBottom: "24px",
      }}>
        <Link
          href="/home"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            padding: "16px 12px",
            background: "var(--color-surface-muted)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            color: "var(--color-text)",
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          <Home size={24} color="var(--color-primary)" />
          <span>Beranda</span>
        </Link>

        <Link
          href="/books"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            padding: "16px 12px",
            background: "var(--color-surface-muted)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            color: "var(--color-text)",
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          <BookOpen size={24} color="var(--color-primary)" />
          <span>Buku Cerita</span>
        </Link>

        <Link
          href="/tv"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            padding: "16px 12px",
            background: "var(--color-surface-muted)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            color: "var(--color-text)",
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          <Tv size={24} color="var(--color-blue)" />
          <span>TV Edukasi</span>
        </Link>

        <Link
          href="/games"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            padding: "16px 12px",
            background: "var(--color-surface-muted)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            color: "var(--color-text)",
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          <Gamepad2 size={24} color="var(--color-orange)" />
          <span>Bermain Game</span>
        </Link>
      </div>
    </div>
  );
}
