"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Route, Gamepad2, Tv, Book, Sparkles, ArrowRight } from "lucide-react";
import styles from "./ActivityCard.module.css";

const ICONS = { Route, Gamepad2, Tv, Book, Sparkles };

export default function ActivityCard({ title, description, iconName = "Sparkles", emoji, href, color = "blue", delay = 0 }) {
  const IconComponent = ICONS[iconName] || Sparkles;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Link href={href} className={styles.card} style={{ "--activity-accent": `var(--color-${color})` }}>
        <span className={styles.marker} aria-hidden="true">{emoji || <IconComponent size={20} strokeWidth={2.2} />}</span>
        <span className={styles.content}><span className={styles.title}>{title}</span><span className={styles.subtitle}>{description}</span></span>
        <ArrowRight className={styles.arrow} size={20} aria-hidden="true" />
      </Link>
    </motion.div>
  );
}
