const BOT_USER_AGENTS = [
  'googlebot',
  'yahoo! slurp',
  'bingbot',
  'yandex',
  'baiduspider',
  'facebookexternalhit',
  'twitterbot',
  'rogerbot',
  'linkedinbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest/0.',
  'slackbot',
  'vkshare',
  'w3c_validator',
  'redditbot',
  'applebot',
];

const IGNORED_EXTENSIONS = [
  '.js', '.css', '.xml', '.less', '.png', '.jpg', '.jpeg', '.gif', '.pdf', '.doc', '.txt', '.ico', '.rss', '.zip', '.mp3', '.rar', '.exe', '.wmv', '.avi', '.ppt', '.mpg', '.mpeg', '.tif', '.wav', '.mov', '.psd', '.ai', '.xls', '.mp4', '.m4a', '.swf', '.dat', '.dmg', '.iso', '.flv', '.m4v', '.torrent', '.woff', '.woff2', '.ttf'
];

export default async function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const url = new URL(request.url);
  const pathname = url.pathname.toLowerCase();
  if (pathname.startsWith('/api/')) return undefined;
  const isBot = BOT_USER_AGENTS.some(bot => userAgent.includes(bot));
  const isStaticFile = IGNORED_EXTENSIONS.some(ext => pathname.endsWith(ext));

  if (isBot && !isStaticFile) {
    const originalUrl = `${url.protocol}//${request.headers.get('host') || 'wellirecord.com'}${url.pathname}${url.search}`;
    const targetUrl = `https://service.prerender.io/${originalUrl}`;

    const headers = new Headers();
    headers.set('User-Agent', request.headers.get('user-agent') || '');
    if (process.env.PRERENDER_TOKEN) {
      headers.set('X-Prerender-Token', process.env.PRERENDER_TOKEN);
    }

    try {
      const response = await fetch(targetUrl, { headers });
      const html = await response.text();
      return new Response(html, {
        status: response.status,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=86400, s-maxage=86400'
        }
      });
    } catch (err) {
      console.error('Prerender proxy error:', err);
    }
  }

  // Pass-through standard request
  return undefined;
}
