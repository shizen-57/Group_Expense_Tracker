# Local Development Setup Guide

This guide will help you run the Personal Expense Manager app locally in VSCode.

## Prerequisites

Before starting, ensure you have:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **VSCode** - [Download here](https://code.visualstudio.com/)
- **Supabase CLI** - Install with `npm install -g supabase`
- A **Supabase account** - [Sign up here](https://supabase.com/)

## Step 1: Create a Standard React Project Structure

Since this project was built in Figma Make, you need to set up a proper build environment.

### Option A: Using Vite (Recommended)

1. Create a new Vite project in a separate directory:
```bash
npm create vite@latest expense-manager -- --template react-ts
cd expense-manager
```

2. Copy all project files into the Vite project:
   - Copy `App.tsx` to `src/App.tsx`
   - Copy the entire `components/` folder to `src/components/`
   - Copy the entire `hooks/` folder to `src/hooks/`
   - Copy the entire `utils/` folder to `src/utils/`
   - Copy `styles/globals.css` to `src/styles/globals.css`
   - Copy the `supabase/` folder to the root

3. Update `src/main.tsx`:
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

4. Update `index.html` to include Tailwind CDN (temporary):
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Expense Manager</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## Step 2: Install Dependencies

Install all required packages:

```bash
# Core dependencies
npm install react react-dom

# UI and styling
npm install tailwindcss postcss autoprefixer
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio
npm install @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible
npm install @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar
npm install @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress
npm install @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select
npm install @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot
npm install @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast
npm install @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip

# Icons and animations
npm install lucide-react
npm install motion

# Charts and visualization
npm install recharts

# Form handling
npm install react-hook-form@7.55.0
npm install zod @hookform/resolvers

# Date handling
npm install date-fns react-day-picker

# Toast notifications
npm install sonner@2.0.3

# Supabase
npm install @supabase/supabase-js

# Carousel
npm install embla-carousel-react

# Dev dependencies
npm install -D @types/react @types/react-dom typescript
npm install -D @vitejs/plugin-react
```

## Step 3: Setup Tailwind CSS

1. Initialize Tailwind:
```bash
npx tailwindcss init -p
```

2. Update `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}
```

3. Install the animation plugin:
```bash
npm install -D tailwindcss-animate
```

## Step 4: Setup Supabase

### Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Note down your:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep this SECRET!)

### Setup the Database

1. In Supabase Dashboard, go to SQL Editor
2. Run this SQL to create the key-value store table:

```sql
-- Create the key-value store table
CREATE TABLE IF NOT EXISTS kv_store_f573a585 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for user_id queries
CREATE INDEX IF NOT EXISTS idx_kv_store_user_id ON kv_store_f573a585(user_id);

-- Create index for key prefix queries
CREATE INDEX IF NOT EXISTS idx_kv_store_key_prefix ON kv_store_f573a585(key text_pattern_ops);

-- Enable Row Level Security
ALTER TABLE kv_store_f573a585 ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to manage their own data
CREATE POLICY "Users can manage their own data" ON kv_store_f573a585
  FOR ALL
  USING (auth.uid()::text = user_id);

-- Create policy to allow service role full access
CREATE POLICY "Service role has full access" ON kv_store_f573a585
  FOR ALL
  USING (true);
```

### Setup Environment Variables

1. Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Update `src/utils/supabase/info.tsx`:

```tsx
export const projectId = import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] || ''
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
```

3. Update `src/utils/supabase/client.ts`:

```tsx
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}
```

## Step 5: Deploy Supabase Edge Functions

The backend server needs to be deployed as a Supabase Edge Function.

### Initialize Supabase in your project:

```bash
supabase init
```

### Link to your Supabase project:

```bash
supabase link --project-ref your-project-ref
```

### Create the Edge Function:

```bash
supabase functions new make-server-f573a585
```

### Copy your server code:

Copy the contents from `supabase/functions/server/index.tsx` to `supabase/functions/make-server-f573a585/index.ts`

**IMPORTANT**: Update the imports in the Edge Function file:

```typescript
// Change this:
import * as kv from './kv_store.tsx'

// To this (create a separate file):
import * as kv from '../_shared/kv_store.ts'
```

Create `supabase/functions/_shared/kv_store.ts` with the kv_store code.

### Deploy the Edge Function:

```bash
# Set your service role key as a secret
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Deploy the function
supabase functions deploy make-server-f573a585
```

### Test the deployment:

```bash
curl -i --location --request GET 'https://your-project-ref.supabase.co/functions/v1/make-server-f573a585/health' \
  --header 'Authorization: Bearer your-anon-key'
```

## Step 6: Fix Import Path Issues

Since this was built for Figma Make, some imports need to be updated:

1. **Update all component imports** to use relative paths from `src/`:
   - Change `'./components/...'` to `'../components/...'` where needed
   - Ensure all paths are relative to the current file location

2. **Remove `figma:asset` imports** - The ImageWithFallback component should work, but any direct figma:asset imports won't work locally

3. **Update API calls** in `src/utils/api.ts` to use environment variables:

```typescript
const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-f573a585`
```

## Step 7: Common Issues and Solutions

### Issue 1: "Module not found" errors
**Solution**: Check that all import paths are correct and packages are installed

### Issue 2: Tailwind classes not working
**Solution**: 
- Ensure `globals.css` is imported in `main.tsx`
- Run `npm run dev` to start the dev server with Tailwind processing

### Issue 3: Supabase auth not working
**Solution**: 
- Check environment variables are correctly set
- Verify Supabase project is active
- Check browser console for specific error messages

### Issue 4: Edge Function errors
**Solution**:
- Check Supabase Functions logs: `supabase functions logs make-server-f573a585`
- Ensure CORS is properly configured
- Verify service role key is set correctly

### Issue 5: TypeScript errors
**Solution**: Create a `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Step 8: Running the Project

1. **Start the development server**:
```bash
npm run dev
```

2. **Access the app**:
   - Open your browser to `http://localhost:5173` (or the port Vite assigns)

3. **Test the features**:
   - Create an account (signup)
   - Login
   - Test expense creation
   - Test group functionality

## Step 9: Development Workflow

### VSCode Extensions (Recommended):
- **ESLint** - For code linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind class autocomplete
- **ES7+ React/Redux/React-Native snippets** - React snippets

### Debugging:
1. Open Browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed API calls
4. Use React DevTools extension

### Hot Reload:
- Vite provides hot module replacement (HMR)
- Changes to React components will update instantly
- CSS changes apply immediately

## Critical Environment Variables Checklist

Make sure these are set:
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ✅ Supabase Secret: `SUPABASE_SERVICE_ROLE_KEY` (in Supabase dashboard)

## Security Reminders

⚠️ **NEVER commit these to Git**:
- `.env.local` file
- Service Role Key
- Any API keys

Add to `.gitignore`:
```
.env.local
.env
*.local
node_modules/
dist/
```

## Need Help?

If you encounter issues:
1. Check Supabase logs in dashboard
2. Check browser console for frontend errors
3. Check Supabase Functions logs: `supabase functions logs`
4. Verify all environment variables are set correctly
5. Ensure all npm packages are installed

## Next Steps After Setup

Once running locally, you can:
- Add new features
- Test thoroughly
- Debug issues easily
- Deploy to production (Vercel, Netlify, etc.)

---

**Happy Coding! 🚀**
