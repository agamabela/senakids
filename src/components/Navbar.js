"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Home, Tv, Book, Gamepad2, Route, RefreshCcw, UserRound } from "lucide-react";
import MenuModal from "./MenuModal";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./Navbar.module.css";

const navLinks = [
  { key: "nav.home", href: "/home", icon: Home },
  { key: "nav.tv", href: "/tv", icon: Tv },
  { key: "nav.books", href: "/books", icon: Book },
  { key: "nav.games", href: "/games", icon: Gamepad2 },
  { key: "nav.learning", href: "/learning_journeys", icon: Route },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          
          {/* Left Section: Logo */}
          <div className={styles.leftSection}>
            <Link href="/home" className={styles.logoLink}>
              <div className={styles.logoBox}>
                🌿
              </div>
              <span className={styles.logoText}>Sena Kids</span>
            </Link>
          </div>

          {/* Middle Section: Navigation Links */}
          <div className={styles.middleSection}>
            <button 
              className={styles.menuButton} 
              aria-label={t("nav.menu")}
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={20} strokeWidth={2.5} />
              <span className={styles.menuText}>{t("nav.menu")}</span>
            </button>
          
          <nav className={styles.navDesktop}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{t(link.key)}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Actions */}
        <div className={styles.rightSection}>
          <LanguageToggle />
          <button className={styles.actionButton} aria-label={t("nav.refresh")}> 
            <RefreshCcw size={20} strokeWidth={2.5} />
          </button>
          <button className={styles.avatarButton} aria-label={t("nav.profile")}> 
            <div className={styles.avatarFallback}>
              <UserRound size={18} strokeWidth={2.5} />
            </div>
          </button>
        </div>

      </div>
    </header>
    <MenuModal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
