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
  t_up:       { connections: [true,  true,  false, true]  },
  t_down:     { connections: [false, true,  true,  true]  },
  t_left:     { connections: [true,  true,  true,  false] },
  t_right:    { connections: [true,  false, true,  true]  },
  cross:      { connections: [true,  true,  true,  true]  },
  cap_up:     { connections: [true,  false, false, false] },
  cap_right:  { connections: [false, true,  false, false] },
  cap_down:   { connections: [false, false, true,  false] },
  cap_left:   { connections: [false, false, false, true]  },
};

// SVG pipe shapes — drawn in a 40×40 viewBox, centered at 20,20
// Pipe tube is 10px wide (from 15 to 25)
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

  // Build path segments that fill the tube
  const paths = [];

  if (top)    paths.push(`M${C - PIPE_W/2},0 L${C + PIPE_W/2},0 L${C + PIPE_W/2},${C} L${C - PIPE_W/2},${C} Z`);
  if (bottom) paths.push(`M${C - PIPE_W/2},${C} L${C + PIPE_W/2},${C} L${C + PIPE_W/2},${E} L${C - PIPE_W/2},${E} Z`);
  if (right)  paths.push(`M${C},${C - PIPE_W/2} L${E},${C - PIPE_W/2} L${E},${C + PIPE_W/2} L${C},${C + PIPE_W/2} Z`);
  if (left)   paths.push(`M0,${C - PIPE_W/2} L${C},${C - PIPE_W/2} L${C},${C + PIPE_W/2} L0,${C + PIPE_W/2} Z`);

  // Center square to fill junction
  const connCount = [top, right, bottom, left].filter(Boolean).length;

  return (
    <svg
      viewBox="0 0 40 40"
      className={styles.pipeSvg}
      style={{ transform: `rotate(${deg}deg)` }}
    >
      {/* Outer tube fill */}
      {paths.map((d, i) => (
        <path key={i} d={d} fill={tubeColor} />
      ))}
      {/* Center junction */}
      {connCount >= 1 && (
        <rect
          x={C - PIPE_W/2} y={C - PIPE_W/2}
          width={PIPE_W} height={PIPE_W}
          fill={tubeColor}
        />
      )}
      {/* Inner highlight (thinner stripe) */}
      {top    && <rect x={C - PIPE_W/4} y={0}  width={PIPE_W/2} height={C}  fill={innerColor} />}
      {bottom && <rect x={C - PIPE_W/4} y={C}  width={PIPE_W/2} height={C}  fill={innerColor} />}
      {right  && <rect x={C} y={C - PIPE_W/4} width={C}  height={PIPE_W/2} fill={innerColor} />}
      {left   && <rect x={0} y={C - PIPE_W/4} width={C}  height={PIPE_W/2} fill={innerColor} />}
      {connCount >= 1 && (
        <rect
          x={C - PIPE_W/4} y={C - PIPE_W/4}
          width={PIPE_W/2} height={PIPE_W/2}
          fill={innerColor}
        />
      )}
      {/* End caps (rounded dot at open ends to show terminus) */}
      {connCount === 1 && (
        <circle cx={
          top ? C : right ? E - 2 : bottom ? C : 2
        } cy={
          top ? 2 : right ? C : bottom ? E - 2 : C
        } r={4} fill={capColor} />
      )}
    </svg>
  );
}

const LEVELS = [
  {
    id: 1,
    name: { id: "Mudah", en: "Easy" },
    start: { x: 0, y: 0, dir: "right" },
    end:   { x: 5, y: 5 },
    pipes: [
      [{ type: "cap_right" }, { type: "straight_h" }, { type: "corner_dl" }, { type: "straight"   }, { type: "cap_down"  }, { type: "cap_up"    }],
      [{ type: "cap_up"    }, { type: "corner_ur"  }, { type: "straight_h" }, { type: "corner_dl" }, { type: "straight"  }, { type: "corner_ul" }],
      [{ type: "corner_dr" }, { type: "straight_h" }, { type: "corner_dl"  }, { type: "straight"  }, { type: "corner_ur" }, { type: "straight_h"}],
      [{ type: "straight"  }, { type: "corner_ur"  }, { type: "straight_h" }, { type: "corner_dl" }, { type: "straight"  }, { type: "corner_ul" }],
      [{ type: "corner_dr" }, { type: "straight_h" }, { type: "corner_dl"  }, { type: "straight"  }, { type: "corner_ur" }, { type: "straight_h"}],
      [{ type: "cap_right" }, { type: "straight_h" }, { type: "corner_ur"  }, { type: "straight_h"}, { type: "corner_dl" }, { type: "cap_left"  }],
    ],
    fixed: [
      [true,  false, false, false, false, false],
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
      [false, false, false, false, false, true ],
    ],
  },
  {
    id: 2,
    name: { id: "Menengah", en: "Medium" },
    start: { x: 0, y: 2, dir: "right" },
    end:   { x: 5, y: 2 },
    pipes: [
      [{ type: "cap_down"  }, { type: "t_down"    }, { type: "straight_h" }, { type: "corner_dl" }, { type: "straight"  }, { type: "cap_down"  }],
      [{ type: "corner_dr" }, { type: "straight"  }, { type: "corner_dl"  }, { type: "straight"  }, { type: "corner_ur" }, { type: "straight"  }],
      [{ type: "cap_right" }, { type: "straight_h"}, { type: "straight_h" }, { type: "corner_ul" }, { type: "straight"  }, { type: "corner_ul" }],
      [{ type: "corner_dr" }, { type: "corner_ur" }, { type: "straight"   }, { type: "corner_dl" }, { type: "corner_ur" }, { type: "straight"  }],
      [{ type: "straight"  }, { type: "corner_ur" }, { type: "straight_h" }, { type: "straight_h"}, { type: "corner_dl" }, { type: "corner_ul" }],
      [{ type: "cap_up"    }, { type: "t_up"      }, { type: "straight_h" }, { type: "corner_dl" }, { type: "straight"  }, { type: "cap_up"    }],
    ],
    fixed: [
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
      [true,  false, false, false, false, false],
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
    ],
  },
  {
    id: 3,
    name: { id: "Sulit", en: "Hard" },
    start: { x: 0, y: 0, dir: "right" },
    end:   { x: 5, y: 5 },
    pipes: [
      [{ type: "cap_right" }, { type: "t_down"    }, { type: "straight_h" }, { type: "corner_dl" }, { type: "straight"  }, { type: "corner_ul" }],
      [{ type: "corner_dr" }, { type: "straight"  }, { type: "corner_dl"  }, { type: "straight"  }, { type: "corner_ur" }, { type: "straight"  }],
      [{ type: "straight_h"}, { type: "corner_ur" }, { type: "straight"   }, { type: "corner_dl" }, { type: "straight"  }, { type: "corner_ur" }],
      [{ type: "corner_dl" }, { type: "straight"  }, { type: "corner_ur"  }, { type: "straight_h"}, { type: "corner_dl" }, { type: "straight"  }],
      [{ type: "straight"  }, { type: "corner_ur" }, { type: "straight_h" }, { type: "corner_ul" }, { type: "straight"  }, { type: "corner_ur" }],
      [{ type: "corner_dr" }, { type: "straight_h"}, { type: "straight_h" }, { type: "straight_h"}, { type: "corner_dl" }, { type: "cap_left"  }],
    ],
    fixed: [
      [true,  false, false, false, false, false],
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
      [false, false, false, false, false, true ],
    ],
  },
];

function rotateConnections(connections, rotation) {
  const r = [...connections];
  for (let i = 0; i < rotation % 4; i++) r.unshift(r.pop());
  return r;
}

function getPipeConnections(pipe) {
  const base = PIPE_TYPES[pipe.type]?.connections ?? [false, false, false, false];
  return rotateConnections(base, pipe.rotation);
}

function checkFlow(grid, start, end) {
  const visited = new Set();
  const path = [];
  const size = grid.length;
  const dirIndex = { right: 1, left: 3, up: 0, down: 2 };
  const deltas = [
    { dy: -1, dx: 0 },
    { dy: 0,  dx: 1 },
    { dy: 1,  dx: 0 },
    { dy: 0,  dx: -1 },
  ];

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
      const nx = cur.x + deltas[d].dx;
      const ny = cur.y + deltas[d].dy;
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

function buildGrid(levelData) {
  return levelData.pipes.map((row, y) =>
    row.map((cell, x) => ({
      type: cell.type,
      rotation: 0,
      locked: levelData.fixed[y]?.[x] ?? false,
    }))
  );
}

const flowSet = (path) => new Set(path.map(p => `${p.x},${p.y}`));

export default function MenyabungPipaGameClient() {
  const { language } = useLanguage();
  const [levelIdx, setLevelIdx]     = useState(0);
  const [grid, setGrid]             = useState(() => buildGrid(LEVELS[0]));
  const [flowPath, setFlowPath]     = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [moves, setMoves]           = useState(0);
  const [showIntro, setShowIntro]   = useState(true);

  const levelData = LEVELS[levelIdx];
  const flowing = flowSet(flowPath);

  useEffect(() => {
    setGrid(buildGrid(LEVELS[levelIdx]));
    setFlowPath([]);
    setIsComplete(false);
    setMoves(0);
  }, [levelIdx]);

  const rotatePipe = useCallback((y, x) => {
    setGrid(prev => {
      if (prev[y][x].locked) return prev;
      const next = prev.map(row => row.map(cell => ({ ...cell })));
      next[y][x].rotation = (next[y][x].rotation + 1) % 4;
      const ld = LEVELS[levelIdx];
      const result = checkFlow(next, ld.start, ld.end);
      setFlowPath(result.path);
      setIsComplete(result.success);
      return next;
    });
    setMoves(m => m + 1);
  }, [levelIdx]);

  if (showIntro) {
    return (
      <div className={styles.introWrapper}>
        <div className={styles.introCard}>
          <div className={styles.pipeArt}>
            {[0, 1, 2].map(i => (
              <div key={i} className={styles.pipeSegment} style={{ animationDelay: `${i * 0.2}s` }}>
                <div className={styles.waterDrop} />
              </div>
            ))}
          </div>
          <h1>🔧 Menyambung Pipa</h1>
          <p>
            {language === "id"
              ? "Sambungkan pipa dari awal hingga akhir!"
              : "Connect the pipes from start to end!"}
          </p>
          <div className={styles.instructions}>
            <div className={styles.step}>
              <span className={styles.stepNum}>1</span>
              <span>{language === "id" ? "Klik pipa untuk memutar" : "Click a pipe to rotate it"}</span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>2</span>
              <span>{language === "id" ? "Buat jalur dari 🟢 ke 🔴" : "Make a path from 🟢 to 🔴"}</span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>3</span>
              <span>{language === "id" ? "Selesaikan semua level!" : "Complete all levels!"}</span>
            </div>
          </div>
          <button className={styles.startButton} onClick={() => setShowIntro(false)}>
            {language === "id" ? "Mulai! 🎮" : "Start! 🎮"}
          </button>
        </div>
      </div>
    );
  }

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
          {LEVELS.map((_, i) => (
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
            : (language === "id" ? "Sambungkan pipa..." : "Connect the pipes...")}
        </span>
      </div>

      <div className={`${styles.gameArea} ${isComplete ? styles.gameAreaComplete : ""}`}>
        <div className={styles.grid}>
          {grid.map((row, y) => (
            <div key={y} className={styles.row}>
              {row.map((pipe, x) => {
                const isStart  = x === levelData.start.x && y === levelData.start.y;
                const isEnd    = x === levelData.end.x   && y === levelData.end.y;
                const isFlowing = flowing.has(`${x},${y}`);

                return (
                  <button
                    key={`${y}-${x}`}
                    type="button"
                    className={[
                      styles.cell,
                      pipe.locked   ? styles.locked    : "",
                      isFlowing     ? styles.flowing   : "",
                      isComplete    ? styles.complete  : "",
                      isStart       ? styles.startCell : "",
                      isEnd         ? styles.endCell   : "",
                    ].filter(Boolean).join(" ")}
                    onClick={() => rotatePipe(y, x)}
                    disabled={pipe.locked}
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
        <button
          className={styles.btn}
          onClick={() => {
            setGrid(buildGrid(levelData));
            setFlowPath([]);
            setIsComplete(false);
            setMoves(0);
          }}
        >
          🔄 {language === "id" ? "Reset" : "Reset"}
        </button>
        {isComplete && (
          <button
            className={`${styles.btn} ${styles.nextBtn}`}
            onClick={() => setLevelIdx(i => (i + 1) % LEVELS.length)}
          >
            ➡️ {language === "id" ? "Level Berikutnya" : "Next Level"}
          </button>
        )}
      </div>

      <div className={styles.hint}>
        {language === "id"
          ? "💡 Klik pipa untuk memutarnya — sambungkan 🟢 ke 🔴"
          : "💡 Click a pipe to rotate it — connect 🟢 to 🔴"}
      </div>
    </div>
  );
}
