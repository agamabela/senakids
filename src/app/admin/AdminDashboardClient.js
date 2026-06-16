"use client";

import { Book, Gamepad2, Tv } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export default function AdminDashboardClient({ bookCount, gameCount, videoCount }) {
  const { t } = useLanguage();

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '24px' }}>{t("admin.overview")}</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        
        <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '16px', border: '1.5px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Book size={24} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{bookCount}</div>
            <div style={{ color: 'var(--color-muted-foreground)' }}>{t("admin.totalBooks")}</div>
          </div>
        </div>

        <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '16px', border: '1.5px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-pink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Gamepad2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{gameCount}</div>
            <div style={{ color: 'var(--color-muted-foreground)' }}>{t("admin.totalGames")}</div>
          </div>
        </div>

        <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '16px', border: '1.5px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tv size={24} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{videoCount}</div>
            <div style={{ color: 'var(--color-muted-foreground)' }}>{t("admin.totalVideos")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
