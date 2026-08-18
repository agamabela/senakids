"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import { ShoppingBag, Sun, Moon, Zap } from "lucide-react";
import styles from "./HarvestMoonGameClient.module.css";

const GRID_W = 16;
const GRID_H = 12;
const TILE_SIZE = 40;
const CANVAS_W = GRID_W * TILE_SIZE; // 640
const CANVAS_H = GRID_H * TILE_SIZE; // 480

// Map layouts
// 0: Grass, 1: Cabin Floor, 2: Cabin Wall, 3: Bed, 4: Door, 5: Road to Shop, 6: Shop Area
const DEFAULT_MAP = [
  [2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 3, 3, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 1, 1, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 1, 1, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 2, 4, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const TOOLS = [
  { id: "hand", name: { id: "Tangan Kosong", en: "Empty Hands" }, emoji: "🖐️", color: "#ccc" },
  { id: "hoe", name: { id: "Cangkul", en: "Hoe" }, emoji: "⛏️", color: "#a1887f" },
  { id: "watering", name: { id: "Penyiram Air", en: "Watering Can" }, emoji: "💧", color: "#64b5f6" },
  { id: "turnip_seeds", name: { id: "Benih Lobak", en: "Turnip Seeds" }, emoji: "🌱", color: "#81c784", isSeed: true, cropId: "turnip", price: 10 },
  { id: "carrot_seeds", name: { id: "Benih Wortel", en: "Carrot Seeds" }, emoji: "🌿", color: "#ffb74d", isSeed: true, cropId: "carrot", price: 20 },
  { id: "strawberry_seeds", name: { id: "Benih Stroberi", en: "Strawberry Seeds" }, emoji: "🌸", color: "#f06292", isSeed: true, cropId: "strawberry", price: 40 },
  { id: "scythe", name: { id: "Sabit", en: "Scythe" }, emoji: "🌾", color: "#e0e0e0" },
  { id: "pickaxe", name: { id: "Beliung", en: "Pickaxe" }, emoji: "🔨", color: "#90a4ae" },
  { id: "axe", name: { id: "Kapak", en: "Axe" }, emoji: "🪓", color: "#b0bec5" },
];

const CROPS = {
  turnip: { name: { id: "Lobak", en: "Turnip" }, days: 2, sellPrice: 25, emoji: "🧅" },
  carrot: { name: { id: "Wortel", en: "Carrot" }, days: 3, sellPrice: 50, emoji: "🥕" },
  strawberry: { name: { id: "Stroberi", en: "Strawberry" }, days: 4, sellPrice: 100, emoji: "🍓" },
};

export default function HarvestMoonGameClient() {
  const { language } = useLanguage();
  const languageRef = useRef(language);
  useEffect(() => { languageRef.current = language; }, [language]);
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  const L = useCallback((o) => {
    if (o && typeof o === "object") return o[languageRef.current] || o.en;
    return o;
  }, []);
  const t = useCallback((id, en) => (languageRef.current === "id" ? id : en), []);

  const canvasRef = useRef(null);

  // ── UI States (trigger re-render) ──────────────────────────────────────────
  const [screen, setScreen] = useState("intro");
  const [shopOpen, setShopOpen] = useState(false);
  const [gamepadActive, setGamepadActive] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // HUD display states – updated from refs inside the loop via scheduled setStates
  const [hudDay, setHudDay] = useState(1);
  const [hudGold, setHudGold] = useState(100);
  const [hudEnergy, setHudEnergy] = useState(100);
  const [hudTimeHour, setHudTimeHour] = useState(6);
  const [hudTimeMin, setHudTimeMin] = useState(0);
  const [hudWeather, setHudWeather] = useState("sunny");
  const [activeToolIndex, setActiveToolIndex] = useState(0);
  const [inventory, setInventory] = useState({
    turnip_seeds: 5,
    carrot_seeds: 2,
    strawberry_seeds: 0,
    turnip: 0,
    carrot: 0,
    strawberry: 0,
  });

  // ── Game-loop Refs (never cause re-renders) ────────────────────────────────
  const playerRef = useRef({ x: 100, y: 160, vx: 0, vy: 0, dir: "down", walking: false, animFrame: 0 });
  const keysPressedRef = useRef({});
  const tilesRef = useRef([]);
  const timeProgressRef = useRef(0);
  const prevGamepadButtonsRef = useRef([]);
  const shopOpenRef = useRef(false);         // mirrors shopOpen for the game loop
  const activeToolRef = useRef(0);           // mirrors activeToolIndex
  const inventoryRef = useRef({             // mirrors inventory
    turnip_seeds: 5, carrot_seeds: 2, strawberry_seeds: 0,
    turnip: 0, carrot: 0, strawberry: 0,
  });

  // Game state as refs so loop doesn't need them as deps
  const dayRef = useRef(1);
  const goldRef = useRef(100);
  const energyRef = useRef(100);
  const timeHourRef = useRef(6);
  const timeMinRef = useRef(0);
  const weatherRef = useRef("sunny");
  const faintedRef = useRef(false);
  const screenRef = useRef("intro");

  // Keep screen ref in sync
  useEffect(() => { screenRef.current = screen; }, [screen]);
  useEffect(() => { shopOpenRef.current = shopOpen; }, [shopOpen]);
  useEffect(() => { activeToolRef.current = activeToolIndex; }, [activeToolIndex]);
  useEffect(() => { inventoryRef.current = inventory; }, [inventory]);

  // ── HUD flush (every 500ms to avoid flooding renders) ─────────────────────
  useEffect(() => {
    if (screen !== "playing") return;
    const id = setInterval(() => {
      setHudDay(dayRef.current);
      setHudGold(goldRef.current);
      setHudEnergy(energyRef.current);
      setHudTimeHour(timeHourRef.current);
      setHudTimeMin(timeMinRef.current);
      setHudWeather(weatherRef.current);
    }, 500);
    return () => clearInterval(id);
  }, [screen]);

  // ── Notifications ──────────────────────────────────────────────────────────
  const showNotification = useCallback((text, color = "#fff") => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, text, color }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 2000);
  }, []);

  // ── Save ───────────────────────────────────────────────────────────────────
  const saveGame = useCallback(() => {
    try {
      localStorage.setItem("kiddoworld_harvest_moon_save", JSON.stringify({
        gold: goldRef.current,
        day: dayRef.current,
        energy: energyRef.current,
        inventory: inventoryRef.current,
        tiles: tilesRef.current,
        weather: weatherRef.current,
      }));
    } catch (e) {
      console.error("Failed to save game", e);
    }
  }, []);

  // ── New game / Load ────────────────────────────────────────────────────────
  const initGrid = useCallback(() => {
    const grid = [];
    for (let y = 0; y < GRID_H; y++) {
      grid[y] = [];
      for (let x = 0; x < GRID_W; x++) {
        let obstacle = null;
        if (DEFAULT_MAP[y][x] === 0 && Math.random() < 0.22) {
          const r = Math.random();
          obstacle = r < 0.5 ? "weed" : r < 0.8 ? "rock" : "log";
        }
        grid[y][x] = { tilled: false, watered: false, crop: null, obstacle };
      }
    }
    return grid;
  }, []);

  const resetToNewGame = useCallback(() => {
    tilesRef.current = initGrid();
    playerRef.current = { x: 100, y: 160, vx: 0, vy: 0, dir: "down", walking: false, animFrame: 0 };
    dayRef.current = 1; goldRef.current = 100; energyRef.current = 100;
    timeHourRef.current = 6; timeMinRef.current = 0;
    weatherRef.current = "sunny"; faintedRef.current = false;
    timeProgressRef.current = 0;
    const defaultInv = { turnip_seeds: 5, carrot_seeds: 2, strawberry_seeds: 0, turnip: 0, carrot: 0, strawberry: 0 };
    inventoryRef.current = defaultInv;
    setInventory(defaultInv);
    setActiveToolIndex(0);
    setShopOpen(false);
    setScreen("playing");
  }, [initGrid]);

  const startNewGame = useCallback(() => { resetToNewGame(); }, [resetToNewGame]);

  const loadSavedGame = useCallback(() => {
    try {
      const saved = localStorage.getItem("kiddoworld_harvest_moon_save");
      if (saved) {
        const p = JSON.parse(saved);
        goldRef.current = p.gold ?? 100;
        dayRef.current = p.day ?? 1;
        energyRef.current = p.energy ?? 100;
        weatherRef.current = p.weather ?? "sunny";
        tilesRef.current = p.tiles ?? initGrid();
        const inv = p.inventory ?? inventoryRef.current;
        inventoryRef.current = inv;
        setInventory(inv);
        playerRef.current = { x: 100, y: 160, vx: 0, vy: 0, dir: "down", walking: false, animFrame: 0 };
        timeHourRef.current = 6; timeMinRef.current = 0;
        timeProgressRef.current = 0;
        faintedRef.current = false;
        setActiveToolIndex(0);
        setShopOpen(false);
        setScreen("playing");
        showNotification(t("Game dimuat!", "Game loaded!"), "#81c784");
      } else {
        resetToNewGame();
      }
    } catch (e) {
      resetToNewGame();
    }
  }, [initGrid, resetToNewGame, showNotification, t]);

  // ── Sleep / Next Day ───────────────────────────────────────────────────────
  const sleepAndWakeUp = useCallback(() => {
    setScreen("fade-out");
    setTimeout(() => {
      const grid = tilesRef.current;
      for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
          const cell = grid[y][x];
          if (weatherRef.current === "rainy" && cell.tilled) cell.watered = true;
          if (cell.crop && cell.watered && cell.crop.stage < 3) cell.crop.stage += 1;
          cell.watered = false;
        }
      }
      // Spawn obstacles
      for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
          if (DEFAULT_MAP[y][x] === 0 && !grid[y][x].tilled && !grid[y][x].obstacle && Math.random() < 0.05) {
            const r = Math.random();
            grid[y][x].obstacle = r < 0.6 ? "weed" : r < 0.85 ? "rock" : "log";
          }
        }
      }
      dayRef.current += 1;
      weatherRef.current = Math.random() < 0.25 ? "rainy" : "sunny";
      const recovered = faintedRef.current ? 50 : 100;
      energyRef.current = recovered;
      faintedRef.current = false;
      playerRef.current = { x: 100, y: 160, vx: 0, vy: 0, dir: "down", walking: false, animFrame: 0 };
      timeHourRef.current = 6; timeMinRef.current = 0;
      timeProgressRef.current = 0;
      saveGame();
      showNotification(t("Hari baru telah dimulai!", "A new day has started!"), "#ffd54f");
      setScreen("playing");
    }, 1500);
  }, [saveGame, showNotification, t]);

  // ── Faint ──────────────────────────────────────────────────────────────────
  const handleFaint = useCallback(() => {
    faintedRef.current = true;
    goldRef.current = Math.max(0, goldRef.current - 20);
    setScreen("fainted");
    setTimeout(() => { sleepAndWakeUp(); }, 3000);
  }, [sleepAndWakeUp]);

  // ── Tool Use ───────────────────────────────────────────────────────────────
  const triggerToolUse = useCallback(() => {
    if (energyRef.current <= 0) {
      showNotification(t("Terlalu lelah! Istirahatlah.", "Too tired! Go rest."), "#e57373");
      return;
    }
    const player = playerRef.current;
    let targetX = Math.floor((player.x + 12) / TILE_SIZE);
    let targetY = Math.floor((player.y + 12) / TILE_SIZE);
    if (player.dir === "up") targetY = Math.floor((player.y - 8) / TILE_SIZE);
    else if (player.dir === "down") targetY = Math.floor((player.y + 32) / TILE_SIZE);
    else if (player.dir === "left") targetX = Math.floor((player.x - 8) / TILE_SIZE);
    else if (player.dir === "right") targetX = Math.floor((player.x + 32) / TILE_SIZE);

    if (targetX < 0 || targetX >= GRID_W || targetY < 0 || targetY >= GRID_H) return;

    const grid = tilesRef.current;
    const tile = grid[targetY][targetX];
    const tileType = DEFAULT_MAP[targetY][targetX];
    const tool = TOOLS[activeToolRef.current];
    const isFarmable = tileType === 0;

    let success = false;
    let actionEnergy = 5;

    if (tool.id === "hand") {
      if (tile.crop && tile.crop.stage === 3) {
        const cropType = tile.crop.type;
        inventoryRef.current = { ...inventoryRef.current, [cropType]: (inventoryRef.current[cropType] || 0) + 1 };
        setInventory({ ...inventoryRef.current });
        tile.crop = null;
        tile.tilled = false;
        showNotification(t(`Panen ${L(CROPS[cropType].name)}!`, `Harvested ${L(CROPS[cropType].name)}!`), "#81c784");
        success = true;
        actionEnergy = 0;
      }
    } else if (isFarmable) {
      if (tool.id === "hoe" && !tile.tilled && !tile.obstacle) {
        tile.tilled = true;
        showNotification(t("Tanah dicangkul", "Soil tilled"), "#a1887f");
        success = true;
      } else if (tool.id === "watering" && tile.tilled && !tile.watered) {
        tile.watered = true;
        showNotification(t("Tanah disiram air", "Soil watered"), "#64b5f6");
        success = true;
      } else if (tool.isSeed && tile.tilled && !tile.crop && !tile.obstacle) {
        const seedCount = inventoryRef.current[tool.id] || 0;
        if (seedCount > 0) {
          tile.crop = { type: tool.cropId, stage: 0 };
          inventoryRef.current = { ...inventoryRef.current, [tool.id]: seedCount - 1 };
          setInventory({ ...inventoryRef.current });
          showNotification(t("Benih ditanam", "Seed planted"), "#81c784");
          success = true;
        } else {
          showNotification(t("Benih habis!", "Out of seeds!"), "#e57373");
        }
      } else if (tool.id === "scythe" && tile.obstacle === "weed") {
        tile.obstacle = null;
        showNotification(t("Rumput liar dibersihkan", "Weeds cleared"), "#e0e0e0");
        success = true;
      } else if (tool.id === "pickaxe" && tile.obstacle === "rock") {
        tile.obstacle = null;
        showNotification(t("Batu dihancurkan", "Rock broken"), "#90a4ae");
        success = true;
      } else if (tool.id === "axe" && tile.obstacle === "log") {
        tile.obstacle = null;
        showNotification(t("Batang kayu dipotong", "Log chopped"), "#b0bec5");
        success = true;
      }
    }

    if (success) {
      energyRef.current = Math.max(0, energyRef.current - actionEnergy);
      if (energyRef.current <= 0) handleFaint();
      setHasChanges(true);
    }
  }, [handleFaint, showNotification, t, L]);

  // ── Interaction (Bed / Shop) ───────────────────────────────────────────────
  const triggerInteraction = useCallback(() => {
    const player = playerRef.current;
    const px = Math.floor((player.x + 12) / TILE_SIZE);
    const py = Math.floor((player.y + 12) / TILE_SIZE);
    if (px < 0 || px >= GRID_W || py < 0 || py >= GRID_H) return;
    const tileType = DEFAULT_MAP[py][px];
    if (tileType === 3) {
      sleepAndWakeUp();
    } else if (tileType === 6 || px === GRID_W - 1) {
      setShopOpen(true);
    }
  }, [sleepAndWakeUp]);

  // ── Shop Actions ───────────────────────────────────────────────────────────
  const buyItem = (seedId, price) => {
    if (goldRef.current < price) {
      showNotification(t("Emas tidak cukup!", "Not enough gold!"), "#e57373");
      return;
    }
    goldRef.current -= price;
    inventoryRef.current = { ...inventoryRef.current, [seedId]: (inventoryRef.current[seedId] || 0) + 1 };
    setInventory({ ...inventoryRef.current });
    showNotification(t(`Membeli benih (-${price}g)`, `Bought seed (-${price}g)`), "#81c784");
    setHasChanges(true);
    saveGame();
  };

  const sellItem = (cropId, price) => {
    if ((inventoryRef.current[cropId] || 0) <= 0) {
      showNotification(t("Tidak ada hasil panen!", "No crops to sell!"), "#e57373");
      return;
    }
    goldRef.current += price;
    inventoryRef.current = { ...inventoryRef.current, [cropId]: inventoryRef.current[cropId] - 1 };
    setInventory({ ...inventoryRef.current });
    showNotification(t(`Menjual hasil panen (+${price}g)`, `Sold crop (+${price}g)`), "#ffd54f");
    setHasChanges(true);
    saveGame();
  };

  // ── Keyboard Handlers ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (screenRef.current !== "playing" || shopOpenRef.current) return;
      const k = e.key.toLowerCase();
      if (e.key === "ArrowUp" || k === "w") keysPressedRef.current.up = true;
      if (e.key === "ArrowDown" || k === "s") keysPressedRef.current.down = true;
      if (e.key === "ArrowLeft" || k === "a") keysPressedRef.current.left = true;
      if (e.key === "ArrowRight" || k === "d") keysPressedRef.current.right = true;
      if (e.key >= "1" && e.key <= "9") {
        const idx = parseInt(e.key) - 1;
        if (idx < TOOLS.length) { activeToolRef.current = idx; setActiveToolIndex(idx); }
      }
      if (e.key === " ") { e.preventDefault(); triggerToolUse(); }
      if (k === "e") { e.preventDefault(); triggerInteraction(); }
    };
    const handleKeyUp = (e) => {
      const k = e.key.toLowerCase();
      if (e.key === "ArrowUp" || k === "w") keysPressedRef.current.up = false;
      if (e.key === "ArrowDown" || k === "s") keysPressedRef.current.down = false;
      if (e.key === "ArrowLeft" || k === "a") keysPressedRef.current.left = false;
      if (e.key === "ArrowRight" || k === "d") keysPressedRef.current.right = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [triggerToolUse, triggerInteraction]);

  // ── Gamepad Listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    const onConnect = () => {
      setGamepadActive(true);
      showNotification(t("Joystick terhubung!", "Joystick connected!"), "#81c784");
    };
    const onDisconnect = () => {
      setGamepadActive(false);
      showNotification(t("Joystick terputus", "Joystick disconnected"), "#e57373");
    };
    window.addEventListener("gamepadconnected", onConnect);
    window.addEventListener("gamepaddisconnected", onDisconnect);
    const gps = navigator.getGamepads ? navigator.getGamepads() : [];
    if (gps[0] || gps[1]) setGamepadActive(true);
    return () => {
      window.removeEventListener("gamepadconnected", onConnect);
      window.removeEventListener("gamepaddisconnected", onDisconnect);
    };
  }, [showNotification, t]);

  // ── Main Game Loop ─────────────────────────────────────────────────────────
  // IMPORTANT: Only depends on [screen, shopOpen] to avoid re-render loops.
  // All game data is accessed via refs.
  useEffect(() => {
    if (screen !== "playing") return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");

    let animId;
    let lastTime = Date.now();

    const updateGame = () => {
      const now = Date.now();
      const dt = Math.min(now - lastTime, 100); // cap dt to avoid spiral
      lastTime = now;

      // ── Gamepad polling ────────────────────────────────────────────────────
      const gps = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gps[0] || gps[1] || gps[2] || gps[3];
      let gpDx = 0, gpDy = 0;

      if (gp && !shopOpenRef.current) {
        const ax = gp.axes[0], ay = gp.axes[1];
        if (ax < -0.3) gpDx = -1; else if (ax > 0.3) gpDx = 1;
        if (ay < -0.3) gpDy = -1; else if (ay > 0.3) gpDy = 1;
        if (gp.buttons[12]?.pressed) gpDy = -1;
        if (gp.buttons[13]?.pressed) gpDy = 1;
        if (gp.buttons[14]?.pressed) gpDx = -1;
        if (gp.buttons[15]?.pressed) gpDx = 1;

        const pressed = gp.buttons.map((b) => b.pressed);
        const prev = prevGamepadButtonsRef.current;
        if (pressed[0] && !prev[0]) triggerToolUse();
        if ((pressed[2] && !prev[2]) || (pressed[3] && !prev[3])) {
          activeToolRef.current = (activeToolRef.current + 1) % TOOLS.length;
          setActiveToolIndex(activeToolRef.current);
        }
        if (pressed[1] && !prev[1]) {
          if (shopOpenRef.current) setShopOpen(false);
          else triggerInteraction();
        }
        prevGamepadButtonsRef.current = pressed;
      }

      // ── Movement ───────────────────────────────────────────────────────────
      let kDx = 0, kDy = 0;
      if (!shopOpenRef.current) {
        const keys = keysPressedRef.current;
        if (keys.left) kDx = -1; else if (keys.right) kDx = 1;
        if (keys.up) kDy = -1; else if (keys.down) kDy = 1;
      }

      const dx = gpDx || kDx;
      const dy = gpDy || kDy;
      const player = playerRef.current;
      player.walking = dx !== 0 || dy !== 0;

      if (player.walking) {
        if (dx < 0) player.dir = "left";
        else if (dx > 0) player.dir = "right";
        if (dy < 0) player.dir = "up";
        else if (dy > 0) player.dir = "down";

        const speed = 2.4;
        const nextX = player.x + dx * speed;
        const nextY = player.y + dy * speed;

        const checkCollision = (tx, ty) => {
          if (tx < 0 || tx >= GRID_W || ty < 0 || ty >= GRID_H) return true;
          const tt = DEFAULT_MAP[ty][tx];
          const obs = tilesRef.current[ty]?.[tx]?.obstacle;
          if (tt === 2) return true;
          if (obs === "rock" || obs === "log") return true;
          return false;
        };

        const offsets = [
          { x: 2, y: 12 }, { x: 20, y: 12 },
          { x: 2, y: 30 }, { x: 20, y: 30 },
        ];

        let colX = false, colY = false;
        offsets.forEach(({ x: ox, y: oy }) => {
          if (checkCollision(Math.floor((nextX + ox) / TILE_SIZE), Math.floor((player.y + oy) / TILE_SIZE))) colX = true;
        });
        offsets.forEach(({ x: ox, y: oy }) => {
          if (checkCollision(Math.floor((player.x + ox) / TILE_SIZE), Math.floor((nextY + oy) / TILE_SIZE))) colY = true;
        });

        if (!colX) player.x = nextX;
        if (!colY) player.y = nextY;
        player.animFrame = (player.animFrame + 0.15) % 4;
      } else {
        player.animFrame = 0;
      }

      player.x = Math.max(0, Math.min(CANVAS_W - 24, player.x));
      player.y = Math.max(0, Math.min(CANVAS_H - 32, player.y));

      // Auto-open shop when reaching right edge at row 6
      if (player.x >= CANVAS_W - 30 && Math.floor((player.y + 12) / TILE_SIZE) === 6) {
        player.x = CANVAS_W - 45;
        if (!shopOpenRef.current) setShopOpen(true);
      }

      // ── Time progression ───────────────────────────────────────────────────
      timeProgressRef.current += dt;
      if (timeProgressRef.current >= 4500) {
        timeProgressRef.current = 0;
        timeMinRef.current += 30;
        if (timeMinRef.current >= 60) {
          timeMinRef.current = 0;
          timeHourRef.current += 1;
          if (timeHourRef.current >= 24) {
            timeHourRef.current = 6;
            handleFaint();
          }
        }
      }

      // ── Rendering ──────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      const grid = tilesRef.current;

      for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
          const tileType = DEFAULT_MAP[y][x];
          const cell = grid[y]?.[x] || {};
          const rx = x * TILE_SIZE, ry = y * TILE_SIZE;

          // Base tile
          if (tileType === 0) {
            ctx.fillStyle = "#aed581"; ctx.fillRect(rx, ry, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = "#9ccc65"; ctx.beginPath();
            ctx.moveTo(rx + 5, ry + 12); ctx.lineTo(rx + 8, ry + 8); ctx.lineTo(rx + 11, ry + 12); ctx.stroke();
          } else if (tileType === 1 || tileType === 3 || tileType === 4) {
            ctx.fillStyle = "#d7ccc8"; ctx.fillRect(rx, ry, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = "#bcaaa4"; ctx.strokeRect(rx, ry, TILE_SIZE, TILE_SIZE);
          } else if (tileType === 2) {
            ctx.fillStyle = "#8d6e63"; ctx.fillRect(rx, ry, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = "#5d4037"; ctx.fillRect(rx + 2, ry + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          } else if (tileType === 5 || tileType === 6) {
            ctx.fillStyle = "#ffe0b2"; ctx.fillRect(rx, ry, TILE_SIZE, TILE_SIZE);
            if (tileType === 6) { ctx.fillStyle = "#ffb74d"; ctx.fillRect(rx + 15, ry, 10, TILE_SIZE); }
          }

          // Bed
          if (tileType === 3) {
            ctx.fillStyle = "#e57373"; ctx.fillRect(rx + 4, ry + 6, TILE_SIZE - 8, TILE_SIZE - 12);
            ctx.fillStyle = "#eceff1"; ctx.fillRect(rx + 6, ry + 8, 12, 10);
          }

          // Door
          if (tileType === 4) {
            ctx.fillStyle = "#a1887f"; ctx.fillRect(rx + 8, ry + 12, TILE_SIZE - 16, TILE_SIZE - 12);
            ctx.fillStyle = "#ffd54f"; ctx.beginPath(); ctx.arc(rx + 14, ry + 26, 3, 0, Math.PI * 2); ctx.fill();
          }

          // Tilled soil
          if (cell.tilled) {
            ctx.fillStyle = cell.watered ? "#5d4037" : "#8d6e63";
            ctx.fillRect(rx + 2, ry + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.strokeStyle = "#4e342e"; ctx.strokeRect(rx + 4, ry + 4, TILE_SIZE - 8, TILE_SIZE - 8);
          }

          // Obstacles
          if (cell.obstacle === "weed") {
            ctx.font = "20px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("🌿", rx + 20, ry + 20);
          } else if (cell.obstacle === "rock") {
            ctx.fillStyle = "#90a4ae"; ctx.beginPath(); ctx.arc(rx + 20, ry + 20, 12, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#78909c"; ctx.beginPath(); ctx.arc(rx + 16, ry + 16, 5, 0, Math.PI * 2); ctx.fill();
          } else if (cell.obstacle === "log") {
            ctx.fillStyle = "#8d6e63"; ctx.fillRect(rx + 6, ry + 10, TILE_SIZE - 12, 16);
            ctx.strokeStyle = "#5d4037"; ctx.strokeRect(rx + 6, ry + 10, TILE_SIZE - 12, 16);
            ctx.fillStyle = "#a1887f"; ctx.fillRect(rx + 6, ry + 12, 4, 12);
          }

          // Crops
          if (cell.crop) {
            const cropCfg = CROPS[cell.crop.type];
            if (cell.crop.stage === 0) {
              ctx.fillStyle = "#81c784"; ctx.beginPath(); ctx.arc(rx + 20, ry + 26, 3, 0, Math.PI * 2); ctx.fill();
            } else if (cell.crop.stage === 1) {
              ctx.fillStyle = "#81c784"; ctx.fillRect(rx + 18, ry + 18, 4, 10);
              ctx.fillStyle = "#4caf50"; ctx.fillRect(rx + 14, ry + 14, 5, 5);
            } else if (cell.crop.stage === 2) {
              ctx.font = "14px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
              ctx.fillText("🌱", rx + 20, ry + 18);
            } else if (cell.crop.stage === 3) {
              ctx.font = "24px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
              ctx.fillText(cropCfg.emoji, rx + 20, ry + 20);
            }
          }
        }
      }

      // Player
      ctx.save();
      const pAnim = Math.floor(player.animFrame);
      const bob = player.walking && (pAnim === 1 || pAnim === 3) ? -3 : 0;
      ctx.fillStyle = "#ffe082"; ctx.beginPath(); ctx.arc(player.x + 12, player.y + 10 + bob, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffd54f"; ctx.fillRect(player.x + 2, player.y + 10 + bob, 20, 3);
      ctx.fillStyle = "#ffccbc"; ctx.fillRect(player.x + 5, player.y + 13 + bob, 14, 8);
      ctx.fillStyle = "#1e88e5"; ctx.fillRect(player.x + 5, player.y + 21 + bob, 14, 10);
      ctx.fillStyle = "#e53935";
      ctx.fillRect(player.x + 2, player.y + 21 + bob, 3, 6);
      ctx.fillRect(player.x + 19, player.y + 21 + bob, 3, 6);
      ctx.fillStyle = "#0d47a1";
      if (player.walking) {
        if (pAnim % 2 === 0) ctx.fillRect(player.x + 4, player.y + 31, 5, 3);
        else ctx.fillRect(player.x + 15, player.y + 31, 5, 3);
      } else {
        ctx.fillRect(player.x + 4, player.y + 31, 5, 3);
        ctx.fillRect(player.x + 15, player.y + 31, 5, 3);
      }
      ctx.restore();

      // Day/night shading
      const hour = timeHourRef.current;
      const min = timeMinRef.current;
      let shadeColor = null, opacity = 0;
      if (hour >= 18 && hour < 20) {
        shadeColor = "255, 110, 0"; opacity = 0.35 * ((hour - 18) + min / 60);
      } else if (hour >= 20) {
        shadeColor = "12, 17, 54"; opacity = 0.65;
      }
      if (shadeColor && opacity > 0) {
        ctx.fillStyle = `rgba(${shadeColor}, ${opacity})`;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      }

      // Rain
      if (weatherRef.current === "rainy") {
        ctx.strokeStyle = "rgba(174, 219, 245, 0.4)"; ctx.lineWidth = 1.5;
        for (let i = 0; i < 8; i++) {
          const rrx = (now + i * 90) % CANVAS_W;
          const rry = (now * 1.5 + i * 120) % CANVAS_H;
          ctx.beginPath(); ctx.moveTo(rrx, rry); ctx.lineTo(rrx - 4, rry + 12); ctx.stroke();
        }
      }

      animId = requestAnimationFrame(updateGame);
    };

    animId = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(animId);
  }, [screen, shopOpen, triggerToolUse, triggerInteraction, handleFaint]);

  // Load on mount
  useEffect(() => { loadSavedGame(); }, [loadSavedGame]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.gameWrapper}>
      {/* HUD Header */}
      <div className={styles.topBar}>
        <div className={styles.pill} title="Calendar">📅 {t("Hari", "Day")} {hudDay}</div>
        <div className={styles.pill} title="Gold">🪙 {hudGold}g</div>
        <div className={`${styles.pill} ${hudEnergy < 25 ? styles.danger : ""}`} title="Energy">
          <Zap size={15} style={{ marginRight: 3 }} /> {hudEnergy}/100
        </div>
        <div className={styles.pill} title="Time">
          ⏰ {String(hudTimeHour).padStart(2, "0")}:{String(hudTimeMin).padStart(2, "0")}{" "}
          {hudTimeHour >= 18 || hudTimeHour < 6 ? <Moon size={14} style={{ marginLeft: 4 }} /> : <Sun size={14} style={{ marginLeft: 4 }} />}
        </div>
        <div className={styles.pill} title="Weather">
          {hudWeather === "sunny" ? "☀️ Sunny" : "🌧️ Rainy"}
        </div>
        {gamepadActive && <div className={styles.gamepadBadge} title="Joystick Active">🎮 Active</div>}
        <button className={styles.menuPill} onClick={() => setScreen("intro")}>{t("Keluar", "Exit")}</button>
      </div>

      {/* Canvas viewport */}
      {screen === "playing" && (
        <div className={styles.viewport}>
          <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className={styles.canvas} />
          <div className={styles.notificationsContainer}>
            {notifications.map((n) => (
              <div key={n.id} className={styles.toast} style={{ color: n.color }}>{n.text}</div>
            ))}
          </div>
        </div>
      )}

      {/* Intro screen */}
      {screen === "intro" && (
        <div className={styles.introCard}>
          <div className={styles.introEmoji}>🌾</div>
          <h1>Harvest Moon 2.0</h1>
          <p className={styles.introDesc}>
            {t(
              "Kelola kebunmu! Cangkul tanah, siram air, tanam bibit, bersihkan ladang, dan tidurlah di ranjang kabinmu untuk beristirahat.",
              "Manage your farm! Till soil, water, plant crops, clear logs, and sleep in your cabin's bed to rest and progress time."
            )}
          </p>
          <div className={styles.endButtons}>
            <button className={styles.btnPrimary} onClick={loadSavedGame}>{t("Lanjutkan Game", "Continue Game")}</button>
            <button className={styles.btnGhost} onClick={startNewGame}>{t("Game Baru", "New Game")}</button>
          </div>
          <div className={styles.controlHint}>
            <strong>{t("Kontrol Keyboard:", "Keyboard Controls:")}</strong> Arrow/WASD = {t("Gerak", "Move")}, Space = {t("Pakai Alat", "Use Tool")}, E = {t("Tidur/Toko", "Sleep/Shop")}, 1-9 = {t("Alat", "Select Tool")}
          </div>
          <div className={styles.controlHint}>
            <strong>{t("Kontrol Joystick:", "Joystick Controls:")}</strong> Stick/D-pad = {t("Gerak", "Move")}, A = {t("Pakai Alat", "Use Tool")}, B = {t("Interact", "Interact")}, X/Y = {t("Pilih Alat", "Next Tool")}
          </div>
        </div>
      )}

      {/* Fainted screen */}
      {screen === "fainted" && (
        <div className={styles.introCard}>
          <div className={styles.introEmoji} style={{ filter: "grayscale(1)" }}>😵</div>
          <h1 style={{ color: "#e57373" }}>{t("Pingsan!", "Fainted!")}</h1>
          <p className={styles.introDesc}>
            {t(
              "Anda pingsan karena kehabisan energi atau hari sudah terlalu malam! Kehilangan 20 emas.",
              "You fainted due to zero energy or midnight! You lost 20 gold."
            )}
          </p>
        </div>
      )}

      {/* Sleeping screen */}
      {screen === "fade-out" && (
        <div className={styles.fadeOutScreen}>
          <div className={styles.sleepSymbol}>💤</div>
          <h2>{t("Tidur...", "Sleeping...")}</h2>
        </div>
      )}

      {/* Hotbar */}
      {screen === "playing" && (
        <div className={styles.hotbar}>
          {TOOLS.map((tool, idx) => (
            <button
              key={tool.id}
              className={`${styles.hotbarCell} ${idx === activeToolIndex ? styles.active : ""}`}
              onClick={() => { activeToolRef.current = idx; setActiveToolIndex(idx); }}
            >
              <span className={styles.cellEmoji}>{tool.emoji}</span>
              <span className={styles.cellName}>{L(tool.name)}</span>
              {tool.isSeed && (
                <span className={styles.cellQty}>x{inventory[tool.id] || 0}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Mobile D-pad */}
      {screen === "playing" && (
        <div className={styles.mobileControls}>
          <div className={styles.dpad}>
            <button className={styles.dpadBtn}
              onTouchStart={() => { keysPressedRef.current.up = true; }}
              onTouchEnd={() => { keysPressedRef.current.up = false; }}
              onMouseDown={() => { keysPressedRef.current.up = true; }}
              onMouseUp={() => { keysPressedRef.current.up = false; }}
            >▲</button>
            <div className={styles.dpadRow}>
              <button className={styles.dpadBtn}
                onTouchStart={() => { keysPressedRef.current.left = true; }}
                onTouchEnd={() => { keysPressedRef.current.left = false; }}
                onMouseDown={() => { keysPressedRef.current.left = true; }}
                onMouseUp={() => { keysPressedRef.current.left = false; }}
              >◀</button>
              <button className={styles.dpadBtn}
                onTouchStart={() => { keysPressedRef.current.right = true; }}
                onTouchEnd={() => { keysPressedRef.current.right = false; }}
                onMouseDown={() => { keysPressedRef.current.right = true; }}
                onMouseUp={() => { keysPressedRef.current.right = false; }}
              >▶</button>
            </div>
            <button className={styles.dpadBtn}
              onTouchStart={() => { keysPressedRef.current.down = true; }}
              onTouchEnd={() => { keysPressedRef.current.down = false; }}
              onMouseDown={() => { keysPressedRef.current.down = true; }}
              onMouseUp={() => { keysPressedRef.current.down = false; }}
            >▼</button>
          </div>
          <div className={styles.actionButtons}>
            <button className={styles.actionBtn} onClick={triggerToolUse}>
              <Zap size={18} style={{ marginRight: 4 }} /> {t("Pakai", "Use")}
            </button>
            <button className={styles.actionBtn} onClick={triggerInteraction}>
              🛌 {t("Interaksi", "Interact")}
            </button>
          </div>
        </div>
      )}

      {/* Shop Modal */}
      {shopOpen && (
        <div className={styles.shopOverlay}>
          <div className={styles.shopCard}>
            <div className={styles.shopHeader}>
              <ShoppingBag size={24} style={{ color: "#ffd54f" }} />
              <h2>{t("Toko Benih & Jual Hasil Tani", "Seed Shop & Sell Stand")}</h2>
              <button className={styles.closeBtn} onClick={() => setShopOpen(false)}>×</button>
            </div>
            <div className={styles.shopGold}>🪙 {t("Emas Anda:", "Your Gold:")} <strong>{hudGold}g</strong></div>
            <div className={styles.shopGrid}>
              <div className={styles.shopSection}>
                <h3>🛒 {t("Beli Benih", "Buy Seeds")}</h3>
                <div className={styles.itemList}>
                  {TOOLS.filter((tool) => tool.isSeed).map((seed) => (
                    <div key={seed.id} className={styles.shopRow}>
                      <span className={styles.itemEmoji}>{seed.emoji}</span>
                      <div className={styles.itemInfo}>
                        <strong>{L(seed.name)}</strong>
                        <span>{seed.price}g</span>
                      </div>
                      <button className={styles.buyBtn} onClick={() => buyItem(seed.id, seed.price)}>
                        {t("Beli", "Buy")}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.shopSection}>
                <h3>💰 {t("Jual Hasil Panen", "Sell Crops")}</h3>
                <div className={styles.itemList}>
                  {Object.entries(CROPS).map(([id, crop]) => (
                    <div key={id} className={styles.shopRow}>
                      <span className={styles.itemEmoji}>{crop.emoji}</span>
                      <div className={styles.itemInfo}>
                        <strong>{L(crop.name)} (x{inventory[id] || 0})</strong>
                        <span>+{crop.sellPrice}g</span>
                      </div>
                      <button className={styles.sellBtn} onClick={() => sellItem(id, crop.sellPrice)}>
                        {t("Jual", "Sell")}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
