"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
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
  const [books, setBooks] = useState(initialBooks);
  const [isAdding, setIsAdding] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  async function handleDelete(id) {
    if (confirm("Are you sure you want to delete this book?")) {
      await deleteBook(id);
      setBooks(books.filter(b => b.id !== id));
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
      href: "/books"
    };

    if (editingBook) {
      const updatedBook = await updateBook(editingBook.id, payload);
      setBooks(books.map(b => (b.id === updatedBook.id ? updatedBook : b)));
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem' }}>Manage Books</h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <Plus size={18} /> Add New Book
        </button>
      </div>

      {isAdding && (
        <form key={editingBook?.id ?? 'new-book'} onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1.5px solid var(--color-border)', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3>{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
          <input name="title" placeholder="Title (e.g. Si Kancil)" defaultValue={editingBook?.title || ''} required style={inputStyle} />
          <input name="description" placeholder="Description" defaultValue={editingBook?.description || ''} required style={inputStyle} />
          <input name="emoji" placeholder="Emoji (e.g. 🦌)" defaultValue={editingBook?.emoji || ''} required style={inputStyle} />
          <input name="shelf" placeholder="Shelf (e.g. Dongeng Sebelum Tidur 🌙)" defaultValue={editingBook?.shelf || ''} required style={inputStyle} />
          <input name="pdf" type="file" accept="application/pdf" style={inputStyle} />
          {editingBook?.pdfUrl && (
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-muted-foreground)' }}>
              Current PDF: <a href={editingBook.pdfUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Open</a>
            </p>
          )}
          <select name="color" required defaultValue={editingBook?.color || 'green'} style={inputStyle}>
            <option value="green">Green</option>
            <option value="pink">Pink</option>
            <option value="purple">Purple</option>
            <option value="blue">Blue</option>
            <option value="orange">Orange</option>
            <option value="yellow">Yellow</option>
            <option value="teal">Teal</option>
          </select>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            {editingBook && (
              <button type="button" onClick={() => { setEditingBook(null); setIsAdding(false); }} style={{ padding: '12px', backgroundColor: '#E5E7EB', color: '#111827', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
            )}
            <button type="submit" style={{ padding: '12px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              {editingBook ? 'Update Book' : 'Save Book'}
            </button>
          </div>
        </form>
      )}

      <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1.5px solid var(--color-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--color-muted)', borderBottom: '1.5px solid var(--color-border)' }}>
            <tr>
              <th style={thStyle}>Emoji</th>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Shelf</th>
              <th style={thStyle}>PDF</th>
              <th style={thStyle}>Color</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={tdStyle}>{book.emoji}</td>
                <td style={tdStyle}><strong>{book.title}</strong><br/><small style={{color:'gray'}}>{book.description}</small></td>
                <td style={tdStyle}>{book.shelf}</td>
                <td style={tdStyle}>
                  {book.pdfUrl ? (
                    <a href={book.pdfUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>View PDF</a>
                  ) : (
                    <span style={{ color: 'var(--color-muted-foreground)' }}>No PDF</span>
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
