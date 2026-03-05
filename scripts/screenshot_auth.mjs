import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';
import { join } from 'path';

const OUT = '/Users/macair/.gemini/antigravity/brain/e5c1baf4-9e98-48fa-a87b-d6ff2374a1a8';
mkdirSync(OUT, { recursive: true });

const PAGES = [
    { url: 'http://localhost:5173/auth', file: 'auth_gateway.png' },
    { url: 'http://localhost:5173/auth/patient/login', file: 'patient_login.png' },
    { url: 'http://localhost:5173/auth/patient/signup', file: 'patient_signup.png' },
    { url: 'http://localhost:5173/auth/provider/login', file: 'provider_login.png' },
    { url: 'http://localhost:5173/auth/provider/signup', file: 'provider_signup.png' },
];

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

for (const { url, file } of PAGES) {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 800)); // let animations settle
    await page.screenshot({ path: join(OUT, file), fullPage: true });
    console.log('✅', file);
}

await browser.close();
console.log('Done. Screenshots saved to', OUT);
