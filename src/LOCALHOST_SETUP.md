# Localhost Setup Guide

## 🚀 Quick Start (First Time Setup)

### Prerequisites
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** v9+ (comes with Node.js)
- **Supabase Account** ([Sign up free](https://supabase.com))

### Step 1: Install Dependencies

```bash
# Install all packages
npm install

# This will install:
# - React 18 + TypeScript
# - Tailwind CSS v4
# - Supabase client
# - All UI components (shadcn/ui)
# - AI dependencies
# - And more...
```

**Expected output:**
```
added 1200+ packages in 45s
```

### Step 2: Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Supabase credentials
```

**Get your Supabase credentials:**
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project (or create new one)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

**Your `.env` file should look like:**
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Update Supabase Info File

Edit `/utils/supabase/info.tsx`:

```typescript
export const projectId = 'your-project-id'
export const publicAnonKey = 'your-anon-key-from-env'
```

### Step 4: Deploy Supabase Edge Functions

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-id

# Set Gemini API key
supabase secrets set GEMINI_API_KEY=AIzaSyAB-VKzw__bvX-WJykGceJjJ9ebkXoWAwo

# Deploy the Edge Function
supabase functions deploy make-server-f573a585
```

### Step 5: Start Development Server

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

### Step 6: Open Browser

Navigate to: **http://localhost:3000**

You should see the login/signup page! 🎉

---

## 🔧 Troubleshooting

### Issue: `npm install` fails

**Solution 1 - Clear cache:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Solution 2 - Use specific Node version:**
```bash
# Check Node version
node --version

# Should be v18 or higher
# If not, install/upgrade Node.js
```

**Solution 3 - Try yarn instead:**
```bash
npm install -g yarn
yarn install
yarn dev
```

---

### Issue: Tailwind styles not loading

**Solution:**
```bash
# Make sure globals.css is imported in main.tsx
# Check if @tailwindcss/vite plugin is in vite.config.ts

# Restart dev server
npm run dev
```

---

### Issue: Supabase connection errors

**Symptoms:**
```
Error: Invalid Supabase URL
Error: supabase is not defined
```

**Solution:**
```bash
# 1. Verify .env file exists and has correct values
cat .env

# 2. Restart dev server (Vite needs restart to pick up env changes)
# Press Ctrl+C to stop, then:
npm run dev

# 3. Check Supabase project is active
# Login to supabase.com/dashboard and verify project status
```

---

### Issue: TypeScript errors

**Symptoms:**
```
Cannot find module '@/components/...'
Type 'X' is not assignable to type 'Y'
```

**Solution:**
```bash
# Run type check
npm run type-check

# If path alias issues:
# Make sure tsconfig.json has:
# "baseUrl": ".",
# "paths": { "@/*": ["./*"] }

# Restart TypeScript server in your editor
# VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

---

### Issue: AI features not working

**Symptoms:**
```
Error: GEMINI_API_KEY not configured
Search returns no results
Receipt scan fails
```

**Solution:**
```bash
# 1. Set Gemini API key in Supabase
supabase secrets set GEMINI_API_KEY=AIzaSyAB-VKzw__bvX-WJykGceJjJ9ebkXoWAwo

# 2. Deploy Edge Function
supabase functions deploy make-server-f573a585

# 3. Check deployment
supabase functions list

# 4. Check logs
supabase functions logs make-server-f573a585 --tail
```

---

### Issue: Port 3000 already in use

**Solution:**
```bash
# Option 1: Kill process on port 3000
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Option 2: Use different port
# Edit vite.config.ts:
# server: { port: 3001 }
```

---

### Issue: Icons not showing (Lucide React)

**Solution:**
```bash
# Reinstall lucide-react
npm uninstall lucide-react
npm install lucide-react@^0.344.0

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

---

### Issue: Recharts not rendering

**Solution:**
```bash
# Install compatible version
npm install recharts@^2.12.0

# Make sure component is client-side only
# Recharts doesn't support SSR
```

---

## 📦 Package Verification

Check if all packages are installed correctly:

```bash
# List installed packages
npm list --depth=0

# Should show:
# ├── react@18.3.1
# ├── @supabase/supabase-js@2.39.3
# ├── lucide-react@0.344.0
# ├── recharts@2.12.0
# ├── sonner@1.4.0
# ... and many more
```

---

## 🎯 Development Workflow

```bash
# Start dev server
npm run dev

# Run type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🔥 Common Commands

```bash
# Install new package
npm install package-name

# Install dev dependency
npm install -D package-name

# Update all packages
npm update

# Check for outdated packages
npm outdated

# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## 📱 Mobile/Responsive Testing

```bash
# Expose to network for mobile testing
# Edit vite.config.ts:
server: {
  host: true,  // Add this
  port: 3000,
}

# Then access from phone using your computer's IP:
# http://192.168.x.x:3000
```

---

## 🚀 First Run Checklist

- [ ] Node.js v18+ installed
- [ ] `npm install` completed successfully
- [ ] `.env` file created with Supabase credentials
- [ ] `/utils/supabase/info.tsx` updated
- [ ] Supabase Edge Function deployed
- [ ] Gemini API key set in Supabase Secrets
- [ ] `npm run dev` starts without errors
- [ ] Browser opens to http://localhost:3000
- [ ] Can see login/signup page
- [ ] Tailwind styles are applied
- [ ] No console errors

---

## 💡 Pro Tips

### 1. Use VS Code Extensions
```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### 2. Enable Hot Reload
Already enabled by default in Vite! Just save files and see instant updates.

### 3. Debug in Browser
- Open DevTools (F12)
- Go to Sources tab
- Set breakpoints in TypeScript files
- Vite provides source maps automatically

### 4. Check Bundle Size
```bash
npm run build

# Check dist/ folder size
du -sh dist/
```

---

## 🎉 Success!

If you see the login page and can:
- ✅ Sign up for an account
- ✅ Login successfully
- ✅ Navigate between pages
- ✅ See Tailwind styles
- ✅ No errors in console

**You're all set!** 🚀

---

## 📚 Next Steps

1. Read `ENHANCED_AI_FEATURES.md` for AI capabilities
2. Check `AI_QUICK_START.md` for using AI features
3. See `TROUBLESHOOTING.md` for common issues
4. Review `README.md` for full feature list

---

## 🆘 Still Having Issues?

### Check System Info:
```bash
node --version    # Should be v18+
npm --version     # Should be v9+
npx vite --version  # Should be v5+
```

### View All Logs:
```bash
# Development logs
npm run dev -- --debug

# Supabase logs
supabase functions logs make-server-f573a585
```

### Reset Everything:
```bash
# Nuclear option - fresh start
rm -rf node_modules package-lock.json dist .vite
npm install
npm run dev
```

---

**Happy Coding!** 💻✨
