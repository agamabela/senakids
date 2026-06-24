"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import DPad from "@/components/DPad";
import styles from "./RpgGameClient.module.css";

// ─── Constants ──────────────────────────────────────────────────────────────
const CW = 640;
const CH = 480;
const TILE = 40;
const COLS = 20;
const ROWS = 15;

// Tile type IDs
const T = {
  GRASS: 0, WATER: 1, WALL: 2, CHEST: 3, PATH: 4,
  FLOWER: 5, TREE: 6, SIGN: 7, CHEST_OPEN: 8,
};

// Passable check
const PASSABLE = new Set([T.GRASS, T.PATH, T.FLOWER, T.CHEST, T.SIGN, T.CHEST_OPEN]);


// ─── Map data: 3 areas ───────────────────────────────────────────────────────
// Each area is a 20×15 tile array (row-major).
// Area 0 = Desa (village), Area 1 = Hutan (forest), Area 2 = Penjara (dungeon)

function makeVillageMap() {
  // prettier-ignore
  const raw = [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,0,0,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [2,0,2,4,2,2,4,0,7,0,0,0,0,0,5,0,5,0,0,2],
    [2,0,2,4,2,2,4,0,0,0,3,0,0,0,0,0,0,0,0,2],
    [2,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,2],
    [2,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,2],
    [2,0,4,0,2,2,2,0,0,7,0,0,5,0,5,0,4,0,0,2],
    [2,0,4,0,2,2,2,0,0,0,0,0,0,0,0,0,4,0,0,2],
    [2,0,4,0,0,0,0,0,0,0,0,0,3,0,0,0,4,0,0,2],
    [2,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,2],
    [2,0,0,0,5,0,5,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [2,0,0,0,0,0,0,0,0,7,0,0,0,0,0,5,0,5,0,2],
    [2,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ];
  return raw;
}

function makeForestMap() {
  // prettier-ignore
  const raw = [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,6,6,6,0,0,0,6,6,6,0,6,6,6,6,0,6,6,6,2],
    [2,6,0,0,0,5,0,0,6,0,0,0,6,0,0,0,0,6,6,2],
    [2,6,0,6,0,0,0,0,0,0,0,6,0,0,5,0,0,6,6,2],
    [2,0,0,0,0,6,6,6,0,0,0,0,0,0,0,6,0,0,6,2],
    [2,0,5,0,0,0,0,6,0,3,0,0,6,0,0,0,0,5,6,2],
    [2,6,0,0,6,0,0,0,0,0,0,0,0,0,6,0,0,0,6,2],
    [2,6,6,0,0,0,5,0,0,0,0,5,0,0,0,0,6,0,6,2],
    [2,6,0,0,6,6,0,0,6,0,0,0,0,6,0,0,0,0,6,2],
    [2,0,0,6,0,0,0,0,0,0,6,0,0,0,0,5,0,0,6,2],
    [2,0,5,0,0,0,6,0,0,0,0,0,0,0,6,0,0,0,6,2],
    [2,6,0,0,6,0,0,5,0,0,0,0,5,0,0,0,6,6,6,2],
    [2,6,6,0,0,0,0,0,0,6,0,0,0,0,0,0,0,6,6,2],
    [2,6,6,6,0,0,0,6,0,0,0,6,6,6,0,0,6,6,6,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ];
  return raw;
}

function makeDungeonMap() {
  // prettier-ignore
  const raw = [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,2],
    [2,0,2,2,0,0,2,0,2,2,2,0,2,0,2,0,2,2,0,2],
    [2,0,2,0,0,0,0,0,2,0,0,0,2,0,0,0,2,0,0,2],
    [2,0,0,0,2,2,2,0,2,0,2,2,2,0,2,2,2,0,2,2],
    [2,0,2,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2],
    [2,0,2,0,2,0,2,2,2,0,2,2,2,0,2,2,2,0,0,2],
    [2,0,0,0,0,0,2,0,0,0,0,0,2,0,0,0,2,2,0,2],
    [2,2,2,0,2,0,2,0,2,0,2,0,0,0,2,0,0,0,0,2],
    [2,0,0,0,2,0,0,0,2,0,2,0,2,2,2,0,2,0,2,2],
    [2,0,2,0,0,0,2,0,0,0,0,0,2,0,0,0,2,0,0,2],
    [2,0,2,2,2,0,2,0,2,2,2,0,2,0,2,0,0,0,3,2],
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,2],
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ];
  return raw;
}

// Exit tile position in dungeon (row 11, col 18)
const DUNGEON_EXIT = { x: 18, y: 11 };


// ─── NPC definitions ─────────────────────────────────────────────────────────
const NPCS_VILLAGE = [
  {
    id: "npc1", x: 8, y: 2, color: "#f472b6", hatColor: "#db2777",
    name: "Nenek Sari",
    dialog: "Hati-hati, nak! Di hutan sebelah banyak makhluk gelap. Bawa selalu obat-obatanmu!",
  },
  {
    id: "npc2", x: 5, y: 6, color: "#60a5fa", hatColor: "#2563eb",
    name: "Pak Guru",
    dialog: "Setiap musuh yang kamu kalahkan memberimu pengalaman. Kumpulkan XP untuk naik level!",
  },
  {
    id: "npc3", x: 9, y: 11, color: "#34d399", hatColor: "#059669",
    name: "Petani Budi",
    dialog: "Raja Iblis bersembunyi di penjara bawah tanah. Kalahkan dia untuk menyelamatkan desa kita!",
  },
];

// ─── Enemy template definitions ──────────────────────────────────────────────
const ENEMY_TEMPLATES = {
  slime:    { name: "Slime",     hp: 8,  atk: 3, def: 1, xp: 5,  color: "#4ade80", size: 0.8, area: [0,1] },
  bat:      { name: "Kelelawar", hp: 6,  atk: 4, def: 1, xp: 7,  color: "#7c3aed", size: 0.7, area: [1]   },
  skeleton: { name: "Tengkorak", hp: 12, atk: 5, def: 2, xp: 12, color: "#d1d5db", size: 0.9, area: [1,2] },
  boss:     { name: "Raja Iblis",hp: 30, atk: 8, def: 4, xp: 50, color: "#ef4444", size: 1.2, area: [2],  isBoss: true },
};

// Initial enemy positions per area
function makeEnemies() {
  return [
    // Village (area 0) — 2 slimes
    { id: "e1", type: "slime",    area: 0, x: 5,  y: 3,  ...JSON.parse(JSON.stringify(ENEMY_TEMPLATES.slime)),    dead: false, moveTimer: 0 },
    { id: "e2", type: "slime",    area: 0, x: 15, y: 12, ...JSON.parse(JSON.stringify(ENEMY_TEMPLATES.slime)),    dead: false, moveTimer: 0 },
    // Forest (area 1) — bat + skeleton
    { id: "e3", type: "bat",      area: 1, x: 4,  y: 3,  ...JSON.parse(JSON.stringify(ENEMY_TEMPLATES.bat)),      dead: false, moveTimer: 0 },
    { id: "e4", type: "skeleton", area: 1, x: 12, y: 10, ...JSON.parse(JSON.stringify(ENEMY_TEMPLATES.skeleton)), dead: false, moveTimer: 0 },
    // Dungeon (area 2) — skeleton + boss
    { id: "e5", type: "skeleton", area: 2, x: 4,  y: 5,  ...JSON.parse(JSON.stringify(ENEMY_TEMPLATES.skeleton)), dead: false, moveTimer: 0 },
    { id: "e6", type: "boss",     area: 2, x: 14, y: 6,  ...JSON.parse(JSON.stringify(ENEMY_TEMPLATES.boss)),     dead: false, moveTimer: 0 },
  ];
}

// ─── Chest definitions per area ───────────────────────────────────────────────
function makeChests() {
  return [
    { id: "c1", area: 0, x: 10, y: 3,  item: "potion",  label: "Ramuan Penyembuh (+10 HP)", opened: false },
    { id: "c2", area: 0, x: 12, y: 8,  item: "sword",   label: "Pedang Baja (+3 ATK)",      opened: false },
    { id: "c3", area: 1, x: 9,  y: 5,  item: "potion",  label: "Ramuan Kuat (+8 HP)",        opened: false },
    { id: "c4", area: 2, x: 18, y: 11, item: "armor",   label: "Zirah Ksatria (+2 DEF)",     opened: false },
  ];
}

// ─── Sign definitions ─────────────────────────────────────────────────────────
const SIGNS = [
  { area: 0, x: 8,  y: 2,  text: "⚠ Selamat datang di Desa Cahaya!\nTekan Spasi untuk berinteraksi." },
  { area: 0, x: 9,  y: 11, text: "➡ Hutan gelap ada di utara. Bersiaplah!" },
  { area: 1, x: 9,  y: 5,  text: "⚠ Hutan Larangan — masuki dengan risiko sendiri!" },
  { area: 2, x: 4,  y: 5,  text: "☠ Penjara Bawah Tanah. Raja Iblis menunggumu di ujung sana!" },
];


// ─── Canvas drawing helpers ───────────────────────────────────────────────────

function drawGrassTile(ctx, px, py, seed) {
  ctx.fillStyle = "#5cb85c";
  ctx.fillRect(px, py, TILE, TILE);
  // subtle variation dots
  const rng = (seed * 2654435761) >>> 0;
  const v = (rng % 3) - 1;
  ctx.fillStyle = v > 0 ? "#66cc66" : "#52a852";
  ctx.fillRect(px + 4, py + 4, 6, 4);
  ctx.fillRect(px + 22, py + 18, 5, 4);
  ctx.fillRect(px + 12, py + 28, 7, 3);
}

function drawPathTile(ctx, px, py) {
  ctx.fillStyle = "#c9a96e";
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = "#b8934f";
  ctx.fillRect(px + 2, py + 2, TILE - 4, 2);
  ctx.fillRect(px + 2, py + TILE - 4, TILE - 4, 2);
}

function drawWaterTile(ctx, px, py, tick) {
  const wave = Math.sin(tick * 0.05 + px * 0.1) * 2;
  ctx.fillStyle = "#2563eb";
  ctx.fillRect(px, py, TILE, TILE);
  // animated ripple
  ctx.fillStyle = "#3b82f6";
  ctx.beginPath();
  ctx.ellipse(px + 20 + wave, py + 20, 10, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#60a5fa";
  ctx.beginPath();
  ctx.ellipse(px + 10 - wave, py + 30, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawWallTile(ctx, px, py) {
  ctx.fillStyle = "#78716c";
  ctx.fillRect(px, py, TILE, TILE);
  // stone texture — brick pattern
  ctx.fillStyle = "#57534e";
  ctx.fillRect(px + 2, py + 2, 17, 8);
  ctx.fillRect(px + 22, py + 2, 16, 8);
  ctx.fillRect(px + 2, py + 14, 10, 8);
  ctx.fillRect(px + 16, py + 14, 22, 8);
  ctx.fillRect(px + 2, py + 26, 17, 8);
  ctx.fillRect(px + 22, py + 26, 16, 8);
  ctx.strokeStyle = "#44403c";
  ctx.lineWidth = 1;
  ctx.strokeRect(px, py, TILE, TILE);
}

function drawFlowerTile(ctx, px, py) {
  drawGrassTile(ctx, px, py, px + py);
  // small flower dot
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(px + 20, py + 22, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(px + 19, py + 24, 2, 6);
}

function drawTreeTile(ctx, px, py) {
  ctx.fillStyle = "#14532d";
  ctx.fillRect(px, py, TILE, TILE);
  // canopy
  ctx.fillStyle = "#166534";
  ctx.beginPath();
  ctx.arc(px + 20, py + 16, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#15803d";
  ctx.beginPath();
  ctx.arc(px + 14, py + 22, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(px + 26, py + 22, 10, 0, Math.PI * 2);
  ctx.fill();
  // trunk
  ctx.fillStyle = "#713f12";
  ctx.fillRect(px + 16, py + 28, 8, 10);
}

function drawSignTile(ctx, px, py) {
  drawGrassTile(ctx, px, py, px * py);
  // post
  ctx.fillStyle = "#92400e";
  ctx.fillRect(px + 18, py + 20, 4, 16);
  // sign board
  ctx.fillStyle = "#d97706";
  ctx.fillRect(px + 8, py + 10, 24, 14);
  ctx.fillStyle = "#1c1917";
  ctx.fillRect(px + 12, py + 14, 3, 2);
  ctx.fillRect(px + 16, py + 14, 3, 2);
  ctx.fillRect(px + 20, py + 14, 3, 2);
  ctx.fillRect(px + 24, py + 14, 3, 2);
}

function drawChestTile(ctx, px, py, opened) {
  drawGrassTile(ctx, px, py, px + py * 7);
  if (opened) {
    ctx.fillStyle = "#92400e";
    ctx.fillRect(px + 8, py + 18, 24, 14);
    ctx.fillStyle = "#78350f";
    ctx.fillRect(px + 8, py + 16, 24, 4);
    // open lid at angle
    ctx.fillStyle = "#b45309";
    ctx.save();
    ctx.translate(px + 8, py + 16);
    ctx.rotate(-0.5);
    ctx.fillRect(0, -4, 24, 4);
    ctx.restore();
  } else {
    ctx.fillStyle = "#92400e";
    ctx.fillRect(px + 8, py + 16, 24, 16);
    ctx.fillStyle = "#b45309";
    ctx.fillRect(px + 8, py + 14, 24, 6);
    // metal clasp
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(px + 17, py + 19, 6, 5);
    ctx.fillStyle = "#d97706";
    ctx.fillRect(px + 19, py + 20, 2, 3);
    // studs
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(px + 10, py + 16, 3, 3);
    ctx.fillRect(px + 27, py + 16, 3, 3);
  }
}


// ─── Tile renderer dispatcher ─────────────────────────────────────────────────
function drawTile(ctx, type, px, py, tick, chestOpen) {
  switch (type) {
    case T.GRASS:      drawGrassTile(ctx, px, py, (px / TILE) * 100 + py / TILE); break;
    case T.WATER:      drawWaterTile(ctx, px, py, tick); break;
    case T.WALL:       drawWallTile(ctx, px, py); break;
    case T.CHEST:      drawChestTile(ctx, px, py, false); break;
    case T.CHEST_OPEN: drawChestTile(ctx, px, py, true); break;
    case T.PATH:       drawPathTile(ctx, px, py); break;
    case T.FLOWER:     drawFlowerTile(ctx, px, py); break;
    case T.TREE:       drawTreeTile(ctx, px, py); break;
    case T.SIGN:       drawSignTile(ctx, px, py); break;
    default:
      ctx.fillStyle = "#111";
      ctx.fillRect(px, py, TILE, TILE);
  }
}

// ─── Dungeon overlay tint ─────────────────────────────────────────────────────
function drawDungeonTint(ctx) {
  ctx.fillStyle = "rgba(20,0,40,0.38)";
  ctx.fillRect(0, 0, CW, CH);
}

// ─── Map renderer ─────────────────────────────────────────────────────────────
function renderMap(ctx, map, tick, chests, area) {
  // Build a set of opened chest positions for fast lookup
  const openedSet = new Set(chests.filter(c => c.opened && c.area === area).map(c => `${c.x},${c.y}`));
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      let type = map[row][col];
      const key = `${col},${row}`;
      if (type === T.CHEST && openedSet.has(key)) type = T.CHEST_OPEN;
      drawTile(ctx, type, col * TILE, row * TILE, tick, false);
    }
  }
  if (area === 2) drawDungeonTint(ctx);
}

// ─── Exit marker ─────────────────────────────────────────────────────────────
function drawExitMarker(ctx, tick) {
  const px = DUNGEON_EXIT.x * TILE;
  const py = DUNGEON_EXIT.y * TILE;
  const pulse = 0.7 + 0.3 * Math.sin(tick * 0.08);
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(px + 20, py + 20, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1c1917";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("★", px + 20, py + 21);
  ctx.restore();
}


// ─── Player drawing ───────────────────────────────────────────────────────────
function drawPlayer(ctx, px, py, tick, hp, maxHp) {
  const bob = Math.sin(tick * 0.2) * 2;
  const cx = px + 20;
  const cy = py + 20 + bob;

  // HP bar above
  const barW = 36;
  const barH = 5;
  const bx = px + 2;
  const by = py - 9;
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(bx, by, barW, barH);
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(bx, by, Math.round(barW * (hp / maxHp)), barH);

  // body
  ctx.fillStyle = "#3b82f6";
  ctx.fillRect(cx - 7, cy - 2, 14, 14);

  // head
  ctx.fillStyle = "#fde68a";
  ctx.beginPath();
  ctx.arc(cx, cy - 6, 10, 0, Math.PI * 2);
  ctx.fill();

  // hat
  ctx.fillStyle = "#7c3aed";
  ctx.fillRect(cx - 8, cy - 14, 16, 5);
  ctx.fillRect(cx - 5, cy - 20, 10, 8);

  // eyes
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.arc(cx - 3, cy - 7, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 3, cy - 7, 2, 0, Math.PI * 2);
  ctx.fill();

  // smile
  ctx.strokeStyle = "#1c1917";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy - 4, 4, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // legs
  const legPhase = Math.sin(tick * 0.25);
  ctx.fillStyle = "#1e40af";
  ctx.fillRect(cx - 7, cy + 11, 6, 8 + Math.round(legPhase * 2));
  ctx.fillRect(cx + 1, cy + 11, 6, 8 - Math.round(legPhase * 2));

  // feet
  ctx.fillStyle = "#713f12";
  ctx.fillRect(cx - 8, cy + 18 + Math.round(legPhase * 2), 7, 3);
  ctx.fillRect(cx + 1, cy + 18 - Math.round(legPhase * 2), 7, 3);
}

// ─── NPC drawing ──────────────────────────────────────────────────────────────
function drawNpc(ctx, npc, px, py, tick) {
  const cx = px + 20;
  const cy = py + 20;
  const bob = Math.sin(tick * 0.12 + npc.x) * 1.5;

  // body
  ctx.fillStyle = npc.color;
  ctx.fillRect(cx - 6, cy - 2 + bob, 12, 12);

  // head
  ctx.fillStyle = "#fde68a";
  ctx.beginPath();
  ctx.arc(cx, cy - 7 + bob, 9, 0, Math.PI * 2);
  ctx.fill();

  // hat
  ctx.fillStyle = npc.hatColor;
  ctx.fillRect(cx - 7, cy - 14 + bob, 14, 4);
  ctx.fillRect(cx - 4, cy - 20 + bob, 8, 7);

  // eyes
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.arc(cx - 2.5, cy - 8 + bob, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 2.5, cy - 8 + bob, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // interaction prompt
  const prompt = Math.floor(tick / 30) % 2 === 0;
  if (prompt) {
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("!", cx, cy - 24 + bob);
  }
}


// ─── Enemy drawing ────────────────────────────────────────────────────────────
function drawEnemy(ctx, enemy, px, py, tick) {
  if (enemy.dead) return;
  const cx = px + 20;
  const cy = py + 24;
  const bob = Math.sin(tick * 0.15 + enemy.x) * 2;

  switch (enemy.type) {
    case "slime": {
      ctx.fillStyle = "#166534";
      ctx.beginPath();
      ctx.ellipse(cx, cy + 2 + bob, 13, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#4ade80";
      ctx.beginPath();
      ctx.ellipse(cx, cy - 2 + bob, 12, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      // eyes
      ctx.fillStyle = "#1c1917";
      ctx.beginPath();
      ctx.arc(cx - 4, cy - 4 + bob, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 4, cy - 4 + bob, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "bat": {
      // wings
      ctx.fillStyle = "#4c1d95";
      ctx.beginPath();
      ctx.moveTo(cx, cy + bob);
      ctx.bezierCurveTo(cx - 12, cy - 12 + bob, cx - 18, cy - 4 + bob, cx - 14, cy + 6 + bob);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx, cy + bob);
      ctx.bezierCurveTo(cx + 12, cy - 12 + bob, cx + 18, cy - 4 + bob, cx + 14, cy + 6 + bob);
      ctx.fill();
      // body
      ctx.fillStyle = "#7c3aed";
      ctx.beginPath();
      ctx.ellipse(cx, cy + bob, 7, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      // eyes
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(cx - 2.5, cy - 2 + bob, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 2.5, cy - 2 + bob, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "skeleton": {
      // skull
      ctx.fillStyle = "#d1d5db";
      ctx.beginPath();
      ctx.arc(cx, cy - 10 + bob, 8, 0, Math.PI * 2);
      ctx.fill();
      // eye sockets
      ctx.fillStyle = "#1c1917";
      ctx.beginPath();
      ctx.arc(cx - 3, cy - 11 + bob, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 3, cy - 11 + bob, 2.5, 0, Math.PI * 2);
      ctx.fill();
      // jaw
      ctx.fillStyle = "#9ca3af";
      ctx.fillRect(cx - 4, cy - 4 + bob, 8, 4);
      ctx.fillStyle = "#1c1917";
      ctx.fillRect(cx - 3, cy - 3 + bob, 2, 2);
      ctx.fillRect(cx + 1, cy - 3 + bob, 2, 2);
      // spine/ribcage
      ctx.fillStyle = "#d1d5db";
      ctx.fillRect(cx - 1, cy + 1 + bob, 2, 14);
      ctx.fillRect(cx - 5, cy + 2 + bob, 10, 2);
      ctx.fillRect(cx - 5, cy + 6 + bob, 10, 2);
      ctx.fillRect(cx - 5, cy + 10 + bob, 10, 2);
      // arms
      ctx.fillRect(cx - 8, cy + 2 + bob, 3, 10);
      ctx.fillRect(cx + 5, cy + 2 + bob, 3, 10);
      break;
    }
    case "boss": {
      // large red demon
      ctx.fillStyle = "#7f1d1d";
      ctx.fillRect(cx - 14, cy - 4 + bob, 28, 22);
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(cx, cy - 10 + bob, 13, 0, Math.PI * 2);
      ctx.fill();
      // horns
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 20 + bob);
      ctx.lineTo(cx - 12, cy - 30 + bob);
      ctx.lineTo(cx - 4, cy - 20 + bob);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 8, cy - 20 + bob);
      ctx.lineTo(cx + 12, cy - 30 + bob);
      ctx.lineTo(cx + 4, cy - 20 + bob);
      ctx.fill();
      // evil eyes
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(cx - 5, cy - 12 + bob, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 5, cy - 12 + bob, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1c1917";
      ctx.beginPath();
      ctx.arc(cx - 5, cy - 12 + bob, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 5, cy - 12 + bob, 2, 0, Math.PI * 2);
      ctx.fill();
      // teeth
      ctx.fillStyle = "#fef9c3";
      ctx.fillRect(cx - 6, cy - 4 + bob, 3, 4);
      ctx.fillRect(cx - 1, cy - 4 + bob, 3, 4);
      ctx.fillRect(cx + 4, cy - 4 + bob, 3, 4);
      break;
    }
    default: break;
  }

  // HP mini-bar
  const barW = 28;
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(cx - 14, py + 1, barW, 4);
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(cx - 14, py + 1, barW, 4);
  const hpPct = enemy.hp / ENEMY_TEMPLATES[enemy.type].hp;
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(cx - 14, py + 1, Math.round(barW * hpPct), 4);
}


// ─── HUD renderer ─────────────────────────────────────────────────────────────
const AREA_NAMES = ["⚔ Desa Cahaya", "🌲 Hutan Gelap", "💀 Penjara Bawah Tanah"];

function drawHUD(ctx, player) {
  const { hp, maxHp, level, xp, xpNeeded, area } = player;

  // top bar background
  ctx.fillStyle = "rgba(10,4,30,0.82)";
  ctx.fillRect(0, 0, CW, 28);

  // HP bar
  ctx.fillStyle = "#6b7280";
  ctx.fillRect(8, 7, 100, 14);
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(8, 7, 100, 14);
  const hpPct = Math.max(0, hp / maxHp);
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(8, 7, Math.round(100 * hpPct), 14);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1;
  ctx.strokeRect(8, 7, 100, 14);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`HP ${hp}/${maxHp}`, 58, 14);

  // Level
  ctx.fillStyle = "#fbbf24";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`Lv.${level}`, 116, 14);

  // XP bar
  ctx.fillStyle = "#374151";
  ctx.fillRect(148, 9, 70, 10);
  const xpPct = xpNeeded > 0 ? Math.min(1, xp / xpNeeded) : 1;
  ctx.fillStyle = "#a78bfa";
  ctx.fillRect(148, 9, Math.round(70 * xpPct), 10);
  ctx.strokeStyle = "#7c3aed";
  ctx.lineWidth = 1;
  ctx.strokeRect(148, 9, 70, 10);
  ctx.fillStyle = "#fff";
  ctx.font = "9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`XP ${xp}/${xpNeeded}`, 183, 14);

  // Area name
  ctx.fillStyle = "#e0d0ff";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(AREA_NAMES[area] ?? "", CW - 8, 14);
}

// ─── Floating damage numbers ──────────────────────────────────────────────────
function drawFloatTexts(ctx, floatTexts) {
  for (const ft of floatTexts) {
    ctx.save();
    ctx.globalAlpha = ft.alpha;
    ctx.fillStyle = ft.color || "#ffffff";
    ctx.font = `bold ${ft.size || 16}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }
}

// ─── XP level thresholds ──────────────────────────────────────────────────────
const XP_LEVELS = [0, 20, 50, 100];
function getXpNeeded(level) {
  return XP_LEVELS[level] ?? 999;
}


// ─── Intro screen draw ────────────────────────────────────────────────────────
function drawIntroScreen(ctx, tick) {
  // bg gradient
  const grd = ctx.createLinearGradient(0, 0, 0, CH);
  grd.addColorStop(0, "#1a0a2e");
  grd.addColorStop(1, "#0f172a");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, CW, CH);

  // stars
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  const stars = [
    [50,30],[120,80],[300,20],[450,50],[600,35],[80,200],[500,180],
    [350,300],[150,350],[580,280],[30,400],[400,420],[620,400],
  ];
  stars.forEach(([sx, sy]) => {
    const p = 0.6 + 0.4 * Math.sin(tick * 0.07 + sx);
    ctx.globalAlpha = p;
    ctx.beginPath();
    ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // title
  ctx.save();
  ctx.textAlign = "center";
  ctx.shadowColor = "#a855f7";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "#e879f9";
  ctx.font = "bold 34px sans-serif";
  ctx.fillText("Petualangan Dunia RPG", CW / 2, 100);
  ctx.shadowBlur = 0;
  ctx.restore();

  // subtitle
  ctx.fillStyle = "#fbbf24";
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("⚔️  Selamatkan Desa dari Raja Iblis!  ⚔️", CW / 2, 135);

  // story text
  ctx.fillStyle = "rgba(220,200,255,0.9)";
  ctx.font = "13px sans-serif";
  const story = [
    "Desa Cahaya diserang Raja Iblis yang kejam.",
    "Kamu adalah pahlawan muda yang terpilih.",
    "Jelajahi desa, hutan, dan penjara bawah tanah.",
    "Kalahkan Raja Iblis untuk membawa kedamaian!",
  ];
  story.forEach((line, i) => {
    ctx.fillText(line, CW / 2, 175 + i * 22);
  });

  // controls hint
  ctx.fillStyle = "rgba(180,160,220,0.75)";
  ctx.font = "12px sans-serif";
  ctx.fillText("🎮  Arrow Keys / WASD — gerak     Space — interaksi", CW / 2, 295);

  // start button
  const pulse = 0.9 + 0.1 * Math.sin(tick * 0.1);
  ctx.save();
  ctx.translate(CW / 2, 360);
  ctx.scale(pulse, pulse);
  const grad = ctx.createLinearGradient(-80, -24, 80, 24);
  grad.addColorStop(0, "#9333ea");
  grad.addColorStop(1, "#db2777");
  ctx.fillStyle = grad;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(-80, -22, 160, 44, 22);
  } else {
    ctx.rect(-80, -22, 160, 44);
  }
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("▶  Mulai Petualangan", 0, 0);
  ctx.restore();

  // tiny label
  ctx.fillStyle = "rgba(150,130,180,0.6)";
  ctx.font = "11px sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "center";
  ctx.fillText("Klik canvas atau tekan Enter untuk memulai", CW / 2, 430);
}

// ─── Win screen draw ──────────────────────────────────────────────────────────
function drawWinScreen(ctx, player, tick) {
  const grd = ctx.createLinearGradient(0, 0, 0, CH);
  grd.addColorStop(0, "#052e16");
  grd.addColorStop(1, "#14532d");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, CW, CH);

  // confetti-ish dots
  for (let i = 0; i < 30; i++) {
    const cx = (i * 137.5 + tick * 2) % CW;
    const cy = (i * 97 + tick * 1.5) % CH;
    const colors = ["#fbbf24","#f472b6","#34d399","#60a5fa","#a78bfa"];
    ctx.fillStyle = colors[i % 5];
    ctx.fillRect(cx, cy, 6, 6);
  }

  ctx.save();
  ctx.textAlign = "center";
  ctx.shadowColor = "#22c55e";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "#86efac";
  ctx.font = "bold 36px sans-serif";
  ctx.fillText("🏆 SELAMAT! 🏆", CW / 2, 100);
  ctx.shadowBlur = 0;
  ctx.restore();

  ctx.fillStyle = "#fbbf24";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Raja Iblis telah dikalahkan!", CW / 2, 145);

  ctx.fillStyle = "rgba(200,255,200,0.85)";
  ctx.font = "14px sans-serif";
  ctx.fillText("Desa Cahaya kini aman berkat keberanianmu.", CW / 2, 175);

  // stats
  ctx.fillStyle = "#fff";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText(`Level akhir: ${player.level}   |   XP: ${player.xp}   |   HP: ${player.hp}/${player.maxHp}`, CW / 2, 220);
  ctx.fillText(`ATK: ${player.atk}   |   DEF: ${player.def}`, CW / 2, 244);
}

// ─── Game-over screen draw ────────────────────────────────────────────────────
function drawGameOverScreen(ctx, tick) {
  const grd = ctx.createLinearGradient(0, 0, 0, CH);
  grd.addColorStop(0, "#1c0a0a");
  grd.addColorStop(1, "#3b0c0c");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, CW, CH);

  const pulse = 0.85 + 0.15 * Math.sin(tick * 0.1);
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.textAlign = "center";
  ctx.fillStyle = "#ef4444";
  ctx.font = "bold 42px sans-serif";
  ctx.fillText("💀 GAME OVER 💀", CW / 2, 140);
  ctx.restore();

  ctx.fillStyle = "rgba(255,180,180,0.85)";
  ctx.font = "16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Kamu telah jatuh dalam pertempuran...", CW / 2, 190);
  ctx.fillText("Jangan menyerah, pahlawan!", CW / 2, 215);

  // retry button
  const bp = 0.9 + 0.1 * Math.sin(tick * 0.12);
  ctx.save();
  ctx.translate(CW / 2, 300);
  ctx.scale(bp, bp);
  const grad = ctx.createLinearGradient(-80, -22, 80, 22);
  grad.addColorStop(0, "#dc2626");
  grad.addColorStop(1, "#7f1d1d");
  ctx.fillStyle = grad;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(-80, -22, 160, 44, 22);
  } else {
    ctx.rect(-80, -22, 160, 44);
  }
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🔄 Coba Lagi", 0, 0);
  ctx.restore();
}


// ─── Battle enemy sprite (large, centered for overlay) ────────────────────────
function drawBattleEnemySprite(ctx, type, cx, cy, tick) {
  const bob = Math.sin(tick * 0.15) * 4;
  switch (type) {
    case "slime": {
      ctx.fillStyle = "#166534";
      ctx.beginPath();
      ctx.ellipse(cx, cy + 8 + bob, 28, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#4ade80";
      ctx.beginPath();
      ctx.ellipse(cx, cy - 4 + bob, 26, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1c1917";
      ctx.beginPath();
      ctx.arc(cx - 9, cy - 8 + bob, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 9, cy - 8 + bob, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "bat": {
      ctx.fillStyle = "#4c1d95";
      ctx.beginPath();
      ctx.moveTo(cx, cy + bob);
      ctx.bezierCurveTo(cx - 28, cy - 28 + bob, cx - 44, cy - 8 + bob, cx - 32, cy + 14 + bob);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx, cy + bob);
      ctx.bezierCurveTo(cx + 28, cy - 28 + bob, cx + 44, cy - 8 + bob, cx + 32, cy + 14 + bob);
      ctx.fill();
      ctx.fillStyle = "#7c3aed";
      ctx.beginPath();
      ctx.ellipse(cx, cy + bob, 14, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(cx - 5, cy - 5 + bob, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 5, cy - 5 + bob, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1c1917";
      ctx.beginPath();
      ctx.arc(cx - 5, cy - 5 + bob, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 5, cy - 5 + bob, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "skeleton": {
      ctx.fillStyle = "#d1d5db";
      ctx.beginPath();
      ctx.arc(cx, cy - 26 + bob, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1c1917";
      ctx.beginPath();
      ctx.arc(cx - 6, cy - 30 + bob, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 6, cy - 30 + bob, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#9ca3af";
      ctx.fillRect(cx - 8, cy - 11 + bob, 16, 8);
      ctx.fillStyle = "#1c1917";
      ctx.fillRect(cx - 6, cy - 9 + bob, 4, 4);
      ctx.fillRect(cx + 2, cy - 9 + bob, 4, 4);
      ctx.fillStyle = "#d1d5db";
      ctx.fillRect(cx - 2, cy + 1 + bob, 4, 30);
      ctx.fillRect(cx - 12, cy + 4 + bob, 22, 4);
      ctx.fillRect(cx - 12, cy + 12 + bob, 22, 4);
      ctx.fillRect(cx - 12, cy + 20 + bob, 22, 4);
      ctx.fillRect(cx - 18, cy + 4 + bob, 6, 22);
      ctx.fillRect(cx + 12, cy + 4 + bob, 6, 22);
      break;
    }
    case "boss": {
      ctx.fillStyle = "#7f1d1d";
      ctx.fillRect(cx - 30, cy - 8 + bob, 60, 46);
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(cx, cy - 22 + bob, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.moveTo(cx - 18, cy - 42 + bob);
      ctx.lineTo(cx - 28, cy - 62 + bob);
      ctx.lineTo(cx - 8, cy - 42 + bob);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 18, cy - 42 + bob);
      ctx.lineTo(cx + 28, cy - 62 + bob);
      ctx.lineTo(cx + 8, cy - 42 + bob);
      ctx.fill();
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(cx - 10, cy - 26 + bob, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 10, cy - 26 + bob, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1c1917";
      ctx.beginPath();
      ctx.arc(cx - 10, cy - 26 + bob, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 10, cy - 26 + bob, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fef9c3";
      ctx.fillRect(cx - 14, cy - 10 + bob, 7, 8);
      ctx.fillRect(cx - 3, cy - 10 + bob, 6, 8);
      ctx.fillRect(cx + 7, cy - 10 + bob, 7, 8);
      break;
    }
    default: break;
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════
export default function RpgGameClient() {
  const { lang } = useLanguage();
  const { setHasChanges } = useActivityStore();
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  // ── All mutable game state lives in refs (avoid stale closures in RAF) ──────
  const G = useRef(null); // game state object

  // React state only for overlay UI re-renders
  const [screen, setScreen]       = useState("intro"); // "intro"|"play"|"battle"|"win"|"gameover"
  const [battleState, setBattle]  = useState(null);
  const [dialog, setDialog]       = useState(null);    // {name, text}

  // ── Initialize / reset game state ───────────────────────────────────────────
  const initGame = useCallback(() => {
    const maps = [makeVillageMap(), makeForestMap(), makeDungeonMap()];
    G.current = {
      maps,
      area: 0,
      player: {
        x: 3, y: 4,          // tile position
        px: 3 * TILE, py: 4 * TILE, // pixel position (for smooth lerp)
        hp: 30, maxHp: 30,
        atk: 8, def: 3,
        level: 1, xp: 0, xpNeeded: getXpNeeded(1),
        potions: 3,
        defending: false,
      },
      enemies:  makeEnemies(),
      chests:   makeChests(),
      tick:     0,
      floatTexts: [],        // [{text, x, y, alpha, color, size, vy}]
      keys:     {},
      moveDelay: 0,
      enemyMoveTimer: 0,
      activeBattle: null,    // enemy ref currently in battle
    };
  }, []);

  // ── Spawn a floating text ────────────────────────────────────────────────────
  function spawnFloat(text, x, y, color = "#fff", size = 16) {
    if (!G.current) return;
    G.current.floatTexts.push({ text, x, y, alpha: 1, color, size, vy: -1.2 });
  }

  // ── Level-up logic ───────────────────────────────────────────────────────────
  function checkLevelUp(px, callback) {
    while (px.level < 3 && px.xp >= px.xpNeeded) {
      px.level += 1;
      px.xpNeeded = getXpNeeded(px.level);
      px.atk += 3;
      px.def += 1;
      px.maxHp += 8;
      px.hp = px.maxHp;
      callback?.(`Level ${px.level}!`);
    }
  }

  // ── Tile passability check ────────────────────────────────────────────────────
  function tilePassable(area, col, row) {
    if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return false;
    const maps = G.current.maps;
    const tile = maps[area][row][col];
    return PASSABLE.has(tile);
  }

  // ── Enemy-occupied check ──────────────────────────────────────────────────────
  function enemyAt(area, col, row) {
    return G.current.enemies.find(
      e => !e.dead && e.area === area && e.x === col && e.y === row
    ) ?? null;
  }

  // ── Attempt player movement ───────────────────────────────────────────────────
  function tryMove(dx, dy) {
    const g = G.current;
    if (!g) return;
    if (g.moveDelay > 0) return;

    const px = g.player;
    const nx = px.x + dx;
    const ny = px.y + dy;

    if (!tilePassable(g.area, nx, ny)) return;

    // Check enemy collision → start battle
    const foe = enemyAt(g.area, nx, ny);
    if (foe) {
      startBattle(foe);
      return;
    }

    px.x = nx;
    px.y = ny;
    g.moveDelay = 8; // frames before next move

    // Check area transition edges
    checkAreaTransition();
    checkChestAndSign();
  }

  // ── Area transitions ──────────────────────────────────────────────────────────
  function checkAreaTransition() {
    const g = G.current;
    const { x, y, area } = g.player;
    // Village → Forest: reach top row
    if (area === 0 && y === 1) {
      g.area = 1;
      g.player.x = 10;
      g.player.y = 13;
      spawnFloat("🌲 Hutan Gelap", CW / 2, CH / 2, "#86efac", 20);
    }
    // Forest → Village: bottom row
    if (area === 1 && y === ROWS - 2) {
      g.area = 0;
      g.player.x = 10;
      g.player.y = 2;
    }
    // Forest → Dungeon: right edge
    if (area === 1 && x === COLS - 2) {
      g.area = 2;
      g.player.x = 1;
      g.player.y = 7;
      spawnFloat("💀 Penjara Bawah Tanah", CW / 2, CH / 2, "#f472b6", 18);
    }
    // Dungeon → Forest: left edge
    if (area === 2 && x === 1) {
      g.area = 1;
      g.player.x = COLS - 3;
      g.player.y = 7;
    }
  }

  // ── Chest / sign interaction ──────────────────────────────────────────────────
  function checkChestAndSign(force = false) {
    const g = G.current;
    const { x, y, area } = g.player;
    // auto-step on chest
    const chest = g.chests.find(c => !c.opened && c.area === area && c.x === x && c.y === y);
    if (chest) openChest(chest);
  }

  function interactNearby() {
    const g = G.current;
    if (!g) return;
    const { x, y, area } = g.player;
    const dirs = [[0,0],[1,0],[-1,0],[0,1],[0,-1]];

    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;

      // NPC
      if (area === 0) {
        const npc = NPCS_VILLAGE.find(n => n.x === nx && n.y === ny);
        if (npc) {
          setDialog({ name: npc.name, text: npc.dialog });
          return;
        }
      }

      // Chest
      const chest = g.chests.find(c => !c.opened && c.area === area && c.x === nx && c.y === ny);
      if (chest) { openChest(chest); return; }

      // Sign
      const sign = SIGNS.find(s => s.area === area && s.x === nx && s.y === ny);
      if (sign) {
        setDialog({ name: "Papan Tanda", text: sign.text });
        return;
      }
    }

    // Dungeon exit
    if (area === 2 && x === DUNGEON_EXIT.x && y === DUNGEON_EXIT.y) {
      // win only if boss dead
      const boss = g.enemies.find(e => e.type === "boss");
      if (boss?.dead) {
        setScreen("win");
      } else {
        setDialog({ name: "Pintu Keluar", text: "⚠ Kamu harus mengalahkan Raja Iblis terlebih dahulu!" });
      }
    }
  }


  // ── Open chest ───────────────────────────────────────────────────────────────
  function openChest(chest) {
    const g = G.current;
    chest.opened = true;
    const px = g.player;
    if (chest.item === "potion") {
      px.potions += 1;
      spawnFloat(`+1 Obat! (${px.potions})`, chest.x * TILE + 20, chest.y * TILE - 10, "#22c55e", 14);
      setDialog({ name: "Peti Harta", text: `✨ ${chest.label} — Obat bertambah!` });
    } else if (chest.item === "sword") {
      px.atk += 3;
      spawnFloat(`+3 ATK!`, chest.x * TILE + 20, chest.y * TILE - 10, "#fbbf24", 14);
      setDialog({ name: "Peti Harta", text: `⚔️ ${chest.label} — Serangan meningkat!` });
    } else if (chest.item === "armor") {
      px.def += 2;
      spawnFloat(`+2 DEF!`, chest.x * TILE + 20, chest.y * TILE - 10, "#60a5fa", 14);
      setDialog({ name: "Peti Harta", text: `🛡️ ${chest.label} — Pertahanan meningkat!` });
    }
  }

  // ── Battle start ─────────────────────────────────────────────────────────────
  function startBattle(enemy) {
    const g = G.current;
    g.activeBattle = enemy;
    g.player.defending = false;
    setBattle({
      enemy: { ...enemy },
      log: `⚔️ ${enemy.name} menyerangmu!`,
      playerTurn: true,
      busy: false,
    });
    setScreen("battle");
  }

  // ── Battle actions ────────────────────────────────────────────────────────────
  function battleAction(action) {
    const g = G.current;
    if (!g || !g.activeBattle) return;

    setBattle(prev => {
      if (!prev || prev.busy || !prev.playerTurn) return prev;

      const enemy  = g.activeBattle;
      const player = g.player;
      let log = "";
      let nextPlayerTurn = false;

      if (action === "attack") {
        const dmg = Math.max(1, player.atk - enemy.def + Math.floor(Math.random() * 4) - 1);
        enemy.hp -= dmg;
        spawnFloat(`-${dmg}`, enemy.x * TILE + 20, enemy.y * TILE - 10, "#ef4444", 18);
        log = `⚔️ Kamu menyerang ${enemy.name} sebesar ${dmg} HP!`;
        player.defending = false;
        if (enemy.hp <= 0) {
          enemy.hp = 0;
          enemy.dead = true;
          player.xp += enemy.xp;
          const oldLevel = player.level;
          checkLevelUp(player, (msg) => spawnFloat(`✨ ${msg}`, CW / 2, CH / 2, "#fbbf24", 22));
          const levelMsg = player.level > oldLevel ? ` Level up → ${player.level}!` : "";
          setScreen("play");
          g.activeBattle = null;
          // slight delay then clear
          setTimeout(() => setBattle(null), 50);
          return { ...prev, enemy: { ...enemy }, log: `💀 ${enemy.name} dikalahkan! +${enemy.xp} XP.${levelMsg}`, busy: false, playerTurn: false };
        }
      } else if (action === "defend") {
        player.defending = true;
        log = `🛡️ Kamu bertahan! Pertahanan meningkat sementara.`;
        nextPlayerTurn = false;
      } else if (action === "heal") {
        if (player.potions <= 0) {
          return { ...prev, log: "❌ Tidak ada obat tersisa!" };
        }
        player.potions -= 1;
        const heal = Math.min(8, player.maxHp - player.hp);
        player.hp += heal;
        spawnFloat(`+${heal} HP`, player.x * TILE + 20, player.y * TILE - 10, "#22c55e", 16);
        log = `💊 Kamu minum obat! +${heal} HP. Sisa obat: ${player.potions}`;
        player.defending = false;
        nextPlayerTurn = false;
      } else if (action === "flee") {
        const success = Math.random() > 0.5;
        if (success) {
          player.defending = false;
          g.activeBattle = null;
          setScreen("play");
          setTimeout(() => setBattle(null), 50);
          return { ...prev, log: "💨 Kamu berhasil melarikan diri!", busy: false };
        } else {
          log = "❌ Kamu tidak bisa melarikan diri!";
          player.defending = false;
          nextPlayerTurn = false;
        }
      }

      // Enemy counterattack
      const newState = { ...prev, enemy: { ...enemy }, log, busy: true, playerTurn: false };

      setTimeout(() => {
        setBattle(bs => {
          if (!bs || !g.activeBattle) return bs;
          const defMult = player.defending ? 0.5 : 1;
          const eDmg = Math.max(1, Math.floor((enemy.atk - player.def * defMult) + Math.random() * 3 - 1));
          player.hp -= eDmg;
          player.defending = false;
          spawnFloat(`-${eDmg}`, player.x * TILE + 20, player.y * TILE - 20, "#fbbf24", 16);
          const elog = `👹 ${enemy.name} menyerang! -${eDmg} HP.`;
          if (player.hp <= 0) {
            player.hp = 0;
            setScreen("gameover");
            g.activeBattle = null;
            setTimeout(() => setBattle(null), 100);
            return { ...bs, log: `💀 ${elog} Kamu gugur...`, busy: false, playerTurn: false };
          }
          return { ...bs, log: elog, busy: false, playerTurn: true };
        });
      }, 900);

      return newState;
    });
  }


  // ── Enemy wandering AI ────────────────────────────────────────────────────────
  function wanderEnemies() {
    const g = G.current;
    if (!g) return;
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    for (const e of g.enemies) {
      if (e.dead || e.area !== g.area) continue;
      if (Math.random() > 0.35) continue; // not every tick
      const d = dirs[Math.floor(Math.random() * 4)];
      const nx = e.x + d[0];
      const ny = e.y + d[1];
      if (!tilePassable(g.area, nx, ny)) continue;
      // don't stack on each other
      if (g.enemies.some(o => !o.dead && o.id !== e.id && o.area === g.area && o.x === nx && o.y === ny)) continue;
      // don't walk onto player
      if (nx === g.player.x && ny === g.player.y) {
        startBattle(e);
        return;
      }
      e.x = nx;
      e.y = ny;
    }
  }

  // ── Game loop ─────────────────────────────────────────────────────────────────
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) { rafRef.current = requestAnimationFrame(gameLoop); return; }
    const ctx = canvas.getContext("2d");
    const g = G.current;

    const currentScreen = screenRef.current;

    ctx.clearRect(0, 0, CW, CH);

    if (currentScreen === "intro") {
      drawIntroScreen(ctx, g ? g.tick : 0);
    } else if (currentScreen === "win") {
      drawWinScreen(ctx, g ? g.player : { level:1,xp:0,hp:30,maxHp:30,atk:8,def:3 }, g ? g.tick : 0);
    } else if (currentScreen === "gameover") {
      drawGameOverScreen(ctx, g ? g.tick : 0);
    } else {
      // play or battle
      if (!g) { rafRef.current = requestAnimationFrame(gameLoop); return; }

      // Update move delay
      if (g.moveDelay > 0) g.moveDelay--;

      // Smooth pixel lerp
      const tp = { x: g.player.x * TILE, y: g.player.y * TILE };
      g.player.px += (tp.x - g.player.px) * 0.3;
      g.player.py += (tp.y - g.player.py) * 0.3;

      // Enemy wander every 18 frames
      g.enemyMoveTimer = (g.enemyMoveTimer || 0) + 1;
      if (g.enemyMoveTimer >= 18 && currentScreen === "play") {
        g.enemyMoveTimer = 0;
        wanderEnemies();
      }

      // Keyboard movement (only when playing, not in battle/dialog)
      if (currentScreen === "play") {
        const k = g.keys;
        if ((k["ArrowUp"]    || k["w"] || k["W"]) && g.moveDelay === 0) tryMove(0, -1);
        if ((k["ArrowDown"]  || k["s"] || k["S"]) && g.moveDelay === 0) tryMove(0, 1);
        if ((k["ArrowLeft"]  || k["a"] || k["A"]) && g.moveDelay === 0) tryMove(-1, 0);
        if ((k["ArrowRight"] || k["d"] || k["D"]) && g.moveDelay === 0) tryMove(1, 0);
      }

      // Render map
      renderMap(ctx, g.maps[g.area], g.tick, g.chests, g.area);

      // Dungeon exit marker
      if (g.area === 2) drawExitMarker(ctx, g.tick);

      // Render NPCs (only in village)
      if (g.area === 0) {
        for (const npc of NPCS_VILLAGE) {
          drawNpc(ctx, npc, npc.x * TILE, npc.y * TILE, g.tick);
        }
      }

      // Render enemies
      for (const e of g.enemies) {
        if (!e.dead && e.area === g.area) {
          drawEnemy(ctx, e, e.x * TILE, e.y * TILE, g.tick);
        }
      }

      // Render player
      drawPlayer(ctx, g.player.px, g.player.py, g.tick, g.player.hp, g.player.maxHp);

      // HUD
      drawHUD(ctx, g.player);

      // Float texts
      g.floatTexts = g.floatTexts.filter(ft => ft.alpha > 0.02);
      for (const ft of g.floatTexts) {
        ft.y += ft.vy;
        ft.alpha -= 0.018;
      }
      drawFloatTexts(ctx, g.floatTexts);
    }

    if (g) g.tick++;
    rafRef.current = requestAnimationFrame(gameLoop);
  }, []);

  // Keep screen ref in sync so the gameLoop callback (closure) can read it
  const screenRef = useRef("intro");
  useEffect(() => { screenRef.current = screen; }, [screen]);


  // ── Keyboard handling ─────────────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e) {
      const g = G.current;
      if (!g) return;
      g.keys[e.key] = true;

      // Interact
      if ((e.key === " " || e.key === "Enter") && screenRef.current === "play") {
        e.preventDefault();
        interactNearby();
      }
      // Start game from intro
      if ((e.key === "Enter" || e.key === " ") && screenRef.current === "intro") {
        e.preventDefault();
        initGame();
        setScreen("play");
      }
      // Retry from gameover
      if ((e.key === "Enter" || e.key === " ") && screenRef.current === "gameover") {
        e.preventDefault();
        initGame();
        setScreen("play");
        setBattle(null);
        setDialog(null);
      }
      // Arrow key scroll prevention
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) {
        e.preventDefault();
      }
    }
    function onKeyUp(e) {
      const g = G.current;
      if (g) g.keys[e.key] = false;
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup",   onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup",   onKeyUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Canvas click (intro start / gameover retry) ───────────────────────────────
  function handleCanvasClick(e) {
    if (screenRef.current === "intro") {
      initGame();
      setScreen("play");
    } else if (screenRef.current === "gameover") {
      initGame();
      setScreen("play");
      setBattle(null);
      setDialog(null);
    }
  }

  // ── DPad handlers ──────────────────────────────────────────────────────────────
  const dpadUp    = useCallback(() => { if (G.current && screenRef.current === "play") tryMove(0, -1);  }, []);
  const dpadDown  = useCallback(() => { if (G.current && screenRef.current === "play") tryMove(0, 1);   }, []);
  const dpadLeft  = useCallback(() => { if (G.current && screenRef.current === "play") tryMove(-1, 0);  }, []);
  const dpadRight = useCallback(() => { if (G.current && screenRef.current === "play") tryMove(1, 0);   }, []);
  const dpadAct   = useCallback(() => { if (G.current && screenRef.current === "play") interactNearby(); }, []);

  // ── Start RAF ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    initGame();
    rafRef.current = requestAnimationFrame(gameLoop);
    setHasChanges(true);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setHasChanges(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameLoop]);


  // ─── Render ───────────────────────────────────────────────────────────────────
  const playerForUI = G.current?.player ?? { hp: 30, maxHp: 30, atk: 8, def: 3, potions: 3 };

  return (
    <div className={styles.wrapper}>
      {/* Canvas frame */}
      <div className={styles.canvasFrame}>
        <canvas
          ref={canvasRef}
          width={CW}
          height={CH}
          className={styles.canvas}
          onClick={handleCanvasClick}
          tabIndex={0}
          aria-label="RPG Game Canvas"
        />

        {/* Battle overlay */}
        {screen === "battle" && battleState && G.current && (
          <div className={styles.battleOverlay}>
            <div className={styles.battleCard}>
              <div className={styles.battleTitle}>⚔ PERTEMPURAN ⚔</div>
              <div className={styles.battleEnemyName}>{battleState.enemy.name}</div>

              {/* Enemy sprite (drawn inline via canvas in overlay — use a mini canvas) */}
              <BattleSprite type={battleState.enemy.type} tick={G.current.tick} />

              <div className={styles.battleStats}>
                {/* Enemy HP */}
                <div className={styles.battleStatBox}>
                  <span>Musuh HP</span>
                  <strong>{Math.max(0, G.current.activeBattle?.hp ?? battleState.enemy.hp)}</strong>
                  <div className={styles.hpBar}>
                    <div
                      className={`${styles.hpFill} ${styles.hpFillEnemy}`}
                      style={{
                        width: `${Math.max(0, (G.current.activeBattle?.hp ?? battleState.enemy.hp) / ENEMY_TEMPLATES[battleState.enemy.type].hp * 100).toFixed(1)}%`
                      }}
                    />
                  </div>
                </div>
                {/* Player HP */}
                <div className={styles.battleStatBox}>
                  <span>HP-mu</span>
                  <strong>{G.current.player.hp}</strong>
                  <div className={styles.hpBar}>
                    <div
                      className={styles.hpFill}
                      style={{ width: `${(G.current.player.hp / G.current.player.maxHp * 100).toFixed(1)}%` }}
                    />
                  </div>
                </div>
                {/* Potions */}
                <div className={styles.battleStatBox}>
                  <span>Obat</span>
                  <strong>💊 {G.current.player.potions}</strong>
                </div>
              </div>

              <div className={styles.battleLog}>{battleState.log}</div>

              <div className={styles.battleBtns}>
                <button
                  className={`${styles.battleBtn} ${styles.btnAttack}`}
                  onClick={() => battleAction("attack")}
                  disabled={!battleState.playerTurn || battleState.busy}
                >⚔️ Serang</button>
                <button
                  className={`${styles.battleBtn} ${styles.btnDefend}`}
                  onClick={() => battleAction("defend")}
                  disabled={!battleState.playerTurn || battleState.busy}
                >🛡️ Bertahan</button>
                <button
                  className={`${styles.battleBtn} ${styles.btnHeal}`}
                  onClick={() => battleAction("heal")}
                  disabled={!battleState.playerTurn || battleState.busy || G.current.player.potions <= 0}
                >💊 Obat ({G.current.player.potions})</button>
                <button
                  className={`${styles.battleBtn} ${styles.btnFlee}`}
                  onClick={() => battleAction("flee")}
                  disabled={!battleState.playerTurn || battleState.busy}
                >💨 Lari</button>
              </div>
            </div>
          </div>
        )}

        {/* Dialog overlay */}
        {dialog && (
          <div className={styles.dialogOverlay}>
            <div className={styles.dialogBox}>
              <div className={styles.dialogName}>{dialog.name}</div>
              <p className={styles.dialogText}>{dialog.text}</p>
              <button className={styles.dialogClose} onClick={() => setDialog(null)}>Tutup</button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile action button */}
      <button
        className={styles.actionBtn}
        onTouchStart={(e) => { e.preventDefault(); dpadAct(); }}
        onClick={dpadAct}
        aria-label="Interaksi"
      >
        ⚔️
      </button>

      {/* DPad for mobile */}
      {(screen === "play" || screen === "battle") && (
        <DPad
          onUp={dpadUp}
          onDown={dpadDown}
          onLeft={dpadLeft}
          onRight={dpadRight}
          side="right"
        />
      )}
    </div>
  );
}


// ─── BattleSprite — small canvas showing the enemy in the battle overlay ──────
function BattleSprite({ type, tick }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame = 0;
    let id;
    function draw() {
      ctx.clearRect(0, 0, 120, 100);
      drawBattleEnemySprite(ctx, type, 60, 60, frame);
      frame++;
      id = requestAnimationFrame(draw);
    }
    id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, [type]);

  return (
    <canvas
      ref={ref}
      width={120}
      height={100}
      style={{ display: "block", margin: "0 auto 6px", imageRendering: "pixelated" }}
      aria-hidden="true"
    />
  );
}
