import { getBooks } from "@/app/admin/actions";
import { LETS_READ_STORIES, INTERACTIVE_LEARNING_BOOKS } from "@/lib/content-registry";
import BooksClient from "./BooksClient";

export const metadata = {
  title: "Perpustakaan Buku Anak - Cerita & Belajar",
  description: "Koleksi lengkap buku cerita bergambar Let's Read Asia, petualangan membaca, dan ensiklopedia interaktif cilik tanpa iklan.",
  alternates: {
    canonical: "/books",
  },
  openGraph: {
    title: "Perpustakaan Buku Anak - Cerita & Belajar",
    description: "Baca buku cerita bergambar dan belajar interaktif anak gratis dan ramah keluarga.",
    url: "https://senakids.web.id/books",
  },
};

export default async function BooksPage() {
  let dbBooks = [];
  try {
    dbBooks = await getBooks();
  } catch (e) {
    dbBooks = [];
  }

  return (
    <BooksClient
      stories={LETS_READ_STORIES}
      interactiveBooks={INTERACTIVE_LEARNING_BOOKS}
      dbBooks={dbBooks}
    />
  );
}
