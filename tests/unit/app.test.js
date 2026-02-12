import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from "vitest";
import { fetchAndParseSheet } from "../../src/utils/fetchSheet.js";

const mockCsvData = `
"Generic Name","MAL_Brands","FUKKM System/Group","MDC","NEML","Method of Purchase","Category","Indications","Prescribing Restrictions","Dosage","Adverse Reaction","Contraindications","Interactions","Precautions","is_quota"
"Drug A","Brand A","Group 1","MDC1","Yes","LP","A/KK","Indications A","None","Dosage A","AR A","CI A","Int A","Prec A","TRUE"
"Drug B","Brand B","Group 2","MDC2","No","APPL","B","Indications B","None","Dosage B","AR B","CI B","Int B","Prec B","FALSE"
`;

describe("Data Fetching and Parsing with fetchAndParseSheet (PapaParse)", () => {
  let originalFetch;
  let consoleErrorSpy;
  let originalPapa;

  beforeAll(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    originalPapa = global.Papa;
    global.Papa = {
      parse: vi.fn((csvString, config) => {
        let parsedData = [];
        let errors = [];

        if (csvString.includes(`"Generic Name","MAL_Brands","FUKKM System/Group","MDC","NEML","Method of Purchase","Category","Indications","Prescribing Restrictions","Dosage","Adverse Reaction","Contraindications","Interactions","Precautions","is_quota"`)) {
          parsedData = [
            {
              "Generic Name": "Drug A",
              "MAL_Brands": "Brand A",
              "FUKKM System/Group": "Group 1",
              "MDC": "MDC1",
              "NEML": "Yes",
              "Method of Purchase": "LP",
              "Category": "A/KK",
              "Indications": "Indications A",
              "Prescribing Restrictions": "None",
              "Dosage": "Dosage A",
              "Adverse Reaction": "AR A",
              "Contraindications": "CI A",
              "Interactions": "Int A",
              "Precautions": "Prec A",
              "is_quota": "TRUE",
            },
            {
              "Generic Name": "Drug B",
              "MAL_Brands": "Brand B",
              "FUKKM System/Group": "Group 2",
              "MDC": "MDC2",
              "NEML": "No",
              "Method of Purchase": "APPL",
              "Category": "B",
              "Indications": "Indications B",
              "Prescribing Restrictions": "None",
              "Dosage": "Dosage B",
              "Adverse Reaction": "AR B",
              "Contraindications": "CI B",
              "Interactions": "Int B",
              "Precautions": "Prec B",
              "is_quota": "FALSE",
            }
          ];
        } else if (csvString.includes(`"malformed,csv"`)) {
          parsedData = [];
          errors = [{ type: "ParseError", code: "UndetectableDelimiter" }];
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
    global.Papa = originalPapa;
  });

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(`"Generic Name","MAL_Brands","FUKKM System/Group","MDC","NEML","Method of Purchase","Category","Indications","Prescribing Restrictions","Dosage","Adverse Reaction","Contraindications","Interactions","Precautions","is_quota"
"Drug A","Brand A","Group 1","MDC1","Yes","LP","A/KK","Indications A","None","Dosage A","AR A","CI A","Int A","Prec A","TRUE"
"Drug B","Brand B","Group 2","MDC2","No","APPL","B","Indications B","None","Dosage B","AR B","CI B","Int B","Prec B","FALSE"
`),
      }),
    );
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("should fetch and parse CSV data correctly using PapaParse", async () => {
    const allData = await fetchAndParseSheet("http://mock.url/sheet.csv");

    expect(allData).toHaveLength(2);
    expect(allData[0].name).toBe("Drug A");
    expect(allData[0].prescriberCategory).toBe("A/KK");
    expect(allData[0].isQuota).toBe(true);
    expect(allData[0].id).toBe("1");

    expect(allData[1].name).toBe("Drug B");
    expect(allData[1].prescriberCategory).toBe("B");
    expect(allData[1].isQuota).toBe(false);
    expect(allData[1].id).toBe("2");
  });

  test("should handle HTTP errors during fetch", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: "Not Found",
      }),
    );

    await expect(fetchAndParseSheet("http://mock.url/nonexistent.csv")).rejects.toThrow("HTTP error! status: 404");
  });

  test("should handle parsing errors (e.g., malformed CSV)", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(`"malformed,csv"\n"1,2"`),
      }),
    );

    await expect(fetchAndParseSheet("http://mock.url/malformed.csv")).rejects.toThrow("CSV parsing errors encountered.");
  });
});