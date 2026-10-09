"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Volume2, VolumeX, RotateCcw } from "lucide-react";
import * as THREE from "three";
import { useLanguage } from "@/components/LanguageProvider";
import { autoRecordRoute } from "@/lib/activity-history";
import {
  playHorn,
  playEngineRev,
  playClatter,
  playChime,
  playPop,
  playBounce,
  playFanfare,
} from "@/lib/game-sound";
import styles from "./ToyCarGameClient.module.css";

const CAR_COLORS = [
  { name: "Merah", hex: 0xe17055 },
  { name: "Kuning", hex: 0xfdcb6e },
  { name: "Biru", hex: 0x0984e3 },
  { name: "Hijau", hex: 0x00b894 },
  { name: "Ungu", hex: 0x6c5ce7 },
];

export default function ToyCarGameClient() {
  const { language } = useLanguage();
  const containerRef = useRef(null);

  const [score, setScore] = useState(0);
  const [starsCollected, setStarsCollected] = useState(0);
  const [blocksToppled, setBlocksToppled] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [hornActive, setHornActive] = useState(false);

  const soundRef = useRef(true);
  soundRef.current = soundEnabled;

  const keyStateRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
  });

  const resetCarRef = useRef(null);
  const changeCarColorRef = useRef(null);
  const triggerHornRef = useRef(null);

  useEffect(() => {
    autoRecordRoute("/games/built/toy-car");
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdff9fb);
    scene.fog = new THREE.Fog(0xdff9fb, 45, 220);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 18, 26);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5ea, 0.9);
    dirLight.position.set(30, 45, 25);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 120;
    dirLight.shadow.camera.left = -40;
    dirLight.shadow.camera.right = 40;
    dirLight.shadow.camera.top = 40;
    dirLight.shadow.camera.bottom = -40;
    scene.add(dirLight);

    // --- Playground Floor & Bounds ---
    const floorGeom = new THREE.PlaneGeometry(120, 120);
    floorGeom.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0xbadc58 });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.receiveShadow = true;
    scene.add(floor);

    // Road Track inside arena
    const trackGeom = new THREE.RingGeometry(24, 46, 36);
    trackGeom.rotateX(-Math.PI / 2);
    const trackMat = new THREE.MeshLambertMaterial({ color: 0x636e72 });
    const track = new THREE.Mesh(trackGeom, trackMat);
    track.position.y = 0.02;
    track.receiveShadow = true;
    scene.add(track);

    // Arena Perimeter Curbs
    const curbMat1 = new THREE.MeshLambertMaterial({ color: 0xff7675 });
    const curbMat2 = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const curbGeom = new THREE.BoxGeometry(4, 1.2, 1.2);
    const curbGroup = new THREE.Group();

    for (let i = -58; i <= 58; i += 4) {
      // Top & Bottom
      const c1 = new THREE.Mesh(curbGeom, Math.abs(i) % 8 === 0 ? curbMat1 : curbMat2);
      c1.position.set(i, 0.6, -59);
      curbGroup.add(c1);

      const c2 = new THREE.Mesh(curbGeom, Math.abs(i) % 8 === 0 ? curbMat1 : curbMat2);
      c2.position.set(i, 0.6, 59);
      curbGroup.add(c2);

      // Left & Right
      const c3 = new THREE.Mesh(curbGeom, Math.abs(i) % 8 === 0 ? curbMat1 : curbMat2);
      c3.rotation.y = Math.PI / 2;
      c3.position.set(-59, 0.6, i);
      curbGroup.add(c3);

      const c4 = new THREE.Mesh(curbGeom, Math.abs(i) % 8 === 0 ? curbMat1 : curbMat2);
      c4.rotation.y = Math.PI / 2;
      c4.position.set(59, 0.6, i);
      curbGroup.add(c4);
    }
    scene.add(curbGroup);

    // --- Build Toy Car ---
    const car = new THREE.Group();
    car.position.set(0, 0.6, 32);

    const carBodyMat = new THREE.MeshPhongMaterial({
      color: CAR_COLORS[selectedColorIndex].hex,
      flatShading: true,
    });
    changeCarColorRef.current = (hex) => {
      carBodyMat.color.setHex(hex);
    };

    // Chassis Base
    const chassisGeom = new THREE.BoxGeometry(2.4, 0.8, 4.2);
    const chassis = new THREE.Mesh(chassisGeom, carBodyMat);
    chassis.position.y = 0.6;
    chassis.castShadow = true;
    car.add(chassis);

    // Cabin Roof
    const cabinGeom = new THREE.BoxGeometry(2.1, 0.9, 2.2);
    const cabinMat = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true });
    const cabin = new THREE.Mesh(cabinGeom, cabinMat);
    cabin.position.set(0, 1.45, -0.3);
    cabin.castShadow = true;
    car.add(cabin);

    // Windshield
    const windshieldGeom = new THREE.BoxGeometry(1.9, 0.7, 0.2);
    const windshieldMat = new THREE.MeshPhongMaterial({
      color: 0x74b9ff,
      transparent: true,
      opacity: 0.8,
    });
    const windshield = new THREE.Mesh(windshieldGeom, windshieldMat);
    windshield.position.set(0, 1.4, 0.82);
    car.add(windshield);

    // Headlights
    const lightGeom = new THREE.BoxGeometry(0.4, 0.3, 0.2);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfffa65 });
    const lightL = new THREE.Mesh(lightGeom, lightMat);
    lightL.position.set(-0.8, 0.7, 2.12);
    const lightR = lightL.clone();
    lightR.position.x = 0.8;
    car.add(lightL);
    car.add(lightR);

    // Antenna with bouncy star/ball
    const antennaStemGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6);
    const antennaStemMat = new THREE.MeshBasicMaterial({ color: 0x2d3436 });
    const antennaStem = new THREE.Mesh(antennaStemGeom, antennaStemMat);
    antennaStem.position.set(0.7, 2.2, -1.2);
    antennaStem.rotation.x = -0.15;
    car.add(antennaStem);

    const antennaBallGeom = new THREE.SphereGeometry(0.25, 8, 8);
    const antennaBallMat = new THREE.MeshPhongMaterial({ color: 0xffd32a, emissive: 0xf39c12 });
    const antennaBall = new THREE.Mesh(antennaBallGeom, antennaBallMat);
    antennaBall.position.set(0.7, 2.9, -1.35);
    car.add(antennaBall);

    // Wheels
    const wheelGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 12);
    wheelGeom.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x2d3436 });
    const hubcapGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.42, 8);
    hubcapGeom.rotateZ(Math.PI / 2);
    const hubcapMat = new THREE.MeshLambertMaterial({ color: 0xdfe6e9 });

    const createWheel = () => {
      const w = new THREE.Group();
      const tire = new THREE.Mesh(wheelGeom, wheelMat);
      tire.castShadow = true;
      const hub = new THREE.Mesh(hubcapGeom, hubcapMat);
      w.add(tire);
      w.add(hub);
      return w;
    };

    const wheelFL = createWheel();
    wheelFL.position.set(-1.25, 0.5, 1.4);
    const wheelFR = createWheel();
    wheelFR.position.set(1.25, 0.5, 1.4);
    const wheelRL = createWheel();
    wheelRL.position.set(-1.25, 0.5, -1.4);
    const wheelRR = createWheel();
    wheelRR.position.set(1.25, 0.5, -1.4);

    car.add(wheelFL);
    car.add(wheelFR);
    car.add(wheelRL);
    car.add(wheelRR);
    scene.add(car);

    // --- Interactive Playground Props ---
    // 1. Ramps
    const rampMat = new THREE.MeshLambertMaterial({ color: 0xfdcb6e });
    const createRamp = (x, z, rotY) => {
      const g = new THREE.Group();
      const geom = new THREE.BoxGeometry(6, 1.8, 8);
      geom.rotateX(Math.PI / 10);
      const mesh = new THREE.Mesh(geom, rampMat);
      mesh.position.y = 0.6;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      g.add(mesh);
      g.position.set(x, 0, z);
      g.rotation.y = rotY;
      scene.add(g);
      return { pos: new THREE.Vector2(x, z), rotY };
    };

    const ramps = [
      createRamp(0, 16, 0),
      createRamp(-25, -12, Math.PI / 4),
      createRamp(25, -12, -Math.PI / 4),
    ];

    // 2. Wooden Building Block Towers
    const blockMatColors = [0x00cec9, 0xff7675, 0xfdcb6e, 0x6c5ce7, 0x55efc4];
    const blockGeom = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const blockTowers = [];
    const towerCoords = [
      [-14, 18],
      [14, 18],
      [-22, -24],
      [22, -24],
      [0, -32],
    ];

    towerCoords.forEach(([tx, tz]) => {
      const towerBlocks = [];
      for (let y = 0; y < 4; y++) {
        for (let col = -1; col <= 1; col += 2) {
          const mat = new THREE.MeshLambertMaterial({
            color: blockMatColors[(y + Math.abs(col)) % blockMatColors.length],
          });
          const b = new THREE.Mesh(blockGeom, mat);
          b.position.set(tx + col * 0.65, 0.6 + y * 1.22, tz);
          b.castShadow = true;
          b.receiveShadow = true;
          scene.add(b);
          towerBlocks.push({
            mesh: b,
            vx: 0,
            vy: 0,
            vz: 0,
            rx: 0,
            rz: 0,
            settled: false,
          });
        }
      }
      blockTowers.push({ center: new THREE.Vector2(tx, tz), blocks: towerBlocks, toppled: false });
    });

    // 3. Shiny Golden Stars to Collect
    const starGeom = new THREE.DodecahedronGeometry(1.1, 0);
    const starMat = new THREE.MeshPhongMaterial({
      color: 0xffd32a,
      emissive: 0xf39c12,
      flatShading: true,
    });
    const starCoords = [
      [0, 16, 3.8], // on ramp
      [-25, -12, 3.8],
      [25, -12, 3.8],
      [0, 0, 1.5],
      [-16, 0, 1.5],
      [16, 0, 1.5],
      [-32, 24, 1.5],
      [32, 24, 1.5],
      [-32, -32, 1.5],
      [32, -32, 1.5],
    ];

    const stars = starCoords.map(([sx, sz, sy]) => {
      const mesh = new THREE.Mesh(starGeom, starMat);
      mesh.position.set(sx, sy, sz);
      mesh.castShadow = true;
      scene.add(mesh);
      return { mesh, active: true, basePos: new THREE.Vector3(sx, sy, sz) };
    });

    // 4. Balloons to Pop
    const balloonGeom = new THREE.SphereGeometry(1.2, 12, 12);
    balloonGeom.scale(1, 1.3, 1);
    const balloonMatColors = [0xff7675, 0x74b9ff, 0x55efc4, 0xfdcb6e, 0xa29bfe];
    const balloonCoords = [
      [-10, 8],
      [10, 8],
      [-18, -16],
      [18, -16],
      [0, 36],
      [-28, 32],
      [28, 32],
    ];

    const balloons = balloonCoords.map(([bx, bz], idx) => {
      const group = new THREE.Group();
      const mat = new THREE.MeshPhongMaterial({
        color: balloonMatColors[idx % balloonMatColors.length],
        shininess: 80,
      });
      const b = new THREE.Mesh(balloonGeom, mat);
      b.position.y = 2.4;
      b.castShadow = true;
      group.add(b);

      // String line
      const lineGeom = new THREE.CylinderGeometry(0.03, 0.03, 2.4);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0x636e72 });
      const line = new THREE.Mesh(lineGeom, lineMat);
      line.position.y = 1.2;
      group.add(line);

      group.position.set(bx, 0, bz);
      scene.add(group);
      return { group, balloonMesh: b, active: true, pos: new THREE.Vector2(bx, bz) };
    });

    // 5. Confetti Particles
    const confettiGeom = new THREE.BoxGeometry(0.3, 0.3, 0.05);
    const confettis = [];
    for (let i = 0; i < 40; i++) {
      const m = new THREE.Mesh(
        confettiGeom,
        new THREE.MeshBasicMaterial({ color: balloonMatColors[i % balloonMatColors.length] })
      );
      m.visible = false;
      scene.add(m);
      confettis.push({ mesh: m, vx: 0, vy: 0, vz: 0, life: 0 });
    }

    function emitConfetti(pos) {
      let count = 0;
      for (let i = 0; i < confettis.length; i++) {
        const c = confettis[i];
        if (c.life <= 0) {
          c.mesh.position.copy(pos);
          c.mesh.visible = true;
          c.life = 1;
          c.vx = (Math.random() - 0.5) * 0.4;
          c.vy = 0.2 + Math.random() * 0.4;
          c.vz = (Math.random() - 0.5) * 0.4;
          count++;
          if (count >= 14) break;
        }
      }
    }

    // --- Car Physics State ---
    const carPhysics = {
      x: 0,
      y: 0.6,
      z: 32,
      vy: 0,
      angle: Math.PI,
      speed: 0,
      maxSpeed: 0.6,
      accel: 0.018,
      decel: 0.96,
      steerAngle: 0,
      maxSteer: 0.5,
      isGrounded: true,
    };

    resetCarRef.current = () => {
      carPhysics.x = 0;
      carPhysics.y = 0.6;
      carPhysics.z = 32;
      carPhysics.vy = 0;
      carPhysics.speed = 0;
      carPhysics.angle = Math.PI;
      carPhysics.steerAngle = 0;
      car.rotation.set(0, carPhysics.angle, 0);
    };

    triggerHornRef.current = () => {
      setHornActive(true);
      setTimeout(() => setHornActive(false), 800);
      if (soundRef.current) playHorn();
    };

    // --- Keyboard Event Listeners ---
    const onKeyDown = (e) => {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") keyStateRef.current.forward = true;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") keyStateRef.current.backward = true;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keyStateRef.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keyStateRef.current.right = true;
      if (e.key === " " || e.key === "Spacebar") keyStateRef.current.brake = true;
      if (e.key === "h" || e.key === "H" || e.key === "b" || e.key === "B") {
        if (triggerHornRef.current) triggerHornRef.current();
      }
      if (e.key === "r" || e.key === "R") {
        if (resetCarRef.current) resetCarRef.current();
      }
    };

    const onKeyUp = (e) => {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") keyStateRef.current.forward = false;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") keyStateRef.current.backward = false;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keyStateRef.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keyStateRef.current.right = false;
      if (e.key === " " || e.key === "Spacebar") keyStateRef.current.brake = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const onResize = () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // --- Main Game Loop ---
    let reqId = null;
    let frameCount = 0;

    const animate = () => {
      frameCount++;
      const keys = keyStateRef.current;

      // Steering
      if (keys.left) {
        carPhysics.steerAngle = Math.min(carPhysics.maxSteer, carPhysics.steerAngle + 0.05);
      } else if (keys.right) {
        carPhysics.steerAngle = Math.max(-carPhysics.maxSteer, carPhysics.steerAngle - 0.05);
      } else {
        carPhysics.steerAngle *= 0.8;
      }

      // Acceleration / Reverse
      if (keys.forward) {
        carPhysics.speed = Math.min(carPhysics.maxSpeed, carPhysics.speed + carPhysics.accel);
        if (frameCount % 24 === 0 && soundRef.current) playEngineRev();
      } else if (keys.backward) {
        carPhysics.speed = Math.max(-carPhysics.maxSpeed * 0.5, carPhysics.speed - carPhysics.accel);
      } else {
        carPhysics.speed *= carPhysics.decel;
      }

      if (keys.brake) {
        carPhysics.speed *= 0.88;
      }

      // Update orientation
      if (Math.abs(carPhysics.speed) > 0.01) {
        const dir = carPhysics.speed > 0 ? 1 : -1;
        carPhysics.angle += carPhysics.steerAngle * 0.08 * dir;
      }

      // Move Position
      carPhysics.x += Math.sin(carPhysics.angle) * carPhysics.speed;
      carPhysics.z += Math.cos(carPhysics.angle) * carPhysics.speed;

      // Arena boundary limits
      carPhysics.x = Math.max(-56, Math.min(56, carPhysics.x));
      carPhysics.z = Math.max(-56, Math.min(56, carPhysics.z));

      // Gravity and Ramps
      let groundY = 0.6;
      ramps.forEach((r) => {
        const dx = carPhysics.x - r.pos.x;
        const dz = carPhysics.z - r.pos.y;
        if (Math.abs(dx) < 3.2 && Math.abs(dz) < 4.2) {
          const rampFraction = (dz + 4.2) / 8.4;
          groundY = Math.max(groundY, 0.6 + rampFraction * 2.2);
          if (carPhysics.speed > 0.35 && carPhysics.isGrounded) {
            carPhysics.vy = 0.32;
            carPhysics.isGrounded = false;
            if (soundRef.current) playBounce();
          }
        }
      });

      if (!carPhysics.isGrounded) {
        carPhysics.vy -= 0.016; // gravity
        carPhysics.y += carPhysics.vy;
        if (carPhysics.y <= groundY) {
          carPhysics.y = groundY;
          carPhysics.vy = 0;
          carPhysics.isGrounded = true;
        }
      } else {
        carPhysics.y = groundY;
      }

      // Apply to Three.js Object
      car.position.set(carPhysics.x, carPhysics.y, carPhysics.z);
      car.rotation.y = carPhysics.angle;

      // Wheel turn & roll
      wheelFL.rotation.y = carPhysics.steerAngle;
      wheelFR.rotation.y = carPhysics.steerAngle;
      const rollAmount = carPhysics.speed * 1.5;
      wheelFL.children[0].rotation.x += rollAmount;
      wheelFR.children[0].rotation.x += rollAmount;
      wheelRL.children[0].rotation.x += rollAmount;
      wheelRR.children[0].rotation.x += rollAmount;

      // Antenna wobble
      antennaStem.rotation.z = Math.sin(frameCount * 0.2) * 0.08 * (Math.abs(carPhysics.speed) + 0.1);

      // --- Collisions with Wooden Block Towers ---
      blockTowers.forEach((tower) => {
        const dist = tower.center.distanceTo(new THREE.Vector2(carPhysics.x, carPhysics.z));
        if (dist < 3.2 && Math.abs(carPhysics.speed) > 0.15) {
          if (!tower.toppled) {
            tower.toppled = true;
            setBlocksToppled((prev) => prev + 1);
            setScore((prev) => prev + 150);
            if (soundRef.current) playClatter();
          }
          tower.blocks.forEach((b) => {
            if (!b.settled) {
              b.vx = (Math.random() - 0.5) * carPhysics.speed * 2.2;
              b.vy = 0.15 + Math.random() * 0.2;
              b.vz = (Math.random() - 0.5) * carPhysics.speed * 2.2;
              b.rx = Math.random() * 0.1;
              b.rz = Math.random() * 0.1;
            }
          });
        }

        // Animate tumbling blocks
        tower.blocks.forEach((b) => {
          if (!b.settled && (Math.abs(b.vx) > 0.01 || Math.abs(b.vy) > 0.01 || Math.abs(b.vz) > 0.01)) {
            b.mesh.position.x += b.vx;
            b.mesh.position.y += b.vy;
            b.mesh.position.z += b.vz;
            b.vy -= 0.015; // gravity
            b.mesh.rotation.x += b.rx;
            b.mesh.rotation.z += b.rz;

            if (b.mesh.position.y <= 0.6) {
              b.mesh.position.y = 0.6;
              b.vx *= 0.6;
              b.vy = 0;
              b.vz *= 0.6;
              if (Math.abs(b.vx) < 0.01 && Math.abs(b.vz) < 0.01) {
                b.settled = true;
              }
            }
          }
        });
      });

      // --- Collect Stars ---
      stars.forEach((star) => {
        if (star.active) {
          star.mesh.rotation.y += 0.04;
          const dist = car.position.distanceTo(star.mesh.position);
          if (dist < 2.5) {
            star.active = false;
            star.mesh.visible = false;
            setStarsCollected((prev) => prev + 1);
            setScore((prev) => prev + 100);
            if (soundRef.current) playChime();
          }
        }
      });

      // --- Pop Balloons ---
      balloons.forEach((balloon) => {
        if (balloon.active) {
          const dist = balloon.pos.distanceTo(new THREE.Vector2(carPhysics.x, carPhysics.z));
          if (dist < 2.2) {
            balloon.active = false;
            balloon.group.visible = false;
            emitConfetti(new THREE.Vector3(balloon.pos.x, 2.4, balloon.pos.y));
            setScore((prev) => prev + 50);
            if (soundRef.current) playPop();
          }
        }
      });

      // --- Animate Confetti Particles ---
      confettis.forEach((c) => {
        if (c.life > 0) {
          c.life -= 0.02;
          c.mesh.position.x += c.vx;
          c.mesh.position.y += c.vy;
          c.mesh.position.z += c.vz;
          c.vy -= 0.008;
          c.mesh.rotation.x += 0.1;
          c.mesh.rotation.y += 0.1;
          if (c.life <= 0) c.mesh.visible = false;
        }
      });

      // Smooth Camera Follow
      const targetCamX = carPhysics.x - Math.sin(carPhysics.angle) * 16;
      const targetCamZ = carPhysics.z - Math.cos(carPhysics.angle) * 16;
      const targetCamY = carPhysics.y + 10;

      camera.position.x += (targetCamX - camera.position.x) * 0.08;
      camera.position.z += (targetCamZ - camera.position.z) * 0.08;
      camera.position.y += (targetCamY - camera.position.y) * 0.08;
      camera.lookAt(carPhysics.x, carPhysics.y + 1.2, carPhysics.z);

      renderer.render(scene, camera);
      reqId = requestAnimationFrame(animate);
    };

    reqId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const handleColorChange = (index) => {
    setSelectedColorIndex(index);
    if (changeCarColorRef.current) {
      changeCarColorRef.current(CAR_COLORS[index].hex);
    }
  };

  const handleResetCar = () => {
    if (resetCarRef.current) resetCarRef.current();
  };

  const handleHorn = () => {
    if (triggerHornRef.current) triggerHornRef.current();
  };

  // Touch control handlers for mobile
  const setKey = (key, val) => {
    keyStateRef.current[key] = val;
  };

  return (
    <div className={styles.container}>
      <div ref={containerRef} className={styles.canvasContainer} />

      {/* Header Overlay */}
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
              <span className={styles.statIcon}>🌟</span>
              <span className={styles.statValue}>{starsCollected}/10</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statIcon}>🧱</span>
              <span className={styles.statValue}>{blocksToppled}/5</span>
            </div>
          </div>
        </div>

        <div className={styles.headerRight}>
          {/* Car Color Picker */}
          <div className={styles.colorPicker}>
            {CAR_COLORS.map((c, i) => (
              <button
                key={c.name}
                onClick={() => handleColorChange(i)}
                className={`${styles.colorDot} ${selectedColorIndex === i ? styles.active : ""}`}
                style={{ backgroundColor: `#${c.hex.toString(16).padStart(6, "0")}` }}
                title={c.name}
                aria-label={c.name}
              />
            ))}
          </div>

          <button
            onClick={handleResetCar}
            className={`${styles.navButton} ${styles.iconButton}`}
            title="Reset Posisi Mobil"
            aria-label="Reset Posisi Mobil"
          >
            <RotateCcw size={18} />
          </button>

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

      {/* Hint Toast */}
      <div className={styles.instructionToast}>
        {hornActive
          ? "📯 TIN TIN! BEEP BEEP!"
          : language === "id"
          ? "🚗 Kendalikan mobil, tabrak balok kayu, kumpulkan bintang & pecahkan balon!"
          : "🚗 Drive around, topple blocks, collect stars & pop balloons!"}
      </div>

      {/* On-Screen Mobile Touch Controls */}
      <div className={styles.mobileControls}>
        {/* Left Side: Steering */}
        <div className={styles.steerPad}>
          <button
            onPointerDown={() => setKey("left", true)}
            onPointerUp={() => setKey("left", false)}
            onPointerLeave={() => setKey("left", false)}
            className={styles.touchButton}
            aria-label="Belok Kiri"
          >
            ⬅️
          </button>
          <button
            onPointerDown={() => setKey("right", true)}
            onPointerUp={() => setKey("right", false)}
            onPointerLeave={() => setKey("right", false)}
            className={styles.touchButton}
            aria-label="Belok Kanan"
          >
            ➡️
          </button>
        </div>

        {/* Center / Horn */}
        <button onClick={handleHorn} className={`${styles.touchButton} ${styles.hornButton}`} aria-label="Klakson">
          📯
        </button>

        {/* Right Side: Gas & Reverse */}
        <div className={styles.pedalPad}>
          <button
            onPointerDown={() => setKey("backward", true)}
            onPointerUp={() => setKey("backward", false)}
            onPointerLeave={() => setKey("backward", false)}
            className={`${styles.touchButton} ${styles.reverseButton}`}
            aria-label="Mundur"
          >
            🔙
          </button>
          <button
            onPointerDown={() => setKey("forward", true)}
            onPointerUp={() => setKey("forward", false)}
            onPointerLeave={() => setKey("forward", false)}
            className={`${styles.touchButton} ${styles.gasButton}`}
            aria-label="Maju"
          >
            🏎️
          </button>
        </div>
      </div>
    </div>
  );
}
