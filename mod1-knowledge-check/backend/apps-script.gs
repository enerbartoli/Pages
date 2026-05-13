// ═══════════════════════════════════════════════════════════════════════════════
// MOD 1 Knowledge Check — Google Apps Script Backend
// Deploy as: Web App → Execute as: Me → Who has access: Anyone
// ═══════════════════════════════════════════════════════════════════════════════

// ── Configuration ─────────────────────────────────────────────────────────────
const RENE_EMAIL     = 'herotoolnotifications@gmail.com';
const RENE_COPY_EMAIL = 'Rene.bartoli@hasbro.com';
const SHEET_NAME     = 'MOD 1 Quiz Responses';
const PASS_THRESHOLD = 13;   // ≥13 / 16 = pass
const TOTAL_QUESTIONS = 16;

// QUIZ_CLOSED flag — flip to true to stop accepting submissions after the pilot
const QUIZ_CLOSED = false;
const QUIZ_URL    = 'https://enerbartoli.github.io/mod1-knowledge-check/';

// ── Answer Key (server-side only — never exposed to the browser) ──────────────
const ANSWER_KEY = {
  Q1: 'C', Q2: 'B', Q3: 'B', Q4: 'B',  Q5: 'C',  Q6: 'C',  Q7: 'B',  Q8: 'C',
  Q9: 'B', Q10: 'B', Q11: 'B', Q12: 'B', Q13: 'C', Q14: 'B', Q15: 'C', Q16: 'C'
};

// ── Slide references for fail-email feedback ───────────────────────────────────
const SLIDE_REFS = {
  Q1: '31, 33', Q2: '5',    Q3: '9',  Q4: '10',    Q5: '11',
  Q6: '15',    Q7: '14',   Q8: '10, 16', Q9: '17, 21', Q10: '22',
  Q11: '25',   Q12: '26',  Q13: '32', Q14: '33',   Q15: '33',  Q16: '33'
};

// ── Question text (for fail-email body) ───────────────────────────────────────
const QUESTION_TEXT = {
  Q1:  'According to the new Forecast Enrichment process, what is the primary shift in how Sales contributes to the forecast?',
  Q2:  'What does the "wooden bridge" framing represent in the new process?',
  Q3:  'Which of the following is TRUE about the Daybreak statistical baseline?',
  Q4:  'Why does Daybreak use "Adjusted Demand" instead of raw shipment history?',
  Q5:  'In the three-party operating model that produces the baseline, who provides the statistical ML engine?',
  Q6:  'For UK Fan items, which forecasting approach applies?',
  Q7:  'For NPI items in the cold-start phase (0–8 weeks), which method does NPI 2.0 use?',
  Q8:  'At which planning level does Daybreak generate the statistical baseline?',
  Q9:  'For NPI disaggregation, the customer split at L2 is based on which input?',
  Q10: 'A parent SKU has variants A (70%) and B (30%) per P2M. Wal-Mart only carries variant A. What ensures Wal-Mart\'s volume is fully allocated to variant A and not split 70/30?',
  Q11: 'An item has a normal carry-forward pattern and no new promotion is planned. What enrichment should you enter?',
  Q12: 'Which of the five core L1 commercial enrichment types is the ONLY one that requires capturing driver attributes (discount %, mechanic, start/end dates)?',
  Q13: 'How does Marketing push back on a Sales forecast they consider too optimistic?',
  Q14: 'In the UK pilot, who owns Base Trend adjustments at the SKU × BU level (Level 2.5)?',
  Q15: 'In the 2026 UK pilot, how does HERO start each cycle for Brand Captains?',
  Q16: 'In the 2027 target operating model, how does the process change for Brand Captains?'
};

// ── CORS helper ───────────────────────────────────────────────────────────────
function buildResponse(data, statusCode) {
  statusCode = statusCode || 200;
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handle CORS pre-flight (OPTIONS) — Apps Script doesn't support OPTIONS natively,
// but including doGet lets us test the endpoint from a browser.
function doGet(e) {
  return buildResponse({ status: 'MOD 1 Quiz backend is running.' });
}

// ── Main entry point ──────────────────────────────────────────────────────────
function doPost(e) {
  try {
    // 1. Parse
    if (!e || !e.postData || !e.postData.contents) {
      return buildResponse({ error: 'Empty request body.' }, 400);
    }

    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return buildResponse({ error: 'Invalid JSON payload.' }, 400);
    }

    // 2. Check quiz-closed flag
    if (QUIZ_CLOSED) {
      return buildResponse({ error: 'This quiz is no longer accepting submissions.' }, 403);
    }

    // 3. Validate required fields
    var validationError = validatePayload(payload);
    if (validationError) {
      return buildResponse({ error: validationError }, 400);
    }

    // 4. Score
    var scoreResult = scoreSubmission(payload.answers);

    // 5. Append to Sheet
    var sheetUrl = appendToSheet(payload, scoreResult);

    // 6. Send emails
    var emailSent = sendEmails(payload, scoreResult, sheetUrl);

    // 7. Return result to frontend (no correct answers exposed)
    return buildResponse({
      score:            scoreResult.score,
      total:            TOTAL_QUESTIONS,
      percent:          scoreResult.percent,
      pass:             scoreResult.pass,
      failed_questions: scoreResult.failedQNums
    });

  } catch (err) {
    Logger.log('doPost error: ' + err.message + '\n' + err.stack);
    return buildResponse({ error: 'Server error. Please try again.' }, 500);
  }
}

// ── Validation ────────────────────────────────────────────────────────────────
function validatePayload(p) {
  if (!p.name || String(p.name).trim().length < 2) return 'Name is required.';

  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!p.email || !emailRe.test(String(p.email).trim())) return 'Valid email is required.';

  if (!p.role) return 'Role is required.';

  if (!p.answers || typeof p.answers !== 'object') return 'Answers are required.';

  for (var i = 1; i <= TOTAL_QUESTIONS; i++) {
    var key = 'Q' + i;
    var val = p.answers[key];
    if (!val || !['A','B','C','D'].includes(String(val).toUpperCase())) {
      return 'Answer for ' + key + ' is missing or invalid.';
    }
  }
  return null;
}

// ── Scoring ───────────────────────────────────────────────────────────────────
function scoreSubmission(answers) {
  var score = 0;
  var results = {};
  var failedQNums = [];

  for (var i = 1; i <= TOTAL_QUESTIONS; i++) {
    var key = 'Q' + i;
    var given   = String(answers[key] || '').toUpperCase();
    var correct = ANSWER_KEY[key];
    var isCorrect = given === correct;
    results[key] = { given: given, correct: isCorrect };
    if (isCorrect) {
      score++;
    } else {
      failedQNums.push(i);
    }
  }

  var percent = Math.round((score / TOTAL_QUESTIONS) * 10000) / 100; // e.g. 81.25
  return {
    score:       score,
    percent:     percent,
    pass:        score >= PASS_THRESHOLD,
    results:     results,
    failedQNums: failedQNums
  };
}

// ── Sheet ─────────────────────────────────────────────────────────────────────
function appendToSheet(payload, scoreResult) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    writeHeaders(sheet);
  }

  // Ensure headers exist (first run)
  if (sheet.getLastRow() === 0) writeHeaders(sheet);

  var now  = new Date();
  var row  = [
    now,                                                      // A: Timestamp
    payload.name.trim(),                                      // B: Full Name
    payload.email.trim().toLowerCase(),                       // C: Email
    payload.role,                                             // D: Role
    payload.roleOther || '',                                  // E: Role (Other detail)
    scoreResult.score,                                        // F: Score
    scoreResult.percent,                                      // G: Score %
    scoreResult.pass ? 'Pass' : 'Fail'                        // H: Status
  ];

  // Q1–Q16 answer + correct? pairs (columns I onward)
  for (var i = 1; i <= TOTAL_QUESTIONS; i++) {
    var key = 'Q' + i;
    var r   = scoreResult.results[key];
    row.push(r.given);    // Answer
    row.push(r.correct);  // Correct?
  }

  // Failed questions list, email sent flag, user-agent
  row.push(scoreResult.failedQNums.join(', '));    // Failed Questions
  row.push(true);                                  // Email Sent? (set to true; update to false on error if needed)
  row.push((payload.userAgent || '').slice(0, 200));

  sheet.appendRow(row);

  return ss.getUrl();
}

function writeHeaders(sheet) {
  var headers = [
    'Timestamp', 'Full Name', 'Email', 'Role', 'Role (Other)',
    'Score', 'Score %', 'Status'
  ];
  for (var i = 1; i <= TOTAL_QUESTIONS; i++) {
    headers.push('Q' + i + ' Answer');
    headers.push('Q' + i + ' Correct?');
  }
  headers.push('Failed Questions', 'Email Sent?', 'User-Agent');
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
}

// ── Email ─────────────────────────────────────────────────────────────────────
function sendEmails(payload, scoreResult, sheetUrl) {
  var name    = payload.name.trim();
  var email   = payload.email.trim().toLowerCase();
  var score   = scoreResult.score;
  var total   = TOTAL_QUESTIONS;
  var pct     = scoreResult.percent;
  var pass    = scoreResult.pass;
  var failed  = scoreResult.failedQNums;

  try {
    if (pass) {
      sendPassEmail(email, name, score, total, pct);
    } else {
      sendFailEmail(email, name, score, total, pct, failed);
    }
    sendNotificationEmail(payload, scoreResult, sheetUrl);
    return true;
  } catch (err) {
    Logger.log('Email error: ' + err.message);
    return false;
  }
}

function emailShell(contentHtml) {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 0;">' +
    '<tr><td align="center">' +
    '<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">' +
    '<tr><td style="background:#0d1b2e;padding:28px 40px;text-align:center;">' +
    '<p style="margin:0;color:#00c9a7;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Forecast Enrichment Programme · UK Pilot</p>' +
    '<p style="margin:8px 0 0;color:#ffffff;font-size:20px;font-weight:700;">MOD 1 Knowledge Check</p>' +
    '</td></tr>' +
    '<tr><td style="padding:40px;">' + contentHtml + '</td></tr>' +
    '<tr><td style="background:#f8f9fa;padding:20px 40px;border-top:1px solid #e9ecef;text-align:center;">' +
    '<p style="margin:0;color:#6c757d;font-size:12px;">Rene Bartoli · Demand Planning · Forecast Enrichment Program</p>' +
    '</td></tr>' +
    '</table></td></tr></table></body></html>';
}

function sendPassEmail(toEmail, name, score, total, pct) {
  var subject = '✓ MOD 1 Knowledge Check — Passed';

  var content =
    '<div style="text-align:center;margin-bottom:32px;">' +
    '<div style="display:inline-block;background:#d4edda;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">✓</div>' +
    '<h2 style="margin:16px 0 4px;color:#0d1b2e;font-size:24px;">Well done, ' + name + '!</h2>' +
    '<p style="margin:0;color:#6c757d;font-size:15px;">You\'ve passed the knowledge check</p>' +
    '</div>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin-bottom:28px;">' +
    '<tr>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#00c9a7;">' + score + '/' + total + '</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Score</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#00c9a7;">' + Math.round(pct) + '%</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Accuracy</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#00c9a7;">PASS</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Status</p>' +
    '</td>' +
    '</tr></table>' +
    '<p style="color:#495057;font-size:15px;line-height:1.6;">You\'ve met the <strong>80% threshold</strong> to advance to the next module.</p>' +
    '<div style="background:#e8f8f5;border-left:4px solid #00c9a7;border-radius:4px;padding:16px 20px;margin:24px 0;">' +
    '<p style="margin:0;color:#0d1b2e;font-size:14px;font-weight:700;">What\'s next</p>' +
    '<p style="margin:6px 0 0;color:#495057;font-size:14px;">MOD 2 — Hands-On Enrichment Practice. Dates to be confirmed.</p>' +
    '</div>' +
    '<p style="color:#6c757d;font-size:14px;line-height:1.6;">If you have questions about MOD 1 concepts, revisit the facilitator deck in the project SharePoint or reach out to the Demand Planning team.</p>';

  MailApp.sendEmail({
    to:       toEmail,
    subject:  subject,
    htmlBody: emailShell(content)
  });
}

function sendFailEmail(toEmail, name, score, total, pct, failedQNums) {
  var subject = 'MOD 1 Knowledge Check — Please review and retry';

  var missedRows = failedQNums.map(function(num) {
    var key = 'Q' + num;
    var qText = QUESTION_TEXT[key] || '';
    var refs  = SLIDE_REFS[key] || '';
    var slideLabel = refs.indexOf(',') > -1 ? 'Slides' : 'Slide';
    return '<tr style="border-bottom:1px solid #e9ecef;">' +
      '<td style="padding:12px 8px;color:#0d1b2e;font-weight:700;font-size:13px;white-space:nowrap;">Q' + num + '</td>' +
      '<td style="padding:12px 8px;color:#495057;font-size:13px;line-height:1.5;">' + qText + '</td>' +
      '<td style="padding:12px 8px;color:#00c9a7;font-size:13px;white-space:nowrap;">' + slideLabel + ' ' + refs + '</td>' +
      '</tr>';
  }).join('');

  var content =
    '<div style="text-align:center;margin-bottom:32px;">' +
    '<div style="display:inline-block;background:#fff3cd;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">📋</div>' +
    '<h2 style="margin:16px 0 4px;color:#0d1b2e;font-size:24px;">Hi ' + name + '</h2>' +
    '<p style="margin:0;color:#6c757d;font-size:15px;">A little more review needed</p>' +
    '</div>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;margin-bottom:28px;">' +
    '<tr>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#ffd60a;">' + score + '/' + total + '</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Score</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;border-right:1px solid #e9ecef;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#ffd60a;">' + Math.round(pct) + '%</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Accuracy</p>' +
    '</td>' +
    '<td style="padding:20px;text-align:center;">' +
    '<p style="margin:0;font-size:32px;font-weight:700;color:#dc3545;">RETRY</p>' +
    '<p style="margin:4px 0 0;font-size:12px;color:#6c757d;text-transform:uppercase;letter-spacing:1px;">Status</p>' +
    '</td>' +
    '</tr></table>' +
    '<p style="color:#495057;font-size:15px;line-height:1.6;">No worries — the goal is for everyone to fully land MOD 1 before moving to hands-on practice. Here are the questions to revisit:</p>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e9ecef;border-radius:8px;overflow:hidden;margin:20px 0;">' +
    '<tr style="background:#0d1b2e;">' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">#</th>' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">Question</th>' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">Review</th>' +
    '</tr>' +
    missedRows +
    '</table>' +
    '<div style="background:#fff3cd;border-left:4px solid #ffd60a;border-radius:4px;padding:16px 20px;margin:24px 0;">' +
    '<p style="margin:0;color:#0d1b2e;font-size:14px;font-weight:700;">Note</p>' +
    '<p style="margin:6px 0 0;color:#495057;font-size:14px;">I\'m deliberately not sharing the correct answers here — go back to the material and find them yourself. That\'s where the learning sticks.</p>' +
    '</div>' +
    '<div style="text-align:center;margin-top:28px;">' +
    '<a href="' + QUIZ_URL + '" style="display:inline-block;background:#ffd60a;color:#0d1b2e;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">Retake the Quiz →</a>' +
    '</div>';

  MailApp.sendEmail({
    to:       toEmail,
    subject:  subject,
    htmlBody: emailShell(content)
  });
}

function sendNotificationEmail(payload, scoreResult, sheetUrl) {
  var name       = payload.name.trim();
  var email      = payload.email.trim().toLowerCase();
  var role       = payload.role + (payload.roleOther ? ' (' + payload.roleOther + ')' : '');
  var score      = scoreResult.score;
  var total      = TOTAL_QUESTIONS;
  var pct        = scoreResult.percent;
  var status     = scoreResult.pass ? 'PASS' : 'FAIL';
  var failedNums = scoreResult.failedQNums.join(', ') || 'none';

  var subject = '[MOD 1 Quiz] ' + name + ' — ' + score + '/' + total + ' — ' + status;
  var body =
    name + ' (' + email + ', ' + role + ') just submitted the MOD 1 Knowledge Check.\n\n' +
    'Score: ' + score + ' / ' + total + ' (' + pct + '%)\n' +
    'Status: ' + status + '\n' +
    'Failed questions: ' + failedNums + '\n\n' +
    'Full row written to the Sheet:\n' + sheetUrl;

  MailApp.sendEmail({
    to:      RENE_EMAIL,
    cc:      RENE_COPY_EMAIL,
    subject: subject,
    body:    body
  });
}
