"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, LogIn, Shield, Heart } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./login.module.css";

function LoginForm() {
  const { t, tx } = useLanguage();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const callbackUrl = searchParams.get("callbackUrl") || "/home";
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        // Generic secure error message
        setError(t("auth.invalidCredentials"));
      } else if (result?.ok || result?.url) {
        window.location.href = result?.url || callbackUrl;
      } else {
        setError(t("auth.invalidCredentials"));
      }
    } catch (err) {
      setError(t("auth.invalidCredentials"));
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
          <h1 className={styles.title}>{t("auth.loginTitle")}</h1>
          <p className={styles.subtitle}>{t("auth.loginSubtitle")}</p>
        </div>

        {error && (
          <motion.div
            className={styles.error}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {error}
          </motion.div>
        )}

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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder={t("auth.emailPlaceholder")}
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label htmlFor="password" className={styles.label}>
                <Lock size={16} />
                {t("auth.passwordLabel")}
              </label>
              <Link href="/forgot-password" className={styles.forgotLink}>
                {t("auth.forgotPasswordLink")}
              </Link>
            </div>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder={t("auth.passwordPlaceholder")}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeButton}
                disabled={isLoading}
                tabIndex={-1}
                aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.loader} />
            ) : (
              <>
                <LogIn size={20} />
                {t("auth.submitLogin")}
              </>
            )}
          </button>
        </form>

        <div className={styles.parentNotice}>
          <Shield size={16} />
          <span>{t("auth.parentNotice")}</span>
        </div>

        <div className={styles.footer}>
          <p>
            {t("auth.noAccount")}{" "}
            <Link href="/register" className={styles.link}>
              {t("auth.registerHere")}
            </Link>
          </p>
          <div className={styles.footerLinks}>
            <Link href="/privacy">{t("home.privacy")}</Link>
            <span>•</span>
            <Link href="/terms">{t("home.terms")}</Link>
            <span>•</span>
            <Link href="/parents">{t("home.parents")}</Link>
            <span>•</span>
            <Link href="/contact">{t("home.contact")}</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "40px" }}>{t("common.loading")}</div>}>
      <LoginForm />
    </Suspense>
  );
}
