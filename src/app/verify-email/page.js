"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "../login/login.module.css";

function VerifyEmailContent() {
  const { t, tx } = useLanguage();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg(tx("Token verifikasi tidak ditemukan.", "Verification token missing."));
      return;
    }

    const doVerify = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMsg(data.error || t("auth.verifyFailed"));
        }
      } catch (err) {
        setStatus("error");
        setErrorMsg(t("auth.genericError"));
      }
    };

    doVerify();
  }, [token, t, tx]);

  return (
    <div style={{ textAlign: "center", padding: "16px 0" }}>
      {status === "verifying" && (
        <p style={{ color: "var(--color-text-muted)" }}>{t("common.loading")}</p>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 size={48} color="var(--color-primary)" style={{ margin: "0 auto 12px" }} />
          <h2 style={{ fontFamily: "var(--font-family-heading)", fontSize: "20px", color: "var(--color-text-heading)", marginBottom: "8px" }}>
            {tx("Email Terverifikasi!", "Email Verified!")}
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "24px" }}>
            {t("auth.verifySuccess")}
          </p>
          <Link href="/login" className={styles.submitButton} style={{ textDecoration: "none", display: "inline-flex" }}>
            {t("auth.submitLogin")}
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <AlertCircle size={48} color="#DC2626" style={{ margin: "0 auto 12px" }} />
          <h2 style={{ fontFamily: "var(--font-family-heading)", fontSize: "20px", color: "var(--color-text-heading)", marginBottom: "8px" }}>
            {tx("Gagal Verifikasi", "Verification Failed")}
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "24px" }}>
            {errorMsg || t("auth.verifyFailed")}
          </p>
          <Link href="/login" className={styles.submitButton} style={{ textDecoration: "none", display: "inline-flex" }}>
            {t("auth.submitLogin")}
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
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
          <h1 className={styles.title}>{t("auth.verifyTitle")}</h1>
          <p className={styles.subtitle}>{t("auth.verifySubtitle")}</p>
        </div>

        <Suspense fallback={<div style={{ textAlign: "center", padding: "20px" }}>{t("common.loading")}</div>}>
          <VerifyEmailContent />
        </Suspense>
      </motion.div>
    </div>
  );
}
