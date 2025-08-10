function parseHTML(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const table = doc.querySelector("table");
  const rows = table.querySelectorAll("tr");
  const headers = Array.from(rows[0].querySelectorAll("td")).map((header) =>
    header.textContent.trim(),
  );
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.querySelectorAll("td");
    const rowData = {};
    headers.forEach((header, index) => {
      rowData[header] = cells[index] ? cells[index].textContent.trim() : "";
    });

    if (rowData["Category"] && rowData["Category"].includes("A/KK")) {
      rowData["is_quota"] = "yes";
    } else {
      rowData["is_quota"] = "no";
    }

    data.push(rowData);
  }
  return data;
}

module.exports = { parseHTML };
