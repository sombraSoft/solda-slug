const CACHE_NAME = "solda-slug-cache-v2";
const urlsToCache = [
  "./",
  "./index.html",
  "./src/style.css",
  // Add all your assets here
  "./assets/background.png",
  "./assets/bozo_chora.png",
  "./assets/bozo_sentado.png",
  "./assets/bozo_telefone.ogg",
  "./assets/bozo.png",
  "./assets/cursor_gado.png",
  "./assets/gameover.ogg",
  "./assets/heart.svg",
  "./assets/menu_background.png",
  "./assets/menu_theme.ogg",
  "./assets/miau.ogg",
  "./assets/solda_quente.png",
  "./assets/solda_slug_banner.png",
  "./assets/solda_slug_opengraph.png",
  "./assets/solda.png",
  "./assets/soldering.ogg",
  "./assets/song_intro.ogg",
  "./assets/song_loop.ogg",
  "./assets/vaca.ogg",
  "./assets/xandao.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const response = await cache.match(event.request);
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      });
      return response || fetchPromise;
    }),
  );
});
