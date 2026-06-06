// ─── KP2 Sizing Form → Google Sheets ───────────────────────────────────────
//
// HOW TO SET UP:
// 1. Open your Google Sheet (or create one at sheets.google.com)
// 2. Go to Extensions → Apps Script
// 3. Delete the default code and paste this entire file
// 4. Click Save, then Deploy → New deployment
//    - Type: Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 5. Click Deploy → copy the web app URL
// 6. Create a file: Uniform_KP2/.env
//    Add this line: VITE_SIZING_FORM_WEBHOOK=<paste URL here>
// 7. Restart the dev server (npm run dev)
//
// The sheet will auto-create a "Submissions" tab with headers on first run.
// ───────────────────────────────────────────────────────────────────────────

const SPREADSHEET_ID = "1_CLe2LsIf55NVwTlS2dCiu-3wzhHnO0UjphFe52jnQI";
const SHEET_NAME = "Submissions";

const HEADERS = [
  "Submitted At",
  "Full Name",
  "Shoe Size (UK)",
  "Collar Size (in)",
  "Jacket Size",
  "Trouser Waist (in)",
  "Trouser Leg (in)",
  "Notes",
];

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Create the sheet + headers if it doesn't exist yet
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS.length)
        .setFontWeight("bold")
        .setBackground("#111111")
        .setFontColor("#ffffff");
    }

    const p = e.parameter;

    const newRow = [
      p.submitted_at ? new Date(p.submitted_at) : new Date(),
      p.name          || "",
      p.shoe_size     || "",
      p.collar_size   || "",
      p.jacket_size   || "",
      p.trouser_waist || "",
      p.trouser_leg   || "",
      p.notes         || "",
    ];

    // NAME column is column B (index 2). Search for existing row by name.
    const NAME_COL = 2; // column B
    const data = sheet.getDataRange().getValues();
    let existingRowIndex = -1;

    const incomingName = (p.name || "").trim().toLowerCase();
    for (let i = 1; i < data.length; i++) { // start at 1 to skip header
      if (String(data[i][NAME_COL - 1]).trim().toLowerCase() === incomingName) {
        existingRowIndex = i + 1; // sheet rows are 1-indexed
        break;
      }
    }

    if (existingRowIndex > -1) {
      // Update the existing row in place
      sheet.getRange(existingRowIndex, 1, 1, newRow.length).setValues([newRow]);
    } else {
      // New person — append and then sort A→Z by Full Name
      sheet.appendRow(newRow);
    }

    // Sort all data rows (excluding header) A→Z by Full Name (column B)
    const lastRow = sheet.getLastRow();
    if (lastRow > 2) {
      sheet.getRange(2, 1, lastRow - 1, HEADERS.length).sort({ column: NAME_COL, ascending: true });
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        status: "ok",
        spreadsheet: ss.getName(),
        sheet: sheet.getName(),
        rows: sheet.getLastRow(),
        wrote: p.name || "unknown"
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: visit the web app URL in a browser to confirm it's live
function doGet() {
  return ContentService
    .createTextOutput("KP2 Sizing Form webhook is active.")
    .setMimeType(ContentService.MimeType.TEXT);
}
