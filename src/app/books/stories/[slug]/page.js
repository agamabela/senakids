import { notFound } from "next/navigation";
import { getStoryBySlug, LETS_READ_STORIES } from "@/lib/content-registry";
import { getSiteUrl } from "@/lib/site-url";
import StoryReaderClient from "./StoryReaderClient";

export async function generateStaticParams() {
  return LETS_READ_STORIES.map((story) => ({
    slug: story.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const story = getStoryBySlug(slug);

  if (!story) {
    return {
      title: "Cerita Tidak Ditemukan | Sena Kids",
    };
  }

  const baseUrl = getSiteUrl();
  const canonicalUrl = `${baseUrl}/books/stories/${story.slug}`;

  return {
    title: `${story.title.id} - Buku Cerita Anak`,
    description: story.description.id,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${story.title.id} | Let's Read Asia`,
      description: story.description.id,
      url: canonicalUrl,
      images: [
        {
          url: story.cover,
          width: 800,
          height: 600,
          alt: story.title.id,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: story.title.id,
      description: story.description.id,
      images: [story.cover],
    },
  };
}

export default async function StoryPage({ params }) {
  const { slug } = await params;
  const story = getStoryBySlug(slug);

  if (!story) {
    notFound();
  }

  // JSON-LD structured data for CreativeWork
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": story.title.id,
    "alternateName": story.title.en,
    "description": story.description.id,
    "image": story.cover,
    "author": {
      "@type": "Organization",
      "name": "Let's Read Asia (The Asia Foundation)",
      "url": "https://www.letsreadasia.org",
    },
    "publisher": {
      "@type": "Organization",
      "name": "The Asia Foundation",
    },
    "inLanguage": "id",
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "isAccessibleForFree": true,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StoryReaderClient story={story} />
    </>
  );
}
