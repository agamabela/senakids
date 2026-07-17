import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!req.auth?.user || req.auth.user.role !== "admin") {
      const signInUrl = new URL("/login", req.url);
      signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
