"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bike,
  BookOpen,
  CloudRain,
  Compass,
  Gamepad2,
  Music2,
  Palette,
  Route,
  Shapes,
} from "lucide-react";
import styles from "./ActivityCard.module.css";

const ICONS = { Route, Gamepad2, Bike, BookOpen, CloudRain, Compass, Music2, Palette, Shapes };

export default function ActivityCard({ title, description, iconName = "Gamepad2", image, href, color = "blue" }) {
  const IconComponent = ICONS[iconName] || Gamepad2;
  return (
    <Link href={href} className={styles.card} style={{ "--activity-accent": `var(--color-${color})` }}>
      <span className={styles.marker} aria-hidden="true">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className={styles.markerImage} />
        ) : (
          <IconComponent size={22} strokeWidth={2.2} />
        )}
      </span>
      <span className={styles.content}>
        <span className={styles.title}>{title}</span>
        <span className={styles.subtitle}>{description}</span>
      </span>
      <ArrowRight className={styles.arrow} size={20} aria-hidden="true" />
    </Link>
  );
}
