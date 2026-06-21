#!/usr/bin/env node
/**
 * Smart build for Vercel (PostgreSQL) and local (SQLite).
 * On Vercel: patches schema, pushes DB, seeds admin, builds.
 * Locally: just generates client and builds.
 */
const { execSync, spawnSync } = require("child_process");
const fs   = require("fs");
const path = require("path");

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
  const result = spawnSync(cmd, { shell: true, stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`Command failed (exit ${result.status}): ${cmd}`);
  }
}

async function seedAdmin() {
  try {
    // Inline seed using pg directly — no Prisma client needed, avoids provider issues
    const { Client } = require("pg");
    const bcrypt = require("bcryptjs");

    const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    await client.connect();

    const hash = await bcrypt.hash("SenaKids2024!Secure", 10);
    const now  = new Date().toISOString();

    await client.query(`
      INSERT INTO "User" (name, email, password, role, "emailVerified", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE
        SET password = EXCLUDED.password,
            role     = EXCLUDED.role,
            "updatedAt" = EXCLUDED."updatedAt"
    `, ["Admin", "admin@senakids.com", hash, "admin", now, now, now]);

    await client.end();
    console.log("✅ Admin user seeded (admin@senakids.com)");
  } catch (err) {
    // Non-fatal — build should still succeed even if seed fails
    console.warn("⚠️  Seed warning (non-fatal):", err.message);
  }
}

(async () => {
  try {
    console.log("🔧 Running prisma generate...");
    run("npx prisma generate");

    if (isPostgres) {
      console.log("📦 Running prisma db push...");
      run("npx prisma db push --accept-data-loss --skip-generate");
      console.log("🌱 Seeding admin user...");
      await seedAdmin();
    }

    console.log("🏗️  Running next build...");
    run("next build");
  } finally {
    if (patched) {
      console.log("♻️  Restoring schema...");
      fs.writeFileSync(schemaPath, original, "utf8");
    }
  }
})();
