/**
 * Fetches CSV data from a Google Sheet URL and parses it into an array of objects.
 *
 * @param {string} sheetUrl The public URL of the Google Sheet CSV export.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of objects,
 *   where each object represents a row and keys are derived from CSV headers.
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
              // Process data to add is_quota boolean
              const processedData = results.data.map((row) => ({
                ...row,
                is_quota: row.is_quota === "TRUE",
              }));
              resolve(processedData);
            },
            error: (err) => {
              reject(err);
            },
          });
        }),
    )
    .catch(() => []);
}
