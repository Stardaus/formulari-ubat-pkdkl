const CACHE_NAME = "formulary-cache-v5"; // Increment cache version
const urlsToCache = [
  "./",
  "./index.html",
  "./assets/css/style.css",
  "./assets/js/app.js",
  "./assets/js/fetchSheet.js",
  "./assets/js/analytics.js",
  "https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.min.js",
  "https://unpkg.com/papaparse@5.5.3/papaparse.min.js",
  "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap",
  "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxK.woff2",
];

self.addEventListener("install", (event) => {
  self.skipWaiting(); // Force activation immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }).then(() => self.clients.claim()) // Take control of clients immediately
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  // 1. Handle Google Sheet Requests (Stale-While-Revalidate)
  if (event.request.url.includes("docs.google.com/spreadsheets")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        // Try to get from cache INSTANTLY
        const cachedResponse = await cache.match(event.request);

        // Start the network fetch in the background to update the cache
        const networkFetch = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
                cache.put(event.request, networkResponse.clone());
                // Notify the UI that new data is ready
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => client.postMessage({type: 'NEW_DATA_AVAILABLE'}));
                });
            }
            return networkResponse;
          })
          .catch(() => {
            console.log("Network failed, keeping old cache.");
          });

        // Return the cached response immediately if available, otherwise wait for network
        return cachedResponse || networkFetch;
      })
    );
    return;
  }

  // 2. Cache-first for all other requests (App Shell)
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});