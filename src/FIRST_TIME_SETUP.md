# First Time Setup - Complete Guide

## 🎯 Goal
Get your AI-powered expense manager running on localhost in under 10 minutes!

---

## 📋 Prerequisites (Install These First)

### 1. Node.js (Required)
```bash
# Check if installed
node --version

# Should show: v18.x.x or higher
```

**Not installed?** Download from [nodejs.org](https://nodejs.org/) (LTS version recommended)

### 2. Git (Optional, for cloning)
```bash
# Check if installed
git --version
```

**Not installed?** Download from [git-scm.com](https://git-scm.com/)

### 3. Supabase Account (Required)
Sign up for free at [supabase.com](https://supabase.com)

---

## 🚀 Setup Steps (Copy & Paste)

### Step 1: Navigate to Project Directory
```bash
# If you just cloned or downloaded the project
cd expense-manager-ai

# Verify you're in the right place
ls -la
# You should see: package.json, App.tsx, components/, etc.
```

---

### Step 2: Install Dependencies
```bash
npm install
```

**What this does:**
- Installs React, TypeScript, Tailwind CSS
- Installs Supabase client
- Installs all UI components
- Installs AI dependencies (for Gemini integration)

**Time:** ~2-3 minutes

**Expected output:**
```
added 1200+ packages, and audited 1201 packages in 2m

found 0 vulnerabilities
```

**Troubleshooting:**
If you see errors, try:
```bash
npm cache clean --force
npm install
```

---

### Step 3: Create Environment File
```bash
# Copy the example file
cp .env.example .env

# Open .env in your editor
# Mac:
open .env

# Windows:
notepad .env

# Linux:
nano .env
```

---

### Step 4: Get Supabase Credentials

**A. Go to Supabase Dashboard**
1. Visit [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"** (or select existing project)
3. Fill in:
   - Name: `expense-manager` (or any name)
   - Database Password: (choose a strong password)
   - Region: (select closest to you)
4. Click **"Create new project"**
5. Wait ~2 minutes for setup to complete

**B. Get API Credentials**
1. In your project dashboard, click **Settings** (gear icon)
2. Click **API** in the left sidebar
3. You'll see:

```
Project URL
https://xxxxxxxxxxxxx.supabase.co

Project API keys
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey... (keep secret!)
```

**C. Update .env File**
Replace the placeholders in `.env`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

**Save the file!** ✅

---

### Step 5: Update Supabase Info File

Edit `utils/supabase/info.tsx`:

**Before:**
```typescript
export const projectId = 'your-project-id'
export const publicAnonKey = 'your-anon-key-from-env'
```

**After:**
```typescript
// Extract project ID from your URL: https://[THIS-PART].supabase.co
export const projectId = 'xxxxxxxxxxxxx'  // Replace with your actual ID

// Copy the same anon key from .env
export const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

**Save the file!** ✅

---

### Step 6: Verify Setup

Run our automated verification script:

```bash
npm run verify
```

**Expected output:**
```
✓ Node.js v18.17.0 ✓ (Required: v18+)
✓ npm 9.6.7 ✓ (Required: v9+)
✓ package.json found
✓ react installed
✓ @supabase/supabase-js installed
✓ .env file found
✓ VITE_SUPABASE_URL configured
✓ VITE_SUPABASE_ANON_KEY configured
✓ index.html exists
✓ main.tsx exists
...

🎉 All checks passed! You're ready to run the project.
Run: npm run dev
```

**If you see errors:**
- Read the error messages (they tell you what to fix)
- Check the troubleshooting section below
- Or jump to Step 7 anyway and see what happens!

---

### Step 7: Deploy Supabase Edge Functions

**A. Install Supabase CLI**
```bash
npm install -g supabase
```

**B. Login to Supabase**
```bash
supabase login
```

This will open a browser window. Authorize the CLI.

**C. Link Your Project**
```bash
# Replace xxxxxxxxxxxxx with your project ID from Step 5
supabase link --project-ref xxxxxxxxxxxxx
```

**D. Set Gemini API Key**
```bash
supabase secrets set GEMINI_API_KEY=AIzaSyAB-VKzw__bvX-WJykGceJjJ9ebkXoWAwo
```

**E. Deploy Edge Function**
```bash
supabase functions deploy make-server-f573a585
```

**Expected output:**
```
Deploying make-server-f573a585 (project ref: xxxxxxxxxxxxx)
...
Deployed make-server-f573a585 successfully
```

---

### Step 8: Start Development Server! 🎉

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.1.5  ready in 324 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

**Browser should automatically open to:**
```
http://localhost:3000
```

---

## ✅ Success Checklist

You should now see:

- [ ] Login/Signup page loads
- [ ] Page has nice gradients and styling (Tailwind is working)
- [ ] No errors in browser console (F12 → Console tab)
- [ ] Can click "Sign Up" and see the signup form
- [ ] Forms have proper styling and icons

**If YES to all → Congratulations!** 🎉

**If NO → See Troubleshooting below** ⬇️

---

## 🐛 Troubleshooting Common Issues

### Issue 1: "npm: command not found"

**Solution:**
You don't have Node.js installed.

1. Go to [nodejs.org](https://nodejs.org/)
2. Download LTS version (v18 or v20)
3. Run installer
4. Close terminal and open new one
5. Try `node --version` again

---

### Issue 2: Blank white page in browser

**Check 1 - Console Errors:**
```
1. Press F12 (open DevTools)
2. Click "Console" tab
3. Look for red error messages
```

**Common errors:**

**Error:** `Supabase client not initialized`
**Fix:** Check your `.env` file has correct values

**Error:** `Module not found: @/...`
**Fix:** Run `npm install` again

**Error:** `Failed to fetch`
**Fix:** Edge function not deployed. See Step 7

**Check 2 - .env File:**
```bash
cat .env
# Should show real values, not placeholders
```

**Check 3 - Restart Dev Server:**
```bash
# Press Ctrl+C to stop server
npm run dev
# Restart server
```

---

### Issue 3: Styles look broken (no gradients/colors)

**Cause:** Tailwind CSS not loading

**Fix:**
```bash
# Check if globals.css is imported
cat main.tsx | grep globals.css
# Should show: import './styles/globals.css'

# Restart dev server
# Press Ctrl+C, then:
npm run dev
```

---

### Issue 4: Port 3000 already in use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Fix Option 1 - Kill the process:**
```bash
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows (PowerShell):
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

**Fix Option 2 - Use different port:**
Edit `vite.config.ts`:
```typescript
server: {
  port: 3001,  // Change to 3001
  open: true,
}
```

---

### Issue 5: Supabase connection errors

**Error in console:**
```
Error: Invalid Supabase URL
supabaseUrl is required
```

**Fix:**
1. Check `.env` file exists and has values
2. **Restart dev server** (important!)
3. Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)

**Still not working?**
```bash
# Check env variables are loaded
npm run dev

# In browser console, type:
console.log(import.meta.env)
# Should show your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

---

### Issue 6: AI features not working

**Error:**
```
Search returns no results
Receipt scan fails
GEMINI_API_KEY not configured
```

**Fix:**
```bash
# Make sure you completed Step 7!

# Check if secret is set:
supabase secrets list
# Should show: GEMINI_API_KEY

# If not:
supabase secrets set GEMINI_API_KEY=AIzaSyAB-VKzw__bvX-WJykGceJjJ9ebkXoWAwo

# Redeploy:
supabase functions deploy make-server-f573a585
```

---

### Issue 7: TypeScript errors everywhere

**Error:**
```
Cannot find module '@/components/...'
Property 'X' does not exist on type 'Y'
```

**Fix:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart TypeScript server (in VS Code)
# Cmd+Shift+P → "TypeScript: Restart TS Server"

# Or just restart your editor
```

---

## 🎓 What Each File Does

```
package.json          → Lists all dependencies
vite.config.ts        → Vite (build tool) configuration
tsconfig.json         → TypeScript configuration
index.html            → Entry HTML file
main.tsx              → Entry point for React app
App.tsx               → Main app component
.env                  → Environment variables (Supabase credentials)
utils/supabase/       → Supabase client setup
components/           → All React components
styles/globals.css    → Tailwind CSS and global styles
```

---

## 🎯 Quick Reference

```bash
# Install everything
npm install

# Verify setup
npm run verify

# Start dev server
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📚 Next Steps After Setup

Once you have the app running:

1. **Create an Account**
   - Click "Sign Up"
   - Enter email, username, password
   - Click "Sign Up" button

2. **Explore Features**
   - Dashboard - Overview of expenses
   - Expenses - Personal expense tracking
   - Groups - Group expense splitting
   - Activity - Recent transactions
   - Profile - Account settings

3. **Try AI Features**
   - Search: "how much did I spend on food?"
   - Receipt Scanner: Upload a receipt photo
   - AI Insights: Auto-generates on Expenses tab

4. **Read Documentation**
   - `ENHANCED_AI_FEATURES.md` - AI capabilities
   - `AI_QUICK_START.md` - Using AI features
   - `README.md` - Full feature list

---

## 🆘 Still Stuck?

### Check System Requirements:
```bash
node --version     # Must be v18+
npm --version      # Must be v9+
```

### Nuclear Option (Fresh Start):
```bash
# Delete everything and start over
rm -rf node_modules package-lock.json dist .vite
npm install
npm run dev
```

### Logs to Check:
```bash
# Browser console (F12)
# Terminal where you ran 'npm run dev'
# Supabase function logs:
supabase functions logs make-server-f573a585
```

---

## ✨ You Made It!

If you see the login page and can create an account:

**🎉 SUCCESS! You're ready to start tracking expenses with AI!**

```
┌─────────────────────────────────────┐
│                                     │
│   Welcome to Expense Manager AI!    │
│                                     │
│   ✓ Setup complete                  │
│   ✓ AI features enabled             │
│   ✓ Ready to use                    │
│                                     │
└─────────────────────────────────────┘
```

---

**Total Setup Time:** 5-10 minutes ⏱️

**Happy expense tracking!** 💰✨
