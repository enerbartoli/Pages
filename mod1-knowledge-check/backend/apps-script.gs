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
  Q1: 'A', Q2: 'B', Q3: 'C', Q4: 'A',  Q5: 'C',  Q6: 'A',  Q7: 'D',  Q8: 'C',
  Q9: 'D', Q10: 'B', Q11: 'B', Q12: 'C', Q13: 'D', Q14: 'B', Q15: 'D', Q16: 'A'
};

// ── Slide references for fail-email feedback ───────────────────────────────────
const SLIDE_REFS = {
  Q1: '2, 4',  Q2: '4, 5',  Q3: '8, 10',  Q4: '11',   Q5: '12, 13',
  Q6: '14',   Q7: '15',    Q8: '10, 16', Q9: '16',   Q10: '17, 19, 20, 21',
  Q11: '22',  Q12: '25',   Q13: '32',    Q14: '33',  Q15: '33',  Q16: '33'
};

// ── Question text (for fail-email body) ───────────────────────────────────────
const QUESTION_TEXT = {
  Q1:  'Why is Hasbro implementing the new Forecast Enrichment process now?',
  Q2:  'Which statement best describes the role of the Daybreak statistical baseline in the new process?',
  Q3:  'Which statement is correct about the Daybreak statistical baseline?',
  Q4:  'Which statement correctly describes the three-party operating model that produces the baseline?',
  Q5:  'Which SKUs are treated using Daybreak\'s standard machine-learning forecasting approach?',
  Q6:  'How is an NPI\'s forecast generated during its cold-start phase (0–8 weeks of history)?',
  Q7:  'Why are UK Fan items handled without a statistical baseline?',
  Q8:  'At which planning level is the Daybreak statistical baseline generated?',
  Q9:  'What is the purpose of forecast disaggregation in the new process?',
  Q10: 'How does the disaggregation method differ between a Carry-Forward item and an NPI item?',
  Q11: 'What is the purpose of the Forecasting Range?',
  Q12: 'Which statement best describes when an enrichment should be applied to the baseline?',
  Q13: 'What is the purpose of the Joint Marketing & Demand Planning Reconciliation Session?',
  Q14: 'In the UK pilot, which statement correctly describes the scope split between Key Account Managers (KAMs) and Brand Captains?',
  Q15: 'In the 2026 UK pilot, how does HERO present the starting forecast to Brand Captains at the beginning of each cycle?',
  Q16: 'In the 2027 target operating model, how does the Brand Captain\'s role differ from the 2026 pilot?'
};

// ══════════════════════════════════════════════════════════════════════════════
// MOD 2 — Enrichment Practice (additive — all MOD 1 constants above unchanged)
// ══════════════════════════════════════════════════════════════════════════════

const ANSWER_KEY_MOD2 = {
  Q1:'A', Q2:'B', Q3:'C', Q4:'C', Q5:'D',
  Q6:'B', Q7:'B', Q8:'C', Q9:'A', Q10:'A',
  Q11:'D', Q12:'C', Q13:'A', Q14:'D', Q15:'B'
};
const TOTAL_QUESTIONS_MOD2 = 15;
const PASS_THRESHOLD_MOD2  = 12;
const QUIZ_URL_MOD2        = 'https://enerbartoli.github.io/mod1-knowledge-check/mod2.html';

const SLIDE_REFS_MOD2 = {
  Q1:'4, 5, 6', Q2:'4',       Q3:'7, 8',        Q4:'9, 10',
  Q5:'11, 12, 13, 14',        Q6:'24',           Q7:'32',
  Q8:'29',      Q9:'26',      Q10:'37',          Q11:'31',
  Q12:'39',     Q13:'44',     Q14:'51',          Q15:'54'
};

const QUESTION_TEXT_MOD2 = {
  Q1:  'A carry-forward item shows two consecutive years of stable seasonal demand, with no confirmed commercial event, no supply issue, and no distribution change in scope. The Daybreak baseline and the Resultant Forecast track the same seasonal shape at L3. What is the correct action?',
  Q2:  'You are reviewing a scenario where the total demand at L3 looks correct against history, but the customer-level split at L2 routes most of the volume to inactive partners. Where does the issue live?',
  Q3:  'An item shipped near zero for several months in 2025 because of a confirmed stockout. The Daybreak baseline now projects 2026 demand at a fraction of the pre-stockout run-rate, because the model learned the suppression as true decline. What is the correct action?',
  Q4:  'A Warm Start NPI with under 12 months of history has 16 weeks of actuals below the 2026 Resultant plan, and Daybreak has slashed the 2027 baseline by more than half. After reviewing together, you and the Brand Captain agree Daybreak\'s drop is too aggressive and the SKU can still rebound. What is the correct action?',
  Q5:  'A carry-forward item is exclusive to a single retailer — that retailer absorbs ~100% of actuals across the past two years. The Current Resultant disaggregation routes a large share to other customers with no recent history, while the Moving Average method routes ~100% to the exclusive partner. What is the correct action?',
  Q6:  'Which statement correctly describes the difference between a Set and a Base Trend enrichment?',
  Q7:  'A customer pulls confirmed annual demand into a specific order window, with offsetting reductions in the months from which demand is being moved. The full-year total does not change. Which enrichment approach is correct?',
  Q8:  'A customer is adding new stores to its distribution. The initial pipeline fill ships in one window (F1), and ongoing replenishment continues in those new stores afterwards. Which enrichment approach is correct?',
  Q9:  'An established carry-forward item has a future confirmed retail promotion that is not already reflected in baseline behavior. The promo will generate incremental units in a specific ship window. Which enrichment is correct?',
  Q10: 'A customer has provided a specific pre-order quantity and timing for a new item with no comparable history. What is the correct way to capture it?',
  Q11: 'An NPI\'s stat baseline already includes the channel-fill volume in its launch shape, but the team needs the fill visible as a discrete set for allocation traceability. What is the correct approach in F1?',
  Q12: 'Last year a deal spike inflated demand for a specific period, and the promotion is not repeating this year. The baseline is now projecting the spike forward as if it were normal seasonality. What is the correct action?',
  Q13: 'A specific customer has discontinued an item that remains active at other customers. The baseline is still allocating volume to the dropped customer based on past proportions. What is the correct action?',
  Q14: 'A customer is changing its buying route from Domestic to Direct Import. Total demand is unchanged — only the channel is moving. The volume in scope currently sits in the baseline. What is the correct approach?',
  Q15: 'At the BU/brand level the L3 total is accurate against history, but the L2 customer split allocates too much volume to a customer with declining actuals. What is the correct path?'
};

const RATIONALES_MOD2 = {
  Q1:  'Two consecutive years of clean history that converge with the baseline mean the model is fit-for-purpose at L3 — adding an enrichment without a missing event would introduce noise without adding value.',
  Q2:  'When L3 totals are right but the customer mix is wrong, the issue lives in the L2 disaggregation logic — adding an enrichment at L3 would inflate the total instead of fixing the split.',
  Q3:  'Stockout-suppressed history is contaminated input, not a true demand signal, so cleansing the affected months at source rebuilds the baseline durably and avoids re-doing the same correction every cycle.',
  Q4:  'When the team has assessed that Daybreak\'s reduction is too aggressive — not enough history for a structural reset — the correct path is to recalculate demand with commercial knowledge and lock the agreed view via an L2.5 Base Trend adjustment using the Brand Captain\'s template.',
  Q5:  'For an exclusive item, Moving Average over recent actuals captures the real customer mix while Current Resultant fragments to inactive partners — switching the disaggregation method is the direct fix, no L3 enrichment needed.',
  Q6:  'Sets are for one-time events because they cleanse out of history after they ship; Base Trend is for structural changes that should repeat because it permanently enters the baseline.',
  Q7:  'A ladder is a timing move, not incremental demand — sets are the right tool because they cleanse out of history, while base trend would permanently distort next year\'s baseline with the same timing shift.',
  Q8:  'The new-store fill is one-time (Set, cleanses out) and the higher run-rate is structural (Base Trend, enters baseline) — using a single enrichment type for both would either contaminate next year\'s baseline or leave the ongoing lift uncaptured.',
  Q9:  'A confirmed, incremental, time-bounded promo is exactly what the promo enrichment type was built for — base trend would inflate next year\'s baseline, and a set would over-capture by extending beyond the promo window.',
  Q10: 'Pre-orders are entered at confirmed quantity only — adding speculative volume beyond the commitment undermines the rationale for using the enrichment type in the first place.',
  Q11: 'The channel-fill is already in the NPI baseline, so a single positive set would double-count — two offsetting sets keep the total unchanged while making the fill visible for allocation, and both cleanse out after launch.',
  Q12: 'A non-repeating historical spike that the model is echoing forward needs to be removed structurally — negative base trend corrects it now, and flagging the period for historical cleansing prevents the same correction from being needed next cycle.',
  Q13: 'A customer exit is a structural change — base trend removes the phantom volume while the forecasting-range update prevents the model from continuing to route demand to a customer that no longer takes the item.',
  Q14: 'Channel shift is a routing change, not new demand — the channel-shift functionality moves baseline volume cleanly between channels, while creating offsetting enrichments would distort total demand.',
  Q15: 'When L3 is right, no enrichment is needed — enriching at L1 to fix an L2 split would inflate L3 total demand, so the correct path is a disaggregation adjustment routed through DP/Genpact.'
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
  if (e && e.parameter && e.parameter.action === 'getData') {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) return buildResponse({ rows: [] });

    var data = sheet.getDataRange().getValues();
    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var r = data[i];
      rows.push({
        timestamp:  r[0] ? new Date(r[0]).toISOString() : '',
        name:       r[1] || '',
        email:      r[2] || '',
        role:       r[3] || '',
        score:      r[5] || 0,
        percent:    r[6] || 0,
        status:     r[7] || '',
        failed:     r[40] || '',
        module:     r[43] || 'mod1',
        attempt:    r[44] || 1
      });
    }
    return buildResponse({ rows: rows });
  }
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

    // 3. Route by module (minimum change — MOD 1 flow below is unchanged)
    var moduleId = String(payload.module || 'mod1').toLowerCase();
    if (moduleId === 'mod2') { return handleMod2Post(payload); }

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
    '<p style="color:#495057;font-size:15px;line-height:1.6;">No worries — the goal is for everyone to fully land MOD 1 before moving to hands-on practice.</p>' +
    '<h3 style="color:#0d1b2e;font-size:16px;font-weight:700;margin:24px 0 12px;">Questions to Review to Better Your Understanding</h3>' +
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

// ══════════════════════════════════════════════════════════════════════════════
// MOD 2 HANDLERS (additive — all MOD 1 functions above are unchanged)
// ══════════════════════════════════════════════════════════════════════════════

function handleMod2Post(payload) {
  try {
    var validationError = validatePayload_mod2(payload);
    if (validationError) return buildResponse({ error: validationError }, 400);

    var scoreResult = scoreSubmission_mod2(payload.answers);
    var sheetUrl    = appendToSheet_mod2(payload, scoreResult);
    sendEmails_mod2(payload, scoreResult, sheetUrl);

    return buildResponse({
      score:            scoreResult.score,
      total:            TOTAL_QUESTIONS_MOD2,
      percent:          scoreResult.percent,
      pass:             scoreResult.pass,
      failed_questions: scoreResult.failedQNums
    });
  } catch (err) {
    Logger.log('handleMod2Post error: ' + err.message + '\n' + err.stack);
    return buildResponse({ error: 'Server error. Please try again.' }, 500);
  }
}

function validatePayload_mod2(p) {
  if (!p.name || String(p.name).trim().length < 2) return 'Name is required.';
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!p.email || !emailRe.test(String(p.email).trim())) return 'Valid email is required.';
  if (!p.role) return 'Role is required.';
  if (!p.answers || typeof p.answers !== 'object') return 'Answers are required.';
  for (var i = 1; i <= TOTAL_QUESTIONS_MOD2; i++) {
    var key = 'Q' + i;
    var val = p.answers[key];
    if (!val || !['A','B','C','D'].includes(String(val).toUpperCase())) {
      return 'Answer for ' + key + ' is missing or invalid.';
    }
  }
  return null;
}

function scoreSubmission_mod2(answers) {
  var score = 0;
  var results = {};
  var failedQNums = [];
  for (var i = 1; i <= TOTAL_QUESTIONS_MOD2; i++) {
    var key     = 'Q' + i;
    var given   = String(answers[key] || '').toUpperCase();
    var correct = ANSWER_KEY_MOD2[key];
    var isCorrect = given === correct;
    results[key] = { given: given, correct: isCorrect };
    if (isCorrect) { score++; } else { failedQNums.push(i); }
  }
  var percent = Math.round((score / TOTAL_QUESTIONS_MOD2) * 10000) / 100;
  return { score: score, percent: percent, pass: score >= PASS_THRESHOLD_MOD2, results: results, failedQNums: failedQNums };
}

function computeAttemptNumber(emailLower, moduleId, sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 1;
  var count = 1;
  var data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  for (var i = 0; i < data.length; i++) {
    var rowEmail  = String(data[i][2]  || '').toLowerCase(); // col C = email
    var rowModule = String(data[i][43] || '').toLowerCase(); // col AR = module
    if (rowEmail === emailLower && rowModule === moduleId) count++;
  }
  return count;
}

function appendToSheet_mod2(payload, scoreResult) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) { sheet = ss.insertSheet(SHEET_NAME); writeHeaders(sheet); }
  if (sheet.getLastRow() === 0) writeHeaders(sheet);

  var moduleId      = 'mod2';
  var attemptNumber = computeAttemptNumber(String(payload.email).trim().toLowerCase(), moduleId, sheet);

  var now = new Date();
  var row = [
    now, payload.name.trim(), payload.email.trim().toLowerCase(), payload.role,
    payload.roleOther || '', scoreResult.score, scoreResult.percent,
    scoreResult.pass ? 'Pass' : 'Fail'
  ];

  // Q1–Q15 answer + correct pairs
  for (var i = 1; i <= TOTAL_QUESTIONS_MOD2; i++) {
    var key = 'Q' + i;
    var r   = scoreResult.results[key];
    row.push(r.given);
    row.push(r.correct);
  }
  // Q16 placeholder blanks — preserves column alignment with MOD 1 sheet layout
  row.push('');
  row.push('');

  row.push(scoreResult.failedQNums.join(', '));
  row.push(true);
  row.push((payload.userAgent || '').slice(0, 200));
  row.push(moduleId);
  row.push(attemptNumber);

  sheet.appendRow(row);
  return ss.getUrl();
}

function sendEmails_mod2(payload, scoreResult, sheetUrl) {
  var name  = payload.name.trim();
  var email = payload.email.trim().toLowerCase();
  try {
    if (scoreResult.pass) {
      sendPassEmail_mod2(email, name, scoreResult.score, TOTAL_QUESTIONS_MOD2, scoreResult.percent);
    } else {
      sendFailEmail_mod2(email, name, scoreResult.score, TOTAL_QUESTIONS_MOD2, scoreResult.percent, scoreResult.failedQNums);
    }
    sendNotificationEmail_mod2(payload, scoreResult, sheetUrl);
    return true;
  } catch (err) {
    Logger.log('MOD 2 email error: ' + err.message);
    return false;
  }
}

function emailShell_mod2(contentHtml) {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 0;">' +
    '<tr><td align="center">' +
    '<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">' +
    '<tr><td style="background:#0d1b2e;padding:28px 40px;text-align:center;">' +
    '<p style="margin:0;color:#00c9a7;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Forecast Enrichment Programme · UK Pilot</p>' +
    '<p style="margin:8px 0 0;color:#ffffff;font-size:20px;font-weight:700;">MOD 2 Knowledge Check</p>' +
    '</td></tr>' +
    '<tr><td style="padding:40px;">' + contentHtml + '</td></tr>' +
    '<tr><td style="background:#f8f9fa;padding:20px 40px;border-top:1px solid #e9ecef;text-align:center;">' +
    '<p style="margin:0;color:#6c757d;font-size:12px;">Rene Bartoli · Demand Planning · Forecast Enrichment Program</p>' +
    '</td></tr>' +
    '</table></td></tr></table></body></html>';
}

function sendPassEmail_mod2(toEmail, name, score, total, pct) {
  var subject = '✓ MOD 2 Knowledge Check — Passed';
  var content =
    '<div style="text-align:center;margin-bottom:32px;">' +
    '<div style="display:inline-block;background:#d4edda;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">✓</div>' +
    '<h2 style="margin:16px 0 4px;color:#0d1b2e;font-size:24px;">Well done, ' + name + '!</h2>' +
    '<p style="margin:0;color:#6c757d;font-size:15px;">You\'ve passed the MOD 2 knowledge check</p>' +
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
    '<p style="color:#495057;font-size:15px;line-height:1.6;">You\'ve met the <strong>80% threshold</strong> for MOD 2 — Enrichment Practice.</p>' +
    '<div style="background:#e8f8f5;border-left:4px solid #00c9a7;border-radius:4px;padding:16px 20px;margin:24px 0;">' +
    '<p style="margin:0;color:#0d1b2e;font-size:14px;font-weight:700;">You\'re ready</p>' +
    '<p style="margin:6px 0 0;color:#495057;font-size:14px;">You have now completed both modules. You\'re ready for hands-on enrichment practice in HERO.</p>' +
    '</div>' +
    '<p style="color:#6c757d;font-size:14px;line-height:1.6;">If you have questions about MOD 2 concepts, revisit the facilitator deck in the project SharePoint or reach out to the Demand Planning team.</p>';
  MailApp.sendEmail({ to: toEmail, subject: subject, htmlBody: emailShell_mod2(content) });
}

function sendFailEmail_mod2(toEmail, name, score, total, pct, failedQNums) {
  var subject = 'MOD 2 Knowledge Check — Please review and retry';

  var missedRows = failedQNums.map(function(num) {
    var key        = 'Q' + num;
    var qText      = QUESTION_TEXT_MOD2[key] || '';
    var refs       = SLIDE_REFS_MOD2[key] || '';
    var rationale  = RATIONALES_MOD2[key] || '';
    var slideLabel = refs.indexOf(',') > -1 ? 'Slides' : 'Slide';
    return '<tr style="border-bottom:1px solid #e9ecef;">' +
      '<td style="padding:12px 8px;color:#0d1b2e;font-weight:700;font-size:13px;white-space:nowrap;">Q' + num + '</td>' +
      '<td style="padding:12px 8px;font-size:13px;line-height:1.5;">' +
        '<div style="color:#495057;">' + qText + '</div>' +
        '<div style="color:#6c757d;font-style:italic;margin-top:6px;font-size:12px;">' + rationale + '</div>' +
      '</td>' +
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
    '<p style="color:#495057;font-size:15px;line-height:1.6;">No worries — the goal is for everyone to fully land MOD 2 before working in HERO.</p>' +
    '<h3 style="color:#0d1b2e;font-size:16px;font-weight:700;margin:24px 0 12px;">Questions to Review to Better Your Understanding</h3>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e9ecef;border-radius:8px;overflow:hidden;margin:20px 0;">' +
    '<tr style="background:#0d1b2e;">' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">#</th>' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">Question &amp; Rationale</th>' +
    '<th style="padding:10px 8px;color:#00c9a7;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;">Review</th>' +
    '</tr>' +
    missedRows +
    '</table>' +
    '<div style="background:#fff3cd;border-left:4px solid #ffd60a;border-radius:4px;padding:16px 20px;margin:24px 0;">' +
    '<p style="margin:0;color:#0d1b2e;font-size:14px;font-weight:700;">Note</p>' +
    '<p style="margin:6px 0 0;color:#495057;font-size:14px;">I\'m deliberately not sharing the correct answers here — go back to the material and find them yourself. That\'s where the learning sticks.</p>' +
    '</div>' +
    '<div style="text-align:center;margin-top:28px;">' +
    '<a href="' + QUIZ_URL_MOD2 + '" style="display:inline-block;background:#ffd60a;color:#0d1b2e;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">Retake the Quiz →</a>' +
    '</div>';

  MailApp.sendEmail({ to: toEmail, subject: subject, htmlBody: emailShell_mod2(content) });
}

function sendNotificationEmail_mod2(payload, scoreResult, sheetUrl) {
  var name        = payload.name.trim();
  var email       = payload.email.trim().toLowerCase();
  var role        = payload.role + (payload.roleOther ? ' (' + payload.roleOther + ')' : '');
  var score       = scoreResult.score;
  var total       = TOTAL_QUESTIONS_MOD2;
  var pct         = scoreResult.percent;
  var status      = scoreResult.pass ? 'PASS' : 'FAIL';
  var failedCount = scoreResult.failedQNums.length;
  var failedList  = failedCount > 0
    ? '  (' + scoreResult.failedQNums.map(function(n) { return 'Q' + n; }).join(', ') + ')'
    : '';

  var subject = '[MOD 2 Quiz] ' + name + ' — ' + score + '/' + total + ' — ' + status;
  var body =
    name + ' (' + email + ', ' + role + ') just submitted the MOD 2 Knowledge Check.\n\n' +
    'Score: ' + score + ' / ' + total + ' (' + pct + '%)\n' +
    'Status: ' + status + '\n' +
    'Questions failed: ' + failedCount + ' of ' + total + failedList + '\n\n' +
    'Full row written to the Sheet:\n' + sheetUrl;

  MailApp.sendEmail({ to: RENE_EMAIL, cc: RENE_COPY_EMAIL, subject: subject, body: body });
}
