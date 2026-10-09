import fallbackChannels from "@/data/channels.json";

const CABOCIL_CHANNELS_URL = "https://cabocil-api.cabocil.com/ytkidd/api/youtube_channels";

export async function getChannelsList() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(CABOCIL_CHANNELS_URL, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return fallbackChannels;

    const data = await res.json();
    const liveChannels = data.data || [];
    if (!Array.isArray(liveChannels) || liveChannels.length === 0) {
      return fallbackChannels;
    }

    // Merge live with fallback channels
    const channelMap = new Map();
    for (const c of fallbackChannels) {
      channelMap.set(c.id, c);
    }
    for (const c of liveChannels) {
      if (!channelMap.has(c.id)) {
        channelMap.set(c.id, c);
      }
    }

    const list = Array.from(channelMap.values());
    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  } catch (e) {
    return fallbackChannels;
  }
}
