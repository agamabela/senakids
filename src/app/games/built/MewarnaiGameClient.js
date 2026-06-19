"use client";

import { useState, useCallback } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./MewarnaiGameClient.module.css";

const TEMPLATES = [
  {
    id: 1,
    name: { id: "Bunga", en: "Flower" },
    parts: [
      { type: "ellipse", cx: "100", cy: "50", rx: "40", ry: "50", fill: "#FFD700", className: "petal-top" },
      { type: "ellipse", cx: "50", cy: "100", rx: "50", ry: "40", fill: "#FFD700", className: "petal-left" },
      { type: "ellipse", cx: "150", cy: "100", rx: "50", ry: "40", fill: "#FFD700", className: "petal-right" },
      { type: "circle", cx: "100", cy: "100", r: "20", fill: "#FF6B6B", className: "center" },
      { type: "rect", x: "85", y: "120", width: "30", height: "60", fill: "#8B4513", className: "stem" },
    ]
  },
  {
    id: 2,
    name: { id: "Kupu-Kupu", en: "Butterfly" },
    parts: [
      { type: "rect", x: "90", y: "50", width: "20", height: "100", rx: "10", fill: "#8B4513", className: "body" },
      { type: "ellipse", cx: "60", cy: "70", rx: "45", ry: "55", fill: "#FF69B4", className: "wing-left-top" },
      { type: "ellipse", cx: "140", cy: "70", rx: "45", ry: "55", fill: "#FF69B4", className: "wing-right-top" },
      { type: "ellipse", cx: "60", cy: "140", rx: "35", ry: "45", fill: "#FFB6C1", className: "wing-left-bottom" },
      { type: "ellipse", cx: "140", cy: "140", rx: "35", ry: "45", fill: "#FFB6C1", className: "wing-right-bottom" },
      { type: "circle", cx: "82", cy: "50", r: "10", fill: "#333", className: "eye-left" },
      { type: "circle", cx: "118", cy: "50", r: "10", fill: "#333", className: "eye-right" },
    ]
  },
  {
    id: 3,
    name: { id: "Rumah", en: "House" },
    parts: [
      { type: "polygon", points: "100,20 25,80 175,80", fill: "#CD853F", className: "roof" },
      { type: "rect", x: "40", y: "80", width: "120", height: "90", fill: "#DEB887", className: "walls" },
      { type: "rect", x: "80", y: "120", width: "40", height: "50", rx: "3", fill: "#8B4513", className: "door" },
      { type: "rect", x: "50", y: "95", width: "25", height: "25", rx: "2", fill: "#87CEEB", className: "window-left" },
      { type: "rect", x: "125", y: "95", width: "25", height: "25", rx: "2", fill: "#87CEEB", className: "window-right" },
      { type: "circle", cx: "100", cy: "40", r: "18", fill: "#FFD700", className: "sun" },
    ]
  },
];

const COLORS = [
  "#FF6B6B", "#FF8E53", "#FFD93D", "#6BCB77", "#4D96FF",
  "#9B59B6", "#FF69B4", "#00CEC9", "#FD79A8", "#E17055",
  "#00B894", "#0984E3", "#6C5CE7", "#FDCB6E", "#E84393",
  "#2D3436", "#636E72", "#B2BEC3", "#DFE6E9", "#FFFFFF",
];

export default function MewarnaiGameClient() {
  const { language } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [colors, setColors] = useState({});
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [showTemplates, setShowTemplates] = useState(true);
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  const handleColorClick = useCallback((className) => {
    setHasChanges(true);
    setColors(prev => ({
      ...prev,
      [className]: selectedColor
    }));
  }, [selectedColor]);

  const resetColors = useCallback(() => {
    setColors({});
  }, []);

  const changeTemplate = (template) => {
    setSelectedTemplate(template);
    setColors({});
    setShowTemplates(false);
  };

  const renderShape = (part) => {
    const baseProps = {
      key: part.className,
      className: `${styles.colorable} ${part.className}`,
      onClick: () => handleColorClick(part.className),
      style: {
        cursor: "pointer",
        transition: "fill 0.2s ease"
      }
    };

    const fillColor = colors[part.className] || part.fill;

    switch (part.type) {
      case "circle":
        return <circle {...baseProps} cx={part.cx} cy={part.cy} r={part.r} fill={fillColor} />;
      case "ellipse":
        return <ellipse {...baseProps} cx={part.cx} cy={part.cy} rx={part.rx} ry={part.ry} fill={fillColor} />;
      case "rect":
        return <rect {...baseProps} x={part.x} y={part.y} width={part.width} height={part.height} rx={part.rx || 0} ry={part.rx || 0} fill={fillColor} />;
      case "polygon":
        return <polygon {...baseProps} points={part.points} fill={fillColor} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      {showTemplates ? (
        <div className={styles.templateSelection}>
          <h1>🎨 {language === "id" ? "Pilih Gambar" : "Choose a Picture"}</h1>
          <div className={styles.templateGrid}>
            {TEMPLATES.map(template => (
              <button
                key={template.id}
                className={styles.templateCard}
                onClick={() => changeTemplate(template)}
              >
                <svg viewBox="0 0 200 200" className={styles.templatePreview}>
                  {template.parts.map(part => {
                    const fill = part.fill;
                    switch (part.type) {
                      case "circle":
                        return <circle key={part.className} cx={part.cx} cy={part.cy} r={part.r} fill={fill} />;
                      case "ellipse":
                        return <ellipse key={part.className} cx={part.cx} cy={part.cy} rx={part.rx} ry={part.ry} fill={fill} />;
                      case "rect":
                        return <rect key={part.className} x={part.x} y={part.y} width={part.width} height={part.height} rx="5" fill={fill} />;
                      case "polygon":
                        return <polygon key={part.className} points={part.points} fill={fill} />;
                      default:
                        return null;
                    }
                  })}
                </svg>
                <span>{template.name[language]}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className={styles.header}>
            <div>
              <h1>🎨 Mewarnai</h1>
              <p>{selectedTemplate.name[language]}</p>
            </div>
            <button className={styles.backBtn} onClick={() => setShowTemplates(true)}>
              ← {language === "id" ? "Ganti" : "Change"}
            </button>
          </div>

          <div className={styles.mainArea}>
            <div className={styles.colorPalette}>
              {COLORS.map((color, i) => (
                <button
                  key={i}
                  className={`${styles.colorBtn} ${selectedColor === color ? styles.selected : ""}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  title={color}
                />
              ))}
            </div>

            <div className={styles.canvas}>
              <svg viewBox="0 0 200 200" className={styles.sandboxSvg}>
                {selectedTemplate.parts.map(part => renderShape(part))}
              </svg>
            </div>
          </div>

          <div className={styles.controls}>
            <button className={styles.btn} onClick={resetColors}>
              🔄 {language === "id" ? "Hapus Semua" : "Clear All"}
            </button>
            <button className={styles.btn} onClick={() => setShowTemplates(true)}>
              📖 {language === "id" ? "Ganti Gambar" : "New Picture"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}