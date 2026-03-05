// WelliRecord Service Worker — Network-First Strategy
// Version bumped to v3 to force clearing of stale 'Offline Mode' cache entries
const CACHE_NAME = 'wellirecord-cache-v3';

// On install: skip waiting and take control immediately
self.addEventListener('install', event => {
    self.skipWaiting();
});

// On activate: delete ALL old caches so stale Offline Mode responses are gone
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch: NETWORK FIRST — always try the network, fall back to cache,
// and only show offline fallback as a last resort
self.addEventListener('fetch', event => {
    // Skip non-GET requests and chrome-extension requests
    if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension')) {
        return;
    }

    // For Vite dev server requests (JS modules, HMR) — always go to network, never cache
    const url = new URL(event.request.url);
    if (url.pathname.startsWith('/@') || url.pathname.endsWith('.tsx') ||
        url.pathname.endsWith('.ts') || url.pathname.includes('?v=') ||
        url.pathname.includes('?t=')) {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                // Only cache successful responses for static assets
                if (networkResponse.ok && (
                    url.pathname.endsWith('.png') ||
                    url.pathname.endsWith('.jpg') ||
                    url.pathname.endsWith('.css') ||
                    url.pathname.endsWith('.ico')
                )) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // Offline fallback: try cache, then show friendly message
                return caches.match(event.request).then(cached => {
                    if (cached) return cached;
                    // Only show offline page for navigation requests
                    if (event.request.mode === 'navigate') {
                        return new Response(
                            `<!DOCTYPE html><html><head><title>WelliRecord — Offline</title>
                            <style>body{font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc;color:#041E42;text-align:center;padding:2rem;}
                            h1{font-size:1.5rem;font-weight:800;margin-bottom:.5rem;}p{color:#64748b;}
                            button{margin-top:1.5rem;padding:.75rem 2rem;background:#041E42;color:#fff;border:none;border-radius:.75rem;font-weight:700;cursor:pointer;}</style></head>
                            <body><div><h1>You're Offline</h1><p>Please check your internet connection and try again.</p>
                            <button onclick="location.reload()">Try Again</button></div></body></html>`,
                            { headers: { 'Content-Type': 'text/html' } }
                        );
                    }
                    return new Response('', { status: 503 });
                });
            })
    );
});
