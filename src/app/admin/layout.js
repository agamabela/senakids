import Link from "next/link";
import { LayoutDashboard, Book, Gamepad2, Tv, Settings, LogOut } from "lucide-react";
import styles from "./layout.module.css";

export const metadata = {
  title: "Admin Dashboard - Sena Kids",
};

export default function AdminLayout({ children }) {
  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logo}>🌿</div>
          <h2>Admin Panel</h2>
        </div>
        
        <nav className={styles.nav}>
          <Link href="/admin" className={styles.navLink}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link href="/admin/books" className={styles.navLink}>
            <Book size={20} /> Books
          </Link>
          <Link href="/admin/games" className={styles.navLink}>
            <Gamepad2 size={20} /> Games
          </Link>
          <Link href="/admin/tv" className={styles.navLink}>
            <Tv size={20} /> TV Videos
          </Link>
        </nav>

        <div className={styles.footer}>
          <Link href="/" className={styles.navLink}>
            <LogOut size={20} /> Exit Admin
          </Link>
        </div>
      </aside>

      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
