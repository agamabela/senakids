import crypto from "crypto";
import { prisma } from "./prisma.js";

export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
export const MAX_CONTACT_REQUESTS = 5; // 5 valid submissions per 10 minutes

/**
 * Derives a privacy-conscious, one-way hashed key using HMAC-SHA256 and server secret.
 * Raw IP addresses are never stored in the database.
 */
export function getDerivedRateLimitKey(
  prefix,
  rawIdentifier,
  secret = process.env.NEXTAUTH_SECRET || "senakids-rate-limit-salt-key"
) {
  const normalized = (rawIdentifier || "127.0.0.1").trim();
  return crypto
    .createHmac("sha256", secret)
    .update(`${prefix}:${normalized}`)
    .digest("hex");
}

/**
 * Checks whether an identifier has exceeded its rate limit without incrementing.
 * This ensures malformed or spam requests do not consume legitimate quota.
 */
export async function checkRateLimit(
  key,
  {
    maxRequests = MAX_CONTACT_REQUESTS,
    prismaClient = prisma,
  } = {}
) {
  try {
    const record = await prismaClient.rateLimit.findUnique({
      where: { key },
    });

    const now = new Date();
    if (!record) {
      return { allowed: true, count: 0, remaining: maxRequests };
    }

    if (record.expiresAt <= now) {
      return { allowed: true, count: 0, remaining: maxRequests };
    }

    if (record.count >= maxRequests) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((record.expiresAt.getTime() - now.getTime()) / 1000)
      );
      return {
        allowed: false,
        count: record.count,
        remaining: 0,
        retryAfterSeconds,
      };
    }

    return {
      allowed: true,
      count: record.count,
      remaining: Math.max(0, maxRequests - record.count),
    };
  } catch (error) {
    // If rate limiter fails, fail open gracefully to not break critical reports
    return { allowed: true, count: 0, remaining: maxRequests };
  }
}

/**
 * Increments or initializes the rate limit counter for a valid request.
 */
export async function incrementRateLimit(
  key,
  {
    windowMs = RATE_LIMIT_WINDOW_MS,
    prismaClient = prisma,
  } = {}
) {
  const now = new Date();
  const expiresAt = new Date(Date.now() + windowMs);

  try {
    const record = await prismaClient.rateLimit.findUnique({
      where: { key },
    });

    if (record && record.expiresAt > now) {
      return await prismaClient.rateLimit.update({
        where: { key },
        data: { count: { increment: 1 } },
      });
    }

    return await prismaClient.rateLimit.upsert({
      where: { key },
      create: {
        key,
        count: 1,
        expiresAt,
      },
      update: {
        count: 1,
        expiresAt,
      },
    });
  } catch (error) {
    // Graceful error recovery
    return null;
  }
}

/**
 * Purges expired rate limit records from the database.
 */
export async function cleanupExpiredRateLimits(prismaClient = prisma) {
  try {
    const result = await prismaClient.rateLimit.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    return result.count;
  } catch {
    return 0;
  }
}
