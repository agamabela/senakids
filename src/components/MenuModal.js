"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Home,
  Tv,
  Book,
  Gamepad2,
  X,
  Heart,
  BookOpen,
  Palette,
  ChevronRight,
  Shield,
  FileText,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./MenuModal.module.css";

const primaryMenuItems = [
  { nameKey: "menuModal.home", href: "/home", icon: Home },
  { nameKey: "menuModal.books", href: "/books", icon: Book },
  { nameKey: "menuModal.stories", href: "/buku-cerita", icon: BookOpen },
  { nameKey: "menuModal.tv", href: "/tv", icon: Tv },
  { nameKey: "menuModal.channels", label: { id: "Channel Pilihan", en: "Selected Channels" }, href: "/channels", icon: Tv },
  { nameKey: "menuModal.games", href: "/games", icon: Gamepad2 },
  { nameKey: "menuModal.create", href: "/create", icon: Palette },
  { nameKey: "menuModal.curriculum", href: "/owly", icon: Sparkles },
];

const parentMenuItems = [
  { nameKey: "menuModal.parents", href: "/parents", icon: Shield },
  { nameKey: "menuModal.privacy", href: "/privacy", icon: Shield },
  { nameKey: "menuModal.terms", href: "/terms", icon: FileText },
  { nameKey: "menuModal.contact", href: "/contact", icon: MessageSquare },
];

export default function MenuModal({ isOpen, onClose }) {
  const { t, tx, lang } = useLanguage();
  const modalRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Lock background scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Set background content inert
    const mainContent = document.getElementById("main-content");
    const footer = document.querySelector("footer");
    if (mainContent) mainContent.setAttribute("inert", "");
    if (footer) footer.setAttribute("inert", "");

    // Focus close button initially
    const timer = setTimeout(() => {
      closeRef.current?.focus();
    }, 50);

    // Focus trap and escape key handler
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      if (mainContent) mainContent.removeAttribute("inert");
      if (footer) footer.removeAttribute("inert");
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div
        id="site-menu-dialog"
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-menu-title"
      >
        <div className={styles.header}>
          <h2 id="site-menu-title" className={styles.title}>{t("menuModal.title")}</h2>
          <button
            ref={closeRef}
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t("menuModal.close")}
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className={styles.bodyScroll}>
          <nav className={styles.grid} aria-label={t("menuModal.title")}>
            {primaryMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  href={item.href}
                  key={item.nameKey}
                  onClick={onClose}
                  className={styles.menuItem}
                >
                  <Icon className={styles.icon} size={20} />
                  <span className={styles.itemName}>
                    {item.label ? (lang === "en" ? item.label.en : item.label.id) : t(item.nameKey)}
                  </span>
                  <ChevronRight className={styles.arrow} size={16} aria-hidden="true" />
                </Link>
              );
            })}
          </nav>

          <div className={styles.divider} />
          <h3 className={styles.subheading}>{tx("Area Orang Tua & Kebijakan", "Parent Area & Policies")}</h3>

          <nav className={styles.grid} aria-label="Parent and Policies Navigation">
            {parentMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  href={item.href}
                  key={item.nameKey}
                  onClick={onClose}
                  className={styles.menuItem}
                >
                  <Icon className={styles.icon} size={18} />
                  <span className={styles.itemName}>{t(item.nameKey)}</span>
                  <ChevronRight className={styles.arrow} size={16} aria-hidden="true" />
                </Link>
              );
            })}
          </nav>

          <div className={styles.donationSection}>
            <a
              href="https://saweria.co/senakids"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.donationLink}
            >
              <Heart size={18} fill="currentColor" />
              <span>{t("menuModal.support")}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
