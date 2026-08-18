"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '6px', 
        fontSize: '13px', 
        fontWeight: 600,
        color: 'var(--color-text-muted)',
        fontFamily: 'var(--font-family-body)',
        cursor: 'pointer',
      }}
    >
      <span className="sr-only">{t('nav.language')}</span>
      <select
        value={language}
        aria-label={t('nav.language')}
        onChange={(event) => setLanguage(event.target.value)}
        style={{
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--color-border)',
          padding: '8px 12px',
          minHeight: '44px',
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-family-body)',
          fontSize: '13px',
          fontWeight: 700,
          cursor: 'pointer',
          outline: 'none',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all var(--transition-instant)',
        }}
      >
        <option value="id">🇮🇩 ID</option>
        <option value="en">🇬🇧 EN</option>
      </select>
    </label>
  );
}
