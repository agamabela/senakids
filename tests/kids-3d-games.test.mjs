import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { autoRecordRoute, clearHistory, getHistory } from "../src/lib/activity-history.js";

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

test("Patel230 Kids 3D Games: Details and metadata registration", () => {
  const pageSrc = fs.readFileSync("src/app/games/built/[slug]/page.js", "utf8");
  const gamesSrc = fs.readFileSync("src/app/games/GamesClient.js", "utf8");

  // Removed old ugly games check
  const removedSlugs = ["tower-blocks", "fruit-catcher", "whack-3d", "lane-runner"];
  removedSlugs.forEach((slug) => {
    assert.ok(!pageSrc.includes(`"${slug}":`), `Old game ${slug} must NOT be in [slug]/page.js`);
    assert.ok(!gamesSrc.includes(`/games/built/${slug}`), `Old game ${slug} must NOT be in GamesClient catalog`);
  });

  // Verify new kids 3D games are registered
  const newSlugs = ["the-aviator", "toy-car"];
  newSlugs.forEach((slug) => {
    assert.ok(pageSrc.includes(`"${slug}":`), `New game ${slug} must be registered in [slug]/page.js`);
    assert.ok(gamesSrc.includes(`/games/built/${slug}`), `New game ${slug} must be in GamesClient catalog`);
  });
});

test("Patel230 Kids 3D Games: Component files and assets exist", () => {
  assert.ok(fs.existsSync("src/app/games/built/AviatorGameClient.js"), "AviatorGameClient.js must exist");
  assert.ok(fs.existsSync("src/app/games/built/AviatorGameClient.module.css"), "Aviator CSS must exist");
  assert.ok(fs.existsSync("src/app/games/built/ToyCarGameClient.js"), "ToyCarGameClient.js must exist");
  assert.ok(fs.existsSync("src/app/games/built/ToyCarGameClient.module.css"), "ToyCar CSS must exist");
  assert.ok(fs.existsSync("public/images/games/thumbnails/the-aviator-3d.svg"), "The Aviator thumbnail SVG must exist");
  assert.ok(fs.existsSync("public/images/games/thumbnails/toy-car-3d.svg"), "Toy Car thumbnail SVG must exist");

  // Ensure old files are gone
  assert.ok(!fs.existsSync("src/app/games/built/TowerBlocksGameClient.js"));
  assert.ok(!fs.existsSync("src/app/games/built/FruitCatcherGameClient.js"));
  assert.ok(!fs.existsSync("src/app/games/built/Whack3DGameClient.js"));
  assert.ok(!fs.existsSync("src/app/games/built/LaneRunnerGameClient.js"));
});

test("Patel230 Kids 3D Games: Auto record route properly tracks history", () => {
  clearHistory("all");

  autoRecordRoute("/games/built/the-aviator");
  autoRecordRoute("/games/built/toy-car");

  const items = getHistory("game");
  assert.equal(items.length, 2);

  const aviator = items.find((i) => i.href === "/games/built/the-aviator");
  assert.ok(aviator);
  assert.equal(aviator.title, "Pesawat Cilik 3D");

  const car = items.find((i) => i.href === "/games/built/toy-car");
  assert.ok(car);
  assert.equal(car.title, "Mobil Mainan 3D");
});
