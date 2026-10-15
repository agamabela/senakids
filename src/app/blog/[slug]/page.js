import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog-posts.mjs";
import { getSiteUrl } from "@/lib/site-url";
import styles from "./page.module.css";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) return { title: "Artikel Tidak Ditemukan" };

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonicalUrl,
      images: [{ url: "/asset.png", width: 1200, height: 630, alt: "Sena Kids untuk keluarga" }],
      type: "article",
      publishedTime: post.datePublished,
    },
    twitter: { card: "summary_large_image", images: ["/asset.png"] },
  };
}

function formattedDate(date) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }).format(
    new Date(`${date}T00:00:00+07:00`)
  );
}

export default async function BlogArticlePage({ params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.datePublished,
    dateModified: post.datePublished,
    inLanguage: "id-ID",
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    image: `${siteUrl}/asset.png`,
    publisher: { "@type": "Organization", name: "Sena Kids", url: siteUrl, logo: `${siteUrl}/sena-logo.svg` },
  };

  return (
    <article className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <header className={styles.header}>
        <Link href="/blog" className={styles.backLink}>Kembali ke panduan orang tua</Link>
        <p className={styles.category}>{post.category}</p>
        <h1>{post.title}</h1>
        <p className={styles.intro}>{post.intro}</p>
        <time className={styles.date} dateTime={post.datePublished}>Diterbitkan {formattedDate(post.datePublished)}</time>
      </header>

      <div className={styles.content}>
        {post.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ))}
      </div>

      <aside className={styles.nextSteps} aria-labelledby="lanjut-di-sena-kids">
        <p className={styles.category}>Lanjut di Sena Kids</p>
        <h2 id="lanjut-di-sena-kids">Coba bersama anak</h2>
        <ul>
          {post.relatedLinks.map((link) => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}
        </ul>
      </aside>
    </article>
  );
}
