"use client";

import Link from "next/link";
import { LayoutDashboard, Book, Gamepad2, Tv, LogOut } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./layout.module.css";

export default function AdminLayoutClient({ children }) {
  const { t } = useLanguage();

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logo}>🌿</div>
          <h2>{t("admin.brand")}</h2>
        </div>

        <nav className={styles.nav}>
          <Link href="/admin" className={styles.navLink}>
            <LayoutDashboard size={20} /> {t("admin.dashboard")}
          </Link>
          <Link href="/admin/books" className={styles.navLink}>
            <Book size={20} /> {t("admin.books")}
          </Link>
          <Link href="/admin/games" className={styles.navLink}>
            <Gamepad2 size={20} /> {t("admin.games")}
          </Link>
          <Link href="/admin/tv" className={styles.navLink}>
            <Tv size={20} /> {t("admin.tv")}
          </Link>
        </nav>

        <div className={styles.footer}>
          <Link href="/" className={styles.navLink}>
            <LogOut size={20} /> {t("admin.exit")}
          </Link>
        </div>
      </aside>

      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
