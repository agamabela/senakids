import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// TEMPORARY diagnostic endpoint — visit /api/debug-login to see what's failing.
// Remove this file once login works.
export async function GET() {
  const out = {
    hasNextauthSecret: !!process.env.NEXTAUTH_SECRET,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    nextauthUrl: process.env.NEXTAUTH_URL || null,
    // mask credentials in the DB url
    dbUrlMasked: (process.env.DATABASE_URL || "")
      .replace(/:\/\/[^@]*@/, "://***:***@")
      .slice(0, 90),
    nodeEnv: process.env.NODE_ENV,
  };

  try {
    const user = await prisma.user.findUnique({
      where: { email: "admin@senakids.com" },
    });
    out.userFound = !!user;
    if (user) {
      out.role = user.role;
      out.passwordHashLength = user.password?.length ?? 0;
      out.passwordMatches = await bcrypt.compare("SenaKids2024!Secure", user.password);
    }
  } catch (e) {
    out.dbError = e.message;
  }

  return NextResponse.json(out);
}
