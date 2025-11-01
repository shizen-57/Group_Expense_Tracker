# Local Development Setup Guide

This guide will help you download and run the SplitWise expense-splitting app on your local machine using VS Code.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager (comes with Node.js)
- **VS Code** - [Download here](https://code.visualstudio.com/)
- **Git** (optional, for version control)

## Step 1: Download the Project

Since this project was built in Figma Make, you'll need to download all the files. You can do this by:

1. Copy all the files and folders from this project
2. Create a new folder on your computer (e.g., `splitwise-app`)
3. Save all files maintaining the same directory structure shown above

## Step 2: Create Required Configuration Files

### 2.1 Create `package.json`

Create a file named `package.json` in the root directory:

```json
{
  "name": "splitwise-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "lucide-react": "^0.263.1",
    "recharts": "^2.10.3",
    "sonner": "^1.3.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-aspect-ratio": "^1.0.3",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-collapsible": "^1.0.3",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-hover-card": "^1.0.7",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-toggle": "^1.0.3",
    "@radix-ui/react-toggle-group": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "cmdk": "^0.2.0",
    "date-fns": "^3.0.6",
    "react-day-picker": "^8.10.0",
    "vaul": "^0.9.0",
    "embla-carousel-react": "^8.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
```

### 2.2 Create `vite.config.ts`

Create a file named `vite.config.ts` in the root directory:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

### 2.3 Create `tsconfig.json`

Create a file named `tsconfig.json` in the root directory:

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
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 2.4 Create `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

### 2.5 Create `index.html`

Create a file named `index.html` in the root directory:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SplitWise - Expense Splitting App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>
```

### 2.6 Create `main.tsx`

Create a file named `main.tsx` in the root directory:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 2.7 Create `.env` File

Create a file named `.env` in the root directory for your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**IMPORTANT:** You'll need to create a Supabase project and replace these values:
1. Go to [https://supabase.com](https://supabase.com)
2. Create a free account and new project
3. Go to Settings > API to find your credentials

### 2.8 Update `utils/supabase/info.tsx`

Modify this file to read from environment variables:

```tsx
export const projectId = import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] || '';
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
```

### 2.9 Create `.gitignore`

```
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Production
dist
build

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

## Step 3: Install Dependencies

Open your terminal in VS Code (Terminal > New Terminal) and run:

```bash
npm install
```

Or if you prefer yarn:

```bash
yarn install
```

This will install all the required packages defined in `package.json`.

## Step 4: Set Up Supabase (Backend)

### 4.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Wait for the project to be ready (takes ~2 minutes)

### 4.2 Set Up the KV Store Table
Run this SQL in your Supabase SQL Editor (Database > SQL Editor):

```sql
-- Create the key-value store table
CREATE TABLE IF NOT EXISTS kv_store_f573a585 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_kv_store_key ON kv_store_f573a585(key);

-- Enable Row Level Security
ALTER TABLE kv_store_f573a585 ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your security needs)
CREATE POLICY "Allow all operations" ON kv_store_f573a585
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### 4.3 Deploy Supabase Edge Function (Optional - if using server)

If you want to deploy the server edge function:

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref your-project-ref
```

4. Deploy the function:
```bash
supabase functions deploy make-server-f573a585 --project-ref your-project-ref
```

## Step 5: Run the Development Server

In your terminal, run:

```bash
npm run dev
```

Or with yarn:

```bash
yarn dev
```

The app should now be running at `http://localhost:5173` (or another port if 5173 is busy).

## Step 6: Open in VS Code

1. Open VS Code
2. Go to File > Open Folder
3. Select the project folder
4. The project should now be open with the file structure visible

### Recommended VS Code Extensions

Install these extensions for a better development experience:

1. **ES7+ React/Redux/React-Native snippets** - Code snippets
2. **Tailwind CSS IntelliSense** - Tailwind class autocomplete
3. **ESLint** - Code linting
4. **Prettier** - Code formatting
5. **TypeScript and JavaScript Language Features** (built-in)

## Troubleshooting

### Issue: Module not found errors
**Solution:** Make sure you've run `npm install` and all dependencies are installed.

### Issue: Supabase connection errors
**Solution:** 
- Check your `.env` file has the correct Supabase credentials
- Verify your Supabase project is running
- Make sure the table `kv_store_f573a585` exists

### Issue: Port already in use
**Solution:** 
- Kill the process using the port, or
- Vite will automatically suggest another port

### Issue: TypeScript errors
**Solution:** 
- Ensure `tsconfig.json` is properly configured
- Run `npm install` to ensure all type definitions are installed
- Restart the TypeScript server in VS Code (Cmd/Ctrl + Shift + P > "TypeScript: Restart TS Server")

### Issue: Tailwind styles not applying
**Solution:** 
- Verify `styles/globals.css` has the Tailwind directives:
```css
@import "tailwindcss";
```

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` folder, ready for deployment.

## Next Steps

- Set up authentication in Supabase if you want real user accounts
- Configure RLS (Row Level Security) policies for better data security
- Deploy to Vercel, Netlify, or another hosting platform
- Set up a custom domain

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Project Structure Overview

```
splitwise-app/
├── components/          # React components organized by feature
├── hooks/              # Custom React hooks for business logic
├── pages/              # Page-level components
├── styles/             # Global styles and Tailwind config
├── utils/              # Utility functions and API clients
├── supabase/           # Supabase edge functions (backend)
└── App.tsx             # Main application component
```

## Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Check the terminal for build/runtime errors
3. Verify all environment variables are set correctly
4. Ensure all configuration files are created properly

Happy coding! 🚀
