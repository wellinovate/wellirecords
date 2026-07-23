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
  // Public entry points linked from the homepage/nav. Previously not
  // prerendered, so vercel.json's catch-all rewrite ("/(.*)" -> "/")
  // served these to crawlers as the homepage instead of their own content.
  // Internal-only routes (provider login, super-admin login, org
  // verification) are intentionally left out of this list.
  '/auth/login',
  '/auth/pre-signup',
  '/auth/patient/signup',
  '/auth/provider/signup',
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

  // Routes that load their content asynchronously after the initial page
  // load (e.g. via Firestore) need an explicit wait for a readiness marker
  // rather than relying on networkidle0, which can resolve before the
  // async fetch has even started.
  const readyMarkers = {
    '/blog': 'body[data-blog-ready="true"]',
  };

  for (const route of routes) {
    try {
    await page.goto(`http://localhost:4173${route}`, { waitUntil: 'networkidle2', timeout: 45000 });
  } catch (err) {
    console.warn(`Warning: navigation to ${route} did not settle within 45s (${err.message}). Prerendering current state anyway.`);
  }
    const marker = readyMarkers[route];
    if (marker) {
      try {
        await page.waitForSelector(marker, { timeout: 8000 });
      } catch (err) {
        console.warn(`Warning: ${route} did not reach ready state ("${marker}") within 8s. Prerendering current state anyway.`);
      }
    }

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
