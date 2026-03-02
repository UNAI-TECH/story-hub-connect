// ============================================================
// Story Seeds Studio — Registration Handler
// Google Apps Script (deploy as Web App)
// ============================================================
//
// SETUP:
//  1. Replace SPREADSHEET_ID and DRIVE_FOLDER_ID below.
//  2. Deploy → New Deployment → Web App
//     - Execute as: Me
//     - Who has access: Anyone
//  3. Copy Web App URL → paste into .env as VITE_GOOGLE_SCRIPT_URL
// ============================================================

var SPREADSHEET_ID  = "YOUR_SPREADSHEET_ID_HERE";
var DRIVE_FOLDER_ID = "YOUR_DRIVE_FOLDER_ID_HERE";

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

// ============================================================
// doPost — handles two actions:
//
//   action: "submitForm"   → saves text data row, returns submissionId
//   action: "uploadVideo"  → uploads video, updates the saved row
// ============================================================
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action  = payload.action || "submitForm";

    if (action === "submitForm") {
      return handleFormSubmit(payload);
    } else if (action === "uploadVideo") {
      return handleVideoUpload(payload);
    }

    throw new Error("Unknown action: " + action);

  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ---- Phase 1: save the form text row immediately ----
function handleFormSubmit(payload) {
  var sheet = getOrCreateSheet();

  sheet.appendRow([
    new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    payload.name          || "",
    payload.standard      || "",
    payload.section       || "",
    payload.schoolName    || "",
    payload.parentName    || "",
    payload.email         || "",
    payload.mobile        || "",
    payload.storyTitle    || "",
    payload.storyCategory || "",
    payload.classLevel    || "",
    "",   // Video File Name — filled in by uploadVideo
    "",   // Video Drive Link — filled in by uploadVideo
  ]);

  // Return last row index so the frontend can reference this row later
  var submissionId = sheet.getLastRow();
  return jsonResponse({ success: true, submissionId: submissionId });
}

// ---- Phase 2: upload video and update the matching row ----
function handleVideoUpload(payload) {
  var submissionId = parseInt(payload.submissionId, 10);
  if (!submissionId || isNaN(submissionId)) {
    throw new Error("Invalid submissionId");
  }
  if (!payload.videoBase64 || !payload.videoName) {
    throw new Error("Missing video data");
  }

  // Upload to Drive
  var folder   = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  var decoded  = Utilities.base64Decode(payload.videoBase64);
  var blob     = Utilities.newBlob(decoded, "video/mp4", payload.videoName);
  var file     = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  var driveLink = file.getUrl();

  // Update the existing row (columns 12 = Video Name, 13 = Drive Link)
  var sheet = getOrCreateSheet();
  sheet.getRange(submissionId, 12).setValue(payload.videoName);
  sheet.getRange(submissionId, 13).setValue(driveLink);

  return jsonResponse({ success: true, driveLink: driveLink });
}

// ---- Health check ----
function doGet(e) {
  return jsonResponse({ status: "Story Seeds Script is live!" });
}

// ---- Utility: JSON response helper ----
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- Sheet setup ----
function getOrCreateSheet() {
  var ss        = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheetName = "Registrations";
  var sheet     = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(HEADERS);
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground("#7B0D0D");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  return sheet;
}
