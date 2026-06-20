"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./Labirin3DGameClient.module.css";

const LEVELS = [
  { id: 1, name: { id: "Mudah", en: "Easy" }, size: 7 },
  { id: 2, name: { id: "Sedang", en: "Medium" }, size: 11 },
  { id: 3, name: { id: "Sulit", en: "Hard" }, size: 15 },
];

// Recursive-backtracker maze on an odd grid. true = wall, false = open.
function generateMaze(size) {
  const grid = Array.from({ length: size }, () => Array(size).fill(true));
  const stack = [{ x: 1, y: 1 }];
  grid[1][1] = false;
  const dirs = [
    { dx: 0, dy: -2 },
    { dx: 2, dy: 0 },
    { dx: 0, dy: 2 },
    { dx: -2, dy: 0 },
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

export default function Labirin3DGameClient() {
  const { language } = useLanguage();
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  const mountRef = useRef(null);
  const sceneRef = useRef(null);

  const [levelIdx, setLevelIdx] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [won, setWon] = useState(false);
  const [steps, setSteps] = useState(0);
  const [sessionKey, setSessionKey] = useState(0);

  const t = (id, en) => (language === "id" ? id : en);

  // Logical player state kept in refs so the animation loop can read them
  const playerRef = useRef({ cx: 1, cy: 1, dir: 1, targetYaw: -Math.PI / 2 });
  const gridRef = useRef(null);
  const goalRef = useRef({ x: 1, y: 1 });
  const wonRef = useRef(false);

  const isWall = useCallback((x, y) => {
    const g = gridRef.current;
    if (!g) return true;
    if (x < 0 || y < 0 || x >= g.length || y >= g[0].length) return true;
    return g[y][x];
  }, []);

  const moveForward = useCallback((back = false) => {
    if (wonRef.current) return;
    const p = playerRef.current;
    const vec = [
      { dx: 0, dy: -1 }, // N
      { dx: 1, dy: 0 },  // E
      { dx: 0, dy: 1 },  // S
      { dx: -1, dy: 0 }, // W
    ][p.dir];
    const sign = back ? -1 : 1;
    const nx = p.cx + vec.dx * sign;
    const ny = p.cy + vec.dy * sign;
    if (!isWall(nx, ny)) {
      p.cx = nx;
      p.cy = ny;
      setSteps((s) => s + 1);
      setHasChanges(true);
      if (nx === goalRef.current.x && ny === goalRef.current.y) {
        wonRef.current = true;
        setWon(true);
      }
    }
  }, [isWall, setHasChanges]);

  const turn = useCallback((left) => {
    const p = playerRef.current;
    if (left) {
      p.dir = (p.dir + 3) % 4;
      p.targetYaw += Math.PI / 2;
    } else {
      p.dir = (p.dir + 1) % 4;
      p.targetYaw -= Math.PI / 2;
    }
  }, []);

  // Build / rebuild the three.js scene
  useEffect(() => {
    if (showIntro) return;
    const mount = mountRef.current;
    if (!mount) return;

    const size = LEVELS[levelIdx].size;
    const grid = generateMaze(size);
    gridRef.current = grid;
    goalRef.current = { x: size - 2, y: size - 2 };
    playerRef.current = { cx: 1, cy: 1, dir: 1, targetYaw: -Math.PI / 2 };
    wonRef.current = false;
    setWon(false);
    setSteps(0);

    const width = mount.clientWidth;
    const height = mount.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 2.5, 8.5);

    const camera = new THREE.PerspectiveCamera(72, width / height, 0.1, 100);
    camera.position.set(1, 0.55, 1);
    camera.rotation.order = "YXZ";
    camera.rotation.y = -Math.PI / 2;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(3, 8, 2);
    scene.add(dir);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(size, size);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x9ccc65 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(size / 2 - 0.5, 0, size / 2 - 0.5);
    scene.add(floor);

    // Walls (shared geo/mat, individual meshes)
    const wallGeo = new THREE.BoxGeometry(1, 1, 1);
    const wallMats = [
      new THREE.MeshStandardMaterial({ color: 0xb98a5a }),
      new THREE.MeshStandardMaterial({ color: 0xc89b6a }),
    ];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (grid[y][x]) {
          const m = new THREE.Mesh(wallGeo, wallMats[(x + y) % 2]);
          m.position.set(x, 0.5, y);
          scene.add(m);
        }
      }
    }

    // Goal: glowing cheese (yellow) that spins
    const goalGroup = new THREE.Group();
    const cheeseGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.28, 16, 1, false, 0, Math.PI / 1.4);
    const cheeseMat = new THREE.MeshStandardMaterial({
      color: 0xffd24a,
      emissive: 0xffa500,
      emissiveIntensity: 0.5,
    });
    const cheese = new THREE.Mesh(cheeseGeo, cheeseMat);
    cheese.position.y = 0.45;
    goalGroup.add(cheese);
    const goalLight = new THREE.PointLight(0xffcc33, 1.1, 4);
    goalLight.position.set(0, 0.7, 0);
    goalGroup.add(goalLight);
    goalGroup.position.set(goalRef.current.x, 0, goalRef.current.y);
    scene.add(goalGroup);

    sceneRef.current = { scene, camera, renderer, goalGroup, mount, wallGeo, wallMats, floorGeo, floorMat, cheeseGeo, cheeseMat };

    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const p = playerRef.current;
      // smooth move + turn
      camera.position.x += (p.cx - camera.position.x) * 0.18;
      camera.position.z += (p.cy - camera.position.z) * 0.18;
      camera.rotation.y += (p.targetYaw - camera.rotation.y) * 0.18;
      goalGroup.rotation.y += 0.03;
      cheese.position.y = 0.45 + Math.sin(Date.now() * 0.004) * 0.06;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight || 420;
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
      cheeseGeo.dispose();
      cheeseMat.dispose();
      if (renderer.domElement && renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [showIntro, levelIdx, sessionKey]);

  // Keyboard controls
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

  const newMaze = () => {
    wonRef.current = false;
    setSessionKey((k) => k + 1);
  };

  const nextLevel = () => {
    setLevelIdx((i) => (i + 1) % LEVELS.length);
    setSessionKey((k) => k + 1);
  };

  if (showIntro) {
    return (
      <div className={styles.introWrapper}>
        <div className={styles.introCard}>
          <div className={styles.introEmoji}>🧀🐭</div>
          <h1>{t("🌀 Labirin 3D", "🌀 3D Maze")}</h1>
          <p>{t("Jelajahi labirin dari sudut pandang orang pertama dan temukan kejunya!", "Explore the maze in first-person and find the cheese!")}</p>
          <div className={styles.instructions}>
            <div className={styles.step}><span className={styles.stepNum}>1</span><span>{t("Maju, mundur, dan belok dengan tombol panah", "Move and turn with the arrow buttons")}</span></div>
            <div className={styles.step}><span className={styles.stepNum}>2</span><span>{t("Cari keju 🧀 yang bersinar", "Find the glowing cheese 🧀")}</span></div>
            <div className={styles.step}><span className={styles.stepNum}>3</span><span>{t("Labirin selalu acak setiap bermain!", "Mazes are random every time!")}</span></div>
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
        <span>🧀 {t("Temukan keju!", "Find the cheese!")}</span>
      </div>

      <div className={styles.viewport} ref={mountRef}>
        {won && (
          <div className={styles.winOverlay}>
            <div className={styles.winCard}>
              <div className={styles.winEmoji}>🎉🧀</div>
              <h2>{t("Hebat! Kamu menemukan keju!", "Yay! You found the cheese!")}</h2>
              <p>{t("Langkah", "Steps")}: {steps}</p>
              <div className={styles.winButtons}>
                <button className={styles.btn} onClick={newMaze}>🎲 {t("Labirin Baru", "New Maze")}</button>
                <button className={`${styles.btn} ${styles.nextBtn}`} onClick={nextLevel}>➡️ {t("Lanjut", "Next")}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* On-screen controls */}
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
        {t("💡 ▲ maju, ▼ mundur, ↺ ↻ belok. Bisa juga pakai tombol panah / WASD!",
           "💡 ▲ forward, ▼ back, ↺ ↻ turn. Arrow keys / WASD also work!")}
      </div>
    </div>
  );
}
