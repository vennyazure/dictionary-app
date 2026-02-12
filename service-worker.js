const CACHE_NAME = "dictionary-app-cache-v1";
const urlsToCache = [
  "/dictionary-app/",
  "/dictionary-app/index.html",
  "/dictionary-app/style.css",
  "/dictionary-app/script.js",
  "/dictionary-app/manifest.json",
  "/dictionary-app/icon-192.png",
  "/dictionary-app/icon-512.png"
];

// Install Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate Service Worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker Activated");
});

// Fetch From Cache First
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
