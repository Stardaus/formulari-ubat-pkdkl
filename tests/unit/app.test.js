import { fetchAndParseSheet } from "../../assets/js/fetchSheet.js"; // Import the new function

const mockCsvData = `
"Generic Name","Brand","FUKKM System/Group","MDC","NEML","Method of Purchase","Category","Indications","Prescribing Restrictions","Dosage","Adverse Reaction","Contraindications","Interactions","Precautions","is_quota"
"Drug A","Brand A","Group 1","MDC1","Yes","LP","A/KK","Indications A","None","Dosage A","AR A","CI A","Int A","Prec A","TRUE"
"Drug B","Brand B","Group 2","MDC2","No","APPL","B","Indications B","None","Dosage B","AR B","CI B","Int B","Prec B","FALSE"
`;

describe("Data Fetching and Parsing with fetchAndParseSheet (PapaParse)", () => {
  let originalFetch;
  let consoleErrorSpy;
  let originalPapa; // Added for Papa mock

  beforeAll(() => {
    // Mock console.error to prevent Jest from failing on expected errors
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    // Mock Papa.parse
    originalPapa = global.Papa;
    global.Papa = {
      parse: jest.fn((csvString, config) => {
        let parsedData = [];
        let errors = [];

        if (
          csvString.includes(`"Generic Name","Brand","Category","is_quota"`)
        ) {
          // Mock for the main test case
          parsedData = [
            {
              "Generic Name": "Drug A",
              Brand: "Brand A",
              Category: "A/KK",
              is_quota: "TRUE",
            },
            {
              "Generic Name": "Drug B",
              Brand: "Brand B",
              Category: "B",
              is_quota: "FALSE",
            },
            {
              "Generic Name": "Drug C",
              Brand: "Brand C",
              Category: "A/KK",
              is_quota: "TRUE",
            },
          ];
        } else if (csvString.includes(`"malformed,csv"`)) {
          // Mock for malformed CSV test case
          parsedData = [];
          errors = [{ type: "ParseError", code: "UndetectableDelimiter" }];
        } else {
          // Default parsing for other cases if needed, or throw an error
          // For now, we'll just return empty for unexpected CSV
          parsedData = [];
        }

        if (config.complete) {
          config.complete({ data: parsedData, errors: errors });
        }
        return { data: parsedData, errors: errors };
      }),
    };
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
    global.Papa = originalPapa; // Restore original Papa
  });

  beforeEach(() => {
    // Mock fetch to return a sample CSV string that PapaParse can handle
    originalFetch = global.fetch;
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(`"Generic Name","Brand","Category","is_quota"
"Drug A","Brand A","A/KK","TRUE"
"Drug B","Brand B","B","FALSE"
"Drug C","Brand C","A/KK","TRUE"
`),
      }),
    );
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("should fetch and parse CSV data correctly using PapaParse", async () => {
    const allData = await fetchAndParseSheet("http://mock.url/sheet.csv");

    expect(allData).toHaveLength(3);
    expect(allData[0]["Generic Name"]).toBe("Drug A");
    expect(allData[0].Category).toBe("A/KK");
    expect(allData[0].is_quota).toBe(true);
    expect(allData[1]["Generic Name"]).toBe("Drug B");
    expect(allData[1].Category).toBe("B");
    expect(allData[1].is_quota).toBe(false);
    expect(allData[2]["Generic Name"]).toBe("Drug C");
    expect(allData[2].Category).toBe("A/KK");
    expect(allData[2].is_quota).toBe(true);
  });

  test("should handle HTTP errors during fetch", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: "Not Found",
      }),
    );

    const allData = await fetchAndParseSheet("http://mock.url/nonexistent.csv");
    expect(allData).toEqual([]); // Should return empty array on error
  });

  test("should handle parsing errors (e.g., malformed CSV)", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(`"malformed,csv"\n"1,2"`), // Malformed CSV for PapaParse
      }),
    );

    const allData = await fetchAndParseSheet("http://mock.url/malformed.csv");
    expect(allData).toEqual([]); // Updated expectation
  });
});
