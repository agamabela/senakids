import fallbackBooks from "@/data/letsread_books.json";

const LETS_READ_API_URL =
  "https://letsreadasia.org/api/tag/books-with-tags?cursor=&limit=15&bookLimit=50&lId=6260074016145408";

let memoryCache = {
  timestamp: 0,
  data: null,
};

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function normalizeCoverUrl(url) {
  if (!url) return "";
  return url.replace(/^http:\/\//, "https://");
}

/**
 * Dynamically fetches books from Let's Read Asia, falling back
 * safely to preloaded curated JSON if the network is unavailable.
 */
export async function getLetsReadBooks() {
  const now = Date.now();
  if (memoryCache.data && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return memoryCache.data;
  }

  const bookMap = new Map();

  // Seed with fallback books first
  for (const fb of fallbackBooks) {
    bookMap.set(fb.id, {
      ...fb,
      cover: normalizeCoverUrl(fb.cover),
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(LETS_READ_API_URL, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return Array.from(bookMap.values());
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return Array.from(bookMap.values());
    }

    // Merge or add live books
    for (const item of data) {
      const tagName = item.tag?.name || "";
      for (const b of item.books || []) {
        const coverRaw = b.coverImageUrl || b.thumborCoverImageUrl || "";
        const cover = normalizeCoverUrl(coverRaw);
        if (!bookMap.has(b.id)) {
          bookMap.set(b.id, {
            id: b.id,
            title: b.name?.trim() || "",
            description: b.description?.trim() || "",
            cover,
            languageId: b.languageId || "6260074016145408",
            readUrl: `https://www.letsreadasia.org/read/${b.id}?bookLang=${b.languageId || "6260074016145408"}`,
            tags: tagName ? [tagName] : [],
            readingLevel: b.readingLevel || 1,
            isNew: true,
          });
        } else {
          const existing = bookMap.get(b.id);
          if (tagName && !existing.tags.includes(tagName)) {
            existing.tags.push(tagName);
          }
          if (cover && !existing.cover) {
            existing.cover = cover;
          }
        }
      }
    }

    const result = Array.from(bookMap.values());
    memoryCache = {
      timestamp: now,
      data: result,
    };
    return result;
  } catch (error) {
    return Array.from(bookMap.values());
  }
}
