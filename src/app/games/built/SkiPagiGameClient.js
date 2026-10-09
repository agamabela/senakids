"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Volume2,
  VolumeX,
  HelpCircle,
  Coins,
  Heart,
  Play,
  Pause,
  Shield,
  Flag,
  Check,
  ChevronRight,
  Trophy,
  RotateCcw,
  X,
} from "lucide-react";
import styles from "./SkiPagiGameClient.module.css";

function MagnetIcon({ size = 16, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 15 4 4" />
      <path d="M2.352 10.648a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l6.029-6.029a1 1 0 1 1 3 3l-6.029 6.029a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l6.365-6.367A1 1 0 0 0 8.716 4.282z" />
      <path d="m5 8 4 4" />
    </svg>
  );
}

function MountainIcon({ size = 25, strokeWidth = 1.8, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}

function SnowflakeIcon({ size = 14, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m10 20-1.25-2.5L6 18" />
      <path d="M10 4 8.75 6.5 6 6" />
      <path d="m14 20 1.25-2.5L18 18" />
      <path d="m14 4 1.25 2.5L18 6" />
      <path d="m17 21-3-6h-4" />
      <path d="m17 3-3 6 1.5 3" />
      <path d="M2 12h6.5L10 9" />
      <path d="m20 10-1.5 2 1.5 2" />
      <path d="M22 12h-6.5L14 15" />
      <path d="m4 10 1.5 2L4 14" />
      <path d="m7 21 3-6-1.5-3" />
      <path d="m7 3 3 6h4" />
    </svg>
  );
}

const STAGES = [
  { name: "Easy Glades", start: 0, description: "Ikuti koin. Temukan ritmemu.", speed: 215, complexity: 0 },
  { name: "Finding Flow", start: 350, description: "Lebih cepat. Jaga kelancaran belokan.", speed: 265, complexity: 0 },
  { name: "Pine Pass", start: 800, description: "Banyak pohon. Gunakan tanjakan untuk melompati batu.", speed: 265, complexity: 1 },
  { name: "Downhill Rush", start: 1450, description: "Pacu kecepatan. Tahan rem untuk belokan tajam.", speed: 315, complexity: 1 },
  { name: "Expert Trail", start: 2250, description: "Pahami lereng. Selalu ada jalur yang aman.", speed: 315, complexity: 2 },
  { name: "Summit Run", start: 3300, description: "Laju tercepatmu. Seberapa jauh kamu bisa bertahan?", speed: 365, complexity: 2 },
];

const FIXED_DELTA = 1 / 120;
const LANES = [70, 170, 270, 370, 470];
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

function mulberry32(stateObj) {
  let t = (stateObj.randomState += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), 1 | t);
  t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
  stateObj.randomState >>>= 0;
  return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
}

function spawnObstacle(state, type, x, y, row) {
  const sizeMap = type === "tree" ? [38, 15, 13] : type === "rock" ? [26, 20, 12] : [31, 27, 12];
  const item = {
    id: ++state.nextId,
    type,
    x,
    y,
    size: sizeMap[0],
    radiusX: sizeMap[1],
    radiusY: sizeMap[2],
    width: type === "gate" ? 148 : undefined,
    rowId: row.id,
    safeX: row.safeX,
    safeHalfWidth: row.safeHalfWidth,
    dead: false,
    nearMissChecked: false,
  };
  state.obstacles.push(item);
  return item;
}

function generateRow(state, y) {
  const stage = STAGES[state.stageIndex];
  const rowCount = state.rowCount++;
  const prevSafeX = LANES[state.safeLane];
  if (rowCount > 2) {
    state.safeLane = clamp(state.safeLane + Math.floor(3 * mulberry32(state)) - 1, 0, LANES.length - 1);
  }
  const row = {
    id: ++state.nextId,
    y,
    safeX: LANES[state.safeLane],
    safeHalfWidth: 60,
  };
  state.rows.push(row);

  const candidateLanes = LANES.map((_, idx) => idx).filter((idx) => idx !== state.safeLane);
  for (let i = candidateLanes.length - 1; i > 0; i--) {
    const j = Math.floor(mulberry32(state) * (i + 1));
    [candidateLanes[i], candidateLanes[j]] = [candidateLanes[j], candidateLanes[i]];
  }

  const obstacleCount = Math.min(1 + stage.complexity, 3);
  for (let i = 0; i < obstacleCount; i++) {
    const laneIndex = candidateLanes[i];
    const isRampSeq = stage.complexity > 0 && rowCount % 6 === 4 && i === 0;
    const type = isRampSeq || mulberry32(state) > 0.7 ? "rock" : "tree";
    spawnObstacle(state, type, LANES[laneIndex], y, row);
    if (isRampSeq) {
      spawnObstacle(state, "ramp", LANES[laneIndex], y + 90, row);
    }
  }

  if (rowCount % 3 === 1) {
    spawnObstacle(state, "gate", row.safeX, y, row);
  }

  for (const offset of [0, 54, 108, 162]) {
    const progress = Math.max(0, (offset - 54) / 206);
    const coinX = row.safeX + (prevSafeX - row.safeX) * progress;
    state.coins.push({
      id: ++state.nextId,
      x: coinX,
      y: y + offset,
      radius: 10,
      spin: mulberry32(state) * Math.PI * 2,
      collected: false,
      rowId: row.id,
    });
  }

  if (rowCount % 8 === 4) {
    const powerType = Math.floor(rowCount / 8) % 2 === 0 ? "shield" : "magnet";
    state.powerUps.push({
      id: ++state.nextId,
      type: powerType,
      x: row.safeX,
      y: y + 36,
      radius: 17,
      phase: mulberry32(state) * Math.PI * 2,
      collected: false,
      rowId: row.id,
    });
  }
}

function initRunState({ seed = Date.now() } = {}) {
  const state = {
    elapsed: 0,
    distance: 0,
    score: 0,
    bonusScore: 0,
    runCoins: 0,
    speed: STAGES[0].speed,
    stageIndex: 0,
    combo: 1,
    bestCombo: 1,
    streak: 0,
    comboTimer: 0,
    hearts: 3,
    over: false,
    nearMisses: 0,
    jumps: 0,
    gates: 0,
    player: {
      x: 270,
      y: 530,
      velocityX: 0,
      steering: 0,
      shield: 0,
      magnetUntil: 0,
      invincibleUntil: 0,
      airUntil: 0,
      airStartedAt: 0,
      landingPending: false,
    },
    obstacles: [],
    coins: [],
    powerUps: [],
    particles: [],
    tracks: [],
    rows: [],
    events: [],
    message: {
      text: STAGES[0].description,
      until: 4,
    },
    shake: 0,
    trackOffset: 0,
    recoveryUntil: 0,
    randomState: Number(seed) >>> 0,
    nextId: 0,
    rowCount: 0,
    safeLane: 2,
    rowTravel: 0,
    stepRemainder: 0,
    trackTimer: 0,
  };
  generateRow(state, 60);
  generateRow(state, -200);
  generateRow(state, -460);
  return state;
}

function spawnParticles(state, x, y, count, kind) {
  for (let i = 0; i < count; i++) {
    const angle = mulberry32(state) * Math.PI * 2;
    const speed = 35 + mulberry32(state) * (kind === "crash" ? 150 : 85);
    const life = 0.3 + 0.45 * mulberry32(state);
    state.particles.push({
      x,
      y,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      life,
      maxLife: life,
      size: 2 + 4 * mulberry32(state),
      kind,
    });
  }
  if (state.particles.length > 100) {
    state.particles.splice(0, state.particles.length - 100);
  }
}

function addScore(state, points, streakIncrement = 0) {
  if (streakIncrement) {
    state.streak += streakIncrement;
    state.combo = Math.min(5, 1 + Math.floor(state.streak / 5));
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.comboTimer = 4.5;
  }
  state.bonusScore += points * state.combo;
}

function checkSweptCollision(startX, startYObj, obstacleObj, obstX, obstPrevY, radiusX, radiusY) {
  const dx1 = startX - obstX;
  const dy1 = startYObj.y - obstPrevY;
  const dx2 = startYObj.x - obstacleObj.x - dx1;
  const dy2 = startYObj.y - obstacleObj.y - dy1;
  let tMin = 0;
  let tMax = 1;

  for (const [diff, relVel, radius] of [
    [dx1, dx2, radiusX],
    [dy1, dy2, radiusY],
  ]) {
    if (Math.abs(relVel) < 1e-8) {
      if (Math.abs(diff) > radius) return false;
      continue;
    }
    const t1 = (-radius - diff) / relVel;
    const t2 = (radius - diff) / relVel;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
    if (tMin > tMax) return false;
  }
  return true;
}

const ASSET_PATHS = {
  sprites: "/images/games/ski-free/alpine-sprites.webp",
  vista: "/images/games/ski-free/alpine-vista.webp",
};

const SPRITE_FRAMES = {
  skier: [160, 84, 360, 582],
  tree: [711, 31, 419, 643],
  rock: [114, 822, 430, 316],
  ramp: [719, 746, 470, 436],
};

const SNOW_COLORS = ["#f4faf7", "#f2f9f6", "#eff7f4", "#eff7fa", "#edf6f8", "#edf6f8"];

function drawEllipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
  ctx.fill();
}

function drawLine(ctx, x1, y1, x2, y2, stroke, width = 2) {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawSprite(ctx, assets, type, dx, dy, dw, dh) {
  if (!assets?.sprites) return false;
  ctx.drawImage(assets.sprites, ...SPRITE_FRAMES[type], dx, dy, dw, dh);
  return true;
}

function drawTree(ctx, tree, assets) {
  const { x, y, size = 38 } = tree;
  const dw = 2.05 * size;
  const dh = 1.535 * dw;
  drawEllipse(ctx, x + 10, y + 6, 0.8 * size, 0.24 * size, "#476d6d1a");
  if (!drawSprite(ctx, assets, "tree", x - 0.5 * dw, y - dh + 9, dw, dh)) {
    drawLine(ctx, x, y - 22, x, y + 4, "#685847", 8);
    for (let t = 0; t < 3; t++) {
      const cy = y - 97 + 22 * t;
      const cw = 20 + 9 * t;
      ctx.fillStyle = t % 2 ? "#2e7970" : "#3c8a7d";
      ctx.beginPath();
      ctx.moveTo(x, cy);
      ctx.lineTo(x + cw, cy + 43);
      ctx.quadraticCurveTo(x, cy + 53, x - cw, cy + 43);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#f9fcf5";
      ctx.beginPath();
      ctx.moveTo(x, cy - 2);
      ctx.lineTo(x + 0.76 * cw, cy + 30);
      ctx.quadraticCurveTo(x, cy + 39, x - 0.76 * cw, cy + 30);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawRock(ctx, rock, assets) {
  const { x, y, size = 26 } = rock;
  drawEllipse(ctx, x + 5, y + 8, 1.05 * size, 0.36 * size, "#476d6d1f");
  if (!drawSprite(ctx, assets, "rock", x - 1.1 * size, y - 1.22 * size, 2.2 * size, 1.62 * size)) {
    drawEllipse(ctx, x, y - 6, size, 0.7 * size, "#69838c");
    drawEllipse(ctx, x - 3, y - 15, 0.91 * size, 0.5 * size, "#fbfdf7");
  }
}

function drawRamp(ctx, ramp, assets) {
  const { x, y, size = 31 } = ramp;
  drawEllipse(ctx, x + 5, y + 12, 1.15 * size, 0.4 * size, "#476d6d20");
  if (!drawSprite(ctx, assets, "ramp", x - 1.16 * size, y - 1.8 * size, 2.32 * size, 2.15 * size)) {
    ctx.fillStyle = "#ac794e";
    ctx.fillRect(x - 30, y - 23, 60, 29);
    ctx.fillStyle = "#fffdf2";
    ctx.beginPath();
    ctx.moveTo(x - 25, y - 49);
    ctx.lineTo(x + 25, y - 49);
    ctx.lineTo(x + 32, y - 7);
    ctx.lineTo(x - 32, y - 7);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = "#4a9d9bcc";
  ctx.lineWidth = 2.5;
  for (let t = 0; t < 2; t++) {
    ctx.beginPath();
    ctx.moveTo(x - 8, y - 26 + 8 * t);
    ctx.lineTo(x, y - 21 + 8 * t);
    ctx.lineTo(x + 8, y - 26 + 8 * t);
    ctx.stroke();
  }
}

function drawGate(ctx, gate) {
  const width = gate.width || 148;
  ctx.setLineDash([4, 8]);
  drawLine(ctx, gate.x - width / 2 + 8, gate.y + 4, gate.x + width / 2 - 8, gate.y + 4, "#52a59c55", 2);
  ctx.setLineDash([]);
  for (const s of [-1, 1]) {
    const px = gate.x + (s * width) / 2;
    drawEllipse(ctx, px + 3, gate.y + 4, 7, 3, "#476d6d25");
    drawLine(ctx, px, gate.y, px, gate.y - 46, "#365a66", 3);
    ctx.fillStyle = s < 0 ? "#ed8067" : "#529f97";
    ctx.beginPath();
    ctx.moveTo(px, gate.y - 46);
    ctx.lineTo(px - 23 * s, gate.y - 41);
    ctx.lineTo(px - 23 * s, gate.y - 26);
    ctx.lineTo(px, gate.y - 31);
    ctx.closePath();
    ctx.fill();
  }
}

function drawCoin(ctx, coin, elapsed, reducedMotion) {
  const scaleX = reducedMotion ? 1 : 0.78 + 0.22 * Math.abs(Math.sin(2.4 * elapsed + coin.spin));
  const bob = reducedMotion ? 0 : 2 * Math.sin(3 * elapsed + coin.spin);
  drawEllipse(ctx, coin.x + 2, coin.y + 10, 8, 3, "#bdaa571a");
  ctx.save();
  ctx.translate(coin.x, coin.y - 3 + bob);
  ctx.scale(scaleX, 1);
  drawEllipse(ctx, 0, 1, 10, 10, "#bf842b");
  drawEllipse(ctx, 0, -1, 9, 9, "#f6c957");
  ctx.strokeStyle = "#fff0ac";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -1, 6.5, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = "#fff6cb";
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(3, -1);
  ctx.lineTo(0, 4);
  ctx.lineTo(-3, -1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPowerUp(ctx, power, elapsed, reducedMotion) {
  const bob = reducedMotion ? 0 : 3 * Math.sin(2.5 * elapsed + power.phase);
  const cy = power.y + bob;
  const isShield = power.type === "shield";
  drawEllipse(ctx, power.x, power.y + 16, 13, 4, "#476d6d1a");
  drawEllipse(ctx, power.x, cy, 23, 23, isShield ? "#91d9e62b" : "#f3bfa12b");
  drawEllipse(ctx, power.x, cy, 18, 18, "#ffffff");
  ctx.strokeStyle = isShield ? "#79cbd7" : "#efac84";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(power.x, cy, 18, 0, 2 * Math.PI);
  ctx.stroke();

  if (isShield) {
    ctx.fillStyle = "#4aabba";
    ctx.beginPath();
    ctx.moveTo(power.x, cy - 10);
    ctx.lineTo(power.x + 8.8, cy - 6.15);
    ctx.lineTo(power.x + 7.15, cy + 5.4);
    ctx.quadraticCurveTo(power.x, cy + 14.2, power.x - 7.15, cy + 5.4);
    ctx.lineTo(power.x - 8.8, cy - 6.15);
    ctx.closePath();
    ctx.fill();
    drawLine(ctx, power.x - 4, cy + 1, power.x - 1, cy + 5, "#fff", 2);
    drawLine(ctx, power.x - 1, cy + 5, power.x + 5, cy - 3, "#fff", 2);
  } else {
    ctx.strokeStyle = "#e67f66";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(power.x - 7, cy - 6);
    ctx.lineTo(power.x - 7, cy + 2);
    ctx.arc(power.x, cy + 2, 7, Math.PI, 0, true);
    ctx.lineTo(power.x + 7, cy - 6);
    ctx.stroke();
    drawLine(ctx, power.x - 7, cy - 8, power.x - 7, cy - 5, "#467d8b", 6);
    drawLine(ctx, power.x + 7, cy - 8, power.x + 7, cy - 5, "#467d8b", 6);
  }
}

function drawSkier(ctx, state, assets, reducedMotion) {
  const p = state.player;
  const elapsed = state.elapsed || 0;
  const airDuration = p.airUntil - p.airStartedAt;
  const airRatio = airDuration > 0 ? Math.max(0, Math.min(1, (elapsed - p.airStartedAt) / airDuration)) : 0;
  const jumpHeight = p.airUntil > elapsed ? 35 * Math.sin(airRatio * Math.PI) : 0;

  drawEllipse(ctx, p.x + 3, p.y + 7, 20 - 0.12 * jumpHeight, 6 - 0.045 * jumpHeight, jumpHeight ? "#476d6d18" : "#476d6d24");

  if (!reducedMotion && !jumpHeight && elapsed > 0) {
    ctx.save();
    const steerFactor = 0.5 + Math.abs(p.steering || 0);
    for (let i = 0; i < 10; i++) {
      const life = (2.1 * elapsed + 0.17 * i) % 1;
      const side = i % 2 ? 1 : -1;
      ctx.globalAlpha = (1 - life) * 0.7;
      drawEllipse(ctx, p.x + side * (10 + 21 * life * steerFactor), p.y - 10 - 31 * life, 1.2 + (1 - life) * 1.7, 1.2 + (1 - life) * 1.7, "#ffffff");
    }
    ctx.restore();
  }

  if (p.magnetUntil > elapsed) {
    const pulse = reducedMotion ? 0 : 5 * Math.sin(3 * elapsed);
    ctx.strokeStyle = "#e6947755";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 8]);
    ctx.beginPath();
    ctx.ellipse(p.x, p.y - 13, 41 + pulse, 38 + pulse, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.save();
  ctx.translate(p.x, p.y - jumpHeight);
  ctx.rotate(-0.3 * (p.steering || 0));
  if (p.invincibleUntil > elapsed && !reducedMotion) {
    ctx.globalAlpha = 0.72 + 0.2 * Math.sin(16 * elapsed);
  }

  const scale = 1 + jumpHeight / 280;
  ctx.scale(scale, scale);

  if (!drawSprite(ctx, assets, "skier", -27, -70, 54, 87.3)) {
    drawLine(ctx, -9, -2, -9, 20, "#274f60", 6);
    drawLine(ctx, 9, -2, 9, 20, "#274f60", 6);
    drawLine(ctx, -17, -29, -24, 3, "#355d6a", 2);
    drawLine(ctx, 17, -29, 24, 3, "#355d6a", 2);
    drawEllipse(ctx, 0, -25, 15, 19, "#ec7d61");
    drawEllipse(ctx, 0, -26, 8, 12, "#367d79");
    drawEllipse(ctx, 0, -46, 12, 13, "#fbf5df");
    drawLine(ctx, -10, -39, 10, -39, "#315d6a", 4);
  }

  if (p.shield) {
    ctx.strokeStyle = "#63c3d1b0";
    ctx.lineWidth = 2;
    ctx.fillStyle = "#b0e7e814";
    ctx.beginPath();
    ctx.ellipse(0, -25, 32, 51, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#fffffff0";
    ctx.beginPath();
    ctx.ellipse(0, -25, 28, 47, 0, 3.8, 4.55);
    ctx.stroke();
  }
  ctx.restore();
}

function renderScene(ctx, state, assets, { reducedMotion = false, menu = false } = {}) {
  ctx.save();
  ctx.clearRect(0, 0, 540, 720);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (!reducedMotion && state.shake > 0 && !menu) {
    const shakeAngle = 79 * (state.elapsed || 0);
    ctx.translate(Math.sin(shakeAngle) * state.shake * 4, Math.cos(1.3 * shakeAngle) * state.shake * 3);
  }

  const bgSnow = SNOW_COLORS[state.stageIndex] || SNOW_COLORS[0];
  ctx.fillStyle = bgSnow;
  ctx.fillRect(0, 0, 540, 720);

  const grad = ctx.createLinearGradient(0, 0, 540, 720);
  grad.addColorStop(0, "#d8ebec");
  grad.addColorStop(0.16, bgSnow);
  grad.addColorStop(0.8, bgSnow);
  grad.addColorStop(1, "#d7eceb");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 540, 720);

  const offset = menu ? 0 : state.trackOffset || 0;
  ctx.lineCap = "round";
  for (let i = 0; i < 30; i++) {
    const sy = (91 * i + 0.65 * offset) % 810 - 45;
    const sx = (193 * i + 69) % 484 + 28;
    ctx.strokeStyle = i % 3 ? "#d6e6e640" : "#ffffffaa";
    ctx.lineWidth = i % 3 ? 1.5 : 2;
    ctx.beginPath();
    ctx.moveTo(sx - 12, sy);
    ctx.quadraticCurveTo(sx, sy - 4, sx + 17, sy - 1);
    ctx.stroke();
  }

  for (const sideX of [0, 540]) {
    for (let s = 0; s < 5; s++) {
      const treeY = (199 * s + 0.82 * offset) % 1000 - 100;
      drawTree(ctx, { x: sideX === 0 ? -22 - (s % 2) * 5 : 562 + (s % 2) * 5, y: treeY, size: 38 + (s % 2) * 7 }, assets);
    }
  }

  if (assets?.vista) {
    ctx.drawImage(assets.vista, 0, 200, assets.vista.width, assets.vista.height - 200, 0, -20, 540, 212);
  } else {
    const sky = ctx.createLinearGradient(0, 0, 0, 160);
    sky.addColorStop(0, "#a6dce2");
    sky.addColorStop(1, "#e2f3ee");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 540, 180);
    for (let m = 0; m < 2; m++) {
      ctx.fillStyle = m ? "#8dbac4" : "#b2d1d6";
      ctx.beginPath();
      ctx.moveTo(0, 165);
      for (let p = 0; p < 9; p++) {
        ctx.lineTo(76 * p - 25, 45 + (41 * p + 23 * m) % 80);
      }
      ctx.lineTo(540, 190);
      ctx.lineTo(0, 190);
      ctx.fill();
    }
  }

  const horizonFade = ctx.createLinearGradient(0, 106, 0, 201);
  horizonFade.addColorStop(0, `${bgSnow}00`);
  horizonFade.addColorStop(1, bgSnow);
  ctx.fillStyle = horizonFade;
  ctx.fillRect(0, 106, 540, 96);

  if (!menu) {
    for (const track of state.tracks || []) {
      const alpha = 0.18 * Math.max(0, Math.min(1, track.life / (track.maxLife || 1)));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(track.x, track.y + 18);
      ctx.rotate(-0.3 * (track.steering || 0));
      drawLine(ctx, -8, -5, -8, 6, "#4c8d9b", 2);
      drawLine(ctx, 8, -5, 8, 6, "#4c8d9b", 2);
      ctx.restore();
    }
  }

  const renderList = [
    ...(state.obstacles || []).filter((o) => !o.dead).map((o) => ({ item: o, kind: o.type })),
    ...(state.coins || []).filter((c) => !c.collected).map((c) => ({ item: c, kind: "coin" })),
    ...(state.powerUps || []).filter((p) => !p.collected).map((p) => ({ item: p, kind: "power" })),
    { item: state.player, kind: "player" },
  ].sort((a, b) => a.item.y - b.item.y);

  for (const { item, kind } of renderList) {
    if (item.y < 100 || item.y > 850) continue;
    ctx.save();
    ctx.globalAlpha = Math.min(1, (item.y - 100) / 55);

    if (kind === "tree") {
      drawTree(ctx, item, assets);
    } else if (kind === "rock") {
      drawRock(ctx, item, assets);
    } else if (kind === "ramp") {
      drawRamp(ctx, item, assets);
    } else if (kind === "gate") {
      drawGate(ctx, item);
    } else if (kind === "coin") {
      drawCoin(ctx, item, state.elapsed || 0, reducedMotion);
    } else if (kind === "power") {
      drawPowerUp(ctx, item, state.elapsed || 0, reducedMotion);
    } else if (kind === "player") {
      drawSkier(ctx, state, assets, reducedMotion);
    }
    ctx.restore();
  }

  if (!reducedMotion) {
    const particleColors = {
      snow: "#ffffff",
      coin: "#f2c553",
      crash: "#ef886e",
      shield: "#76d2df",
      jump: "#9ad3d9",
    };
    for (const pt of state.particles || []) {
      ctx.globalAlpha = Math.max(0, Math.min(1, pt.life / (pt.maxLife || 1)));
      drawEllipse(ctx, pt.x, pt.y, pt.size || 2, pt.size || 2, particleColors[pt.kind] || "#fff");
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

const STORAGE_KEYS = {
  score: "senakids:ski-free:best-score:v2",
  distance: "senakids:ski-free:best-distance:v2",
  coins: "senakids:ski-free:coins:v2",
  sound: "senakids:ski-free:sound",
};

const formatNumber = (num) => Math.floor(num).toLocaleString("id-ID");

function createInputState() {
  return {
    keys: new Set(),
    buttons: new Set(),
    drag: null,
    targetX: null,
  };
}

function loadStorageNumber(key) {
  try {
    const val = Number(window.localStorage.getItem(key));
    return Number.isFinite(val) && val > 0 ? Math.min(Math.floor(val), Number.MAX_SAFE_INTEGER) : 0;
  } catch {
    return 0;
  }
}

function snapshotStats(state) {
  return {
    distance: Math.floor(state.distance),
    score: Math.floor(state.score),
    coins: state.runCoins,
    combo: state.combo,
    bestCombo: state.bestCombo,
    hearts: state.hearts,
    speed: state.speed,
    stage: state.stageIndex,
    shield: state.player.shield,
    magnet: Math.max(0, state.player.magnetUntil - state.elapsed),
    message: state.message && state.message.until > state.elapsed ? state.message.text : "",
    gates: state.gates || 0,
    jumps: state.jumps,
    nearMisses: state.nearMisses,
  };
}

export default function SkiPagiGameClient() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const playButtonRef = useRef(null);
  const stateRef = useRef(null);
  if (!stateRef.current) {
    stateRef.current = initRunState({ seed: 2026 });
  }

  const assetsRef = useRef({});
  const inputRef = useRef(createInputState());
  const statusRef = useRef("ready");
  const endedRef = useRef(false);
  const recordsRef = useRef({ score: 0, distance: 0, coins: 0 });
  const audioCtxRef = useRef(null);
  const soundEnabledRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const helpOpenRef = useRef(false);
  const lastActiveElementRef = useRef(null);

  const [status, setStatus] = useState("ready");
  const [stats, setStats] = useState(() => snapshotStats(stateRef.current));
  const [records, setRecords] = useState(recordsRef.current);
  const [countdown, setCountdown] = useState(3);
  const [assetsReady, setAssetsReady] = useState(false);
  const [canvasSupported, setCanvasSupported] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [isBraking, setIsBraking] = useState(false);
  const [dims, setDims] = useState({ width: 540, height: 720 });

  const changeStatus = useCallback((s) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  const resetInputs = useCallback(() => {
    inputRef.current = createInputState();
    setIsBraking(false);
  }, []);

  const ensureAudio = useCallback(() => {
    if (!soundEnabledRef.current) return null;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, []);

  const playSound = useCallback((type) => {
    const ctx = audioCtxRef.current;
    if (!soundEnabledRef.current || !ctx || ctx.state !== "running") return;
    const freq = {
      coin: 880,
      gate: 660,
      nearMiss: 520,
      jump: 740,
      shield: 620,
      magnet: 700,
      hit: 140,
      over: 110,
      stage: 560,
      tick: 440,
      go: 880,
    }[type];

    if (freq) {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        const dur = type === "hit" || type === "over" ? 0.22 : 0.1;
        osc.type = type === "hit" ? "triangle" : "sine";
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * (type === "hit" ? 0.5 : 1.2), now + dur);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.035, now + 0.008);
        gain.gain.exponentialRampToValueAtTime(1e-4, now + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
        osc.start(now);
        osc.stop(now + dur);
      } catch {}
    }
  }, []);

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(canvas.width / 540, 0, 0, canvas.height / 720, 0, 0);
    renderScene(ctx, stateRef.current, assetsRef.current, {
      reducedMotion: reducedMotionRef.current,
      menu: statusRef.current === "ready",
    });
  }, []);

  const handleGameOver = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    const s = stateRef.current;
    const newRecords = {
      score: Math.max(recordsRef.current.score, Math.floor(s.score)),
      distance: Math.max(recordsRef.current.distance, Math.floor(s.distance)),
      coins: recordsRef.current.coins + s.runCoins,
    };
    setIsNewRecord(Math.floor(s.score) > recordsRef.current.score);
    recordsRef.current = newRecords;
    setRecords(newRecords);
    setStats(snapshotStats(s));
    resetInputs();
    changeStatus("over");
    try {
      window.localStorage.setItem(STORAGE_KEYS.score, String(newRecords.score));
      window.localStorage.setItem(STORAGE_KEYS.distance, String(newRecords.distance));
      window.localStorage.setItem(STORAGE_KEYS.coins, String(newRecords.coins));
    } catch {}
  }, [changeStatus, resetInputs]);

  const startGame = useCallback(() => {
    if (!assetsReady || !canvasSupported) return;
    ensureAudio();
    resetInputs();
    stateRef.current = initRunState();
    endedRef.current = false;
    setIsNewRecord(false);
    setStats(snapshotStats(stateRef.current));
    setCountdown(3);
    changeStatus("countdown");
    canvasRef.current?.focus({ preventScroll: true });
    renderFrame();
  }, [assetsReady, canvasSupported, changeStatus, ensureAudio, renderFrame, resetInputs]);

  const pauseGame = useCallback(() => {
    if (["running", "countdown"].includes(statusRef.current)) {
      resetInputs();
      changeStatus("paused");
    }
  }, [changeStatus, resetInputs]);

  const resumeGame = useCallback(() => {
    ensureAudio();
    resetInputs();
    setCountdown(3);
    changeStatus("countdown");
    canvasRef.current?.focus({ preventScroll: true });
  }, [changeStatus, ensureAudio, resetInputs]);

  const openHelp = useCallback(() => {
    lastActiveElementRef.current = document.activeElement;
    pauseGame();
    helpOpenRef.current = true;
    setHelpOpen(true);
  }, [pauseGame]);

  const closeHelp = useCallback((val) => {
    helpOpenRef.current = val;
    setHelpOpen(val);
  }, []);

  // Preload and mount
  useEffect(() => {
    let active = true;
    try {
      const loaded = {
        score: loadStorageNumber(STORAGE_KEYS.score),
        distance: Math.max(loadStorageNumber(STORAGE_KEYS.distance), loadStorageNumber("cabocil:ski-free:high-score")),
        coins: loadStorageNumber(STORAGE_KEYS.coins),
      };
      recordsRef.current = loaded;
      setRecords(loaded);
      soundEnabledRef.current = window.localStorage.getItem(STORAGE_KEYS.sound) === "on";
      setSoundEnabled(soundEnabledRef.current);
    } catch {}

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotion = () => {
      reducedMotionRef.current = motionQuery.matches;
      renderFrame();
    };
    handleMotion();
    motionQuery.addEventListener("change", handleMotion);

    if (!canvasRef.current?.getContext("2d")) {
      setCanvasSupported(false);
    }

    Promise.all(
      Object.entries(ASSET_PATHS).map(
        ([key, src]) =>
          new Promise((resolve) => {
            const img = new Image();
            let resolved = false;
            const finish = (res) => {
              if (!resolved) {
                resolved = true;
                clearTimeout(timer);
                img.onload = null;
                img.onerror = null;
                resolve([key, res]);
              }
            };
            const timer = setTimeout(() => finish(null), 8000);
            img.onload = () => finish(img);
            img.onerror = () => finish(null);
            img.src = src;
          })
      )
    )
      .then(Object.fromEntries)
      .then((loadedAssets) => {
        if (active) {
          assetsRef.current = loadedAssets;
          setAssetsReady(true);
          renderFrame();
        }
      })
      .catch(() => {
        if (active) setAssetsReady(true);
      });

    return () => {
      active = false;
      motionQuery.removeEventListener("change", handleMotion);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [renderFrame]);

  // Responsive canvas resizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const targetW = Math.max(1, Math.min(rect.width, (540 * rect.height) / 720, 540));
      const targetH = (720 * targetW) / 540;
      setDims({ width: targetW, height: targetH });
      const canvas = canvasRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas) {
        canvas.width = Math.round(targetW * dpr);
        canvas.height = Math.round(targetH * dpr);
      }
      renderFrame();
    };
    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);
    window.addEventListener("resize", handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [renderFrame]);

  // Countdown handler
  useEffect(() => {
    if (status !== "countdown") return;
    let count = 3;
    playSound("tick");
    const interval = window.setInterval(() => {
      if (document.hidden) {
        pauseGame();
      } else {
        count -= 1;
        if (count === 0) {
          window.clearInterval(interval);
          changeStatus("running");
          playSound("go");
        } else {
          setCountdown(count);
          playSound("tick");
        }
      }
    }, 650);
    return () => window.clearInterval(interval);
  }, [changeStatus, pauseGame, playSound, status]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (helpOpenRef.current) {
        if (key === "escape") {
          e.preventDefault();
          closeHelp(false);
        }
        return;
      }
      if (e.target instanceof Element && (e.target.closest("input, select, textarea") || (["enter", " "].includes(key) && e.target.closest("button, a")))) {
        return;
      }
      if (["p", "escape"].includes(key)) {
        e.preventDefault();
        if (e.repeat) return;
        statusRef.current === "paused" ? resumeGame() : pauseGame();
        return;
      }
      if (["enter", " "].includes(key) && ["ready", "over", "paused"].includes(statusRef.current)) {
        e.preventDefault();
        if (!e.repeat) {
          statusRef.current === "paused" ? resumeGame() : startGame();
        }
        return;
      }
      if (statusRef.current === "running" && ["arrowleft", "arrowright", "arrowdown", "a", "d", "s", " "].includes(key)) {
        e.preventDefault();
        inputRef.current.keys.add(key);
        if (["arrowleft", "arrowright", "a", "d"].includes(key)) {
          inputRef.current.targetX = null;
        }
      }
    };

    const handleKeyUp = (e) => {
      inputRef.current.keys.delete(e.key.toLowerCase());
    };

    const handleBlur = () => {
      resetInputs();
      pauseGame();
    };

    const handleVisibility = () => {
      if (document.hidden) handleBlur();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [pauseGame, resetInputs, resumeGame, startGame]);

  // Game loop
  useEffect(() => {
    let animId;
    if (status !== "running") {
      renderFrame();
      return;
    }

    let lastTime = null;
    let accumulated = 0;
    let updateTimer = 0;

    const step = (timestamp) => {
      if (statusRef.current !== "running") return;
      const delta = lastTime === null ? 0 : Math.min((timestamp - lastTime) / 1000, 0.1);
      lastTime = timestamp;
      accumulated += delta;

      const input = inputRef.current;
      const steerLeft = input.keys.has("arrowleft") || input.keys.has("a") || input.buttons.has("left");
      const steerRight = input.keys.has("arrowright") || input.keys.has("d") || input.buttons.has("right");
      const brakeActive = input.keys.has("arrowdown") || input.keys.has("s") || input.keys.has(" ") || input.buttons.has("brake");

      const inputPayload = {
        steer: Number(steerRight) - Number(steerLeft),
        brake: brakeActive,
        targetX: input.targetX,
      };

      const triggeredEvents = new Set();

      while (accumulated >= FIXED_DELTA && !stateRef.current.over) {
        const s = stateRef.current;
        s.events.length = 0;
        s.stepRemainder += Math.min(FIXED_DELTA, 0.25);

        while (s.stepRemainder + 1e-10 >= FIXED_DELTA && !s.over) {
          s.stepRemainder = Math.max(0, s.stepRemainder - FIXED_DELTA);
          const p = s.player;
          const prevX = p.x;
          s.elapsed += FIXED_DELTA;

          const nextStageIndex = STAGES.findLastIndex((st) => s.distance >= st.start);
          if (nextStageIndex !== s.stageIndex) {
            s.stageIndex = nextStageIndex;
            s.message = {
              text: `${STAGES[nextStageIndex].name} · ${STAGES[nextStageIndex].description}`,
              until: s.elapsed + 3.8,
            };
            s.events.push("stage");
          }

          const currentStage = STAGES[s.stageIndex];
          const targetSpeed = currentStage.speed * (inputPayload.brake ? 0.6 : 1);
          const accel = s.speed > targetSpeed ? 170 : s.recoveryUntil > s.elapsed || s.speed < 0.8 * currentStage.speed ? 85 : 24;
          s.speed = s.speed < targetSpeed ? Math.min(targetSpeed, s.speed + accel * FIXED_DELTA) : Math.max(targetSpeed, s.speed - accel * FIXED_DELTA);

          const distanceStep = s.speed * FIXED_DELTA;
          s.distance += 0.12 * distanceStep;
          s.trackOffset += distanceStep;
          s.rowTravel += distanceStep;

          const hasTargetX = typeof inputPayload.targetX === "number" && Number.isFinite(inputPayload.targetX);
          const clampedSteer = Number.isFinite(inputPayload.steer) ? clamp(inputPayload.steer, -1, 1) : 0;
          const targetVelX = hasTargetX ? clamp((clamp(inputPayload.targetX, 34, 506) - p.x) * 8, -340, 340) : 340 * clampedSteer;

          p.velocityX += (targetVelX - p.velocityX) * (1 - Math.exp(-12 * FIXED_DELTA));
          p.x = clamp(p.x + p.velocityX * FIXED_DELTA, 34, 506);
          if ((p.x === 34 && p.velocityX < 0) || (p.x === 506 && p.velocityX > 0)) {
            p.velocityX = 0;
          }
          p.steering += (p.velocityX / 340 - p.steering) * (1 - Math.exp(-10 * FIXED_DELTA));

          s.comboTimer = Math.max(0, s.comboTimer - FIXED_DELTA);
          if (!s.comboTimer) {
            s.combo = 1;
            s.streak = 0;
          }
          s.shake = Math.max(0, s.shake - FIXED_DELTA);
          if (s.message?.until < s.elapsed) {
            s.message = null;
          }

          for (const row of s.rows) {
            row.y += distanceStep;
          }

          for (const obst of s.obstacles) {
            const prevObstY = obst.y;
            obst.y += distanceStep;
            if (obst.dead) continue;

            if (obst.type === "gate") {
              if (!obst.nearMissChecked && prevObstY < p.y && obst.y >= p.y) {
                obst.nearMissChecked = true;
                const crossingX = prevX + ((p.x - prevX) * (p.y - prevObstY)) / distanceStep;
                if (Math.abs(crossingX - obst.x) < obst.width / 2 - 12) {
                  s.gates++;
                  addScore(s, 100, 2);
                  s.events.push("gate");
                  spawnParticles(s, obst.x, obst.y, 8, "coin");
                  s.message = {
                    text: `Gerbang bersih! +${100 * s.combo}`,
                    until: s.elapsed + 1.1,
                  };
                }
              }
              continue;
            }

            const hit = checkSweptCollision(prevX, p, obst, obst.x, prevObstY, obst.radiusX + 12, obst.radiusY + 10);
            if (obst.type === "ramp") {
              if (hit && p.airUntil <= s.elapsed) {
                obst.dead = true;
                p.airStartedAt = s.elapsed;
                p.airUntil = s.elapsed + 0.95;
                p.landingPending = true;
                s.events.push("jump");
                s.message = {
                  text: "Melayang di udara! Batu terlewati di bawahmu.",
                  until: s.elapsed + 1.5,
                };
                spawnParticles(s, p.x, p.y, 10, "jump");
              }
              continue;
            }

            const rockJumped = obst.type === "rock" && p.airUntil > s.elapsed;
            if (hit && !rockJumped && p.invincibleUntil <= s.elapsed) {
              obst.dead = true;
              p.landingPending = false;
              p.airUntil = 0;
              p.airStartedAt = 0;
              p.invincibleUntil = s.elapsed + 1.8;

              if (p.shield) {
                p.shield = 0;
                s.events.push("shield");
                s.message = {
                  text: "Perisai melindungimu!",
                  until: s.elapsed + 1.8,
                };
                spawnParticles(s, p.x, p.y, 14, "shield");
              } else {
                s.hearts--;
                s.combo = 1;
                s.streak = 0;
                s.comboTimer = 0;
                s.speed = Math.max(90, 0.55 * s.speed);
                s.recoveryUntil = s.elapsed + 2.5;
                s.shake = 0.45;
                s.events.push("hit");
                spawnParticles(s, p.x, p.y, 20, "crash");
                s.message = {
                  text: s.hearts ? "Tetap tenang! Masih ada waktu memulihkan diri." : "Petualangan seru! Siap mencoba lagi?",
                  until: s.elapsed + 2.2,
                };
                if (!s.hearts) {
                  s.over = true;
                  s.events.push("over");
                }
              }
              if (s.over) break;
            }

            if (!obst.dead && !obst.nearMissChecked && obst.y > p.y + obst.radiusY + 10) {
              obst.nearMissChecked = true;
              const gap = Math.abs(p.x - obst.x) - obst.radiusX - 12;
              if (!rockJumped && gap > 0 && gap < 24 && p.invincibleUntil <= s.elapsed) {
                s.nearMisses++;
                addScore(s, 35, 1);
                s.events.push("nearMiss");
              }
            }
          }

          if (!s.over) {
            if (p.landingPending && p.airUntil <= s.elapsed) {
              p.landingPending = false;
              s.jumps++;
              addScore(s, 60, 1);
              s.events.push("land");
              s.message = {
                text: `Pendaratan mulus! +${60 * s.combo}`,
                until: s.elapsed + 1.3,
              };
              spawnParticles(s, p.x, p.y, 8, "jump");
            }

            for (const coin of s.coins) {
              const prevCoinY = coin.y;
              const prevCoinX = coin.x;
              coin.y += distanceStep;
              if (!coin.collected) {
                if (p.magnetUntil > s.elapsed && Math.hypot(coin.x - p.x, coin.y - p.y) < 145) {
                  const pull = 1 - Math.exp(-8 * FIXED_DELTA);
                  coin.x += (p.x - coin.x) * pull;
                  coin.y += (p.y - coin.y) * pull;
                }
                if (checkSweptCollision(prevX, p, coin, prevCoinX, prevCoinY, 23, 24)) {
                  coin.collected = true;
                  s.runCoins++;
                  addScore(s, 20, 1);
                  s.events.push("coin");
                  spawnParticles(s, coin.x, coin.y, 4, "coin");
                }
              }
            }

            for (const power of s.powerUps) {
              const prevPowerY = power.y;
              power.y += distanceStep;
              if (!power.collected && checkSweptCollision(prevX, p, power, power.x, prevPowerY, 29, 27)) {
                power.collected = true;
                if (power.type === "shield") {
                  p.shield = 1;
                  s.message = {
                    text: "Perisai aktif. Melindungi dari satu benturan.",
                    until: s.elapsed + 2,
                  };
                } else {
                  p.magnetUntil = s.elapsed + 8;
                  s.message = {
                    text: "Magnet koin aktif · 8 detik",
                    until: s.elapsed + 2,
                  };
                }
                s.events.push(power.type);
                spawnParticles(s, power.x, power.y, 10, "shield");
              }
            }
          }

          s.trackTimer += FIXED_DELTA;
          for (const tr of s.tracks) {
            tr.y += distanceStep;
            tr.life -= FIXED_DELTA;
          }
          if (s.trackTimer >= 0.045 && p.airUntil <= s.elapsed) {
            s.trackTimer = 0;
            s.tracks.push({
              x: p.x,
              y: p.y,
              steering: p.steering,
              life: 1.6,
              maxLife: 1.6,
            });
          }

          for (const pt of s.particles) {
            pt.x += pt.velocityX * FIXED_DELTA;
            pt.y += pt.velocityY * FIXED_DELTA + 0.35 * distanceStep;
            pt.life -= FIXED_DELTA;
          }

          while (s.rowTravel >= 260) {
            s.rowTravel -= 260;
            generateRow(s, -460 + s.rowTravel);
          }

          s.obstacles = s.obstacles.filter((o) => !o.dead && o.y < 850);
          s.coins = s.coins.filter((c) => !c.collected && c.y < 750);
          s.powerUps = s.powerUps.filter((p) => !p.collected && p.y < 760);
          s.rows = s.rows.filter((r) => r.y < 850);
          s.particles = s.particles.filter((pt) => pt.life > 0);
          s.tracks = s.tracks.filter((tr) => tr.life > 0 && tr.y < 740);
          s.score = Math.floor(s.distance + s.bonusScore);
        }

        stateRef.current.events.forEach((ev) => triggeredEvents.add(ev));
        accumulated -= FIXED_DELTA;
      }

      triggeredEvents.forEach(playSound);
      renderFrame();

      if (stateRef.current.over) {
        handleGameOver();
      } else {
        updateTimer += delta;
        if (updateTimer >= 0.1) {
          updateTimer = 0;
          setStats(snapshotStats(stateRef.current));
          setIsBraking(inputPayload.brake);
        }
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [handleGameOver, playSound, renderFrame, status]);

  const handlePointerDown = (e) => {
    if (statusRef.current !== "running" || inputRef.current.drag || e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.focus({ preventScroll: true });
    e.currentTarget.setPointerCapture(e.pointerId);
    inputRef.current.drag = {
      id: e.pointerId,
      x: e.clientX,
      playerX: stateRef.current.player.x,
    };
    inputRef.current.targetX = stateRef.current.player.x;
  };

  const handlePointerMove = (e) => {
    const drag = inputRef.current.drag;
    if (!drag || drag.id !== e.pointerId) return;
    const width = e.currentTarget.getBoundingClientRect().width;
    inputRef.current.targetX = Math.max(28, Math.min(512, drag.playerX + ((e.clientX - drag.x) * 540) / width));
  };

  const handlePointerEnd = (e) => {
    if (inputRef.current.drag?.id === e.pointerId) {
      inputRef.current.drag = null;
      inputRef.current.targetX = null;
    }
  };

  const releaseButton = (btn) => {
    inputRef.current.buttons.delete(btn);
    if (btn === "brake") setIsBraking(false);
  };

  const currentStage = STAGES[stats.stage] || STAGES[0];
  const nextStage = STAGES[stats.stage + 1];

  const currentGoal =
    stats.coins < 8
      ? { title: "Kumpulkan 8 koin", value: stats.coins, total: 8 }
      : stats.distance < 500
      ? { title: "Jelajahi 500 meter", value: stats.distance, total: 500 }
      : stats.gates < 3
      ? { title: "Lewati 3 gerbang slalom", value: stats.gates, total: 3 }
      : stats.jumps < 3
      ? { title: "Lakukan 3 lompatan mulus", value: stats.jumps, total: 3 }
      : { title: "Semua misi selesai! Kejar rekor terbaikmu!", value: 1, total: 1 };

  const isInteractive = status === "running" || status === "countdown";

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/games" className={styles.back} aria-label="Kembali ke Games">
          <ArrowLeft size={19} />
          <span>Games</span>
        </Link>

        <div className={styles.brand}>
          <MountainIcon size={25} strokeWidth={1.8} />
          <span>
            SKI FREE
            <small>Petualangan Lereng Gunung</small>
          </span>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => {
              const next = !soundEnabledRef.current;
              soundEnabledRef.current = next;
              setSoundEnabled(next);
              if (next) ensureAudio();
              try {
                window.localStorage.setItem(STORAGE_KEYS.sound, next ? "on" : "off");
              } catch {}
            }}
            aria-label={soundEnabled ? "Matikan suara" : "Aktifkan suara"}
            aria-pressed={soundEnabled}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>

          <button type="button" className={styles.iconButton} onClick={openHelp} aria-label="Cara bermain">
            <HelpCircle size={20} />
          </button>
        </div>
      </header>

      <div className={styles.scoreboard} aria-label="Statistik permainan">
        <div>
          <span>Jarak</span>
          <strong>
            {formatNumber(stats.distance)}
            <small> m</small>
          </strong>
        </div>
        <div className={styles.mainScore}>
          <span>Skor</span>
          <strong>{formatNumber(stats.score)}</strong>
        </div>
        <div>
          <span>
            <Coins size={13} /> Koin
          </span>
          <strong>{formatNumber(stats.coins)}</strong>
        </div>
      </div>

      <div ref={containerRef} className={styles.gameArea}>
        <section
          className={styles.board}
          style={{ width: dims.width, height: dims.height }}
          aria-label="Area permainan Ski Free"
        >
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            tabIndex={0}
            aria-label="Lereng ski. Gunakan tombol panah untuk belok, Spasi untuk rem, dan P untuk jeda."
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onLostPointerCapture={handlePointerEnd}
          >
            Game ini memerlukan browser dengan dukungan Canvas. Gunakan tombol panah untuk membelokkan pemain.
          </canvas>

          {status !== "ready" && (
            <div className={styles.slopeHud}>
              <div className={styles.hearts} aria-label={`${stats.hearts} dari 3 kesempatan tersisa`}>
                {[1, 2, 3].map((h) => (
                  <Heart
                    key={h}
                    size={19}
                    fill={h <= stats.hearts ? "currentColor" : "none"}
                    className={h <= stats.hearts ? "" : styles.emptyHeart}
                  />
                ))}
              </div>

              <span className={styles.stageLabel}>
                <span className={styles.trailDot} />
                {currentStage.name}
              </span>

              <button
                type="button"
                className={styles.pauseButton}
                onClick={status === "paused" ? resumeGame : pauseGame}
                disabled={status === "over"}
                aria-label={status === "paused" ? "Lanjutkan" : "Jeda"}
              >
                {status === "paused" ? <Play size={17} /> : <Pause size={17} />}
              </button>
            </div>
          )}

          {status === "running" && (
            <>
              <div className={styles.runFeedback}>
                {stats.combo > 1.05 && (
                  <span className={styles.combo}>
                    ×{stats.combo.toFixed(1)} <small>FLOW</small>
                  </span>
                )}
                {stats.shield > 0 && (
                  <span className={styles.power}>
                    <Shield size={16} /> Perisai
                  </span>
                )}
                {stats.magnet > 0 && (
                  <span className={styles.power}>
                    <MagnetIcon size={16} /> {Math.ceil(stats.magnet)}s
                  </span>
                )}
              </div>

              {stats.message && (
                <div className={styles.message} role="status">
                  {stats.message}
                </div>
              )}

              <div className={styles.goal}>
                <Flag size={15} />
                <span>{currentGoal.title}</span>
                <b>
                  {currentGoal.total === 1 ? (
                    <Check size={16} />
                  ) : (
                    `${Math.min(currentGoal.value, currentGoal.total)}/${currentGoal.total}`
                  )}
                </b>
                <div className={styles.goalTrack}>
                  <i style={{ width: `${100 * Math.min(1, currentGoal.value / currentGoal.total)}%` }} />
                </div>
              </div>

              {isBraking && <span className={styles.brakeFeedback}>Mengerem</span>}
            </>
          )}

          {status === "ready" && (
            <div className={styles.welcome}>
              <div className={styles.welcomeArt} />
              <div className={styles.welcomeContent}>
                <span className={styles.eyebrow}>
                  <SnowflakeIcon size={14} /> GUNUNG INI MILIKMU
                </span>
                <h1>
                  Ski<span>Free.</span>
                </h1>
                <p className={styles.tagline}>Belokan lincah. Petualangan salju seru.</p>
                <p className={styles.welcomeDescription}>
                  Temukan ritmemu di antara pepohonan pinus bersalju.
                  <br />
                  Kumpulkan koin dan raih rekor sejauh mungkin!
                </p>

                <div className={styles.trailPreview}>
                  <span>
                    <Heart size={14} /> 3 kesempatan
                  </span>
                  <span>
                    <Flag size={14} /> 6 tahap lereng
                  </span>
                </div>

                <button
                  ref={playButtonRef}
                  type="button"
                  className={styles.primaryButton}
                  onClick={startGame}
                  disabled={!assetsReady || !canvasSupported}
                >
                  <Play size={20} fill="currentColor" />
                  {canvasSupported ? (assetsReady ? "Mulai Meluncur" : "Menyiapkan lereng…") : "Canvas tidak didukung"}
                  <ChevronRight size={20} />
                </button>

                <span className={styles.startHint}>Sentuh & geser untuk meluncur · Tombol panah juga bisa</span>

                {records.score > 0 && (
                  <span className={styles.bestRecord}>
                    <Trophy size={14} /> Rekor Terbaik: {formatNumber(records.score)}
                  </span>
                )}
              </div>
            </div>
          )}

          {status === "countdown" && (
            <div className={styles.countdownOverlay} aria-live="assertive">
              <span>Bersiap meluncur</span>
              <strong>{countdown}</strong>
              <p>Belok dengan santai. Kamu pasti bisa!</p>
            </div>
          )}

          {status === "paused" && (
            <div className={styles.overlay}>
              <div className={styles.resultCard}>
                <span className={styles.resultIcon}>
                  <Pause size={28} />
                </span>
                <h2>Istirahat Sejenak.</h2>
                <p>Permainanmu tersimpan aman di sini.</p>
                <button ref={playButtonRef} type="button" className={styles.primaryButton} onClick={resumeGame}>
                  <Play size={19} />
                  Lanjut Meluncur
                  <ChevronRight size={19} />
                </button>
                <span className={styles.startHint}>Hitungan mundur singkat akan membantumu bersiap kembali.</span>
              </div>
            </div>
          )}

          {status === "over" && (
            <div className={styles.overlay}>
              <div className={styles.resultCard}>
                <span className={styles.resultIcon}>
                  <Trophy size={29} />
                </span>
                <span className={styles.eyebrow}>
                  {isNewRecord ? "REKOR PRIBADI BARU!" : "PETUALANGAN SELESAI"}
                </span>
                <h2>{isNewRecord ? "Luncuran Terhebatmu!" : "Permainan Luar Biasa."}</h2>
                <div className={styles.resultScore}>
                  {formatNumber(stats.score)}
                  <small>poin</small>
                </div>
                <div className={styles.resultStats}>
                  <span>
                    <b>{formatNumber(stats.distance)} m</b>
                    Jarak
                  </span>
                  <span>
                    <b>{stats.coins}</b>
                    Koin
                  </span>
                  <span>
                    <b>×{stats.bestCombo.toFixed(1)}</b>
                    Flow Terbaik
                  </span>
                </div>
                <p className={styles.resultTip}>
                  {stats.distance < 350
                    ? "Belok lebih lebar dan tahan rem saat butuh ruang lebih aman."
                    : `Lereng ${currentStage.name} dijelajahi. ${stats.gates} gerbang berhasil dilewati. ${stats.jumps} lompatan mulus didaratkan.`}
                </p>
                <button ref={playButtonRef} type="button" className={styles.primaryButton} onClick={startGame}>
                  <RotateCcw size={19} />
                  Main Lagi
                  <ChevronRight size={19} />
                </button>
                <span className={styles.startHint}>
                  Terbaik: {formatNumber(records.score)} · Terjauh: {formatNumber(records.distance)} m
                </span>
                <span className={styles.bankHint}>
                  Total {formatNumber(records.coins)} koin tersimpan di perangkat ini
                </span>
              </div>
            </div>
          )}
        </section>
      </div>

      <footer className={styles.footer}>
        <div className={styles.controls}>
          {["left", "brake", "right"].map((btn) => (
            <button
              key={btn}
              type="button"
              className={`${styles.controlButton} ${btn === "brake" ? styles.brakeButton : ""} ${
                btn === "brake" && isBraking ? styles.held : ""
              }`}
              disabled={!isInteractive}
              aria-label={btn === "brake" ? "Tahan untuk rem" : `Belok ${btn === "left" ? "kiri" : "kanan"}`}
              onPointerDown={(e) => {
                if (statusRef.current === "running") {
                  e.preventDefault();
                  e.currentTarget.setPointerCapture(e.pointerId);
                  inputRef.current.buttons.add(btn);
                  if (btn !== "brake") {
                    inputRef.current.targetX = null;
                  } else {
                    setIsBraking(true);
                  }
                }
              }}
              onPointerUp={() => releaseButton(btn)}
              onPointerCancel={() => releaseButton(btn)}
              onLostPointerCapture={() => releaseButton(btn)}
              onKeyDown={(e) => {
                if ([" ", "Enter"].includes(e.key) && statusRef.current === "running") {
                  e.preventDefault();
                  inputRef.current.buttons.add(btn);
                  if (btn === "brake") setIsBraking(true);
                }
              }}
              onKeyUp={(e) => {
                if ([" ", "Enter"].includes(e.key)) {
                  e.preventDefault();
                  releaseButton(btn);
                }
              }}
              onBlur={() => releaseButton(btn)}
            >
              {btn === "left" ? (
                <ArrowLeft size={20} />
              ) : btn === "right" ? (
                <ArrowRight size={20} />
              ) : (
                <>
                  <span className={styles.brakeMark} /> Tahan untuk Rem
                </>
              )}
            </button>
          ))}
        </div>

        <p>
          <span>Geser lereng untuk belok</span>
          <span className={styles.keyboardHint}>
            ← → belok <i /> Spasi rem <i /> P jeda
          </span>
        </p>
        <span className={styles.trailProgress}>
          {status === "running"
            ? nextStage
              ? `${Math.max(0, Math.ceil(nextStage.start - stats.distance))} m menuju ${nextStage.name}`
              : "Kamu mencapai puncak lereng tertinggi! Pertahankan kelancaranmu."
            : "Salju segar. Jalur baru di setiap luncuran."}
        </span>
      </footer>

      {helpOpen && (
        <div className={styles.overlay} onClick={() => closeHelp(false)} role="dialog" aria-modal="true" aria-labelledby="help-title">
          <div className={styles.helpDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.helpHeader}>
              <span className={styles.eyebrow}>PANDUAN LERENG GUNUNG</span>
              <button
                type="button"
                onClick={() => closeHelp(false)}
                aria-label="Tutup panduan"
                style={{ background: "none", border: 0, cursor: "pointer", color: "inherit", padding: 8 }}
              >
                <X size={20} />
              </button>
            </div>

            <h2 id="help-title" className={styles.helpTitle}>
              Temukan ritme lereng gunungmu.
            </h2>
            <p style={{ color: "#526d69", margin: "4px 0 16px", fontSize: 13 }}>
              Kontrol sederhana. Petualangan makin seru di setiap lereng.
            </p>

            <div className={styles.helpRows}>
              <p>
                <ArrowLeft size={20} />
                <span>
                  <b>Meliuk ke kiri dan kanan</b>
                  Sentuh dan geser ke mana saja di lereng, tahan tombol panah, atau tekan tombol ← → / A D. Gerakan kecil membuat belokan lebih halus.
                </span>
              </p>
              <p>
                <Pause size={20} />
                <span>
                  <b>Nikmati setiap momen</b>
                  Tahan tombol rem, Spasi, panah bawah, atau S untuk melambat. Tekan P atau Escape untuk menjeda kapan saja.
                </span>
              </p>
              <p>
                <Heart size={20} />
                <span>
                  <b>Tiga kesempatan menjelajah</b>
                  Benturan mengurangi satu hati. Kamu mendapatkan beberapa detik waktu aman untuk memulihkan posisi. Perisai melindungimu dari benturan.
                </span>
              </p>
              <p>
                <Flag size={20} />
                <span>
                  <b>Ikuti petunjuk lereng</b>
                  Koin membimbingmu melewati celah yang aman. Lewati gerbang slalom, mendekat ke rintangan, dan melompat di tanjakan untuk melipatgandakan skor Flow!
                </span>
              </p>
              <p>
                <MagnetIcon size={20} />
                <span>
                  <b>Bantuan ekstra di perjalanan</b>
                  Magnet menarik koin terdekat kepadamu secara otomatis. Rekor skor dan koin tersimpan aman di perangkat ini.
                </span>
              </p>
            </div>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => closeHelp(false)}
              style={{ marginTop: 20 }}
            >
              Saya Mengerti
              <Check size={18} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
