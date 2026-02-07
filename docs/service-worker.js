/**
 * Service Worker for Formulari Ubat PKD Kuala Langat.
 * 
 * Responsibilities:
 * 1. Caching Static Assets: Ensures the app shell (HTML, CSS, JS) loads instantly.
 * 2. Caching Dynamic Data: Caches the large Medication CSV for offline access.
 * 3. Smart Background Updates: Implements a "Two-Step" update strategy using a separate Version Sheet.
 *    - Checks a lightweight Version Sheet first.
 *    - Only downloads the heavy Medication Sheet if the version timestamp has increased.
 *    - Notifies the frontend when a new version is ready.
 */

const CACHE_NAME = "formulary-cache-v12";
const VERSION_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTFA9lhUhdSk7L_t0XnGtGzrIMw1g9EXrNjmRfaBaQ8naqAy7ua8r_lpeth-LPQQS2pOMlKKSbvYQuB/pub?gid=411569782&single=true&output=csv";

const urlsToCache = [
  "./",
  "index.html",
  "manifest.json",
  "favicon.ico",
];

// --- Install Phase ---
self.addEventListener("install", (event) => {
  self.skipWaiting(); // Force activation immediately to take control of open pages
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// --- Activate Phase ---
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Clean up old caches from previous versions
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

// --- Message Handling ---
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// --- Fetch Interception ---
self.addEventListener("fetch", (event) => {
  // Strategy for Google Sheets (Stale-While-Revalidate with Version Check)
  // We only intercept requests for the MAIN Google Sheet (the medication list).
  // The Version Sheet is fetched internally by this Service Worker, so we exclude it here to avoid recursion loops.
  if (event.request.url.includes("docs.google.com/spreadsheets") && !event.request.url.includes(VERSION_SHEET_URL)) {
    
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        // 1. Immediate Response: Serve the Cached Medication Data (Fast Load)
        const cachedMedicationResponse = await cache.match(event.request);
        
        // 2. Background Process: Check for Updates via the Version Sheet
        const updateCheckPromise = (async () => {
          try {
            // A. Fetch the lightweight Version Sheet from Network
            // Add cache busting query param (_t) to bypass browser HTTP cache
            const versionUrlWithBust = new URL(VERSION_SHEET_URL);
            versionUrlWithBust.searchParams.append("_t", Date.now());
            
            const versionResponse = await fetch(versionUrlWithBust);
            if (!versionResponse.ok) throw new Error("Failed to fetch version sheet");
            
            const versionText = await versionResponse.text();
            
            // Parse the new version (Unix Timestamp) from CSV
            // Expected format: data_version,17389...
            const versionRegex = /"?data_version"?,+"?(\d+)"?/i;
            const match = versionText.match(versionRegex);
            
            if (!match) {
              console.log("Could not parse version from version sheet. Content:", versionText);
              return; 
            }
            
            const newVersion = parseInt(match[1]);

            // B. Get the currently Cached Version
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
              // We use the original request URL (which is the medication sheet) with a cache buster
              const medicationUrlWithBust = new URL(event.request.url);
              medicationUrlWithBust.searchParams.append("_t", Date.now());
              
              const newMedicationResponse = await fetch(medicationUrlWithBust);
              
              if (newMedicationResponse.ok) {
                // 2. Update Caches
                // Save the new Medication Data
                await cache.put(event.request, newMedicationResponse.clone());
                // Save the new Version Data (so next time we know we are up to date)
                await cache.put(VERSION_SHEET_URL, new Response(versionText));

                console.log("Cache updated. Notifying clients.");
                
                // 3. Notify App (Client)
                // 'includeUncontrolled: true' ensures we notify tabs even if they haven't reloaded yet
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

        // Return the cached response if available.
        // If no cache (first load), we MUST wait for network.
        if (cachedMedicationResponse) {
          return cachedMedicationResponse;
        } else {
          // Fallback: If no cache (first load), fetch normally and cache it.
          const networkResponse = await fetch(event.request);
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }
      })
    );
  } else {
    // Strategy for all other assets (Cache First, Network Fallback)
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});