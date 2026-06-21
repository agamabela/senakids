#!/usr/bin/env node
/**
 * Smart build for Vercel (PostgreSQL) and local (SQLite).
 * Database steps are non-fatal so a DB hiccup never blocks the deploy.
 */
const { spawnSync } = require("child_process");
const fs   = require("fs");
const path = require("path");

// Quiet Prisma's update banner + telemetry during CI builds
process.env.PRISMA_HIDE_UPDATE_MESSAGE = "1";
process.env.CHECKPOINT_DISABLE = "1";

const schemaPath = path.join(__dirname, "../prisma/schema.prisma");
const original   = fs.readFileSync(schemaPath, "utf8");

const dbUrl      = process.env.DATABASE_URL || "";
const isPostgres = dbUrl.startsWith("postgres");

let patched = false;
if (isPostgres) {
  console.log("🐘 PostgreSQL detected — patching Prisma schema...");
  const updated = original.replace('provider = "sqlite"', 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, updated, "utf8");
  patched = true;
}

function run(cmd) {
  console.log("▶", cmd);
  const result = spawnSync(cmd, { shell: true, stdio: "inherit", env: process.env });
  if (result.status !== 0) {
    throw new Error(`Command failed (exit ${result.status}): ${cmd}`);
  }
}

// Non-fatal variant: logs a warning but lets the build continue
function runSoft(cmd) {
  console.log("▶ (soft)", cmd);
  const result = spawnSync(cmd, { shell: true, stdio: "inherit", env: process.env });
  if (result.status !== 0) {
    console.warn(`⚠️  Non-fatal: command exited ${result.status}: ${cmd}`);
    return false;
  }
  return true;
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
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO UPDATE
         SET password = EXCLUDED.password, role = EXCLUDED.role, "updatedAt" = EXCLUDED."updatedAt"`,
      ["Admin", "admin@senakids.com", hash, "admin", now, now, now]
    );
    await client.end();
    console.log("✅ Admin user seeded (admin@senakids.com)");
  } catch (err) {
    console.warn("⚠️  Seed warning (non-fatal):", err.message);
  }
}

(async () => {
  try {
    // prisma generate MUST succeed — the app imports the client
    console.log("🔧 prisma generate...");
    run("npx prisma generate");

    if (isPostgres) {
      console.log("📦 prisma db push...");
      runSoft("npx prisma db push --accept-data-loss --skip-generate");
      console.log("🌱 seeding admin...");
      await seedAdmin();
    }

    console.log("🏗️  next build...");
    run("next build");
  } finally {
    if (patched) {
      console.log("♻️  restoring schema...");
      fs.writeFileSync(schemaPath, original, "utf8");
    }
  }
})().catch((err) => {
  console.error("❌ Build failed:", err.message);
  // restore schema before exiting
  if (patched) fs.writeFileSync(schemaPath, original, "utf8");
  process.exit(1);
});
