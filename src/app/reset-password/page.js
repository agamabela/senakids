"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "../login/login.module.css";

function ResetPasswordForm() {
  const { t, tx } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError(tx("Token pengaturan ulang tidak ditemukan.", "Reset token missing."));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    if (password.length < 8) {
      setError(t("auth.passwordMinLength"));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("auth.genericError"));
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(t("auth.genericError"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <p style={{ color: "var(--color-text)", marginBottom: "16px" }}>
          {tx("Tautan pengaturan ulang kata sandi tidak valid.", "Invalid reset password link.")}
        </p>
        <Link href="/forgot-password" className={styles.submitButton} style={{ textDecoration: "none", display: "inline-flex" }}>
          {tx("Minta Tautan Baru", "Request New Link")}
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <CheckCircle2 size={44} color="var(--color-primary)" style={{ margin: "0 auto 12px" }} />
        <h2 style={{ fontFamily: "var(--font-family-heading)", fontSize: "20px", color: "var(--color-text-heading)", marginBottom: "8px" }}>
          {tx("Berhasil Diperbarui!", "Successfully Updated!")}
        </h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "24px" }}>
          {t("auth.resetSuccess")}
        </p>
        <Link href="/login" className={styles.submitButton} style={{ textDecoration: "none", display: "inline-flex" }}>
          {t("auth.submitLogin")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.inputGroup}>
        <label htmlFor="password" className={styles.label}>
          <Lock size={16} />
          {t("auth.newPasswordLabel")}
        </label>
        <div className={styles.passwordWrapper}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            placeholder={t("auth.passwordPlaceholder")}
            disabled={isLoading}
          />
          <button
            type="button"
            className={styles.eyeButton}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="confirmPassword" className={styles.label}>
          <Lock size={16} />
          {t("auth.confirmPasswordLabel")}
        </label>
        <div className={styles.passwordWrapper}>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={styles.input}
            placeholder={t("auth.confirmPasswordPlaceholder")}
            disabled={isLoading}
          />
        </div>
      </div>

      <button type="submit" className={styles.submitButton} disabled={isLoading}>
        {isLoading ? t("common.loading") : t("auth.submitReset")}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLanguage();

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
          <h1 className={styles.title}>{t("auth.resetTitle")}</h1>
          <p className={styles.subtitle}>{t("auth.resetSubtitle")}</p>
        </div>

        <Suspense fallback={<div style={{ textAlign: "center", padding: "20px" }}>{t("common.loading")}</div>}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
