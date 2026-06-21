"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import styles from "./login.module.css";

function LoginForm() {
  const router = useRouter();
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
      const callbackUrl = searchParams.get("callbackUrl") || "/games";
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        // surface the real error code so we can diagnose production issues
        setError(`Gagal masuk (${result.error}). Periksa email/password.`);
      } else if (result?.ok || result?.url) {
        // hard navigation so the new session cookie is picked up immediately
        window.location.href = result?.url || callbackUrl;
      } else {
        setError("Gagal masuk. Coba lagi.");
      }
    } catch (error) {
      setError(`Terjadi kesalahan: ${error?.message || "coba lagi"}`);
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
        transition={{ duration: 0.4 }}
      >
        <div className={styles.header}>
          <div className={styles.logo}>🌿</div>
          <h1 className={styles.title}>Masuk ke Sena Kids</h1>
          <p className={styles.subtitle}>Selamat datang kembali!</p>
        </div>

        {error && (
          <motion.div
            className={styles.error}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              <Mail size={16} />
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="nama@email.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              <Lock size={16} />
              Password
            </label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeButton}
                disabled={isLoading}
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
                Masuk
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Belum punya akun?{" "}
            <Link href="/register" className={styles.link}>
              Daftar sekarang
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.container}><div className={styles.card}><div className={styles.header}><div className={styles.logo}>🌿</div><h1 className={styles.title}>Memuat...</h1></div></div></div>}>
      <LoginForm />
    </Suspense>
  );
}
