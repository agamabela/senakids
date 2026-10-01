import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token verifikasi wajib disertakan" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { verifyToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Token verifikasi tidak valid atau sudah digunakan." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verifyToken: null,
      },
    });

    return NextResponse.json(
      { message: "Alamat email berhasil diverifikasi!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verify error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memverifikasi email." },
      { status: 500 }
    );
  }
}
