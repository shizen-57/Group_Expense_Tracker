#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks if all requirements are met for running the project
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}\n`),
};

let errors = 0;
let warnings = 0;

// Check Node.js version
log.header('1. Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

if (majorVersion >= 18) {
  log.success(`Node.js ${nodeVersion} ✓ (Required: v18+)`);
} else {
  log.error(`Node.js ${nodeVersion} - Please upgrade to v18 or higher`);
  errors++;
}

// Check npm version
log.header('2. Checking npm version...');
try {
  const { execSync } = require('child_process');
  const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
  const npmMajor = parseInt(npmVersion.split('.')[0]);
  
  if (npmMajor >= 9) {
    log.success(`npm ${npmVersion} ✓ (Required: v9+)`);
  } else {
    log.warning(`npm ${npmVersion} - Recommended: v9+`);
    warnings++;
  }
} catch (error) {
  log.error('npm not found - Please install Node.js with npm');
  errors++;
}

// Check if package.json exists
log.header('3. Checking package.json...');
if (fs.existsSync('package.json')) {
  log.success('package.json found');
  
  // Check if dependencies are installed
  if (fs.existsSync('node_modules')) {
    log.success('node_modules folder exists');
    
    // Check key dependencies
    const keyDeps = [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      'lucide-react',
      'recharts',
      'tailwindcss',
    ];
    
    keyDeps.forEach((dep) => {
      if (fs.existsSync(`node_modules/${dep}`)) {
        log.success(`${dep} installed`);
      } else {
        log.error(`${dep} not found - Run 'npm install'`);
        errors++;
      }
    });
  } else {
    log.error('node_modules not found - Run "npm install"');
    errors++;
  }
} else {
  log.error('package.json not found');
  errors++;
}

// Check environment variables
log.header('4. Checking environment configuration...');
if (fs.existsSync('.env')) {
  log.success('.env file found');
  
  const envContent = fs.readFileSync('.env', 'utf-8');
  
  if (envContent.includes('VITE_SUPABASE_URL=')) {
    const url = envContent.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
    if (url && url !== 'your_supabase_url_here' && url.includes('supabase.co')) {
      log.success('VITE_SUPABASE_URL configured');
    } else {
      log.error('VITE_SUPABASE_URL not properly set');
      errors++;
    }
  } else {
    log.error('VITE_SUPABASE_URL missing from .env');
    errors++;
  }
  
  if (envContent.includes('VITE_SUPABASE_ANON_KEY=')) {
    const key = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();
    if (key && key !== 'your_supabase_anon_key_here' && key.length > 50) {
      log.success('VITE_SUPABASE_ANON_KEY configured');
    } else {
      log.error('VITE_SUPABASE_ANON_KEY not properly set');
      errors++;
    }
  } else {
    log.error('VITE_SUPABASE_ANON_KEY missing from .env');
    errors++;
  }
} else {
  log.warning('.env file not found - Copy .env.example to .env');
  log.info('Run: cp .env.example .env');
  warnings++;
}

// Check required files
log.header('5. Checking required files...');
const requiredFiles = [
  'index.html',
  'main.tsx',
  'App.tsx',
  'vite.config.ts',
  'tsconfig.json',
  'styles/globals.css',
  'utils/supabase/client.ts',
  'utils/supabase/info.tsx',
];

requiredFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    log.success(`${file} exists`);
  } else {
    log.error(`${file} not found`);
    errors++;
  }
});

// Check Supabase info
log.header('6. Checking Supabase configuration...');
if (fs.existsSync('utils/supabase/info.tsx')) {
  const infoContent = fs.readFileSync('utils/supabase/info.tsx', 'utf-8');
  
  if (infoContent.includes('export const projectId')) {
    if (infoContent.includes("'your-project-id'") || infoContent.includes('"your-project-id"')) {
      log.warning('projectId in info.tsx needs to be updated');
      warnings++;
    } else {
      log.success('projectId configured in info.tsx');
    }
  }
  
  if (infoContent.includes('export const publicAnonKey')) {
    if (infoContent.includes("'your-anon-key'") || infoContent.includes('"your-anon-key"')) {
      log.warning('publicAnonKey in info.tsx needs to be updated');
      warnings++;
    } else {
      log.success('publicAnonKey configured in info.tsx');
    }
  }
}

// Check TypeScript configuration
log.header('7. Checking TypeScript setup...');
if (fs.existsSync('tsconfig.json')) {
  log.success('tsconfig.json exists');
  
  const tsconfigContent = fs.readFileSync('tsconfig.json', 'utf-8');
  if (tsconfigContent.includes('"baseUrl"') && tsconfigContent.includes('"paths"')) {
    log.success('Path aliases configured');
  } else {
    log.warning('Path aliases may not be configured');
    warnings++;
  }
}

// Summary
log.header('Setup Verification Summary');
console.log(`${colors.bold}Total Checks:${colors.reset} ${errors + warnings === 0 ? colors.green : errors > 0 ? colors.red : colors.yellow}✓${colors.reset}`);

if (errors > 0) {
  console.log(`${colors.red}${colors.bold}Errors: ${errors}${colors.reset}`);
}

if (warnings > 0) {
  console.log(`${colors.yellow}${colors.bold}Warnings: ${warnings}${colors.reset}`);
}

if (errors === 0 && warnings === 0) {
  console.log(`\n${colors.green}${colors.bold}🎉 All checks passed! You're ready to run the project.${colors.reset}\n`);
  console.log(`${colors.cyan}Run: npm run dev${colors.reset}\n`);
} else if (errors === 0) {
  console.log(`\n${colors.yellow}${colors.bold}⚠ Setup is mostly complete, but please review warnings.${colors.reset}\n`);
  console.log(`${colors.cyan}You can try: npm run dev${colors.reset}\n`);
} else {
  console.log(`\n${colors.red}${colors.bold}❌ Please fix the errors above before running the project.${colors.reset}\n`);
  console.log(`${colors.cyan}Common fixes:${colors.reset}`);
  console.log(`  1. Run: npm install`);
  console.log(`  2. Copy: cp .env.example .env`);
  console.log(`  3. Edit .env with your Supabase credentials`);
  console.log(`  4. Update utils/supabase/info.tsx\n`);
}

process.exit(errors > 0 ? 1 : 0);
