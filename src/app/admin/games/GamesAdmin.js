"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { createGame, deleteGame } from "../actions";

export default function GamesAdmin({ initialGames }) {
  const { t } = useLanguage();
  const [games, setGames] = useState(initialGames);
  const [isAdding, setIsAdding] = useState(false);

  async function handleDelete(id) {
    if (confirm(t("admin.deleteGameConfirm"))) {
      await deleteGame(id);
      setGames(games.filter((g) => g.id !== id));
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
      gameUrl: formData.get("gameUrl") || null,
      color: formData.get("color"),
      zoneName: formData.get("zoneName"),
    };

    await createGame(newGame);
    window.location.reload();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem" }}>{t("admin.manageGames")}</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", backgroundColor: "var(--color-primary)", color: "white", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}
        >
          <Plus size={18} /> {t("admin.addNewGame")}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} style={{ backgroundColor: "white", padding: "24px", borderRadius: "16px", border: "1.5px solid var(--color-border)", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3>{t("admin.addNewGame")}</h3>
          <input name="title" placeholder={t("admin.titlePlaceholder")} required style={inputStyle} />
          <input name="description" placeholder={t("admin.descriptionPlaceholder")} required style={inputStyle} />
          <input name="emoji" placeholder={t("admin.emojiPlaceholder")} style={inputStyle} />
          <input name="iconName" placeholder={t("admin.iconNamePlaceholder")} style={inputStyle} />
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem' }}>
            {t("admin.gameUrl")}
            <input name="gameUrl" placeholder={t("admin.gameUrlPlaceholder")} style={inputStyle} />
          </label>
          <input name="zoneName" placeholder={t("admin.zonePlaceholder")} required style={inputStyle} />
          <select name="color" required style={inputStyle}>
            <option value="blue">Blue</option>
            <option value="teal">Teal</option>
            <option value="purple">Purple</option>
            <option value="yellow">Yellow</option>
            <option value="orange">Orange</option>
            <option value="pink">Pink</option>
            <option value="green">Green</option>
          </select>
          <button type="submit" style={{ padding: '12px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{t("admin.saveGame")}</button>
        </form>
      )}

      <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1.5px solid var(--color-border)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ backgroundColor: "var(--color-muted)", borderBottom: "1.5px solid var(--color-border)" }}>
            <tr>
              <th style={thStyle}>{t("admin.emoji")}/{t("admin.title")}</th>
              <th style={thStyle}>{t("admin.title")}</th>
              <th style={thStyle}>{t("admin.zonePlaceholder")}</th>
              <th style={thStyle}>URL</th>
              <th style={thStyle}>{t("admin.color")}</th>
              <th style={thStyle}>{t("admin.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={tdStyle}>{game.emoji || game.iconName}</td>
                <td style={tdStyle}><strong>{game.title}</strong><br/><small style={{ color:'gray' }}>{game.description}</small></td>
                <td style={tdStyle}>{game.zoneName}</td>
                <td style={tdStyle}><small style={{ color: 'var(--color-muted-foreground)', wordBreak: 'break-all' }}>{game.gameUrl || "—"}</small></td>
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
