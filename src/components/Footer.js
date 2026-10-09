"use client";

import Link from "next/link";
import { Shield, Heart, ExternalLink, BookOpen, Tv, Gamepad2, Palette } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./Footer.module.css";

export default function Footer() {
  const { t, tx } = useLanguage();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brandCol}>
            <div className={styles.logoRow}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/sena-logo.svg" alt="Sena Kids" width={32} height={32} />
              <span className={styles.brandName}>Sena Kids</span>
            </div>
            <p className={styles.tagline}>{t("footer.tagline")}</p>
            <div className={styles.safetyBadge}>
              <Shield size={16} />
              <span>{tx("Aman & Tanpa Iklan Perilaku", "Safe & Free from Behavioral Ads")}</span>
            </div>
          </div>

          <div className={styles.playCol}>
            <h3 className={styles.colTitle}>{tx("Pilih petualangan", "Choose an adventure")}</h3>
            <div className={styles.playLinks}>
              <Link href="/books" className={`${styles.playLink} ${styles.playLink_books}`}>
                <BookOpen size={22} aria-hidden="true" />
                <span>{t("footer.books")}</span>
              </Link>
              <Link href="/tv" className={`${styles.playLink} ${styles.playLink_tv}`}>
                <Tv size={22} aria-hidden="true" />
                <span>{t("footer.tv")}</span>
              </Link>
              <Link href="/games" className={`${styles.playLink} ${styles.playLink_games}`}>
                <Gamepad2 size={22} aria-hidden="true" />
                <span>{t("footer.games")}</span>
              </Link>
              <Link href="/create" className={`${styles.playLink} ${styles.playLink_create}`}>
                <Palette size={22} aria-hidden="true" />
                <span>{tx("Studio Kreasi", "Creative Studio")}</span>
              </Link>
            </div>
          </div>

          <div className={styles.linksCol}>
            <h3 className={styles.colTitle}>{tx("Untuk orang tua", "For grown-ups")}</h3>
            <ul className={styles.linkList}>
              <li><Link href="/parents">{t("footer.parents")}</Link></li>
              <li><Link href="/parents#timer">{t("footer.parentControls")}</Link></li>
              <li><Link href="/contact?category=data">{t("footer.deletionRequest")}</Link></li>
              <li><Link href="/contact?category=broken">{t("footer.reportContent")}</Link></li>
            </ul>
          </div>

          <div className={styles.linksCol}>
            <h3 className={styles.colTitle}>{t("footer.legalTitle")}</h3>
            <ul className={styles.linkList}>
              <li><Link href="/privacy">{t("footer.privacy")}</Link></li>
              <li><Link href="/terms">{t("footer.terms")}</Link></li>
              <li><Link href="/contact">{t("footer.contact")}</Link></li>
              <li>
                <a
                  href="https://saweria.co/senakids"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.saweriaLink}
                >
                  <Heart size={14} fill="currentColor" />
                  <span>{t("footer.saweriaBtn")}</span>
                  <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <p className={styles.attribution}>{t("footer.rightsAttribution")}</p>
          <p className={styles.copyright}>{t("home.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
