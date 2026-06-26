"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Route, Gamepad2, Tv, Book, Sparkles } from "lucide-react";
import styles from "./ActivityCard.module.css";

const ICONS = {
  Route: Route,
  Gamepad2: Gamepad2,
  Tv: Tv,
  Book: Book,
  Sparkles: Sparkles,
};

export default function ActivityCard({
  title,
  description,
  iconName = "Sparkles",
  emoji,
  href,
  color = "blue", // Used for the icon accent color now
  delay = 0,
}) {
  const IconComponent = ICONS[iconName] || ICONS.Sparkles;
  
  // Use a fallback color mapping to standard CSS vars if needed
  const accentColor = `var(--color-${color})`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: delay,
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={href} className={styles.card}>
        <div className={styles.iconArea} style={{ color: accentColor }}>
          {emoji ? (
            <span className={styles.emoji}>{emoji}</span>
          ) : (
            <IconComponent size={64} strokeWidth={1.5} />
          )}
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.subtitle}>{description}</p>
        </div>
      </Link>
    </motion.div>
  );
}
