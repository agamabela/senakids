import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { ensureDefaultAdminUser } from "@/lib/admin-auth.mjs";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password harus diisi");
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
            where: { email: normalizedEmail }
          });

          if (!user || !user.password) {
            throw new Error("Email atau password salah");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Email atau password salah");
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (err) {
          if (err instanceof Error && err.message === "Email atau password salah") {
            throw err;
          }

          console.error("DB error during login:", err);
          throw new Error("Tidak dapat terhubung ke database. Coba lagi.");
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
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
    }
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
