import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email harus diisi dengan format valid" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check user without leaking existence
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetExpiry,
        },
      });

      // In production, an email would be dispatched here.
      // In local/preview environment, we log the reset link for testing.
      console.log(`[AUTH] Password reset link generated for ${normalizedEmail}: /reset-password?token=${resetToken}`);
    }

    // Always return success to prevent email enumeration
    return NextResponse.json(
      {
        success: true,
        message: "Jika email terdaftar, instruksi pengaturan ulang kata sandi telah dikirim.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan. Silakan coba kembali." },
      { status: 500 }
    );
  }
}
