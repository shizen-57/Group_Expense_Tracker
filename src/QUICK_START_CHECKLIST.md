# Quick Start Checklist

Use this checklist to ensure you complete all setup steps correctly.

## Pre-Setup Checklist

- [ ] Node.js installed (v18+) - Run `node --version` to verify
- [ ] npm installed - Run `npm --version` to verify  
- [ ] VSCode installed
- [ ] Git installed (optional but recommended)
- [ ] Supabase account created at https://supabase.com

## Project Setup Checklist

### 1. Create Vite Project
- [ ] Run `npm create vite@latest expense-manager -- --template react-ts`
- [ ] Run `cd expense-manager`
- [ ] Verify project created successfully

### 2. Copy Project Files
- [ ] Copy `App.tsx` to `src/App.tsx`
- [ ] Copy `components/` folder to `src/components/`
- [ ] Copy `hooks/` folder to `src/hooks/`
- [ ] Copy `utils/` folder to `src/utils/`
- [ ] Copy `styles/globals.css` to `src/styles/globals.css`
- [ ] Copy `supabase/` folder to project root
- [ ] Update `src/main.tsx` with correct imports

### 3. Install Dependencies
- [ ] Run `npm install` with core dependencies
- [ ] Run `npm install` with UI dependencies
- [ ] Run `npm install` with additional libraries
- [ ] Run `npm install -D` dev dependencies
- [ ] Verify no installation errors

### 4. Tailwind Setup
- [ ] Run `npx tailwindcss init -p`
- [ ] Update `tailwind.config.js` with proper config
- [ ] Install `npm install -D tailwindcss-animate`
- [ ] Verify `globals.css` has Tailwind directives

### 5. Supabase Project Setup
- [ ] Create new Supabase project
- [ ] Copy Project URL
- [ ] Copy Anon/Public Key
- [ ] Copy Service Role Key (keep secret!)
- [ ] Note down project reference ID

### 6. Database Setup
- [ ] Go to Supabase SQL Editor
- [ ] Run table creation SQL (from LOCAL_SETUP_GUIDE.md)
- [ ] Verify table `kv_store_f573a585` exists
- [ ] Check RLS policies are enabled

### 7. Environment Variables
- [ ] Create `.env.local` file in project root
- [ ] Add `VITE_SUPABASE_URL=...`
- [ ] Add `VITE_SUPABASE_ANON_KEY=...`
- [ ] Verify no quotes around values
- [ ] Update `src/utils/supabase/info.tsx`
- [ ] Update `src/utils/supabase/client.ts`

### 8. Supabase Edge Function Setup
- [ ] Run `npm install -g supabase` (CLI)
- [ ] Run `supabase init` in project
- [ ] Run `supabase link --project-ref YOUR_REF`
- [ ] Create `supabase/functions/_shared/kv_store.ts`
- [ ] Copy server code to Edge Function
- [ ] Set service role secret: `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...`
- [ ] Deploy function: `supabase functions deploy make-server-f573a585`
- [ ] Test function with curl

### 9. Fix Import Paths
- [ ] Update imports in `src/utils/api.ts`
- [ ] Update imports in `src/utils/supabase/info.tsx`
- [ ] Check all component imports use correct paths
- [ ] Remove any `figma:asset` imports

### 10. Create Config Files
- [ ] Create/verify `tsconfig.json`
- [ ] Create/verify `vite.config.ts`
- [ ] Create `.gitignore` from template
- [ ] Verify `package.json` has all scripts

## First Run Checklist

### 11. Start Development Server
- [ ] Run `npm run dev`
- [ ] No build errors appear
- [ ] Server starts successfully
- [ ] Note the local URL (usually http://localhost:5173)

### 12. Test in Browser
- [ ] Open browser to local URL
- [ ] Page loads without white screen
- [ ] No console errors in browser DevTools
- [ ] Tailwind styles are working

### 13. Test Authentication
- [ ] Click signup
- [ ] Fill form with test data
- [ ] Signup succeeds without errors
- [ ] Redirected to login
- [ ] Login with same credentials
- [ ] Login succeeds
- [ ] Dashboard loads

### 14. Test Core Features
- [ ] Create a personal expense
- [ ] Expense appears in list
- [ ] View expenses tab
- [ ] Create a group
- [ ] Add a friend
- [ ] Add group expense
- [ ] Check profile page
- [ ] Logout works
- [ ] Login again - session restored

## Troubleshooting Checklist

If something doesn't work:

- [ ] Check browser console for errors
- [ ] Check terminal for build errors
- [ ] Verify environment variables are set correctly
- [ ] Restart dev server (Ctrl+C, then `npm run dev`)
- [ ] Clear browser cache and localStorage
- [ ] Check Supabase Edge Function logs
- [ ] Verify all npm packages installed correctly
- [ ] Check `TROUBLESHOOTING.md` for specific error

## Verification Checklist

Everything works when:

- [✓] Dev server runs without errors
- [✓] Login/signup works
- [✓] Can create expenses
- [✓] Can create groups
- [✓] Can add friends
- [✓] Data persists after refresh
- [✓] No console errors
- [✓] All features functional

## Post-Setup Checklist

### Security
- [ ] `.env.local` is in `.gitignore`
- [ ] Service role key is NOT in frontend code
- [ ] Service role key is NOT committed to Git

### Development Workflow
- [ ] VSCode extensions installed (optional)
- [ ] Git repository initialized (optional)
- [ ] First commit made (optional)

### Documentation
- [ ] Read `LOCAL_SETUP_GUIDE.md`
- [ ] Read `TROUBLESHOOTING.md`
- [ ] Understand project structure

## Ready to Develop! 🎉

Once all items are checked:
- ✅ Your local environment is ready
- ✅ You can start developing new features
- ✅ You can test changes in real-time
- ✅ You can debug issues effectively

---

## Quick Commands Reference

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check Supabase function logs
supabase functions logs make-server-f573a585

# Deploy Edge Function
supabase functions deploy make-server-f573a585

# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Need Help?

- See `TROUBLESHOOTING.md` for common issues
- Check browser console for errors
- Check Supabase Dashboard for backend issues
- Read error messages carefully

---

**Time Estimate**: 30-60 minutes for complete setup (first time)

**Good luck! 🚀**
