/* ============================================================
 *  Service Worker — Inventario Hazmat (PWA)
 *  - Con conexión SIEMPRE trae la versión fresca (no hace falta
 *    cambiar ningún número de versión al desplegar).
 *  - Sin conexión usa la última copia cacheada.
 *  - NUNCA cachea las llamadas al servidor de datos (Apps Script /
 *    Drive): esas van siempre a la red.
 *  La app se autoactualiza sola cuando cambia el index.html.
 * ============================================================ */
const CACHE = 'hazmat-app';   // nombre fijo; el contenido se refresca solo

const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

// Instala y precachea el shell (pidiendo copias frescas)
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(new Request(u, { cache: 'reload' })))))
      .then(() => self.skipWaiting())
  );
});

// Limpia cachés antiguas (incluidas las versionadas antiguas hazmat-vN)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function esApiDatos(url) {
  return url.hostname.includes('script.google.com') ||
         url.hostname.includes('script.googleusercontent.com') ||
         url.hostname.includes('drive.google.com') ||
         url.hostname.includes('googleusercontent.com');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;                 // no tocar POST (guardados)
  const url = new URL(req.url);

  // Datos y fotos de Google: siempre a la red, sin cachear
  if (esApiDatos(url)) return;

  // Navegación (abrir/recargar la app): RED primero (sin caché del navegador),
  // guardamos copia para offline, y si no hay red usamos la copia.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req, { cache: 'no-store' })
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); return res; })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // Recursos propios (iconos, manifest…): red primero para que se actualicen solos,
  // con la caché como reserva sin conexión.
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Scripts de CDN (tailwind, heic2any, qr): stale-while-revalidate
  if (url.hostname.includes('cdn.jsdelivr.net')) {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(req).then((hit) => {
          const net = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
          return hit || net;
        })
      )
    );
    return;
  }
});
