/**
 * Shopee Order Fetcher — Google Apps Script Web App
 *
 * Deploy: script.google.com → New project → paste this file → Deploy → Web App
 *   - Execute as: Me
 *   - Who has access: Anyone (the URL itself is the secret; treat it like a password)
 * Copy the deployed /exec URL into Ledger → Data migration & Auto sync → "Shopee Order Detail" plan.
 *
 * This script does NOT parse item details itself — it just fetches the raw text of each Shopee
 * confirmation email and hands it back. Ledger sends that raw text to Gemini (same as the PDF
 * import flow) to extract order items/total, which is far more robust than regex against an
 * email layout we can't preview here.
 *
 * Endpoint: GET ?start=YYYY-MM-DD&end=YYYY-MM-DD
 * Returns: {ok:true, emails:[{orderId, date, subject, text}]}
 */

var SENDER = 'info@mail.shopee.co.th';
var SUBJECT_KEYWORD = 'ยืนยันการชำระเงินคำสั่งซื้อ';

function doGet(e) {
  try {
    var start = e.parameter.start; // YYYY-MM-DD
    var end   = e.parameter.end;   // YYYY-MM-DD
    if (!start || !end) return jsonOut({ok:false, error:'Missing start/end date'});

    // Gmail's "before:" is exclusive — bump end by 1 day so the end date itself is included.
    var endPlus = addDays(end, 1);
    var query = 'from:' + SENDER + ' subject:"' + SUBJECT_KEYWORD + '"' +
                ' after:' + start.replace(/-/g,'/') + ' before:' + endPlus.replace(/-/g,'/');

    var threads = GmailApp.search(query, 0, 200);
    var emails = [];

    threads.forEach(function(thread){
      thread.getMessages().forEach(function(msg){
        var subject = msg.getSubject();
        var orderIdMatch = subject.match(/#([A-Za-z0-9]+)/);
        emails.push({
          orderId: orderIdMatch ? orderIdMatch[1] : '',
          date: Utilities.formatDate(msg.getDate(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
          subject: subject,
          text: htmlToText(msg.getBody()).slice(0, 4000) // cap size — plenty for one order confirmation
        });
      });
    });

    return jsonOut({ok:true, emails:emails});
  } catch (err) {
    return jsonOut({ok:false, error: String(err)});
  }
}

function addDays(dateStr, n) {
  var d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

// Strip HTML tags → plain text, collapse whitespace, decode common entities.
function htmlToText(html) {
  var text = html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(tr|p|div|td)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return text.replace(/[ \t]+/g, ' ').replace(/\n{2,}/g, '\n').trim();
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
