"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { createVideo, deleteVideo, updateVideo } from "../actions";

export default function TvAdmin({ initialVideos }) {
  const { t } = useLanguage();
  const [videos, setVideos] = useState(initialVideos);
  const [isAdding, setIsAdding] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);

  async function handleDelete(id) {
    if (confirm(t("admin.deleteVideoConfirm"))) {
      await deleteVideo(id);
      setVideos(videos.filter((v) => v.id !== id));
    }
  }

  function handleEdit(video) {
    setEditingVideo(video);
    setIsAdding(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      title: formData.get("title"),
      duration: formData.get("duration"),
      category: formData.get("category"),
      color: formData.get("color"),
      url: formData.get("url") || null,
    };

    if (editingVideo) {
      const updatedVideo = await updateVideo(editingVideo.id, payload);
      setVideos(videos.map((v) => (v.id === updatedVideo.id ? updatedVideo : v)));
      setEditingVideo(null);
    } else {
      const createdVideo = await createVideo(payload);
      setVideos([createdVideo, ...videos]);
    }

    setIsAdding(false);
    e.target.reset();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem" }}>{t("admin.manageVideos")}</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", backgroundColor: "var(--color-primary)", color: "white", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}
        >
          <Plus size={18} /> {t("admin.addNewVideo")}
        </button>
      </div>

      {isAdding && (
        <form
          key={editingVideo?.id ?? "new-video"}
          onSubmit={handleSubmit}
          style={{ backgroundColor: "white", padding: "24px", borderRadius: "16px", border: "1.5px solid var(--color-border)", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <h3>{editingVideo ? t("admin.editVideo") : t("admin.addNewVideo")}</h3>
          <input name="title" placeholder={t("admin.titlePlaceholder")} defaultValue={editingVideo?.title || ""} required style={inputStyle} />
          <input name="duration" placeholder={t("admin.duration")} defaultValue={editingVideo?.duration || ""} required style={inputStyle} />
          <input name="category" placeholder={t("admin.category")} defaultValue={editingVideo?.category || ""} required style={inputStyle} />
          <input name="url" placeholder={t("admin.url")} defaultValue={editingVideo?.url || ""} style={inputStyle} />
          <select name="color" required defaultValue={editingVideo?.color || "var(--color-pink)"} style={inputStyle}>
            <option value="var(--color-pink)">Pink</option>
            <option value="var(--color-green)">Green</option>
            <option value="var(--color-yellow)">Yellow</option>
            <option value="var(--color-orange)">Orange</option>
            <option value="var(--color-blue)">Blue</option>
          </select>
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            {editingVideo && (
              <button type="button" onClick={() => { setEditingVideo(null); setIsAdding(false); }} style={{ padding: "12px", backgroundColor: "#E5E7EB", color: "#111827", border: "none", borderRadius: "8px", cursor: "pointer" }}>{t("admin.cancel")}</button>
            )}
            <button type="submit" style={{ padding: "12px", backgroundColor: "var(--color-primary)", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
              {editingVideo ? t("admin.updateVideo") : t("admin.saveVideo")}
            </button>
          </div>
        </form>
      )}

      <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1.5px solid var(--color-border)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ backgroundColor: "var(--color-muted)", borderBottom: "1.5px solid var(--color-border)" }}>
            <tr>
              <th style={thStyle}>{t("admin.title")}</th>
              <th style={thStyle}>{t("admin.category")}</th>
              <th style={thStyle}>{t("admin.duration")}</th>
              <th style={thStyle}>{t("admin.color")}</th>
              <th style={thStyle}>{t("admin.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={tdStyle}><strong>{video.title}</strong><br/><small style={{ color: 'gray' }}>{video.url}</small></td>
                <td style={tdStyle}>{video.category}</td>
                <td style={tdStyle}>{video.duration}</td>
                <td style={tdStyle}><div style={{ width: '20px', height: '20px', backgroundColor: video.color, borderRadius: '4px' }}></div></td>
                <td style={tdStyle}>
                  <button onClick={() => handleEdit(video)} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', marginRight: '12px' }}><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(video.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
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
