import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';

const DIR = '/tmp/claude-0/-home-user-aura-exosome-landing/531ab92a-03d4-5fc2-b25b-70799e4c542e/scratchpad/ad';
const OUT = path.join(DIR, 'frames');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const FPS = 30, DUR = 12.0;
const TOTAL = Math.round(FPS * DUR);

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-color-profile=srgb', '--font-render-hinting=none']
});
const page = await browser.newPage({
  viewport: { width: 1080, height: 1920 },
  deviceScaleFactor: 1
});

await page.goto('file://' + path.join(DIR, 'ad.html') + '?t=0', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1200);

const loaded = await page.evaluate(() => ({
  bodoni: document.fonts.check('500 96px "Bodoni Moda"'),
  jost: document.fonts.check('400 25px "Jost"'),
  hasRender: typeof window.__render === 'function'
}));
console.log('fonts/render:', JSON.stringify(loaded));
if (!loaded.hasRender) { throw new Error('render fn missing'); }

for (let i = 0; i < TOTAL; i++) {
  const t = i / FPS;
  await page.evaluate((tt) => window.__render(tt), t);
  await page.screenshot({
    path: path.join(OUT, String(i).padStart(4, '0') + '.png'),
    animations: 'disabled'
  });
  if (i % 60 === 0) console.log('frame', i, '/', TOTAL);
}

await browser.close();
console.log('done:', TOTAL, 'frames');
