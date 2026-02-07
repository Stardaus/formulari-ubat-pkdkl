const CACHE_NAME = "formulary-cache-v12";
const VERSION_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTFA9lhUhdSk7L_t0XnGtGzrIMw1g9EXrNjmRfaBaQ8naqAy7ua8r_lpeth-LPQQS2pOMlKKSbvYQuB/pub?gid=411569782&single=true&output=csv";

const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
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
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  // We only intercept requests for the MAIN Google Sheet (the medication list)
  // We assume the version sheet is fetched internally by the SW, not the app.
  if (event.request.url.includes("docs.google.com/spreadsheets") && !event.request.url.includes(VERSION_SHEET_URL)) {
    
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        // 1. Serve the Cached Medication Data Immediately (Fast Load)
        const cachedMedicationResponse = await cache.match(event.request);
        
        // 2. Perform Background Version Check
        const updateCheckPromise = (async () => {
          try {
            // A. Fetch the Version Sheet from Network
            // Add cache busting to ensure we get the real latest version
            const versionUrlWithBust = new URL(VERSION_SHEET_URL);
            versionUrlWithBust.searchParams.append("_t", Date.now());
            
            const versionResponse = await fetch(versionUrlWithBust);
            if (!versionResponse.ok) throw new Error("Failed to fetch version sheet");
            
            const versionText = await versionResponse.text();
            
            // Parse the new version (Unix Timestamp)
            // Expected format: data_version,17389...
            const versionRegex = /"?data_version"?,+"?(\d+)"?/i;
            const match = versionText.match(versionRegex);
            
            if (!match) {
              console.log("Could not parse version from version sheet. Content:", versionText);
              return; 
            }
            
            const newVersion = parseInt(match[1]);

            // B. Get the Cached Version
            // We store the version sheet response in the cache too, keyed by the base VERSION_SHEET_URL
            const cachedVersionResponse = await cache.match(VERSION_SHEET_URL);
            let oldVersion = 0;
            
            if (cachedVersionResponse) {
              const cachedVersionText = await cachedVersionResponse.text();
              const cachedMatch = cachedVersionText.match(versionRegex);
              if (cachedMatch) {
                oldVersion = parseInt(cachedMatch[1]);
              }
            }

            console.log(`Version Check: Cached=${oldVersion}, Network=${newVersion}`);

            // C. Compare & Update
            if (newVersion > oldVersion) {
              console.log("New version detected! Fetching fresh medication data...");
              
              // 1. Fetch the LARGE Medication Sheet
              // We use the original request URL (which is the medication sheet)
              // Append cache buster
              const medicationUrlWithBust = new URL(event.request.url);
              medicationUrlWithBust.searchParams.append("_t", Date.now());
              
              const newMedicationResponse = await fetch(medicationUrlWithBust);
              
              if (newMedicationResponse.ok) {
                // 2. Update Caches
                // Save the new Medication Data
                await cache.put(event.request, newMedicationResponse.clone());
                // Save the new Version Data (so next time we know we are up to date)
                // We use the CLEAN version URL (no cache busters) as the key
                await cache.put(VERSION_SHEET_URL, new Response(versionText));

                console.log("Cache updated. Notifying clients.");
                
                // 3. Notify App
                const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
                clients.forEach(client => client.postMessage({ type: 'NEW_DATA_AVAILABLE' }));
              }
            } else {
              console.log("App is up to date.");
            }
            
          } catch (err) {
            console.error("Background update check failed:", err);
          }
        })();

        // Ensure the background check runs even if the browser closes the fetch event early?
        // Usually event.waitUntil is for push/sync, but here we just let it run.
        // If cached response exists, return it. If not, we MUST wait for network.
        if (cachedMedicationResponse) {
          return cachedMedicationResponse;
        } else {
          // If no cache (first load), we have to fetch the medication sheet normally.
          // We can also seize this moment to cache the version.
          const networkResponse = await fetch(event.request);
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
            // We should also try to fetch/cache the version info for next time
            // but we can let the next reload handle that or fire-and-forget here.
          }
          return networkResponse;
        }
      })
    );
  } else {
    // Normal cache-first for assets
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});