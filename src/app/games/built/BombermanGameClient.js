"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import DPad from "@/components/DPad";
import styles from "./BombermanGameClient.module.css";

const FLOOR = 0;
const WALL = 1;
const CRATE = 2;

const LEVELS = [
  { id: 1, name: { id: "Mudah", en: "Easy" },     size: 9,  enemies: 2, range: 1, lives: 3, crate: 0.45 },
  { id: 2, name: { id: "Sedang", en: "Medium" },  size: 11, enemies: 3, range: 2, lives: 3, crate: 0.5 },
  { id: 3, name: { id: "Sulit", en: "Hard" },     size: 13, enemies: 4, range: 2, lives: 3, crate: 0.55 },
  { id: 4, name: { id: "Ekstrem", en: "Extreme" },size: 13, enemies: 6, range: 2, lives: 4, crate: 0.6 },
];

const BOMB_FUSE = 1800;
const BLAST_LIFE = 480;
const ENEMY_INTERVAL = 520;
const TICK = 100;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildLevel(cfg) {
  const N = cfg.size;
  const grid = Array.from({ length: N }, () => Array(N).fill(FLOOR));
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      if (x === 0 || y === 0 || x === N - 1 || y === N - 1) grid[y][x] = WALL;
      else if (x % 2 === 0 && y % 2 === 0) grid[y][x] = WALL;
    }
  const safe = new Set(["1,1", "1,2", "2,1"]);
  for (let y = 1; y < N - 1; y++)
    for (let x = 1; x < N - 1; x++) {
      if (grid[y][x] !== FLOOR || safe.has(`${x},${y}`)) continue;
      if (Math.random() < cfg.crate) grid[y][x] = CRATE;
    }
  const open = [];
  for (let y = 1; y < N - 1; y++)
    for (let x = 1; x < N - 1; x++)
      if (grid[y][x] === FLOOR && x + y > 5) open.push({ x, y });
  const enemyCells = shuffle(open).slice(0, cfg.enemies);
  const enemies = enemyCells.map((c, i) => ({ id: i, x: c.x, y: c.y }));
  return { grid, N, enemies };
}

export default function BombermanGameClient() {
  const { language } = useLanguage();
  const setHasChanges = useActivityStore((state) => state.setHasChanges);
  const t = (id, en) => (language === "id" ? id : en);

  const [levelIdx, setLevelIdx] = useState(0);
  const [screen, setScreen] = useState("intro");
  const [sceneKey, setSceneKey] = useState(0);
  const [, force] = useState(0);
  const rerender = useCallback(() => force((f) => f + 1), []);

  const cfg = LEVELS[levelIdx];
  const mountRef = useRef(null);

  // game state refs
  const gridRef = useRef(null);
  const NRef = useRef(0);
  const playerRef = useRef({ x: 1, y: 1 });
  const enemiesRef = useRef([]);
  const bombsRef = useRef([]);
  const blastsRef = useRef([]);
  const starsRef = useRef([]);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const invulnRef = useRef(0);
  const statusRef = useRef("playing");
  const enemyAccRef = useRef(0);

  const start = useCallback((idx) => {
    const c = LEVELS[idx];
    const { grid, N, enemies } = buildLevel(c);
    gridRef.current = grid;
    NRef.current = N;
    playerRef.current = { x: 1, y: 1 };
    enemiesRef.current = enemies;
    bombsRef.current = [];
    blastsRef.current = [];
    starsRef.current = [];
    livesRef.current = c.lives;
    scoreRef.current = 0;
    invulnRef.current = 0;
    statusRef.current = "playing";
    enemyAccRef.current = 0;
    setScreen("playing");
    setSceneKey((k) => k + 1);
    rerender();
  }, [rerender]);

  const isBlocked = (x, y) => {
    const g = gridRef.current;
    if (!g) return true;
    if (x < 0 || y < 0 || x >= NRef.current || y >= NRef.current) return true;
    if (g[y][x] === WALL || g[y][x] === CRATE) return true;
    if (bombsRef.current.some((b) => b.x === x && b.y === y)) return true;
    return false;
  };

  const hitPlayer = useCallback(() => {
    if (invulnRef.current > 0) return;
    livesRef.current -= 1;
    invulnRef.current = 1500;
    if (livesRef.current <= 0) {
      statusRef.current = "lose";
      setScreen("lose");
    } else {
      playerRef.current = { x: 1, y: 1 };
    }
  }, []);

  const explode = useCallback((bomb) => {
    const g = gridRef.current;
    const N = NRef.current;
    const cells = [{ x: bomb.x, y: bomb.y }];
    const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    for (const [dx, dy] of dirs) {
      for (let r = 1; r <= bomb.range; r++) {
        const nx = bomb.x + dx * r;
        const ny = bomb.y + dy * r;
        if (nx < 0 || ny < 0 || nx >= N || ny >= N) break;
        if (g[ny][nx] === WALL) break;
        cells.push({ x: nx, y: ny });
        if (g[ny][nx] === CRATE) {
          g[ny][nx] = FLOOR;
          if (Math.random() < 0.25) starsRef.current.push({ x: nx, y: ny });
          break;
        }
      }
    }
    for (const c of cells) blastsRef.current.push({ x: c.x, y: c.y, life: BLAST_LIFE });
    bombsRef.current.forEach((b) => {
      if (b !== bomb && cells.some((c) => c.x === b.x && c.y === b.y)) b.timer = 0;
    });
    let killed = 0;
    enemiesRef.current = enemiesRef.current.filter((e) => {
      const dead = cells.some((c) => c.x === e.x && c.y === e.y);
      if (dead) killed++;
      return !dead;
    });
    if (killed) scoreRef.current += killed * 100;
    if (cells.some((c) => c.x === playerRef.current.x && c.y === playerRef.current.y)) hitPlayer();
    bombsRef.current = bombsRef.current.filter((b) => b !== bomb);
    if (enemiesRef.current.length === 0 && statusRef.current === "playing") {
      statusRef.current = "win";
      setScreen("win");
    }
  }, [hitPlayer]);

  const move = useCallback((dx, dy) => {
    if (statusRef.current !== "playing") return;
    const p = playerRef.current;
    const nx = p.x + dx;
    const ny = p.y + dy;
    if (isBlocked(nx, ny)) return;
    p.x = nx;
    p.y = ny;
    setHasChanges(true);
    const si = starsRef.current.findIndex((s) => s.x === nx && s.y === ny);
    if (si !== -1) {
      starsRef.current.splice(si, 1);
      scoreRef.current += 50;
    }
    if (enemiesRef.current.some((e) => e.x === nx && e.y === ny)) hitPlayer();
    rerender();
  }, [setHasChanges, hitPlayer, rerender]);

  const placeBomb = useCallback(() => {
    if (statusRef.current !== "playing") return;
    const p = playerRef.current;
    if (bombsRef.current.some((b) => b.x === p.x && b.y === p.y)) return;
    if (bombsRef.current.length >= 2) return;
    bombsRef.current.push({ x: p.x, y: p.y, timer: BOMB_FUSE, range: cfg.range });
    rerender();
  }, [cfg.range, rerender]);

  // ── Game logic loop ──
  useEffect(() => {
    if (screen !== "playing") return undefined;
    const id = setInterval(() => {
      if (statusRef.current !== "playing") return;
      for (const b of [...bombsRef.current]) {
        b.timer -= TICK;
        if (b.timer <= 0) explode(b);
      }
      blastsRef.current = blastsRef.current.filter((bl) => (bl.life -= TICK) > 0);
      if (invulnRef.current > 0) invulnRef.current -= TICK;
      enemyAccRef.current += TICK;
      if (enemyAccRef.current >= ENEMY_INTERVAL) {
        enemyAccRef.current = 0;
        const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        enemiesRef.current.forEach((e) => {
          const opts = dirs
            .map(([dx, dy]) => ({ x: e.x + dx, y: e.y + dy }))
            .filter((c) => !isBlocked(c.x, c.y) && !enemiesRef.current.some((o) => o !== e && o.x === c.x && o.y === c.y));
          if (opts.length && Math.random() < 0.85) {
            const pick = opts[Math.floor(Math.random() * opts.length)];
            e.x = pick.x; e.y = pick.y;
          }
        });
        if (enemiesRef.current.some((e) => e.x === playerRef.current.x && e.y === playerRef.current.y)) hitPlayer();
      }
      rerender();
    }, TICK);
    return () => clearInterval(id);
  }, [screen, explode, hitPlayer, rerender]);

  // ── Keyboard ──
  useEffect(() => {
    if (screen !== "playing") return undefined;
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (["arrowup", "w"].includes(k)) { e.preventDefault(); move(0, -1); }
      else if (["arrowdown", "s"].includes(k)) { e.preventDefault(); move(0, 1); }
      else if (["arrowleft", "a"].includes(k)) { e.preventDefault(); move(-1, 0); }
      else if (["arrowright", "d"].includes(k)) { e.preventDefault(); move(1, 0); }
      else if (k === " " || k === "enter") { e.preventDefault(); placeBomb(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, move, placeBomb]);

  // ── three.js scene ──
  useEffect(() => {
    if (screen !== "playing") return undefined;
    const mount = mountRef.current;
    if (!mount) return undefined;
    const grid = gridRef.current;
    const N = NRef.current;

    const width = mount.clientWidth;
    const height = mount.clientHeight || 440;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x9fd0e8);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200);
    const center = (N - 1) / 2;
    camera.position.set(center, N * 1.0, center + N * 0.92);
    camera.lookAt(center, 0, center);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const sun = new THREE.DirectionalLight(0xffffff, 0.7);
    sun.position.set(center + 4, 12, center + 6);
    scene.add(sun);

    // floor
    const floorGeo = new THREE.PlaneGeometry(N, N);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x8bc34a });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(center, 0, center);
    scene.add(floor);

    // shared geometries / materials
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x6b7785 });
    const crateGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const crateMat = new THREE.MeshStandardMaterial({ color: 0xc0863c });
    const bombGeo = new THREE.SphereGeometry(0.3, 18, 18);
    const bombMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4 });
    const blastGeo = new THREE.SphereGeometry(0.46, 16, 16);
    const blastMat = new THREE.MeshStandardMaterial({ color: 0xff9800, emissive: 0xff5722, emissiveIntensity: 0.8, transparent: true, opacity: 0.85 });
    const starGeo = new THREE.OctahedronGeometry(0.22, 0);
    const starMat = new THREE.MeshStandardMaterial({ color: 0xffd54f, emissive: 0xffb300, emissiveIntensity: 0.6 });

    // static walls
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++)
        if (grid[y][x] === WALL) {
          const m = new THREE.Mesh(boxGeo, wallMat);
          m.position.set(x, 0.5, y);
          scene.add(m);
        }

    // player robot
    const playerGroup = new THREE.Group();
    const pBody = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.42), new THREE.MeshStandardMaterial({ color: 0x42a5f5 }));
    pBody.position.y = 0.4;
    const pHead = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.32, 0.34), new THREE.MeshStandardMaterial({ color: 0xeceff1 }));
    pHead.position.y = 0.78;
    const pEyeMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const pEyeL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.04), pEyeMat);
    pEyeL.position.set(-0.09, 0.8, 0.18);
    const pEyeR = pEyeL.clone();
    pEyeR.position.x = 0.09;
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.18), new THREE.MeshStandardMaterial({ color: 0xff5252 }));
    antenna.position.y = 1.02;
    playerGroup.add(pBody, pHead, pEyeL, pEyeR, antenna);
    playerGroup.position.set(playerRef.current.x, 0, playerRef.current.y);
    scene.add(playerGroup);

    // dynamic mesh maps
    const crateMeshes = new Map();
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++)
        if (grid[y][x] === CRATE) {
          const m = new THREE.Mesh(crateGeo, crateMat);
          m.position.set(x, 0.45, y);
          scene.add(m);
          crateMeshes.set(`${x},${y}`, m);
        }

    const enemyMeshes = new Map(); // id -> group
    const bombMeshes = new Map();  // "x,y" -> mesh
    const blastMeshes = new Map(); // "x,y" -> mesh
    const starMeshes = new Map();  // "x,y" -> mesh

    const makeEnemy = () => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.32, 18, 18), new THREE.MeshStandardMaterial({ color: 0xab47bc }));
      body.position.y = 0.4;
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const eL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), eyeMat);
      eL.position.set(-0.12, 0.46, 0.26);
      const eR = eL.clone(); eR.position.x = 0.12;
      const pupMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
      const pL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), pupMat);
      pL.position.set(-0.12, 0.46, 0.33);
      const pR = pL.clone(); pR.position.x = 0.12;
      g.add(body, eL, eR, pL, pR);
      return g;
    };

    let raf;
    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const now = Date.now();

      // crates: remove destroyed
      for (const [key, mesh] of crateMeshes) {
        const [cx, cy] = key.split(",").map(Number);
        if (grid[cy][cx] !== CRATE) {
          scene.remove(mesh);
          crateMeshes.delete(key);
        }
      }

      // bombs reconcile
      const bombKeys = new Set(bombsRef.current.map((b) => `${b.x},${b.y}`));
      for (const [key, mesh] of bombMeshes)
        if (!bombKeys.has(key)) { scene.remove(mesh); bombMeshes.delete(key); }
      bombsRef.current.forEach((b) => {
        const key = `${b.x},${b.y}`;
        let m = bombMeshes.get(key);
        if (!m) {
          m = new THREE.Mesh(bombGeo, bombMat);
          m.position.set(b.x, 0.32, b.y);
          scene.add(m);
          bombMeshes.set(key, m);
        }
        const s = 1 + Math.sin(now * 0.012) * 0.12;
        m.scale.set(s, s, s);
      });

      // blasts reconcile
      const blastKeys = new Set(blastsRef.current.map((b) => `${b.x},${b.y}`));
      for (const [key, mesh] of blastMeshes)
        if (!blastKeys.has(key)) { scene.remove(mesh); blastMeshes.delete(key); }
      blastsRef.current.forEach((b) => {
        const key = `${b.x},${b.y}`;
        let m = blastMeshes.get(key);
        if (!m) {
          m = new THREE.Mesh(blastGeo, blastMat);
          m.position.set(b.x, 0.45, b.y);
          scene.add(m);
          blastMeshes.set(key, m);
        }
        const s = 0.7 + (b.life / BLAST_LIFE) * 0.6;
        m.scale.set(s, s, s);
      });

      // stars reconcile
      const starKeys = new Set(starsRef.current.map((s) => `${s.x},${s.y}`));
      for (const [key, mesh] of starMeshes)
        if (!starKeys.has(key)) { scene.remove(mesh); starMeshes.delete(key); }
      starsRef.current.forEach((s) => {
        const key = `${s.x},${s.y}`;
        let m = starMeshes.get(key);
        if (!m) {
          m = new THREE.Mesh(starGeo, starMat);
          m.position.set(s.x, 0.4, s.y);
          scene.add(m);
          starMeshes.set(key, m);
        }
        m.rotation.y += 0.05;
        m.position.y = 0.4 + Math.sin(now * 0.005) * 0.05;
      });

      // enemies reconcile + lerp
      const enemyIds = new Set(enemiesRef.current.map((e) => e.id));
      for (const [id, mesh] of enemyMeshes)
        if (!enemyIds.has(id)) { scene.remove(mesh); enemyMeshes.delete(id); }
      enemiesRef.current.forEach((e) => {
        let m = enemyMeshes.get(e.id);
        if (!m) {
          m = makeEnemy();
          m.position.set(e.x, 0, e.y);
          scene.add(m);
          enemyMeshes.set(e.id, m);
        }
        m.position.x = lerp(m.position.x, e.x, 0.25);
        m.position.z = lerp(m.position.z, e.y, 0.25);
        m.position.y = Math.abs(Math.sin(now * 0.006 + e.id)) * 0.08;
      });

      // player lerp + invuln blink
      playerGroup.position.x = lerp(playerGroup.position.x, playerRef.current.x, 0.3);
      playerGroup.position.z = lerp(playerGroup.position.z, playerRef.current.y, 0.3);
      playerGroup.visible = invulnRef.current > 0 ? Math.floor(now / 120) % 2 === 0 : true;

      renderer.render(scene, camera);
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
      floorGeo.dispose(); floorMat.dispose();
      boxGeo.dispose(); wallMat.dispose();
      crateGeo.dispose(); crateMat.dispose();
      bombGeo.dispose(); bombMat.dispose();
      blastGeo.dispose(); blastMat.dispose();
      starGeo.dispose(); starMat.dispose();
      if (renderer.domElement && renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [screen, sceneKey]);

  // ── INTRO ──
  if (screen === "intro") {
    return (
      <div className={styles.introWrapper}>
        <div className={styles.introCard}>
          <div className={styles.introEmoji}>💣🤖</div>
          <h1>{t("Si Bom Pintar 3D", "Smart Bomber 3D")}</h1>
          <p className={styles.introDesc}>
            {t("Letakkan bom untuk menghancurkan peti dan kalahkan semua monster!",
               "Drop bombs to smash crates and defeat all the monsters!")}
          </p>
          <div className={styles.levelGrid}>
            {LEVELS.map((lv, i) => (
              <button key={lv.id} className={`${styles.levelCard} ${styles[`tier${lv.id}`]}`} onClick={() => { setLevelIdx(i); start(i); }}>
                <div className={styles.tierBadge}>Level {lv.id}</div>
                <div className={styles.lvlName}>{lv.name[language] ?? lv.name.id}</div>
                <div className={styles.lvlDetail}>{lv.size}×{lv.size} · 👾 {lv.enemies}</div>
              </button>
            ))}
          </div>
          <p className={styles.controlHint}>
            {t("Panah/WASD untuk gerak, SPASI untuk bom. Di HP pakai tombol di layar (💣 di tengah).",
               "Arrows/WASD to move, SPACE for bomb. On mobile use the on-screen pad (💣 in the center).")}
          </p>
        </div>
      </div>
    );
  }

  // ── WIN / LOSE ──
  if (screen === "win" || screen === "lose") {
    const won = screen === "win";
    return (
      <div className={styles.introWrapper}>
        <div className={styles.introCard}>
          <div className={styles.introEmoji}>{won ? "🏆🎉" : "💥😵"}</div>
          <h1>{won ? t("Menang!", "You Win!") : t("Kalah!", "Game Over!")}</h1>
          <p className={styles.introDesc}>
            {won ? t("Semua monster kalah! Skor: ", "All monsters defeated! Score: ")
                 : t("Coba lagi ya! Skor: ", "Try again! Score: ")}
            <strong>{scoreRef.current}</strong>
          </p>
          <div className={styles.endButtons}>
            <button className={styles.btnPrimary} onClick={() => start(levelIdx)}>
              🔄 {t("Main Lagi", "Play Again")}
            </button>
            {won && (
              <button className={styles.btnSecondary} onClick={() => { const n = (levelIdx + 1) % LEVELS.length; setLevelIdx(n); start(n); }}>
                ➡️ {t("Level Berikutnya", "Next Level")}
              </button>
            )}
            <button className={styles.btnGhost} onClick={() => setScreen("intro")}>
              🏠 {t("Menu", "Menu")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING ──
  return (
    <div className={styles.gameWrapper}>
      <div className={styles.topBar}>
        <div className={styles.pill}>❤️ {livesRef.current}</div>
        <div className={styles.pill}>⭐ {scoreRef.current}</div>
        <div className={styles.pill}>👾 {enemiesRef.current.length}</div>
        <div className={styles.pillTier}>{t("Tingkat", "Level")}: {cfg.name[language] ?? cfg.name.id}</div>
        <button className={styles.menuPill} onClick={() => setScreen("intro")}>← {t("Menu", "Menu")}</button>
      </div>

      <div className={styles.viewport} ref={mountRef} />

      {/* D-pad with bomb in the center */}
      <DPad
        onUp={() => move(0, -1)}
        onDown={() => move(0, 1)}
        onLeft={() => move(-1, 0)}
        onRight={() => move(1, 0)}
        onCenter={placeBomb}
        centerLabel="💣"
      />
    </div>
  );
}
