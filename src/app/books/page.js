import { getBooks } from "@/app/admin/actions";
import { LETS_READ_STORIES, INTERACTIVE_LEARNING_BOOKS } from "@/lib/content-registry";
import { getLetsReadBooks } from "@/lib/letsread-api";
import workbooksData from "@/data/workbooks.json";
import BooksClient from "./BooksClient";

export const revalidate = 3600; // Auto revalidate page every 1 hour

export const metadata = {
  title: "Perpustakaan Buku Anak - Cerita & Belajar",
  description:
    "Koleksi lengkap buku cerita bergambar Let's Read Asia, portal buku Kemendikdasmen, petualangan membaca, dan ensiklopedia interaktif cilik tanpa iklan.",
  alternates: {
    canonical: "/books",
  },
  openGraph: {
    title: "Perpustakaan Buku Anak - Cerita & Belajar",
    description: "Baca buku cerita bergambar dan belajar interaktif anak gratis dan ramah keluarga.",
    url: "https://senakids.web.id/books",
  },
};

const EDUCATIONAL_PORTALS = [
  {
    id: "portal-letsread",
    title: "Let's Read",
    subtitle: "Perpustakaan Cerita Anak Asia",
    description: "Ribuan buku cerita anak bergambar gratis dalam berbagai bahasa dari The Asia Foundation.",
    href: "https://www.letsreadasia.org/",
    image: "/images/books/portal-letsread.svg",
    external: true,
  },
  {
    id: "portal-nonteks",
    title: "Buku Nonteks",
    subtitle: "Katalog Buku Kemendikdasmen",
    description: "Koleksi buku pengayaan dan literasi resmi Kementerian Pendidikan Dasar dan Menengah.",
    href: "https://buku.kemendikdasmen.go.id/katalog/buku-non-teks",
    image: "/images/books/portal-kemendikdasmen.svg",
    external: true,
  },
  {
    id: "portal-budi",
    title: "Budi Kemendikdasmen",
    subtitle: "Katalog Buku Kemendikdasmen",
    description: "Buku digital interaktif untuk PAUD, SD, dan jenjang pendidikan dasar Indonesia.",
    href: "https://budi.kemendikdasmen.go.id/buku?tipe=2fd97285-08d0-4d81-83f2-582f0e8b0f36",
    image: "/images/books/portal-budi.svg",
    external: true,
  },
];

export default async function BooksPage() {
  let dbBooks = [];
  try {
    dbBooks = await getBooks();
  } catch (e) {
    dbBooks = [];
  }

  let liveLetsReadBooks = [];
  try {
    liveLetsReadBooks = await getLetsReadBooks();
  } catch (e) {
    liveLetsReadBooks = [];
  }

  return (
    <BooksClient
      stories={LETS_READ_STORIES}
      interactiveBooks={INTERACTIVE_LEARNING_BOOKS}
      dbBooks={dbBooks}
      portals={EDUCATIONAL_PORTALS}
      liveLetsReadBooks={liveLetsReadBooks}
      workbooks={workbooksData || []}
    />
  );
}
