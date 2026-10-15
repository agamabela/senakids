import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog-posts.mjs";
import { getSiteUrl } from "@/lib/site-url";
import styles from "./page.module.css";

const siteUrl = getSiteUrl();

export const metadata = {
  title: "Panduan Orang Tua untuk Belajar & Bermain Anak",
  description:
    "Panduan praktis Sena Kids untuk membaca bersama, aktivitas anak di rumah, permainan edukasi, worksheet, dan waktu layar yang seimbang.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Panduan Orang Tua | Sena Kids",
    description:
      "Ide membaca, bermain, dan belajar bersama anak di rumah.",
    url: `${siteUrl}/blog`,
    images: [{ url: "/asset.png", width: 1200, height: 630, alt: "Sena Kids untuk keluarga" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/asset.png"],
  },
};

function formattedDate(date) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }).format(
    new Date(`${date}T00:00:00+07:00`)
  );
}

export default function BlogPage() {
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Panduan Orang Tua Sena Kids",
    description: metadata.description,
    url: `${siteUrl}/blog`,
    inLanguage: "id-ID",
    isPartOf: { "@type": "WebSite", name: "Sena Kids", url: siteUrl },
    hasPart: BLOG_POSTS.map((post) => ({
      "@type": "Article",
      headline: post.title,
      url: `${siteUrl}/blog/${post.slug}`,
      datePublished: post.datePublished,
    })),
  };

  const [featuredPost, ...posts] = BLOG_POSTS;

  return (
    <div className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Untuk keluarga</p>
        <h1>Panduan kecil untuk belajar bersama</h1>
        <p>
          Bacaan praktis untuk membantu orang tua memilih kegiatan membaca, bermain, membuat karya, dan menikmati waktu layar dengan tujuan yang jelas.
        </p>
      </header>

      <section className={styles.featured} aria-labelledby="pilihan-utama">
        <div className={styles.featuredLead}>
          <p className={styles.category}>{featuredPost.category}</p>
          <h2 id="pilihan-utama">{featuredPost.title}</h2>
          <p>{featuredPost.description}</p>
          <Link href={`/blog/${featuredPost.slug}`} className={styles.primaryLink}>
            Baca panduan ini
          </Link>
        </div>
        <aside className={styles.featuredNote} aria-label="Tentang panduan Sena Kids">
          <strong>Mulai dari yang dekat.</strong>
          <p>Setiap panduan menghubungkan satu pertanyaan keluarga dengan kegiatan yang memang tersedia di Sena Kids.</p>
        </aside>
      </section>

      <section className={styles.articleSection} aria-labelledby="semua-panduan">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Bacaan berikutnya</p>
          <h2 id="semua-panduan">Pilih yang paling berguna hari ini</h2>
        </div>
        <div className={styles.articleGrid}>
          {posts.map((post) => (
            <article key={post.slug} className={styles.articleCard}>
              <p className={styles.category}>{post.category}</p>
              <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
              <p>{post.description}</p>
              <div className={styles.cardFooter}>
                <time dateTime={post.datePublished}>{formattedDate(post.datePublished)}</time>
                <Link href={`/blog/${post.slug}`} className={styles.textLink}>Baca artikelnya</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
