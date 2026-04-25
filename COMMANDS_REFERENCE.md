# 🖥️ Command Quick Reference

Copy-paste these commands in order. Do this after creating your `.env` file.

---

## Step 1: Install Dependencies

```bash
npm install
```

**What it does:** Installs Supabase client library and all dependencies  
**Expected output:** `added X packages, removed Y packages`

---

## Step 2: Verify .env File Exists

**Windows (PowerShell):**
```powershell
Test-Path .env
```

**Mac/Linux:**
```bash
ls -la .env
```

**Expected output:** 
- Windows: `True`
- Mac/Linux: Shows the file

If it doesn't exist, create it:

```bash
# Windows
New-Item -Path .env -ItemType File

# Mac/Linux  
touch .env
```

Then edit `.env` and add:
```env
REACT_APP_SUPABASE_URL=your_url_here
REACT_APP_SUPABASE_ANON_KEY=your_key_here
```

---

## Step 3: Start Dev Server

```bash
npm run dev
```

**Expected output:**
```
VITE v7.0.0  ready in 123 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

Keep this running! (Don't close this terminal)

---

## Step 4: Test Menu Page

Open browser:
```
http://localhost:5173
```

**Expected:** See menu with dishes (if you seeded demo data)

---

## Step 5: Test Admin Page  

Open another browser window:
```
http://localhost:5173/admin/login
```

**Expected:** See admin panel

---

## Step 6: Test Real-Time Sync

In admin page:
1. Find a dish
2. Toggle it off (should say "hidden from menu")
3. Look at menu page in other browser
4. The dish should disappear instantly! ✨

---

## Production Commands

### Build for Production
```bash
npm run build
```

**What it does:** Creates optimized `dist/` folder  
**Time:** ~30 seconds

### Preview Production Build
```bash
npm run preview
```

**What it does:** Runs the production build locally  
**Use when:** You want to test the exact production version

### Deploy to Vercel
```bash
npm run deploy
```

**What it does:** Builds and deploys to gh-pages  
**Note:** Requires GitHub Pages setup

---

## Debugging Commands

### Check Node Version
```bash
node --version
```

**Expected:** v16 or higher

### Check npm Version
```bash
npm --version
```

**Expected:** v7 or higher

### Clear npm Cache
```bash
npm cache clean --force
```

**Use when:** You get weird dependency errors

### Reinstall Dependencies (Clean)
```bash
# Windows
rmdir /s /q node_modules
del package-lock.json
npm install

# Mac/Linux
rm -rf node_modules package-lock.json
npm install
```

**Use when:** Nothing else works

---

## Database Commands (Supabase)

### View Database in SQL Editor

1. Go to Supabase Dashboard
2. Click **SQL Editor**
3. Click **New Query**
4. Paste and run:

```sql
-- See all dishes
SELECT * FROM dishes;

-- See all categories
SELECT * FROM categories;

-- Count dishes
SELECT COUNT(*) FROM dishes;
```

---

## Git Commands (Version Control)

### See What Changed
```bash
git status
```

### Commit Changes
```bash
git add .
git commit -m "Setup Supabase real-time"
```

### Push to GitHub
```bash
git push origin main
```

---

## Troubleshooting Commands

### View Recent Errors
```bash
# Check if .env file is readable
cat .env

# See full error output
npm run dev 2>&1 | head -50
```

### Kill Port 5173 (if stuck)

**Windows (PowerShell):**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```

**Mac/Linux:**
```bash
lsof -ti:5173 | xargs kill -9
```

Then try `npm run dev` again.

---

## Environment Setup (One-Time)

### Install Node.js

**Windows:**
- Download from https://nodejs.org/
- Run installer
- Restart terminal

**Mac (Homebrew):**
```bash
brew install node
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install nodejs npm
```

### Install Git

**Windows:** https://git-scm.com/download/win  
**Mac:** `brew install git`  
**Linux:** `sudo apt install git`

---

## Terminal Tips

### Open Terminal in VS Code
- Press `Ctrl+` ` (backtick)
- Or go to View → Terminal

### Split Terminal (VS Code)
- Click split icon in terminal, or
- Press `Ctrl+Shift+5`

### Clear Terminal
```bash
clear      # Mac/Linux
cls        # Windows
```

---

## Common Issues & Quick Fixes

### "Port 5173 already in use"
```bash
# Kill the process on that port (see above)
# Or use different port:
npm run dev -- --port 3000
```

### "Cannot find module @supabase/supabase-js"
```bash
npm install @supabase/supabase-js
npm run dev
```

### ".env file not found"
```bash
# Create it
echo REACT_APP_SUPABASE_URL=your_url > .env
echo REACT_APP_SUPABASE_ANON_KEY=your_key >> .env

# Verify
cat .env
```

### "Module parse failed"
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

---

## Quick Workflow

```bash
# Day 1: Initial setup
npm install
npm run dev

# Day 2+: Daily work
npm run dev              # Start dev server
# (write code)
# Ctrl+C to stop        # Stop dev server when done

# When ready to deploy
npm run build            # Build for production
npm run deploy           # Deploy to production
```

---

## Reference Card (Print This!)

```
DAILY WORK:
  npm run dev              ← Start dev server
  npm run build            ← Build for production
  npm run preview          ← Preview production

SETUP:
  npm install              ← Install dependencies
  npm install package_name ← Add new package

TROUBLESHOOTING:
  npm cache clean --force  ← Clear cache
  npm ci                   ← Clean install

TESTING:
  http://localhost:5173    ← Menu page
  http://localhost:5173/admin/login  ← Admin
```

---

## Need Help?

1. **Check error message in red** - often tells you exactly what's wrong
2. **Google the error** - usually someone has solved it
3. **Check START_HERE.md** - read the relevant guide
4. **Ask in Supabase Discord** - https://discord.supabase.io

---

That's it! These are all the commands you'll need. 🎉
