import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Ensure .env is loaded for tests running directly via node --test
if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf8");
      for (const line of envContent.split("\n")) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          let value = (match[2] || "").trim();
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
          if (!process.env[match[1]]) {
            process.env[match[1]] = value;
          }
        }
      }
    }
  } catch {}
}

const BASE_URL = "http://localhost:3000";

test("Hamburger menu markup and CSS accessibility checks", async () => {
  // Check MenuModal CSS animation declaration is valid
  const menuCss = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/MenuModal.module.css"),
    "utf8"
  );
  assert.ok(
    menuCss.includes("animation: slideIn var(--transition-instant) forwards;"),
    "MenuModal animation must be valid without extra cubic-bezier/ease"
  );
  assert.ok(
    !menuCss.includes("var(--transition-instant) cubic-bezier"),
    "MenuModal must not append cubic-bezier to var(--transition-instant)"
  );

  // Check Navbar CSS has no redundant ease after var(--transition-instant)
  const navbarCss = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/Navbar.module.css"),
    "utf8"
  );
  assert.ok(
    !navbarCss.includes("var(--transition-instant) ease"),
    "Navbar CSS must not append ease after var(--transition-instant)"
  );

  // Fetch /home and inspect menu trigger button attributes
  const res = await fetch(`${BASE_URL}/home`);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(
    html,
    /id="site-menu-trigger"/,
    "Menu trigger button should have id='site-menu-trigger'"
  );
  assert.match(
    html,
    /aria-controls="site-menu-dialog"/,
    "Menu trigger must have aria-controls='site-menu-dialog'"
  );
  assert.match(
    html,
    /aria-expanded="false"/,
    "Menu trigger must have aria-expanded attribute"
  );
});

test("Contact API validates inputs, enforces honeypot, and persists safely without pollution", async () => {
  // 1. Missing name (non-persistent)
  const resEmptyName = await fetch(`${BASE_URL}/api/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": `198.51.100.${Math.floor(Math.random() * 200) + 1}`,
    },
    body: JSON.stringify({
      name: "",
      email: "parent@example.com",
      category: "broken",
      message: "Konten video tidak dapat dimainkan",
    }),
  });
  assert.equal(resEmptyName.status, 400);
  const err1 = await resEmptyName.json();
  assert.match(err1.error, /Nama wajib diisi/i);

  // 2. Invalid category (non-persistent)
  const resBadCat = await fetch(`${BASE_URL}/api/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": `198.51.100.${Math.floor(Math.random() * 200) + 1}`,
    },
    body: JSON.stringify({
      name: "Budi",
      email: "budi@example.com",
      category: "invalid_category",
      message: "Konten video tidak dapat dimainkan",
    }),
  });
  assert.equal(resBadCat.status, 400);

  // 3. Honeypot traps bots (non-persistent)
  const resBot = await fetch(`${BASE_URL}/api/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": `198.51.100.${Math.floor(Math.random() * 200) + 1}`,
    },
    body: JSON.stringify({
      name: "Bot",
      email: "bot@example.com",
      category: "broken",
      message: "Hello world spambot",
      website: "http://spam.org",
    }),
  });
  assert.equal(resBot.status, 400);
  const botData = await resBot.json();
  assert.match(botData.error, /Spam detected/i);

  // 4. Production database hard guard: refuse write tests if targeting production
  const dbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || "";
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.IS_PRODUCTION === "true" ||
    dbUrl.toLowerCase().includes("-production") ||
    dbUrl.toLowerCase().includes("/prod");

  if (isProduction && !process.env.TEST_DATABASE_URL) {
    throw new Error(
      "SAFETY GUARD TRIGGERED: Write tests are blocked from executing against production databases. Please configure TEST_DATABASE_URL."
    );
  }

  // 5. Successful persistent submission using uniquely identifiable test fixture
  // Guaranteed cleanup in finally block so zero fake records remain in database
  const fixtureTag = `[TEST_FIXTURE_${Date.now()}]`;
  const fixtureEmail = `test-audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@senakids.test`;
  const testClientIp = `198.51.100.${Math.floor(Math.random() * 200) + 1}`;

  let createdId = null;
  try {
    const resValid = await fetch(`${BASE_URL}/api/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": testClientIp,
      },
      body: JSON.stringify({
        name: `${fixtureTag} Ibu Rahma`,
        email: fixtureEmail,
        category: "data",
        message: "Mohon hapus akun dan data kami sesuai ketentuan privasi.",
      }),
    });
    assert.equal(resValid.status, 201);
    const validData = await resValid.json();
    assert.equal(validData.success, true);
    assert.ok(validData.id > 0);
    createdId = validData.id;
  } finally {
    if (createdId) {
      const { PrismaClient } = await import("@prisma/client");
      const testPrisma = new PrismaClient({
        datasources: {
          db: {
            url: dbUrl,
          },
        },
        log: ["error"],
      });
      try {
        await testPrisma.contactReport.deleteMany({
          where: { id: createdId },
        });
        const { getDerivedRateLimitKey } = await import("../src/lib/rate-limiter.js");
        const key = getDerivedRateLimitKey("contact", testClientIp);
        await testPrisma.rateLimit.deleteMany({
          where: { key },
        });
      } finally {
        await testPrisma.$disconnect();
      }
    }
  }
});

test("Canonical URLs are self-referencing and never inherit /home globally", async () => {
  const routesToCheck = [
    { path: "/home", expected: "https://senakids.web.id/home" },
    { path: "/books", expected: "https://senakids.web.id/books" },
    { path: "/buku-cerita", expected: "https://senakids.web.id/buku-cerita" },
    { path: "/tv", expected: "https://senakids.web.id/tv" },
    { path: "/games", expected: "https://senakids.web.id/games" },
    { path: "/create", expected: "https://senakids.web.id/create" },
    { path: "/owly", expected: "https://senakids.web.id/owly" },
    { path: "/belajar-membaca", expected: "https://senakids.web.id/belajar-membaca" },
    { path: "/sejarah-sepeda", expected: "https://senakids.web.id/sejarah-sepeda" },
    { path: "/petualangan-tetes-air", expected: "https://senakids.web.id/petualangan-tetes-air" },
    { path: "/mengenal-hujan", expected: "https://senakids.web.id/mengenal-hujan" },
    { path: "/parents", expected: "https://senakids.web.id/parents" },
    { path: "/privacy", expected: "https://senakids.web.id/privacy" },
    { path: "/terms", expected: "https://senakids.web.id/terms" },
    { path: "/contact", expected: "https://senakids.web.id/contact" },
  ];

  for (const item of routesToCheck) {
    const res = await fetch(`${BASE_URL}${item.path}`);
    assert.equal(res.status, 200, `Route ${item.path} should return 200`);
    const html = await res.text();
    const canonicalMatch = html.match(/<link[^>]+rel="canonical"[^>]*href="([^"]+)"/i) ||
                           html.match(/<link[^>]*href="([^"]+)"[^>]+rel="canonical"/i);
    assert.ok(canonicalMatch, `Route ${item.path} must have a canonical tag`);
    assert.equal(
      canonicalMatch[1],
      item.expected,
      `Canonical on ${item.path} should be ${item.expected}, got ${canonicalMatch[1]}`
    );
  }
});

test("Page titles avoid duplicated branding template", async () => {
  const pages = ["/home", "/books", "/tv", "/games", "/privacy", "/terms", "/contact"];
  for (const page of pages) {
    const res = await fetch(`${BASE_URL}${page}`);
    assert.equal(res.status, 200);
    const html = await res.text();
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    assert.ok(titleMatch, `Title missing on ${page}`);
    const occurrences = (titleMatch[1].match(/Sena Kids/g) || []).length;
    assert.ok(
      occurrences <= 2,
      `Title on ${page} has duplicated brand name: "${titleMatch[1]}"`
    );
    assert.ok(
      !titleMatch[1].includes("Sena Kids | Sena Kids"),
      `Title on ${page} has doubled branding: "${titleMatch[1]}"`
    );
  }
});

test("Every public route has exactly one H1 tag", async () => {
  const routes = [
    "/home",
    "/books",
    "/buku-cerita",
    "/tv",
    "/games",
    "/create",
    "/owly",
    "/belajar-membaca",
    "/sejarah-sepeda",
    "/petualangan-tetes-air",
    "/mengenal-hujan",
    "/parents",
    "/privacy",
    "/terms",
    "/contact",
  ];

  for (const r of routes) {
    const res = await fetch(`${BASE_URL}${r}`);
    assert.equal(res.status, 200);
    const html = await res.text();
    const h1Count = (html.match(/<h1[\s\S]*?<\/h1>/gi) || []).length;
    assert.equal(h1Count, 1, `Route ${r} must have exactly one H1 tag, found ${h1Count}`);
  }
});

test("Books and TV filters expose accessible aria-pressed state", async () => {
  const resBooks = await fetch(`${BASE_URL}/books`);
  const htmlBooks = await resBooks.text();
  assert.match(
    htmlBooks,
    /aria-pressed="true"/,
    "Active book filter button must have aria-pressed='true'"
  );

  const resTv = await fetch(`${BASE_URL}/tv`);
  const htmlTv = await resTv.text();
  assert.match(
    htmlTv,
    /aria-pressed="true"/,
    "Active TV channel button must have aria-pressed='true'"
  );
});

test("Sitemap.xml contains public site URLs with stable lastModified", async () => {
  const res = await fetch(`${BASE_URL}/sitemap.xml`);
  assert.equal(res.status, 200);
  const xml = await res.text();

  assert.ok(!xml.includes("localhost"), "Sitemap must not contain localhost URLs");
  assert.ok(xml.includes("https://senakids.web.id/home"), "Sitemap must contain public home URL");
  assert.ok(xml.includes("<lastmod>2026-10-01"), "Sitemap must contain stable release date");
});
