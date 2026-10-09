"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  Home,
  Tv,
  Book,
  BookOpen,
  Gamepad2,
  Palette,
  RefreshCcw,
  UserRound,
  LogOut,
  LogIn,
  Shield,
  Sun,
  Moon,
  Settings,
} from "lucide-react";
import MenuModal from "./MenuModal";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./Navbar.module.css";

const navLinks = [
  { key: "nav.home", href: "/home", icon: Home, category: "home" },
  { key: "nav.books", href: "/books", icon: Book, category: "books" },
  { key: "nav.stories", href: "/buku-cerita", icon: BookOpen, category: "stories" },
  { key: "nav.tv", href: "/tv", icon: Tv, category: "tv" },
  { key: "nav.games", href: "/games", icon: Gamepad2, category: "games" },
  { key: "nav.create", href: "/create", icon: Palette, category: "create" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { t, language, tx } = useLanguage();
  const { data: session, status } = useSession();

  const [theme, setTheme] = useState("light");
  const menuButtonRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/home" });
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          {/* Left Section: Logo */}
          <div className={styles.leftSection}>
            <Link href="/home" className={styles.logoLink} aria-label="Sena Kids Home">
              <div className={styles.logoBox}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/sena-logo.svg" alt="Sena Kids" width={36} height={36} />
              </div>
              <span className={styles.logoText}>Sena Kids</span>
            </Link>
          </div>

          {/* Middle Section: Navigation Links */}
          <div className={styles.middleSection}>
            <button
              ref={menuButtonRef}
              id="site-menu-trigger"
              className={styles.menuButton}
              aria-label={t("nav.menu")}
              aria-expanded={isMenuOpen}
              aria-controls="site-menu-dialog"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <Menu size={20} strokeWidth={2.5} />
              <span className={styles.menuText}>{t("nav.menu")}</span>
            </button>

            <nav className={styles.navDesktop} aria-label="Main Navigation">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/home" && pathname.startsWith(`${link.href}/`));
                const Icon = link.icon;
                return (
                  <Link
                    key={link.key}
                    href={link.href}
                    className={`${styles.navLink} ${styles[`navLink_${link.category}`] || ""} ${isActive ? styles.navLinkActive : ""}`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={styles.navIcon} />
                    <span>{t(link.key)}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section: Actions */}
          <div className={styles.rightSection}>
            <LanguageToggle />

            <button
              className={styles.actionButton}
              aria-label={theme === "dark" ? tx("Beralih ke mode terang", "Switch to light mode") : tx("Beralih ke mode gelap", "Switch to dark mode")}
              title={theme === "dark" ? tx("Mode Terang", "Light Mode") : tx("Mode Gelap", "Dark Mode")}
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
            </button>

            <button
              className={`${styles.actionButton} ${styles.refreshButton}`}
              aria-label={tx("Muat ulang halaman saat ini", "Reload current page")}
              title={tx("Segarkan Halaman", "Refresh Page")}
              onClick={() => window.location.reload()}
            >
              <RefreshCcw size={20} strokeWidth={2.5} />
            </button>

            {/* User / Parent Profile Menu */}
            <div className={styles.userMenuWrapper}>
              <button
                className={styles.avatarButton}
                aria-label={t("nav.profile")}
                title={t("nav.profile")}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className={styles.avatarFallback}>
                  <UserRound size={18} strokeWidth={2.5} />
                </div>
              </button>

              {showUserMenu && (
                <div className={styles.userDropdown} role="menu">
                  {status === "authenticated" ? (
                    <>
                      <div className={styles.userInfo}>
                        <div className={styles.userName}>{session.user?.name || session.user?.email}</div>
                        <div className={styles.userEmail}>{session.user?.email}</div>
                      </div>
                      <Link
                        href="/parents"
                        className={styles.dropdownItem}
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings size={16} />
                        {t("footer.parents")}
                      </Link>
                      {session.user?.role === "admin" && (
                        <Link
                          href="/admin"
                          className={styles.dropdownItem}
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Shield size={16} />
                          {t("nav.adminPanel")}
                        </Link>
                      )}
                      <button onClick={handleLogout} className={styles.dropdownItem}>
                        <LogOut size={16} />
                        {t("nav.logout")}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className={styles.dropdownItem}
                        onClick={() => setShowUserMenu(false)}
                      >
                        <LogIn size={16} />
                        {t("nav.login")}
                      </Link>
                      <Link
                        href="/register"
                        className={styles.dropdownItem}
                        onClick={() => setShowUserMenu(false)}
                      >
                        <UserRound size={16} />
                        {t("nav.register")}
                      </Link>
                      <Link
                        href="/parents"
                        className={styles.dropdownItem}
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings size={16} />
                        {t("footer.parents")}
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <MenuModal
        isOpen={isMenuOpen}
        onClose={() => {
          setIsMenuOpen(false);
          menuButtonRef.current?.focus();
        }}
      />
    </>
  );
}
