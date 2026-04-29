// ============================================================
// Story Seed Studio — Future Forge 2026 Registration Handler
// Google Apps Script (deploy as Web App)
// ============================================================
//
// SETUP:
//  1. Replace SPREADSHEET_ID and SCREENSHOT_FOLDER_ID below.
//  2. In appsscript.json make sure these oauthScopes exist:
//       "https://www.googleapis.com/auth/spreadsheets",
//       "https://www.googleapis.com/auth/drive",
//       "https://www.googleapis.com/auth/script.external_request"
//  3. Run any function once to trigger authorization.
//  4. Deploy → New Deployment → Web App
//     - Execute as: Me  |  Who has access: Anyone
//  5. Copy the Web App URL → paste into .env as VITE_GOOGLE_SCRIPT_URL
// ============================================================

var SPREADSHEET_ID       = "1YrZUW05G-fizAC2TDuKUN8dEvaxbdhFvQN7xZKFbM5g";
var SCREENSHOT_FOLDER_ID = "10mw5cjNGtNCB9gEZIaVltTdjFyRLH-Tn";
var ADMIN_PASSWORD       = "Admin@FutureForge26";  // Change this to your preferred admin password

// ── Sheet column headers ──────────────────────────────────────
var HEADERS = [
  "Timestamp",
  "Student Name",
  "Standard",
  "Section",
  "School Name",
  "Parent / Guardian Name",
  "Email Address",
  "Mobile Number",
  "Home Address",
  "Promo Code",
  "Promo Applied",
  "Transaction ID",
  "Payment Screenshot",       // Drive link
  "Verification Status",      // "Pending" by default; manually update to "Verified" / "Rejected"
];

// ============================================================
// doPost — single action: "submitForm"
//   Receives all student details + transactionId + screenshotBase64
//   Saves screenshot to Drive, writes row to Sheets
// ============================================================
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action  = payload.action || "submitForm";

    if (action === "submitForm")       return handleFormSubmit(payload);
    if (action === "getRegistrations") return handleGetRegistrations(payload);
    if (action === "updateStatus")     return handleUpdateStatus(payload);

    throw new Error("Unknown action: " + action);

  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ── Admin: fetch all registrations ───────────────────────────
function handleGetRegistrations(payload) {
  if (payload.password !== ADMIN_PASSWORD) {
    return jsonResponse({ success: false, error: "Unauthorized" });
  }
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName("Future Forge 2026");
  if (!sheet) return jsonResponse({ success: true, data: [] });

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return jsonResponse({ success: true, data: [] });

  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    rows.push({
      rowIndex:           i + 1,
      timestamp:          r[0]  ? String(r[0]) : "",
      studentName:        r[1]  || "",
      standard:           r[2]  || "",
      section:            r[3]  || "",
      schoolName:         r[4]  || "",
      parentName:         r[5]  || "",
      email:              r[6]  || "",
      mobile:             r[7]  || "",
      address:            r[8]  || "",
      promoCode:          r[9]  || "",
      promoApplied:       r[10] || "",
      transactionId:      r[11] || "",
      screenshotLink:     r[12] || "",
      verificationStatus: r[13] || "Pending",
    });
  }
  return jsonResponse({ success: true, data: rows });
}

// ── Admin: update verification status for a row ───────────────
function handleUpdateStatus(payload) {
  if (payload.password !== ADMIN_PASSWORD) {
    return jsonResponse({ success: false, error: "Unauthorized" });
  }
  var rowIndex = parseInt(payload.rowIndex, 10);
  var newStatus = payload.status;
  if (!rowIndex || !newStatus) throw new Error("rowIndex and status are required");

  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName("Future Forge 2026");
  if (!sheet) throw new Error("Sheet not found");

  sheet.getRange(rowIndex, 14).setValue(newStatus); // column 14 = Verification Status
  return jsonResponse({ success: true });
}

// ── Form submission handler ───────────────────────────────────
function handleFormSubmit(payload) {
  var screenshotLink = "";

  // ── 1. Save payment screenshot to Drive (if provided) ──────
  if (payload.screenshotBase64 && payload.screenshotName) {
    try {
      var imageBytes = Utilities.base64Decode(payload.screenshotBase64);
      var blob       = Utilities.newBlob(imageBytes, detectMimeType(payload.screenshotName), payload.screenshotName);

      var folder = DriveApp.getFolderById(SCREENSHOT_FOLDER_ID);

      // Name the file: TransactionID_StudentName_timestamp.ext
      var ext       = payload.screenshotName.split(".").pop() || "jpg";
      var safeName  = sanitizeFilename(
        (payload.transactionId || "NOTXN") + "_" +
        (payload.name          || "Student")
      );
      var fileName  = safeName + "_" + Date.now() + "." + ext;

      blob = blob.setName(fileName);
      var driveFile  = folder.createFile(blob);

      // Make the file viewable by anyone with the link
      driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      screenshotLink = driveFile.getUrl();

    } catch (imgErr) {
      // Don't block registration if screenshot upload fails — log and continue
      Logger.log("Screenshot upload error: " + imgErr.message);
      screenshotLink = "UPLOAD_FAILED";
    }
  }

  // ── 2. Write row to Google Sheets ──────────────────────────
  var sheet = getOrCreateSheet();
  sheet.appendRow([
    new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    payload.name            || "",
    payload.standard        || "",
    payload.section         || "",
    payload.schoolName      || "",
    payload.parentName      || "",
    payload.email           || "",
    payload.mobile          || "",
    payload.address         || "",
    payload.promoCode       || "",
    payload.promoApplied    ? "YES" : "NO",
    payload.transactionId   || "",
    screenshotLink,
    "Pending",                               // Verification status — update manually
  ]);

  return jsonResponse({ success: true });
}

// ── Health check ──────────────────────────────────────────────
function doGet() {
  return jsonResponse({ status: "Future Forge 2026 Script is live!" });
}

// ── Helpers ───────────────────────────────────────────────────

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Detect MIME type from filename extension
function detectMimeType(filename) {
  var lower = (filename || "").toLowerCase();
  if (lower.endsWith(".png"))  return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";   // default for .jpg / .jpeg and unknown
}

// Strip unsafe characters from a filename
function sanitizeFilename(str) {
  return str
    .replace(/[^a-zA-Z0-9_\-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 60);
}

// Get or create the "Registrations" sheet with styled headers
function getOrCreateSheet() {
  var ss        = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheetName = "Future Forge 2026";
  var sheet     = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);

    // Write headers
    sheet.appendRow(HEADERS);

    // Style header row — dark red with white bold text
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground("#7B0D0D");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);

    // Set column widths for readability
    sheet.setColumnWidth(1,  160);  // Timestamp
    sheet.setColumnWidth(2,  160);  // Student Name
    sheet.setColumnWidth(3,  90);   // Standard
    sheet.setColumnWidth(4,  80);   // Section
    sheet.setColumnWidth(5,  200);  // School Name
    sheet.setColumnWidth(6,  160);  // Parent Name
    sheet.setColumnWidth(7,  200);  // Email
    sheet.setColumnWidth(8,  130);  // Mobile
    sheet.setColumnWidth(9,  220);  // Address
    sheet.setColumnWidth(10, 120);  // Promo Code
    sheet.setColumnWidth(11, 110);  // Promo Applied
    sheet.setColumnWidth(12, 180);  // Transaction ID
    sheet.setColumnWidth(13, 220);  // Screenshot Link
    sheet.setColumnWidth(14, 140);  // Verification Status
  }

  return sheet;
}
