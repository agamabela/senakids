"use client";

import { useEffect, useRef, useState } from "react";
import { Music, VolumeX } from "lucide-react";
import styles from "./AmbientSound.module.css";

// "Happy Music for Playtime ... 1 Hour Happy Upbeat Morning Music for Kids"
const VIDEO_ID = "Ks1FSy95sOA";
const VOLUME = 35;
const KEY = "senakids-ambience";

// Load the YouTube IFrame API once (shared promise).
let apiPromise = null;
function loadYouTubeAPI() {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if (typeof window === "undefined") return;
    if (window.YT && window.YT.Player) return resolve(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (typeof prev === "function") prev(); resolve(window.YT); };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  });
  return apiPromise;
}

/**
 * Looping kids background music for the whole app, played through a hidden
 * YouTube IFrame player. Browsers block audio autoplay, so it's controlled by
 * a floating toggle; the choice is remembered between visits.
 */
export default function AmbientSound() {
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);
  const playerRef = useRef(null);
  const hostRef = useRef(null);
  const onRef = useRef(false);
  onRef.current = on;

  // create the hidden player once
  useEffect(() => {
    let cancelled = false;
    loadYouTubeAPI().then((YT) => {
      if (cancelled || !YT || !hostRef.current || playerRef.current) return;
      playerRef.current = new YT.Player(hostRef.current, {
        height: "1",
        width: "1",
        videoId: VIDEO_ID,
        playerVars: {
          loop: 1,
          playlist: VIDEO_ID, // required for single-video loop
          controls: 0,
          disablekb: 1,
          playsinline: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (e) => {
            try { e.target.setVolume(VOLUME); } catch {}
            setReady(true);
            // restore saved preference (will start on first gesture if blocked)
            try { if (localStorage.getItem(KEY) === "on") setOn(true); } catch {}
          },
        },
      });
    });
    return () => { cancelled = true; };
  }, []);

  // play / pause when toggled (or once the player becomes ready)
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !ready) return undefined;
    try { localStorage.setItem(KEY, on ? "on" : "off"); } catch {}
    if (on) {
      try { p.setVolume(VOLUME); p.unMute && p.unMute(); p.playVideo(); } catch {}
      // if the browser blocked playback (no gesture yet), retry on first interaction
      const kick = () => {
        if (!onRef.current) return;
        try { p.unMute && p.unMute(); p.setVolume(VOLUME); p.playVideo(); } catch {}
        window.removeEventListener("pointerdown", kick);
        window.removeEventListener("keydown", kick);
      };
      window.addEventListener("pointerdown", kick);
      window.addEventListener("keydown", kick);
      return () => { window.removeEventListener("pointerdown", kick); window.removeEventListener("keydown", kick); };
    }
    try { p.pauseVideo(); } catch {}
    return undefined;
  }, [on, ready]);

  return (
    <>
      <div ref={hostRef} className={styles.player} aria-hidden />
      <button
        type="button"
        className={`${styles.toggle} ${on ? styles.on : ""}`}
        onClick={() => setOn((v) => !v)}
        aria-label={on ? "Matikan musik" : "Nyalakan musik"}
        title={on ? "Matikan musik latar" : "Nyalakan musik latar"}
      >
        {on ? <Music size={20} /> : <VolumeX size={20} />}
      </button>
    </>
  );
}
