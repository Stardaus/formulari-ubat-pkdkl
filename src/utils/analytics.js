function gtag() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(arguments);
}

export function trackPageView(page_path) {
  if (typeof gtag === "function") {
    gtag("event", "page_view", {
      page_path: page_path,
    });
  }
}

export function trackSearch(searchTerm) {
  if (typeof gtag === "function") {
    gtag("event", "search", {
      search_term: searchTerm,
    });
  }
}

export function trackSelectItem(item) {
    if (typeof gtag === 'function') {
        gtag('event', 'select_item', {
            items: [{
                item_name: item['Generic Name'],
                item_category: item.Category,
                item_id: item['Generic Name'],
            }]
        });
    }
}

export function trackButtonClick(buttonName) {
  if (typeof gtag === "function") {
    gtag("event", "button_click", {
      button_name: buttonName,
    });
  }
}
