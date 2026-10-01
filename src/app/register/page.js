"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, UserPlus, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./register.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const { t, tx } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Parental verification state
  const [parentConsent, setParentConsent] = useState(false);
  const [mathAnswer, setMathAnswer] = useState("");
  // Simple fixed arithmetic question for adult gate (8 + 7 = 15)
  const num1 = 8;
  const num2 = 7;
  const expectedSum = 15;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Parental gate verification
    if (!parentConsent) {
      setError(t("parentalGate.consentRequired"));
      return;
    }

    if (parseInt(mathAnswer, 10) !== expectedSum) {
      setError(t("parentalGate.mathError"));
      return;
    }

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    if (formData.password.length < 8) {
      setError(t("auth.passwordMinLength"));
      return;
    }

    const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password);
    const hasLetter = /[a-zA-Z]/.test(formData.password);
    if (!hasNumberOrSymbol || !hasLetter) {
      setError(tx(
        "Kata sandi harus mengandung kombinasi huruf dan angka/simbol",
        "Password must contain a mix of letters and numbers/symbols"
      ));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          parentalConfirmed: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("auth.genericError"));
        return;
      }

      // Registration successful, redirect to login
      router.push("/login?registered=true");
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
          <h1 className={styles.title}>{t("auth.registerTitle")}</h1>
          <p className={styles.subtitle}>{t("auth.registerSubtitle")}</p>
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
            <label htmlFor="name" className={styles.label}>
              <User size={16} />
              {t("auth.nameLabel")}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
              placeholder={t("auth.namePlaceholder")}
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              <Mail size={16} />
              {t("auth.emailLabel")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder={t("auth.emailPlaceholder")}
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              <Lock size={16} />
              {t("auth.passwordLabel")}
            </label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
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

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              <Lock size={16} />
              {t("auth.confirmPasswordLabel")}
            </label>
            <div className={styles.passwordWrapper}>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={styles.input}
                placeholder={t("auth.confirmPasswordPlaceholder")}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={styles.eyeButton}
                disabled={isLoading}
                tabIndex={-1}
                aria-label={showConfirmPassword ? "Sembunyikan password" : "Lihat password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Parental Gate Box */}
          <div className={styles.parentalGateBox}>
            <div className={styles.gateHead}>
              <Shield size={18} color="var(--color-primary)" />
              <strong>{t("parentalGate.title")}</strong>
            </div>
            <p className={styles.gateExplain}>{t("parentalGate.explanation")}</p>
            
            <div className={styles.mathChallenge}>
              <label htmlFor="mathAnswer" className={styles.mathLabel}>
                {t("parentalGate.mathQuestion", { num1, num2 })}
              </label>
              <input
                id="mathAnswer"
                type="number"
                required
                value={mathAnswer}
                onChange={(e) => setMathAnswer(e.target.value)}
                className={styles.mathInput}
                placeholder={t("parentalGate.mathPlaceholder")}
                disabled={isLoading}
              />
            </div>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                required
                checked={parentConsent}
                onChange={(e) => setParentConsent(e.target.checked)}
                className={styles.checkbox}
                disabled={isLoading}
              />
              <span>{t("parentalGate.consentAffirmation")}</span>
            </label>

            <div className={styles.legalNotice}>
              <AlertCircle size={14} />
              <span>{t("parentalGate.legalReviewNote")}</span>
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
                <UserPlus size={20} />
                {t("auth.submitRegister")}
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            {t("auth.haveAccount")}{" "}
            <Link href="/login" className={styles.link}>
              {t("auth.loginHere")}
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
