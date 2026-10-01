import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { ensureDefaultAdminUser } from "@/lib/admin-auth.mjs";
import bcrypt from "bcryptjs";

const isProduction = process.env.NODE_ENV === "production";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email atau kata sandi tidak valid.");
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();
        const configuredAdminEmail = (process.env.ADMIN_EMAIL || "admin@senakids.com").trim().toLowerCase();

        try {
          if (normalizedEmail === configuredAdminEmail) {
            await ensureDefaultAdminUser({
              prisma,
              bcrypt,
              email: configuredAdminEmail,
              password: credentials.password,
            });
          }

          const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          });

          // Always use identical generic error message to prevent user enumeration
          if (!user || !user.password) {
            throw new Error("Email atau kata sandi tidak valid.");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Email atau kata sandi tidak valid.");
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (err) {
          if (err instanceof Error && err.message === "Email atau kata sandi tidak valid.") {
            throw err;
          }

          console.error("DB error during login:", err);
          throw new Error("Terjadi kendala autentikasi. Silakan coba kembali.");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: isProduction ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "senakids-fallback-secret-change-me-in-env-vars-2024",
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
