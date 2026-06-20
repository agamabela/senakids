"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./MenyabungPipaGameClient.module.css";

// Pipe types — connections: [top, right, bottom, left]
const PIPE_TYPES = {
  straight:   { connections: [true,  false, true,  false] },
  straight_h: { connections: [false, true,  false, true]  },
  corner_dr:  { connections: [false, true,  true,  false] },
  corner_dl:  { connections: [false, false, true,  true]  },
  corner_ur:  { connections: [true,  true,  false, false] },
  corner_ul:  { connections: [true,  false, false, true]  },
  cap_up:     { connections: [true,  false, false, false] },
  cap_right:  { connections: [false, true,  false, false] },
  cap_down:   { connections: [false, false, true,  false] },
  cap_left:   { connections: [false, false, false, true]  },
};

const PIPE_W = 10; // tube half-width on each side of center
const C = 20;      // center
const E = 40;      // edge

function PipeSVG({ type, rotation, flowing, isComplete }) {
  const [top, right, bottom, left] =
    PIPE_TYPES[type]?.connections ?? [false, false, false, false];

  const tubeColor  = flowing ? (isComplete ? "#22d3ee" : "#38bdf8") : "#334155";
  const innerColor = flowing ? (isComplete ? "#67e8f9" : "#7dd3fc") : "#1e293b";
  const capColor   = flowing ? (isComplete ? "#06b6d4" : "#0ea5e9") : "#475569";

  const deg = rotation * 90;
  const paths = [];

  if (top)    paths.push(`M${C - PIPE_W/2},0 L${C + PIPE_W/2},0 L${C + PIPE_W/2},${C} L${C - PIPE_W/2},${C} Z`);
  if (bottom) paths.push(`M${C - PIPE_W/2},${C} L${C + PIPE_W/2},${C} L${C + PIPE_W/2},${E} L${C - PIPE_W/2},${E} Z`);
  if (right)  paths.push(`M${C},${C - PIPE_W/2} L${E},${C - PIPE_W/2} L${E},${C + PIPE_W/2} L${C},${C + PIPE_W/2} Z`);
  if (left)   paths.push(`M0,${C - PIPE_W/2} L${C},${C - PIPE_W/2} L${C},${C + PIPE_W/2} L0,${C + PIPE_W/2} Z`);

  const connCount = [top, right, bottom, left].filter(Boolean).length;

  return (
    <svg
      viewBox="0 0 40 40"
      className={styles.pipeSvg}
      style={{ transform: `rotate(${deg}deg)` }}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} fill={tubeColor} />
      ))}
      {connCount >= 1 && (
        <rect x={C - PIPE_W/2} y={C - PIPE_W/2} width={PIPE_W} height={PIPE_W} fill={tubeColor} />
      )}
      {top    && <rect x={C - PIPE_W/4} y={0}  width={PIPE_W/2} height={C}  fill={innerColor} />}
      {bottom && <rect x={C - PIPE_W/4} y={C}  width={PIPE_W/2} height={C}  fill={innerColor} />}
      {right  && <rect x={C} y={C - PIPE_W/4} width={C}  height={PIPE_W/2} fill={innerColor} />}
      {left   && <rect x={0} y={C - PIPE_W/4} width={C}  height={PIPE_W/2} fill={innerColor} />}
      {connCount >= 1 && (
        <rect x={C - PIPE_W/4} y={C - PIPE_W/4} width={PIPE_W/2} height={PIPE_W/2} fill={innerColor} />
      )}
      {connCount === 1 && (
        <circle
          cx={top ? C : right ? E - 2 : bottom ? C : 2}
          cy={top ? 2 : right ? C : bottom ? E - 2 : C}
          r={4} fill={capColor}
        />
      )}
    </svg>
  );
}

// directions index [top=0, right=1, bottom=2, left=3]
const DELTAS = [
  { dy: -1, dx: 0 },  // top
  { dy: 0,  dx: 1 },  // right
  { dy: 1,  dx: 0 },  // bottom
  { dy: 0,  dx: -1 }, // left
];
const DIR_NAME = ["up", "right", "down", "left"];

function rotateConnections(connections, rotation) {
  const r = [...connections];
  for (let i = 0; i < ((rotation % 4) + 4) % 4; i++) r.unshift(r.pop());
  return r;
}

function getPipeConnections(pipe) {
  if (!pipe) return [false, false, false, false];
  const base = PIPE_TYPES[pipe.type]?.connections ?? [false, false, false, false];
  return rotateConnections(base, pipe.rotation);
}

// Pick the pipe type whose base connections match the given direction set.
function typeForDirs(dirs) {
  const s = new Set(dirs);
  const has = (d) => s.has(d);
  if (s.size === 1) {
    if (has(0)) return "cap_up";
    if (has(1)) return "cap_right";
    if (has(2)) return "cap_down";
    return "cap_left";
  }
  if (has(0) && has(2)) return "straight";
  if (has(1) && has(3)) return "straight_h";
  if (has(0) && has(1)) return "corner_ur";
  if (has(0) && has(3)) return "corner_ul";
  if (has(2) && has(1)) return "corner_dr";
  return "corner_dl"; // bottom + left
}

// Randomized DFS to find a self-avoiding path from start to target.
function findPath(size, start, target) {
  const visited = Array.from({ length: size }, () => Array(size).fill(false));
  const path = [];

  function dfs(x, y) {
    visited[y][x] = true;
    path.push({ x, y });
    if (x === target.x && y === target.y) return true;

    const order = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
    for (const d of order) {
      const nx = x + DELTAS[d].dx;
      const ny = y + DELTAS[d].dy;
      if (nx < 0 || nx >= size || ny < 0 || ny >= size) continue;
      if (visited[ny][nx]) continue;
      if (dfs(nx, ny)) return true;
    }
    path.pop();
    return false;
  }

  dfs(start.x, start.y);
  return path;
}

// Direction index from cell a to adjacent cell b.
function dirBetween(a, b) {
  if (b.y === a.y - 1) return 0; // up
  if (b.x === a.x + 1) return 1; // right
  if (b.y === a.y + 1) return 2; // down
  return 3;                      // left
}

function checkFlow(grid, start, end) {
  const visited = new Set();
  const path = [];
  const size = grid.length;
  const dirIndex = { right: 1, left: 3, up: 0, down: 2 };

  let cur = { x: start.x, y: start.y };
  let fromDir = dirIndex[start.dir] ?? 1;

  while (true) {
    const key = `${cur.x},${cur.y}`;
    if (visited.has(key)) break;
    if (cur.x < 0 || cur.x >= size || cur.y < 0 || cur.y >= size) break;
    visited.add(key);
    path.push({ ...cur });
    if (cur.x === end.x && cur.y === end.y) return { success: true, path };
    const pipe = grid[cur.y]?.[cur.x];
    if (!pipe) break;
    const conns = getPipeConnections(pipe);
    let moved = false;
    for (let d = 0; d < 4; d++) {
      if (d === (fromDir + 2) % 4) continue;
      if (!conns[d]) continue;
      const nx = cur.x + DELTAS[d].dx;
      const ny = cur.y + DELTAS[d].dy;
      if (nx < 0 || nx >= size || ny < 0 || ny >= size) continue;
      const neighbor = grid[ny]?.[nx];
      if (!neighbor) continue;
      const neighborConns = getPipeConnections(neighbor);
      if (neighborConns[(d + 2) % 4]) {
        cur = { x: nx, y: ny };
        fromDir = d;
        moved = true;
        break;
      }
    }
    if (!moved) break;
  }
  return { success: false, path };
}

const DECOY_TYPES = ["straight", "corner_dr"];

// Build a random, always-solvable puzzle.
function generatePuzzle(size, withDecoys) {
  const start = { x: 0, y: 0 };
  const target = { x: size - 1, y: size - 1 };
  const path = findPath(size, start, target);

  // empty grid
  const grid = Array.from({ length: size }, () => Array(size).fill(null));
  const onPath = new Set(path.map((p) => `${p.x},${p.y}`));

  // place correctly-shaped (but scrambled-rotation) pipes along the path
  for (let i = 0; i < path.length; i++) {
    const cell = path[i];
    const dirs = [];
    if (i > 0) dirs.push(dirBetween(cell, path[i - 1]));
    if (i < path.length - 1) dirs.push(dirBetween(cell, path[i + 1]));
    const type = typeForDirs(dirs);
    grid[cell.y][cell.x] = { type, rotation: Math.floor(Math.random() * 4), locked: false };
  }

  // optional decoys on non-path cells
  if (withDecoys) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (onPath.has(`${x},${y}`)) continue;
        if (Math.random() < 0.65) {
          const type = DECOY_TYPES[Math.floor(Math.random() * DECOY_TYPES.length)];
          grid[y][x] = { type, rotation: Math.floor(Math.random() * 4), locked: false };
        }
      }
    }
  }

  const startDir = DIR_NAME[dirBetween(path[0], path[1] || { x: 1, y: 0 })];

  // make sure it doesn't start already solved (give the kid something to do)
  const initial = checkFlow(grid, { ...start, dir: startDir }, target);
  if (initial.success && path.length > 1) {
    const mid = path[Math.floor(path.length / 2)];
    grid[mid.y][mid.x].rotation = (grid[mid.y][mid.x].rotation + 1) % 4;
  }

  return { grid, start: { ...start, dir: startDir }, end: target, size };
}

const LEVELS = [
  { id: 1, name: { id: "Mudah", en: "Easy" },     size: 4, decoys: false },
  { id: 2, name: { id: "Menengah", en: "Medium" }, size: 5, decoys: true  },
  { id: 3, name: { id: "Sulit", en: "Hard" },      size: 6, decoys: true  },
];

const flowSet = (path) => new Set(path.map((p) => `${p.x},${p.y}`));

export default function MenyabungPipaGameClient() {
  const { language } = useLanguage();
  const [levelIdx, setLevelIdx]     = useState(0);
  const [puzzle, setPuzzle]         = useState(() => generatePuzzle(LEVELS[0].size, LEVELS[0].decoys));
  const [grid, setGrid]             = useState(puzzle.grid);
  const [flowPath, setFlowPath]     = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [moves, setMoves]           = useState(0);
  const [showIntro, setShowIntro]   = useState(true);

  const flowing = flowSet(flowPath);

  const newPuzzle = useCallback((idx) => {
    const lvl = LEVELS[idx];
    const p = generatePuzzle(lvl.size, lvl.decoys);
    setPuzzle(p);
    setGrid(p.grid);
    setFlowPath([]);
    setIsComplete(false);
    setMoves(0);
  }, []);

  useEffect(() => {
    newPuzzle(levelIdx);
  }, [levelIdx, newPuzzle]);

  const rotatePipe = useCallback((y, x) => {
    setGrid((prev) => {
      if (!prev[y][x] || prev[y][x].locked) return prev;
      const next = prev.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
      next[y][x].rotation = (next[y][x].rotation + 1) % 4;
      const result = checkFlow(next, puzzle.start, puzzle.end);
      setFlowPath(result.path);
      setIsComplete(result.success);
      return next;
    });
    setMoves((m) => m + 1);
  }, [puzzle]);

  if (showIntro) {
    return (
      <div className={styles.introWrapper}>
        <div className={styles.introCard}>
          <div className={styles.pipeArt}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={styles.pipeSegment} style={{ animationDelay: `${i * 0.2}s` }}>
                <div className={styles.waterDrop} />
              </div>
            ))}
          </div>
          <h1>🔧 Menyambung Pipa</h1>
          <p>
            {language === "id"
              ? "Putar pipa agar air mengalir dari awal hingga akhir!"
              : "Rotate the pipes so water flows from start to end!"}
          </p>
          <div className={styles.instructions}>
            <div className={styles.step}>
              <span className={styles.stepNum}>1</span>
              <span>{language === "id" ? "Ketuk pipa untuk memutar" : "Tap a pipe to rotate it"}</span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>2</span>
              <span>{language === "id" ? "Buat jalur dari 🟢 ke 🔴" : "Make a path from 🟢 to 🔴"}</span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>3</span>
              <span>{language === "id" ? "Setiap permainan selalu baru!" : "Every game is brand new!"}</span>
            </div>
          </div>
          <button className={styles.startButton} onClick={() => setShowIntro(false)}>
            {language === "id" ? "Mulai! 🎮" : "Start! 🎮"}
          </button>
        </div>
      </div>
    );
  }

  const levelData = LEVELS[levelIdx];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>🔧 Menyambung Pipa</h1>
          <p>
            {language === "id" ? "Level" : "Level"} {levelIdx + 1}:{" "}
            {levelData.name[language] ?? levelData.name.id}
          </p>
        </div>
        <div className={styles.levelNav}>
          {LEVELS.map((lvl, i) => (
            <button
              key={i}
              onClick={() => setLevelIdx(i)}
              className={`${styles.levelBtn} ${levelIdx === i ? styles.activeLevel : ""}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.stats}>
        <span>{language === "id" ? "Gerakan" : "Moves"}: {moves}</span>
        <span className={`${styles.status} ${isComplete ? styles.success : ""}`}>
          {isComplete
            ? (language === "id" ? "✅ Tersambung!" : "✅ Connected!")
            : (language === "id" ? "Putar pipa..." : "Rotate the pipes...")}
        </span>
      </div>

      <div className={`${styles.gameArea} ${isComplete ? styles.gameAreaComplete : ""}`}>
        <div
          className={styles.grid}
          style={{ "--cols": puzzle.size }}
        >
          {grid.map((row, y) => (
            <div key={y} className={styles.row}>
              {row.map((pipe, x) => {
                const isStart  = x === puzzle.start.x && y === puzzle.start.y;
                const isEnd    = x === puzzle.end.x   && y === puzzle.end.y;
                const isFlowing = flowing.has(`${x},${y}`);

                if (!pipe) {
                  return <div key={`${y}-${x}`} className={styles.emptyCell} />;
                }

                return (
                  <button
                    key={`${y}-${x}`}
                    type="button"
                    className={[
                      styles.cell,
                      isFlowing  ? styles.flowing   : "",
                      isComplete ? styles.complete  : "",
                      isStart    ? styles.startCell : "",
                      isEnd      ? styles.endCell   : "",
                    ].filter(Boolean).join(" ")}
                    onClick={() => rotatePipe(y, x)}
                    aria-label={`Pipe ${x},${y}`}
                  >
                    <PipeSVG
                      type={pipe.type}
                      rotation={pipe.rotation}
                      flowing={isFlowing}
                      isComplete={isComplete}
                    />
                    {isStart && <span className={styles.marker}>🟢</span>}
                    {isEnd   && <span className={styles.marker}>🔴</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.controls}>
        <button className={styles.btn} onClick={() => newPuzzle(levelIdx)}>
          🎲 {language === "id" ? "Acak Baru" : "New Puzzle"}
        </button>
        {isComplete && (
          <button
            className={`${styles.btn} ${styles.nextBtn}`}
            onClick={() => {
              const nextIdx = (levelIdx + 1) % LEVELS.length;
              if (nextIdx === levelIdx) newPuzzle(levelIdx);
              else setLevelIdx(nextIdx);
            }}
          >
            ➡️ {language === "id" ? "Lanjut" : "Next"}
          </button>
        )}
      </div>

      <div className={styles.hint}>
        {language === "id"
          ? "💡 Ketuk pipa untuk memutarnya — sambungkan 🟢 ke 🔴"
          : "💡 Tap a pipe to rotate it — connect 🟢 to 🔴"}
      </div>
    </div>
  );
}
