// ============================================================
// Story Seeds Studio — Registration Handler
// Google Apps Script (deploy as Web App)
// ============================================================
//
// SETUP INSTRUCTIONS:
//  1. Open https://script.google.com and create a new project.
//  2. Paste this entire file into the Code.gs editor.
//  3. Replace the two IDs below with your own:
//     - SPREADSHEET_ID : from your Google Sheet URL
//       https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
//     - DRIVE_FOLDER_ID : from your Google Drive folder URL
//       https://drive.google.com/drive/folders/[DRIVE_FOLDER_ID]
//  4. Click Deploy → New Deployment → Web App
//     - Execute as: Me
//     - Who has access: Anyone
//  5. Copy the Web App URL and paste it into your frontend
//     (VITE_GOOGLE_SCRIPT_URL in .env)
// ============================================================

var SPREADSHEET_ID  = "YOUR_SPREADSHEET_ID_HERE";
var DRIVE_FOLDER_ID = "YOUR_DRIVE_FOLDER_ID_HERE";

// Sheet column headers (created automatically on first run)
var HEADERS = [
  "Timestamp",
  "Full Name",
  "Standard",
  "Section",
  "School Name",
  "Parent's Name",
  "Email Address",
  "Mobile Number",
  "Story Title",
  "Story Category",
  "Class Level",
  "Video File Name",
  "Video Drive Link",
];

// ------------------------------------------------------------
// doPost — entry point for all form submissions
// ------------------------------------------------------------
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);

    var sheet      = getOrCreateSheet();
    var driveLink  = "";
    var videoName  = "";

    // ---- Upload video to Google Drive (if provided) ----
    if (payload.videoBase64 && payload.videoName) {
      videoName = payload.videoName;
      var folder   = DriveApp.getFolderById(DRIVE_FOLDER_ID);
      var decoded  = Utilities.base64Decode(payload.videoBase64);
      var blob     = Utilities.newBlob(decoded, "video/mp4", videoName);
      var file     = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      driveLink    = file.getUrl();
    }

    // ---- Append a row to Google Sheets ----
    sheet.appendRow([
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      payload.name         || "",
      payload.standard     || "",
      payload.section      || "",
      payload.schoolName   || "",
      payload.parentName   || "",
      payload.email        || "",
      payload.mobile       || "",
      payload.storyTitle   || "",
      payload.storyCategory || "",
      payload.classLevel   || "",
      videoName,
      driveLink,
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, driveLink: driveLink }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ------------------------------------------------------------
// doGet — health-check / CORS preflight helper
// ------------------------------------------------------------
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "Story Seeds Script is live!" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ------------------------------------------------------------
// getOrCreateSheet — ensures the sheet + headers exist
// ------------------------------------------------------------
function getOrCreateSheet() {
  var ss         = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheetName  = "Registrations";
  var sheet      = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(HEADERS);

    // Style the header row
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground("#7B0D0D");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  return sheet;
}
