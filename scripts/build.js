#!/usr/bin/env node
/**
 * Smart build script:
 * - On Vercel (DATABASE_URL starts with "postgres") → swap schema to PostgreSQL
 * - Otherwise (local) → use SQLite as-is
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const schemaPath = path.join(__dirname, "../prisma/schema.prisma");
const original = fs.readFileSync(schemaPath, "utf8");

const dbUrl = process.env.DATABASE_URL || "";
const isPostgres = dbUrl.startsWith("postgres");

if (isPostgres) {
  console.log("🐘 PostgreSQL detected — patching Prisma schema for Vercel...");
  const patched = original
    .replace('provider = "sqlite"', 'provider = "postgresql"')
    // SQLite doesn't support @db. type hints, none exist in our schema so nothing to strip
    ;
  fs.writeFileSync(schemaPath, patched, "utf8");
}

try {
  if (isPostgres) {
    console.log("📦 Running prisma migrate deploy...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
  }
  console.log("🔧 Running prisma generate...");
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log("🏗️  Running next build...");
  execSync("next build", { stdio: "inherit" });
} finally {
  if (isPostgres) {
    // Restore original schema so git stays clean
    fs.writeFileSync(schemaPath, original, "utf8");
  }
}
