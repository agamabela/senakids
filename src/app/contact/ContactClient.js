"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./contact.module.css";

const VALID_CATEGORIES = [
  "broken",
  "unsuitable",
  "copyright",
  "data",
  "suggestion",
  "other",
];

function ContactForm() {
  const { t, tx, language } = useLanguage();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "broken",
    message: "",
    website: "", // Honeypot
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle URL preselection (e.g. /contact?category=data or /contact?category=broken)
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && VALID_CATEGORIES.includes(cat)) {
      setFormData((prev) => ({ ...prev, category: cat }));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorText =
          language === "en"
            ? data.errorEn || data.error || "Failed to submit report. Please try again."
            : data.error || "Gagal mengirim laporan. Silakan coba lagi.";
        setErrorMessage(errorText);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setSubmitted(true);
    } catch {
      setErrorMessage(
        language === "en"
          ? "Network error. Please check your connection and try again."
          : "Kesalahan jaringan. Periksa koneksi internet Anda dan coba lagi."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.card}>
      {submitted ? (
        <div className={styles.successBox}>
          <CheckCircle2 size={48} className={styles.successIcon} />
          <h2>{tx("Laporan Berhasil Tersimpan!", "Report Successfully Saved!")}</h2>
          <p>
            {tx(
              "Terima kasih atas laporan dan masukan Anda. Tim pengelola Sena Kids telah menerima laporan ini dan akan meninjaunya dengan cermat demi keamanan anak.",
              "Thank you for your report and feedback. The Sena Kids administration team has received your report and will review it carefully for children's safety."
            )}
          </p>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={() => {
              setSubmitted(false);
              setErrorMessage("");
              setFormData({
                name: "",
                email: "",
                category: "broken",
                message: "",
                website: "",
              });
            }}
          >
            {tx("Kirim Laporan Lain", "Submit Another Report")}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form} noValidate={false}>
          {/* Honeypot field for bot protection */}
          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          {errorMessage && (
            <div className={styles.errorBox} role="alert" aria-live="assertive">
              <AlertTriangle size={20} />
              <div>
                <strong>{tx("Pengiriman Gagal: ", "Submission Failed: ")}</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>
              {t("contact.formName")} *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={100}
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={styles.input}
              placeholder={tx("Nama lengkap Anda", "Your full name")}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              {t("contact.formEmail")} *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={150}
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={styles.input}
              placeholder="nama@email.com"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="category" className={styles.label}>
              {t("contact.formCategory")} *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={styles.select}
            >
              <option value="broken">{t("contact.categoryBroken")}</option>
              <option value="unsuitable">{t("contact.categoryUnsuitable")}</option>
              <option value="copyright">{t("contact.categoryCopyright")}</option>
              <option value="data">{t("contact.categoryData")}</option>
              <option value="suggestion">{t("contact.categorySuggestion")}</option>
              <option value="other">{tx("Lainnya", "Other")}</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="message" className={styles.label}>
              {t("contact.formMessage")} *
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              maxLength={3000}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className={styles.textarea}
              placeholder={tx(
                "Jelaskan masalah, judul video, judul buku, permintaan hapus data, atau masukan Anda...",
                "Explain the issue, video title, book title, data deletion request, or suggestion..."
              )}
            />
          </div>

          <div className={styles.parentNotice}>
            <AlertCircle size={18} />
            <span>
              {tx(
                "Laporan atau pesan Anda tersimpan secara aman di database terenkripsi pengelola Sena Kids untuk ditinjau dan ditindaklanjuti demi menjaga keamanan ekosistem anak.",
                "Your report or message is stored securely in the Sena Kids database for administrator review and action to keep children's learning ecosystem verified."
              )}
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitBtn}
            aria-busy={isSubmitting}
          >
            <Send size={18} />
            <span>{isSubmitting ? t("common.loading") : t("contact.submit")}</span>
          </button>
        </form>
      )}
    </div>
  );
}

export default function ContactPage() {
  const { t, tx } = useLanguage();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/home" className={styles.backBtn} aria-label={t("common.back")}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <div className={styles.badge}>
            <MessageSquare size={16} />
            <span>{tx("Bantuan & Moderasi Konten", "Support & Content Moderation")}</span>
          </div>
          <h1 className={styles.title}>{t("contact.title")}</h1>
          <p className={styles.subtitle}>{t("contact.subtitle")}</p>
        </div>
      </div>

      <Suspense fallback={<div className={styles.card}><p>{tx("Memuat formulir...", "Loading form...")}</p></div>}>
        <ContactForm />
      </Suspense>
    </div>
  );
}
