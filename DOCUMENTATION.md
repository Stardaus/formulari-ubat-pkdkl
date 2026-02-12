# Developer & Maintainer Documentation

This document serves as the implementation guide for the **Formulari Ubat PKD Kuala Langat** application. It is intended for developers who need to maintain, update, or scale the codebase.

## 1. Getting Started

### Prerequisites
*   Node.js (v18 or higher recommended)
*   npm (v9 or higher)

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Navigate to the directory
cd formulari-ubat-pkdkl

# Install dependencies
npm install
```

### Development
```bash
# Start the local development server
npm run dev
```
> **Note:** The Service Worker behavior in development mode might differ from production. To fully test offline capabilities and updates, use the build preview.

### Production Build
```bash
# Build the project for production
npm run build

# Preview the production build locally
npm run preview
```

---

## 2. Project Structure

```
/
├── public/
│   ├── service-worker.js    # The CORE caching & update logic
│   ├── manifest.json        # PWA configuration
│   └── assets/              # Static images/icons
├── src/
│   ├── components/          # Reusable UI components (Header, SearchBar, etc.)
│   ├── hooks/               # Custom React hooks (useMedicationData)
│   ├── utils/               # Helper functions (fetchSheet, analytics)
│   ├── styles/              # Global CSS (Variables, Theming)
│   ├── App.jsx              # Main application controller
│   └── main.jsx             # Entry point & SW registration
├── dist/                    # Compiled output (created after build)
└── vite.config.js           # Vite configuration
```

---

## 3. Data Management (Google Sheets)

The app relies on **two** specific Google Sheets published to the web as CSV.

### Sheet 1: The Database (Medications)
*   **Contains:** The full list of drugs.
*   **Columns:** `Generic Name`, `Category`, `FUKKM System/Group`, `is_quota`, etc.
*   **Special Logic:**
    *   Rows with `is_quota = "TRUE"` are highlighted.
    *   Metadata rows (like `data_version`) are filtered out by `src/utils/fetchSheet.js`.

### Sheet 2: The Version Controller (Version Sheet)
*   **Contains:** A single row of metadata.
*   **Columns:**
    *   Column A: `data_version`
    *   Column B: `[Unix Timestamp]` (e.g., `1738992000`)
*   **Purpose:** The Service Worker checks this sheet. If the number here is **higher** than what is in the user's cache, an update is triggered.

### How to Update Data
1.  **Edit:** Pharmacists edit the main Google Sheet.
2.  **Auto-Update:** A Google Apps Script (in the sheet) updates the timestamp in the Version Sheet.
3.  **Detect:** The Service Worker detects the new timestamp on the next user visit (or periodic check).
4.  **Fetch & Notify:** The SW fetches the new data in the background and sends a `NEW_DATA_AVAILABLE` message.
5.  **Refresh:** A banner appears in the app. The user clicks "Refresh Now" to load the latest data from the cache.
6.  **Deploy:** No code deployment is needed for data updates.

---

## 4. Key Implementation Details

### Service Worker (`public/service-worker.js`)
*   **Version:** Controlled by `CACHE_NAME` (e.g., `formulary-cache-v15`).
*   **Logic:**
    *   Intercepts requests to `docs.google.com`.
    *   Fetches the Version Sheet CSV.
    *   Parses the `data_version`.
    *   Compares `NewVersion > CachedVersion`.
    *   If newer, fetches the main sheet and broadcasts `NEW_DATA_AVAILABLE`.

### App Controller (`src/App.jsx`)
*   **Update Listener:** Uses `useEffect` to listen for messages from the Service Worker.
*   **Banner:** Displays a sticky notification when `newDataAvailable` is set to `true`.
*   **Refresh Action:** Provides a "Refresh Now" button that calls `window.location.reload()`.

### Data Parsing (`src/utils/fetchSheet.js`)
*   Uses **PapaParse** to convert CSV text to JSON.
*   **Filters:** Removes rows where `Generic Name` is "data_version" or empty.
*   **Sorts:** Alphabetically by `Generic Name`.

### Search Logic (`src/components/SearchBar.jsx`)
*   Uses **Fuse.js** for fuzzy matching.
*   **Threshold:** `0.1` (Strict matching). Increase to `0.3` if users want more "loose" matches.
*   **Keys:** Searches `Generic Name`, `Brand`, `Category`, and `Group`.

---

## 5. Theming & Styling

The app uses CSS Variables in `src/styles/style.css` for easy theming.

```css
:root {
  --bg-color-main: #ffffff;
  --text-color-primary: #212121;
  --primary-color: #0288d1;
}

body.dark-mode {
  --bg-color-main: #424242;
  --text-color-primary: #ffffff;
}
```
*   **Dark Mode:** Toggled by adding the `.dark-mode` class to the `<body>` tag. State is persisted in `localStorage`.

---

## 6. Maintenance & Scaling

### Changing the Google Sheet URL
If the Google Sheet is replaced:
1.  Update `GOOGLE_SHEET_CSV_URL` in `src/hooks/useMedicationData.js`.
2.  Update `VERSION_SHEET_URL` in `public/service-worker.js`.
3.  Increment `CACHE_NAME` in `public/service-worker.js` (e.g., to `v13`) to force all users to re-cache everything.

### Adding New Columns
1.  Add the column to the Google Sheet.
2.  Update `src/components/MedicationDetails.jsx` to render the new field (it iterates over keys automatically, but you might want custom formatting).
3.  If searching is required for this new column, add the key to the `Fuse` options in `src/components/SearchBar.jsx`.

### Troubleshooting Updates
*   **Issue:** Users not seeing new data.
*   **Fix:**
    *   Check if the Version Sheet timestamp was actually updated.
    *   Check browser console for "Version Check" logs.
    *   Ensure the user clicked the "Refresh Now" banner.

---

## 7. Deployment

This is a static site. It can be hosted on:
*   **GitHub Pages** (Recommended)
*   Vercel
*   Netlify
*   Firebase Hosting

**Build Command:** `npm run build`
**Output Directory:** `dist/`
