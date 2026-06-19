# 🧪 Testing Guide - Authentication & UI Updates

## ✅ Server Status
Dev server is running successfully on **http://localhost:3000**

## 🔐 Test Credentials

### Admin Account
```
Email: admin@senakids.com
Password: SenaKids2024!Secure
```

## 📋 Testing Checklist

### 1. Homepage Redirect ✓
- [ ] Visit http://localhost:3000
- [ ] Should automatically redirect to http://localhost:3000/games
- **Expected**: Games page loads directly, no intermediate page

### 2. Simplified Menu ✓
- [ ] Click the "Menu" button in the header
- [ ] Check that only 5 items are shown:
  - 🏠 Rumah (Home)
  - 📺 TV
  - 📚 Buku (Books)
  - 🎮 Game (Games)
  - 🗺️ Kurikulum (Curriculum)
- **Expected**: No Produk, Playlist, Berita, Rekomendasi, or Kumpulan Link

### 3. Donation Link ✓
- [ ] Open the menu modal
- [ ] Scroll to bottom
- [ ] See red ❤️ "Dukung Sena Kids" button
- [ ] Click it
- **Expected**: Opens https://saweria.co/senakids in new tab

### 4. User Registration 📝
- [ ] Click user icon (top right) → dropdown appears
- [ ] Click "Daftar" (Register)
- [ ] Fill in the form:
  - Name: Test User
  - Email: test@example.com
  - Password: test123456
  - Confirm Password: test123456
- [ ] Click "Daftar" button
- **Expected**: Redirects to login page

### 5. User Login 🔑
- [ ] On login page, enter:
  - Email: test@example.com
  - Password: test123456
- [ ] Click "Masuk" button
- **Expected**: 
  - Redirects to /games
  - User icon shows dropdown with "Test User" name
  - Dropdown shows email
  - "Keluar" (Logout) button visible

### 6. Admin Login 👑
- [ ] Logout if logged in
- [ ] Login with admin credentials (see above)
- **Expected**:
  - User dropdown shows "Admin"
  - "Admin Panel" link visible in dropdown
  - Can access http://localhost:3000/admin

### 7. Admin Access Control 🔒
- [ ] Logout admin
- [ ] Login as regular user (test@example.com)
- [ ] Try to visit http://localhost:3000/admin
- **Expected**: Redirected to /games (access denied)

### 8. Guest Admin Block 🚫
- [ ] Logout completely
- [ ] Try to visit http://localhost:3000/admin
- **Expected**: Redirected to /login with callback URL

### 9. Logout Functionality 🚪
- [ ] Login as any user
- [ ] Click user icon → "Keluar"
- **Expected**: 
  - Logged out
  - User icon shows "Masuk" and "Daftar" again

### 10. Session Persistence 💾
- [ ] Login as any user
- [ ] Close and reopen browser
- [ ] Visit http://localhost:3000
- **Expected**: Still logged in (session persists)

---

## 🐛 Known Issues

### Hydration Warning
You may see this warning in the console:
```
Warning: Prop `data-scribe-recorder-ready` did not match.
```

**Cause**: Browser extension (like Scribe) modifying the HTML  
**Impact**: Cosmetic only, does not affect functionality  
**Fix**: Disable browser extensions or ignore the warning

---

## 🎯 Quick Test Flow

1. **Visit homepage** → Should go to /games ✓
2. **Open menu** → See 5 items + donation link ✓
3. **Click user icon** → See "Masuk" and "Daftar" ✓
4. **Register** → Create account ✓
5. **Login** → See your name in dropdown ✓
6. **Logout** → Back to guest state ✓
7. **Login as admin** → See "Admin Panel" link ✓
8. **Access /admin** → Admin dashboard loads ✓

---

## 🔧 Troubleshooting

### "Cannot connect to server"
```bash
# Check if dev server is running
ps aux | grep "next dev"

# If not running, start it
npm run dev
```

### "Session not persisting"
```bash
# Clear browser cookies
# Chrome: DevTools → Application → Cookies → localhost → Delete all

# Or use incognito mode
```

### "Admin credentials don't work"
```bash
# Re-seed the admin user
node prisma/seed-admin.js
```

### "Database error"
```bash
# Reset database
npx prisma migrate reset --force

# Re-seed data
node prisma/seed.js
node prisma/seed-admin.js
```

---

## 📸 Screenshots Locations

When testing, you can verify:
- **Login Page**: Clean purple gradient, centered form
- **Register Page**: Pink gradient, 4-field form
- **User Dropdown**: Shows name, email, and action buttons
- **Menu Modal**: 5 icons in grid + red donation button at bottom

---

## ✨ Success Criteria

All features are working if:
- ✅ Homepage redirects to /games
- ✅ Menu shows only 5 items
- ✅ Donation link opens Saweria
- ✅ Users can register and login
- ✅ Sessions persist across page refreshes
- ✅ Admin can access /admin
- ✅ Regular users cannot access /admin
- ✅ Guests must login to access /admin
- ✅ Logout clears session

---

**Status**: All features implemented and server running successfully! 🎉
