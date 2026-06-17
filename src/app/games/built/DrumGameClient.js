"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./DrumGameClient.module.css";

const drumPads = [
  { key: "A", label: "Kick", sound: "kick", color: "#e53e3e", description: "Bass Drum" },
  { key: "S", label: "Snare", sound: "snare", color: "#dd6b20", description: "Backbeat" },
  { key: "D", label: "Hi-Hat", sound: "hihat", color: "#3182ce", description: "Closed" },
  { key: "F", label: "Open Hat", sound: "openhat", color: "#2f855a", description: "Sizzle" },
  { key: "J", label: "Low Tom", sound: "lowtom", color: "#805ad5", description: "Deep" },
  { key: "K", label: "High Tom", sound: "hightom", color: "#38b2ac", description: "Bright" },
  { key: "L", label: "Crash", sound: "crash", color: "#d69e2e", description: "Cymbal" },
  { key: ";", label: "Clap", sound: "clap", color: "#9f7aea", description: "Layer" },
];

function playDrumSound(audioCtx, type) {
  const now = audioCtx.currentTime;

  const gain = audioCtx.createGain();
  gain.connect(audioCtx.destination);

  if (type === "kick") {
    const osc = audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(0.001, now + 0.3);
    gain.gain.setValueAtTime(1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === "snare" || type === "clap") {
    const bufferSize = audioCtx.sampleRate * 0.2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const bandpass = audioCtx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = type === "snare" ? 1800 : 1200;
    const snareGain = audioCtx.createGain();
    snareGain.gain.setValueAtTime(1, now);
    snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    noise.connect(bandpass);
    bandpass.connect(snareGain);
    snareGain.connect(gain);
    noise.start(now);
    noise.stop(now + 0.2);

    if (type === "clap") {
      const osc = audioCtx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
      const oscGain = audioCtx.createGain();
      oscGain.gain.setValueAtTime(0.4, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } else if (type === "hihat" || type === "openhat") {
    const bufferSize = audioCtx.sampleRate * 0.05;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const highpass = audioCtx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 8000;
    const hatGain = audioCtx.createGain();
    hatGain.gain.setValueAtTime(type === "openhat" ? 0.6 : 0.3, now);
    hatGain.gain.exponentialRampToValueAtTime(0.001, now + (type === "openhat" ? 0.18 : 0.08));
    noise.connect(highpass);
    highpass.connect(hatGain);
    hatGain.connect(gain);
    noise.start(now);
    noise.stop(now + (type === "openhat" ? 0.18 : 0.08));
  } else {
    const osc = audioCtx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(type === "lowtom" ? 120 : 240, now);
    const tomGain = audioCtx.createGain();
    tomGain.gain.setValueAtTime(0.8, now);
    tomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(tomGain);
    tomGain.connect(gain);
    osc.start(now);
    osc.stop(now + 0.25);
  }
}

export default function DrumGameClient() {
  const [audioCtx, setAudioCtx] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const [started, setStarted] = useState(false);

  const getAudioContext = useCallback(() => {
    if (audioCtx) return audioCtx;
    if (typeof window === "undefined") return null;

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    setAudioCtx(ctx);
    return ctx;
  }, [audioCtx]);

  useEffect(() => {
    return () => {
      if (audioCtx && audioCtx.state !== "closed") {
        audioCtx.close();
      }
    };
  }, [audioCtx]);

  const playPad = useCallback(
    (sound) => {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      setStarted(true);
      playDrumSound(ctx, sound);
    },
    [getAudioContext]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleKeyDown = (event) => {
      const key = event.key.toUpperCase();
      const pad = drumPads.find((padItem) => padItem.key === key);
      if (pad) {
        event.preventDefault();
        setActiveKey(key);
        playPad(pad.sound);
      }
    };
    const handleKeyUp = (event) => {
      const key = event.key.toUpperCase();
      const pad = drumPads.find((padItem) => padItem.key === key);
      if (pad) {
        setActiveKey(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [playPad]);

  return (
    <div className={styles.drumGameWrapper}>
      <div className={styles.drumHeader}>
        <div>
          <h1>Drum</h1>
          <p>Tekan kunci A S D F J K L ; atau klik pad untuk memainkan suara drum.</p>
        </div>
        <div className={styles.playButton}>
          Free Play
        </div>
      </div>
      <div className={styles.padGrid}>
        {drumPads.map((pad) => (
          <button
            key={pad.key}
            type="button"
            onClick={() => {
              setActiveKey(pad.key);
              playPad(pad.sound);
              setTimeout(() => setActiveKey(null), 150);
            }}
            className={`${styles.padCard} ${activeKey === pad.key ? styles.padActive : ""}`}
            style={{ borderColor: pad.color }}
          >
            <div className={styles.padLabel}>{pad.label}</div>
            <div className={styles.padMeta}>{pad.description}</div>
            <div className={styles.padKey}>{pad.key}</div>
          </button>
        ))}
      </div>
      {!started && (
        <div className={styles.hintBox}>
          Click any pad or press a key to start the drum kit.
        </div>
      )}
    </div>
  );
}
