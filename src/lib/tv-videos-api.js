import { CURATED_TV_VIDEOS } from "@/lib/content-registry";
import extraVideos from "@/data/tv_videos.json";

export async function getAllTvVideos() {
  const videoMap = new Map();

  // 1. Add curated Sena videos first
  for (const v of CURATED_TV_VIDEOS) {
    videoMap.set(v.youtubeId || v.url || v.id, v);
  }

  // 2. Add extra verified videos
  for (const v of (extraVideos || [])) {
    const key = v.youtubeId || v.url || v.id;
    if (!videoMap.has(key)) {
      videoMap.set(key, v);
    }
  }

  return Array.from(videoMap.values());
}
