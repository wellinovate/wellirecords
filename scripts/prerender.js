import { preview } from 'vite';
import fs from 'fs';
import path from 'path';

const routes = [
  '/',
  '/home',
  '/how-it-works',
  '/partners',
  '/security',
  '/privacy',
  '/terms',
  '/about',
  '/blog',
];

const isVercel = !!process.env.VERCEL;

async function getBrowser() {
  if (isVercel) {
    const puppeteer = (await import('puppeteer-core')).default;
    const chromium = (await import('@sparticuz/chromium')).default;
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    const puppeteer = (await import('puppeteer')).default;
    return puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  }
}

async function run() {
  const server = await preview({ preview: { port: 4173 } });
  const browser = await getBrowser();
  const page = await browser.newPage();

  for (const route of routes) {
    await page.goto(`http://localhost:4173${route}`, { waitUntil: 'networkidle0' });
    const html = await page.content();

    const outPath = route === '/'
      ? 'dist/index.html'
      : `dist${route}/index.html`;

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html);
    console.log(`Prerendered: ${route} -> ${outPath}`);
  }

  await browser.close();
  await server.close();
}

run();
