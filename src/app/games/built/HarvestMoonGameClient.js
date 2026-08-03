"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import { Trophy, Info, ShoppingBag, Sun, Moon, Zap, User, Star, Plus } from "lucide-react";
import styles from "./HarvestMoonGameClient.module.css";

const GRID_W = 16;
const GRID_H = 12;
const TILE_SIZE = 40;
const CANVAS_W = GRID_W * TILE_SIZE; // 640
const CANVAS_H = GRID_H * TILE_SIZE; // 480

// Map layouts
// 0: Grass, 1: Cabin Floor, 2: Cabin Wall, 3: Bed, 4: Door, 5: Road to Shop, 6: Shop Area (Trigger)
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
  const setHasChanges = useActivityStore((state) => state.setHasChanges);
  const t = (id, en) => (language === "id" ? id : en);

  const canvasRef = useRef(null);
  
  // Game states
  const [screen, setScreen] = useState("intro");
  const [day, setDay] = useState(1);
  const [gold, setGold] = useState(100);
  const [energy, setEnergy] = useState(100);
  const [timeHour, setTimeHour] = useState(6); // starts 6 AM
  const [timeMin, setTimeMin] = useState(0);
  const [weather, setWeather] = useState("sunny"); // sunny or rainy
  const [activeToolIndex, setActiveToolIndex] = useState(0);
  const [inventory, setInventory] = useState({
    turnip_seeds: 5,
    carrot_seeds: 2,
    strawberry_seeds: 0,
    turnip: 0,
    carrot: 0,
    strawberry: 0,
  });
  const [shopOpen, setShopOpen] = useState(false);
  const [fainted, setFainted] = useState(false);
  const [gamepadActive, setGamepadActive] = useState(false);

  // Floating notifications
  const [notifications, setNotifications] = useState([]);

  // Ref states for game loop to avoid React stale states
  const playerRef = useRef({ x: 100, y: 160, vx: 0, vy: 0, dir: "down", walking: false, animFrame: 0 });
  const keysPressedRef = useRef({});
  const tilesRef = useRef([]); // tilled status, crops, obstacles
  const timeProgressRef = useRef(0); // accumulates ms to tick minutes
  const gamepadRef = useRef(null);
  const prevGamepadButtonsRef = useRef([]);

  // Add floating notifications
  const showNotification = useCallback((text, color = "#fff") => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, text, color }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 2000);
  }, []);

  // Save game data
  const saveGame = useCallback((currGold, currDay, currEnergy, currInventory, currTiles) => {
    try {
      const saveData = {
        gold: currGold,
        day: currDay,
        energy: currEnergy,
        inventory: currInventory,
        tiles: currTiles || tilesRef.current,
        weather,
      };
      localStorage.setItem("kiddoworld_harvest_moon_save", JSON.stringify(saveData));
    } catch (e) {
      console.error("Failed to save game", e);
    }
  }, [weather]);

  // Initial setup & loading
  const startNewGame = useCallback(() => {
    // Generate initial field layout
    const grid = [];
    for (let y = 0; y < GRID_H; y++) {
      grid[y] = [];
      for (let x = 0; x < GRID_W; x++) {
        // Default grass field
        let tilled = false;
        let watered = false;
        let crop = null; // { type, stage, wateredDays }
        let obstacle = null; // "weed", "rock", "log"

        const tileType = DEFAULT_MAP[y][x];
        if (tileType === 0) {
          // 22% chance of obstacles on grass fields
          if (Math.random() < 0.22) {
            const rand = Math.random();
            if (rand < 0.5) obstacle = "weed";
            else if (rand < 0.8) obstacle = "rock";
            else obstacle = "log";
          }
        }
        grid[y][x] = { tilled, watered, crop, obstacle };
      }
    }
    tilesRef.current = grid;
    playerRef.current = { x: 100, y: 160, vx: 0, vy: 0, dir: "down", walking: false, animFrame: 0 };
    setDay(1);
    setGold(100);
    setEnergy(100);
    setTimeHour(6);
    setTimeMin(0);
    setWeather("sunny");
    setInventory({
      turnip_seeds: 5,
      carrot_seeds: 2,
      strawberry_seeds: 0,
      turnip: 0,
      carrot: 0,
      strawberry: 0,
    });
    setScreen("playing");
    setFainted(false);
  }, []);

  const loadSavedGame = useCallback(() => {
    try {
      const saved = localStorage.getItem("kiddoworld_harvest_moon_save");
      if (saved) {
        const parsed = JSON.parse(saved);
        setGold(parsed.gold ?? 100);
        setDay(parsed.day ?? 1);
        setEnergy(parsed.energy ?? 100);
        setInventory(parsed.inventory ?? {});
        tilesRef.current = parsed.tiles ?? [];
        setWeather(parsed.weather ?? "sunny");
        setTimeHour(6);
        setTimeMin(0);
        playerRef.current = { x: 100, y: 160, vx: 0, vy: 0, dir: "down", walking: false, animFrame: 0 };
        setScreen("playing");
        showNotification(t("Game dimuat!", "Game loaded!"), "#81c784");
      } else {
        startNewGame();
      }
    } catch (e) {
      startNewGame();
    }
  }, [startNewGame, showNotification, t]);

  // Sleep logic: progress to next day
  const sleepAndWakeUp = useCallback(() => {
    setScreen("fade-out");
    setTimeout(() => {
      // Progress crops
      const grid = tilesRef.current;
      for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
          const cell = grid[y][x];
          // If rainy, auto-water all tilled soil
          if (weather === "rainy" && cell.tilled) {
            cell.watered = true;
          }
          
          if (cell.crop) {
            if (cell.watered) {
              if (cell.crop.stage < 3) {
                cell.crop.stage += 1;
              }
            }
          }
          // Reset watered state for tomorrow
          cell.watered = false;
        }
      }

      // Daily obstacle spawns (new weeds/rocks/logs)
      for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
          if (DEFAULT_MAP[y][x] === 0 && !grid[y][x].tilled && !grid[y][x].obstacle && Math.random() < 0.05) {
            const rand = Math.random();
            if (rand < 0.6) grid[y][x].obstacle = "weed";
            else if (rand < 0.85) grid[y][x].obstacle = "rock";
            else grid[y][x].obstacle = "log";
          }
        }
      }

      // Next day configurations
      setDay((d) => {
        const nextDay = d + 1;
        // Random weather for next day: 25% chance of rain
        const nextWeather = Math.random() < 0.25 ? "rainy" : "sunny";
        setWeather(nextWeather);
        
        // Recover energy
        setEnergy((e) => {
          const recovered = fainted ? 50 : 100;
          setFainted(false);
          
          // Save game automatically
          saveGame(gold, nextDay, recovered, inventory, grid);
          return recovered;
        });
        return nextDay;
      });

      // Place player in front of bed
      playerRef.current = { x: 100, y: 160, vx: 0, vy: 0, dir: "down", walking: false, animFrame: 0 };
      setTimeHour(6);
      setTimeMin(0);
      setScreen("playing");
      showNotification(t("Hari baru telah dimulai!", "A new day has started!"), "#ffd54f");
    }, 1500);
  }, [weather, fainted, gold, inventory, saveGame, showNotification, t]);

  // Shop actions
  const buyItem = (seedId, price) => {
    if (gold < price) {
      showNotification(t("Emas tidak cukup!", "Not enough gold!"), "#e57373");
      return;
    }
    setGold((g) => {
      const nextGold = g - price;
      setInventory((inv) => {
        const nextInv = { ...inv, [seedId]: (inv[seedId] || 0) + 1 };
        saveGame(nextGold, day, energy, nextInv);
        return nextInv;
      });
      return nextGold;
    });
    showNotification(t(`Membeli benih (-${price}g)`, `Bought seed (-${price}g)`), "#81c784");
    setHasChanges(true);
  };

  const sellItem = (cropId, price) => {
    if ((inventory[cropId] || 0) <= 0) {
      showNotification(t("Tidak ada hasil panen!", "No crops to sell!"), "#e57373");
      return;
    }
    setGold((g) => {
      const nextGold = g + price;
      setInventory((inv) => {
        const nextInv = { ...inv, [cropId]: inv[cropId] - 1 };
        saveGame(nextGold, day, energy, nextInv);
        return nextInv;
      });
      return nextGold;
    });
    showNotification(t(`Menjual hasil panen (+${price}g)`, `Sold crop (+${price}g)`), "#ffd54f");
    setHasChanges(true);
  };

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (screen !== "playing" || shopOpen) return;
      const k = e.key.toLowerCase();
      
      // Directions
      if (e.key === "ArrowUp" || k === "w") keysPressedRef.current.up = true;
      if (e.key === "ArrowDown" || k === "s") keysPressedRef.current.down = true;
      if (e.key === "ArrowLeft" || k === "a") keysPressedRef.current.left = true;
      if (e.key === "ArrowRight" || k === "d") keysPressedRef.current.right = true;

      // Tools switching (1-9 keys)
      if (e.key >= "1" && e.key <= "9") {
        const idx = parseInt(e.key) - 1;
        if (idx < TOOLS.length) setActiveToolIndex(idx);
      }
      
      // Use active tool (Space)
      if (e.key === " ") {
        e.preventDefault();
        triggerToolUse();
      }

      // Interact (E key)
      if (k === "e") {
        e.preventDefault();
        triggerInteraction();
      }
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
  }, [screen, shopOpen, activeToolIndex, energy]);

  // Tool use trigger
  const triggerToolUse = useCallback(() => {
    if (energy <= 0) {
      showNotification(t("Terlalu lelah! Istirahatlah.", "Too tired! Go rest."), "#e57373");
      return;
    }

    const player = playerRef.current;
    // Calculate targeted tile based on player facing direction
    let targetX = Math.floor((player.x + 12) / TILE_SIZE);
    let targetY = Math.floor((player.y + 12) / TILE_SIZE);
    if (player.dir === "up") targetY = Math.floor((player.y - 8) / TILE_SIZE);
    else if (player.dir === "down") targetY = Math.floor((player.y + 32) / TILE_SIZE);
    else if (player.dir === "left") targetX = Math.floor((player.x - 8) / TILE_SIZE);
    else if (player.dir === "right") targetX = Math.floor((player.x + 32) / TILE_SIZE);

    // Keep within bounds
    if (targetX < 0 || targetX >= GRID_W || targetY < 0 || targetY >= GRID_H) return;

    const grid = tilesRef.current;
    const tile = grid[targetY][targetX];
    const tileType = DEFAULT_MAP[targetY][targetX];
    const tool = TOOLS[activeToolIndex];

    // Cannot till or plant inside cabin walls or floor
    const isFarmable = tileType === 0;

    let success = false;
    let actionEnergy = 5;

    if (tool.id === "hand") {
      // Harvest mature crop
      if (tile.crop && tile.crop.stage === 3) {
        const cropType = tile.crop.type;
        setInventory((inv) => ({ ...inv, [cropType]: (inv[cropType] || 0) + 1 }));
        tile.crop = null;
        tile.tilled = false; // reset back to grass
        showNotification(t(`Panen ${CROPS[cropType].name[language]}!`, `Harvested ${CROPS[cropType].name[language]}!`), "#81c784");
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
        const seedCount = inventory[tool.id] || 0;
        if (seedCount > 0) {
          tile.crop = { type: tool.cropId, stage: 0 };
          setInventory((inv) => ({ ...inv, [tool.id]: seedCount - 1 }));
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
      setEnergy((e) => {
        const nextEnergy = Math.max(0, e - actionEnergy);
        if (nextEnergy <= 0) {
          handleFaint();
        }
        return nextEnergy;
      });
      setHasChanges(true);
    }
  }, [activeToolIndex, inventory, energy, language, showNotification, t]);

  // Faint handler
  const handleFaint = () => {
    setFainted(true);
    setScreen("fainted");
    setTimeout(() => {
      setGold((g) => Math.max(0, g - 20));
      sleepAndWakeUp();
    }, 3000);
  };

  // Interact (E key / Interact button)
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

  // Gamepad Event Listeners
  useEffect(() => {
    const onGamepadConnected = (e) => {
      setGamepadActive(true);
      showNotification(t("Joystick terhubung!", "Joystick connected!"), "#81c784");
    };

    const onGamepadDisconnected = () => {
      setGamepadActive(false);
      showNotification(t("Joystick terputus", "Joystick disconnected"), "#e57373");
    };

    window.addEventListener("gamepadconnected", onGamepadConnected);
    window.addEventListener("gamepaddisconnected", onGamepadDisconnected);

    const gps = navigator.getGamepads ? navigator.getGamepads() : [];
    if (gps[0] || gps[1]) setGamepadActive(true);

    return () => {
      window.removeEventListener("gamepadconnected", onGamepadConnected);
      window.removeEventListener("gamepaddisconnected", onGamepadDisconnected);
    };
  }, [showNotification, t]);

  // Main rendering & updates loop
  useEffect(() => {
    if (screen !== "playing") return undefined;

    let animId;
    let lastTime = Date.now();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const updateGame = () => {
      const now = Date.now();
      const dt = now - lastTime;
      lastTime = now;

      // Gamepad polling
      const gps = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gps[0] || gps[1] || gps[2] || gps[3];
      
      let gpDx = 0;
      let gpDy = 0;
      
      if (gp) {
        const ax = gp.axes[0];
        const ay = gp.axes[1];
        if (ax < -0.3) gpDx = -1;
        else if (ax > 0.3) gpDx = 1;
        if (ay < -0.3) gpDy = -1;
        else if (ay > 0.3) gpDy = 1;

        if (gp.buttons[12] && gp.buttons[12].pressed) gpDy = -1;
        if (gp.buttons[13] && gp.buttons[13].pressed) gpDy = 1;
        if (gp.buttons[14] && gp.buttons[14].pressed) gpDx = -1;
        if (gp.buttons[15] && gp.buttons[15].pressed) gpDx = 1;

        const pressed = gp.buttons.map((b) => b.pressed);
        const prevPressed = prevGamepadButtonsRef.current;

        if (pressed[0] && !prevPressed[0]) {
          triggerToolUse();
        }
        if ((pressed[2] && !prevPressed[2]) || (pressed[3] && !prevPressed[3])) {
          setActiveToolIndex((idx) => (idx + 1) % TOOLS.length);
        }
        if (pressed[1] && !prevPressed[1]) {
          if (shopOpen) setShopOpen(false);
          else triggerInteraction();
        }

        prevGamepadButtonsRef.current = pressed;
      }

      // Keyboard movement
      let kDx = 0;
      let kDy = 0;
      const keys = keysPressedRef.current;
      if (keys.left) kDx = -1;
      else if (keys.right) kDx = 1;
      if (keys.up) kDy = -1;
      else if (keys.down) kDy = 1;

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
          
          const tileType = DEFAULT_MAP[ty][tx];
          const obstacle = tilesRef.current[ty]?.[tx]?.obstacle;
          
          if (tileType === 2) return true;
          if (obstacle === "rock" || obstacle === "log") return true;
          return false;
        };

        const pSizeW = 20;
        const pSizeH = 20;
        const offsets = [
          { x: 2, y: 12 },
          { x: pSizeW - 2, y: 12 },
          { x: 2, y: pSizeH + 10 },
          { x: pSizeW - 2, y: pSizeH + 10 },
        ];

        let collideX = false;
        let collideY = false;

        offsets.forEach((offset) => {
          const cx = Math.floor((nextX + offset.x) / TILE_SIZE);
          const cy = Math.floor((player.y + offset.y) / TILE_SIZE);
          if (checkCollision(cx, cy)) collideX = true;
        });

        offsets.forEach((offset) => {
          const cx = Math.floor((player.x + offset.x) / TILE_SIZE);
          const cy = Math.floor((nextY + offset.y) / TILE_SIZE);
          if (checkCollision(cx, cy)) collideY = true;
        });

        if (!collideX) player.x = nextX;
        if (!collideY) player.y = nextY;

        player.animFrame = (player.animFrame + 0.15) % 4;
      } else {
        player.animFrame = 0;
      }

      player.x = Math.max(0, Math.min(CANVAS_W - 24, player.x));
      player.y = Math.max(0, Math.min(CANVAS_H - 32, player.y));

      if (player.x >= CANVAS_W - 30 && Math.floor((player.y + 12) / TILE_SIZE) === 6) {
        player.x = CANVAS_W - 45;
        setShopOpen(true);
      }

      // Time progression logic
      timeProgressRef.current += dt;
      if (timeProgressRef.current >= 4500) {
        timeProgressRef.current = 0;
        setTimeMin((m) => {
          let nextMin = m + 30;
          if (nextMin >= 60) {
            nextMin = 0;
            setTimeHour((h) => {
              const nextHour = h + 1;
              if (nextHour >= 24) {
                handleFaint();
                return 6;
              }
              return nextHour;
            });
          }
          return nextMin;
        });
      }

      // Draw Base
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      const grid = tilesRef.current;
      for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
          const tileType = DEFAULT_MAP[y][x];
          const cell = grid[y]?.[x] || {};

          const rx = x * TILE_SIZE;
          const ry = y * TILE_SIZE;

          if (tileType === 0) {
            ctx.fillStyle = "#aed581";
            ctx.fillRect(rx, ry, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = "#9ccc65";
            ctx.beginPath();
            ctx.moveTo(rx + 5, ry + 12);
            ctx.lineTo(rx + 8, ry + 8);
            ctx.lineTo(rx + 11, ry + 12);
            ctx.stroke();
          } else if (tileType === 1 || tileType === 3 || tileType === 4) {
            ctx.fillStyle = "#d7ccc8";
            ctx.fillRect(rx, ry, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = "#bcaaa4";
            ctx.strokeRect(rx, ry, TILE_SIZE, TILE_SIZE);
          } else if (tileType === 2) {
            ctx.fillStyle = "#8d6e63";
            ctx.fillRect(rx, ry, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = "#5d4037";
            ctx.fillRect(rx + 2, ry + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          } else if (tileType === 5) {
            ctx.fillStyle = "#ffe0b2";
            ctx.fillRect(rx, ry, TILE_SIZE, TILE_SIZE);
          } else if (tileType === 6) {
            ctx.fillStyle = "#ffe0b2";
            ctx.fillRect(rx, ry, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = "#ffb74d";
            ctx.fillRect(rx + 15, ry, 10, TILE_SIZE);
          }

          if (tileType === 3) {
            ctx.fillStyle = "#e57373";
            ctx.fillRect(rx + 4, ry + 6, TILE_SIZE - 8, TILE_SIZE - 12);
            ctx.fillStyle = "#eceff1";
            ctx.fillRect(rx + 6, ry + 8, 12, 10);
          }

          if (tileType === 4) {
            ctx.fillStyle = "#a1887f";
            ctx.fillRect(rx + 8, ry + 12, TILE_SIZE - 16, TILE_SIZE - 12);
            ctx.fillStyle = "#ffd54f";
            ctx.beginPath();
            ctx.arc(rx + 14, ry + 26, 3, 0, Math.PI * 2);
            ctx.fill();
          }

          if (cell.tilled) {
            ctx.fillStyle = cell.watered ? "#5d4037" : "#8d6e63";
            ctx.fillRect(rx + 2, ry + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.strokeStyle = "#4e342e";
            ctx.strokeRect(rx + 4, ry + 4, TILE_SIZE - 8, TILE_SIZE - 8);
          }

          if (cell.obstacle === "weed") {
            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("🌿", rx + 20, ry + 20);
          } else if (cell.obstacle === "rock") {
            ctx.fillStyle = "#90a4ae";
            ctx.beginPath();
            ctx.arc(rx + 20, ry + 20, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#78909c";
            ctx.beginPath();
            ctx.arc(rx + 16, ry + 16, 5, 0, Math.PI * 2);
            ctx.fill();
          } else if (cell.obstacle === "log") {
            ctx.fillStyle = "#8d6e63";
            ctx.fillRect(rx + 6, ry + 10, TILE_SIZE - 12, 16);
            ctx.strokeStyle = "#5d4037";
            ctx.strokeRect(rx + 6, ry + 10, TILE_SIZE - 12, 16);
            ctx.fillStyle = "#a1887f";
            ctx.fillRect(rx + 6, ry + 12, 4, 12);
          }

          if (cell.crop) {
            const cropConfig = CROPS[cell.crop.type];
            if (cell.crop.stage === 0) {
              ctx.fillStyle = "#81c784";
              ctx.beginPath();
              ctx.arc(rx + 20, ry + 26, 3, 0, Math.PI * 2);
              ctx.fill();
            } else if (cell.crop.stage === 1) {
              ctx.fillStyle = "#81c784";
              ctx.fillRect(rx + 18, ry + 18, 4, 10);
              ctx.fillStyle = "#4caf50";
              ctx.fillRect(rx + 14, ry + 14, 5, 5);
            } else if (cell.crop.stage === 2) {
              ctx.font = "14px Arial";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText("🌱", rx + 20, ry + 18);
            } else if (cell.crop.stage === 3) {
              ctx.font = "24px Arial";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(cropConfig.emoji, rx + 20, ry + 20);
            }
          }
        }
      }

      // Draw Player
      ctx.save();
      const pAnim = Math.floor(player.animFrame);
      const bobbing = player.walking && (pAnim === 1 || pAnim === 3) ? -3 : 0;
      
      ctx.fillStyle = "#ffe082";
      ctx.beginPath();
      ctx.arc(player.x + 12, player.y + 10 + bobbing, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffd54f";
      ctx.fillRect(player.x + 2, player.y + 10 + bobbing, 20, 3);

      ctx.fillStyle = "#ffccbc";
      ctx.fillRect(player.x + 5, player.y + 13 + bobbing, 14, 8);

      ctx.fillStyle = "#1e88e5";
      ctx.fillRect(player.x + 5, player.y + 21 + bobbing, 14, 10);

      ctx.fillStyle = "#e53935";
      ctx.fillRect(player.x + 2, player.y + 21 + bobbing, 3, 6);
      ctx.fillRect(player.x + 19, player.y + 21 + bobbing, 3, 6);

      ctx.fillStyle = "#0d47a1";
      if (player.walking) {
        if (pAnim % 2 === 0) {
          ctx.fillRect(player.x + 4, player.y + 31, 5, 3);
        } else {
          ctx.fillRect(player.x + 15, player.y + 31, 5, 3);
        }
      } else {
        ctx.fillRect(player.x + 4, player.y + 31, 5, 3);
        ctx.fillRect(player.x + 15, player.y + 31, 5, 3);
      }
      ctx.restore();

      // Shading
      let shadeColor = null;
      let opacity = 0;
      
      if (timeHour >= 18 && timeHour < 20) {
        shadeColor = "255, 110, 0";
        opacity = 0.35 * ((timeHour - 18) + timeMin / 60);
      } else if (timeHour >= 20 && timeHour < 24) {
        shadeColor = "12, 17, 54";
        opacity = 0.65;
      }

      if (shadeColor && opacity > 0) {
        ctx.fillStyle = `rgba(${shadeColor}, ${opacity})`;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      }

      if (weather === "rainy") {
        ctx.strokeStyle = "rgba(174, 219, 245, 0.4)";
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 8; i++) {
          const rx = (now + i * 90) % CANVAS_W;
          const ry = (now * 1.5 + i * 120) % CANVAS_H;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 4, ry + 12);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(updateGame);
    };

    animId = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(animId);
  }, [screen, shopOpen, activeToolIndex, inventory, weather, timeHour, timeMin, handleFaint, triggerInteraction, triggerToolUse]);

  useEffect(() => {
    loadSavedGame();
  }, [loadSavedGame]);

  return (
    <div className={styles.gameWrapper}>
      {/* HUD Header */}
      <div className={styles.topBar}>
        <div className={styles.pill} title="Calendar">
          📅 {t("Hari", "Day")} {day}
        </div>
        <div className={styles.pill} title="Gold">
          🪙 {gold}g
        </div>
        <div className={`${styles.pill} ${energy < 25 ? styles.danger : ""}`} title="Energy">
          <Zap size={15} style={{ marginRight: 3 }} /> {energy}/100
        </div>
        <div className={styles.pill} title="Time">
          ⏰ {timeHour.toString().padStart(2, "0")}:{timeMin.toString().padStart(2, "0")}{" "}
          {timeHour >= 18 || timeHour < 6 ? <Moon size={14} style={{ marginLeft: 4 }} /> : <Sun size={14} style={{ marginLeft: 4 }} />}
        </div>
        <div className={styles.pill} title="Weather">
          {weather === "sunny" ? "☀️ Sunny" : "🌧️ Rainy"}
        </div>
        
        {gamepadActive && (
          <div className={styles.gamepadBadge} title="Joystick Active">
            🎮 Active
          </div>
        )}

        <button className={styles.menuPill} onClick={() => setScreen("intro")}>
          {t("Keluar", "Exit")}
        </button>
      </div>

      {screen === "playing" && (
        <div className={styles.viewport}>
          <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className={styles.canvas} />
          
          <div className={styles.notificationsContainer}>
            {notifications.map((n) => (
              <div key={n.id} className={styles.toast} style={{ color: n.color }}>
                {n.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {screen === "intro" && (
        <div className={styles.introCard}>
          <div className={styles.introEmoji}>🌾</div>
          <h1>Harvest Moon 2.0</h1>
          <p className={styles.introDesc}>
            {t(
              "Kelola kebunmu! Cangkul tanah, siram air, tanam bibit, bersihkan ladang, dan tidurlah di ranjang kabinmu untuk beristirahat dan memajukan waktu.",
              "Manage your farm! Till soil, water, plant crops, clear logs, and sleep in your cabin's bed to rest and progress time."
            )}
          </p>
          <div className={styles.endButtons}>
            <button className={styles.btnPrimary} onClick={loadSavedGame}>
              {t("Lanjutkan Game", "Continue Game")}
            </button>
            <button className={styles.btnGhost} onClick={startNewGame}>
              {t("Game Baru", "New Game")}
            </button>
          </div>
          <div className={styles.controlHint}>
            <strong>{t("Kontrol Keyboard:", "Keyboard Controls:")}</strong> Arrow/WASD = {t("Gerak", "Move")}, Space = {t("Pakai Alat", "Use Tool")}, E = {t("Tidur/Toko", "Sleep/Shop")}, 1-9 = {t("Alat", "Select Tool")}
          </div>
          <div className={styles.controlHint}>
            <strong>{t("Kontrol Joystick:", "Joystick Controls:")}</strong> Stick/D-pad = {t("Gerak", "Move")}, Button A = {t("Pakai Alat", "Use Tool")}, Button B = {t("Tidur/Toko", "Interact/Shop")}, Button X/Y = {t("Pilih Alat", "Next Tool")}
          </div>
        </div>
      )}

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

      {screen === "fade-out" && (
        <div className={styles.fadeOutScreen}>
          <div className={styles.sleepSymbol}>💤</div>
          <h2>{t("Tidur...", "Sleeping...")}</h2>
        </div>
      )}

      {/* Hotbar */}
      {screen === "playing" && (
        <div className={styles.hotbar}>
          {TOOLS.map((t, idx) => (
            <button
              key={t.id}
              className={`${styles.hotbarCell} ${idx === activeToolIndex ? styles.active : ""}`}
              onClick={() => setActiveToolIndex(idx)}
            >
              <span className={styles.cellEmoji}>{t.emoji}</span>
              <span className={styles.cellName}>{L(t.name)}</span>
              {t.isSeed && (
                <span className={styles.cellQty}>
                  x{inventory[t.id] || 0}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* On-Screen Mobile Controllers */}
      {screen === "playing" && (
        <div className={styles.mobileControls}>
          <div className={styles.dpad}>
            <button
              className={styles.dpadBtn}
              onTouchStart={() => { keysPressedRef.current.up = true; }}
              onTouchEnd={() => { keysPressedRef.current.up = false; }}
              onMouseDown={() => { keysPressedRef.current.up = true; }}
              onMouseUp={() => { keysPressedRef.current.up = false; }}
            >
              ▲
            </button>
            <div className={styles.dpadRow}>
              <button
                className={styles.dpadBtn}
                onTouchStart={() => { keysPressedRef.current.left = true; }}
                onTouchEnd={() => { keysPressedRef.current.left = false; }}
                onMouseDown={() => { keysPressedRef.current.left = true; }}
                onMouseUp={() => { keysPressedRef.current.left = false; }}
              >
                ◀
              </button>
              <button
                className={styles.dpadBtn}
                onTouchStart={() => { keysPressedRef.current.right = true; }}
                onTouchEnd={() => { keysPressedRef.current.right = false; }}
                onMouseDown={() => { keysPressedRef.current.right = true; }}
                onMouseUp={() => { keysPressedRef.current.right = false; }}
              >
                ▶
              </button>
            </div>
            <button
              className={styles.dpadBtn}
              onTouchStart={() => { keysPressedRef.current.down = true; }}
              onTouchEnd={() => { keysPressedRef.current.down = false; }}
              onMouseDown={() => { keysPressedRef.current.down = true; }}
              onMouseUp={() => { keysPressedRef.current.down = false; }}
            >
              ▼
            </button>
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

      {/* Shop Overlay Modal */}
      {shopOpen && (
        <div className={styles.shopOverlay}>
          <div className={styles.shopCard}>
            <div className={styles.shopHeader}>
              <ShoppingBag size={24} style={{ color: "#ffd54f" }} />
              <h2>{t("Toko Benih & Jual Hasil Tani", "Seed Shop & Sell Stand")}</h2>
              <button className={styles.closeBtn} onClick={() => setShopOpen(false)}>×</button>
            </div>
            
            <div className={styles.shopGold}>
              🪙 {t("Emas Anda:", "Your Gold:")} <strong>{gold}g</strong>
            </div>

            <div className={styles.shopGrid}>
              <div className={styles.shopSection}>
                <h3>🛒 {t("Beli Benih", "Buy Seeds")}</h3>
                <div className={styles.itemList}>
                  {TOOLS.filter((t) => t.isSeed).map((seed) => (
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

  function L(o) {
    if (o && typeof o === "object") {
      return o[language] || o.en;
    }
    return o;
  }
}
