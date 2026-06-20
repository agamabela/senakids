"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./Labirin3DGameClient.module.css";

const LEVELS = [
  { id: 1, name: { id: "Mudah", en: "Easy" }, size: 9, gems: 2 },
  { id: 2, name: { id: "Sedang", en: "Medium" }, size: 15, gems: 3 },
  { id: 3, name: { id: "Sulit", en: "Hard" }, size: 21, gems: 4 },
  { id: 4, name: { id: "Ekstrem", en: "Extreme" }, size: 27, gems: 5 },
];

// Recursive-backtracker maze on an odd grid. true = wall, false = open.
function generateMaze(size) {
  const grid = Array.from({ length: size }, () => Array(size).fill(true));
  const stack = [{ x: 1, y: 1 }];
  grid[1][1] = false;
  const dirs = [
    { dx: 0, dy: -2 }, { dx: 2, dy: 0 }, { dx: 0, dy: 2 }, { dx: -2, dy: 0 },
  ];
  while (stack.length) {
    const cur = stack[stack.length - 1];
    const options = [];
    for (const d of dirs) {
      const nx = cur.x + d.dx;
      const ny = cur.y + d.dy;
      if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && grid[ny][nx]) {
        options.push({ nx, ny, mx: cur.x + d.dx / 2, my: cur.y + d.dy / 2 });
      }
    }
    if (options.length) {
      const pick = options[Math.floor(Math.random() * options.length)];
      grid[pick.my][pick.mx] = false;
      grid[pick.ny][pick.nx] = false;
      stack.push({ x: pick.nx, y: pick.ny });
    } else {
      stack.pop();
    }
  }
  return grid;
}

function pickGemCells(grid, size, n) {
  const open = [];
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++)
      if (!grid[y][x] && !(x === 1 && y === 1)) open.push({ x, y });
  open.sort((a, b) => (Math.abs(b.x - 1) + Math.abs(b.y - 1)) - (Math.abs(a.x - 1) + Math.abs(a.y - 1)));
  const pool = open.slice(0, Math.max(n * 3, 6));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

function playBlip(freq, dur = 0.08, type = "sine", vol = 0.12) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!playBlip._ctx) playBlip._ctx = new Ctx();
    const ctx = playBlip._ctx;
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch (e) {
    /* ignore */
  }
}

export default function Labirin3DGameClient() {
  const { language } = useLanguage();
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  const mountRef = useRef(null);
  const miniRef = useRef(null);

  const [levelIdx, setLevelIdx] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [won, setWon] = useState(false);
  const [steps, setSteps] = useState(0);
  const [collected, setCollected] = useState(0);
  const [sessionKey, setSessionKey] = useState(0);

  const t = (id, en) => (language === "id" ? id : en);

  const playerRef = useRef({ cx: 1, cy: 1, dir: 1, targetYaw: -Math.PI / 2 });
  const gridRef = useRef(null);
  const gemsRef = useRef([]); // {x,y,collected,mesh}
  const exploredRef = useRef(new Set());
  const wonRef = useRef(false);
  const collectedRef = useRef(0);

  const totalGems = LEVELS[levelIdx].gems;

  const isWall = useCallback((x, y) => {
    const g = gridRef.current;
    if (!g) return true;
    if (x < 0 || y < 0 || x >= g.length || y >= g[0].length) return true;
    return g[y][x];
  }, []);

  const reveal = useCallback((cx, cy) => {
    const g = gridRef.current;
    if (!g) return;
    const r = 2;
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || y < 0 || x >= g.length || y >= g[0].length) continue;
        if (Math.abs(dx) + Math.abs(dy) > r + 1) continue;
        exploredRef.current.add(`${x},${y}`);
      }
  }, []);

  const moveForward = useCallback((back = false) => {
    if (wonRef.current) return;
    const p = playerRef.current;
    const vec = [
      { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 },
    ][p.dir];
    const sign = back ? -1 : 1;
    const nx = p.cx + vec.dx * sign;
    const ny = p.cy + vec.dy * sign;
    if (!isWall(nx, ny)) {
      p.cx = nx;
      p.cy = ny;
      reveal(nx, ny);
      setSteps((s) => s + 1);
      setHasChanges(true);
      playBlip(170 + Math.random() * 40, 0.06, "triangle", 0.07); // footstep

      const gem = gemsRef.current.find((g) => g.x === nx && g.y === ny && !g.collected);
      if (gem) {
        gem.collected = true;
        if (gem.mesh && gem.mesh.parent) gem.mesh.parent.remove(gem.mesh);
        collectedRef.current += 1;
        setCollected(collectedRef.current);
        playBlip(880, 0.18, "sine", 0.18);
        if (collectedRef.current >= gemsRef.current.length) {
          wonRef.current = true;
          playBlip(1320, 0.4, "sine", 0.2);
          setWon(true);
        }
      }
    }
  }, [isWall, reveal, setHasChanges]);

  const turn = useCallback((left) => {
    const p = playerRef.current;
    if (left) { p.dir = (p.dir + 3) % 4; p.targetYaw += Math.PI / 2; }
    else { p.dir = (p.dir + 1) % 4; p.targetYaw -= Math.PI / 2; }
  }, []);

  // Build / rebuild scene
  useEffect(() => {
    if (showIntro) return;
    const mount = mountRef.current;
    if (!mount) return;

    const size = LEVELS[levelIdx].size;
    const numGems = LEVELS[levelIdx].gems;
    const grid = generateMaze(size);
    gridRef.current = grid;
    playerRef.current = { cx: 1, cy: 1, dir: 1, targetYaw: -Math.PI / 2 };
    exploredRef.current = new Set();
    wonRef.current = false;
    collectedRef.current = 0;
    setWon(false);
    setSteps(0);
    setCollected(0);
    reveal(1, 1);

    const width = mount.clientWidth;
    const height = mount.clientHeight || 440;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 2.5, 9);

    const camera = new THREE.PerspectiveCamera(72, width / height, 0.1, 100);
    camera.position.set(1, 0.55, 1);
    camera.rotation.order = "YXZ";
    camera.rotation.y = -Math.PI / 2;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.78));
    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(3, 8, 2);
    scene.add(dir);

    const floorGeo = new THREE.PlaneGeometry(size, size);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x9ccc65 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(size / 2 - 0.5, 0, size / 2 - 0.5);
    scene.add(floor);

    const wallGeo = new THREE.BoxGeometry(1, 1, 1);
    const wallMats = [
      new THREE.MeshStandardMaterial({ color: 0xb98a5a }),
      new THREE.MeshStandardMaterial({ color: 0xc89b6a }),
    ];
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++)
        if (grid[y][x]) {
          const m = new THREE.Mesh(wallGeo, wallMats[(x + y) % 2]);
          m.position.set(x, 0.5, y);
          scene.add(m);
        }

    // Gems (goal) — spinning cyan diamonds
    const gemGeo = new THREE.OctahedronGeometry(0.28, 0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0x38e1d6,
      emissive: 0x12a89c,
      emissiveIntensity: 0.6,
      metalness: 0.3,
      roughness: 0.25,
    });
    const gemCells = pickGemCells(grid, size, numGems);
    const gems = gemCells.map((c) => {
      const group = new THREE.Group();
      const mesh = new THREE.Mesh(gemGeo, gemMat);
      mesh.position.y = 0.5;
      group.add(mesh);
      const light = new THREE.PointLight(0x4fe3d8, 0.9, 3.5);
      light.position.set(0, 0.6, 0);
      group.add(light);
      group.position.set(c.x, 0, c.y);
      scene.add(group);
      return { x: c.x, y: c.y, collected: false, mesh: group, spin: mesh };
    });
    gemsRef.current = gems;

    let raf;
    const drawMini = () => {
      const mini = miniRef.current;
      if (!mini) return;
      const mctx = mini.getContext("2d");
      const S = mini.width;
      const cell = S / size;
      mctx.clearRect(0, 0, S, S);
      mctx.fillStyle = "#cdbfa0";
      mctx.fillRect(0, 0, S, S);
      for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
          const seen = exploredRef.current.has(`${x},${y}`);
          if (!seen) continue;
          mctx.fillStyle = grid[y][x] ? "#7d6a45" : "#f1ead0";
          mctx.fillRect(x * cell, y * cell, Math.ceil(cell), Math.ceil(cell));
        }
      // gems
      gemsRef.current.forEach((g) => {
        if (g.collected) return;
        mctx.fillStyle = "#15a89c";
        const i = cell * 0.22;
        mctx.fillRect(g.x * cell + i, g.y * cell + i, cell - i * 2, cell - i * 2);
      });
      // player
      const p = playerRef.current;
      const pcx = p.cx * cell + cell / 2;
      const pcy = p.cy * cell + cell / 2;
      mctx.fillStyle = "#ffffff";
      mctx.strokeStyle = "#333";
      mctx.lineWidth = 1;
      mctx.beginPath();
      mctx.arc(pcx, pcy, Math.max(2, cell * 0.35), 0, Math.PI * 2);
      mctx.fill();
      mctx.stroke();
      // facing tick
      const fv = [{ dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }][p.dir];
      mctx.strokeStyle = "#2563eb";
      mctx.lineWidth = 2;
      mctx.beginPath();
      mctx.moveTo(pcx, pcy);
      mctx.lineTo(pcx + fv.dx * cell * 0.7, pcy + fv.dy * cell * 0.7);
      mctx.stroke();
    };

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const p = playerRef.current;
      camera.position.x += (p.cx - camera.position.x) * 0.18;
      camera.position.z += (p.cy - camera.position.z) * 0.18;
      camera.rotation.y += (p.targetYaw - camera.rotation.y) * 0.18;
      const time = Date.now() * 0.003;
      gems.forEach((g, i) => {
        if (g.collected) return;
        g.mesh.rotation.y += 0.03;
        g.spin.position.y = 0.5 + Math.sin(time + i) * 0.08;
      });
      renderer.render(scene, camera);
      drawMini();
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight || 440;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      wallGeo.dispose();
      wallMats.forEach((m) => m.dispose());
      floorGeo.dispose();
      floorMat.dispose();
      gemGeo.dispose();
      gemMat.dispose();
      if (renderer.domElement && renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [showIntro, levelIdx, sessionKey, reveal]);

  // Keyboard
  useEffect(() => {
    if (showIntro) return undefined;
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (["arrowup", "w"].includes(k)) { e.preventDefault(); moveForward(false); }
      else if (["arrowdown", "s"].includes(k)) { e.preventDefault(); moveForward(true); }
      else if (["arrowleft", "a"].includes(k)) { e.preventDefault(); turn(true); }
      else if (["arrowright", "d"].includes(k)) { e.preventDefault(); turn(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showIntro, moveForward, turn]);

  const newMaze = () => { wonRef.current = false; setSessionKey((k) => k + 1); };
  const nextLevel = () => { setLevelIdx((i) => (i + 1) % LEVELS.length); setSessionKey((k) => k + 1); };

  if (showIntro) {
    return (
      <div className={styles.introWrapper}>
        <div className={styles.introCard}>
          <div className={styles.introEmoji}>💎🐭</div>
          <h1>{t("🌀 Labirin 3D", "🌀 3D Maze")}</h1>
          <p>{t("Jelajahi labirin orang pertama dan kumpulkan semua permata!", "Explore the first-person maze and collect all the gems!")}</p>
          <div className={styles.instructions}>
            <div className={styles.step}><span className={styles.stepNum}>1</span><span>{t("Maju, mundur, dan belok dengan tombol panah", "Move and turn with the arrow buttons")}</span></div>
            <div className={styles.step}><span className={styles.stepNum}>2</span><span>{t("Lihat peta kecil di pojok untuk panduan", "Use the minimap in the corner to guide you")}</span></div>
            <div className={styles.step}><span className={styles.stepNum}>3</span><span>{t("Kumpulkan semua 💎 untuk menang!", "Collect all 💎 to win!")}</span></div>
          </div>
          <button className={styles.startButton} onClick={() => setShowIntro(false)}>
            {t("Mulai! 🎮", "Start! 🎮")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>🌀 {t("Labirin 3D", "3D Maze")}</h1>
          <p>{t("Level", "Level")} {levelIdx + 1}: {LEVELS[levelIdx].name[language] ?? LEVELS[levelIdx].name.id}</p>
        </div>
        <div className={styles.levelNav}>
          {LEVELS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setLevelIdx(i); setSessionKey((k) => k + 1); }}
              className={`${styles.levelBtn} ${levelIdx === i ? styles.activeLevel : ""}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.stats}>
        <span>{t("Langkah", "Steps")}: {steps}</span>
        <span>💎 {collected} / {totalGems}</span>
      </div>

      <div className={styles.viewport} ref={mountRef}>
        {/* Minimap */}
        <canvas ref={miniRef} width={132} height={132} className={styles.minimap} />

        {won && (
          <div className={styles.winOverlay}>
            <div className={styles.winCard}>
              <div className={styles.winEmoji}>🎉💎</div>
              <h2>{t("Hebat! Semua permata terkumpul!", "Yay! You collected all gems!")}</h2>
              <p>{t("Langkah", "Steps")}: {steps}</p>
              <div className={styles.winButtons}>
                <button className={styles.btn} onClick={newMaze}>🎲 {t("Labirin Baru", "New Maze")}</button>
                <button className={`${styles.btn} ${styles.nextBtn}`} onClick={nextLevel}>➡️ {t("Lanjut", "Next")}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.dpad}>
        <button className={`${styles.padBtn} ${styles.padUp}`} onClick={() => moveForward(false)} aria-label="Maju">▲</button>
        <button className={`${styles.padBtn} ${styles.padLeft}`} onClick={() => turn(true)} aria-label="Belok kiri">↺</button>
        <button className={`${styles.padBtn} ${styles.padRight}`} onClick={() => turn(false)} aria-label="Belok kanan">↻</button>
        <button className={`${styles.padBtn} ${styles.padDown}`} onClick={() => moveForward(true)} aria-label="Mundur">▼</button>
      </div>

      <div className={styles.controls}>
        <button className={styles.btn} onClick={newMaze}>🎲 {t("Labirin Baru", "New Maze")}</button>
      </div>

      <div className={styles.hint}>
        {t("💡 ▲ maju, ▼ mundur, ↺ ↻ belok. Bisa juga pakai panah / WASD!",
           "💡 ▲ forward, ▼ back, ↺ ↻ turn. Arrow keys / WASD also work!")}
      </div>
    </div>
  );
}
