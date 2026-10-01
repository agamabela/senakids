import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import {
  getDerivedRateLimitKey,
  checkRateLimit,
  incrementRateLimit,
  cleanupExpiredRateLimits,
  RATE_LIMIT_WINDOW_MS,
} from "../src/lib/rate-limiter.js";

const prisma = new PrismaClient({ log: ["error"] });

test.after(async () => {
  // Clean up any test keys created during this test
  await prisma.rateLimit.deleteMany({
    where: {
      key: {
        contains: "test-unit",
      },
    },
  });
  await prisma.$disconnect();
});

test("Rate limiter: hashes identifier using HMAC-SHA256 and never exposes raw IP", () => {
  const ip1 = "203.0.113.10";
  const ip2 = "203.0.113.11";
  const key1 = getDerivedRateLimitKey("test-unit", ip1, "secret-key-1");
  const key1Same = getDerivedRateLimitKey("test-unit", ip1, "secret-key-1");
  const key2 = getDerivedRateLimitKey("test-unit", ip2, "secret-key-1");
  const keyDifferentSecret = getDerivedRateLimitKey("test-unit", ip1, "secret-key-2");

  assert.equal(key1, key1Same, "Identical inputs must yield identical hash");
  assert.notEqual(key1, key2, "Different IPs must yield different keys");
  assert.notEqual(key1, keyDifferentSecret, "Different secrets must yield different keys");
  assert.ok(!key1.includes(ip1), "Derived key must never expose the raw IP");
  assert.equal(key1.length, 64, "SHA-256 HMAC must be 64 hex characters");
});

test("Rate limiter: allows requests under quota and enforces limit when exceeded", async () => {
  const testKey = `test-unit-quota-${Date.now()}`;
  const maxRequests = 3;

  try {
    // 1. Initial state: not limited
    const initial = await checkRateLimit(testKey, { maxRequests, prismaClient: prisma });
    assert.equal(initial.allowed, true);
    assert.equal(initial.count, 0);

    // 2. Increment requests up to limit
    for (let i = 1; i <= maxRequests; i++) {
      await incrementRateLimit(testKey, { windowMs: 60000, prismaClient: prisma });
      const status = await checkRateLimit(testKey, { maxRequests, prismaClient: prisma });
      if (i < maxRequests) {
        assert.equal(status.allowed, true, `Request ${i} should be allowed`);
        assert.equal(status.count, i);
      } else {
        // At maxRequests, next request should be blocked
        assert.equal(status.allowed, false, `Limit of ${maxRequests} reached`);
        assert.equal(status.remaining, 0);
        assert.ok(status.retryAfterSeconds > 0);
      }
    }

    // 3. Exceeded check
    const blocked = await checkRateLimit(testKey, { maxRequests, prismaClient: prisma });
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.remaining, 0);
  } finally {
    await prisma.rateLimit.deleteMany({ where: { key: testKey } });
  }
});

test("Rate limiter: window expiry resets quota and allows new requests", async () => {
  const expiredKey = `test-unit-expired-${Date.now()}`;

  try {
    // Insert an already-expired record
    await prisma.rateLimit.create({
      data: {
        key: expiredKey,
        count: 5,
        expiresAt: new Date(Date.now() - 5000), // Expired 5 seconds ago
      },
    });

    const status = await checkRateLimit(expiredKey, { maxRequests: 3, prismaClient: prisma });
    assert.equal(status.allowed, true, "Expired record must allow new requests");

    // Incrementing expired record refreshes the window
    await incrementRateLimit(expiredKey, { windowMs: 60000, prismaClient: prisma });
    const refreshed = await prisma.rateLimit.findUnique({ where: { key: expiredKey } });
    assert.equal(refreshed.count, 1, "Counter resets to 1 on refreshed window");
    assert.ok(refreshed.expiresAt > new Date(), "New expiresAt must be in the future");
  } finally {
    await prisma.rateLimit.deleteMany({ where: { key: expiredKey } });
  }
});

test("Rate limiter: independent clients have completely isolated quotas", async () => {
  const clientAKey = `test-unit-client-a-${Date.now()}`;
  const clientBKey = `test-unit-client-b-${Date.now()}`;
  const maxRequests = 2;

  try {
    // Fill client A's quota
    await incrementRateLimit(clientAKey, { windowMs: 60000, prismaClient: prisma });
    await incrementRateLimit(clientAKey, { windowMs: 60000, prismaClient: prisma });

    const statusA = await checkRateLimit(clientAKey, { maxRequests, prismaClient: prisma });
    assert.equal(statusA.allowed, false, "Client A must be limited");

    // Client B has made 0 requests and must be allowed
    const statusB = await checkRateLimit(clientBKey, { maxRequests, prismaClient: prisma });
    assert.equal(statusB.allowed, true, "Client B must not be affected by Client A");
    assert.equal(statusB.count, 0);
    assert.equal(statusB.remaining, maxRequests);
  } finally {
    await prisma.rateLimit.deleteMany({
      where: { key: { in: [clientAKey, clientBKey] } },
    });
  }
});

test("Rate limiter: cleanup removes expired records but retains active records", async () => {
  const expiredKey = `test-unit-cleanup-exp-${Date.now()}`;
  const activeKey = `test-unit-cleanup-act-${Date.now()}`;

  try {
    await prisma.rateLimit.createMany({
      data: [
        {
          key: expiredKey,
          count: 3,
          expiresAt: new Date(Date.now() - 10000), // Expired
        },
        {
          key: activeKey,
          count: 1,
          expiresAt: new Date(Date.now() + 60000), // Active
        },
      ],
    });

    const deletedCount = await cleanupExpiredRateLimits(prisma);
    assert.ok(deletedCount >= 1, "Must delete at least the expired test record");

    const activeRecord = await prisma.rateLimit.findUnique({ where: { key: activeKey } });
    assert.ok(activeRecord, "Active record must be preserved");

    const expiredRecord = await prisma.rateLimit.findUnique({ where: { key: expiredKey } });
    assert.equal(expiredRecord, null, "Expired record must be deleted");
  } finally {
    await prisma.rateLimit.deleteMany({
      where: { key: { in: [expiredKey, activeKey] } },
    });
  }
});

test("Contact API: HTTP route enforces 429 with bilingual messages and ignores malformed requests", async () => {
  const testIp = `198.51.100.${Math.floor(Math.random() * 200) + 1}`;
  const testKey = getDerivedRateLimitKey("contact", testIp);
  const createdIds = [];

  try {
    // 1. Send 5 spam/malformed requests from this IP - these MUST NOT consume rate-limit quota
    for (let i = 0; i < 5; i++) {
      const resMalformed = await fetch("http://localhost:3000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": testIp,
        },
        body: JSON.stringify({
          name: "",
          website: "spam.com",
        }),
      });
      assert.equal(resMalformed.status, 400);
    }

    // Rate limit record should not even exist yet or count should be 0
    const recBefore = await prisma.rateLimit.findUnique({ where: { key: testKey } });
    assert.ok(!recBefore || recBefore.count === 0, "Malformed requests must not increment rate limit");

    // 2. Send 5 valid requests to exhaust quota
    for (let i = 1; i <= 5; i++) {
      const resValid = await fetch("http://localhost:3000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": testIp,
        },
        body: JSON.stringify({
          name: `[TEST_FIXTURE_RL] User ${i}`,
          email: `test-rl-${Date.now()}-${i}@senakids.test`,
          category: "data",
          message: "Valid submission to test rate limit boundary.",
        }),
      });
      assert.equal(resValid.status, 201, `Request ${i} should succeed with 201`);
      const body = await resValid.json();
      if (body.id) createdIds.push(body.id);
    }

    // 3. The 6th request from the same IP must be rejected with 429
    const resBlocked = await fetch("http://localhost:3000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": testIp,
      },
      body: JSON.stringify({
        name: `[TEST_FIXTURE_RL] User Blocked`,
        email: `test-rl-blocked@senakids.test`,
        category: "data",
        message: "This request should be blocked by rate limit.",
      }),
    });

    assert.equal(resBlocked.status, 429, "6th request must return HTTP 429");
    const blockedData = await resBlocked.json();
    assert.ok(
      blockedData.error && blockedData.error.includes("Terlalu banyak permintaan"),
      "Must include Indonesian error message"
    );
    assert.ok(
      blockedData.errorEn && blockedData.errorEn.includes("Too many requests"),
      "Must include English errorEn message"
    );
    assert.ok(!JSON.stringify(blockedData).includes(testIp), "Response must not leak IP address");
    assert.ok(!JSON.stringify(blockedData).includes(testKey), "Response must not leak rate limit key");

    // 4. A different IP must still be allowed (independent quota)
    const otherIp = `198.51.100.${Math.floor(Math.random() * 200) + 1}`;
    const resOther = await fetch("http://localhost:3000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": otherIp,
      },
      body: JSON.stringify({
        name: `[TEST_FIXTURE_RL] Independent Client`,
        email: `test-rl-other@senakids.test`,
        category: "suggestion",
        message: "Independent client should not be affected by blocked IP.",
      }),
    });
    assert.equal(resOther.status, 201, "Independent client must succeed");
    const otherBody = await resOther.json();
    if (otherBody.id) createdIds.push(otherBody.id);

    // Clean up other IP's rate limit
    const otherKey = getDerivedRateLimitKey("contact", otherIp);
    await prisma.rateLimit.deleteMany({ where: { key: otherKey } });
  } finally {
    // Delete all created test reports and rate limit records
    if (createdIds.length > 0) {
      await prisma.contactReport.deleteMany({
        where: { id: { in: createdIds } },
      });
    }
    await prisma.rateLimit.deleteMany({
      where: { key: testKey },
    });
  }
});

