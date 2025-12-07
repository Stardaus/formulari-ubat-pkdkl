const CACHE_NAME = "formulary-cache-v8"; // Incremented version to force update
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
    })
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
        })
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
  // 1. Handle Google Sheet Requests (Stale-while-revalidate with notification)
  if (event.request.url.includes("docs.google.com/spreadsheets")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        // Match the request in the cache
        const cachedResponse = await cache.match(event.request);

        // --- CRITICAL FIX: CLONE IMMEDIATELY ---
        // We need a separate clone to read the text for comparison. 
        // We cannot use 'cachedResponse' for this because it will be returned 
        // to the browser at the bottom of this function.
        let cachedResponseForComparison = null;
        if (cachedResponse) {
          cachedResponseForComparison = cachedResponse.clone();
        }

        // Fetch from network in the background
        const networkFetch = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              const responseCloneForCache = networkResponse.clone();
              const responseCloneForText = networkResponse.clone();

              // Compare Old Cache vs New Network Data
              Promise.all([
                // If we have a cache clone, get its text. If not, resolve null.
                cachedResponseForComparison ? cachedResponseForComparison.text() : Promise.resolve(null),
                responseCloneForText.text()
              ]).then(async ([cachedText, newText]) => {

                // If there was no cache, just save the new one
                if (cachedText === null) {
                  await cache.put(event.request, responseCloneForCache);
                }
                // If data has changed
                else if (cachedText !== newText) {
                  console.log("New data detected. Updating cache.");
                  await cache.put(event.request, responseCloneForCache);

                  // Notify the front-end to show the popup
                  const clients = await self.clients.matchAll();
                  clients.forEach(client => client.postMessage({ type: 'NEW_DATA_AVAILABLE' }));
                } else {
                  console.log("Data matches cache. No update needed.");
                }
              });
            }
            return networkResponse;
          })
          .catch((err) => {
            console.log("Network failed, keeping old cache.", err);
            // If network fails, the browser will rely on the cachedResponse returned below
            return cachedResponse;
          });

        // Return the original cachedResponse immediately (fast load), 
        // or wait for network if cache is empty.
        return cachedResponse || networkFetch;
      })
    );
  }

  // 2. Handle all other assets (Cache First)
  else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});