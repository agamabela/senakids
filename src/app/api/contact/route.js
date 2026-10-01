import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getDerivedRateLimitKey,
  checkRateLimit,
  incrementRateLimit,
  cleanupExpiredRateLimits,
} from "@/lib/rate-limiter";

const ALLOWED_CATEGORIES = new Set([
  "broken",
  "unsuitable",
  "copyright",
  "data",
  "suggestion",
  "other",
]);

export async function POST(request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const rawIp = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";

    // Privacy-conscious one-way HMAC derived key; raw IP is never saved or logged
    const rateLimitKey = getDerivedRateLimitKey("contact", rawIp);

    // 1. Check rate limit before proceeding
    const limitStatus = await checkRateLimit(rateLimitKey);
    if (!limitStatus.allowed) {
      return NextResponse.json(
        {
          error:
            "Terlalu banyak permintaan dalam waktu singkat. Silakan tunggu beberapa menit sebelum mencoba lagi.",
          errorEn: "Too many requests. Please wait a few minutes before trying again.",
        },
        {
          status: 429,
          headers: limitStatus.retryAfterSeconds
            ? { "Retry-After": String(limitStatus.retryAfterSeconds) }
            : {},
        }
      );
    }

    // 2. Parse body (do not count malformed requests to prevent lockout attacks)
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Permintaan tidak valid (invalid JSON body)." },
        { status: 400 }
      );
    }

    // 3. Honeypot check for bots (do not consume user quota)
    if (body.website || body.honeypot || body._hp) {
      return NextResponse.json(
        { error: "Spam detected." },
        { status: 400 }
      );
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    // 4. Input validation (do not consume user quota on validation errors)
    if (!name || name.length < 1 || name.length > 100) {
      return NextResponse.json(
        {
          error: "Nama wajib diisi dan maksimal 100 karakter.",
          errorEn: "Name is required and must be under 100 characters.",
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 150) {
      return NextResponse.json(
        {
          error: "Alamat email tidak valid atau melebihi batas panjang.",
          errorEn: "Invalid email address or exceeded maximum length.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_CATEGORIES.has(category)) {
      return NextResponse.json(
        {
          error: "Kategori laporan tidak dikenali.",
          errorEn: "Unrecognized report category.",
        },
        { status: 400 }
      );
    }

    if (!message || message.length < 5 || message.length > 3000) {
      return NextResponse.json(
        {
          error: "Pesan wajib diisi (minimal 5 karakter, maksimal 3000 karakter).",
          errorEn: "Message is required (minimum 5 characters, maximum 3000 characters).",
        },
        { status: 400 }
      );
    }

    // 5. Valid request: increment rate limit record
    await incrementRateLimit(rateLimitKey);

    // 6. Persist report to database
    const saved = await prisma.contactReport.create({
      data: {
        name,
        email,
        category,
        message,
        status: "PENDING",
      },
    });

    // 7. Non-blocking asynchronous cleanup of expired rate limit records
    cleanupExpiredRateLimits().catch(() => {});

    return NextResponse.json(
      {
        success: true,
        id: saved.id,
        message: "Laporan atau pesan Anda berhasil tersimpan untuk ditinjau.",
      },
      { status: 201 }
    );
  } catch (error) {
    // Sanitized server error log; never logs PII, messages, IPs, or credentials
    console.error("[Contact API] Database error processing report request");
    return NextResponse.json(
      {
        error: "Terjadi kesalahan pada server saat menyimpan laporan. Silakan coba lagi.",
        errorEn: "Server error occurred while saving report. Please try again.",
      },
      { status: 500 }
    );
  }
}

