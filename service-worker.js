const CACHE_NAME = "formulary-cache-v3"; // Increment cache version
const urlsToCache = [
  "/",
  "/index.html",
  "/assets/css/style.css",
  "/assets/js/app.js",
  "/assets/js/fetchSheet.js",
  "https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.min.js",
  "https://unpkg.com/papaparse@5.3.0/papaparse.min.js",
  "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap",
  "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxK.woff2", // Example font file
];

self.addEventListener("install", (event) => {
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
    }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  // Stale-while-revalidate for the Google Sheet
  if (event.request.url.startsWith("https://docs.google.com/spreadsheets/d/")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return fetch(event.request).then((fetchedResponse) => {
          cache.put(event.request, fetchedResponse.clone());
          // Notify clients that new data is available
          self.clients.matchAll().then(clients => {
            clients.forEach(client => client.postMessage({type: 'NEW_DATA_AVAILABLE'}));
          });
          return fetchedResponse;
        }).catch(() => {
          return cache.match(event.request);
        });
      })
    );
  } else {
    // Cache-first for all other requests
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
