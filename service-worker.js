/* Vista Humana · service worker · mps21-v5.2.0
   · Las páginas van primero a internet (así siempre hay versión nueva) y, sin señal, salen del teléfono.
   · Íconos y librerías se guardan en el teléfono.
   · Los datos (Firebase) NUNCA pasan por acá: van directo, con su propia seguridad. */
const VERSION = 'mps21-v5.2.0';
const CACHE = 'vh-' + VERSION;
const BASE = ['./', 'index.html', '404.html', 'maestro.html', 'liquidacion.html', 'manifest.json', 'manifest-maestro.json', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'favicon-32.png', 'apple-touch-icon.png'];
const LIBRERIAS = /^https:\/\/(www\.gstatic\.com\/firebasejs\/|cdnjs\.cloudflare\.com\/ajax\/libs\/)/;
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(BASE.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => { })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('vh-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
const conTiempo = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('tiempo')), ms))]);
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (req.mode === 'navigate' || /\.html$/.test(url.pathname) || url.pathname.endsWith('/')) {
      e.respondWith(conTiempo(fetch(req), 6000).then((r) => { if (r && r.ok) { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname, cp)); } return r; })
        .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))));
      return;
    }
    e.respondWith(caches.match(req, { ignoreSearch: true }).then((r) => r || fetch(req).then((x) => { if (x && x.ok) { const cp = x.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); } return x; })));
    return;
  }
  if (LIBRERIAS.test(req.url)) {
    e.respondWith(caches.open(CACHE).then((c) => c.match(req).then((r) => { const red = fetch(req).then((x) => { if (x && x.ok) c.put(req, x.clone()); return x; }).catch(() => r); return r || red; })));
  }
});
