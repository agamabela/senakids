"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Home, Tv, Book, Gamepad2, Newspaper, ShoppingBag, ThumbsUp, Link as LinkIcon, Route, PlayCircle, X } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./MenuModal.module.css";

const menuItems = [
  { nameKey: "menuModal.home", href: "/home", icon: Home, color: "var(--color-orange)" },
  { nameKey: "menuModal.tv", href: "/tv", icon: Tv, color: "var(--color-blue)" },
  { nameKey: "menuModal.books", href: "/books", icon: Book, color: "var(--color-green)" },
  { nameKey: "menuModal.games", href: "/games", icon: Gamepad2, color: "var(--color-pink)" },
  { nameKey: "menuModal.news", href: "/home", icon: Newspaper, color: "var(--color-teal)" },
  { nameKey: "menuModal.products", href: "/home", icon: ShoppingBag, color: "var(--color-orange)" },
  { nameKey: "menuModal.recommend", href: "/home", icon: ThumbsUp, color: "var(--color-blue)" },
  { nameKey: "menuModal.links", href: "/home", icon: LinkIcon, color: "var(--color-green)" },
  { nameKey: "menuModal.curriculum", href: "/learning_journeys", icon: Route, color: "var(--color-purple)" },
  { nameKey: "menuModal.playlist", href: "/tv", icon: PlayCircle, color: "var(--color-pink)" },
];

export default function MenuModal({ isOpen, onClose }) {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className={styles.wrapper}>
            <motion.div
              className={styles.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
            <div className={styles.header}>
              <div className={styles.headerIndicator} />
              <h2 className={styles.title}>{t("menuModal.title")}</h2>
              <button className={styles.closeBtn} onClick={onClose} aria-label={t("menuModal.close")}>
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className={styles.grid}>
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link href={item.href} key={item.nameKey} onClick={onClose} style={{ textDecoration: 'none' }}>
                    <motion.div 
                      className={styles.menuItem}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className={styles.iconWrapper} style={{ color: item.color }}>
                        <Icon size={28} strokeWidth={2} />
                      </div>
                      <span className={styles.itemName}>{t(item.nameKey)}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
