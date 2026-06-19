# 🏗️ Architecture Overview

## System Architecture After Implementation

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Homepage   │  │    Games     │  │    Books     │      │
│  │  (Public)    │  │   (Public)   │  │   (Public)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                 │               │
│           └────────────────┴─────────────────┘               │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Authentication  │
                    │   (NextAuth.js)  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────▼─────┐  ┌────▼────┐  ┌─────▼─────┐
        │   Login   │  │ Register │  │  Logout   │
        │   Page    │  │   Page   │  │  Action   │
        └───────────┘  └──────────┘  └───────────┘
                             │
                    ┌────────▼────────┐
                    │   Session JWT   │
                    │   (HTTP-only    │
                    │    cookies)     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────▼─────┐  ┌────▼────┐  ┌─────▼─────┐
        │   User    │  │  Admin  │  │   Guest   │
        │   Role    │  │   Role  │  │  (No auth)│
        └─────┬─────┘  └────┬────┘  └───────────┘
              │              │
              │         ┌────▼──────────┐
              │         │  Admin Panel  │
              │         │  (Protected)  │
              │         └───────────────┘
              │              │
              │         ┌────▼────┐
              │         │  CRUD   │
              │         │ Games   │
              │         │ Books   │
              │         │  TV     │
              └─────────┴─────────┘
                       │
              ┌────────▼────────┐
              │  Prisma + SQLite │
              │    Database      │
              └──────────────────┘
```

---

## Authentication Flow

### 1. Registration Flow
```
User fills form
      │
      ▼
Validate input (client)
      │
      ▼
POST /api/auth/register
      │
      ▼
Check if email exists
      │
      ├─ Yes ──▶ Return error
      │
      ├─ No
      ▼
Hash password (bcrypt)
      │
      ▼
Create user in database
      │
      ▼
Auto-login with credentials
      │
      ▼
Redirect to homepage
```

### 2. Login Flow
```
User enters credentials
      │
      ▼
POST /api/auth/signin
      │
      ▼
NextAuth.js validates
      │
      ▼
Find user in database
      │
      ├─ Not found ──▶ Return error
      │
      ▼
Compare password hash
      │
      ├─ Invalid ──▶ Return error
      │
      ▼
Create JWT session
      │
      ▼
Set HTTP-only cookie
      │
      ▼
Return session data
      │
      ▼
Redirect to homepage
```

### 3. Admin Access Flow
```
User requests /admin
      │
      ▼
Middleware checks session
      │
      ├─ No session ──▶ Redirect to /login
      │
      ▼
Check user role
      │
      ├─ Not admin ──▶ Redirect to /
      │
      ▼
Allow access to admin panel
```

---

## Database Schema

```sql
┌─────────────────────────────────────────┐
│                  User                    │
├─────────────────────────────────────────┤
│ id          String    @id @default(cuid)│
│ email       String    @unique           │
│ name        String?                     │
│ password    String    (hashed)          │
│ role        String    @default("user")  │
│ createdAt   DateTime  @default(now)     │
│ updatedAt   DateTime  @updatedAt        │
└─────────────────────────────────────────┘
         │
         │ (already exists)
         ▼
┌─────────────────────────────────────────┐
│                 Game                     │
├─────────────────────────────────────────┤
│ id          String    @id @default(cuid)│
│ title       String                      │
│ description String                      │
│ ...                                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│                 Book                     │
├─────────────────────────────────────────┤
│ id          String    @id @default(cuid)│
│ title       String                      │
│ ...                                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│                  TV                      │
├─────────────────────────────────────────┤
│ id          String    @id @default(cuid)│
│ title       String                      │
│ ...                                     │
└─────────────────────────────────────────┘
```

---

## File Structure

```
kiddoworld/
│
├── 📖 Documentation (NEW)
│   ├── IMPLEMENTATION_GUIDE.md     ⭐ Main guide
│   ├── QUICK_START.md              ⭐ Start here
│   ├── ADMIN_CREDENTIALS.md        🔐 Credentials
│   ├── ARCHITECTURE_OVERVIEW.md    📐 This file
│   └── setup-auth.sh               🤖 Auto setup
│
├── 📁 prisma/
│   ├── schema.prisma               ✏️ Add User model
│   └── seed-admin.js               ✨ NEW - Create admin
│
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 admin/
│   │   │   └── layout.js           ✏️ Add auth check
│   │   │
│   │   ├── 📁 api/
│   │   │   └── 📁 auth/
│   │   │       ├── 📁 [...nextauth]/
│   │   │       │   └── route.js    ✨ NEW
│   │   │       └── 📁 register/
│   │   │           └── route.js    ✨ NEW
│   │   │
│   │   ├── 📁 home/
│   │   │   └── page.js             ✏️ Show games
│   │   │
│   │   ├── 📁 login/               ✨ NEW
│   │   │   ├── page.js
│   │   │   └── login.module.css
│   │   │
│   │   ├── 📁 register/            ✨ NEW
│   │   │   └── page.js
│   │   │
│   │   └── layout.js               ✏️ Add SessionProvider
│   │
│   ├── 📁 components/
│   │   ├── SessionProvider.jsx     ✨ NEW
│   │   └── UserMenu.jsx            ✨ NEW
│   │
│   ├── 📁 lib/
│   │   └── auth.js                 ✨ NEW - Auth config
│   │
│   └── middleware.js               ✨ NEW - Route protection
│
└── .env                            ✏️ Add NEXTAUTH vars

Legend:
✨ NEW - Create this file
✏️ EDIT - Modify existing file
⭐ START - Begin here
🔐 SECRET - Keep secure
```

---

## Security Layers

```
┌────────────────────────────────────────────────┐
│              Security Layer 1                   │
│           Password Hashing (bcrypt)             │
│   • Passwords stored as hashes only            │
│   • Salt rounds: 10                            │
│   • Irreversible encryption                    │
└────────────────┬───────────────────────────────┘
                 │
┌────────────────▼───────────────────────────────┐
│              Security Layer 2                   │
│            JWT Session Tokens                   │
│   • Signed with NEXTAUTH_SECRET                │
│   • HTTP-only cookies                          │
│   • Not accessible via JavaScript              │
└────────────────┬───────────────────────────────┘
                 │
┌────────────────▼───────────────────────────────┐
│              Security Layer 3                   │
│            Middleware Protection                │
│   • Checks session on /admin routes            │
│   • Validates JWT signature                    │
│   • Enforces role-based access                 │
└────────────────┬───────────────────────────────┘
                 │
┌────────────────▼───────────────────────────────┐
│              Security Layer 4                   │
│          Server-Side Validation                 │
│   • Role check in admin layout                 │
│   • Session verification on API routes         │
│   • Input sanitization                         │
└────────────────────────────────────────────────┘
```

---

## User Journey

### New User Registration
```
1. Visit senakids.com
2. Click "Daftar" button
3. Fill registration form
   ├─ Name (optional)
   ├─ Email (required, unique)
   └─ Password (min 6 chars)
4. Submit form
5. Auto-login
6. Redirected to homepage
7. Can now access personalized features
```

### Admin Access
```
1. Admin logs in with credentials
   Email: admin@senakids.com
   Password: SenaKids2024!Secure
2. See "Admin Panel" in user menu
3. Click to access /admin
4. Can CRUD games, books, TV content
5. Changes reflect immediately on site
```

### Guest Browsing
```
1. Visit senakids.com
2. Browse games, books, TV (no login needed)
3. Play built-in games
4. Read books
5. Watch TV content
6. See "Masuk" and "Daftar" buttons
```

---

## API Endpoints

### Public Endpoints
```
GET  /                     Homepage
GET  /games                Games list
GET  /books                Books list
GET  /tv                   TV list
GET  /games/built/[slug]   Play game
```

### Auth Endpoints (NextAuth.js)
```
POST /api/auth/signin      Login
POST /api/auth/signout     Logout
POST /api/auth/register    Register (custom)
GET  /api/auth/session     Get session
GET  /api/auth/csrf        CSRF token
```

### Protected Endpoints
```
GET  /admin                Admin dashboard
GET  /admin/games          Manage games
POST /admin/games          Create game
PUT  /admin/games/[id]     Update game
DEL  /admin/games/[id]     Delete game
(same pattern for books, TV)
```

---

## Technology Stack

```
┌─────────────────────────────────────┐
│          Frontend Layer              │
│  • Next.js 16 (App Router)          │
│  • React 19                          │
│  • Framer Motion (animations)       │
│  • CSS Modules (styling)            │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         Authentication Layer         │
│  • NextAuth.js v5 (beta)            │
│  • JWT Sessions                      │
│  • Credentials Provider             │
│  • bcryptjs (password hashing)      │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│          Database Layer              │
│  • Prisma ORM                       │
│  • SQLite (dev)                     │
│  • PostgreSQL (prod recommended)    │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│          Deployment Layer            │
│  • Vercel (recommended)             │
│  • Environment variables            │
│  • HTTPS (required)                 │
└─────────────────────────────────────┘
```

---

## What Changes From User Perspective

### Before Implementation
```
┌──────────────────────────────────┐
│         Sena Kids                 │
│                                   │
│  Everyone sees same content       │
│  No user accounts                 │
│  Admin panel open to all          │
│  No donation link                 │
│  Mixed homepage content           │
└──────────────────────────────────┘
```

### After Implementation
```
┌──────────────────────────────────┐
│         Sena Kids                 │
│                                   │
│  ┌────────────┬────────────────┐ │
│  │   Guest    │  Logged In     │ │
│  ├────────────┼────────────────┤ │
│  │ Browse all │ Same +         │ │
│  │ content    │ Personalized   │ │
│  │            │ features       │ │
│  └────────────┴────────────────┘ │
│                                   │
│  ┌──────────────────────────────┐│
│  │         Admin User            ││
│  ├──────────────────────────────┤│
│  │ Everything above +            ││
│  │ Access admin panel            ││
│  │ CRUD content                  ││
│  │ Manage system                 ││
│  └──────────────────────────────┘│
│                                   │
│  ✅ Clean homepage (games focus) │
│  ✅ Simplified menu               │
│  ✅ Donation link visible         │
└──────────────────────────────────┘
```

---

**Ready to implement?** Start with **QUICK_START.md**!
