# Vercel + Neon Setup Guide

## Step 1: Create a free Neon PostgreSQL database

1. Go to https://neon.tech and sign in with GitHub
2. Click **New Project** → name it "senakids"
3. After creating, click **Dashboard → Connection Details**
4. Copy the **Connection string** — you need TWO values:
   - **Pooled connection** (for `DATABASE_URL`) — the URL with `pgbouncer=true`
   - **Direct connection** (for `DIRECT_URL`) — the URL without pooler

## Step 2: Set Vercel Environment Variables

In your Vercel project → **Settings → Environment Variables**, add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Neon **pooled** connection string |
| `DIRECT_URL` | Your Neon **direct** connection string |
| `NEXTAUTH_SECRET` | Run: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NEXTAUTH_URL` | Your Vercel URL e.g. `https://senakids.vercel.app` |

## Step 3: Seed the admin user on Neon

After your first Vercel deploy (which runs `prisma migrate deploy` automatically):

1. Temporarily add your Neon `DATABASE_URL` to your local `.env`
2. Run: `node prisma/seed-admin.js`
3. Admin credentials: `admin@senakids.com` / `SenaKids2024!Secure`

## Step 4: Build Android APK (Capacitor)

Prerequisites: Android Studio installed from https://developer.android.com/studio

```bash
# 1. Add Android platform (first time only)
npx cap add android

# 2. Sync web assets
npx cap sync android

# 3. Open in Android Studio
npx cap open android
```

In Android Studio:
- Wait for Gradle to finish syncing (~5 min first time)
- **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

> **Note:** The APK loads your live Vercel site inside a native WebView.
> Make sure `NEXTAUTH_URL` in Vercel matches your live domain exactly.

## Troubleshooting Login on Vercel

- **"Email atau password salah"** → The admin user hasn't been seeded yet.
  Run `node prisma/seed-admin.js` with the Neon DB URL.
- **Redirect loop on /admin** → `NEXTAUTH_URL` env var is missing or wrong.
- **500 error** → Check Vercel function logs for the exact DB error.
