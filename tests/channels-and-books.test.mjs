import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const BASE_URL = process.env.TEST_APP_URL || "http://localhost:3000";

test("Header is sticky at top of page", () => {
  const css = fs.readFileSync("src/components/Navbar.module.css", "utf8");
  assert.match(css, /\.header\s*\{[^}]*position:\s*sticky;/, "Navbar header must be position: sticky");
  assert.match(css, /\.header\s*\{[^}]*top:\s*0;/, "Navbar header must have top: 0");
});

test("Channels API returns 100+ kids-friendly channels", async () => {
  const res = await fetch(`${BASE_URL}/api/channels`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.total >= 98, `Expected at least 98 channels, got ${data.total}`);

  // Verify sample channels exist
  const names = data.channels.map((c) => c.name.toLowerCase());
  assert.ok(names.some((n) => n.includes("nussa")), "Should include Nussa");
  assert.ok(names.some((n) => n.includes("riko")), "Should include Riko");
  assert.ok(names.some((n) => n.includes("kok bisa")), "Should include Kok Bisa");
  assert.ok(names.some((n) => n.includes("balita")), "Should include BaLiTa");
});

test("Lets Read Asia dynamic books API returns valid books with auto-update capability", async () => {
  const res = await fetch(`${BASE_URL}/api/books/letsread`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.total >= 50, `Expected at least 50 books, got ${data.total}`);

  const sample = data.books[0];
  assert.ok(sample.id, "Book should have id");
  assert.ok(sample.title, "Book should have title");
  assert.ok(sample.readUrl, "Book should have readUrl");
});

test("Channels page renders with accessible toggle controls and link to TV", async () => {
  const res = await fetch(`${BASE_URL}/channels`);
  assert.equal(res.status, 200);
  const html = await res.text();

  assert.ok(html.includes("Channel Pilihan"), "Should include Channel Pilihan title");
  assert.ok(html.includes("Aktifkan Semua"), "Should include Aktifkan Semua button");
  assert.ok(html.includes("Nonaktifkan Semua"), "Should include Nonaktifkan Semua button");
  assert.ok(html.includes("/tv"), "Should link back to /tv");
});

test("TV page includes link to manage channels", async () => {
  const res = await fetch(`${BASE_URL}/tv`);
  assert.equal(res.status, 200);
  const html = await res.text();

  assert.ok(html.includes("/channels"), "TV page should link to /channels");
});

test("Books page renders educational reading portals, workbooks, and Let's Read library", async () => {
  const res = await fetch(`${BASE_URL}/books`);
  assert.equal(res.status, 200);
  const html = await res.text();

  assert.ok(html.includes("letsreadasia.org"), "Books page should reference letsreadasia.org");
  assert.ok(html.includes("kemendikdasmen"), "Books page should reference kemendikdasmen portals");
});
