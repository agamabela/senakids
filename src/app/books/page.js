import { getBooks } from "@/app/admin/actions";
import BooksClient from "./BooksClient";

export const dynamic = "force-dynamic";

export default async function BooksPage() {
  let books = [];
  try {
    books = await getBooks();
  } catch (e) {
    books = [];
  }

  // Group books by shelf
  const shelvesMap = {};
  books.forEach(book => {
    if (!shelvesMap[book.shelf]) shelvesMap[book.shelf] = [];
    shelvesMap[book.shelf].push(book);
  });

  const shelves = Object.keys(shelvesMap).map(title => ({
    title,
    books: shelvesMap[title]
  }));

  return <BooksClient shelves={shelves} />;
}
