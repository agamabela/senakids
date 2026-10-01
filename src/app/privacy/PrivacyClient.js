"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./privacy.module.css";

export default function PrivacyPage() {
  const { t, tx } = useLanguage();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/home" className={styles.backBtn} aria-label={t("common.back")}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <div className={styles.badge}>
            <Shield size={16} />
            <span>{tx("Perlindungan Data Keluarga", "Family Data Protection")}</span>
          </div>
          <h1 className={styles.title}>{t("privacy.title")}</h1>
          <p className={styles.subtitle}>{t("privacy.subtitle")}</p>
          <span className={styles.date}>{t("privacy.lastUpdated")}</span>
        </div>
      </div>

      <div className={styles.legalBanner}>
        <CheckCircle2 size={20} className={styles.bannerIcon} />
        <div>
          <strong>{tx("Prinsip Utama Privasi Anak", "Core Children's Privacy Principle")}</strong>
          <p>{t("privacy.summary")}</p>
        </div>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2>{t("privacy.section1Title")}</h2>
          <p>{t("privacy.section1Body")}</p>
        </section>

        <section className={styles.section}>
          <h2>{t("privacy.section2Title")}</h2>
          <p>{t("privacy.section2Body")}</p>
        </section>

        <section className={styles.section}>
          <h2>{t("privacy.section3Title")}</h2>
          <p>{t("privacy.section3Body")}</p>
        </section>

        <section className={styles.section}>
          <h2>{t("privacy.section4Title")}</h2>
          <p>{t("privacy.section4Body")}</p>
        </section>

        <section className={styles.section}>
          <h2>{t("privacy.section5Title")}</h2>
          <p>{t("privacy.section5Body")}</p>
        </section>

        <div className={styles.contactCard}>
          <h3>{tx("Pertanyaan atau Permintaan Privasi?", "Questions or Privacy Inquiries?")}</h3>
          <p>
            {tx(
              "Orang tua atau wali dapat menghubungi kontak privasi kami langsung di ",
              "Parents or guardians can reach out directly to our privacy desk at "
            )}
            <a href="mailto:privacy@senakids.web.id" className={styles.emailLink}>
              privacy@senakids.web.id
            </a>
            {tx(
              " atau melalui formulir laporan konten kami.",
              " or via our content reporting form."
            )}
          </p>
          <Link href="/contact" className={styles.contactBtn}>
            {t("home.contact")}
          </Link>
        </div>
      </div>
    </div>
  );
}
