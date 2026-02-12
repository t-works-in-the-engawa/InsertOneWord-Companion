self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("iow-v1").then(cache => {
      return cache.addAll([
        "/",
        "/index.html",
        "/style.css",
        "/src/app.js"
      ]);
    })
  );
});
