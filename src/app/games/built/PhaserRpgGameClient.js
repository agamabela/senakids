"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./PhaserRpgGameClient.module.css";

// ─── Tile IDs ──────────────────────────────────────────────────────────────
const T = {
  GRASS: 0, WATER: 1, DIRT: 2, STONE: 3, TREE: 4,
  WALL: 5,  CHEST: 6, SIGN: 7,  PATH: 8,  FLOWER: 9,
  DARK: 10, DOOR: 11,
};
const SOLID = new Set([T.WATER, T.TREE, T.WALL, T.DARK]);

// ─── Map data (3 areas, each 30×20 tiles at 16 px) ─────────────────────────
const TILE = 16;
const MAP_W = 30;
const MAP_H = 20;

function makeMap() {
  const G=T.GRASS, W=T.WATER, D=T.DIRT, S=T.STONE, Tr=T.TREE;
  const Wa=T.WALL, C=T.CHEST, P=T.PATH, F=T.FLOWER;
  const Dk=T.DARK, Dr=T.DOOR;
  return [
    // ── Area 0 – Village (30×20) ──
    {
      name: "Desa Cahaya",
      bg: "#4a7c59",
      tiles: [
        [S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S],
        [S,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,S],
        [S,G,Tr,Tr,G,G,P,P,P,P,P,G,G,G,Tr,Tr,G,G,G,G,G,G,G,G,Tr,G,G,G,G,S],
        [S,G,Tr,Wa,Wa,G,P,G,G,G,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,S],
        [S,G,G,Wa,Wa,G,P,G,C,G,P,G,G,G,G,G,G,G,G,G,F,G,F,G,G,G,G,G,G,S],
        [S,G,G,G,G,G,P,G,G,G,P,G,Tr,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,S],
        [S,G,G,G,G,G,P,P,P,P,P,P,P,P,P,P,P,G,G,G,G,G,G,G,Wa,Wa,G,G,G,S],
        [S,G,G,G,G,G,G,G,G,G,G,G,P,G,G,G,P,G,G,G,G,G,G,G,Wa,Wa,G,G,G,S],
        [S,G,F,G,G,G,G,G,G,G,G,G,P,G,G,G,P,G,G,G,G,G,G,G,G,G,G,G,G,S],
        [S,G,G,G,Tr,Tr,G,G,G,G,G,G,P,G,G,G,P,G,G,G,G,G,G,G,G,G,G,G,G,S],
        [S,G,G,G,Tr,Tr,G,G,G,G,G,G,P,G,G,G,P,G,G,G,G,G,G,G,G,G,G,C,G,S],
        [S,G,G,G,G,G,G,G,G,G,G,G,P,P,P,P,P,G,G,G,G,G,G,G,G,G,G,G,G,S],
        [S,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,F,G,G,G,G,G,G,G,S],
        [S,G,G,Tr,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,S],
        [S,G,G,G,G,G,G,G,G,F,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,S],
        [S,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,S],
        [S,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,S],
        [S,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,S],
        [S,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,Dr],
        [S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S],
      ],
      npcs: [
        { id:"npc1", tx:8,  ty:3,  name:"Nenek Sari",  msg:"Hati-hati nak! Hutan di timur sangat berbahaya!", color:0xff69b4 },
        { id:"npc2", tx:16, ty:3,  name:"Pak Guru",    msg:"Kumpulkan XP dari musuh untuk naik level. ATK dan DEF-mu akan meningkat!", color:0x4169e1 },
        { id:"npc3", tx:4,  ty:11, name:"Petani Budi", msg:"Raja Iblis bersembunyi di penjara bawah tanah. Dia sangat kuat!", color:0x228b22 },
      ],
      enemies: [
        { id:"e1", type:"slime",    tx:20, ty:8  },
        { id:"e2", type:"slime",    tx:25, ty:14 },
      ],
      chests: [
        { id:"ch0", tx:8,  ty:4,  item:"potion",  taken:false },
        { id:"ch1", tx:27, ty:10, item:"sword",   taken:false },
      ],
      exits: [
        { tx:29, ty:18, toArea:1, toTx:1, toTy:10 },
      ],
    },
    // ── Area 1 – Forest (30×20) ──
    {
      name: "Hutan Gelap",
      bg: "#1a3a1a",
      tiles: [
        [S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S],
        [S,Tr,Tr,Tr,G,G,Tr,Tr,Tr,Tr,G,Tr,Tr,Tr,Tr,G,Tr,Tr,Tr,G,G,G,G,Tr,Tr,Tr,G,Tr,Tr,S],
        [S,Tr,G,G,G,G,G,Tr,G,G,G,G,Tr,G,G,G,G,Tr,G,G,G,G,G,G,Tr,G,G,G,Tr,S],
        [S,Tr,G,Tr,G,G,G,G,G,G,G,Tr,G,G,F,G,G,G,G,G,G,G,G,G,G,G,G,G,Tr,S],
        [S,G,G,G,G,Tr,Tr,Tr,G,G,G,G,G,G,G,Tr,G,G,G,G,G,G,G,G,G,G,G,G,Tr,S],
        [S,G,F,G,G,G,G,Tr,G,C,G,G,Tr,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,Tr,S],
        [S,Tr,G,G,Tr,G,G,G,G,G,G,G,G,G,Tr,G,G,G,G,G,G,G,G,G,G,G,G,G,Tr,S],
        [S,Tr,Tr,G,G,G,F,G,G,G,G,F,G,G,G,G,Tr,G,G,G,G,G,G,G,G,G,Tr,G,Tr,S],
        [S,Tr,G,G,Tr,Tr,G,G,Tr,G,G,G,G,Tr,G,G,G,G,G,G,G,G,G,G,G,G,G,G,Tr,S],
        [S,G,G,Tr,G,G,G,G,G,G,Tr,G,G,G,G,F,G,G,G,G,G,G,G,G,G,G,G,G,Tr,S],
        [Dr,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,Dr],
        [S,G,F,G,G,G,Tr,G,G,G,G,G,G,G,Tr,G,G,G,G,G,G,G,G,G,G,G,G,G,Tr,S],
        [S,Tr,G,G,Tr,G,G,F,G,G,G,G,F,G,G,G,G,G,G,G,G,G,G,G,G,G,Tr,Tr,Tr,S],
        [S,Tr,Tr,G,G,G,G,G,G,Tr,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,Tr,Tr,S],
        [S,Tr,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,Tr,S],
        [S,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,Tr,S],
        [S,G,Tr,Tr,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,S],
        [S,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,S],
        [S,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,Dr],
        [S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S],
      ],
      npcs: [
        { id:"npc4", tx:15, ty:5, name:"Penjelajah", msg:"Musuh di sini lebih kuat. Pastikan kamu sudah Level 2 sebelum masuk penjara!", color:0xff8c00 },
      ],
      enemies: [
        { id:"e3", type:"bat",      tx:10, ty:3  },
        { id:"e4", type:"bat",      tx:22, ty:7  },
        { id:"e5", type:"skeleton", tx:15, ty:13 },
      ],
      chests: [
        { id:"ch2", tx:9, ty:5, item:"potion", taken:false },
      ],
      exits: [
        { tx:0,  ty:10, toArea:0, toTx:28, toTy:18 },
        { tx:29, ty:10, toArea:2, toTx:1,  toTy:10 },
        { tx:29, ty:18, toArea:2, toTx:1,  toTy:10 },
      ],
    },
    // ── Area 2 – Dungeon (30×20) ──
    {
      name: "Penjara Bawah Tanah",
      bg: "#0d0d1a",
      tiles: [
        [Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk],
        [Dk,D,D,D,D,D,Wa,D,D,D,D,D,D,D,Wa,D,D,D,D,D,D,D,D,D,D,D,D,D,D,Dk],
        [Dk,D,Wa,Wa,D,D,Wa,D,Wa,Wa,Wa,D,Wa,D,Wa,D,Wa,Wa,D,D,D,D,D,D,Wa,D,D,D,D,Dk],
        [Dk,D,Wa,D,D,D,D,D,Wa,D,D,D,Wa,D,D,D,Wa,D,D,D,D,D,D,D,Wa,D,Wa,Wa,D,Dk],
        [Dk,D,D,D,Wa,Wa,Wa,D,Wa,D,Wa,Wa,Wa,D,Wa,Wa,Wa,D,Wa,D,D,D,D,D,D,D,Wa,D,D,Dk],
        [Dk,D,Wa,D,Wa,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,Dk],
        [Dk,D,Wa,D,Wa,D,Wa,Wa,Wa,D,Wa,Wa,Wa,D,Wa,Wa,Wa,D,Wa,Wa,Wa,D,D,D,D,D,D,D,D,Dk],
        [Dk,D,D,D,D,D,Wa,D,D,D,D,D,Wa,D,D,D,Wa,Wa,D,D,Wa,Wa,D,D,D,D,D,D,D,Dk],
        [Dk,Dk,Wa,D,Wa,D,Wa,D,Wa,D,Wa,D,D,D,Wa,D,D,D,Wa,D,D,D,D,D,D,D,D,D,D,Dk],
        [Dk,D,D,D,Wa,D,D,D,Wa,D,Wa,D,Wa,Wa,Wa,D,Wa,D,Wa,D,D,D,D,D,D,D,D,D,D,Dk],
        [Dr,D,D,D,D,D,Wa,D,D,D,D,D,Wa,D,D,D,Wa,D,D,D,D,D,D,D,D,D,D,D,D,Dk],
        [Dk,D,Wa,Wa,Wa,D,Wa,D,Wa,Wa,Wa,D,Wa,D,Wa,D,D,D,D,D,D,D,D,D,D,D,D,C,D,Dk],
        [Dk,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,Wa,Wa,D,Dk],
        [Dk,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,Dk],
        [Dk,D,Wa,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,Dk],
        [Dk,D,Wa,Wa,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,Dk],
        [Dk,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,Dk],
        [Dk,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,Dk],
        [Dk,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,Dk],
        [Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk,Dk],
      ],
      npcs: [],
      enemies: [
        { id:"e6", type:"skeleton", tx:8,  ty:5  },
        { id:"e7", type:"skeleton", tx:18, ty:9  },
        { id:"e8", type:"boss",     tx:22, ty:6  },
      ],
      chests: [
        { id:"ch3", tx:27, ty:11, item:"elixir", taken:false },
      ],
      exits: [
        { tx:0,  ty:10, toArea:1, toTx:28, toTy:10 },
        { tx:27, ty:11, isWin:true },
      ],
    },
  ];
}

// ─── Enemy & Player stats ───────────────────────────────────────────────────
const ENEMY_STATS = {
  slime:    { hp:10,  atk:4,  def:1, xp:8,   name:"Slime"       },
  bat:      { hp:8,   atk:5,  def:1, xp:10,  name:"Kelelawar"   },
  skeleton: { hp:15,  atk:6,  def:2, xp:15,  name:"Kerangka"    },
  boss:     { hp:40,  atk:10, def:5, xp:100, name:"Raja Iblis"  },
};
const LEVEL_XP = [0, 25, 60, 120, 999999];

function freshPlayer() {
  return { hp:30, maxHp:30, atk:8, def:3, level:1, xp:0, potions:3, defending:false };
}

// ─── Phaser Scene ───────────────────────────────────────────────────────────
// All Phaser logic lives in this class, instantiated inside useEffect.
// Communication to React is via custom DOM events dispatched on window.

class RpgScene {
  constructor(Phaser, parentEl, mapData, initialState) {
    this._Phaser = Phaser;
    this._parent = parentEl;
    this._mapData = mapData;
    this._state = initialState;   // { areaIdx, px, py, player, defeatedEnemies, takenChests }

    this._game = null;
    this._scene = null;
    this._destroyed = false;
  }

  // ── internal helpers ──────────────────────────────────────────────────────
  _emit(type, detail) {
    if (this._destroyed) return;
    window.dispatchEvent(new CustomEvent("rpg:" + type, { detail }));
  }

  _tileAt(tx, ty) {
    const area = this._mapData[this._state.areaIdx];
    if (ty < 0 || ty >= MAP_H || tx < 0 || tx >= MAP_W) return T.WALL;
    return area.tiles[ty][tx];
  }

  _isSolid(tx, ty) {
    const tile = this._tileAt(tx, ty);
    if (SOLID.has(tile)) return true;
    // NPCs block
    const area = this._mapData[this._state.areaIdx];
    for (const npc of area.npcs) {
      if (npc.tx === tx && npc.ty === ty) return true;
    }
    return false;
  }

  // ── Texture creation ──────────────────────────────────────────────────────
  _createTextures(scene) {
    const g = scene.add.graphics();
    const S = TILE;

    const makeTex = (key, drawFn) => {
      g.clear();
      drawFn(g);
      g.generateTexture(key, S, S);
    };

    // GRASS
    makeTex("t_grass", (g) => {
      g.fillStyle(0x4a7c59); g.fillRect(0,0,S,S);
      g.fillStyle(0x5a9c6a,0.6);
      for (let i=0;i<6;i++) { const cx=2+i*2,cy=3+i%3*3,r=1; g.beginPath(); g.arc(cx,cy,r,0,Math.PI*2); g.fillPath(); }
    });
    // WATER
    makeTex("t_water", (g) => {
      g.fillStyle(0x116677); g.fillRect(0,0,S,S);
      g.fillStyle(0x1899aa,0.5);
      g.fillRect(0,4,S,2); g.fillRect(0,10,S,2);
    });
    // DIRT
    makeTex("t_dirt", (g) => {
      g.fillStyle(0x8b6040); g.fillRect(0,0,S,S);
      g.fillStyle(0x7a5535,0.4);
      g.fillRect(2,2,4,2); g.fillRect(10,8,3,2);
    });
    // STONE
    makeTex("t_stone", (g) => {
      g.fillStyle(0x555444); g.fillRect(0,0,S,S);
      g.lineStyle(1,0x333322,0.7);
      g.strokeRect(1,1,S-2,S-2);
      g.strokeRect(4,4,S-8,S-8);
    });
    // TREE
    makeTex("t_tree", (g) => {
      g.fillStyle(0x162a0e); g.fillRect(0,0,S,S);
      g.fillStyle(0x1e4a18); g.beginPath(); g.arc(S/2,S/2+1,6,0,Math.PI*2); g.fillPath();
      g.fillStyle(0x2a5a22); g.beginPath(); g.arc(S/2,S/2-1,5,0,Math.PI*2); g.fillPath();
    });
    // WALL
    makeTex("t_wall", (g) => {
      g.fillStyle(0x444333); g.fillRect(0,0,S,S);
      g.fillStyle(0x222211,0.5); g.fillRect(0,S-3,S,3);
      g.fillStyle(0x666655,0.4); g.fillRect(0,0,S,3);
      g.lineStyle(1,0x333322,0.5);
      g.strokeRect(2,2,S-4,S-4);
    });
    // CHEST
    makeTex("t_chest", (g) => {
      g.fillStyle(0x885522); g.fillRect(1,3,S-2,S-5);
      g.fillStyle(0xddaa00); g.fillRect(5,6,6,4);
      g.fillStyle(0xffd700); g.beginPath(); g.arc(8,8,2,0,Math.PI*2); g.fillPath();
      g.lineStyle(1,0x552200); g.strokeRect(1,3,S-2,S-5);
    });
    // CHEST OPEN
    makeTex("t_chest_open", (g) => {
      g.fillStyle(0x664400); g.fillRect(1,4,S-2,S-6);
      g.fillStyle(0x885522); g.fillRect(1,3,S-2,4);
      g.lineStyle(1,0x442200); g.strokeRect(1,3,S-2,S-6);
    });
    // PATH
    makeTex("t_path", (g) => {
      g.fillStyle(0x9b8060); g.fillRect(0,0,S,S);
      g.fillStyle(0x8a7050,0.5);
      g.fillRect(3,3,2,2); g.fillRect(10,8,2,2);
    });
    // FLOWER
    makeTex("t_flower", (g) => {
      g.fillStyle(0x4a7c59); g.fillRect(0,0,S,S);
      g.fillStyle(0xffee22); g.beginPath(); g.arc(5,5,2,0,Math.PI*2); g.fillPath(); g.beginPath(); g.arc(11,9,2,0,Math.PI*2); g.fillPath(); g.beginPath(); g.arc(7,13,2,0,Math.PI*2); g.fillPath();
    });
    // DARK floor
    makeTex("t_dark", (g) => {
      g.fillStyle(0x111122); g.fillRect(0,0,S,S);
    });
    // DOOR
    makeTex("t_door", (g) => {
      g.fillStyle(0xaa6644); g.fillRect(0,0,S,S);
      g.fillStyle(0x884422); g.fillRect(3,4,S-6,S-4);
      g.fillStyle(0xddaa55); g.beginPath(); g.arc(10,S/2,2,0,Math.PI*2); g.fillPath();
      g.lineStyle(1,0x552200); g.strokeRect(3,4,S-6,S-4);
    });
    // SIGN
    makeTex("t_sign", (g) => {
      g.fillStyle(0x4a7c59); g.fillRect(0,0,S,S);
      g.fillStyle(0xaa8855); g.fillRect(4,3,8,6); g.fillRect(7,9,2,5);
      g.lineStyle(1,0x664400); g.strokeRect(4,3,8,6);
    });

    // ── Player sprites (4 directions) 16×24 ──
    const PW=16, PH=24;
    const drawPlayer = (g, dir) => {
      // legs
      g.fillStyle(0x223355); g.fillRect(4,17,3,5); g.fillRect(9,17,3,5);
      // body
      g.fillStyle(0x3355aa); g.fillRect(3,10,10,8);
      // head
      g.fillStyle(0xf4c27a); g.fillRect(4,5,8,8);
      // eyes (direction-based)
      g.fillStyle(0x000000);
      if (dir==="down")  { g.fillRect(5,8,2,2); g.fillRect(9,8,2,2); }
      if (dir==="up")    { /* back of head */ g.fillStyle(0x2a1a00); g.fillRect(5,6,6,2); }
      if (dir==="left")  { g.fillRect(4,8,2,2); }
      if (dir==="right") { g.fillRect(10,8,2,2); }
      // hat
      g.fillStyle(0x9b30e6); g.fillRect(2,3,12,3); g.fillRect(5,1,6,4);
      // arm hints
      g.fillStyle(0x3355aa); g.fillRect(1,10,3,6); g.fillRect(12,10,3,6);
    };
    ["down","up","left","right"].forEach(dir => {
      g.clear();
      drawPlayer(g, dir);
      g.generateTexture("player_"+dir, PW, PH);
    });

    // ── NPC base (colored hat) ──
    const drawNpc = (g, color) => {
      g.fillStyle(0x333333); g.fillRect(4,17,3,5); g.fillRect(9,17,3,5);
      g.fillStyle(0x888888); g.fillRect(3,10,10,8);
      g.fillStyle(0xf4c27a); g.fillRect(4,5,8,8);
      g.fillStyle(0x000000); g.fillRect(5,8,2,2); g.fillRect(9,8,2,2);
      g.fillStyle(color); g.fillRect(2,3,12,3); g.fillRect(5,1,6,4);
      g.fillStyle(0x888888); g.fillRect(1,10,3,6); g.fillRect(12,10,3,6);
    };
    const npcColors = [0xff69b4, 0x4169e1, 0x228b22, 0xff8c00, 0x00ced1];
    npcColors.forEach((col,i) => {
      g.clear(); drawNpc(g, col); g.generateTexture("npc_"+i, PW, PH);
    });

    // ── Enemy sprites 16×16 ──
    // slime
    g.clear();
    g.fillStyle(0x33cc44); g.fillRect(1,5,14,10);
    g.fillStyle(0x22aa33); g.fillRect(3,9,10,6);
    g.fillStyle(0x000000); g.beginPath(); g.arc(5,9,2,0,Math.PI*2); g.fillPath(); g.beginPath(); g.arc(11,9,2,0,Math.PI*2); g.fillPath();
    g.generateTexture("enemy_slime", 16, 16);

    // bat
    g.clear();
    g.fillStyle(0x553366); g.fillRect(4,6,8,7);
    g.fillStyle(0x331a44);
    g.fillTriangle(1,4,7,8,3,12);  // left wing
    g.fillTriangle(15,4,9,8,13,12); // right wing
    g.fillStyle(0xff2222); g.beginPath(); g.arc(5,7,2,0,Math.PI*2); g.fillPath(); g.beginPath(); g.arc(11,7,2,0,Math.PI*2); g.fillPath();
    g.generateTexture("enemy_bat", 16, 16);

    // skeleton
    g.clear();
    g.fillStyle(0xccccaa);
    g.beginPath(); g.arc(8,5,5,0,Math.PI*2); g.fillPath();  // skull
    g.fillRect(5,9,6,5);  // torso
    g.fillRect(3,10,3,4); g.fillRect(10,10,3,4); // arms
    g.fillRect(5,14,3,3); g.fillRect(8,14,3,3);  // legs
    g.fillStyle(0x000000); g.beginPath(); g.arc(6,5,1,0,Math.PI*2); g.fillPath(); g.beginPath(); g.arc(10,5,1,0,Math.PI*2); g.fillPath();
    g.generateTexture("enemy_skeleton", 16, 16);

    // boss
    g.clear();
    g.fillStyle(0xcc1111); g.fillRect(1,3,14,14);
    g.fillStyle(0xff3333); g.beginPath(); g.arc(8,6,6,0,Math.PI*2); g.fillPath(); // head
    g.fillStyle(0xffff00); g.beginPath(); g.arc(6,6,2,0,Math.PI*2); g.fillPath(); g.beginPath(); g.arc(10,6,2,0,Math.PI*2); g.fillPath(); // eyes
    g.fillStyle(0xcc1111);
    // horns
    g.fillTriangle(3,3,1,0,5,3); g.fillTriangle(13,3,15,0,11,3);
    g.fillStyle(0x000000); g.fillRect(6,9,2,1); g.fillRect(8,9,2,1); // mouth
    g.generateTexture("enemy_boss", 16, 16);

    g.destroy();
  }

  // ── Build scene ────────────────────────────────────────────────────────────
  _buildPhaserGame() {
    const Phaser = this._Phaser;
    const self = this;

    const config = {
      type: Phaser.AUTO,
      parent: this._parent,
      width: MAP_W * TILE,
      height: MAP_H * TILE,
      backgroundColor: "#0d0d1a",
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: {
        preload() {},
        create() { self._scene = this; self._onCreate(this); },
        update(time, delta) { self._onUpdate(this, time, delta); },
      },
      audio: { noAudio: true },
    };

    this._game = new Phaser.Game(config);
  }

  _onCreate(scene) {
    this._createTextures(scene);
    this._buildArea(scene, this._state.areaIdx);

    // camera
    scene.cameras.main.setBounds(0, 0, MAP_W*TILE, MAP_H*TILE);
    scene.cameras.main.startFollow(this._playerSprite, true, 0.1, 0.1);

    // keyboard
    this._cursors = scene.input.keyboard.createCursorKeys();
    this._wasd = scene.input.keyboard.addKeys("W,A,S,D");
    this._spaceKey = scene.input.keyboard.addKey(this._Phaser.Input.Keyboard.KeyCodes.SPACE);

    this._moving = false;
    this._moveTimer = 0;
    this._wanderTimers = {};
    this._lastUpdate = 0;

    // emit initial HUD
    this._emitHud();
    this._emit("areaChange", { name: this._mapData[this._state.areaIdx].name });
  }

  _buildArea(scene, areaIdx) {
    // clear previous
    if (this._tilesGroup) this._tilesGroup.destroy(true);
    if (this._npcsGroup)  this._npcsGroup.destroy(true);
    if (this._enemiesGroup) this._enemiesGroup.destroy(true);

    const area = this._mapData[areaIdx];
    this._tilesGroup   = scene.add.group();
    this._npcsGroup    = scene.add.group();
    this._enemiesGroup = scene.add.group();

    const TEX_MAP = {
      [T.GRASS]: "t_grass", [T.WATER]: "t_water", [T.DIRT]:  "t_dirt",
      [T.STONE]: "t_stone", [T.TREE]:  "t_tree",  [T.WALL]:  "t_wall",
      [T.CHEST]: "t_chest", [T.SIGN]:  "t_sign",  [T.PATH]:  "t_path",
      [T.FLOWER]:"t_flower",[T.DARK]:  "t_dark",  [T.DOOR]:  "t_door",
    };

    for (let ty=0; ty<MAP_H; ty++) {
      for (let tx=0; tx<MAP_W; tx++) {
        const tileId = area.tiles[ty][tx];
        // check if chest was taken
        const chestHere = area.chests && area.chests.find(c=>c.tx===tx&&c.ty===ty);
        let texKey = TEX_MAP[tileId] ?? "t_dark";
        if (chestHere && (this._state.takenChests[chestHere.id])) texKey = "t_chest_open";

        const img = scene.add.image(tx*TILE+TILE/2, ty*TILE+TILE/2, texKey);
        img.setOrigin(0.5);
        this._tilesGroup.add(img);
      }
    }

    // NPCs
    const NPC_COLORS = [0xff69b4, 0x4169e1, 0x228b22, 0xff8c00, 0x00ced1];
    area.npcs.forEach((npc, i) => {
      const texKey = "npc_" + (i % NPC_COLORS.length);
      const sp = scene.add.image(npc.tx*TILE+TILE/2, npc.ty*TILE+8, texKey);
      sp.setDepth(1);
      sp._npc = npc;
      this._npcsGroup.add(sp);
    });

    // Enemies
    area.enemies.forEach(en => {
      if (this._state.defeatedEnemies[en.id]) return;
      const texKey = "enemy_" + en.type;
      const sp = scene.add.image(en.tx*TILE+TILE/2, en.ty*TILE+TILE/2, texKey);
      sp.setDepth(1);
      sp._enemy = { ...en, ...ENEMY_STATS[en.type], curHp: ENEMY_STATS[en.type].hp };
      sp._tx = en.tx; sp._ty = en.ty;
      this._enemiesGroup.add(sp);
    });

    // Player sprite
    if (this._playerSprite) this._playerSprite.destroy();
    const st = this._state;
    this._playerSprite = scene.add.image(
      st.px*TILE+TILE/2, st.py*TILE+8, "player_down"
    );
    this._playerSprite.setDepth(2);
    this._playerDir = "down";

    scene.cameras.main.startFollow(this._playerSprite, true, 0.1, 0.1);
  }

  // ── Update loop ────────────────────────────────────────────────────────────
  _onUpdate(scene, time, delta) {
    if (this._destroyed) return;
    if (this._blocked) return;   // battle / dialog active

    this._lastUpdate += delta;

    // ── Player movement (tile-by-tile, 180ms cooldown) ──
    if (!this._moving && this._lastUpdate > 180) {
      let dx=0, dy=0;
      const cur = this._cursors;
      const w = this._wasd;
      const ext = this._extInput || {};

      if (cur.left.isDown  || w.A.isDown || ext.left)  { dx=-1; this._playerDir="left"; }
      else if (cur.right.isDown||w.D.isDown||ext.right){ dx=1;  this._playerDir="right"; }
      else if (cur.up.isDown   ||w.W.isDown||ext.up)   { dy=-1; this._playerDir="up"; }
      else if (cur.down.isDown ||w.S.isDown||ext.down) { dy=1;  this._playerDir="down"; }

      if (dx!==0 || dy!==0) {
        const nx = this._state.px + dx;
        const ny = this._state.py + dy;
        this._playerSprite.setTexture("player_"+this._playerDir);

        if (!this._isSolid(nx, ny)) {
          this._state.px = nx; this._state.py = ny;
          const tx = nx*TILE+TILE/2, ty = ny*TILE+8;
          scene.tweens.add({
            targets: this._playerSprite,
            x: tx, y: ty,
            duration: 160,
            ease: "Linear",
            onComplete: () => {
              this._moving = false;
              this._postMove(scene);
            },
          });
          this._moving = true;
          this._lastUpdate = 0;
        } else {
          this._lastUpdate = 0;
        }
      }
    }

    // ── Space key: interact with NPC ──
    if (this._Phaser.Input.Keyboard.JustDown(this._spaceKey) || this._extInput?.action) {
      if (this._extInput) this._extInput.action = false;
      this._tryInteract();
    }

    // ── Enemy wander ──
    this._wanderEnemies(scene, time);
  }

  _postMove(scene) {
    const { px, py, areaIdx } = this._state;
    const area = this._mapData[areaIdx];

    // ── Check exit ──
    for (const exit of area.exits) {
      if (exit.tx===px && exit.ty===py) {
        if (exit.isWin) { this._emit("win", {}); return; }
        this._changeArea(scene, exit.toArea, exit.toTx, exit.toTy);
        return;
      }
    }

    // ── Check chest ──
    if (area.chests) {
      for (const chest of area.chests) {
        if (chest.tx===px && chest.ty===py && !this._state.takenChests[chest.id]) {
          this._state.takenChests[chest.id] = true;
          // Give item
          if (chest.item==="potion" || chest.item==="elixir") {
            this._state.player.potions++;
          } else if (chest.item==="sword") {
            this._state.player.atk += 3;
          }
          // Refresh tile to open chest sprite
          this._buildArea(scene, areaIdx);
          this._emit("chest", { item: chest.item });
          this._emitHud();
          return;
        }
      }
    }

    // ── Check enemy collision ──
    this._enemiesGroup.getChildren().forEach(sp => {
      if (sp._tx===px && sp._ty===py) {
        this._startBattle(sp);
      }
    });
  }

  _tryInteract() {
    const { px, py, areaIdx } = this._state;
    const area = this._mapData[areaIdx];
    const adj = [[px,py-1],[px,py+1],[px-1,py],[px+1,py]];
    for (const npcSp of this._npcsGroup.getChildren()) {
      const n = npcSp._npc;
      if (adj.some(([tx,ty])=>tx===n.tx&&ty===n.ty)) {
        this._emit("dialog", { name: n.name, msg: n.msg });
        this._blocked = true;
        return;
      }
    }
  }

  _startBattle(enemySp) {
    this._blocked = true;
    this._battleEnemy = enemySp;
    this._state.player.defending = false;
    const e = enemySp._enemy;
    this._emit("battleStart", {
      enemy: { type:e.type, name:e.name, hp:e.curHp, maxHp:e.hp, def:e.def, atk:e.atk },
      player: { ...this._state.player },
    });
  }

  // ── Called from React when battle action chosen ──
  doBattleAction(action) {
    const player = this._state.player;
    const en = this._battleEnemy?._enemy;
    if (!en) return;

    let log = "";
    let playerHpDelta = 0;
    let enemyHpDelta = 0;

    if (action === "attack") {
      const dmg = Math.max(1, player.atk - en.def + Math.floor(Math.random()*4));
      en.curHp -= dmg;
      log = `⚔️ Kamu menyerang! ${en.name} -${dmg} HP`;
    } else if (action === "defend") {
      player.defending = true;
      log = "🛡️ Kamu bersiap mempertahankan diri!";
    } else if (action === "heal") {
      if (player.potions > 0) {
        const heal = 8 + Math.floor(Math.random()*5);
        player.hp = Math.min(player.maxHp, player.hp + heal);
        player.potions--;
        log = `🧪 Kamu minum ramuan! +${heal} HP`;
      } else {
        log = "❌ Tidak ada ramuan tersisa!";
      }
    } else if (action === "flee") {
      if (Math.random() < 0.5) {
        player.defending = false;
        this._blocked = false;
        this._emit("battleEnd", { fled: true, player: { ...player } });
        this._emitHud();
        return;
      } else {
        log = "❌ Gagal kabur!";
      }
    }

    // Enemy attacks back (unless defeated)
    let enemyDefeated = en.curHp <= 0;
    let playerDefeated = false;

    if (!enemyDefeated && action !== "flee") {
      const eDmg = Math.max(1, en.atk - (player.defending ? player.def * 2 : player.def) + Math.floor(Math.random()*3));
      player.hp -= eDmg;
      if (player.hp < 0) player.hp = 0;
      log += `\n💥 ${en.name} menyerang! Kamu -${eDmg} HP`;
      if (player.hp <= 0) playerDefeated = true;
    }

    player.defending = false;

    if (enemyDefeated) {
      // Give XP
      const xpGain = en.xp;
      player.xp += xpGain;
      log += `\n✨ ${en.name} kalah! +${xpGain} XP`;

      // Level up
      let leveledUp = false;
      while (player.level < LEVEL_XP.length-1 && player.xp >= LEVEL_XP[player.level]) {
        player.level++;
        player.maxHp += 5; player.hp = Math.min(player.maxHp, player.hp+10);
        player.atk += 2; player.def += 1;
        log += `\n🎉 Level Up! Level ${player.level}`;
        leveledUp = true;
      }

      // Mark enemy defeated
      this._state.defeatedEnemies[en.id] = true;
      if (this._battleEnemy) {
        this._battleEnemy.destroy();
        this._battleEnemy = null;
      }
      this._blocked = false;
      this._emit("battleEnd", {
        victory: true, xpGain, leveledUp, log,
        player: { ...player },
        isBoss: en.type === "boss",
      });
      this._emitHud();
      return;
    }

    if (playerDefeated) {
      this._blocked = false;
      this._emit("gameOver", {});
      return;
    }

    this._emitHud();
    this._emit("battleUpdate", {
      log,
      enemy: { type:en.type, name:en.name, hp:en.curHp, maxHp:ENEMY_STATS[en.type].hp },
      player: { ...player },
    });
  }

  _changeArea(scene, toArea, toTx, toTy) {
    this._state.areaIdx = toArea;
    this._state.px = toTx;
    this._state.py = toTy;
    this._buildArea(scene, toArea);
    this._moving = false;
    this._lastUpdate = 0;
    this._emit("areaChange", { name: this._mapData[toArea].name });
    this._emitHud();
  }

  _wanderEnemies(scene, time) {
    this._enemiesGroup.getChildren().forEach(sp => {
      const id = sp._enemy.id;
      if (!this._wanderTimers[id]) this._wanderTimers[id] = time + 1500 + Math.random()*1000;
      if (time < this._wanderTimers[id]) return;
      this._wanderTimers[id] = time + 1200 + Math.random()*1500;

      const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
      const d = dirs[Math.floor(Math.random()*4)];
      const nx = sp._tx + d[0], ny = sp._ty + d[1];
      // don't walk into player or solid
      if (nx===this._state.px && ny===this._state.py) return;
      if (this._isSolid(nx, ny)) return;
      // don't stack enemies
      const others = this._enemiesGroup.getChildren();
      if (others.some(o=>o!==sp&&o._tx===nx&&o._ty===ny)) return;

      sp._tx = nx; sp._ty = ny;
      scene.tweens.add({
        targets: sp,
        x: nx*TILE+TILE/2, y: ny*TILE+TILE/2,
        duration: 300, ease: "Linear",
        onComplete: () => {
          // Check if enemy walked into player
          if (nx===this._state.px && ny===this._state.py) this._startBattle(sp);
        },
      });
    });
  }

  _emitHud() {
    const p = this._state.player;
    const area = this._mapData[this._state.areaIdx];
    this._emit("hudUpdate", {
      hp: p.hp, maxHp: p.maxHp,
      level: p.level, xp: p.xp,
      nextXp: LEVEL_XP[Math.min(p.level, LEVEL_XP.length-1)],
      potions: p.potions,
      areaName: area.name,
    });
  }

  // ── External input from mobile buttons ──
  setExtInput(input) {
    this._extInput = input;
  }

  resumeFromDialog() {
    this._blocked = false;
  }

  destroy() {
    this._destroyed = true;
    if (this._game) { this._game.destroy(false); this._game = null; }
  }

  start() {
    this._buildPhaserGame();
  }
}

// ─── React Component ────────────────────────────────────────────────────────
export default function PhaserRpgGameClient() {
  const { language } = useLanguage();
  const containerRef = useRef(null);
  const sceneRef   = useRef(null);
  const mapDataRef = useRef(null);
  const extInput   = useRef({ up:false, down:false, left:false, right:false, action:false });

  const t = (id, en) => (language === "id" ? id : en);

  // ── React UI state ──
  const [hud, setHud] = useState({ hp:30, maxHp:30, level:1, xp:0, nextXp:25, potions:3, areaName:"Desa Cahaya" });
  const [battle, setBattle] = useState(null);    // null | { enemy, player, log }
  const [dialog, setDialog] = useState(null);    // null | { name, msg }
  const [screen, setScreen] = useState("intro"); // intro | playing | win | gameover
  const [isMobile, setIsMobile] = useState(false);
  const [chestMsg, setChestMsg] = useState(null);

  // ── Detect mobile ──
  useEffect(() => {
    setIsMobile("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  // ── DOM event listeners ──
  useEffect(() => {
    const onHud = (e) => setHud(e.detail);
    const onBattleStart = (e) => {
      setBattle({ ...e.detail, log: `⚔️ ${e.detail.enemy.name} muncul!`, phase: "player" });
    };
    const onBattleUpdate = (e) => {
      setBattle(prev => prev ? { ...prev, ...e.detail } : prev);
    };
    const onBattleEnd = (e) => {
      if (e.detail.isBoss && e.detail.victory) {
        setBattle(null);
        setScreen("win");
        return;
      }
      setBattle(null);
    };
    const onDialog = (e) => setDialog(e.detail);
    const onGameOver = () => { setBattle(null); setScreen("gameover"); };
    const onWin = () => setScreen("win");
    const onChest = (e) => {
      const items = { potion:"🧪 Ramuan ditemukan!", sword:"⚔️ Pedang ditemukan! ATK +3", elixir:"✨ Eliksir! Ramuan +1" };
      setChestMsg(items[e.detail.item] ?? "🎁 Item ditemukan!");
      setTimeout(() => setChestMsg(null), 2200);
    };

    window.addEventListener("rpg:hudUpdate",     onHud);
    window.addEventListener("rpg:battleStart",   onBattleStart);
    window.addEventListener("rpg:battleUpdate",  onBattleUpdate);
    window.addEventListener("rpg:battleEnd",     onBattleEnd);
    window.addEventListener("rpg:dialog",        onDialog);
    window.addEventListener("rpg:gameOver",      onGameOver);
    window.addEventListener("rpg:win",           onWin);
    window.addEventListener("rpg:chest",         onChest);

    return () => {
      window.removeEventListener("rpg:hudUpdate",     onHud);
      window.removeEventListener("rpg:battleStart",   onBattleStart);
      window.removeEventListener("rpg:battleUpdate",  onBattleUpdate);
      window.removeEventListener("rpg:battleEnd",     onBattleEnd);
      window.removeEventListener("rpg:dialog",        onDialog);
      window.removeEventListener("rpg:gameOver",      onGameOver);
      window.removeEventListener("rpg:win",           onWin);
      window.removeEventListener("rpg:chest",         onChest);
    };
  }, []);

  // ── Start / restart game ──
  const startGame = useCallback(async () => {
    // Destroy previous
    if (sceneRef.current) {
      sceneRef.current.destroy();
      sceneRef.current = null;
    }

    setScreen("playing");
    setBattle(null);
    setDialog(null);
    setChestMsg(null);

    // Dynamic import of Phaser (client only)
    const Phaser = (await import("phaser")).default;

    mapDataRef.current = makeMap();

    const gameState = {
      areaIdx: 0,
      px: 5, py: 10,
      player: freshPlayer(),
      defeatedEnemies: {},
      takenChests: {},
    };

    // Wait for container to be in DOM
    await new Promise(r => setTimeout(r, 200));

    const container = containerRef.current;
    if (!container) return;

    const rpg = new RpgScene(Phaser, container, mapDataRef.current, gameState);
    sceneRef.current = rpg;
    rpg.start();
  }, []);

  // ── Mobile input handlers ──
  const press = useCallback((dir) => {
    extInput.current[dir] = true;
    if (sceneRef.current) sceneRef.current.setExtInput({ ...extInput.current });
    setTimeout(() => {
      extInput.current[dir] = false;
      if (sceneRef.current) sceneRef.current.setExtInput({ ...extInput.current });
    }, 200);
  }, []);

  const pressAction = useCallback(() => {
    extInput.current.action = true;
    if (sceneRef.current) sceneRef.current.setExtInput({ ...extInput.current });
    setTimeout(() => { extInput.current.action = false; }, 100);
  }, []);

  // ── Battle actions ──
  const doBattle = useCallback((action) => {
    if (sceneRef.current) sceneRef.current.doBattleAction(action);
  }, []);

  // ── Close dialog ──
  const closeDialog = useCallback(() => {
    setDialog(null);
    if (sceneRef.current) sceneRef.current.resumeFromDialog();
  }, []);

  // ── HP bar fill width ──
  const hpPct = (hp, maxHp) => `${Math.max(0, Math.round(hp/maxHp*100))}%`;
  const isLowHp = hud.hp / hud.maxHp < 0.3;

  // ── Render ──
  return (
    <div className={styles.wrapper}>
      <div className={styles.gameFrame}>

        {/* Game container (Phaser injects its canvas here) */}
        <div
          ref={containerRef}
          className={styles.canvas}
          style={{ display: screen === "playing" || screen === "gameover" || screen === "win" ? "block" : "none" }}
        />

        {/* HUD */}
        {screen === "playing" && !battle && (
          <div className={styles.hud}>
            <div className={styles.hudLeft}>
              <div className={styles.hpRow}>
                <span>❤️</span>
                <div className={styles.hpBar}>
                  <div
                    className={`${styles.hpFill}${isLowHp ? " "+styles.hpFillLow : ""}`}
                    style={{ width: hpPct(hud.hp, hud.maxHp) }}
                  />
                </div>
                <span style={{fontSize:11}}>{hud.hp}/{hud.maxHp}</span>
              </div>
              <div style={{fontSize:10,color:"#86efac"}}>
                Lv{hud.level} · XP {hud.xp}/{hud.nextXp} · 🧪{hud.potions}
              </div>
            </div>
            <div className={styles.hudRight}>
              <div className={styles.areaName}>{hud.areaName}</div>
            </div>
          </div>
        )}

        {/* Chest notification */}
        {chestMsg && (
          <div style={{
            position:"absolute", top:38, left:"50%", transform:"translateX(-50%)",
            background:"rgba(10,4,40,0.92)", border:"1.5px solid #7c3aed",
            borderRadius:10, padding:"6px 14px", color:"#fff",
            fontSize:12, fontWeight:700, zIndex:16, whiteSpace:"nowrap",
            pointerEvents:"none",
          }}>
            {chestMsg}
          </div>
        )}

        {/* Dialog overlay */}
        {dialog && (
          <div className={styles.dialogBox}>
            <div className={styles.dialogName}>{dialog.name}</div>
            <p className={styles.dialogText}>{dialog.msg}</p>
            <button className={styles.dialogClose} onClick={closeDialog}>
              {t("Tutup", "Close")} ✕
            </button>
          </div>
        )}

        {/* Battle overlay */}
        {battle && (
          <BattleOverlay
            battle={battle}
            styles={styles}
            onAction={doBattle}
            t={t}
          />
        )}

        {/* Intro screen */}
        {screen === "intro" && (
          <div className={styles.endOverlay}>
            <div className={styles.endCard}>
              <div className={styles.endEmoji}>⚔️</div>
              <h1 className={styles.endTitle}>{t("Petualangan RPG", "RPG Adventure")}</h1>
              <p className={styles.endDesc}>
                {t(
                  "Jelajahi desa, hutan, dan penjara. Kalahkan Raja Iblis untuk menang!",
                  "Explore the village, forest, and dungeon. Defeat the Demon King to win!"
                )}
              </p>
              <p style={{fontSize:11,color:"#a78bfa",marginBottom:14}}>
                {t("Gerak: ←↑↓→ / WASD · Bicara: Spasi","Move: ←↑↓→ / WASD · Talk: Space")}
              </p>
              <button className={styles.retryBtn} onClick={startGame}>
                {t("Mulai Petualangan ⚔️", "Start Adventure ⚔️")}
              </button>
            </div>
          </div>
        )}

        {/* Game Over screen */}
        {screen === "gameover" && (
          <div className={styles.endOverlay}>
            <div className={styles.endCard}>
              <div className={styles.endEmoji}>💀</div>
              <h1 className={styles.endTitle}>{t("Game Over", "Game Over")}</h1>
              <p className={styles.endDesc}>
                {t("Kamu kalah... Coba lagi!", "You were defeated... Try again!")}
              </p>
              <button className={styles.retryBtn} onClick={startGame}>
                🔄 {t("Coba Lagi", "Retry")}
              </button>
            </div>
          </div>
        )}

        {/* Win screen */}
        {screen === "win" && (
          <div className={styles.endOverlay}>
            <div className={styles.endCard}>
              <div className={styles.endEmoji}>🏆</div>
              <h1 className={styles.endTitle}>{t("Menang!", "You Won!")}</h1>
              <p className={styles.endDesc}>
                {t(
                  "Raja Iblis telah dikalahkan! Kamu adalah pahlawan sejati!",
                  "The Demon King is defeated! You are a true hero!"
                )}
              </p>
              <p style={{fontSize:12,color:"#86efac",marginBottom:14}}>
                {t("Level","Level")} {hud.level} · XP {hud.xp}
              </p>
              <button className={styles.retryBtn} onClick={startGame}>
                🔄 {t("Main Lagi", "Play Again")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      {isMobile && screen === "playing" && (
        <div className={styles.mobileControls}>
          <div className={styles.arrowRow}>
            <button className={styles.arrowBtn} onPointerDown={() => press("up")}   aria-label="Up">▲</button>
          </div>
          <div className={styles.arrowRow}>
            <button className={styles.arrowBtn} onPointerDown={() => press("left")}  aria-label="Left">◀</button>
            <button className={styles.arrowBtn} onPointerDown={() => press("down")}  aria-label="Down">▼</button>
            <button className={styles.arrowBtn} onPointerDown={() => press("right")} aria-label="Right">▶</button>
          </div>
          <div className={styles.mobileRow}>
            <button className={styles.actionBtn} onPointerDown={pressAction} aria-label="Action">💬</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Battle Overlay (sub-component) ─────────────────────────────────────────
function BattleOverlay({ battle, styles, onAction, t }) {
  const { enemy, player, log } = battle;

  const hpPct = (hp, max) => `${Math.max(0, Math.round(hp / max * 100))}%`;

  // Draw enemy sprite on an offscreen canvas
  const spriteRef = useRef(null);
  useEffect(() => {
    const canvas = spriteRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 64, 64);

    const s = 4; // scale up 16x16 → 64x64
    ctx.save();
    ctx.scale(s, s);

    // Draw enemy pixel art manually (simplified)
    const type = enemy.type;
    if (type === "slime") {
      ctx.fillStyle = "#33cc44"; ctx.beginPath(); ctx.ellipse(8,10,7,5,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = "#22aa33"; ctx.beginPath(); ctx.ellipse(8,12,5,3.5,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(5,9,2,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(11,9,2,0,Math.PI*2); ctx.fill();
    } else if (type === "bat") {
      ctx.fillStyle = "#553366"; ctx.beginPath(); ctx.ellipse(8,9,4,3.5,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = "#331a44";
      ctx.beginPath(); ctx.moveTo(1,4); ctx.lineTo(7,8); ctx.lineTo(3,12); ctx.fill();
      ctx.beginPath(); ctx.moveTo(15,4); ctx.lineTo(9,8); ctx.lineTo(13,12); ctx.fill();
      ctx.fillStyle = "#ff2222"; ctx.beginPath(); ctx.arc(5,7,2,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(11,7,2,0,Math.PI*2); ctx.fill();
    } else if (type === "skeleton") {
      ctx.fillStyle = "#ccccaa";
      ctx.beginPath(); ctx.arc(8,5,5,0,Math.PI*2); ctx.fill();
      ctx.fillRect(5,9,6,5); ctx.fillRect(3,10,3,4); ctx.fillRect(10,10,3,4);
      ctx.fillRect(5,14,3,3); ctx.fillRect(8,14,3,3);
      ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(6,5,1,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(10,5,1,0,Math.PI*2); ctx.fill();
    } else if (type === "boss") {
      ctx.fillStyle = "#cc1111"; ctx.beginPath(); ctx.ellipse(8,10,7,7,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = "#ff3333"; ctx.beginPath(); ctx.arc(8,6,6,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = "#ffff00"; ctx.beginPath(); ctx.arc(6,6,2,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(10,6,2,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = "#cc1111";
      ctx.beginPath(); ctx.moveTo(3,3); ctx.lineTo(1,0); ctx.lineTo(5,3); ctx.fill();
      ctx.beginPath(); ctx.moveTo(13,3); ctx.lineTo(15,0); ctx.lineTo(11,3); ctx.fill();
    }
    ctx.restore();
  }, [enemy.type]);

  return (
    <div className={styles.battleOverlay}>
      <div className={styles.battleCard}>
        <p className={styles.battleTitle}>
          ⚔️ {t("Pertarungan", "Battle")} — {enemy.name}
        </p>

        <div className={styles.battleBars}>
          {/* Player side */}
          <div className={styles.battleParty}>
            <span>🧑 {t("Kamu","You")}</span>
            <div style={{fontSize:11,marginBottom:3}}>HP {player.hp}/{player.maxHp}</div>
            <div className={styles.hpBar} style={{width:"100%"}}>
              <div
                className={styles.hpFill}
                style={{
                  width: hpPct(player.hp, player.maxHp),
                  background: player.hp/player.maxHp < 0.3
                    ? "linear-gradient(90deg,#ef4444,#b91c1c)"
                    : "linear-gradient(90deg,#22c55e,#16a34a)",
                }}
              />
            </div>
            <div style={{fontSize:10,color:"#a78bfa",marginTop:3}}>
              🧪 ×{player.potions}
            </div>
          </div>

          {/* Enemy side */}
          <div className={styles.battleParty}>
            <canvas ref={spriteRef} width={64} height={64} className={styles.battleSpriteCanvas}
              style={{imageRendering:"pixelated"}} />
            <span>{enemy.name}</span>
            <div style={{fontSize:11,marginBottom:3}}>HP {enemy.hp}/{enemy.maxHp}</div>
            <div className={styles.hpBar} style={{width:"100%"}}>
              <div
                className={styles.hpFill}
                style={{
                  width: hpPct(enemy.hp, enemy.maxHp),
                  background: "linear-gradient(90deg,#ef4444,#b91c1c)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Battle log */}
        <div className={styles.battleLog}>
          {log || "…"}
        </div>

        {/* Action buttons */}
        <div className={styles.battleBtns}>
          <button className={`${styles.btn} ${styles.btnAttack}`} onClick={() => onAction("attack")}>
            ⚔️ {t("Serang","Attack")}
          </button>
          <button className={`${styles.btn} ${styles.btnDefend}`} onClick={() => onAction("defend")}>
            🛡️ {t("Bertahan","Defend")}
          </button>
          <button className={`${styles.btn} ${styles.btnHeal}`} onClick={() => onAction("heal")}>
            🧪 {t("Minum Ramuan","Use Potion")}
          </button>
          <button className={`${styles.btn} ${styles.btnFlee}`} onClick={() => onAction("flee")}>
            🏃 {t("Kabur","Flee")}
          </button>
        </div>
      </div>
    </div>
  );
}
