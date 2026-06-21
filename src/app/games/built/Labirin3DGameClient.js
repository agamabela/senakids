"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import DPad from "@/components/DPad";
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

// ─── Procedural textures ───────────────────────────────────────────────────
function makeBrickTexture() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext("2d");
  // mortar background
  ctx.fillStyle = "#6f4f33";
  ctx.fillRect(0, 0, 128, 128);
  // bricks
  const bh = 32;
  const bw = 64;
  for (let row = 0; row * bh < 128; row++) {
    const offset = (row % 2) * (bw / 2);
    for (let x = -bw; x < 128; x += bw) {
      const shade = 150 + Math.floor(Math.random() * 35);
      ctx.fillStyle = `rgb(${shade + 20}, ${shade - 30}, ${shade - 70})`;
      ctx.fillRect(x + offset + 2, row * bh + 2, bw - 4, bh - 4);
      // top highlight
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.fillRect(x + offset + 2, row * bh + 2, bw - 4, 4);
      // bottom shadow
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(x + offset + 2, row * bh + bh - 6, bw - 4, 4);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeFloorTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#8fc15a";
  ctx.fillRect(0, 0, 64, 64);
  for (let i = 0; i < 180; i++) {
    const r = Math.random();
    ctx.fillStyle = r > 0.6 ? "#7eb04a" : r > 0.3 ? "#9ecb6a" : "#86b952";
    const s = Math.random() * 3 + 1;
    ctx.fillRect(Math.random() * 64, Math.random() * 64, s, s);
  }
  // faint cell border so paths read clearly
  ctx.strokeStyle = "rgba(0,0,0,0.06)";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
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

  // Move in an absolute world direction (0=N,1=E,2=S,3=W) — exactly like the
  // 2D maze. The camera heading stays FIXED (facing north), so there is no
  // confusing rotation: up = away, down = toward you, left/right = sideways.
  const moveDir = useCallback((worldDir) => {
    if (wonRef.current) return;
    const p = playerRef.current;
    const vec = [
      { dx: 0, dy: -1 }, // N
      { dx: 1, dy: 0 },  // E
      { dx: 0, dy: 1 },  // S
      { dx: -1, dy: 0 }, // W
    ][worldDir];

    const nx = p.cx + vec.dx;
    const ny = p.cy + vec.dy;
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

  // Build / rebuild scene
  useEffect(() => {
    if (showIntro) return;
    const mount = mountRef.current;
    if (!mount) return;

    const size = LEVELS[levelIdx].size;
    const numGems = LEVELS[levelIdx].gems;
    const grid = generateMaze(size);
    gridRef.current = grid;
    playerRef.current = { cx: 1, cy: 1, dir: 0 };
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
    scene.fog = new THREE.Fog(0x87ceeb, 8, 20);

    // Overhead follow camera — fixed orientation (never rotates) so the
    // arrow controls map exactly like the 2D maze.
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(1, 5, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.82));
    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(3, 8, 2);
    scene.add(dir);

    const brickTex = makeBrickTexture();
    const floorTex = makeFloorTexture();
    floorTex.repeat.set(size, size);

    const floorGeo = new THREE.PlaneGeometry(size, size);
    const floorMat = new THREE.MeshStandardMaterial({ map: floorTex });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(size / 2 - 0.5, 0, size / 2 - 0.5);
    scene.add(floor);

    const wallGeo = new THREE.BoxGeometry(1, 1, 1);
    const wallMats = [
      new THREE.MeshStandardMaterial({ map: brickTex, color: 0xffffff }),
      new THREE.MeshStandardMaterial({ map: brickTex, color: 0xe3cdb4 }),
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

    // ── Astronaut avatar (3rd-person, follows the player) ──
    const astroMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x4fc3f7,
      emissive: 0x1a4b6b,
      emissiveIntensity: 0.4,
      roughness: 0.2,
    });
    const packMat = new THREE.MeshStandardMaterial({ color: 0xff9800, roughness: 0.5 });

    const astro = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.22, 4, 10), astroMat);
    body.position.y = 0.34;
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.21, 18, 18), astroMat);
    helmet.position.y = 0.66;
    const visor = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), visorMat);
    visor.position.set(0, 0.66, 0.12);
    visor.scale.set(1, 0.72, 0.62);
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.08), packMat);
    pack.position.set(0, 0.4, -0.14);
    astro.add(body, helmet, visor, pack);
    astro.position.set(1, 0, 1);
    scene.add(astro);

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
      // move astronaut toward its grid cell
      astro.position.x += (p.cx - astro.position.x) * 0.2;
      astro.position.z += (p.cy - astro.position.z) * 0.2;
      // camera follows from above + behind (south), fixed orientation
      const camTX = astro.position.x;
      const camTY = 5;
      const camTZ = astro.position.z + 5;
      camera.position.x += (camTX - camera.position.x) * 0.15;
      camera.position.y += (camTY - camera.position.y) * 0.15;
      camera.position.z += (camTZ - camera.position.z) * 0.15;
      camera.lookAt(astro.position.x, 0.3, astro.position.z);

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
      brickTex.dispose();
      floorTex.dispose();
      gemGeo.dispose();
      gemMat.dispose();
      astroMat.dispose();
      visorMat.dispose();
      packMat.dispose();
      astro.children.forEach((c) => c.geometry && c.geometry.dispose());
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
      if (["arrowup", "w"].includes(k)) { e.preventDefault(); moveDir(0); }
      else if (["arrowdown", "s"].includes(k)) { e.preventDefault(); moveDir(2); }
      else if (["arrowleft", "a"].includes(k)) { e.preventDefault(); moveDir(3); }
      else if (["arrowright", "d"].includes(k)) { e.preventDefault(); moveDir(1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showIntro, moveDir]);

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
            <div className={styles.step}><span className={styles.stepNum}>1</span><span>{t("Bergerak ke segala arah dengan tombol panah", "Move in any direction with the arrow buttons")}</span></div>
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

      {/* Minimap — outside the 3D box */}
      <div className={styles.miniPanel}>
        <span className={styles.miniLabel}>🗺️ {t("Peta", "Map")}</span>
        <canvas ref={miniRef} width={132} height={132} className={styles.minimap} />
      </div>

      {/* Floating D-pad — fixed bottom-right; arrows move in world directions */}
      <DPad
        onUp={() => moveDir(0)}
        onDown={() => moveDir(2)}
        onLeft={() => moveDir(3)}
        onRight={() => moveDir(1)}
      />

      <div className={styles.controls}>
        <button className={styles.btn} onClick={newMaze}>🎲 {t("Labirin Baru", "New Maze")}</button>
      </div>

      <div className={styles.hint}>
        {t("💡 Tekan ⬆⬇⬅➡ untuk bergerak ke segala arah. Bisa juga pakai panah / WASD!",
           "💡 Press ⬆⬇⬅➡ to move any direction. Arrow keys / WASD also work!")}
      </div>
    </div>
  );
}
