/**
 * Utility functions for Google Analytics tracking via gtag.js.
 * Ensures that 'gtag' is available on the window object before attempting to send events.
 */

// Helper to safely access dataLayer
function gtag() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(arguments);
}

/**
 * Tracks a page view event.
 * @param {string} page_path - The path of the page being viewed (e.g., '/', '/drug/Amoxicillin').
 */
export function trackPageView(page_path) {
  if (typeof gtag === "function") {
    gtag("event", "page_view", {
      page_path,
    });
  }
}

/**
 * Tracks a search event.
 * @param {string} searchTerm - The query string the user searched for.
 */
export function trackSearch(searchTerm) {
  if (typeof gtag === "function") {
    gtag("event", "search", {
      search_term: searchTerm,
    });
  }
}

/**
 * Tracks the selection of a specific item (medication).
 * @param {Object} item - The medication object selected.
 * @param {string} item["Generic Name"] - The name of the medication.
 * @param {string} item.Category - The category of the medication.
 */
export function trackSelectItem(item) {
  if (typeof gtag === "function") {
    gtag("event", "select_item", {
      items: [
        {
          item_name: item["Generic Name"],
          item_category: item.Category,
          item_id: item["Generic Name"],
        },
      ],
    });
  }
}

/**
 * Tracks generic button clicks.
 * @param {string} buttonName - The semantic name of the button clicked (e.g., "clear_search").
 */
export function trackButtonClick(buttonName) {
  if (typeof gtag === "function") {
    gtag("event", "button_click", {
      button_name: buttonName,
    });
  }
}
