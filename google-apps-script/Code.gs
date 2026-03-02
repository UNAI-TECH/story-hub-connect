// ============================================================
// Story Seeds Studio — Registration Handler
// Google Apps Script (deploy as Web App)
// ============================================================
//
// SETUP:
//  1. Replace SPREADSHEET_ID and DRIVE_FOLDER_ID below.
//  2. In appsscript.json add these oauthScopes:
//       "https://www.googleapis.com/auth/spreadsheets",
//       "https://www.googleapis.com/auth/drive",
//       "https://www.googleapis.com/auth/script.external_request"
//  3. Run any function once to trigger authorization.
//  4. Deploy → New Deployment → Web App
//     - Execute as: Me  |  Who has access: Anyone
//  5. Copy Web App URL → paste into .env as VITE_GOOGLE_SCRIPT_URL
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
// doPost — three actions:
//
//  "initUpload"   → creates Drive resumable upload session,
//                   returns sessionId (cached for 6 hours)
//  "uploadChunk"  → proxies one base64 chunk to Drive,
//                   returns { status: "incomplete"|"complete", fileId? }
//  "submitForm"   → sets sharing on uploaded file,
//                   saves complete row to Google Sheets
// ============================================================
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action  = payload.action || "submitForm";

    if (action === "initUpload")   return handleInitUpload(payload);
    if (action === "uploadChunk")  return handleUploadChunk(payload);
    if (action === "submitForm")   return handleFormSubmit(payload);

    throw new Error("Unknown action: " + action);

  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ── Step 1: create Drive resumable upload session ─────────────
function handleInitUpload(payload) {
  var token    = ScriptApp.getOAuthToken();
  var fileName = payload.videoName || "video.mp4";
  var fileSize = payload.fileSize  || 0;

  var metadata = JSON.stringify({
    name:    fileName,
    parents: [DRIVE_FOLDER_ID],
  });

  var response = UrlFetchApp.fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
    {
      method:             "POST",
      headers:            {
        "Authorization":          "Bearer " + token,
        "Content-Type":           "application/json; charset=UTF-8",
        "X-Upload-Content-Type":  "video/mp4",
        "X-Upload-Content-Length": String(fileSize),
      },
      payload:            metadata,
      muteHttpExceptions: true,
    }
  );

  if (response.getResponseCode() !== 200) {
    throw new Error("initUpload failed (HTTP " + response.getResponseCode() + "): " + response.getContentText());
  }

  var uploadUrl = response.getHeaders()["Location"];
  if (!uploadUrl) throw new Error("No upload URL returned from Drive API");

  // Cache the upload URL keyed by a unique session ID (stored for 6 hours)
  var sessionId = Utilities.getUuid();
  CacheService.getScriptCache().put(sessionId, uploadUrl, 21600);

  return jsonResponse({ success: true, sessionId: sessionId });
}

// ── Step 2: proxy one chunk of the video to Google Drive ──────
// Frontend sends base64-encoded chunk + byte range.
// Apps Script decodes and forwards to Drive via UrlFetchApp (no CORS issues).
function handleUploadChunk(payload) {
  var sessionId   = payload.sessionId;
  var chunkBase64 = payload.chunkBase64;
  var start       = parseInt(payload.start, 10);
  var end         = parseInt(payload.end,   10); // inclusive
  var total       = parseInt(payload.total, 10);

  var uploadUrl = CacheService.getScriptCache().get(sessionId);
  if (!uploadUrl) throw new Error("Upload session not found or expired. Please retry.");

  var chunkBytes = Utilities.base64Decode(chunkBase64);

  var response = UrlFetchApp.fetch(uploadUrl, {
    method:             "PUT",
    headers:            {
      "Content-Range": "bytes " + start + "-" + end + "/" + total,
      "Content-Type":  "video/mp4",
    },
    payload:            chunkBytes,
    muteHttpExceptions: true,
  });

  var code = response.getResponseCode();

  if (code === 308) {
    // Drive wants more chunks
    return jsonResponse({ success: true, status: "incomplete" });
  }

  if (code === 200 || code === 201) {
    // All chunks received — Drive returns file metadata
    var fileData = JSON.parse(response.getContentText());
    return jsonResponse({ success: true, status: "complete", fileId: fileData.id });
  }

  throw new Error("Chunk upload failed (HTTP " + code + "): " + response.getContentText());
}

// ── Step 3: set sharing + save complete form row ──────────────
function handleFormSubmit(payload) {
  var driveLink = "";
  var videoName = payload.videoName || "";

  if (payload.fileId) {
    var fileId = payload.fileId;
    var token  = ScriptApp.getOAuthToken();

    // Make file viewable by anyone with the link
    UrlFetchApp.fetch(
      "https://www.googleapis.com/drive/v3/files/" + fileId + "/permissions",
      {
        method:             "POST",
        headers:            {
          "Authorization": "Bearer " + token,
          "Content-Type":  "application/json",
        },
        payload:            JSON.stringify({ role: "reader", type: "anyone" }),
        muteHttpExceptions: true,
      }
    );

    driveLink = "https://drive.google.com/file/d/" + fileId + "/view";
  }

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
    videoName,
    driveLink,
  ]);

  return jsonResponse({ success: true });
}

// ── Health check ──────────────────────────────────────────────
function doGet(e) {
  return jsonResponse({ status: "Story Seeds Script is live!" });
}

// ── Helpers ───────────────────────────────────────────────────
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

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
