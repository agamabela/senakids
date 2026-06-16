"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--color-muted-foreground)' }}>
      <span>{t('nav.language')}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        style={{
          borderRadius: '999px',
          border: '1px solid var(--color-border)',
          padding: '6px 10px',
          background: 'white',
          color: 'var(--color-text)',
        }}
      >
        <option value="id">ID</option>
        <option value="en">EN</option>
      </select>
    </label>
  );
}
