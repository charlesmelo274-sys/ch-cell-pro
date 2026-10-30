const CACHE_NAME = 'chcell-pro-v11-persist-extras';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia Network-First: Sempre busca a versão mais recente do servidor
// Se estiver offline, aí sim utiliza os arquivos salvos em cache
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('/api/')) return;
  
  e.respondWith(
    fetch(e.request)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200 && networkRes.type === 'basic') {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        }
        return networkRes;
      })
      .catch(() => {
        return caches.match(e.request).then((cachedRes) => {
          return cachedRes || (e.request.mode === 'navigate' ? caches.match('./index.html') : null);
        });
      })
  );
});
