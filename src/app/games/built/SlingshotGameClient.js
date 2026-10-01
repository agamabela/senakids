"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SlingshotGameClient.module.css";

const WIDTH = 960;
const HEIGHT = 540;
const LEVELS = [
  { birds: 4, pigs: [{ x: 735, y: 395 }, { x: 825, y: 395 }], blocks: [{ x: 690, y: 420, w: 150, h: 18 }, { x: 770, y: 360, w: 18, h: 75 }] },
  { birds: 5, pigs: [{ x: 740, y: 395 }, { x: 830, y: 335 }, { x: 830, y: 455 }], blocks: [{ x: 690, y: 420, w: 150, h: 18 }, { x: 735, y: 365, w: 18, h: 70 }, { x: 805, y: 365, w: 18, h: 70 }, { x: 770, y: 300, w: 150, h: 18 }] },
  { birds: 6, pigs: [{ x: 720, y: 450 }, { x: 800, y: 375 }, { x: 875, y: 300 }], blocks: [{ x: 670, y: 475, w: 260, h: 18 }, { x: 700, y: 410, w: 18, h: 70 }, { x: 860, y: 410, w: 18, h: 70 }, { x: 740, y: 345, w: 100, h: 18 }, { x: 780, y: 280, w: 18, h: 70 }, { x: 820, y: 215, w: 100, h: 18 }] },
];

function cloneLevel(index) {
  const level = LEVELS[index];
  return { birdsLeft: level.birds, pigs: level.pigs.map(pig => ({ ...pig, hit: false })), blocks: level.blocks.map(block => ({ ...block, broken: false })) };
}

export default function SlingshotGameClient() {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const [levelIndex, setLevelIndex] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [score, setScore] = useState(0);
  const [angle, setAngle] = useState(28);
  const [power, setPower] = useState(80);
  const [message, setMessage] = useState("Pull back the bird, then let go");
  const settingsRef = useRef({ angle, power });
  settingsRef.current = { angle, power };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const game = { ...cloneLevel(levelIndex), bird: null, aiming: false, dragging: false, lastTime: performance.now() };
    gameRef.current = game;
    let frame;

    const point = event => {
      const rect = canvas.getBoundingClientRect();
      return { x: (event.clientX - rect.left) * WIDTH / rect.width, y: (event.clientY - rect.top) * HEIGHT / rect.height };
    };
    const startBird = () => ({ x: 170, y: 410, vx: 0, vy: 0, radius: 19, flying: false });
    game.bird = startBird();
    game.launch = (launchAngle = angle, launchPower = power) => {
      if (!game.bird || game.bird.flying || game.birdsLeft < 1) return;
      const radians = launchAngle * Math.PI / 180;
      const speed = launchPower * 7.5;
      game.bird.flying = true;
      game.bird.vx = Math.cos(radians) * speed;
      game.bird.vy = -Math.sin(radians) * speed;
      setMessage("Bird in flight");
    };

    const draw = () => {
      context.clearRect(0, 0, WIDTH, HEIGHT);
      const sky = context.createLinearGradient(0, 0, 0, HEIGHT);
      sky.addColorStop(0, "#b9e7ff"); sky.addColorStop(1, "#f8e8bf");
      context.fillStyle = sky; context.fillRect(0, 0, WIDTH, HEIGHT);
      context.fillStyle = "#8acb70"; context.fillRect(0, 490, WIDTH, 50);
      context.fillStyle = "#72a958"; context.fillRect(0, 490, WIDTH, 7);
      context.fillStyle = "#875638"; context.fillRect(145, 395, 16, 100); context.fillRect(205, 395, 16, 100);
      context.strokeStyle = "#5c3829"; context.lineWidth = 9; context.beginPath(); context.moveTo(153, 407); context.lineTo(184, 450); context.lineTo(213, 407); context.stroke();

      game.blocks.forEach(block => { if (!block.broken) { context.fillStyle = "#c9824b"; context.fillRect(block.x, block.y, block.w, block.h); context.strokeStyle = "#8e542f"; context.strokeRect(block.x, block.y, block.w, block.h); } });
      game.pigs.forEach(pig => { if (!pig.hit) { context.fillStyle = "#76b852"; context.beginPath(); context.arc(pig.x, pig.y, 23, 0, Math.PI * 2); context.fill(); context.fillStyle = "#213d27"; context.beginPath(); context.arc(pig.x - 8, pig.y - 5, 3, 0, Math.PI * 2); context.arc(pig.x + 8, pig.y - 5, 3, 0, Math.PI * 2); context.fill(); context.strokeStyle = "#3d7132"; context.stroke(); } });
      const bird = game.bird;
      if (bird) { context.fillStyle = "#db4d3f"; context.beginPath(); context.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2); context.fill(); context.fillStyle = "#fff4df"; context.beginPath(); context.arc(bird.x + 7, bird.y - 6, 6, 0, Math.PI * 2); context.fill(); context.fillStyle = "#222"; context.beginPath(); context.arc(bird.x + 9, bird.y - 6, 2.5, 0, Math.PI * 2); context.fill(); }
      if (game.dragging && bird) { context.setLineDash([8, 7]); context.strokeStyle = "rgba(60,50,40,.55)"; context.lineWidth = 3; context.beginPath(); context.moveTo(bird.x, bird.y); context.lineTo(170, 410); context.stroke(); context.setLineDash([]); }
      context.fillStyle = "rgba(255,255,255,.75)"; context.fillRect(20, 20, 190, 58); context.fillStyle = "#243342"; context.font = "700 18px system-ui"; context.fillText(`LEVEL ${levelIndex + 1}`, 36, 46); context.font = "14px system-ui"; context.fillText(`Birds left: ${game.birdsLeft}`, 36, 67);
      frame = requestAnimationFrame(tick);
    };

    const tick = now => {
      const dt = Math.min((now - game.lastTime) / 1000, 0.033); game.lastTime = now;
      if (game.bird?.flying) {
        const bird = game.bird; bird.vy += 460 * dt; bird.x += bird.vx * dt; bird.y += bird.vy * dt;
        game.blocks.forEach(block => { if (!block.broken && bird.x + bird.radius > block.x && bird.x - bird.radius < block.x + block.w && bird.y + bird.radius > block.y && bird.y - bird.radius < block.y + block.h && Math.hypot(bird.vx, bird.vy) > 180) { block.broken = true; setScore(value => value + 50); } });
        game.pigs.forEach(pig => { if (!pig.hit && Math.hypot(bird.x - pig.x, bird.y - pig.y) < bird.radius + 23) { pig.hit = true; setScore(value => value + 500); } });
        if (bird.y > HEIGHT + 60 || bird.x > WIDTH + 60 || Math.hypot(bird.vx, bird.vy) < 35 && bird.y > 450) { game.birdsLeft -= 1; if (game.pigs.every(pig => pig.hit)) setMessage("Nice shot! Choose the next level"); else if (game.birdsLeft > 0) { game.bird = startBird(); setMessage("Pull back the next bird"); } else setMessage("Out of birds. Press restart to try again"); }
      }
      draw();
    };
    const down = event => { if (!game.bird || game.bird.flying || game.birdsLeft < 1) return; const cursor = point(event); if (Math.hypot(cursor.x - game.bird.x, cursor.y - game.bird.y) < 42) { game.dragging = true; canvas.setPointerCapture(event.pointerId); } };
    const move = event => { if (!game.dragging) return; const cursor = point(event); const dx = cursor.x - 170; const dy = cursor.y - 410; const length = Math.min(Math.hypot(dx, dy), 105); const angle = Math.atan2(dy, dx); game.bird.x = 170 + Math.cos(angle) * length; game.bird.y = 410 + Math.sin(angle) * length; };
    const up = () => { if (!game.dragging) return; game.dragging = false; game.bird.flying = true; game.bird.vx = (170 - game.bird.x) * 6.2; game.bird.vy = (410 - game.bird.y) * 6.2; setMessage("Bird in flight"); };
    const keydown = event => { if (event.code === "Space") { event.preventDefault(); game.launch(settingsRef.current.angle, settingsRef.current.power); } };
    canvas.addEventListener("pointerdown", down); canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up); window.addEventListener("keydown", keydown); frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); canvas.removeEventListener("pointerdown", down); canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerup", up); canvas.removeEventListener("pointercancel", up); window.removeEventListener("keydown", keydown); };
  }, [levelIndex, gameKey]);

  const restart = () => { setGameKey(key => key + 1); setScore(0); setMessage("Pull back the bird, then let go"); };
  const changeLevel = index => { setLevelIndex(index); setScore(0); setMessage("Pull back the bird, then let go"); };
  const launch = () => gameRef.current?.launch?.(angle, power);
  return <div className={styles.wrapper}>
    <header className={styles.header}><div><p className={styles.kicker}>SENA KIDS ARCADE</p><h1>Bird Launch</h1><p>Use angle and force to knock down the targets. A small physics playground inspired by classic slingshot games.</p></div><div className={styles.score}><span>Score</span><strong>{score}</strong></div></header>
    <div className={styles.stage}><canvas ref={canvasRef} width={WIDTH} height={HEIGHT} aria-label="Bird Launch game canvas" /></div>
    <div className={styles.aimPanel}>
      <label>Angle <strong>{angle}°</strong><input type="range" min="15" max="70" value={angle} onChange={event => setAngle(Number(event.target.value))} /></label>
      <label>Power <strong>{power}%</strong><input type="range" min="45" max="100" value={power} onChange={event => setPower(Number(event.target.value))} /></label>
      <button type="button" className={styles.launchButton} onClick={launch}>Launch bird</button>
    </div>
    <div className={styles.controls}><span>{message}. Drag the bird or press Space to launch.</span><button type="button" onClick={restart}>Restart</button><div className={styles.levels}>{LEVELS.map((_, index) => <button key={index} type="button" className={index === levelIndex ? styles.active : ""} onClick={() => changeLevel(index)}>Level {index + 1}</button>)}</div></div>
  </div>;
}
