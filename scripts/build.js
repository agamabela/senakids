#!/usr/bin/env node
/**
 * Build script that handles both local (SQLite) and Vercel (PostgreSQL).
 * Uses prisma db push instead of migrate deploy to avoid lock-file provider mismatches.
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const schemaPath = path.join(__dirname, "../prisma/schema.prisma");
const original = fs.readFileSync(schemaPath, "utf8");

const dbUrl = process.env.DATABASE_URL || "";
const isPostgres = dbUrl.startsWith("postgres");

let patched = false;
if (isPostgres) {
  console.log("🐘 PostgreSQL detected — patching Prisma schema...");
  const updated = original.replace('provider = "sqlite"', 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, updated, "utf8");
  patched = true;
}

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

try {
  console.log("🔧 Running prisma generate...");
  run("npx prisma generate");

  if (isPostgres) {
    console.log("📦 Running prisma db push (schema sync)...");
    run("npx prisma db push --accept-data-loss --skip-generate");
    console.log("🌱 Seeding admin user...");
    // Re-generate client after db push so seed script uses the correct provider
    run("npx prisma generate");
    run("node prisma/seed-admin.js");
  }

  console.log("🏗️  Running next build...");
  run("next build");
} finally {
  if (patched) {
    console.log("♻️  Restoring original schema...");
    fs.writeFileSync(schemaPath, original, "utf8");
  }
}
