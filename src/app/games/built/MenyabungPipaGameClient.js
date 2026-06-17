"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./MenyabungPipaGameClient.module.css";

const GRID_SIZE = 5;

const PIPE_TYPES = {
  straight: ["│", "─"],
  corner: ["└", "┘", "┐", "┌"],
  tshape: ["├", "┤", "┬", "┴"],
};

const generateLevel = () => {
  const grid = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      const types = ["straight", "corner"];
      const type = types[Math.floor(Math.random() * types.length)];
      const rotation = Math.floor(Math.random() * (type === "straight" ? 2 : 4));
      row.push({ type, rotation, locked: false });
    }
    grid.push(row);
  }
  // Set start and end
  grid[0][0] = { type: "corner", rotation: 2, locked: true };
  grid[GRID_SIZE-1][GRID_SIZE-1] = { type: "corner", rotation: 0, locked: true };
  return grid;
};

export default function MenyabungPipaGameClient() {
  const { language } = useLanguage();
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  useEffect(() => {
    setGrid(generateLevel());
  }, [level]);

  const rotatePipe = (y, x) => {
    if (grid[y][x].locked) return;
    setHasChanges(true);

    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    newGrid[y][x].rotation = (newGrid[y][x].rotation + 1) % 4;
    setGrid(newGrid);

    // Simple scoring - just count rotations
    setScore(score + 1);
  };

  const getPipeSymbol = (pipe) => {
    if (pipe.type === "straight") {
      return PIPE_TYPES.straight[pipe.rotation % 2];
    }
    return PIPE_TYPES.corner[pipe.rotation];
  };

  const resetLevel = () => {
    setGrid(generateLevel());
    setScore(0);
  };

  const nextLevel = () => {
    setLevel(level + 1);
    setScore(0);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🔧 Menyabung Pipa</h1>
        <p>{language === "id" ? "Putar pipa untuk menyambungkan aliran air!" : "Rotate pipes to connect the water flow!"}</p>
      </div>

      <div className={styles.stats}>
        <span>Level: {level}</span>
        <span>{language === "id" ? "Rotasi" : "Rotations"}: {score}</span>
      </div>

      <div className={styles.grid}>
        {grid.map((row, y) => (
          <div key={y} className={styles.row}>
            {row.map((pipe, x) => (
              <button
                key={`${y}-${x}`}
                className={`${styles.pipe} ${pipe.locked ? styles.locked : ''}`}
                onClick={() => rotatePipe(y, x)}
              >
                {getPipeSymbol(pipe)}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className={styles.controls}>
        <button className={styles.btn} onClick={resetLevel}>
          🔄 {language === "id" ? "Mulai Ulang" : "Restart"}
        </button>
        <button className={styles.btn} onClick={nextLevel}>
          ➡️ {language === "id" ? "Level Berikutnya" : "Next Level"}
        </button>
      </div>

      <div className={styles.instructions}>
        <p>{language === "id"
          ? "Petunjuk: Klik pipa untuk memutar. Hubungkan dari左上角 ke右下角!"
          : "Hint: Click pipes to rotate. Connect from top-left to bottom-right!"}</p>
      </div>
    </div>
  );
}