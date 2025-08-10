const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

// Read the mock HTML file
const mockHtml = fs.readFileSync(path.resolve(__dirname, "mock.html"), "utf8");

// Create a JSDOM instance
const dom = new JSDOM(mockHtml);
global.document = dom.window.document;

// Now that the DOM is set up, we can require the parser
const { parseHTML } = require("./parser.js");

describe("HTML Parser", () => {
  test("should parse the mock HTML correctly", () => {
    const expectedData = [
      {
        "Generic Name": "Drug A",
        Brand: "Brand A",
        "FUKKM System/Group": "Group 1",
        Category: "A/KK",
        is_quota: "yes",
      },
      {
        "Generic Name": "Drug B",
        Brand: "Brand B",
        "FUKKM System/Group": "Group 2",
        Category: "B",
        is_quota: "no",
      },
    ];
    expect(parseHTML(mockHtml)).toEqual(expectedData);
  });
});
