#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 Vercel Deployment Pre-flight Check\n');

const checks = [
  {
    name: 'vercel.json exists',
    check: () => fs.existsSync('vercel.json'),
    fix: 'Create vercel.json with proper configuration'
  },
  {
    name: '.env.example exists',
    check: () => fs.existsSync('.env.example'),
    fix: 'Create .env.example with environment variables template'
  },
  {
    name: 'public/robots.txt exists',
    check: () => fs.existsSync('public/robots.txt'),
    fix: 'Create robots.txt for SEO'
  },
  {
    name: 'public/manifest.json exists',
    check: () => fs.existsSync('public/manifest.json'),
    fix: 'Create manifest.json for PWA support'
  },
  {
    name: 'package.json has build script',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return pkg.scripts && pkg.scripts.build;
    },
    fix: 'Add build script to package.json'
  },
  {
    name: 'index.html has proper meta tags',
    check: () => {
      const html = fs.readFileSync('index.html', 'utf8');
      return html.includes('og:title') && html.includes('og:description');
    },
    fix: 'Add Open Graph meta tags to index.html'
  }
];

let allPassed = true;

checks.forEach(({ name, check, fix }) => {
  const passed = check();
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}`);
  
  if (!passed) {
    console.log(`   💡 ${fix}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! Ready for Vercel deployment.');
  console.log('\n📋 Next steps:');
  console.log('1. Push code to GitHub');
  console.log('2. Connect repository to Vercel');
  console.log('3. Configure environment variables in Vercel dashboard');
  console.log('4. Deploy!');
} else {
  console.log('⚠️  Some checks failed. Please fix the issues above before deploying.');
  process.exit(1);
}