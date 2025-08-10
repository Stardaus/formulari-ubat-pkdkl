const app = require("../../assets/js/app.js");

describe("Search functionality with Fuse.js", () => {
  let searchInput;
  let resultsContainer;
  let originalDocumentBody;
  let originalFuse; // To store the original Fuse if it exists

  // Mock data now represents the lightweight search data
  const mockSearchData = [
    {
      "Generic Name": "Drug A",
      Brand: "Brand A",
      "FUKKM System/Group": "Group 1",
      Category: "A",
      is_quota: false,
    },
    {
      "Generic Name": "Drug B",
      Brand: "Brand B",
      "FUKKM System/Group": "Group 2",
      Category: "B",
      is_quota: false,
    },
    {
      "Generic Name": "Drug C",
      Brand: "Drug C",
      "FUKKM System/Group": "Group 1",
      Category: "A/KK",
      is_quota: true,
    },
  ];

  // Mock full data for showDrugDetails to find
  const mockFullData = [
    {
      "Generic Name": "Drug A",
      Brand: "Brand A",
      "FUKKM System/Group": "Group 1",
      Category: "A",
      is_quota: false,
      "Full Detail A": "...",
    },
    {
      "Generic Name": "Drug B",
      Brand: "Brand B",
      "FUKKM System/Group": "Group 2",
      Category: "B",
      is_quota: false,
      "Full Detail B": "...",
    },
    {
      "Generic Name": "Drug C",
      Brand: "Drug C",
      "FUKKM System/Group": "Group 1",
      Category: "A/KK",
      is_quota: true,
      "Full Detail C": "...",
    },
  ];

  beforeAll(() => {
    // Store original Fuse if it exists
    originalFuse = global.Fuse;

    // Mock the Fuse constructor
    global.Fuse = jest.fn(function (list, options) {
      this.list = list;
      this.options = options;
      this.search = jest.fn((searchTerm) => {
        // Simple mock search logic for testing
        if (searchTerm === "Drug A") {
          return [{ item: mockSearchData[0] }];
        }
        if (searchTerm === "Drug B") {
          return [{ item: mockSearchData[1] }];
        }
        if (searchTerm === "Drug C") {
          return [{ item: mockSearchData[2] }];
        }
        if (searchTerm === "NonExistentDrug") {
          return [];
        }
        if (searchTerm === "Drug") {
          return [
            { item: mockSearchData[0] },
            { item: mockSearchData[1] },
            { item: mockSearchData[2] },
          ];
        }
        return [];
      });
    });
  });

  afterAll(() => {
    // Restore original Fuse after all tests are done
    global.Fuse = originalFuse;
  });

  beforeEach(() => {
    // Set up a minimal DOM for testing
    originalDocumentBody = document.body.innerHTML; // Save original body
    document.body.innerHTML = `
      <input type="text" id="searchBox" />
      <div id="results-container"></div>
      <div id="recent-medications-container"></div>
    `;
    searchInput = document.getElementById("searchBox");
    resultsContainer = document.getElementById("results-container");

    // Initialize search with mock data (lightweight)
    app.initSearch(mockSearchData);

    // Mock the global fullMedicationData for showDrugDetails
    app.setFullMedicationData(mockFullData);
  });

  afterEach(() => {
    document.body.innerHTML = originalDocumentBody; // Restore original body
  });

  test("should display search results when a match is found", () => {
    searchInput.value = "Drug A";
    searchInput.dispatchEvent(new Event("input"));

    expect(resultsContainer.innerHTML).toContain("<h3>Drug A</h3>");
    expect(resultsContainer.classList.contains("hidden")).toBe(false);
  });

  test("should display 'No results found.' when no match is found", () => {
    searchInput.value = "NonExistentDrug";
    searchInput.dispatchEvent(new Event("input"));

    expect(resultsContainer.innerHTML).toContain("<p>No results found.</p>");
    expect(resultsContainer.classList.contains("hidden")).toBe(false);
  });

  test("should clear results and hide container when search box is empty", () => {
    // First, make sure there are results
    searchInput.value = "Drug A";
    searchInput.dispatchEvent(new Event("input"));
    expect(resultsContainer.innerHTML).toContain("<h3>Drug A</h3>");

    // Then, clear the search box
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("input"));

    expect(resultsContainer.innerHTML).toBe("");
    expect(resultsContainer.classList.contains("hidden")).toBe(true);
  });

  test("should highlight quota items", () => {
    searchInput.value = "Drug C";
    searchInput.dispatchEvent(new Event("input"));

    // Get the rendered item element
    const quotaItemElement = resultsContainer.querySelector(".result-item");

    expect(quotaItemElement).not.toBeNull(); // Ensure the element exists
    expect(quotaItemElement.classList.contains("quota-item")).toBe(true);
    expect(resultsContainer.innerHTML).toContain('class="quota-status"');
  });

  test("should show full details when a search result is clicked", () => {
    searchInput.value = "Drug A";
    searchInput.dispatchEvent(new Event("input"));

    const resultItem = resultsContainer.querySelector(".result-item");
    resultItem.click(); // Simulate click

    // Expect full details to be displayed
    expect(resultsContainer.innerHTML).toContain("<h3>Drug A</h3>");
    expect(resultsContainer.innerHTML).toContain("Full Detail A"); // Check for a unique detail from mockFullData
    expect(resultsContainer.classList.contains("hidden")).toBe(false);
  });

  test("should show full details when a recently viewed item is clicked", () => {
    app.recentMedications.length = 0;
    app.recentMedications.push(mockFullData[1]);
    app.renderRecentMedications();

    const recentItem = document.querySelector(".recent-item");
    recentItem.click();

    expect(resultsContainer.innerHTML).toContain("<h3>Drug B</h3>");
    expect(resultsContainer.innerHTML).toContain("Full Detail B");
    expect(resultsContainer.classList.contains("hidden")).toBe(false);
  });
});
