"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { addScreenTime, isBreakDue } from "@/lib/screen-time.mjs";
import styles from "./ScreenTimeReminder.module.css";

const USAGE_KEY = "senakids_screen_usage";
const localDay = () => new Date().toLocaleDateString("en-CA");

export default function ScreenTimeReminder() {
  const { tx } = useLanguage();
  const [due, setDue] = useState(false);
  const usage = useRef(null);
  useEffect(() => {
    let minutes = 0;
    let last = Date.now();
    const sync = () => {
      try {
        const selected = Number(localStorage.getItem("senakids_screen_timer"));
        minutes = [15, 30, 45, 60].includes(selected) ? selected : 0;
        usage.current = JSON.parse(localStorage.getItem(USAGE_KEY) || "null");
      } catch { minutes = 0; }
      last = Date.now();
      if (!minutes) setDue(false);
    };
    const tick = () => {
      const now = Date.now();
      const elapsed = Math.min((now - last) / 1000, 10);
      last = now;
      if (!minutes) return;
      usage.current = addScreenTime(usage.current, localDay(), elapsed, !document.hidden);
      if (isBreakDue(usage.current, minutes)) {
        usage.current.notified = true;
        setDue(true);
      }
      try { localStorage.setItem(USAGE_KEY, JSON.stringify(usage.current)); } catch {}
    };
    sync();
    const interval = setInterval(tick, 1000);
    const visibility = () => { last = Date.now(); };
    window.addEventListener("senakids:timer", sync);
    window.addEventListener("storage", sync);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      clearInterval(interval);
      window.removeEventListener("senakids:timer", sync);
      window.removeEventListener("storage", sync);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  if (!due) return null;
  return <aside className={styles.reminder} role="alert" aria-label={tx("Pengingat istirahat", "Break reminder")}>
    <strong>{tx("Saatnya istirahat sebentar", "Time for a little break")}</strong>
    <p>{tx("Waktu layar yang dipilih sudah tercapai. Ajak anak bergerak, minum air, atau membaca bersama tanpa layar.", "Your chosen screen time has been reached. Stretch, drink water, or read together away from the screen.")}</p>
    <button type="button" onClick={() => setDue(false)}>{tx("Tutup pengingat", "Dismiss reminder")}</button>
  </aside>;
}
