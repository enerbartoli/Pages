'use strict';

// ── Config ───────────────────────────────────────────────────────────────────
// Replace with your deployed Apps Script Web App URL after setup
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID_HERE/exec';

const PASS_THRESHOLD = 13; // ≥13/16 = pass
const TOTAL_QUESTIONS = 16;
const LS_KEY = 'mod1_quiz_state';

// ── Question Bank (no answer key — lives server-side only) ────────────────────
const QUESTIONS = [
  {
    id: 1,
    text: 'According to the new Forecast Enrichment process, what is the primary shift in how Sales contributes to the forecast?',
    options: {
      A: 'Sales now owns the entire forecast including the baseline.',
      B: 'Sales no longer participates in the forecasting process.',
      C: 'Sales no longer "forecasts" — Sales quantifies the demand impact of its own commercial activity.',
      D: 'Sales adjusts the baseline directly in Logility every cycle.'
    },
    slideRefs: '31, 33',
    section: 'Why we\'re changing'
  },
  {
    id: 2,
    text: 'What does the "wooden bridge" framing represent in the new process?',
    options: {
      A: 'A temporary fix that will be discarded once Logility is upgraded.',
      B: 'An interim, measurable, audit-friendly process that delivers improvements now while preparing for a future demand planning platform.',
      C: 'The data pipeline connecting Daybreak to Logility.',
      D: 'The reconciliation between Marketing and Demand Planning views.'
    },
    slideRefs: '5',
    section: 'End-to-end picture'
  },
  {
    id: 3,
    text: 'Which of the following is TRUE about the Daybreak statistical baseline?',
    options: {
      A: 'It is a "black box" that cannot be audited.',
      B: 'It is "prior to plans" by design — commercial plans are layered on top through enrichment.',
      C: 'It uses last year\'s actuals + 5% as the forecast.',
      D: 'It is updated by Sales each cycle.'
    },
    slideRefs: '9',
    section: 'Statistical Baseline 101'
  },
  {
    id: 4,
    text: 'Why does Daybreak use "Adjusted Demand" instead of raw shipment history?',
    options: {
      A: 'To smooth out seasonality patterns.',
      B: 'To prevent the model from learning a supply shortage (low fill rate) as if it were a drop in true demand.',
      C: 'To remove all outliers from history.',
      D: 'To convert weekly demand into monthly buckets.'
    },
    slideRefs: '10',
    section: 'Statistical Baseline 101'
  },
  {
    id: 5,
    text: 'In the three-party operating model that produces the baseline, who provides the statistical ML engine?',
    options: {
      A: 'Hasbro Demand Planning.',
      B: 'Genpact.',
      C: 'Daybreak.',
      D: 'The Logility platform team.'
    },
    slideRefs: '11',
    section: 'Statistical Baseline 101'
  },
  {
    id: 6,
    text: 'For UK Fan items, which forecasting approach applies?',
    options: {
      A: 'Standard Daybreak ML carry-forward.',
      B: 'NPI 2.0 cold-start curves.',
      C: '100% enrichment — no statistical baseline; volume captured as Base Trend variations.',
      D: 'Moving average from the past 12 months.'
    },
    slideRefs: '15',
    section: 'SKU Types'
  },
  {
    id: 7,
    text: 'For NPI items in the cold-start phase (0–8 weeks), which method does NPI 2.0 use?',
    options: {
      A: 'Like-item forecasting (copy a predecessor\'s history).',
      B: 'Brand Plan annual volume shaped by learned weekly shape + level models trained on product attributes (category, launch timing, price).',
      C: 'Last 13 weeks of actuals projected forward.',
      D: 'Daybreak\'s standard carry-forward ML model.'
    },
    slideRefs: '14',
    section: 'SKU Types'
  },
  {
    id: 8,
    text: 'At which planning level does Daybreak generate the statistical baseline?',
    options: {
      A: 'L1 (Customer × SKU × Channel).',
      B: 'L2 (Planning SKU / Customer).',
      C: 'L3 (Parent SKU / BU / Channel).',
      D: 'L5 (Brand / BU).'
    },
    slideRefs: '10, 16',
    section: 'Disaggregation'
  },
  {
    id: 9,
    text: 'For NPI disaggregation, the customer split at L2 is based on which input?',
    options: {
      A: 'The SKU\'s own moving-average shipment history.',
      B: 'Brand-level historical customer mix (substituting for the SKU\'s missing history).',
      C: 'Sales Forecast proportions.',
      D: 'A flat equal distribution across all customers.'
    },
    slideRefs: '17, 21',
    section: 'Disaggregation'
  },
  {
    id: 10,
    text: 'A parent SKU has variants A (70%) and B (30%) per P2M. Wal-Mart only carries variant A. What ensures Wal-Mart\'s volume is fully allocated to variant A and not split 70/30?',
    options: {
      A: 'The Moving Average Model auto-corrects this within 3 months.',
      B: 'The Forecasting Range setup at the customer × SKU level — variant B is excluded from Wal-Mart\'s Range.',
      C: 'KAMs manually re-enter the correct split each cycle.',
      D: 'Genpact reviews the disaggregation and corrects it.'
    },
    slideRefs: '22',
    section: 'Disaggregation'
  },
  {
    id: 11,
    text: 'An item has a normal carry-forward pattern and no new promotion is planned. What enrichment should you enter?',
    options: {
      A: 'Enter a placeholder enrichment to confirm the baseline is accepted.',
      B: 'Nothing — the baseline already handles seasonality and trend.',
      C: 'Enter a Base Trend Adjustment to confirm the SKU is active.',
      D: 'Enter a Sample enrichment of zero units.'
    },
    slideRefs: '25',
    section: 'Enrichment Principles'
  },
  {
    id: 12,
    text: 'Which of the five core L1 commercial enrichment types is the ONLY one that requires capturing driver attributes (discount %, mechanic, start/end dates)?',
    options: {
      A: 'Sets.',
      B: 'Retail Promos.',
      C: 'TMO (pallet / PDQ).',
      D: 'Pre-Orders.'
    },
    slideRefs: '26',
    section: 'Enrichment Principles'
  },
  {
    id: 13,
    text: 'How does Marketing push back on a Sales forecast they consider too optimistic?',
    options: {
      A: 'Marketing edits the Sales L1 enrichment values directly in HERO.',
      B: 'Marketing escalates to the GM to override the Sales number.',
      C: 'Marketing applies a top-down Base Trend Adjustment at BU level in the Joint M&DP Reconciliation Session — they cannot edit L1 enrichments directly.',
      D: 'Marketing waits until the next cycle to flag the disagreement.'
    },
    slideRefs: '32',
    section: 'Reconciliation'
  },
  {
    id: 14,
    text: 'In the UK pilot, who owns Base Trend adjustments at the SKU × BU level (Level 2.5)?',
    options: {
      A: 'Key Account Managers (KAMs).',
      B: 'Brand Captains.',
      C: 'Demand Planning analysts.',
      D: 'Marketing / GBT.'
    },
    slideRefs: '33',
    section: 'UK Pilot Roles'
  },
  {
    id: 15,
    text: 'In the 2026 UK pilot, how does HERO start each cycle for Brand Captains?',
    options: {
      A: 'Empty — Captains build the forecast from scratch.',
      B: 'Pre-populated with the Daybreak baseline only; Captains adjust everything else.',
      C: 'Pre-populated with the deltas between Daybreak baseline and current resultant, so Captains only capture changes they want to MOVE the resultant — no manual matching required.',
      D: 'Pre-populated with the previous month\'s consensus forecast.'
    },
    slideRefs: '33',
    section: 'End-to-end Workflow'
  },
  {
    id: 16,
    text: 'In the 2027 target operating model, how does the process change for Brand Captains?',
    options: {
      A: 'Captains no longer participate; the process becomes fully automated.',
      B: 'Captains receive a pre-populated forecast and only confirm it.',
      C: 'Captains start from the Daybreak baseline directly. Every correction tied to commercial or supply events affecting the projection requires a Base Trend adjustment.',
      D: 'Captains operate exclusively at L1 (customer level).'
    },
    slideRefs: '33',
    section: 'End-to-end Workflow'
  }
];

const ROLES = [
  'Sales / Commercial / KAM',
  'Marketing / GBT / GPL',
  'Demand Planning',
  'Finance',
  'Supply Chain',
  'Brand Captain',
  'Other'
];

// ── State ─────────────────────────────────────────────────────────────────────
let state = {
  screen: 'welcome',      // welcome | identity | question | confirm | results | submitting
  questionIndex: 0,       // 0-based, 0 = Q1
  userData: {
    name: '',
    email: '',
    role: '',
    roleOther: ''
  },
  answers: {},            // { Q1: 'C', Q2: 'B', … }
  results: null,          // server response
  submitError: null
};

// ── Persistence ───────────────────────────────────────────────────────────────
function saveState() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch (_) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      // Only restore in-progress quiz (not completed ones)
      if (saved && saved.screen !== 'results' && saved.screen !== 'welcome') {
        return saved;
      }
    }
  } catch (_) {}
  return null;
}

function clearState() {
  try { localStorage.removeItem(LS_KEY); } catch (_) {}
}

// ── DOM helpers ───────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const show = el => el && el.classList.remove('hidden');
const hide = el => el && el.classList.add('hidden');

function setScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = $(`screen-${name}`);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Navigation ────────────────────────────────────────────────────────────────
function goWelcome() {
  state.screen = 'welcome';
  setScreen('welcome');
}

function goIdentity() {
  state.screen = 'identity';
  setScreen('identity');
  saveState();
}

function goQuestion(index) {
  state.questionIndex = index;
  state.screen = 'question';
  renderQuestion(index);
  setScreen('question');
  saveState();
}

function goConfirm() {
  state.screen = 'confirm';
  renderConfirm();
  setScreen('confirm');
  saveState();
}

function goResults(results) {
  state.screen = 'results';
  state.results = results;
  renderResults(results);
  setScreen('results');
  clearState(); // submission done — clear persisted in-progress state
}

// ── Welcome screen ────────────────────────────────────────────────────────────
function initWelcome() {
  $('btn-start').addEventListener('click', () => goIdentity());
}

// ── Identity screen ───────────────────────────────────────────────────────────
function initIdentity() {
  // Render role options
  const grid = $('role-grid');
  ROLES.forEach(role => {
    const label = document.createElement('label');
    label.className = 'role-option';
    label.innerHTML = `
      <input type="radio" name="role" value="${role}">
      <span class="radio-dot"></span>
      <span>${role}</span>
    `;
    label.addEventListener('click', () => selectRole(role, label));
    grid.appendChild(label);
  });

  $('btn-begin').addEventListener('click', submitIdentity);
}

function selectRole(role, labelEl) {
  document.querySelectorAll('.role-option').forEach(l => l.classList.remove('selected'));
  labelEl.classList.add('selected');
  state.userData.role = role;

  const wrap = $('other-text-wrap');
  if (role === 'Other') {
    show(wrap);
  } else {
    hide(wrap);
    state.userData.roleOther = '';
  }
}

function submitIdentity() {
  let valid = true;

  const nameEl = $('input-name');
  const emailEl = $('input-email');
  const nameErr = $('err-name');
  const emailErr = $('err-email');
  const roleErr = $('err-role');

  // Name
  if (!nameEl.value.trim()) {
    nameEl.classList.add('error');
    nameErr.classList.add('visible');
    valid = false;
  } else {
    nameEl.classList.remove('error');
    nameErr.classList.remove('visible');
  }

  // Email
  const emailVal = emailEl.value.trim();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
  if (!emailOk) {
    emailEl.classList.add('error');
    emailErr.classList.add('visible');
    valid = false;
  } else {
    emailEl.classList.remove('error');
    emailErr.classList.remove('visible');
  }

  // Role
  if (!state.userData.role) {
    roleErr.classList.add('visible');
    valid = false;
  } else {
    roleErr.classList.remove('visible');
  }

  if (!valid) return;

  state.userData.name = nameEl.value.trim();
  state.userData.email = emailVal;
  if (state.userData.role === 'Other') {
    state.userData.roleOther = ($('input-role-other').value || '').trim();
  }

  goQuestion(0);
}

// ── Question screen ───────────────────────────────────────────────────────────
function renderQuestion(index) {
  const q = QUESTIONS[index];
  const num = index + 1;
  const pct = Math.round((num - 1) / TOTAL_QUESTIONS * 100);

  $('q-num').textContent = `Question ${num} of ${TOTAL_QUESTIONS}`;
  $('q-section').textContent = q.section;
  $('q-progress-fill').style.width = `${pct}%`;
  $('q-text').textContent = q.text;

  const list = $('options-list');
  list.innerHTML = '';

  ['A', 'B', 'C', 'D'].forEach(letter => {
    const card = document.createElement('div');
    card.className = 'option-card';
    if (state.answers[`Q${q.id}`] === letter) card.classList.add('selected');

    card.innerHTML = `
      <div class="option-letter">${letter}</div>
      <div class="option-text">${escHtml(q.options[letter])}</div>
    `;
    card.addEventListener('click', () => selectOption(q.id, letter));
    list.appendChild(card);
  });

  updateNextBtn(index);

  // Back button
  const backBtn = $('btn-back');
  if (index === 0) {
    hide(backBtn);
  } else {
    show(backBtn);
  }
}

function selectOption(qId, letter) {
  state.answers[`Q${qId}`] = letter;
  document.querySelectorAll('.option-card').forEach((card, i) => {
    const l = ['A', 'B', 'C', 'D'][i];
    card.classList.toggle('selected', l === letter);
  });
  updateNextBtn(state.questionIndex);
  saveState();
}

function updateNextBtn(index) {
  const q = QUESTIONS[index];
  const hasAnswer = !!state.answers[`Q${q.id}`];
  const nextBtn = $('btn-next');
  nextBtn.disabled = !hasAnswer;

  if (index === TOTAL_QUESTIONS - 1) {
    nextBtn.textContent = 'Review & Submit';
  } else {
    nextBtn.textContent = 'Next →';
  }
}

function initQuestion() {
  $('btn-next').addEventListener('click', () => {
    if (state.questionIndex < TOTAL_QUESTIONS - 1) {
      goQuestion(state.questionIndex + 1);
    } else {
      goConfirm();
    }
  });

  $('btn-back').addEventListener('click', () => {
    if (state.questionIndex > 0) {
      goQuestion(state.questionIndex - 1);
    } else {
      goIdentity();
    }
  });
}

// ── Confirm screen ────────────────────────────────────────────────────────────
function renderConfirm() {
  const answered = Object.keys(state.answers).length;
  $('confirm-answered').textContent = `${answered} of ${TOTAL_QUESTIONS} questions answered`;
  $('confirm-name').textContent = state.userData.name;
}

function initConfirm() {
  $('btn-submit').addEventListener('click', submitQuiz);
  $('btn-go-back').addEventListener('click', () => goQuestion(TOTAL_QUESTIONS - 1));
}

// ── Submit ────────────────────────────────────────────────────────────────────
async function submitQuiz() {
  // Build payload
  const payload = {
    name: state.userData.name,
    email: state.userData.email,
    role: state.userData.role,
    roleOther: state.userData.roleOther,
    answers: state.answers,
    userAgent: navigator.userAgent,
    quizUrl: window.location.href
  };

  // Show submitting state
  const submitBtn = $('btn-submit');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Submitting…';
  hide($('submit-error'));

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`Server responded ${res.status}`);

    const data = await res.json();

    if (data.error) throw new Error(data.error);

    goResults(data);
  } catch (err) {
    // Save state to localStorage so user doesn't lose answers
    saveState();

    const errEl = $('submit-error');
    errEl.textContent = `Submission failed: ${err.message}. Your answers are saved — please try again.`;
    errEl.classList.remove('hidden');

    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Submit Answers';
  }
}

// ── Results screen ────────────────────────────────────────────────────────────
function renderResults(data) {
  const { score, total, percent, pass, failed_questions } = data;
  const pctDisplay = Math.round(percent);

  $('result-score').textContent = `${score} / ${total}`;
  $('result-score').className = `score-number ${pass ? 'pass' : 'fail'}`;
  $('result-pct').textContent = `${pctDisplay}%`;

  const badge = $('result-badge');
  badge.textContent = pass ? 'PASSED ✓' : 'BELOW THRESHOLD';
  badge.className = `pass-badge ${pass ? 'pass' : 'fail'}`;

  $('result-message').textContent = pass
    ? 'Great work — you\'ve met the 80% threshold. Check your email for your confirmation.'
    : 'You\'re below the 80% threshold. Review the topics below and retake when ready.';

  // Missed questions section
  const missedSection = $('missed-section');
  const missedTitle = $('missed-title');

  if (failed_questions && failed_questions.length > 0) {
    missedSection.classList.remove('hidden');
    missedTitle.textContent = pass
      ? 'Questions to review (for your own improvement):'
      : 'Questions to review before retaking:';

    const list = $('failed-list');
    list.innerHTML = '';

    failed_questions.forEach(qNum => {
      const q = QUESTIONS.find(x => x.id === qNum);
      if (!q) return;

      const item = document.createElement('div');
      item.className = `failed-item ${pass ? 'pass-item' : ''}`;
      item.innerHTML = `
        <div class="failed-item-num">Question ${qNum} · ${escHtml(q.section)}</div>
        <div class="failed-item-text">${escHtml(q.text)}</div>
        <div class="slide-ref">📖 Review slide${q.slideRefs.includes(',') ? 's' : ''} ${escHtml(q.slideRefs)} in the MOD 1 facilitator deck</div>
      `;
      list.appendChild(item);
    });
  } else {
    missedSection.classList.add('hidden');
  }
}

function initResults() {
  $('btn-retake').addEventListener('click', retakeQuiz);
}

function retakeQuiz() {
  clearState();
  state = {
    screen: 'welcome',
    questionIndex: 0,
    userData: { name: '', email: '', role: '', roleOther: '' },
    answers: {},
    results: null,
    submitError: null
  };
  // Clear identity fields
  $('input-name').value = '';
  $('input-email').value = '';
  $('input-role-other').value = '';
  document.querySelectorAll('.role-option').forEach(l => l.classList.remove('selected'));
  hide($('other-text-wrap'));
  goWelcome();
}

// ── Resume prompt ─────────────────────────────────────────────────────────────
function checkResume(saved) {
  if (!saved) return false;

  const banner = $('resume-banner');
  if (!banner) return false;

  banner.classList.remove('hidden');
  $('btn-resume').addEventListener('click', () => {
    state = saved;
    banner.classList.add('hidden');
    if (state.screen === 'question') {
      goQuestion(state.questionIndex);
    } else if (state.screen === 'confirm') {
      goConfirm();
    } else if (state.screen === 'identity') {
      goIdentity();
      restoreIdentityFields();
    }
  });

  $('btn-discard').addEventListener('click', () => {
    clearState();
    banner.classList.add('hidden');
  });

  return true;
}

function restoreIdentityFields() {
  if (state.userData.name) $('input-name').value = state.userData.name;
  if (state.userData.email) $('input-email').value = state.userData.email;
  if (state.userData.role) {
    document.querySelectorAll('.role-option').forEach(label => {
      const input = label.querySelector('input');
      if (input && input.value === state.userData.role) {
        selectRole(state.userData.role, label);
      }
    });
  }
  if (state.userData.roleOther) $('input-role-other').value = state.userData.roleOther;
}

// ── Util ──────────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Boot ──────────────────────────────────────────────────────────────────────
function init() {
  initWelcome();
  initIdentity();
  initQuestion();
  initConfirm();
  initResults();

  const saved = loadState();
  checkResume(saved);

  setScreen('welcome');
}

document.addEventListener('DOMContentLoaded', init);
