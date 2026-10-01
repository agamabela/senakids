import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, parentalConfirmed } = body;

    const consent = Boolean(body.parentalConfirmed ?? body.parentalConsent);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan kata sandi harus diisi" },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { error: "Persetujuan orang tua/wali wajib dicentang sebelum pendaftaran" },
        { status: 400 }
      );
    }

    // Password strength check (min 8 chars, numbers/letters)
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Kata sandi minimal 8 karakter" },
        { status: 400 }
      );
    }

    const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    if (!hasNumberOrSymbol || !hasLetter) {
      return NextResponse.json(
        { error: "Kata sandi harus mengandung kombinasi huruf dan angka/simbol" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan masuk atau gunakan fitur lupa kata sandi." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(24).toString("hex");

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name?.trim() || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        password: hashedPassword,
        role: "user",
        verifyToken,
      },
    });

    return NextResponse.json(
      {
        message: "Akun keluarga berhasil dibuat",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Terjadi kendala saat pendaftaran. Silakan coba kembali." },
      { status: 500 }
    );
  }
}
