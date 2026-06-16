import { getBooks } from "../actions";
import BooksAdmin from "./BooksAdmin";

export default async function BooksPage() {
  const books = await getBooks();
  return <BooksAdmin initialBooks={books} />;
}
