/**
 * KBank K PLUS Email Fetcher — Google Apps Script Web App
 *
 * Deploy: script.google.com → New project → paste this file → Deploy → Web App
 *   - Execute as: Me
 *   - Who has access: Anyone (access is gated by the secret key below, not by Google login)
 *
 * SETUP (once):
 *   1. Project Settings → Script properties → add  KEY = <a long random string>
 *   2. Deploy, then paste into Ledger → Plan 5 the URL with the key appended:
 *        https://script.google.com/macros/s/XXXX/exec?key=<the same string>
 *
 * Unlike the Shopee/Grab scripts this one DOES parse the email itself: K PLUS notification
 * emails are fixed-template, machine-generated text, so a few regexes are exact (verified against
 * real emails 2026-09-24 → 2026-10-03: 17/17 parsed, running balances chain with no gaps).
 * No Gemini call is needed.
 *
 * Endpoint: GET ?key=...&start=YYYY-MM-DD&end=YYYY-MM-DD
 * Returns:  {ok:true, rows:[{txnNo,date,time,amount,type,acct,kind,payee,dest,balance}], skipped:[subject,...]}
 *   date/time = the transaction time printed in the email (Bangkok time), NOT the mail delivery time.
 *   acct      = the 4 digits K PLUS shows for the source account, e.g. "4306" for xxx-x-x4306-x.
 *               NOTE these are digits 6-9 of the account number, NOT the last 4 shown on statements.
 *               Ledger maps acct → account (4306 = KBank Marriage 3069, 3708 = Kbank 7089).
 */

var SENDER = 'KPLUS@kasikornbank.com';

function doGet(e) {
  try {
    var key = PropertiesService.getScriptProperties().getProperty('KEY');
    if (!key || e.parameter.key !== key) return jsonOut({ok:false, error:'Unauthorized'});

    var start = e.parameter.start; // YYYY-MM-DD
    var end   = e.parameter.end;   // YYYY-MM-DD
    if (!start || !end) return jsonOut({ok:false, error:'Missing start/end date'});

    var out = fetchRows(start, end);
    return jsonOut({ok:true, rows:out.rows, skipped:out.skipped});
  } catch (err) {
    return jsonOut({ok:false, error:String(err)});
  }
}

// Search Gmail for K PLUS notifications between two dates (inclusive) and parse them.
function fetchRows(start, end) {
  // Gmail's "before:" is exclusive — bump end by 1 day so the end date itself is included.
  var query = 'from:' + SENDER +
              ' after:' + start.replace(/-/g, '/') + ' before:' + addDays(end, 1).replace(/-/g, '/');
  var threads = GmailApp.search(query, 0, 200);

  var rows = [], skipped = [], seen = {};
  threads.forEach(function(thread) {
    thread.getMessages().forEach(function(msg) {
      var subject = msg.getSubject() || '';
      var row = parseKPlus(msg.getPlainBody() || '', subject);
      if (!row) { skipped.push(subject); return; }
      if (seen[row.txnNo]) return;
      seen[row.txnNo] = true;
      rows.push(row);
    });
  });
  // sort on the full timestamp (with seconds) so two payments in the same minute keep their true
  // order — Ledger walks the running balances in this order to check nothing is missing.
  rows.sort(function(x, y) { return x.ts.localeCompare(y.ts); });
  return {rows: rows, skipped: skipped};
}

// ══════════════════════════════════════════════════════════════
//  NIGHTLY PUSH TO THE LEDGER INBOX
//  Writes parsed rows to Firestore users/{uid}/inbox/{txnNo} (status "pending"). The Ledger app shows
//  a "N items waiting" banner on next open and pulls them through its normal preview. This script
//  never touches the app's main data document.
//
//  Setup (once): Script properties → UID = your Firebase uid.
//  appsscript.json needs oauthScopes: datastore + script.external_request + gmail.readonly
//  (the Apps Script project must be linked to GCP project ledger-c17b4 — see gas_inbox_test.gs).
//  Then run createInboxTrigger() once. Re-deploy the web app (new version) after adding the scopes.
// ══════════════════════════════════════════════════════════════
var FIRESTORE_PROJECT = 'ledger-c17b4';

function syncToInbox() {
  var props = PropertiesService.getScriptProperties();
  var uid = props.getProperty('UID');
  if (!uid) throw new Error('Set script property UID first');
  var tz = Session.getScriptTimeZone();
  var today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  var last = props.getProperty('LAST_SYNC');
  var start = last ? addDays(last, -1) : addDays(today, -7); // 1-day overlap in case an email arrives late

  // Remember what was already sent (Script property values cap at ~9KB → keep the latest 250 ids) so a
  // row the user already imported and deleted from the inbox is never written back.
  var sent = JSON.parse(props.getProperty('SENT') || '[]');
  var sentSet = {};
  sent.forEach(function(id) { sentSet[id] = true; });

  var rows = fetchRows(start, today).rows;
  var added = 0;
  rows.forEach(function(r) {
    if (sentSet[r.txnNo]) return;
    inboxWrite(uid, r.txnNo, {
      source: 'kbank_email',
      status: 'pending',
      createdAt: new Date().toISOString(),
      data: JSON.stringify(r)
    });
    sent.push(r.txnNo);
    added++;
  });
  props.setProperty('SENT', JSON.stringify(sent.slice(-250)));
  props.setProperty('LAST_SYNC', today);
  Logger.log('syncToInbox: ' + added + ' new, ' + (rows.length - added) + ' already sent (' + start + ' → ' + today + ')');
}

function inboxWrite(uid, id, obj) {
  var fields = {};
  Object.keys(obj).forEach(function(k) { fields[k] = { stringValue: String(obj[k]) }; });
  var url = 'https://firestore.googleapis.com/v1/projects/' + FIRESTORE_PROJECT +
            '/databases/(default)/documents/users/' + uid + '/inbox/' + encodeURIComponent(id);
  var res = UrlFetchApp.fetch(url, {
    method: 'patch',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    payload: JSON.stringify({ fields: fields }),
    muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) {
    throw new Error('Firestore write failed for ' + id + ': HTTP ' + res.getResponseCode() + ' ' + res.getContentText().slice(0, 300));
  }
}

function createInboxTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'syncToInbox') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('syncToInbox').timeBased().everyDays(1).atHour(6).create();
  Logger.log('Trigger set: syncToInbox daily around 06:00 (script time zone)');
}

// Reads the English half of the email (it repeats the Thai half). Returns null for anything that
// isn't a completed money-out/in notification (statement emails, failures, OTPs, ...).
function parseKPlus(body, subject) {
  if (/\(Failed\)/i.test(subject)) return null;
  var en = body.indexOf('Subject:') >= 0 ? body.slice(body.indexOf('Subject:')) : body;

  var dt = en.match(/Transaction Date:\s*(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}:\d{2}:\d{2})/);
  var no = en.match(/Transaction Number:\s*([A-Z0-9]+)/i);
  var amt = en.match(/Amount \(THB\):\s*([\d,]+\.?\d*)/i);
  if (!dt || !no || !amt) return null;

  var from = en.match(/(?:Paid )?From Account:\s*([^\r\n]+)/i);
  var acct = from ? (from[1].match(/(\d{4})/) || [])[1] || '' : '';

  // payee = who got the money; dest = card / account / shop id (kept for the description + dedupe)
  var payee = firstMatch(en, [
    /Company Name:\s*([^\r\n]+)/i,
    /Account Name:\s*([^\r\n]+)/i,
    /Wallet Name:\s*([^\r\n]+)/i,
    /Received Name:\s*([^\r\n]+)/i
  ]);
  var dest = firstMatch(en, [
    /Card No\.\s*:\s*([^\r\n]+)/i,
    /CARD NUMBER\s*:\s*(\d+)/i,
    /To Account:\s*([^\r\n]+)/i,
    /To Wallet ID:\s*([^\r\n]+)/i,
    /To PromptPay ID:\s*([^\r\n]+)/i
  ]);

  var kind = /Funds Transfer/i.test(subject) ? 'transfer' : 'payment';
  // A payment to a credit-card company is a card bill, not a purchase — flag it so Ledger can
  // treat it differently (transfer to the card account) instead of calling it spending.
  var isCard = /Card No\.|CARD NUMBER/i.test(en);
  var bal = en.match(/Available Balance \(THB\):\s*([\d,]+\.?\d*)/i);

  return {
    txnNo: no[1],
    date: dt[3] + '-' + dt[2] + '-' + dt[1],
    time: dt[4].slice(0, 5),
    ts: dt[3] + '-' + dt[2] + '-' + dt[1] + ' ' + dt[4],
    amount: parseFloat(amt[1].replace(/,/g, '')),
    type: /received|incoming/i.test(subject) ? 'income' : 'expense',
    acct: acct,
    kind: isCard ? 'card_bill' : kind,
    payee: payee,
    dest: dest,
    balance: bal ? parseFloat(bal[1].replace(/,/g, '')) : null
  };
}

function firstMatch(text, regexes) {
  for (var i = 0; i < regexes.length; i++) {
    var m = text.match(regexes[i]);
    if (m) return m[1].trim();
  }
  return '';
}

function addDays(dateStr, n) {
  var d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
