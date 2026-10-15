import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const routes = [
  "src/app/belajar-membaca/page.js",
  "src/app/books/page.js",
  "src/app/buku-cerita/page.js",
  "src/app/channels/page.js",
  "src/app/contact/page.js",
  "src/app/create/page.js",
  "src/app/games/page.js",
  "src/app/games/ski-free/page.js",
  "src/app/mengenal-hujan/page.js",
  "src/app/owly/page.js",
  "src/app/parents/page.js",
  "src/app/petualangan-tetes-air/page.js",
  "src/app/privacy/page.js",
  "src/app/sejarah-sepeda/page.js",
  "src/app/terms/page.js",
  "src/app/tv/page.js",
];

test("every static public route that overrides Open Graph metadata keeps the Sena Kids social image", () => {
  for (const route of routes) {
    const source = readFileSync(route, "utf8");
    assert.match(source, /import \{ socialImage \} from "@\/lib\/seo-metadata"/);
    assert.match(source, /openGraph:\s*\{[\s\S]*?images:\s*\[socialImage\]/);
  }
});
