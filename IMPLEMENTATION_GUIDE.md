# Sena Kids - Complete Implementation Guide

## Overview
This document provides a complete, phase-by-phase implementation guide for adding authentication and UI improvements to Sena Kids.

**Estimated Total Time**: 4-6 hours
**Difficulty**: Intermediate

---

## 📋 Table of Contents

1. [Phase 1: UI Changes (No Backend) - 30 min](#phase-1-ui-changes)
2. [Phase 2: Database Schema Updates - 15 min](#phase-2-database-schema)
3. [Phase 3: Authentication Setup - 90 min](#phase-3-authentication)
4. [Phase 4: Admin Protection - 45 min](#phase-4-admin-protection)
5. [Phase 5: Testing & Polish - 30 min](#phase-5-testing)

---

## Admin Credentials (Generated)

```
Admin Username: admin@senakids.com
Admin Password: SenaKids2024!Secure
```

**IMPORTANT**: Change these after first login!

---

## Phase 1: UI Changes (No Backend Required)

### 1.1 Update Homepage to Show Games Directly

**File**: `src/app/home/page.js`

**What to change**: 
- Remove book activities from homepage
- Fetch and display actual games from database
- Make "Jelajahi Permainan" button go to /games
- Add Saweria donation link to support banner


**Replace entire file with**:

```javascript
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ChevronRight } from "lucide-react";
import ActivityCard from "@/components/ActivityCard";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";
import { useState, useEffect } from "react";

// Built-in games to display on homepage
const featuredGames = [
  { title: "Drum", description: "Tap untuk main!", emoji: "🥁", href: "/games/built/drum", color: "purple" },
  { title: "Piano", description: "Main piano interaktif!", emoji: "🎹", href: "/games/built/piano", color: "blue" },
  { title: "Petualangan Labirin", description: "Kumpulkan bintang!", emoji: "🧑‍🚀", href: "/games/built/petualangan-labirin", color: "green" },
  { title: "Menyabung Pipa", description: "Sambungkan pipa!", emoji: "🔧", href: "/games/built/menyabung-pipa", color: "yellow" },
  { title: "Berhitung", description: "Soal matematika seru!", emoji: "🔢", href: "/games/built/berhitung", color: "orange" },
  { title: "Huruf ABC", description: "Belajar huruf!", emoji: "🔤", href: "/games/built/huruf-abc", color: "pink" },
];

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      
      {/* Top Support Banner */}
      <motion.div 
        className={styles.supportBanner}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.bannerLeft}>
          <div className={styles.heartIcon}>
            <Heart fill="currentColor" size={24} />
          </div>
          <div>
            <h2 className={styles.bannerTitle}>Dukung Sena Kids</h2>
            <p className={styles.bannerSubtitle}>Bantu kami terus berkembang!</p>
          </div>
        </div>
        <a 
          href="https://saweria.co/senakids" 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.bannerButton}
        >
          💝 Donasi
        </a>
      </motion.div>


      {/* Games Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>🎮 Jelajahi Permainan</h2>
          <Link href="/games" className={styles.seeAllBtn}>
            Lihat Semua <ChevronRight size={16} />
          </Link>
        </div>
        <div className={styles.cardGrid}>
          {featuredGames.map((game, index) => (
            <ActivityCard
              key={game.title}
              {...game}
              delay={0.1 * index}
            />
          ))}
        </div>
      </section>

      {/* Footer Banner */}
      <footer className={styles.footerBanner}>
        <p>🌟 Dibuat dengan ❤️ untuk anak-anak Indonesia</p>
      </footer>
    </div>
  );
}
```

### 1.2 Simplify Navigation Menu

**File**: `src/components/Header.jsx` (or wherever your header/menu is)

You need to find your header component. Common locations:
- `src/components/Header.jsx`
- `src/components/Navigation.jsx`
- `src/app/layout.js` (if inline)

**Search for it**:
```bash
find src -name "*Header*" -o -name "*Nav*" -o -name "*Menu*"
```

Once found, update the menu items to only include:
- 🏠 Home
- 🎮 Games  
- 📚 Books
- 📺 TV
- 💝 Dukung Sena Kids (links to https://saweria.co/senakids)

Remove: Produk, Playlist, Berita, Kurikulum, Rekomendasi, Kumpulan Link



---

## Phase 2: Database Schema Updates

### 2.1 Update Prisma Schema

**File**: `prisma/schema.prisma`

**Add User model** (add this to the file):

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String   // hashed
  role      String   @default("user") // "user" or "admin"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2.2 Run Migration

```bash
npx prisma db push
npx prisma generate
```

---

## Phase 3: Authentication Setup

### 3.1 Install Dependencies

```bash
npm install next-auth@beta bcryptjs
npm install -D @types/bcryptjs
```

### 3.2 Create Auth Configuration

**File**: `src/lib/auth.js` (create new file)

```javascript
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Email atau password salah");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);


        if (!isValid) {
          throw new Error("Email atau password salah");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
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
  }
};
```

### 3.3 Create Auth API Route

**File**: `src/app/api/auth/[...nextauth]/route.js` (create folders/file)

```javascript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

### 3.4 Create Register API Route

**File**: `src/app/api/auth/register/route.js` (create file)

```javascript
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password harus diisi" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }


    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "user"
      }
    });

    return NextResponse.json(
      { message: "User created", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat registrasi" },
      { status: 500 }
    );
  }
}
```

### 3.5 Create Login Page

**File**: `src/app/login/page.js` (create folder and file)

```javascript
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>🔐 Masuk</h1>
        <p className={styles.subtitle}>Selamat datang kembali!</p>


        {error && (
          <div className={styles.error}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="nama@email.com"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className={styles.footer}>
          Belum punya akun? <Link href="/register">Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
}
```

### 3.6 Create Login Page Styles

**File**: `src/app/login/login.module.css` (create file)

```css
.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.title {
  font-size: 2rem;
  margin: 0 0 8px;
  text-align: center;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 28px;
}


.error {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  color: #c33;
  font-size: 0.9rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
}

.field input {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.field input:focus {
  outline: none;
  border-color: #667eea;
}

.submitBtn {
  padding: 14px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.submitBtn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.submitBtn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.footer {
  text-align: center;
  margin-top: 24px;
  color: #666;
  font-size: 0.9rem;
}

.footer a {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}
```



### 3.7 Create Register Page

**File**: `src/app/register/page.js` (create folder and file)

```javascript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import styles from "../login/login.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mendaftar");
      }

      // Auto login after registration
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Pendaftaran berhasil, silakan login");
        router.push("/login");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>📝 Daftar</h1>
        <p className={styles.subtitle}>Buat akun Sena Kids</p>

        {error && (
          <div className={styles.error}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="name">Nama</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nama lengkap"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="nama@email.com"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Minimal 6 karakter"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword">Konfirmasi Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Ketik ulang password"
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className={styles.footer}>
          Sudah punya akun? <Link href="/login">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}
```



### 3.8 Update Root Layout with Session Provider

**File**: `src/app/layout.js`

Add SessionProvider wrapper:

```javascript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SessionProvider from "@/components/SessionProvider";

// ... existing imports ...

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);
  
  return (
    <html lang="id" className={`${fredoka.variable} ${nunito.variable}`}>
      <body>
        <SessionProvider session={session}>
          <div className="app-wrapper">
            <LanguageProvider>
              {children}
            </LanguageProvider>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
```

### 3.9 Create Session Provider Component

**File**: `src/components/SessionProvider.jsx` (create file)

```javascript
"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export default function SessionProvider({ children, session }) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
```

### 3.10 Add User Menu to Header

You'll need to update your header component to show:
- Login/Register buttons when logged out
- User dropdown menu when logged in
- Logout option

```javascript
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <div className="auth-buttons">
        <Link href="/login" className="btn-login">Masuk</Link>
        <Link href="/register" className="btn-register">Daftar</Link>
      </div>
    );
  }

  return (
    <div className="user-menu">
      <button className="user-button">
        👤 {session.user.name || session.user.email}
      </button>
      <div className="dropdown">
        {session.user.role === "admin" && (
          <Link href="/admin">Admin Panel</Link>
        )}
        <button onClick={() => signOut()}>Logout</button>
      </div>
    </div>
  );
}
```



---

## Phase 4: Admin Protection

### 4.1 Create Admin Middleware

**File**: `src/middleware.js` (create at root of src/)

```javascript
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/admin/:path*"]
};
```

### 4.2 Update Admin Layout

**File**: `src/app/admin/layout.js`

```javascript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  // Redirect if not logged in
  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }

  // Redirect if not admin
  if (session.user.role !== "admin") {
    redirect("/");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
```

### 4.3 Create Initial Admin User

**File**: `prisma/seed-admin.js` (create file)

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('SenaKids2024!Secure', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@senakids.com' },
    update: {},
    create: {
      email: 'admin@senakids.com',
      name: 'Admin Sena Kids',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Admin user created:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run the seed**:
```bash
node prisma/seed-admin.js
```



---

## Phase 5: Environment Configuration

### 5.1 Update .env File

**File**: `.env`

Add these variables:

```env
# Existing variables...

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production

# Generate a secret with: openssl rand -base64 32
```

**Generate a secret**:
```bash
openssl rand -base64 32
```

Copy the output and replace `your-secret-key-change-this-in-production`

---

## Phase 6: Testing Checklist

### 6.1 Test User Registration
- [ ] Go to http://localhost:3000/register
- [ ] Create a new user account
- [ ] Verify auto-login after registration
- [ ] Check user appears in database

### 6.2 Test User Login
- [ ] Logout
- [ ] Go to http://localhost:3000/login
- [ ] Login with credentials
- [ ] Verify redirect to homepage
- [ ] Check user menu appears in header

### 6.3 Test Admin Access
- [ ] Login as admin (admin@senakids.com / SenaKids2024!Secure)
- [ ] Access http://localhost:3000/admin
- [ ] Verify admin panel loads
- [ ] Verify CRUD operations work
- [ ] Logout as admin

### 6.4 Test Admin Protection
- [ ] Login as regular user
- [ ] Try to access http://localhost:3000/admin
- [ ] Verify redirect to homepage (403)

### 6.5 Test Logout
- [ ] Click logout button
- [ ] Verify redirect to homepage
- [ ] Verify login buttons appear again

---

## Common Issues & Solutions

### Issue 1: "Module not found: Can't resolve 'next-auth'"
**Solution**: Make sure you installed next-auth@beta:
```bash
npm install next-auth@beta
```

### Issue 2: "PrismaClient is not configured"
**Solution**: Run migrations:
```bash
npx prisma generate
npx prisma db push
```

### Issue 3: "Invalid session token"
**Solution**: Clear cookies and restart dev server:
```bash
# Clear browser cookies for localhost:3000
# Then restart:
npm run dev
```

### Issue 4: "NEXTAUTH_SECRET missing"
**Solution**: Make sure .env has NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
# Add output to .env as NEXTAUTH_SECRET=...
```



---

## Quick Start Commands

### Full Implementation (in order)

```bash
# 1. Install dependencies
npm install next-auth@beta bcryptjs
npm install -D @types/bcryptjs

# 2. Update database schema
# Edit prisma/schema.prisma (add User model)
npx prisma db push
npx prisma generate

# 3. Create admin user
node prisma/seed-admin.js

# 4. Generate auth secret
openssl rand -base64 32
# Add to .env as NEXTAUTH_SECRET

# 5. Restart dev server
npm run dev

# 6. Test at http://localhost:3000
```

---

## File Structure Summary

```
kiddoworld/
├── prisma/
│   ├── schema.prisma          (updated - add User model)
│   └── seed-admin.js          (new - creates admin user)
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── layout.js      (updated - add auth check)
│   │   ├── api/
│   │   │   └── auth/
│   │   │       ├── [...nextauth]/
│   │   │       │   └── route.js (new)
│   │   │       └── register/
│   │   │           └── route.js (new)
│   │   ├── home/
│   │   │   └── page.js        (updated - show games)
│   │   ├── login/
│   │   │   ├── page.js        (new)
│   │   │   └── login.module.css (new)
│   │   ├── register/
│   │   │   └── page.js        (new)
│   │   └── layout.js          (updated - add SessionProvider)
│   ├── components/
│   │   ├── SessionProvider.jsx (new)
│   │   └── UserMenu.jsx       (new - add to header)
│   ├── lib/
│   │   └── auth.js            (new)
│   └── middleware.js          (new)
└── .env                       (updated - add NEXTAUTH vars)
```

---

## Security Best Practices

### 1. Change Default Admin Password
After first login as admin:
1. Go to user settings
2. Change password immediately
3. Use a strong, unique password

### 2. Protect API Routes
Add auth checks to sensitive API routes:

```javascript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  // Your logic here...
}
```

### 3. Rate Limiting
Consider adding rate limiting to login/register endpoints using packages like:
- `express-rate-limit`
- `upstash/ratelimit`



---

## Production Deployment Checklist

### Before Deploying

- [ ] Change NEXTAUTH_SECRET to production value
- [ ] Update NEXTAUTH_URL to production domain
- [ ] Change default admin password
- [ ] Test all auth flows in production-like environment
- [ ] Enable HTTPS (required for secure cookies)
- [ ] Set secure cookie options in authOptions
- [ ] Review and update CORS settings if needed
- [ ] Set up database backups
- [ ] Add email verification (optional enhancement)
- [ ] Add password reset functionality (optional enhancement)

### Production Auth Config Updates

**File**: `src/lib/auth.js`

Add these options for production:

```javascript
export const authOptions = {
  // ... existing config ...
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
```

---

## Optional Enhancements

### 1. Email Verification
Add email verification to registration:
- Send verification email after registration
- User must click link to activate account
- Use nodemailer or SendGrid

### 2. Password Reset
Add forgot password functionality:
- Generate secure reset token
- Send email with reset link
- Allow password change via token

### 3. OAuth Providers
Add social login (Google, GitHub, etc.):
```bash
npm install @auth/core
```

Add to providers in `src/lib/auth.js`:
```javascript
import GoogleProvider from "next-auth/providers/google";

providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  }),
  // ... existing CredentialsProvider
]
```

### 4. User Profile Page
Create a profile page where users can:
- Update their name
- Change password
- Delete account
- View activity history

---

## Support & Troubleshooting

### Getting Help
1. Check error messages in browser console
2. Check server logs (terminal where `npm run dev` runs)
3. Verify database schema with `npx prisma studio`
4. Clear cookies and restart if having session issues

### Reset Everything
If you need to start fresh:

```bash
# 1. Delete database
rm prisma/dev.db

# 2. Recreate database
npx prisma db push
npx prisma generate

# 3. Recreate admin user
node prisma/seed-admin.js

# 4. Clear browser cookies for localhost:3000

# 5. Restart dev server
npm run dev
```

---

## Implementation Time Estimate

- **Phase 1** (UI Changes): 30 minutes
- **Phase 2** (Database): 15 minutes
- **Phase 3** (Auth Setup): 90 minutes
- **Phase 4** (Admin Protection): 45 minutes
- **Phase 5** (Testing): 30 minutes

**Total**: ~3.5 hours for a careful implementation

---

## Final Notes

This implementation provides:
✅ User registration and login
✅ Secure password hashing
✅ JWT-based sessions
✅ Admin role protection
✅ Protected admin routes
✅ Clean UI updates
✅ Saweria donation link

**Next Steps After Implementation**:
1. Test thoroughly in development
2. Add optional enhancements as needed
3. Deploy to production
4. Monitor for issues
5. Consider adding 2FA for admin accounts

---

**Document Version**: 1.0
**Last Updated**: June 2026
**Author**: Kiro AI Assistant

