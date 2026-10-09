import test from "node:test";
import assert from "node:assert/strict";
import {
  getHistory,
  addHistory,
  removeHistoryItem,
  clearHistory,
  autoRecordRoute,
} from "../src/lib/activity-history.js";

// Mock minimal browser environment for node test runner
class MockStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.window = {
  localStorage: new MockStorage(),
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
};

globalThis.document = {
  cookie: "",
};

test("Activity History: records and retrieves items with category filtering", () => {
  clearHistory("all");

  addHistory({
    id: "game-ski-free",
    type: "game",
    title: "Ski Free",
    href: "/games/ski-free",
    image: "/images/ski-pagi-key-art-v2.png",
  });

  addHistory({
    id: "book-kancil",
    type: "book",
    title: "Kancil dan Buaya",
    href: "/books/stories/kancil-dan-buaya",
    image: "https://storage.googleapis.com/lets-read-asia/assets/images/cover.png",
  });

  addHistory({
    id: "tv-nussa",
    type: "tv",
    title: "Nussa Vol 1",
    href: "/tv",
    image: "https://i.ytimg.com/vi/abc/hqdefault.jpg",
  });

  const all = getHistory("all");
  assert.equal(all.length, 3);
  assert.equal(all[0].id, "tv-nussa"); // most recent first

  const games = getHistory("game");
  assert.equal(games.length, 1);
  assert.equal(games[0].title, "Ski Free");

  const books = getHistory("book");
  assert.equal(books.length, 1);
  assert.equal(books[0].title, "Kancil dan Buaya");

  const tv = getHistory("tv");
  assert.equal(tv.length, 1);
  assert.equal(tv[0].title, "Nussa Vol 1");
});

test("Activity History: dedupes and moves re-opened items to top", () => {
  clearHistory("all");

  addHistory({ id: "g1", type: "game", title: "Game 1", href: "/g1" });
  addHistory({ id: "g2", type: "game", title: "Game 2", href: "/g2" });
  addHistory({ id: "g1", type: "game", title: "Game 1", href: "/g1" });

  const games = getHistory("game");
  assert.equal(games.length, 2);
  assert.equal(games[0].id, "g1"); // g1 moved to top
  assert.equal(games[1].id, "g2");
});

test("Activity History: removes specific item and syncs cookie", () => {
  clearHistory("all");

  addHistory({ id: "g1", type: "game", title: "Game 1", href: "/g1" });
  addHistory({ id: "g2", type: "game", title: "Game 2", href: "/g2" });

  removeHistoryItem("g1");
  const items = getHistory("all");
  assert.equal(items.length, 1);
  assert.equal(items[0].id, "g2");

  assert.ok(document.cookie.includes("senakids_history="));
});

test("Activity History: autoRecordRoute resolves built-in games and stories", () => {
  clearHistory("all");

  autoRecordRoute("/games/built/drum");
  autoRecordRoute("/games/maze");
  autoRecordRoute("/create");
  autoRecordRoute("/belajar-membaca");

  const items = getHistory("all");
  assert.equal(items.length, 4);

  const drum = items.find((i) => i.href === "/games/built/drum");
  assert.ok(drum);
  assert.equal(drum.title, "Drum");
  assert.equal(drum.type, "game");

  const maze = items.find((i) => i.href === "/games/maze");
  assert.ok(maze);
  assert.equal(maze.title, "Petualangan Labirin");

  const canvas = items.find((i) => i.href === "/create");
  assert.ok(canvas);
  assert.equal(canvas.title, "Kanvas Seni & Mewarnai");

  const reading = items.find((i) => i.href === "/belajar-membaca");
  assert.ok(reading);
  assert.equal(reading.title, "Belajar Membaca Fonik");
  assert.equal(reading.type, "book");
});
