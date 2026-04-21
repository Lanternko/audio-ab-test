/**
 * Audio A/B Test submission receiver — Google Apps Script.
 *
 * Deploy:
 *   1. Create a Google Sheet. Copy its URL, keep the long ID (the string
 *      between /d/ and /edit).
 *   2. Extensions → Apps Script.
 *   3. Paste this whole file (replace the default Code.gs).
 *   4. Set SHEET_ID below to the ID from step 1.
 *   5. Save (⌘S / Ctrl+S), name the project.
 *   6. Deploy → New deployment → type = Web app.
 *        Execute as: Me
 *        Who has access: Anyone
 *      Click Deploy. Copy the "/exec" URL.
 *   7. Paste the /exec URL into index.html → window.SUBMIT_URL
 *      and commit / push. Pages rebuilds ~1 min later.
 *
 * Security note:
 *   "Who has access: Anyone" means anyone with the URL can POST.
 *   This is fine for a small listening test (URL is obscure) — if you need
 *   stronger auth, add a shared-secret check against a header and reject
 *   mismatches in doPost.
 */

const SHEET_ID = "PASTE_YOUR_SHEET_ID_HERE";
const SHEET_NAME = "submissions";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json_({ ok: false, error: "empty body" });
    }
    const payload = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet_();
    const row   = flattenForRow_(payload);

    // On first run, write a header row before the data.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headerRow_(payload));
    }
    sheet.appendRow(row);

    return json_({ ok: true, id: payload.submissionId, rows: sheet.getLastRow() });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

// GET hitting the URL returns a friendly ping — lets you verify the
// deployment is live (paste URL into a browser).
function doGet() {
  return json_({ ok: true, service: "audio-ab-test submit endpoint", time: new Date().toISOString() });
}

// ─────────────────────────────────────────────────────────────

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  return sheet;
}

// One row per submission. Core columns first, then the per-question CMOS
// values flattened (q1_aq, q1_pf, …), then the full JSON for archival.
function headerRow_(payload) {
  const [leftL, rightL] = payload.variants || ["A", "B"];
  const header = [
    "receivedAt", "submissionId", "schemaVersion",
    "project", "participant",
    "roundIndex", "roundSize", "poolSize", "poolResetThisRound",
    "startedAt", "completedAt", "durationSec",
    "totalQuestions", "answeredQuestions",
    `aq_${leftL}`, `aq_${rightL}`,
    `pf_${leftL}`, `pf_${rightL}`,
  ];
  (payload.log || []).forEach(entry => {
    const n = entry.questionId;
    header.push(`q${n}_clip`, `q${n}_aLabel`, `q${n}_bLabel`, `q${n}_aq`, `q${n}_pf`, `q${n}_ratedAt`);
  });
  header.push("userAgent", "fullJSON");
  return header;
}

function flattenForRow_(payload) {
  const [leftL, rightL] = payload.variants || ["A", "B"];
  const aq = (payload.summary && payload.summary.audioQuality    && payload.summary.audioQuality.scores)    || {};
  const pf = (payload.summary && payload.summary.promptFollowing && payload.summary.promptFollowing.scores) || {};

  let durationSec = null;
  if (payload.startedAt && payload.completedAt) {
    durationSec = Math.round((new Date(payload.completedAt) - new Date(payload.startedAt)) / 1000);
  }

  const row = [
    new Date(),
    payload.submissionId || "",
    payload.schemaVersion || "",
    payload.project || "",
    payload.participant || "",
    num_(payload.roundIndex),
    num_(payload.roundSize),
    num_(payload.poolSize),
    payload.poolResetThisRound === true ? "TRUE" : (payload.poolResetThisRound === false ? "FALSE" : ""),
    payload.startedAt || "",
    payload.completedAt || "",
    durationSec,
    payload.totalQuestions || null,
    payload.answeredQuestions || null,
    num_(aq[leftL]),  num_(aq[rightL]),
    num_(pf[leftL]),  num_(pf[rightL]),
  ];

  (payload.log || []).forEach(entry => {
    row.push(
      entry.clipId || "",
      entry.aLabel || "",
      entry.bLabel || "",
      num_(entry.audioQuality),
      num_(entry.promptFollowing),
      entry.ratedAt || ""
    );
  });

  row.push(payload.userAgent || "");
  row.push(JSON.stringify(payload));
  return row;
}

function num_(v) { return (v === null || v === undefined) ? "" : v; }

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
