import { NextResponse } from "next/server";
import { getLetsReadBooks } from "@/lib/letsread-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const books = await getLetsReadBooks();
    return NextResponse.json({
      success: true,
      total: books.length,
      books,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal memuat buku Let's Read Asia" },
      { status: 500 }
    );
  }
}
