"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle2, Shield } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "../login/login.module.css";

export default function ForgotPasswordPage() {
  const { t, tx } = useLanguage();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("auth.genericError"));
      } else {
        setMessage(data.message || t("auth.resetEmailSent"));
      }
    } catch (err) {
      setError(t("auth.genericError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.header}>
          <div className={styles.logo}>🌿</div>
          <h1 className={styles.title}>{t("auth.forgotTitle")}</h1>
          <p className={styles.subtitle}>{t("auth.forgotSubtitle")}</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {message ? (
          <div className={styles.successBox} style={{ textAlign: "center", padding: "16px 0" }}>
            <CheckCircle2 size={40} color="var(--color-primary)" style={{ margin: "0 auto 12px" }} />
            <p style={{ color: "var(--color-text)", fontSize: "15px", lineHeight: "1.5" }}>{message}</p>
            <div style={{ marginTop: "24px" }}>
              <Link href="/login" className={styles.submitButton} style={{ textDecoration: "none", display: "inline-flex" }}>
                <ArrowLeft size={18} />
                {tx("Kembali ke Masuk", "Back to Log In")}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                <Mail size={16} />
                {t("auth.emailLabel")}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder={t("auth.emailPlaceholder")}
                disabled={isLoading}
              />
            </div>

            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? t("common.loading") : t("auth.submitForgot")}
            </button>

            <div className={styles.footer} style={{ marginTop: "16px" }}>
              <Link href="/login" className={styles.link} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <ArrowLeft size={16} />
                {tx("Kembali ke Halaman Masuk", "Back to Log In")}
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
