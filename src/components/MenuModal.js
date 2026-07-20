"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Home, Tv, Book, Gamepad2, X, Heart, BookOpen, Palette } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./MenuModal.module.css";

const menuItems = [
  { nameKey: "menuModal.home", href: "/home", icon: Home },
  { nameKey: "menuModal.tv", href: "/tv", icon: Tv },
  { nameKey: "menuModal.books", href: "/books", icon: Book },
  { nameKey: "menuModal.stories", href: "/buku-cerita", icon: BookOpen },
  { nameKey: "menuModal.games", href: "/games", icon: Gamepad2 },
  { nameKey: "menuModal.create", href: "/create", icon: Palette },
];

export default function MenuModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const closeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.wrapper}>
          <motion.div className={styles.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div id="site-menu-dialog" className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="site-menu-title" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <div className={styles.header}>
              <h2 id="site-menu-title" className={styles.title}>{t("menuModal.title")}</h2>
              <button ref={closeRef} className={styles.closeBtn} onClick={onClose} aria-label={t("menuModal.close")}><X size={20} strokeWidth={2.5} /></button>
            </div>
            <nav className={styles.grid} aria-label={t("menuModal.title")}>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return <Link href={item.href} key={item.nameKey} onClick={onClose} className={styles.menuItem}><Icon className={styles.icon} size={20} /><span className={styles.itemName}>{t(item.nameKey)}</span><span className={styles.arrow} aria-hidden="true">→</span></Link>;
              })}
            </nav>
            <div className={styles.donationSection}><a href="https://saweria.co/senakids" target="_blank" rel="noopener noreferrer" className={styles.donationLink}><Heart size={18} fill="currentColor" /><span>{t("menuModal.support")}</span></a></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
