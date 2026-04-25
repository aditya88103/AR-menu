# Firebase Setup Guide

Your app now uses **Firestore with real-time listeners** for instant sync across all browsers and devices.

> **Free Alternatives:** Don't want to pay? See [Free Options](#free-alternatives-supabase--pocketbase) below!

## 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing one)
3. Enable Firestore Database:
   - In Firebase Console, click on left sidebar **Build** section (below your project name)
   - Click **Firestore Database**
   - Click **Create Database**
   - Start in **Test mode** (or Production with provided rules)

4. Enable Authentication (optional, for admin login):
   - In left sidebar under **Build**, click **Authentication**
   - Click **Get Started** or **Create sign-in method**
   - Enable **Email/Password** provider
   - Click **Enable** and **Save**

5. Enable Storage (for dish images/3D models):
   - In left sidebar under **Build**, click **Storage**
   - Click **Get Started**
   - Click **Create Bucket** and follow the setup

## 2. Environment Variables

Create a `.env` file in your project root:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

Get these values from Firebase Console > Project Settings > Your apps

## 3. Firestore Rules

Deploy the rules from `firestore.rules` to your Firestore:

1. In Firebase Console, go to **Firestore Database > Rules**
2. Replace with content from `firestore.rules`
3. Click **Publish**

Rules summary:
- **Dishes**: Public read (available only), admin write
- **Categories**: Public read, admin write
- **Restaurant**: Public read, admin write

## 4. Install Dependencies

If you haven't already:
```bash
npm install firebase
```

## 5. How It Works Now

✅ **Menu Page** - Real-time listener on available dishes  
✅ **Admin Dashboard** - Real-time listener on all dishes  
✅ **Cross-browser sync** - Changes in one browser instantly appear in others  
✅ **Cross-device sync** - Changes on mobile instantly appear on desktop, etc.

## 6. Testing

1. Open admin dashboard in one browser: `http://localhost:5173/admin/login`
2. Open menu in another browser: `http://localhost:5173`
3. Toggle a dish on/off in admin dashboard
4. Watch it update instantly in the menu browser!

## Troubleshooting

**"Module not found: firebase"**
- Run: `npm install firebase`

**No data appears**
- Check `.env` variables are correct
- Check Firestore Database is created
- Check security rules allow read access

**Changes not syncing**
- Open browser DevTools Console
- Check for errors
- Verify Firestore connection
- Check `.env` file is loaded (restart dev server)

---

## Free Alternatives (Supabase & PocketBase)

### Option 1: Supabase (Recommended - Like Firebase but Free)

**Pros:**
- ✅ **Free tier** - Very generous limits (2 projects, 500MB storage, unlimited real-time)
- ✅ **PostgreSQL** - More powerful than Firebase
- ✅ **Real-time built-in** - Just like Firebase
- ✅ **Similar API** - Easy to migrate from Firebase

**Setup:**
1. Go to [supabase.com](https://supabase.com)
2. Sign up (free)
3. Create a new project
4. Create tables for `dishes` and `categories`
5. Enable real-time on those tables
6. Use Supabase client library instead of Firebase

**Code Changes (minimal):**
```bash
npm install @supabase/supabase-js
```

Then in `firebase.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
)
```

---

### Option 2: PocketBase (Completely Free & Self-Hosted)

**Pros:**
- ✅ **100% Free** - Self-hosted, no payment ever
- ✅ **All features included** - Real-time, authentication, file storage
- ✅ **Single executable** - Deploy on your own server/laptop
- ✅ **Built-in admin panel** - Very user-friendly

**Cons:**
- ⚠️ Needs to be hosted (on your server, Vercel, Render, etc.)

**Setup:**
1. Download from [pocketbase.io](https://pocketbase.io)
2. Run the executable
3. Visit `http://localhost:8090/_/` for admin panel
4. Create tables: `dishes`, `categories`
5. Install client: `npm install pocketbase`

**Code in `firebase.js`:**
```javascript
import PocketBase from 'pocketbase'

export const pb = new PocketBase(process.env.REACT_APP_POCKETBASE_URL)
```

---

### Option 3: Keep Localhost (For Development Only)

If you just want to test locally with real-time sync:

**Use localStorage + SSE/WebSockets:**
```javascript
// Simple polling alternative
setInterval(() => {
  loadData() // Refresh every 2 seconds
}, 2000)
```

❌ **Not recommended for production** - No server = no cross-device sync

---

### Which Should You Choose?

| Need | Best Choice |
|------|------------|
| 🚀 Deploy today, no coding | **Supabase** (free tier works great) |
| 💰 Pay nothing, ever | **PocketBase** (self-hosted) |
| 🧪 Test locally only | **Current Firebase setup** or localStorage |

All three will give you instant cross-browser sync!
