/**
 * Elissya waitlist backend: a Google Apps Script web app bound to a Google Sheet.
 *
 * Setup (5 minutes, see SETUP.md in the repo root for screenshots-level detail):
 *   1. Create a Google Sheet. Extensions > Apps Script. Paste this file in.
 *   2. Project Settings > Script properties > add SECRET = <long random string>.
 *   3. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
 *   4. Copy the /exec URL into SHEETS_WEBAPP_URL on Vercel, and the same SECRET
 *      into SHEETS_SECRET.
 *
 * The "Events" and "Signups" tabs are created on first write.
 */

var EVENT_HEADERS = [
  'ts', 'session_id', 'event', 'detail', 'country', 'device',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'referrer', 'ref',
];

var SIGNUP_HEADERS = [
  'created_at', 'updated_at', 'email', 'instagram', 'creator_type', 'followers',
  'dms_per_day', 'whatsapp', 'step', 'session_id', 'country',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'referrer', 'ref',
];

var STEP_RANK = { email: 0, instagram: 1, complete: 2 };

// Hard cap on rows sent back for the dashboard, so a runaway sheet can't
// produce a response too big for Apps Script or Vercel to handle.
var MAX_EVENT_ROWS = 50000;

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, error: 'bad json' });
  }

  var secret = PropertiesService.getScriptProperties().getProperty('SECRET');
  if (!secret || body.secret !== secret) return json({ ok: false, error: 'unauthorized' });

  try {
    switch (body.action) {
      case 'track': return json(track(body.row));
      case 'upsert': return json(upsert(body.patch));
      case 'events': return json(readEvents());
      case 'signups': return json({ ok: true, rows: readAll(sheet('Signups', SIGNUP_HEADERS)) });
      default: return json({ ok: false, error: 'unknown action' });
    }
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json({ ok: true, service: 'elissya-waitlist' });
}

function track(row) {
  var sh = sheet('Events', EVENT_HEADERS);
  sh.appendRow(EVENT_HEADERS.map(function (h) { return clean(row[h]); }));
  return { ok: true };
}

function upsert(patch) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var sh = sheet('Signups', SIGNUP_HEADERS);
    var now = new Date().toISOString();
    var email = String(patch.email || '').toLowerCase();
    if (!email) return { ok: false, error: 'email required' };

    var last = sh.getLastRow();
    var emails = last > 1 ? sh.getRange(2, 3, last - 1, 1).getValues() : [];
    var found = -1;
    for (var i = 0; i < emails.length; i++) {
      if (String(emails[i][0]).toLowerCase() === email) { found = i; break; }
    }

    if (found === -1) {
      var fresh = {};
      SIGNUP_HEADERS.forEach(function (h) { fresh[h] = patch[h] || ''; });
      fresh.created_at = now;
      fresh.updated_at = now;
      fresh.email = email;
      fresh.step = patch.step || 'email';
      sh.appendRow(SIGNUP_HEADERS.map(function (h) { return clean(fresh[h]); }));
      return { ok: true, position: emails.length + 1 };
    }

    var rowNum = found + 2;
    var range = sh.getRange(rowNum, 1, 1, SIGNUP_HEADERS.length);
    var current = range.getValues()[0];
    var merged = SIGNUP_HEADERS.map(function (h, idx) {
      if (h === 'updated_at') return now;
      if (h === 'step') {
        var prev = current[idx] || 'email';
        var next = patch.step;
        return next && STEP_RANK[next] > STEP_RANK[prev] ? next : prev;
      }
      var v = patch[h];
      // Re-clean existing values too: setValues re-parses them, so "+9198..." would become a number.
      return v === undefined || v === '' ? clean(current[idx]) : clean(v);
    });
    range.setValues([merged]);
    return { ok: true, position: found + 1 };
  } finally {
    lock.releaseLock();
  }
}

function readEvents() {
  var sh = sheet('Events', EVENT_HEADERS);
  var last = sh.getLastRow();
  if (last < 2) return { ok: true, rows: [], truncated: false };
  var count = last - 1;
  var truncated = count > MAX_EVENT_ROWS;
  var start = truncated ? last - MAX_EVENT_ROWS + 1 : 2;
  var values = sh.getRange(start, 1, last - start + 1, EVENT_HEADERS.length).getValues();
  return { ok: true, rows: toObjects(EVENT_HEADERS, values), truncated: truncated };
}

function readAll(sh) {
  var last = sh.getLastRow();
  if (last < 2) return [];
  var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  return toObjects(headers, sh.getRange(2, 1, last - 1, headers.length).getValues());
}

function toObjects(headers, values) {
  return values.map(function (r) {
    var o = {};
    headers.forEach(function (h, i) {
      o[h] = r[i] instanceof Date ? r[i].toISOString() : String(r[i]);
    });
    return o;
  });
}

function sheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sh;
}

// Prevent formula injection when a value starting with =, +, - or @ is opened in Sheets.
function clean(v) {
  if (v instanceof Date) return v.toISOString();
  var s = v === undefined || v === null ? '' : String(v).slice(0, 500);
  if (s.charAt(0) === "'") return s;
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
