# Troubleshooting Guide

This document covers common problems you might face when running the project locally and their solutions.

## Table of Contents
1. [Setup Issues](#setup-issues)
2. [Build Errors](#build-errors)
3. [Runtime Errors](#runtime-errors)
4. [Supabase Issues](#supabase-issues)
5. [Authentication Problems](#authentication-problems)
6. [API/Backend Issues](#apibackend-issues)

---

## Setup Issues

### ❌ Problem: "npm: command not found"
**Cause**: Node.js/npm is not installed or not in PATH

**Solution**:
```bash
# Install Node.js from https://nodejs.org/
# Verify installation
node --version
npm --version
```

### ❌ Problem: "Cannot find module" errors during npm install
**Cause**: Package registry issues or network problems

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### ❌ Problem: "EACCES: permission denied" during npm install
**Cause**: Insufficient permissions

**Solution** (Mac/Linux):
```bash
# Use sudo (not recommended) OR fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

---

## Build Errors

### ❌ Problem: TypeScript errors about missing types
**Cause**: Missing type definitions

**Solution**:
```bash
# Install missing types
npm install -D @types/node

# If specific package types are missing
npm install -D @types/[package-name]
```

### ❌ Problem: "Cannot find module './styles/globals.css'"
**Cause**: File not in the correct location

**Solution**:
1. Ensure `globals.css` is in `src/styles/` directory
2. Update import in `main.tsx`:
```typescript
import './styles/globals.css'
```

### ❌ Problem: Tailwind classes not working
**Cause**: Tailwind not configured properly

**Solution**:
```bash
# Reinstall Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Ensure postcss.config.js exists:
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

# Check tailwind.config.js content paths include your files
```

### ❌ Problem: "Failed to resolve import" for UI components
**Cause**: Incorrect import paths

**Solution**:
- Check that imports use correct relative paths
- Example: `import { Button } from './components/ui/button'` (from App.tsx)
- Example: `import { Button } from '../ui/button'` (from a component)

---

## Runtime Errors

### ❌ Problem: "Hydration failed" or React errors
**Cause**: Mismatch between server and client rendering

**Solution**:
```bash
# Clear browser cache and local storage
# In browser console:
localStorage.clear()
sessionStorage.clear()
# Then hard reload (Ctrl+Shift+R or Cmd+Shift+R)
```

### ❌ Problem: "Uncaught ReferenceError: process is not defined"
**Cause**: Node.js globals used in browser code

**Solution**:
Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}
  }
})
```

### ❌ Problem: White screen with no errors
**Cause**: React mounting issue or CSS not loading

**Solution**:
1. Check browser console for errors
2. Verify `index.html` has `<div id="root"></div>`
3. Check that `main.tsx` mounts to the correct element:
```typescript
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### ❌ Problem: Components not rendering
**Cause**: Import/export mismatch

**Solution**:
```typescript
// Check that exports match imports
// If component is exported as:
export function MyComponent() { }

// Import as:
import { MyComponent } from './MyComponent'

// If exported as default:
export default function MyComponent() { }

// Import as:
import MyComponent from './MyComponent'
```

---

## Supabase Issues

### ❌ Problem: "Invalid API key" or "Project not found"
**Cause**: Incorrect environment variables

**Solution**:
1. Check `.env.local` exists in project root
2. Verify values from Supabase Dashboard:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```
3. Restart dev server after changing .env files
```bash
# Stop server (Ctrl+C), then:
npm run dev
```

### ❌ Problem: "relation 'kv_store_f573a585' does not exist"
**Cause**: Database table not created

**Solution**:
1. Go to Supabase Dashboard → SQL Editor
2. Run the table creation SQL from `LOCAL_SETUP_GUIDE.md`
3. Verify table exists in Table Editor

### ❌ Problem: "Row Level Security policy violation"
**Cause**: RLS policies blocking access

**Solution**:
1. Check that RLS policies are set correctly
2. Verify user is authenticated before accessing data
3. Check that `user_id` matches authenticated user

### ❌ Problem: Edge Function not deploying
**Cause**: Various deployment issues

**Solution**:
```bash
# Login to Supabase CLI
supabase login

# Link to correct project
supabase link --project-ref your-project-ref

# Check function exists
ls supabase/functions/make-server-f573a585/

# Try deploying with verbose output
supabase functions deploy make-server-f573a585 --debug

# Check function logs
supabase functions logs make-server-f573a585
```

### ❌ Problem: Edge Function CORS errors
**Cause**: CORS not configured in Edge Function

**Solution**:
Ensure your Edge Function includes:
```typescript
import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'

const app = new Hono()

// Add CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))
```

---

## Authentication Problems

### ❌ Problem: "Invalid login credentials"
**Cause**: User doesn't exist or wrong password

**Solution**:
1. Ensure you created an account (signup first)
2. Check Supabase Dashboard → Authentication → Users
3. Verify email confirmation is disabled (for development)

### ❌ Problem: "User not found" after signup
**Cause**: Email confirmation required

**Solution**:
In signup route, ensure `email_confirm: true`:
```typescript
const { data, error } = await supabase.auth.admin.createUser({
  email: email,
  password: password,
  user_metadata: { name: name },
  email_confirm: true  // ← Important!
})
```

### ❌ Problem: Session not persisting after refresh
**Cause**: Session storage issue

**Solution**:
1. Check browser allows localStorage
2. Ensure Supabase client is created correctly:
```typescript
import { createClient } from '@supabase/supabase-js'

export function createClient() {
  return createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    }
  )
}
```

### ❌ Problem: "Invalid access token"
**Cause**: Token expired or malformed

**Solution**:
1. Logout and login again
2. Check token refresh is working
3. Verify token is passed correctly in headers:
```typescript
headers: {
  'Authorization': `Bearer ${accessToken}`
}
```

---

## API/Backend Issues

### ❌ Problem: "Failed to fetch" errors
**Cause**: API URL incorrect or CORS issues

**Solution**:
1. Check API URL in `utils/api.ts`:
```typescript
const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-f573a585`
```
2. Test Edge Function directly:
```bash
curl -i https://xxxxx.supabase.co/functions/v1/make-server-f573a585/health
```
3. Check browser Network tab for actual error

### ❌ Problem: "Internal Server Error" from Edge Function
**Cause**: Error in server code

**Solution**:
```bash
# Check Edge Function logs
supabase functions logs make-server-f573a585 --tail

# Look for error details in logs
# Common issues:
# - Missing environment variables
# - Database connection errors
# - Syntax errors in server code
```

### ❌ Problem: Data not saving
**Cause**: Various backend issues

**Solution**:
1. Check Network tab - is the request succeeding?
2. Check response status code and body
3. Verify data format matches backend expectations
4. Check browser console for error messages
5. Check Edge Function logs

### ❌ Problem: "Unauthorized" errors
**Cause**: Missing or invalid auth token

**Solution**:
1. Ensure user is logged in
2. Check accessToken is being passed:
```typescript
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})
```
3. Verify token is valid (not expired)

---

## Performance Issues

### ❌ Problem: Slow page loads
**Cause**: Large bundle size or slow API calls

**Solution**:
1. Check Network tab for slow requests
2. Optimize images
3. Use React.lazy for code splitting:
```typescript
const ExpensesPage = lazy(() => import('./components/pages/ExpensesPage'))
```
4. Minimize unnecessary re-renders

### ❌ Problem: App freezing
**Cause**: Infinite loops or heavy computations

**Solution**:
1. Check browser console for warnings
2. Look for useEffect with missing dependencies
3. Add loading states for async operations
4. Use React DevTools Profiler

---

## Development Tips

### Enable Detailed Error Messages

**In Vite:**
Check `vite.config.ts` has:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  // Show detailed errors
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})
```

**In Browser:**
1. Open DevTools (F12)
2. Go to Console tab
3. Enable "Preserve log"
4. Set log level to "Verbose"

### Debugging Steps

1. **Check Browser Console** - First place to look for errors
2. **Check Network Tab** - See failed API calls
3. **Check React DevTools** - Component state and props
4. **Check Supabase Logs** - Backend errors
5. **Add console.log** - Track data flow

### Still Stuck?

If none of these solutions work:

1. **Clear everything and restart:**
```bash
# Stop dev server
# Clear cache
rm -rf node_modules package-lock.json .vite
# Reinstall
npm install
# Restart
npm run dev
```

2. **Check for version conflicts:**
```bash
npm list [package-name]
```

3. **Try a fresh installation:**
   - Create new Vite project
   - Copy files one by one
   - Test after each copy

4. **Search for specific error messages:**
   - Copy exact error message
   - Search on Google/Stack Overflow
   - Check GitHub issues for packages

---

## Getting Help

**Supabase Support:**
- [Documentation](https://supabase.com/docs)
- [Discord Community](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

**React/Vite Support:**
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Stack Overflow](https://stackoverflow.com)

**General Development:**
- Read error messages carefully
- Search for specific error text
- Check documentation
- Ask in developer communities

---

**Remember**: Most issues can be solved by carefully reading error messages and checking the basics (file paths, environment variables, package versions).
