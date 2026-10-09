"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Volume2, VolumeX, RotateCcw, Trophy, Sparkles } from "lucide-react";
import * as THREE from "three";
import { useLanguage } from "@/components/LanguageProvider";
import { autoRecordRoute } from "@/lib/activity-history";
import { playChime, playBonk, playFanfare, playGentleOver } from "@/lib/game-sound";
import styles from "./AviatorGameClient.module.css";

const Colors = {
  red: 0xf25346,
  white: 0xd8d0d1,
  brown: 0x59332e,
  brownDark: 0x23190f,
  pink: 0xf5986e,
  yellow: 0xf4ce93,
  blue: 0x68c3c0,
  gold: 0xfbbf24,
  cloudWhite: 0xffffff,
  stormDark: 0x475569,
};

export default function AviatorGameClient() {
  const { language } = useLanguage();
  const containerRef = useRef(null);

  const [score, setScore] = useState(0);
  const [coinsCount, setCoinsCount] = useState(0);
  const [distance, setDistance] = useState(0);
  const [level, setLevel] = useState(1);
  const [energy, setEnergy] = useState(100);
  const [gameState, setGameState] = useState("playing"); // 'playing' | 'gameover'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highScore, setHighScore] = useState(0);
  const [levelUpMessage, setLevelUpMessage] = useState(null);

  const soundRef = useRef(true);
  soundRef.current = soundEnabled;

  const gameStateRef = useRef("playing");
  gameStateRef.current = gameState;

  // Sync high score
  useEffect(() => {
    autoRecordRoute("/games/built/the-aviator");
    try {
      const saved = localStorage.getItem("sena_aviator_high");
      if (saved) setHighScore(parseInt(saved, 10) || 0);
    } catch {}
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf7d9aa, 120, 1000);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 10000);
    camera.position.set(0, 100, 220);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- Lights ---
    const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);
    const ambientLight = new THREE.AmbientLight(0xdc8874, 0.55);
    const shadowLight = new THREE.DirectionalLight(0xffffff, 0.95);
    shadowLight.position.set(150, 350, 350);
    shadowLight.castShadow = true;
    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;
    shadowLight.shadow.mapSize.width = 1024;
    shadowLight.shadow.mapSize.height = 1024;

    scene.add(hemisphereLight);
    scene.add(ambientLight);
    scene.add(shadowLight);

    // --- Game Variables ---
    const game = {
      speed: 0.00035,
      baseSpeed: 0.00035,
      targetBaseSpeed: 0.00035,
      distance: 0,
      energy: 100,
      coins: 0,
      level: 1,
      planeDefaultHeight: 100,
      planeAmpHeight: 80,
      planeAmpWidth: 80,
      seaRadius: 600,
      seaLength: 800,
      planeFallSpeed: 0.001,
      lastCoinSpawn: 0,
      lastEnemySpawn: 0,
      lastLevelUpdate: 0,
    };

    let mousePos = { x: 0, y: 0 };

    // --- Pilot ---
    class Pilot {
      constructor() {
        this.mesh = new THREE.Group();
        this.angleHairs = 0;

        const bodyGeom = new THREE.BoxGeometry(15, 15, 15);
        const bodyMat = new THREE.MeshPhongMaterial({ color: Colors.brown, flatShading: true });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.set(2, -12, 0);
        this.mesh.add(body);

        const faceGeom = new THREE.BoxGeometry(10, 10, 10);
        const faceMat = new THREE.MeshLambertMaterial({ color: Colors.pink });
        const face = new THREE.Mesh(faceGeom, faceMat);
        this.mesh.add(face);

        const hairGeom = new THREE.BoxGeometry(4, 4, 4);
        hairGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 2, 0));
        const hairMat = new THREE.MeshLambertMaterial({ color: Colors.brown });

        this.hairsTop = new THREE.Group();
        for (let i = 0; i < 12; i++) {
          const h = new THREE.Mesh(hairGeom, hairMat);
          const col = i % 3;
          const row = Math.floor(i / 3);
          h.position.set(-4 + row * 4, 0, -4 + col * 4);
          this.hairsTop.add(h);
        }
        this.mesh.add(this.hairsTop);

        const glassGeom = new THREE.BoxGeometry(5, 5, 5);
        const glassMat = new THREE.MeshLambertMaterial({ color: Colors.brownDark });
        const glassR = new THREE.Mesh(glassGeom, glassMat);
        glassR.position.set(6, 0, 3);
        const glassL = glassR.clone();
        glassL.position.z = -3;
        this.mesh.add(glassR);
        this.mesh.add(glassL);
      }

      updateHairs(dt) {
        const hairs = this.hairsTop.children;
        for (let i = 0; i < hairs.length; i++) {
          hairs[i].scale.y = 0.75 + Math.cos(this.angleHairs + i / 3) * 0.25;
        }
        this.angleHairs += game.speed * dt * 45;
      }
    }

    // --- AirPlane ---
    class AirPlane {
      constructor() {
        this.mesh = new THREE.Group();

        // Fuselage (Cabin)
        const cabinGeom = new THREE.BoxGeometry(80, 50, 50);
        const pos = cabinGeom.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const z = pos.getZ(i);
          if (x < 0) {
            pos.setY(i, y * 0.65);
            pos.setZ(i, z * 0.45);
          }
        }
        pos.needsUpdate = true;
        cabinGeom.computeVertexNormals();

        const cabinMat = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true });
        const cabin = new THREE.Mesh(cabinGeom, cabinMat);
        cabin.castShadow = true;
        cabin.receiveShadow = true;
        this.mesh.add(cabin);

        // Engine Cowling
        const engineGeom = new THREE.BoxGeometry(20, 48, 48);
        const engineMat = new THREE.MeshPhongMaterial({ color: Colors.white, flatShading: true });
        const engine = new THREE.Mesh(engineGeom, engineMat);
        engine.position.x = 48;
        engine.castShadow = true;
        engine.receiveShadow = true;
        this.mesh.add(engine);

        // Tail Plane & Fin
        const tailGeom = new THREE.BoxGeometry(16, 20, 5);
        const tailMat = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true });
        const tail = new THREE.Mesh(tailGeom, tailMat);
        tail.position.set(-42, 22, 0);
        tail.castShadow = true;
        tail.receiveShadow = true;
        this.mesh.add(tail);

        const finGeom = new THREE.BoxGeometry(20, 5, 60);
        const finMat = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true });
        const fin = new THREE.Mesh(finGeom, finMat);
        fin.position.set(-38, 8, 0);
        fin.castShadow = true;
        fin.receiveShadow = true;
        this.mesh.add(fin);

        // Wings
        const wingGeom = new THREE.BoxGeometry(32, 6, 130);
        const wingMat = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true });
        const wing = new THREE.Mesh(wingGeom, wingMat);
        wing.position.set(2, 16, 0);
        wing.castShadow = true;
        wing.receiveShadow = true;
        this.mesh.add(wing);

        // Windshield
        const windshieldGeom = new THREE.BoxGeometry(4, 16, 22);
        const windshieldMat = new THREE.MeshPhongMaterial({
          color: Colors.white,
          transparent: true,
          opacity: 0.45,
          flatShading: true,
        });
        const windshield = new THREE.Mesh(windshieldGeom, windshieldMat);
        windshield.position.set(10, 27, 0);
        this.mesh.add(windshield);

        // Propeller
        const propGeom = new THREE.BoxGeometry(18, 10, 10);
        const propMat = new THREE.MeshPhongMaterial({ color: Colors.brown, flatShading: true });
        this.propeller = new THREE.Mesh(propGeom, propMat);
        this.propeller.castShadow = true;
        this.propeller.receiveShadow = true;

        const bladeGeom = new THREE.BoxGeometry(2, 85, 12);
        const bladeMat = new THREE.MeshPhongMaterial({ color: Colors.brownDark, flatShading: true });
        const blade1 = new THREE.Mesh(bladeGeom, bladeMat);
        blade1.position.set(8, 0, 0);
        blade1.castShadow = true;

        const blade2 = blade1.clone();
        blade2.rotation.x = Math.PI / 2;

        this.propeller.add(blade1);
        this.propeller.add(blade2);
        this.propeller.position.set(58, 0, 0);
        this.mesh.add(this.propeller);

        // Pilot
        this.pilot = new Pilot();
        this.pilot.mesh.position.set(-8, 27, 0);
        this.mesh.add(this.pilot.mesh);

        this.mesh.scale.set(0.28, 0.28, 0.28);
        this.mesh.position.y = game.planeDefaultHeight;
      }
    }

    // --- Sea ---
    class Sea {
      constructor() {
        const geom = new THREE.CylinderGeometry(game.seaRadius, game.seaRadius, game.seaLength, 40, 10);
        geom.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        const pos = geom.attributes.position;
        this.waves = [];
        for (let i = 0; i < pos.count; i++) {
          this.waves.push({
            origX: pos.getX(i),
            origY: pos.getY(i),
            ang: Math.random() * Math.PI * 2,
            amp: 4 + Math.random() * 12,
            speed: 0.001 + Math.random() * 0.002,
          });
        }

        const mat = new THREE.MeshPhongMaterial({
          color: Colors.blue,
          transparent: true,
          opacity: 0.85,
          flatShading: true,
        });

        this.mesh = new THREE.Mesh(geom, mat);
        this.mesh.receiveShadow = true;
        this.mesh.position.y = -game.seaRadius;
      }

      moveWaves(dt) {
        const pos = this.mesh.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const w = this.waves[i];
          pos.setX(i, w.origX + Math.cos(w.ang) * w.amp);
          pos.setY(i, w.origY + Math.sin(w.ang) * w.amp);
          w.ang += w.speed * dt;
        }
        pos.needsUpdate = true;
      }
    }

    // --- Cloud & Sky ---
    class Cloud {
      constructor() {
        this.mesh = new THREE.Group();
        const geom = new THREE.BoxGeometry(20, 20, 20);
        const mat = new THREE.MeshPhongMaterial({ color: Colors.cloudWhite, flatShading: true });

        const nBlocks = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < nBlocks; i++) {
          const m = new THREE.Mesh(geom, mat);
          m.position.x = i * 14;
          m.position.y = Math.random() * 10;
          m.position.z = Math.random() * 10;
          m.rotation.z = Math.random() * Math.PI * 2;
          m.rotation.y = Math.random() * Math.PI * 2;
          const s = 0.3 + Math.random() * 0.7;
          m.scale.set(s, s, s);
          m.castShadow = true;
          m.receiveShadow = true;
          this.mesh.add(m);
        }
      }

      rotate() {
        const children = this.mesh.children;
        for (let i = 0; i < children.length; i++) {
          children[i].rotation.z += 0.002;
          children[i].rotation.y += 0.001;
        }
      }
    }

    class Sky {
      constructor() {
        this.mesh = new THREE.Group();
        this.nClouds = 22;
        this.clouds = [];
        const step = (Math.PI * 2) / this.nClouds;
        for (let i = 0; i < this.nClouds; i++) {
          const c = new Cloud();
          this.clouds.push(c);
          const a = step * i;
          const h = game.seaRadius + 150 + Math.random() * 200;
          c.mesh.position.y = Math.sin(a) * h;
          c.mesh.position.x = Math.cos(a) * h;
          c.mesh.position.z = -250 - Math.random() * 450;
          c.mesh.rotation.z = a + Math.PI / 2;
          const s = 1 + Math.random() * 1.5;
          c.mesh.scale.set(s, s, s);
          this.mesh.add(c.mesh);
        }
        this.mesh.position.y = -game.seaRadius;
      }

      moveClouds(dt) {
        for (let i = 0; i < this.clouds.length; i++) {
          this.clouds[i].rotate();
        }
        this.mesh.rotation.z += game.speed * dt;
      }
    }

    // --- Coins (Golden Energy Stars) ---
    class Coin {
      constructor() {
        const geom = new THREE.DodecahedronGeometry(6, 0);
        const mat = new THREE.MeshPhongMaterial({
          color: Colors.gold,
          emissive: 0xd97706,
          shininess: 60,
          flatShading: true,
        });
        this.mesh = new THREE.Mesh(geom, mat);
        this.mesh.castShadow = true;
        this.angle = 0;
        this.distance = 0;
      }
    }

    // --- Storm Clouds (Obstacles) ---
    class StormObstacle {
      constructor() {
        this.mesh = new THREE.Group();
        const geom = new THREE.DodecahedronGeometry(10, 0);
        const mat = new THREE.MeshPhongMaterial({
          color: Colors.stormDark,
          flatShading: true,
        });
        const m1 = new THREE.Mesh(geom, mat);
        m1.castShadow = true;
        this.mesh.add(m1);

        const m2 = m1.clone();
        m2.position.set(7, 3, 2);
        m2.scale.set(0.7, 0.7, 0.7);
        this.mesh.add(m2);

        this.angle = 0;
        this.distance = 0;
      }
    }

    // --- Particles ---
    class Particle {
      constructor() {
        const geom = new THREE.TetrahedronGeometry(3, 0);
        const mat = new THREE.MeshPhongMaterial({
          color: Colors.gold,
          flatShading: true,
        });
        this.mesh = new THREE.Mesh(geom, mat);
        this.mesh.visible = false;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.life = 0;
      }
    }

    // Instances
    const airplane = new AirPlane();
    scene.add(airplane.mesh);

    const sea = new Sea();
    scene.add(sea.mesh);

    const sky = new Sky();
    scene.add(sky.mesh);

    const coinsHolder = new THREE.Group();
    scene.add(coinsHolder);
    const activeCoins = [];
    const coinsPool = [];

    const enemyHolder = new THREE.Group();
    scene.add(enemyHolder);
    const activeEnemies = [];
    const enemyPool = [];

    const particleHolder = new THREE.Group();
    scene.add(particleHolder);
    const particles = [];
    for (let i = 0; i < 40; i++) {
      const p = new Particle();
      particleHolder.add(p.mesh);
      particles.push(p);
    }

    function emitParticles(pos, color = Colors.gold, count = 12) {
      let spawned = 0;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.life <= 0) {
          p.mesh.position.copy(pos);
          p.mesh.material.color.setHex(color);
          p.mesh.visible = true;
          p.life = 1;
          p.vx = (Math.random() - 0.5) * 8;
          p.vy = (Math.random() - 0.5) * 8;
          p.vz = (Math.random() - 0.5) * 8;
          spawned++;
          if (spawned >= count) break;
        }
      }
    }

    function spawnCoinArc() {
      const n = 3 + Math.floor(Math.random() * 4);
      const baseDist = game.seaRadius + game.planeDefaultHeight + (Math.random() * 2 - 1) * 50;
      for (let i = 0; i < n; i++) {
        const c = coinsPool.pop() || new Coin();
        c.angle = -(i * 0.035);
        c.distance = baseDist + Math.sin(i * 0.6) * 16;
        c.mesh.position.y = -game.seaRadius + Math.sin(c.angle) * c.distance;
        c.mesh.position.x = Math.cos(c.angle) * c.distance;
        c.mesh.position.z = 0;
        coinsHolder.add(c.mesh);
        activeCoins.push(c);
      }
    }

    function spawnStormCloud() {
      const e = enemyPool.pop() || new StormObstacle();
      e.angle = -0.05;
      e.distance = game.seaRadius + game.planeDefaultHeight + (Math.random() * 2 - 1) * 55;
      e.mesh.position.y = -game.seaRadius + Math.sin(e.angle) * e.distance;
      e.mesh.position.x = Math.cos(e.angle) * e.distance;
      e.mesh.position.z = 0;
      enemyHolder.add(e.mesh);
      activeEnemies.push(e);
    }

    // --- Input Handlers ---
    const handlePointerMove = (e) => {
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0]?.clientX);
      const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0]?.clientY);
      if (clientX === undefined || clientY === undefined) return;
      const rect = container.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((clientY - rect.top) / rect.height) * 2 - 1);
      mousePos.x = Math.max(-1, Math.min(1, x));
      mousePos.y = Math.max(-1, Math.min(1, y));
    };

    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") mousePos.y = Math.min(1, mousePos.y + 0.35);
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") mousePos.y = Math.max(-1, mousePos.y - 0.35);
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") mousePos.x = Math.max(-1, mousePos.x - 0.35);
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") mousePos.x = Math.min(1, mousePos.x + 0.35);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    const handleResize = () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    // --- Animation Loop ---
    let reqId = null;
    let oldTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min(32, currentTime - oldTime);
      oldTime = currentTime;

      if (gameStateRef.current === "playing") {
        // Distance & Speed
        game.distance += game.speed * dt * 45;
        const distInt = Math.floor(game.distance);
        setDistance(distInt);

        // Energy consumption
        game.energy -= game.speed * dt * 2.2;
        game.energy = Math.max(0, game.energy);
        setEnergy(Math.round(game.energy));

        if (game.energy <= 0) {
          gameStateRef.current = "gameover";
          setGameState("gameover");
          if (soundRef.current) playGentleOver();
        }

        // Spawn Coins
        if (distInt - game.lastCoinSpawn >= 70) {
          game.lastCoinSpawn = distInt;
          spawnCoinArc();
        }

        // Spawn Storm Clouds
        if (distInt - game.lastEnemySpawn >= 85) {
          game.lastEnemySpawn = distInt;
          spawnStormCloud();
        }

        // Level Up
        if (distInt - game.lastLevelUpdate >= 400) {
          game.lastLevelUpdate = distInt;
          game.level++;
          setLevel(game.level);
          game.targetBaseSpeed = 0.00035 + game.level * 0.00008;
          setLevelUpMessage(`LEVEL ${game.level}! 🎉`);
          setTimeout(() => setLevelUpMessage(null), 2500);
          if (soundRef.current) playFanfare();
        }

        // Update Airplane Position & Tilt
        const targetY = game.planeDefaultHeight + mousePos.y * game.planeAmpHeight;
        const targetX = mousePos.x * game.planeAmpWidth * 0.8;

        airplane.mesh.position.y += (targetY - airplane.mesh.position.y) * 0.08;
        airplane.mesh.position.x += (targetX - airplane.mesh.position.x) * 0.08;

        // Dynamic banking
        airplane.mesh.rotation.z = (targetY - airplane.mesh.position.y) * 0.008;
        airplane.mesh.rotation.x = (airplane.mesh.position.y - targetY) * 0.004;

        airplane.pilot.updateHairs(dt);

        game.baseSpeed += (game.targetBaseSpeed - game.baseSpeed) * 0.02;
        game.speed = game.baseSpeed;
      } else if (gameStateRef.current === "gameover") {
        // Airplane gently spins down
        airplane.mesh.rotation.z += (-Math.PI / 2 - airplane.mesh.rotation.z) * 0.03;
        airplane.mesh.rotation.x += 0.02;
        game.planeFallSpeed *= 1.04;
        airplane.mesh.position.y -= game.planeFallSpeed * dt;
      }

      // Propeller spin
      airplane.propeller.rotation.x += 0.35 + game.speed * 15;

      // Rotate Sea & Waves
      sea.mesh.rotation.z += game.speed * dt;
      sea.moveWaves(dt);

      // Rotate Sky Clouds
      sky.moveClouds(dt);

      // Update Coins
      for (let i = activeCoins.length - 1; i >= 0; i--) {
        const c = activeCoins[i];
        c.angle += game.speed * dt * 0.55;
        c.mesh.position.y = -game.seaRadius + Math.sin(c.angle) * c.distance;
        c.mesh.position.x = Math.cos(c.angle) * c.distance;
        c.mesh.rotation.y += 0.05;
        c.mesh.rotation.z += 0.03;

        // Check collision
        const distToPlane = airplane.mesh.position.distanceTo(c.mesh.position);
        if (distToPlane < 26) {
          emitParticles(c.mesh.position, Colors.gold, 10);
          coinsHolder.remove(c.mesh);
          activeCoins.splice(i, 1);
          coinsPool.push(c);

          game.energy = Math.min(100, game.energy + 12);
          setEnergy(Math.round(game.energy));
          game.coins++;
          setCoinsCount(game.coins);
          const newScore = game.coins * 100 + Math.floor(game.distance);
          setScore(newScore);

          if (soundRef.current) playChime(game.coins % 7);
        } else if (c.angle > Math.PI * 0.4) {
          coinsHolder.remove(c.mesh);
          activeCoins.splice(i, 1);
          coinsPool.push(c);
        }
      }

      // Update Storm Clouds
      for (let i = activeEnemies.length - 1; i >= 0; i--) {
        const e = activeEnemies[i];
        e.angle += game.speed * dt * 0.55;
        e.mesh.position.y = -game.seaRadius + Math.sin(e.angle) * e.distance;
        e.mesh.position.x = Math.cos(e.angle) * e.distance;
        e.mesh.rotation.z += 0.015;

        // Check collision
        const distToPlane = airplane.mesh.position.distanceTo(e.mesh.position);
        if (distToPlane < 28) {
          emitParticles(e.mesh.position, Colors.stormDark, 14);
          enemyHolder.remove(e.mesh);
          activeEnemies.splice(i, 1);
          enemyPool.push(e);

          game.energy = Math.max(0, game.energy - 20);
          setEnergy(Math.round(game.energy));
          if (soundRef.current) playBonk();
        } else if (e.angle > Math.PI * 0.4) {
          enemyHolder.remove(e.mesh);
          activeEnemies.splice(i, 1);
          enemyPool.push(e);
        }
      }

      // Update Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.life > 0) {
          p.life -= 0.025;
          p.mesh.position.x += p.vx;
          p.mesh.position.y += p.vy;
          p.mesh.position.z += p.vz;
          p.mesh.scale.setScalar(Math.max(0.1, p.life));
          if (p.life <= 0) p.mesh.visible = false;
        }
      }

      renderer.render(scene, camera);
      reqId = requestAnimationFrame(loop);
    };

    reqId = requestAnimationFrame(loop);

    // Save highscore on finish
    const updateHighScore = () => {
      const finalScore = game.coins * 100 + Math.floor(game.distance);
      if (finalScore > highScore) {
        setHighScore(finalScore);
        try {
          localStorage.setItem("sena_aviator_high", String(finalScore));
        } catch {}
      }
    };

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      updateHighScore();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const handleRestart = () => {
    setScore(0);
    setCoinsCount(0);
    setDistance(0);
    setLevel(1);
    setEnergy(100);
    setGameState("playing");
    gameStateRef.current = "playing";
  };

  return (
    <div className={styles.container}>
      <div ref={containerRef} className={styles.canvasContainer} />

      {/* Header & HUD */}
      <div className={styles.headerOverlay}>
        <div className={styles.headerLeft}>
          <Link href="/games" className={styles.navButton}>
            <ArrowLeft size={18} />
            <span>{language === "id" ? "Kembali" : "Back"}</span>
          </Link>
          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <span className={styles.statIcon}>⭐</span>
              <span className={styles.statValue}>{score}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statIcon}>🪙</span>
              <span className={styles.statValue}>{coinsCount}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statIcon}>📏</span>
              <span className={styles.statValue}>{distance}m</span>
            </div>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.energyContainer}>
            <span style={{ fontSize: "1.1rem" }}>⚡</span>
            <div className={styles.energyTrack}>
              <div
                className={`${styles.energyFill} ${energy < 30 ? styles.low : ""}`}
                style={{ width: `${energy}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`${styles.navButton} ${styles.iconButton}`}
            title="Toggle Sound"
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>

      {/* Level Up Banner */}
      {levelUpMessage && <div className={styles.levelBanner}>{levelUpMessage}</div>}

      {/* Helpful Hint for kids */}
      <div className={styles.touchHint}>
        {language === "id"
          ? "✈️ Gerakkan kursor atau usap layar untuk terbang!"
          : "✈️ Move cursor or swipe screen to fly!"}
      </div>

      {/* Game Over Modal */}
      {gameState === "gameover" && (
        <div className={styles.modalOverlay}>
          <div className={styles.card}>
            <div style={{ fontSize: "3.5rem", marginBottom: "8px" }}>🛬</div>
            <h2 className={styles.cardTitle}>
              {language === "id" ? "Penerbangan Selesai!" : "Flight Completed!"}
            </h2>
            <p className={styles.cardDesc}>
              {language === "id"
                ? "Hebat sekali! Pesawat mendarat dengan aman."
                : "Great flying! The airplane has touched down safely."}
            </p>

            <div className={styles.scoreGrid}>
              <div className={styles.scoreBox}>
                <div className={styles.scoreBoxLabel}>
                  {language === "id" ? "Total Skor" : "Total Score"}
                </div>
                <div className={styles.scoreBoxValue}>{score}</div>
              </div>
              <div className={styles.scoreBox}>
                <div className={styles.scoreBoxLabel}>
                  {language === "id" ? "Koin Emas" : "Gold Coins"}
                </div>
                <div className={styles.scoreBoxValue}>{coinsCount}</div>
              </div>
              <div className={styles.scoreBox}>
                <div className={styles.scoreBoxLabel}>
                  {language === "id" ? "Jarak Terbang" : "Distance"}
                </div>
                <div className={styles.scoreBoxValue}>{distance}m</div>
              </div>
              <div className={styles.scoreBox}>
                <div className={styles.scoreBoxLabel}>
                  {language === "id" ? "Skor Terbaik" : "High Score"}
                </div>
                <div className={styles.scoreBoxValue}>{Math.max(score, highScore)}</div>
              </div>
            </div>

            <button onClick={handleRestart} className={styles.primaryButton}>
              <RotateCcw size={20} />
              <span>{language === "id" ? "Terbang Lagi!" : "Fly Again!"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
