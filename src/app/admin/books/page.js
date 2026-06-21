import { getBooks } from "../actions";
import BooksAdmin from "./BooksAdmin";

export const dynamic = "force-dynamic";

export default async function BooksPage() {
  let books = [];
  try {
    books = await getBooks();
  } catch (e) {
    books = [];
  }
  return <BooksAdmin initialBooks={books} />;
}
