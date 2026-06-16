"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createGame, deleteGame } from "../actions";

export default function GamesAdmin({ initialGames }) {
  const [games, setGames] = useState(initialGames);
  const [isAdding, setIsAdding] = useState(false);

  async function handleDelete(id) {
    if (confirm("Are you sure you want to delete this game?")) {
      await deleteGame(id);
      setGames(games.filter(g => g.id !== id));
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newGame = {
      title: formData.get("title"),
      description: formData.get("description"),
      emoji: formData.get("emoji") || null,
      iconName: formData.get("iconName") || null,
      color: formData.get("color"),
      zoneName: formData.get("zoneName"),
      href: "/games"
    };
    
    await createGame(newGame);
    window.location.reload(); 
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem' }}>Manage Games</h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <Plus size={18} /> Add New Game
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1.5px solid var(--color-border)', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3>Add New Game</h3>
          <input name="title" placeholder="Title (e.g. Memory Match)" required style={inputStyle} />
          <input name="description" placeholder="Description" required style={inputStyle} />
          <input name="emoji" placeholder="Emoji (e.g. ⭐) - Optional" style={inputStyle} />
          <input name="iconName" placeholder="Lucide Icon Name (e.g. Puzzle) - Optional" style={inputStyle} />
          <input name="zoneName" placeholder="Zone (e.g. Zona Puzzle 🧩)" required style={inputStyle} />
          <select name="color" required style={inputStyle}>
            <option value="blue">Blue</option>
            <option value="teal">Teal</option>
            <option value="purple">Purple</option>
            <option value="yellow">Yellow</option>
            <option value="orange">Orange</option>
            <option value="pink">Pink</option>
            <option value="green">Green</option>
          </select>
          <button type="submit" style={{ padding: '12px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Save Game</button>
        </form>
      )}

      <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1.5px solid var(--color-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--color-muted)', borderBottom: '1.5px solid var(--color-border)' }}>
            <tr>
              <th style={thStyle}>Icon/Emoji</th>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Zone</th>
              <th style={thStyle}>Color</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {games.map(game => (
              <tr key={game.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={tdStyle}>{game.emoji || game.iconName}</td>
                <td style={tdStyle}><strong>{game.title}</strong><br/><small style={{color:'gray'}}>{game.description}</small></td>
                <td style={tdStyle}>{game.zoneName}</td>
                <td style={tdStyle}>{game.color}</td>
                <td style={tdStyle}>
                  <button onClick={() => handleDelete(game.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
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
