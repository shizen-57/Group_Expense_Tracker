# Quick Commands Reference

## 🚀 First Time Setup

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Edit .env with Supabase credentials

# 3. Verify
npm run verify

# 4. Deploy Functions
supabase login
supabase link --project-ref YOUR_PROJECT_ID
supabase secrets set GEMINI_API_KEY=AIzaSyAB-VKzw__bvX-WJykGceJjJ9ebkXoWAwo
supabase functions deploy make-server-f573a585

# 5. Start
npm run dev
```

---

## 💻 Daily Development

```bash
# Start dev server
npm run dev

# Stop server
Ctrl+C

# Restart server
Ctrl+C
npm run dev
```

---

## 🔍 Verification & Testing

```bash
# Check setup
npm run verify

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 🏗️ Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy Supabase functions
supabase functions deploy make-server-f573a585

# View function logs
supabase functions logs make-server-f573a585
```

---

## 🔧 Troubleshooting

```bash
# Clean reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev

# Kill port 3000
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
# Then: taskkill /PID <PID> /F
```

---

## 📦 Package Management

```bash
# Install new package
npm install package-name

# Install dev dependency
npm install -D package-name

# Update packages
npm update

# Check outdated
npm outdated

# Remove package
npm uninstall package-name
```

---

## 🗄️ Supabase

```bash
# Login
supabase login

# Link project
supabase link --project-ref YOUR_ID

# List functions
supabase functions list

# Deploy function
supabase functions deploy make-server-f573a585

# View logs
supabase functions logs make-server-f573a585

# Tail logs (live)
supabase functions logs make-server-f573a585 --tail

# Set secret
supabase secrets set KEY=value

# List secrets
supabase secrets list

# Unset secret
supabase secrets unset KEY
```

---

## 🎯 One-Liners

```bash
# Full setup
npm install && npm run verify && npm run dev

# Clean & rebuild
rm -rf node_modules package-lock.json && npm install && npm run dev

# Deploy everything
supabase secrets set GEMINI_API_KEY=AIzaSyAB-VKzw__bvX-WJykGceJjJ9ebkXoWAwo && supabase functions deploy make-server-f573a585

# Check everything
npm run verify && npm run type-check && npm run lint
```

---

## 🌐 Network Access

```bash
# Expose to local network (mobile testing)
# Edit vite.config.ts:
server: {
  host: true,
  port: 3000,
}

# Then access from phone:
# http://YOUR_COMPUTER_IP:3000
```

---

## 📊 Info Commands

```bash
# Node version
node --version

# npm version
npm --version

# Vite version
npx vite --version

# List installed packages
npm list --depth=0

# Show package info
npm info package-name

# Audit security
npm audit

# Fix security issues
npm audit fix
```

---

## 🎨 Code Quality

```bash
# Lint
npm run lint

# Lint with auto-fix
npx eslint . --fix

# Type check
npm run type-check

# Format (if prettier configured)
npx prettier --write .
```

---

## 🔄 Git Commands

```bash
# Initialize
git init

# Stage all
git add .

# Commit
git commit -m "message"

# Push
git push origin main

# Pull latest
git pull

# Check status
git status

# View changes
git diff
```

---

## 📁 File Operations

```bash
# Create .env
cp .env.example .env

# View .env
cat .env

# Edit .env (Mac)
open .env

# Edit .env (Linux)
nano .env

# Edit .env (Windows)
notepad .env

# Check file exists
ls -la .env

# Find files
find . -name "*.tsx"
```

---

## 🚨 Emergency Fixes

```bash
# Nuclear option (reset everything)
rm -rf node_modules package-lock.json dist .vite
npm install
npm run dev

# Supabase re-deploy
supabase functions deploy make-server-f573a585 --no-verify-jwt

# Clear browser cache
# Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)

# Force clean install
npm ci

# Downgrade package
npm install package-name@1.2.3
```

---

## 🎯 Quick Tests

```bash
# Test search endpoint
curl "https://YOUR_PROJECT.supabase.co/functions/v1/make-server-f573a585/search?q=test" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Test insights endpoint
curl "https://YOUR_PROJECT.supabase.co/functions/v1/make-server-f573a585/ai/insights" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Health check
curl http://localhost:3000
```

---

## 📖 Documentation

```bash
# Open docs (Mac)
open README.md
open FIRST_TIME_SETUP.md
open ENHANCED_AI_FEATURES.md

# View in terminal
cat QUICK_COMMANDS.md
less LOCALHOST_SETUP.md
```

---

## ⌨️ VS Code Shortcuts

```bash
# Open command palette
Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux)

# Quick file open
Cmd+P (Mac) or Ctrl+P (Windows/Linux)

# Find in files
Cmd+Shift+F (Mac) or Ctrl+Shift+F (Windows/Linux)

# Toggle terminal
Ctrl+`

# Restart TS Server
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

---

## 🎉 Success Checks

```bash
# After setup, verify:
✓ node --version        # v18+
✓ npm --version         # v9+
✓ npm run verify        # All green
✓ npm run dev           # Starts clean
✓ http://localhost:3000 # Loads page
✓ F12 console           # No errors
```

---

**Keep this file handy!** 📌

Bookmark it or print it for quick reference during development.
