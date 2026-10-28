/**
 * Samudra-Alert — app icon & splash generation helper.
 *
 * Prerequisites:
 *   cd client
 *   npm i -D @capacitor/assets
 *
 * Source assets (1024x1024 PNG with transparency for the icon; 2732x2732 for splash):
 *   client/resources/icon-only.png
 *   client/resources/icon-foreground.png
 *   client/resources/icon-background.png   (solid #031B34 recommended)
 *   client/resources/splash.png
 *
 * Run:
 *   node scripts/generate-icons.js
 *   → writes all Android mipmap densities + splash sizes
 *   → then: npm run mobile:sync
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const resourcesDir = path.join(__dirname, '..', 'resources');
const missing = ['icon-only.png', 'splash.png'].filter((f) => !fs.existsSync(path.join(resourcesDir, f)));

if (missing.length) {
  console.error('Missing source images in client/resources/:', missing.join(', '));
  console.error('Add a 1024x1024 icon-only.png and 2732x2732 splash.png, then re-run.');
  process.exit(1);
}

try {
  execSync('npx @capacitor/assets generate --android', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('\n✅ Icons and splash generated. Run `npm run mobile:sync` to apply.');
} catch (err) {
  console.error('Generation failed. Is @capacitor/assets installed? (npm i -D @capacitor/assets)');
  process.exit(1);
}
