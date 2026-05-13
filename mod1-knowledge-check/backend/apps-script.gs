// ═══════════════════════════════════════════════════════════════════════════════
// MOD 1 Knowledge Check — Google Apps Script Backend
// Deploy as: Web App → Execute as: Me → Who has access: Anyone
// ═══════════════════════════════════════════════════════════════════════════════

// ── Configuration ─────────────────────────────────────────────────────────────
const RENE_EMAIL     = 'rene.bartoli@gmail.com';   // ← replace with your Gmail address
const SHEET_NAME     = 'MOD 1 Quiz Responses';
const PASS_THRESHOLD = 13;   // ≥13 / 16 = pass
const TOTAL_QUESTIONS = 16;

// QUIZ_CLOSED flag — flip to true to stop accepting submissions after the pilot
const QUIZ_CLOSED = false;
const QUIZ_URL    = 'https://YOUR_GITHUB_USERNAME.github.io/mod1-knowledge-check/'; // ← update after deploy

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

function sendPassEmail(toEmail, name, score, total, pct) {
  var subject = '✓ MOD 1 Knowledge Check — Passed';
  var body = 'Hi ' + name + ',\n\n' +
    'Great work — you scored ' + score + ' / ' + total + ' (' + pct + '%) on the MOD 1 Knowledge Check. ' +
    'You\'ve met the 80% threshold to advance.\n\n' +
    'What\'s next: MOD 2 (Hands-On Enrichment Practice) — dates to be confirmed.\n\n' +
    'If you have questions about anything from MOD 1, you can revisit the facilitator deck ' +
    'in the project SharePoint, or reach out to the Demand Planning team.\n\n' +
    'Thanks,\nRene Bartoli\nDemand Planning · Forecast Enrichment Program';

  MailApp.sendEmail({
    to:      toEmail,
    subject: subject,
    body:    body
  });
}

function sendFailEmail(toEmail, name, score, total, pct, failedQNums) {
  var subject = 'MOD 1 Knowledge Check — Please review and retry';

  var missedLines = failedQNums.map(function(num) {
    var key = 'Q' + num;
    var qText = QUESTION_TEXT[key] || '';
    var refs  = SLIDE_REFS[key] || '';
    var slideLabel = refs.indexOf(',') > -1 ? 'slides' : 'slide';
    return '• Question ' + num + ': ' + qText + '\n  → Review ' + slideLabel + ' ' + refs + ' in the MOD 1 facilitator deck.';
  }).join('\n\n');

  var body = 'Hi ' + name + ',\n\n' +
    'Thanks for taking the MOD 1 Knowledge Check. You scored ' + score + ' / ' + total + ' (' + pct + '%), ' +
    'which is below the 80% threshold to advance.\n\n' +
    'No worries — the goal is for everyone to land MOD 1 fully before we move to the hands-on practice. ' +
    'Please review the questions you missed:\n\n' +
    missedLines + '\n\n' +
    'I\'m deliberately not telling you the correct answers in this email — the point is to go back to ' +
    'the material and find them yourself. That\'s where the learning sticks.\n\n' +
    'When you\'re ready, you can retake the quiz here: ' + QUIZ_URL + '\n\n' +
    'Thanks,\nRene Bartoli\nDemand Planning · Forecast Enrichment Program';

  MailApp.sendEmail({
    to:      toEmail,
    subject: subject,
    body:    body
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
    subject: subject,
    body:    body
  });
}
