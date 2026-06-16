import { getBooks } from "@/app/admin/actions";
import BooksClient from "./BooksClient";

export default async function BooksPage() {
  const books = await getBooks();
  
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
