import { preview } from 'vite';
import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Same public client config as src/shared/lib/firebase.ts. This is the
// public web API key, safe to use here -- read access is governed by
// Firestore security rules, not this key.
const firebaseConfig = {
  apiKey: "AIzaSyD2k1iCQ8Z4O1YiHyF04Ec_oyHrTfm9RaQ",
  authDomain: "wellirecord-b977f.firebaseapp.com",
  projectId: "wellirecord-b977f",
  storageBucket: "wellirecord-b977f.firebasestorage.app",
  messagingSenderId: "898120818136",
  appId: "1:898120818136:web:237dcb9165e3c9796266ad",
};

// BlogPage.tsx ships these four posts hardcoded as a fallback whenever a
// matching Firestore doc doesn't exist -- they're real, live routes
// regardless of what's in Firestore, so they need prerendering too even if
// the Firestore fetch below returns nothing or fails.
const FALLBACK_BLOG_SLUGS = [
  'securing-electronic-health-records-nigeria',
  'owning-your-health-data-nigeria-ndpa-2023',
  'simple-allergy-check-saved-life',
  'hidden-cost-fragmented-health-records',
];

async function fetchBlogSlugs() {
  const slugs = new Set(FALLBACK_BLOG_SLUGS);
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const snapshot = await getDocs(collection(db, 'blog_posts'));
    snapshot.forEach((doc) => {
      const slug = doc.data().slug;
      if (slug) slugs.add(slug);
    });
  } catch (err) {
    console.warn(`Warning: could not fetch blog_posts from Firestore (${err.message}). Prerendering fallback slugs only.`);
  }
  return Array.from(slugs);
}

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

const SITE_ORIGIN = 'https://www.wellirecord.com';

// index.html ships one static canonical/og:url/twitter:url, all pointing at
// the homepage. Prerendering just captures whatever that static markup says,
// so without this every route was shipping the homepage's canonical URL --
// telling crawlers that /about, /security, /blog, etc. are all duplicates
// of "/" and should be excluded from indexing in favor of it. Rewrite those
// three tags per route after capture so each page self-canonicalizes.
function withCanonicalUrl(html, url) {
  return html
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:url" content=")[^"]*(")/, `$1${url}$2`);
}

async function run() {
  const server = await preview({ preview: { port: 4173 } });
  const browser = await getBrowser();
  const page = await browser.newPage();

  const blogSlugs = await fetchBlogSlugs();
  const allRoutes = [...routes, ...blogSlugs.map((slug) => `/blog/${slug}`)];

  // Routes that load their content asynchronously after the initial page
  // load (e.g. via Firestore) need an explicit wait for a readiness marker
  // rather than relying on networkidle0, which can resolve before the
  // async fetch has even started. Applies to the /blog index and every
  // individual /blog/:slug page -- both use the same fetch-then-render path.
  const blogReadyMarker = 'body[data-blog-ready="true"]';

  for (const route of allRoutes) {
    try {
    await page.goto(`http://localhost:4173${route}`, { waitUntil: 'networkidle2', timeout: 45000 });
  } catch (err) {
    console.warn(`Warning: navigation to ${route} did not settle within 45s (${err.message}). Prerendering current state anyway.`);
  }
    if (route === '/blog' || route.startsWith('/blog/')) {
      try {
        await page.waitForSelector(blogReadyMarker, { timeout: 8000 });
      } catch (err) {
        console.warn(`Warning: ${route} did not reach ready state ("${blogReadyMarker}") within 8s. Prerendering current state anyway.`);
      }
    }

    const html = await page.content();

    // /home renders the identical LandingPages component as "/" -- it's a
    // genuine duplicate, so it canonicalizes to the homepage rather than
    // itself. Every other route canonicalizes to its own URL.
    const canonicalPath = route === '/home' ? '/' : route;
    const canonicalUrl = canonicalPath === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${canonicalPath}`;
    const finalHtml = withCanonicalUrl(html, canonicalUrl);

    const outPath = route === '/'
      ? 'dist/index.html'
      : `dist${route}/index.html`;

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, finalHtml);
    console.log(`Prerendered: ${route} -> ${outPath} (canonical: ${canonicalUrl})`);
  }

  await browser.close();
  await server.close();
}

run();
