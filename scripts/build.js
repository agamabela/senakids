#!/usr/bin/env node
/** Build application artifacts only. Schema changes and account provisioning
 * must be explicit maintenance operations, never deployment side effects. */
const { spawnSync } = require('node:child_process');
for (const args of [['prisma', 'generate'], ['next', 'build']]) {
  const result = spawnSync('npx', args, { stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
