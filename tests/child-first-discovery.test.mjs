import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

test("primary home and books actions use the design-system action text token", () => {
  const homeStyles = read("src/app/home/page.module.css");
  const booksStyles = read("src/app/books/page.module.css");

  assert.match(homeStyles, /\.heroCta\s*\{[^}]*color:\s*var\(--color-primary-text\)/s);
  assert.match(homeStyles, /\.creativeButton\s*\{[^}]*color:\s*var\(--color-create-text\)/s);
  assert.match(booksStyles, /\.readBtn\s*\{[^}]*color:\s*var\(--color-amber-text\)/s);
});

test("book portals clearly announce their external handoff", () => {
  const booksClient = read("src/app/books/BooksClient.js");

  assert.match(booksClient, /Buka situs lain/);
  assert.match(booksClient, /Opens an external site/);
});

test("books hero is visible before client motion can run", () => {
  const booksClient = read("src/app/books/BooksClient.js");

  assert.match(booksClient, /<motion\.section\s+className=\{styles\.heroSection\}\s+initial=\{false\}/s);
});

test("TV keeps its first choice set small and reveals the full channel list on request", () => {
  const tvClient = read("src/app/tv/TvClient.js");

  assert.match(tvClient, /const\s+\[showAllChannels,\s*setShowAllChannels\]\s*=\s*useState\(false\)/);
  assert.match(tvClient, /channelsList\.slice\(0,\s*9\)/);
  assert.match(tvClient, /Tampilkan semua channel/);
});

test("games opens with a small shelf and keeps long catalogues behind explicit controls", () => {
  const gamesClient = read("src/app/games/GamesClient.js");

  assert.match(gamesClient, /const\s+\[showAllSenaGames,\s*setShowAllSenaGames\]\s*=\s*useState\(false\)/);
  assert.match(gamesClient, /senaKidsGames\.slice\(0,\s*12\)/);
  assert.match(gamesClient, /toyTheaterGames\.slice\(0,\s*12\)/);
  assert.match(gamesClient, /Lihat lebih banyak permainan/);
});
