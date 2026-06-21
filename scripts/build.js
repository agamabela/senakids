#!/usr/bin/env node
/**
 * Build for Vercel (PostgreSQL). Database steps are non-fatal so a DB hiccup
 * never blocks the deploy — the app still builds and reports clearly at runtime.
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

process.env.PRISMA_HIDE_UPDATE_MESSAGE = "1";
process.env.CHECKPOINT_DISABLE = "1";

// Load .env manually (plain `node` doesn't do this automatically)
try {
  const envPath = path.join(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  }
} catch (e) {
  /* ignore */
}

const dbUrl = process.env.DATABASE_URL || "";
const hasDb = dbUrl.startsWith("postgres");

function run(cmd) {
  console.log("▶", cmd);
  const r = spawnSync(cmd, { shell: true, stdio: "inherit", env: process.env });
  if (r.status !== 0) throw new Error(`Command failed (exit ${r.status}): ${cmd}`);
}
function runSoft(cmd) {
  console.log("▶ (soft)", cmd);
  const r = spawnSync(cmd, { shell: true, stdio: "inherit", env: process.env });
  if (r.status !== 0) console.warn(`⚠️  Non-fatal: exited ${r.status}: ${cmd}`);
}

async function seedAdmin() {
  try {
    const { Client } = require("pg");
    const bcrypt = require("bcryptjs");
    const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    await client.connect();
    const hash = await bcrypt.hash("SenaKids2024!Secure", 10);
    const now = new Date().toISOString();
    await client.query(
      `INSERT INTO "User" (name, email, password, role, "emailVerified", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (email) DO UPDATE
         SET password = EXCLUDED.password, role = EXCLUDED.role, "updatedAt" = EXCLUDED."updatedAt"`,
      ["Admin", "admin@senakids.com", hash, "admin", now, now, now]
    );
    await client.end();
    console.log("✅ Admin seeded");
  } catch (e) {
    console.warn("⚠️  Seed warning (non-fatal):", e.message);
  }
}

(async () => {
  console.log("🔧 prisma generate...");
  run("npx prisma generate");

  if (hasDb) {
    console.log("📦 prisma db push...");
    runSoft("npx prisma db push --accept-data-loss --skip-generate");
    console.log("🌱 seeding admin...");
    await seedAdmin();
  } else {
    console.warn("⚠️  DATABASE_URL not set at build — skipping db push/seed.");
  }

  console.log("🏗️  next build...");
  run("next build");
})().catch((err) => {
  console.error("❌ Build failed:", err.message);
  process.exit(1);
});
