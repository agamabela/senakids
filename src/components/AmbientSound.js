"use client";

import { useEffect, useRef, useState } from "react";
import { Music, VolumeX } from "lucide-react";
import styles from "./AmbientSound.module.css";

// "Happy Music for Playtime ... 1 Hour Happy Upbeat Morning Music for Kids"
const VIDEO_ID = "Ks1FSy95sOA";
const VOLUME = 35;
const KEY = "senakids-ambience";

let apiPromise = null;
function loadYouTubeAPI() {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if (typeof window === "undefined") return;
    if (window.YT && window.YT.Player) return resolve(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === "function") prev();
      resolve(window.YT);
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube-nocookie.com/iframe_api";
    document.body.appendChild(tag);
  });
  return apiPromise;
}

/**
 * Looping kids background music for the whole app.
 * Adheres to COPPA/GDPR-K child privacy:
 * - NEVER creates hidden YouTube iframe while music is off.
 * - Only initializes when user explicitly turns on the music.
 * - Respects parent "Quiet Mode" setting.
 */
export default function AmbientSound() {
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);
  const playerRef = useRef(null);
  const hostRef = useRef(null);
  const onRef = useRef(false);
  onRef.current = on;

  // Initialize YouTube player ONLY when user explicitly turns music on
  useEffect(() => {
    if (!on) {
      if (playerRef.current) {
        try {
          playerRef.current.pauseVideo();
        } catch {}
      }
      return;
    }

    let cancelled = false;

    // Check parent quiet mode
    try {
      if (localStorage.getItem("senakids_quiet_mode") === "true") {
        setOn(false);
        return;
      }
    } catch {}

    loadYouTubeAPI().then((YT) => {
      if (cancelled || !YT || !hostRef.current) return;

      if (!playerRef.current) {
        playerRef.current = new YT.Player(hostRef.current, {
          height: "1",
          width: "1",
          host: "https://www.youtube-nocookie.com",
          videoId: VIDEO_ID,
          playerVars: {
            loop: 1,
            playlist: VIDEO_ID,
            controls: 0,
            disablekb: 1,
            playsinline: 1,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: (e) => {
              if (cancelled) return;
              try {
                e.target.setVolume(VOLUME);
                e.target.unMute && e.target.unMute();
                e.target.playVideo();
              } catch {}
              setReady(true);
            },
          },
        });
      } else {
        try {
          playerRef.current.setVolume(VOLUME);
          playerRef.current.unMute && playerRef.current.unMute();
          playerRef.current.playVideo();
        } catch {}
      }
    });

    return () => {
      cancelled = true;
    };
  }, [on]);

  const toggleMusic = () => {
    const next = !on;
    setOn(next);
    try {
      localStorage.setItem(KEY, next ? "on" : "off");
    } catch {}
  };

  return (
    <>
      {/* Player host container is only mounted when music is turned on */}
      {on && <div ref={hostRef} className={styles.player} aria-hidden />}
      <button
        type="button"
        className={`${styles.toggle} ${on ? styles.on : ""}`}
        onClick={toggleMusic}
        aria-label={on ? "Matikan musik latar (Turn off ambient music)" : "Nyalakan musik latar (Turn on ambient music)"}
        title={on ? "Matikan musik latar" : "Nyalakan musik latar"}
      >
        {on ? <Music size={22} /> : <VolumeX size={22} />}
      </button>
    </>
  );
}
