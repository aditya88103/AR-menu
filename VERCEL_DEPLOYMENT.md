# 🚀 Vercel Deployment Guide

## Fix Applied ✅
**Issue**: Blank page on Vercel deployment
**Solution**: 
- Enhanced Vite build configuration with proper optimization
- Added error boundaries and fallback UI
- Implemented connection timeout to prevent infinite loading
- Fixed CSS loading and added fallback styles
- Improved environment variable detection

---

## 📋 Setup Instructions

### Step 1: Set Environment Variables on Vercel

1. Go to your project on **Vercel Dashboard**
2. Click **Settings** → **Environment Variables**
3. Add these two variables:

```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key-here
```

**Get these values from:**
- Supabase Dashboard → Settings → API
- Copy "Project URL" and "anon public" key

### Step 2: Redeploy on Vercel

1. Go to **Deployments** tab
2. Click the three dots (...) on the latest deployment
3. Click **Redeploy**
4. Or just push new code to GitHub - it will auto-deploy

### Step 3: Verify Deployment

Check browser console (`F12` → Console) for:
- ✅ `[Supabase] ✓ Connected successfully` 
- ✅ `✓ App rendered successfully`

Or:
- ❌ `[Supabase] Connection error` - Check env variables
- ❌ `Root element not found` - Contact support

---

## 🔄 Real-Time Sync Across Browsers

**Feature**: When you toggle a dish on/off in admin panel, ALL browsers see the change instantly

**How it works:**
1. Admin toggles dish availability → Database updated
2. Real-time listener detects change → Fetches fresh data
3. All connected browsers receive update automatically
4. Menu updates instantly on customer screen

**To test:**
1. Open menu on one browser/device
2. Open admin panel on another browser/device
3. Toggle a dish on/off in admin
4. Menu should update instantly on the first browser

---

## 🐛 Troubleshooting

### Issue: Still showing blank page
- [ ] Check browser console for errors (`F12` → Console)
- [ ] Verify Supabase URL and key are set on Vercel
- [ ] Try hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- [ ] Check Vercel build logs for errors

### Issue: Menu not loading
- [ ] Check if Supabase project is running (go to Supabase Dashboard)
- [ ] Verify database tables exist: `dishes`, `categories`
- [ ] Check browser console for connection errors

### Issue: Admin toggles not syncing across browsers
- [ ] Refresh the menu page to see if data updates
- [ ] Check if real-time listeners are active (see console logs)
- [ ] Verify Supabase real-time settings are enabled

---

## 📊 Deployment Checklist

- [x] Vite config optimized for production
- [x] Error boundaries added
- [x] CSS fallback styles included
- [x] Environment variables documented
- [x] Real-time sync configured
- [x] Loading timeout added (5 seconds)
- [x] Vercel rewrite rules configured
- [x] Cache headers optimized

---

## 🔗 Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **GitHub Repo**: https://github.com/aditya88103/AR-menu
