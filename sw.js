const CACHE_NAME = "iow-cache-v3"; // 公開ごとに数字を上げる

const BASE_PATH = "/InsertOneWord-Companion/";

const ASSETS = [
  BASE_PATH,
  BASE_PATH + "index.html",
  BASE_PATH + "style.css",
  BASE_PATH + "manifest.json",
  BASE_PATH + "src/app.js",
  BASE_PATH + "src/logic.js",
  BASE_PATH + "src/state.js",
  BASE_PATH + "src/storage.js",
  BASE_PATH + "src/words.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request);
    })
  );
});
