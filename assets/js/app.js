import { fetchAndParseSheet } from "./fetchSheet.js"; // Import the new function

export let recentMedications =
  JSON.parse(localStorage.getItem("recentMedications")) || [];
export let lastResults = [];
export let fullMedicationData = []; // Global variable to store the full dataset

export function setFullMedicationData(data) {
  fullMedicationData = data;
}

// Remove top-level declarations for resultsContainer and searchInput
// const resultsContainer = document.getElementById("results-container");
// const searchInput = document.getElementById("searchBox");

export function renderResults(results, container) {
  container.innerHTML = "";
  if (results.length === 0) {
    container.innerHTML = "<p>No results found.</p>";
    return;
  }

  let html = "";
  results.forEach((result) => {
    const { item } = result;
    const classNames = ["result-item"]; // Start with base class
    if (item.is_quota) {
      classNames.push("quota-item"); // Add quota-item if applicable
    }

    html += `
      <div class="${classNames.join(" ")}" data-generic-name="${item["Generic Name"]}" data-is-quota="${item.is_quota}">
          <h3>${item["Generic Name"]}</h3>
          <p><strong>Category:</strong> ${item.Category}</p>
          <p><strong>Group:</strong> ${item["FUKKM System/Group"]}</p>
          ${item.is_quota ? '<p class="quota-status"><strong>This is a Quota Item.</strong></p>' : ""}
      </div>
    `;
  });
  container.innerHTML = html;

  // Re-attach event listeners after innerHTML is set
  container.querySelectorAll(".result-item").forEach((div) => {
    div.addEventListener("click", (e) => {
      showDrugDetails(
        e.currentTarget.dataset.genericName,
        container,
        e.currentTarget.dataset.isQuota === "true",
      );
    });
  });
}

export function showDrugDetails(genericName, container, isQuota) {
  // Now takes genericName
  // Find the full item from the global fullMedicationData
  const item = fullMedicationData.find(
    (med) => med["Generic Name"] === genericName,
  );

  if (!item) {
    return;
  }

  const resultsContainer = document.getElementById("results-container");
  resultsContainer.classList.remove("hidden"); // Ensure results container is visible
  container.innerHTML = "";
  const div = document.createElement("div");
  div.classList.add("drug-details-view"); // Add a base class for styling
  if (isQuota) {
    div.classList.add("quota-details-view"); // Add specific class for quota items
  }
  let detailsHtml = `<button id="backButton">Back to results</button><h3>${item["Generic Name"]}</h3>`;
  Object.keys(item).forEach((key) => {
    if (Object.hasOwn(item, key) && key !== "is_quota") {
      detailsHtml += `<p><strong>${key}:</strong> ${item[key]}</p>`;
    }
  });

  div.innerHTML = detailsHtml;
  container.appendChild(div);

  document.getElementById("backButton").addEventListener("click", () => {
    const currentSearchInput = document.getElementById("searchBox");
    if (currentSearchInput.value.trim() === "") {
      resultsContainer.innerHTML = "";
      resultsContainer.classList.add("hidden");
    } else {
      renderResults(lastResults, container);
    }
  });

  addRecentMedication(item); // Add the full item to recent medications
}

export function addRecentMedication(item) {
  // Remove if already exists to avoid duplicates and move to the top
  recentMedications = recentMedications.filter(
    (med) => med["Generic Name"] !== item["Generic Name"],
  );
  recentMedications.unshift(item);
  // Keep only the 5 most recent
  if (recentMedications.length > 5) {
    recentMedications.pop();
  }
  localStorage.setItem("recentMedications", JSON.stringify(recentMedications));
  renderRecentMedications();
}

export function renderRecentMedications() {
  const recentMedicationsContainer = document.getElementById(
    "recent-medications-container",
  );

  recentMedicationsContainer.innerHTML = "";
  if (recentMedications.length > 0) {
    const headerWrapper = document.createElement("div");
    headerWrapper.classList.add("recent-header-wrapper");

    const h3 = document.createElement("h3");
    h3.textContent = "Recently Viewed";
    headerWrapper.appendChild(h3);

    const clearButton = document.createElement("button");
    clearButton.textContent = "✕";
    clearButton.id = "clearRecentButton";
    clearButton.setAttribute("aria-label", "Clear recently viewed");
    clearButton.addEventListener("click", () => {
      recentMedications = [];
      localStorage.removeItem("recentMedications");
      renderRecentMedications();
    });
    h3.appendChild(clearButton);
    recentMedicationsContainer.appendChild(headerWrapper);

    const recentItemsWrapper = document.createElement("div");
    recentItemsWrapper.classList.add("recent-items-wrapper");
    recentMedicationsContainer.appendChild(recentItemsWrapper); // Append wrapper to container

    recentMedications.forEach((item) => {
      const div = document.createElement("div");
      div.classList.add("recent-item");
      div.textContent = item["Generic Name"];
      div.addEventListener("click", () => {
        const resultsContainer = document.getElementById("results-container");
        // Pass the Generic Name to showDrugDetails
        showDrugDetails(item["Generic Name"], resultsContainer);
      });
      recentItemsWrapper.appendChild(div); // Append items to wrapper
    });
  }
}

export function initSearch(data, resultsContainer) {
  // Export initSearch
  const fuse = new Fuse(data, {
    // data here is the lightweight searchData
    keys: ["Generic Name", "Brand", "FUKKM System/Group", "Category"],
    threshold: 0.1, // Reduced for potentially faster search, but less fuzzy matching
    limit: 10,
  });

  const searchInput = document.getElementById("searchBox");
  const clearSearchButton = document.getElementById("clearSearchButton");

  // Debounce function
  const debounce = (func, delay) => {
    let timeout;
    return function executed(...args) {
      const context = this;
      const later = () => {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, delay);
    };
  };

  const debouncedSearch = debounce((searchTerm) => {
    if (searchTerm.trim() === "") {
      resultsContainer.innerHTML = "";
      resultsContainer.classList.add("hidden");
      clearSearchButton.style.display = "none";
      return;
    }
    resultsContainer.classList.remove("hidden");
    lastResults = fuse.search(searchTerm);
    renderResults(lastResults, resultsContainer);
    clearSearchButton.style.display = "block";
  }, 300);

  searchInput.addEventListener("input", (e) => {
    debouncedSearch(e.target.value);
  });

  clearSearchButton.addEventListener("click", () => {
    searchInput.value = "";
    resultsContainer.innerHTML = "";
    resultsContainer.classList.add("hidden");
    clearSearchButton.style.display = "none";
    searchInput.focus();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  let newWorker;

  // Function to show the update notification
  function showUpdateNotification() {
    const notification = document.createElement("div");
    notification.className = "update-notification";
    notification.innerHTML = `
      <span>A new version is available.</span>
      <button id="refresh-button">Refresh</button>
    `;
    document.body.appendChild(notification);

    document.getElementById("refresh-button").addEventListener("click", () => {
      if (newWorker) {
        newWorker.postMessage({ type: "SKIP_WAITING" });
      }
    });
  }

  // Register Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((registration) => {
        registration.addEventListener("updatefound", () => {
          newWorker = registration.installing;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                // New update available
                showUpdateNotification();
              }
            }
          });
        });

        let refreshing;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (refreshing) return;
          window.location.reload();
          refreshing = true;
        });
      });
  }

  // Dark Mode Toggle
  const darkModeToggle = document.getElementById("darkModeToggle");
  const body = document.body;

  // Load saved preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    body.classList.add(savedTheme);
  } else {
    // If no saved theme, default to light mode, regardless of OS preference
    body.classList.remove("dark-mode");
  }

  darkModeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    if (body.classList.contains("dark-mode")) {
      localStorage.setItem("theme", "dark-mode");
    } else {
      localStorage.removeItem("theme"); // Remove item to default to OS preference or light
    }
  });

  renderRecentMedications();

  const { googleSheetCsvUrl } = {
    googleSheetCsvUrl:
      "https://docs.google.com/spreadsheets/d/1YZOSxZXQriBlMBgSZaeizQ3zkunaspARZ-0ZgaZpHMk/export?format=csv&gid=1786132140",
  };

  fetchAndParseSheet(googleSheetCsvUrl).then((allData) => {
    fullMedicationData = allData; // Store the full dataset globally

    // Transform fullMedicationData to the format expected by renderResults
    const initialDisplayData = fullMedicationData.map((item) => ({ item }));

    const resultsContainer = document.getElementById("results-container");
    renderResults(initialDisplayData, resultsContainer); // Display all medications on initial load

    const searchData = allData.map((item) => ({
      "Generic Name": item["Generic Name"],
      Brand: item.Brand,
      Category: item.Category,
      "FUKKM System/Group": item["FUKKM System/Group"],
      is_quota: item.is_quota, // Keep is_quota for lightweight search
    }));
    initSearch(searchData, resultsContainer);

    // Show All Button functionality
    const showAllButton = document.getElementById("showAllButton");
    showAllButton.addEventListener("click", () => {
      const searchInput = document.getElementById("searchBox");
      searchInput.value = ""; // Clear search input

      if (resultsContainer.classList.contains("hidden")) {
        // If hidden, show the list
        resultsContainer.classList.remove("hidden");
        renderResults(
          fullMedicationData.map((item) => ({ item })),
          resultsContainer,
        ); // Display all medications
      } else {
        // If visible, hide the list
        resultsContainer.innerHTML = "";
        resultsContainer.classList.add("hidden");
      }
    });

    // Show Quota Button functionality
    const showQuotaButton = document.getElementById("showQuotaButton");
    showQuotaButton.addEventListener("click", () => {
      const searchInput = document.getElementById("searchBox");
      searchInput.value = ""; // Clear search input

      if (resultsContainer.classList.contains("hidden")) {
        // If hidden, show the list
        resultsContainer.classList.remove("hidden");
        const quotaMedications = fullMedicationData.filter(item => item.is_quota);
        renderResults(
          quotaMedications.map((item) => ({ item })),
          resultsContainer,
        ); // Display only quota medications
      } else {
        // If visible, hide the list
        resultsContainer.innerHTML = "";
        resultsContainer.classList.add("hidden");
      }
    });
  });

  // Disclaimer Modal
  const disclaimerModal = document.getElementById("disclaimer-modal");
  const openDisclaimer = document.getElementById("open-disclaimer");
  const closeButton = document.getElementsByClassName("close-button")[0];

  openDisclaimer.onclick = function(e) {
    e.preventDefault();
    disclaimerModal.style.display = "block";
  }

  closeButton.onclick = function() {
    disclaimerModal.style.display = "none";
  }

  window.onclick = function(event) {
    if (event.target == disclaimerModal) {
      disclaimerModal.style.display = "none";
    }
  }
});
