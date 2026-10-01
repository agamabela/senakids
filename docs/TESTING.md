# Testing & Test Database Documentation

## Overview

The Sena Kids test suite validates security, content registry, translations, responsive markup, accessibility, and backend APIs. Automated write tests are strictly isolated to prevent pollution of development, staging, or production databases.

## Test Database Configuration

### Isolated Test Database (`TEST_DATABASE_URL`)
To run database write tests against a completely separate database, set `TEST_DATABASE_URL`:

```bash
export TEST_DATABASE_URL="postgresql://user:password@localhost:5432/senakids_test"
```

When `TEST_DATABASE_URL` is configured, tests connect directly to this database instead of `DATABASE_URL`.

### Production Hard Guard
Automated tests include a hard guard in `tests/audit-verification.test.mjs` that checks target database strings and environment variables (`NODE_ENV === "production"`, `IS_PRODUCTION === "true"`, or production database hostnames).

If a production environment is detected and `TEST_DATABASE_URL` is not explicitly provided, write tests abort immediately with an error:
```
SAFETY GUARD TRIGGERED: Write tests are blocked from executing against production databases. Please configure TEST_DATABASE_URL.
```

### Ephemeral Test Fixture Isolation
When running in non-production development environments where `DATABASE_URL` is shared:
- Every write test generates a unique, identifiable fixture tag (e.g. `[TEST_FIXTURE_<timestamp>]` and `test-audit-<timestamp>@senakids.test`).
- The test persists the record to verify the full HTTP 201 response and database insertion.
- The test cleans up the created fixture record and associated rate limit records in a guaranteed `finally` block.
- Zero fake records remain in the database upon test completion.
- Validation tests (missing required fields, malformed categories) and honeypot bot trap tests are completely non-persistent and never generate database writes.

## Cleaning Audit Test Records

If any test fixtures need to be verified or cleaned up manually, use the safe cleanup script:

```bash
node --env-file=.env scripts/clean-audit-records.mjs
```

This script only matches explicitly recognized audit test identifiers (`rahma@example.com`, `budi@example.com`, `@senakids.test`, or `[TEST_FIXTURE`). Real user submissions are never deleted.

## Running Tests

Run the full test suite:
```bash
node --test tests/*.test.mjs
```

Run specific test suites:
```bash
node --test tests/audit-verification.test.mjs
node --test tests/contact-rate-limiter.test.mjs
```
