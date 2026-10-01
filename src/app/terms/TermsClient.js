"use client";

import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "../privacy/privacy.module.css";

export default function TermsPage() {
  const { t, tx } = useLanguage();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/home" className={styles.backBtn} aria-label={t("common.back")}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <div className={styles.badge}>
            <FileText size={16} />
            <span>{tx("Ketentuan Layanan", "Terms of Service")}</span>
          </div>
          <h1 className={styles.title}>{t("terms.title")}</h1>
          <p className={styles.subtitle}>{t("terms.subtitle")}</p>
          <span className={styles.date}>{t("terms.lastUpdated")}</span>
        </div>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2>{t("terms.section1Title")}</h2>
          <p>{t("terms.section1Body")}</p>
        </section>

        <section className={styles.section}>
          <h2>{t("terms.section2Title")}</h2>
          <p>{t("terms.section2Body")}</p>
        </section>

        <section className={styles.section}>
          <h2>{t("terms.section3Title")}</h2>
          <p>{t("terms.section3Body")}</p>
        </section>

        <section className={styles.section}>
          <h2>{t("terms.section4Title")}</h2>
          <p>{t("terms.section4Body")}</p>
        </section>

        <div className={styles.contactCard}>
          <h3>{tx("Perlu Klarifikasi atau Bantuan?", "Need Clarification or Help?")}</h3>
          <p>
            {tx(
              "Silakan hubungi kami untuk informasi lebih lanjut mengenai lisensi atau penggunaan di sekolah.",
              "Please contact us for further information regarding licensing or classroom usage."
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
