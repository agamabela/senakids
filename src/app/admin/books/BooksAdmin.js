"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { createBook, deleteBook, updateBook } from "../actions";

async function uploadPdfFile(file) {
  const uploadData = new FormData();
  uploadData.append("pdf", file);
  const res = await fetch("/api/upload", {
    method: "POST",
    body: uploadData,
  });
  if (!res.ok) {
    throw new Error("PDF upload failed");
  }
  return (await res.json()).url;
}

export default function BooksAdmin({ initialBooks }) {
  const { t } = useLanguage();
  const [books, setBooks] = useState(initialBooks);
  const [isAdding, setIsAdding] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  async function handleDelete(id) {
    if (confirm(t("admin.deleteBookConfirm"))) {
      await deleteBook(id);
      setBooks(books.filter((b) => b.id !== id));
    }
  }

  function handleEdit(book) {
    setEditingBook(book);
    setIsAdding(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    let pdfUrl = editingBook?.pdfUrl || null;
    const pdfFile = formData.get("pdf");

    if (pdfFile && pdfFile.size) {
      pdfUrl = await uploadPdfFile(pdfFile);
    }

    const payload = {
      title: formData.get("title"),
      description: formData.get("description"),
      emoji: formData.get("emoji"),
      color: formData.get("color"),
      shelf: formData.get("shelf"),
      pdfUrl,
      href: "/books",
    };

    if (editingBook) {
      const updatedBook = await updateBook(editingBook.id, payload);
      setBooks(books.map((b) => (b.id === updatedBook.id ? updatedBook : b)));
      setEditingBook(null);
    } else {
      const createdBook = await createBook(payload);
      setBooks([createdBook, ...books]);
    }

    setIsAdding(false);
    e.target.reset();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem" }}>{t("admin.manageBooks")}</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", backgroundColor: "var(--color-primary)", color: "white", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}
        >
          <Plus size={18} /> {t("admin.addNewBook")}
        </button>
      </div>

      {isAdding && (
        <form
          key={editingBook?.id ?? "new-book"}
          onSubmit={handleSubmit}
          style={{ backgroundColor: "white", padding: "24px", borderRadius: "16px", border: "1.5px solid var(--color-border)", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <h3>{editingBook ? t("admin.editBook") : t("admin.addNewBook")}</h3>
          <input name="title" placeholder={t("admin.titlePlaceholder")} defaultValue={editingBook?.title || ""} required style={inputStyle} />
          <input name="description" placeholder={t("admin.descriptionPlaceholder")} defaultValue={editingBook?.description || ""} required style={inputStyle} />
          <input name="emoji" placeholder={t("admin.emojiPlaceholder")} defaultValue={editingBook?.emoji || ""} required style={inputStyle} />
          <input name="shelf" placeholder={t("admin.zonePlaceholder")} defaultValue={editingBook?.shelf || ""} required style={inputStyle} />
          <input name="pdf" type="file" accept="application/pdf" style={inputStyle} />
          {editingBook?.pdfUrl && (
            <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--color-muted-foreground)" }}>
              {t("admin.currentPdf")} : <a href={editingBook.pdfUrl} target="_blank" rel="noreferrer" style={{ color: "var(--color-primary)", textDecoration: "underline" }}>{t("admin.openPdf")}</a>
            </p>
          )}
          <select name="color" required defaultValue={editingBook?.color || "green"} style={inputStyle}>
            <option value="green">Green</option>
            <option value="pink">Pink</option>
            <option value="purple">Purple</option>
            <option value="blue">Blue</option>
            <option value="orange">Orange</option>
            <option value="yellow">Yellow</option>
            <option value="teal">Teal</option>
          </select>
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            {editingBook && (
              <button type="button" onClick={() => { setEditingBook(null); setIsAdding(false); }} style={{ padding: "12px", backgroundColor: "#E5E7EB", color: "#111827", border: "none", borderRadius: "8px", cursor: "pointer" }}>{t("admin.cancel")}</button>
            )}
            <button type="submit" style={{ padding: "12px", backgroundColor: "var(--color-primary)", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
              {editingBook ? t("admin.updateBook") : t("admin.saveBook")}
            </button>
          </div>
        </form>
      )}

      <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1.5px solid var(--color-border)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ backgroundColor: "var(--color-muted)", borderBottom: "1.5px solid var(--color-border)" }}>
            <tr>
              <th style={thStyle}>{t("admin.emoji")}</th>
              <th style={thStyle}>{t("admin.title")}</th>
              <th style={thStyle}>{t("admin.shelf")}</th>
              <th style={thStyle}>{t("admin.pdf")}</th>
              <th style={thStyle}>{t("admin.color")}</th>
              <th style={thStyle}>{t("admin.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={tdStyle}>{book.emoji}</td>
                <td style={tdStyle}><strong>{book.title}</strong><br/><small style={{ color: 'gray' }}>{book.description}</small></td>
                <td style={tdStyle}>{book.shelf}</td>
                <td style={tdStyle}>
                  {book.pdfUrl ? (
                    <a href={book.pdfUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>{t("admin.viewPdf")}</a>
                  ) : (
                    <span style={{ color: 'var(--color-muted-foreground)' }}>{t("admin.noPdf")}</span>
                  )}
                </td>
                <td style={tdStyle}>{book.color}</td>
                <td style={tdStyle}>
                  <button onClick={() => handleEdit(book)} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', marginRight: '12px' }}><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(book.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' };
const thStyle = { padding: '16px', fontWeight: '600', color: 'var(--color-muted-foreground)' };
const tdStyle = { padding: '16px' };
