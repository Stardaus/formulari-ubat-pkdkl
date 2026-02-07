import Papa from 'papaparse';

/**
 * Fetches CSV data from a Google Sheet URL and parses it into an array of objects.
 * 
 * Uses PapaParse to handle CSV parsing.
 * Performs the following post-processing:
 * 1. Filters out metadata rows (e.g., 'data_version') and empty rows.
 * 2. Converts 'is_quota' string "TRUE" to a boolean.
 * 3. Sorts the data alphabetically by 'Generic Name'.
 *
 * @param {string} sheetUrl The public URL of the Google Sheet CSV export.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of medication objects.
 *   Each object represents a row, with keys derived from the CSV headers.
 *   Returns an empty array (or rejects) on failure, depending on implementation.
 * 
 * @example
 * fetchAndParseSheet("https://docs.google.com/.../export?format=csv")
 *   .then(data => console.log(data));
 */
export function fetchAndParseSheet(sheetUrl) {
  return fetch(sheetUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(
      (csvData) =>
        new Promise((resolve, reject) => {
          Papa.parse(csvData, {
            header: true, // Treat the first row as headers
            skipEmptyLines: true,
            complete: (results) => {
              if (results.errors.length) {
                reject(new Error("CSV parsing errors encountered."));
                return;
              }

              // Post-process the raw CSV results
              const processedData = results.data
                // 1. Filter Logic:
                // Remove rows where 'Generic Name' is missing/empty.
                // Remove the special 'data_version' metadata row used by the Service Worker.
                .filter((row) => {
                  const genericName = row["Generic Name"]?.trim();
                  return genericName && genericName !== "data_version";
                })
                // 2. Transformation Logic:
                // Convert the string "TRUE" in 'is_quota' column to a JavaScript boolean.
                .map((row) => {
                  const isQuotaBoolean = row.is_quota === "TRUE";
                  return {
                    ...row,
                    is_quota: isQuotaBoolean,
                  };
                })
                // 3. Sorting Logic:
                // Sort the array alphabetically by 'Generic Name' for display.
                .sort((a, b) => {
                  const nameA = a["Generic Name"].toUpperCase();
                  const nameB = b["Generic Name"].toUpperCase();
                  if (nameA < nameB) {
                    return -1;
                  }
                  if (nameA > nameB) {
                    return 1;
                  }
                  return 0;
                });
              
              resolve(processedData);
            },
            error: (err) => {
              reject(err);
            },
          });
        }),
    );
}

