/**
 * Service Worker for Formulari Ubat PKD Kuala Langat.
 *
 * Responsibilities:
 * 1. Caching Static Assets: Ensures the app shell (HTML, CSS, JS) loads instantly.
 * 2. Caching Dynamic Data: Caches the large Medication CSV for offline access.
 * 3. Smart Background Updates: Implements a "Two-Step" update strategy using a separate Version Sheet.
 */

const CACHE_NAME = "formulary-cache-v16";
const VERSION_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTFA9lhUhdSk7L_t0XnGtGzrIMw1g9EXrNjmRfaBaQ8naqAy7ua8r_lpeth-LPQQS2pOMlKKSbvYQuB/pub?gid=411569782&single=true&output=csv";

const urlsToCache = ["./", "index.html", "manifest.json", "favicon.ico"];

// --- Install Phase ---
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    }),
  );
});

// --- Activate Phase ---
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          }),
        ),
      )
      .then(() => self.clients.claim()),
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
  if (
    event.request.url.includes("docs.google.com/spreadsheets") &&
    !event.request.url.includes(VERSION_SHEET_URL)
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedMedicationResponse = await cache.match(event.request);

        const updateCheckPromise = (async () => {
          try {
            const versionUrlWithBust = new URL(VERSION_SHEET_URL);
            versionUrlWithBust.searchParams.append("_t", Date.now());

            const versionResponse = await fetch(versionUrlWithBust);
            if (!versionResponse.ok)
              throw new Error("Failed to fetch version sheet");

            const versionText = await versionResponse.text();
            const versionRegex = /"?data_version"?,+"?(\d+)"?/i;
            const match = versionText.match(versionRegex);

            if (!match) return;

            const newVersion = parseInt(match[1], 10);
            const cachedVersionResponse = await cache.match(VERSION_SHEET_URL);
            let oldVersion = 0;

            if (cachedVersionResponse) {
              const cachedVersionText = await cachedVersionResponse.text();
              const cachedMatch = cachedVersionText.match(versionRegex);
              if (cachedMatch) oldVersion = parseInt(cachedMatch[1], 10);
            }

            if (newVersion > oldVersion) {
              const medicationUrlWithBust = new URL(event.request.url);
              medicationUrlWithBust.searchParams.append("_t", Date.now());
              const newMedicationResponse = await fetch(medicationUrlWithBust);

              if (newMedicationResponse.ok) {
                await cache.put(event.request, newMedicationResponse.clone());
                await cache.put(VERSION_SHEET_URL, new Response(versionText));
                const clients = await self.clients.matchAll({
                  type: "window",
                  includeUncontrolled: true,
                });
                clients.forEach((client) =>
                  client.postMessage({ type: "NEW_DATA_AVAILABLE" }),
                );
              }
            }
          } catch (err) {
            console.error("Background update check failed:", err);
          }
        })();

        return (
          cachedMedicationResponse ||
          fetch(event.request).then((res) => {
            if (res.ok) cache.put(event.request, res.clone());
            return res;
          })
        );
      }),
    );
  } else {
    // STRATEGY: Network First for index.html and manifest.json
    const isAppShell =
      event.request.url.endsWith("/") ||
      event.request.url.includes("index.html") ||
      event.request.url.includes("manifest.json");

    if (isAppShell) {
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            if (response.ok) {
              const responseClone = response.clone();
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseClone));
            }
            return response;
          })
          .catch(() => caches.match(event.request)),
      );
    } else {
      // STRATEGY: Cache First for assets (Images, CSS, JS)
      event.respondWith(
        caches
          .match(event.request)
          .then((response) => response || fetch(event.request)),
      );
    }
  }
});
