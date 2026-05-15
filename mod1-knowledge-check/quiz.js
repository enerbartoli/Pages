'use strict';

// ── Config ───────────────────────────────────────────────────────────────────────────────
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwZLIenD2Ef1-B5BSzFDsrFDNezDM_jWuT9JrmYdQTv4wSzswFOxJgyp67Y6z24-r_mOw/exec';

const PASS_THRESHOLD = 13; // ≥13/16 = pass
const TOTAL_QUESTIONS = 16;
const LS_KEY = 'mod1_quiz_state';

const ANSWER_KEY = {
  Q1:'A', Q2:'B', Q3:'C', Q4:'A',  Q5:'C',  Q6:'A',  Q7:'D',  Q8:'C',
  Q9:'D', Q10:'B', Q11:'B', Q12:'C', Q13:'D', Q14:'B', Q15:'D', Q16:'A'
};

function scoreAnswers(answers) {
  let score = 0;
  const failedQNums = [];
  for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
    const key = 'Q' + i;
    if ((answers[key] || '').toUpperCase() === ANSWER_KEY[key]) {
      score++;
    } else {
      failedQNums.push(i);
    }
  }
  const percent = Math.round((score / TOTAL_QUESTIONS) * 10000) / 100;
  return { score, total: TOTAL_QUESTIONS, percent, pass: score >= PASS_THRESHOLD, failed_questions: failedQNums };
}

// ── Question Bank (no answer key — lives server-side only) ────────────────────
const QUESTIONS = [
  {
    id: 1,
    text: 'Why is Hasbro implementing the new Forecast Enrichment process now?',
    options: {
      A: 'To address chronic gaps in forecast traceability, manual workload, and the ability to measure the value of commercial intelligence.',
      B: 'To replace Logility with Daybreak as the planning system.',
      C: 'To reduce the number of Demand Planning resources required each cycle.',
      D: 'To consolidate Sales, Marketing, and Demand Planning under a single team.'
    },
    slideRefs: '2, 4',
    section: 'Why we\'re changing'
  },
  {
    id: 2,
    text: 'Which statement best describes the role of the Daybreak statistical baseline in the new process?',
    options: {
      A: 'Daybreak produces the final forecast used directly by Supply Planning; no further input is needed.',
      B: 'Daybreak models baseline demand behavior; commercial input must be added through enrichments to capture what the historical data cannot see.',
      C: 'Sales, Marketing, and Demand Planning each maintain independent baselines that are reconciled at year-end.',
      D: 'The baseline replaces all commercial input; enrichments are optional refinements.'
    },
    slideRefs: '4, 5',
    section: 'End-to-end picture'
  },
  {
    id: 3,
    text: 'Which statement is correct about the Daybreak statistical baseline?',
    options: {
      A: 'It is built by Sales each cycle based on customer commitments.',
      B: 'It is set to the prior year\'s volume adjusted by a fixed growth factor.',
      C: 'It uses Hasbro\'s real historical shipment data and item attributes — through machine learning — to predict future demand patterns.',
      D: 'It is identical to the Financial Forecast and updated on the same cadence.'
    },
    slideRefs: '8, 10',
    section: 'Statistical Baseline 101'
  },
  {
    id: 4,
    text: 'Which statement correctly describes the three-party operating model that produces the baseline?',
    options: {
      A: 'Daybreak provides the machine-learning engine; Genpact executes the operational tasks; Hasbro Demand Planning owns governance and sign-off.',
      B: 'Genpact provides the engine; Daybreak validates the outputs; Hasbro Demand Planning sets the parameters.',
      C: 'Hasbro Demand Planning generates the baseline; Genpact provides the model design; Daybreak hosts the data.',
      D: 'All three parties contribute equally to model generation, validation, and sign-off.'
    },
    slideRefs: '11',
    section: 'Statistical Baseline 101'
  },
  {
    id: 5,
    text: 'Which SKUs are treated using Daybreak\'s standard machine-learning forecasting approach?',
    options: {
      A: 'All active SKUs in the portfolio, including new product introductions.',
      B: 'Pure NPI items in their first 12 months of life.',
      C: 'Carry-Forward items with at least 52 weeks of historical shipment data.',
      D: 'Fan items, regardless of how much history they have.'
    },
    slideRefs: '12, 13',
    section: 'SKU Types'
  },
  {
    id: 6,
    text: 'How is an NPI\'s forecast generated during its cold-start phase (0–16 weeks of history)?',
    options: {
      A: 'By shaping the Brand Plan annual volume with attribute-based shape and level models (category, launch timing, price tier).',
      B: 'By copying the predecessor product\'s historical pattern.',
      C: 'By projecting the first month of actuals forward.',
      D: 'By applying Daybreak\'s carry-forward model with extrapolated history.'
    },
    slideRefs: '14',
    section: 'SKU Types'
  },
  {
    id: 7,
    text: 'Why are UK Fan items handled without a statistical baseline?',
    options: {
      A: 'Daybreak\'s licensing model prevents its use on Fan products.',
      B: 'Fan volume is too small to justify the model\'s processing cost.',
      C: 'Fan items are forecasted in a separate system maintained by Marketing.',
      D: 'Fan demand is driven by entertainment events with no recurring pattern; historical data cannot meaningfully predict future demand. Marketing and Commercial build the forecast directly.'
    },
    slideRefs: '15',
    section: 'SKU Types'
  },
  {
    id: 8,
    text: 'At which planning level is the Daybreak statistical baseline generated?',
    options: {
      A: 'Planning Level 1 — Customer × Planning SKU × Channel.',
      B: 'Planning Level 2 — Planning SKU × Customer.',
      C: 'Planning Level 3 — Parent SKU × Business Unit × Channel.',
      D: 'Planning Level 5 — Brand × Business Unit.'
    },
    slideRefs: '10, 16',
    section: 'Disaggregation'
  },
  {
    id: 9,
    text: 'What is the purpose of forecast disaggregation in the new process?',
    options: {
      A: 'To convert weekly forecasts into monthly buckets for financial reporting.',
      B: 'To translate the Consensus Forecast into the Financial Forecast for the budget cycle.',
      C: 'To split the forecast between Domestic and Direct Import channels.',
      D: 'To break the L3 statistical baseline down to the Customer × Planning SKU × Channel level (L1), so that Sales can review and enrich the forecast at the level where commercial decisions are made.'
    },
    slideRefs: '16',
    section: 'Disaggregation'
  },
  {
    id: 10,
    text: 'How does the disaggregation method differ between a Carry-Forward item and an NPI item?',
    options: {
      A: 'Both methods are identical — only the source system differs.',
      B: 'Carry-Forward uses the SKU\'s own statistical proportionality based on its history; NPI uses brand-level historical customer mix combined with P2M volume splits, because the NPI has no shipment history of its own.',
      C: 'Carry-Forward is disaggregated manually; NPI is disaggregated automatically.',
      D: 'Carry-Forward is disaggregated only at L1; NPI only at L3.'
    },
    slideRefs: '17, 19, 20, 21',
    section: 'Disaggregation'
  },
  {
    id: 11,
    text: 'What is the purpose of the Forecasting Range?',
    options: {
      A: 'It controls when Daybreak runs the statistical model for each cycle.',
      B: 'It defines, per customer × SKU, the period during which the customer should receive baseline disaggregation. Outside that period, the customer is excluded from the disaggregation logic.',
      C: 'It sets the look-back window used by the Logility Moving Average Model.',
      D: 'It determines the timing of the Joint Marketing & Demand Planning Reconciliation Session.'
    },
    slideRefs: '22',
    section: 'Disaggregation'
  },
  {
    id: 12,
    text: 'Which statement best describes when an enrichment should be applied to the baseline?',
    options: {
      A: 'On every SKU in the portfolio, each cycle, to confirm review.',
      B: 'Only when Marketing or Demand Planning requests an adjustment.',
      C: 'Only for events the statistical baseline cannot see — known commercial activity, structural changes, supply-related shifts, or committed plans.',
      D: 'Only when the forecast is below the Financial Forecast target.'
    },
    slideRefs: '25',
    section: 'Enrichment Principles'
  },
  {
    id: 13,
    text: 'What is the purpose of the Joint Marketing & Demand Planning Reconciliation Session?',
    options: {
      A: 'To allow Marketing to override Sales\' L1 enrichments in cases where Marketing has better visibility.',
      B: 'To finalize the Daybreak baseline before it is loaded to Logility for the cycle.',
      C: 'To replace the legacy Brand DMR meetings that exist today in North America.',
      D: 'To combine the bottom-up commercial view with top-down statistical and brand-strategic views, apply BU-level corrections, and prepare the proposal for Executive Sign-Off.'
    },
    slideRefs: '32',
    section: 'Reconciliation'
  },
  {
    id: 14,
    text: 'In the UK pilot, which statement correctly describes the scope split between Key Account Managers (KAMs) and Brand Captains?',
    options: {
      A: 'Both roles can edit the baseline at any planning level; the most recent edit wins.',
      B: 'Brand Captains own SKU × BU-level (Level 2.5) Base Trend adjustments. KAMs capture account-specific enrichments and account-level deltas at L1; baseline adjustments by KAMs are exceptions, not the default.',
      C: 'Only Demand Planning can adjust the baseline; both KAMs and Brand Captains submit requests for review.',
      D: 'The KAM owns baseline adjustments at all levels; the Brand Captain reviews after the fact.'
    },
    slideRefs: '33',
    section: 'UK Pilot Roles'
  },
  {
    id: 15,
    text: 'In the 2026 UK pilot, how does HERO present the starting forecast to Brand Captains at the beginning of each cycle?',
    options: {
      A: 'Empty — Brand Captains build the forecast from scratch each cycle.',
      B: 'Pre-populated with the prior month\'s consensus forecast.',
      C: 'Pre-populated with the Daybreak baseline only; Captains rebuild everything else manually.',
      D: 'Pre-populated with the deltas between the Daybreak baseline and the current resultant forecast. Captains capture only the changes they intend to move the resultant — no manual matching is required.'
    },
    slideRefs: '33',
    section: 'End-to-end Workflow'
  },
  {
    id: 16,
    text: 'In the 2027 target operating model, how does the Brand Captain\'s role differ from the 2026 pilot?',
    options: {
      A: 'Brand Captains start from the Daybreak baseline directly. Corrections for commercial or supply events affecting the forecast are captured as Base Trend adjustments.',
      B: 'Brand Captains are removed; cycles run fully automated.',
      C: 'Brand Captains operate exclusively at Level 1 (customer level), with KAMs handling BU-level decisions.',
      D: 'Brand Captains review a pre-populated forecast and confirm without modification.'
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

// ── State ───────────────────────────────────────────────────────────────────────────────
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

// ── Persistence ───────────────────────────────────────────────────────────────────────────
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

// ── DOM helpers ───────────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const show = el => el && el.classList.remove('hidden');
const hide = el => el && el.classList.add('hidden');

function setScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = $(`screen-${name}`);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Navigation ────────────────────────────────────────────────────────────────────────
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

// ── Welcome screen ────────────────────────────────────────────────────────────────────────
function initWelcome() {
  $('btn-start').addEventListener('click', () => goIdentity());
}

// ── Identity screen ───────────────────────────────────────────────────────────────────────
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

// ── Question screen ───────────────────────────────────────────────────────────────────────
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

// ── Confirm screen ────────────────────────────────────────────────────────────────────────
function renderConfirm() {
  const answered = Object.keys(state.answers).length;
  $('confirm-answered').textContent = `${answered} of ${TOTAL_QUESTIONS} questions answered`;
  $('confirm-name').textContent = state.userData.name;
}

function initConfirm() {
  $('btn-submit').addEventListener('click', submitQuiz);
  $('btn-go-back').addEventListener('click', () => goQuestion(TOTAL_QUESTIONS - 1));
}

// ── Submit ───────────────────────────────────────────────────────────────────────────────
async function submitQuiz() {
  // Build payload
  const payload = {
    name: state.userData.name,
    email: state.userData.email,
    role: state.userData.role,
    roleOther: state.userData.roleOther,
    answers: state.answers,
    module: 'mod1',
    userAgent: navigator.userAgent,
    quizUrl: window.location.href
  };

  // Show submitting state
  const submitBtn = $('btn-submit');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Submitting…';
  hide($('submit-error'));

  // Score locally to avoid Apps Script CORS redirect limitation
  const result = scoreAnswers(state.answers);

  // Fire-and-forget to Apps Script for Sheet logging + emails (no-cors)
  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload)
  }).catch(() => {}); // ignore network errors — score already shown

  goResults(result);
}

// ── Results screen ────────────────────────────────────────────────────────────────────────
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

// ── Resume prompt ─────────────────────────────────────────────────────────────────────────
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

// ── Util ───────────────────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Boot ───────────────────────────────────────────────────────────────────────────────
function init() {
  initWelcome();
  initIdentity();
  initQuestion();
  initConfirm();
  initResults();
  initDashboard();

  const saved = loadState();
  checkResume(saved);

  setScreen('welcome');
}

document.addEventListener('DOMContentLoaded', init);

// ════════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════════════════════

const DASH_HASH    = '3112727bdedc9e678230b70a47eb12222f8e6da33f24a9c5539f50cf4c84359c';
const DASH_LS_KEY  = 'mod1_dash_unlocked';
const DASH_EXPIRY  = 8 * 60 * 60 * 1000; // 8 hours

let dashAllRows  = [];  // raw rows from server (never filtered)
let dashRows     = [];  // module-filtered view of dashAllRows
let dashFiltered = [];  // date/role-filtered view of dashRows
let dashModule   = '';  // '', 'mod1', or 'mod2'
let dashLastUpdated = null;

// ── Init ───────────────────────────────────────────────────────────────────────────────
function initDashboard() {
  $('btn-open-dashboard').addEventListener('click', () => {
    setScreen('dashboard');
    checkDashAuth();
  });

  $('btn-open-dashboard-welcome').addEventListener('click', () => {
    setScreen('dashboard');
    checkDashAuth();
  });

  $('btn-dash-back').addEventListener('click', () => setScreen('results'));
  $('btn-dash-to-quiz').addEventListener('click', () => setScreen('welcome'));
  $('btn-dash-logout').addEventListener('click', dashLogout);

  $('dash-pwd-btn').addEventListener('click', dashTryUnlock);
  $('dash-pwd-input').addEventListener('keydown', e => { if (e.key === 'Enter') dashTryUnlock(); });

  $('dash-filter-btn').addEventListener('click', applyDateFilter);
  $('dash-clear-btn').addEventListener('click', clearDateFilter);
  $('dash-lookup-btn').addEventListener('click', runLookup);
  $('dash-lookup-input').addEventListener('keydown', e => { if (e.key === 'Enter') runLookup(); });

  $('dash-module-select').addEventListener('change', function() {
    dashModule = this.value;
    const url = new URL(window.location);
    dashModule ? url.searchParams.set('module', dashModule) : url.searchParams.delete('module');
    history.replaceState(null, '', url);
    dashRows     = filterByModule(dashAllRows, dashModule);
    dashFiltered = dashRows;
    populateRoleFilter();
    const from = $('dash-date-from').value, to = $('dash-date-to').value, role = $('dash-role-filter').value;
    if (from || to || role) applyDateFilter(); else renderDash();
  });

  $('btn-dash-refresh').addEventListener('click', refreshDash);
}

// ── Auth ───────────────────────────────────────────────────────────────────────────────
function checkDashAuth() {
  const stored = localStorage.getItem(DASH_LS_KEY);
  if (stored && Date.now() - parseInt(stored) < DASH_EXPIRY) {
    showDashContent();
  } else {
    show($('dash-gate'));
    hide($('dash-content'));
    $('dash-pwd-input').value = '';
    hide($('dash-pwd-error'));
  }
}

async function dashTryUnlock() {
  const pwd = $('dash-pwd-input').value;
  const hash = await sha256(pwd);
  if (hash === DASH_HASH) {
    localStorage.setItem(DASH_LS_KEY, Date.now().toString());
    hide($('dash-pwd-error'));
    showDashContent();
  } else {
    show($('dash-pwd-error'));
    $('dash-pwd-input').select();
  }
}

function dashLogout() {
  localStorage.removeItem(DASH_LS_KEY);
  hide($('dash-content'));
  show($('dash-gate'));
  $('dash-pwd-input').value = '';
}

async function sha256(str) {
  const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Load data ─────────────────────────────────────────────────────────────────────────
async function showDashContent() {
  hide($('dash-gate'));
  show($('dash-content'));

  // Sync module selector from URL on first load
  const urlMod = new URLSearchParams(window.location.search).get('module') || '';
  if (urlMod !== dashModule) {
    dashModule = urlMod;
    const sel = $('dash-module-select');
    if (sel) sel.value = dashModule;
  }

  $('dash-table-wrap').innerHTML = '<p class="muted" style="font-size:13px;">Loading…</p>';
  $('dash-kpis').innerHTML = '';

  try {
    const res  = await fetch(APPS_SCRIPT_URL + '?action=getData');
    const data = await res.json();
    dashAllRows  = (data.rows || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    dashLastUpdated = new Date();
    updateLastUpdatedLabel();
    dashRows     = filterByModule(dashAllRows, dashModule);
    dashFiltered = dashRows;
    populateRoleFilter();
    renderDash();
  } catch (err) {
    $('dash-table-wrap').innerHTML = '<p style="color:var(--coral);font-size:13px;">Failed to load data. Make sure the Apps Script is deployed and the Sheet has data.</p>';
  }
}

function populateRoleFilter() {
  const select = $('dash-role-filter');
  const current = select.value;
  // Collect unique roles from actual data + known roles
  const rolesInData = [...new Set(dashRows.map(r => r.role).filter(Boolean))];
  const allRoles = ROLES.filter(r => r !== 'Other').concat(
    rolesInData.filter(r => !ROLES.includes(r))
  );
  select.innerHTML = '<option value="">All roles</option>' +
    allRoles.map(r => `<option value="${escHtml(r)}" ${r === current ? 'selected' : ''}>${escHtml(r)}</option>`).join('');
}

// ── Date filter ─────────────────────────────────────────────────────────────────────────
function applyDateFilter() {
  const from = $('dash-date-from').value;
  const to   = $('dash-date-to').value;
  const role = $('dash-role-filter').value;

  dashFiltered = dashRows.filter(r => {
    const d = new Date(r.timestamp);
    if (from && d < new Date(from + 'T00:00:00')) return false;
    if (to   && d > new Date(to   + 'T23:59:59')) return false;
    if (role && r.role !== role) return false;
    return true;
  });

  const label = [];
  if (from) label.push('From ' + from);
  if (to)   label.push('To ' + to);
  if (role) label.push('Role: ' + role);
  $('dash-filter-label').textContent = label.length
    ? label.join(' · ') + ' — ' + dashFiltered.length + ' submission(s)'
    : '';

  renderDash();
}

function clearDateFilter() {
  $('dash-date-from').value     = '';
  $('dash-date-to').value       = '';
  $('dash-role-filter').value   = '';
  dashFiltered = dashRows;
  $('dash-filter-label').textContent = '';
  renderDash();
}

// ── Render all ────────────────────────────────────────────────────────────────────────────
function renderDash() {
  renderKPIs();
  renderDonut();
  renderHistogram();
  renderHeatmap();
  renderTable();
  renderPassRateByRole(dashFiltered);
  renderFirstAttemptPassRate(dashFiltered);
  renderAttemptsToPAss(dashFiltered);
}

// ── KPIs ───────────────────────────────────────────────────────────────────────────────
function renderKPIs() {
  const rows   = dashFiltered;
  const total  = rows.length;
  const passes = rows.filter(r => r.status === 'Pass').length;
  const fails  = total - passes;
  const avgPct = total ? Math.round(rows.reduce((s, r) => s + (r.percent || 0), 0) / total) : 0;
  const passRate = total ? Math.round((passes / total) * 100) : 0;

  const kpis = [
    { val: total,         label: 'Submissions',   color: 'var(--white)' },
    { val: passes,        label: 'Passed',         color: 'var(--teal)' },
    { val: fails,         label: 'Need retry',     color: 'var(--coral)' },
    { val: avgPct + '%',  label: 'Avg score',      color: 'var(--yellow)' },
    { val: passRate + '%',label: 'Pass rate',      color: 'var(--teal)' },
  ];

  $('dash-kpis').innerHTML = kpis.map(k =>
    `<div class="kpi-card">
      <div class="kpi-val" style="color:${k.color};">${k.val}</div>
      <div class="kpi-label">${k.label}</div>
    </div>`
  ).join('');
}

// ── Donut chart ──────────────────────────────────────────────────────────────────────────────
function renderDonut() {
  const canvas = $('chart-donut');
  const ctx    = canvas.getContext('2d');
  const rows   = dashFiltered;
  const passes = rows.filter(r => r.status === 'Pass').length;
  const fails  = rows.length - passes;
  const total  = rows.length || 1;

  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const cx = W / 2, cy = H / 2, outer = 80, inner = 50;
  const slices = [
    { val: passes, color: '#14B8A6' },
    { val: fails,  color: '#F87171' }
  ];

  let start = -Math.PI / 2;
  slices.forEach(s => {
    const angle = (s.val / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outer, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();
    start += angle;
  });

  // Hole
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, 2 * Math.PI);
  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--navy-mid').trim() || '#1E2A4A';
  ctx.fill();

  // Center text
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px Calibri, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(rows.length, cx, cy - 8);
  ctx.font = '11px Calibri, sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('total', cx, cy + 12);

  $('chart-donut-legend').innerHTML =
    `<span style="color:#14B8A6;">● Pass ${passes}</span>
     <span style="color:#F87171;">● Fail ${fails}</span>`;
}

// ── Histogram ───────────────────────────────────────────────────────────────────────────────
function renderHistogram() {
  const canvas = $('chart-hist');
  const ctx    = canvas.getContext('2d');
  const rows   = dashFiltered;

  // Buckets: 0-4, 5-6, 7-8, 9-10, 11-12, 13-14, 15-16
  const buckets = [
    { label: '0-4',   min: 0,  max: 4  },
    { label: '5-8',   min: 5,  max: 8  },
    { label: '9-10',  min: 9,  max: 10 },
    { label: '11-12', min: 11, max: 12 },
    { label: '13-14', min: 13, max: 14 },
    { label: '15-16', min: 15, max: 16 },
  ];

  buckets.forEach(b => {
    b.count = rows.filter(r => r.score >= b.min && r.score <= b.max).length;
  });

  const maxCount = Math.max(...buckets.map(b => b.count), 1);
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const padL = 24, padR = 8, padT = 10, padB = 32;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const barW   = chartW / buckets.length;
  const gap    = 6;

  buckets.forEach((b, i) => {
    const bh  = (b.count / maxCount) * chartH;
    const x   = padL + i * barW + gap / 2;
    const y   = padT + chartH - bh;
    const isPass = b.min >= 13;

    ctx.fillStyle = isPass ? '#14B8A6' : '#2D3E6F';
    ctx.beginPath();
    ctx.roundRect(x, y, barW - gap, bh, [4, 4, 0, 0]);
    ctx.fill();

    if (b.count > 0) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Calibri, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.count, x + (barW - gap) / 2, y - 4);
    }

    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px Calibri, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(b.label, x + (barW - gap) / 2, H - padB + 14);
  });

  // Pass threshold line
  const thresholdX = padL + (4 / buckets.length) * chartW + barW;
  ctx.strokeStyle = '#FFC72C';
  ctx.setLineDash([4, 3]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padL + (4 * barW), padT);
  ctx.lineTo(padL + (4 * barW), padT + chartH);
  ctx.stroke();
  ctx.setLineDash([]);
}

// ── Heatmap ───────────────────────────────────────────────────────────────────────────────
function renderHeatmap() {
  const rows = dashFiltered;
  const total = rows.length || 1;

  // Count failures per question from the 'failed' field (comma-separated Q numbers)
  const failCount = {};
  for (let i = 1; i <= 16; i++) failCount[i] = 0;

  rows.forEach(r => {
    if (!r.failed) return;
    String(r.failed).split(',').forEach(s => {
      const n = parseInt(s.trim());
      if (n >= 1 && n <= 16) failCount[n]++;
    });
  });

  $('dash-heatmap').innerHTML = Object.entries(failCount).map(([q, count]) => {
    const pct   = Math.round((count / total) * 100);
    const color = pct >= 50 ? '#F87171' : pct >= 25 ? '#FFC72C' : '#14B8A6';
    return `<div class="heatmap-row" style="cursor:pointer;" title="Q${q} — ${pct}% failed · click for details" onclick="showDrillDown(${q})">
      <span class="heatmap-label">Q${q}</span>
      <div class="heatmap-bar-track">
        <div class="heatmap-bar-fill" style="width:${pct}%;background:${color};"></div>
      </div>
      <span class="heatmap-pct" style="color:${color};">${pct}%</span>
    </div>`;
  }).join('');
}

// ── Lookup ───────────────────────────────────────────────────────────────────────────────
function runLookup() {
  const query  = $('dash-lookup-input').value.trim().toLowerCase();
  const result = $('dash-lookup-result');
  if (!query) { result.innerHTML = ''; return; }

  const matches = dashRows.filter(r => r.email.toLowerCase().includes(query) || r.name.toLowerCase().includes(query));

  if (!matches.length) {
    result.innerHTML = `<p style="color:var(--gray-muted);font-size:13px;">No submissions found for "${escHtml(query)}".</p>`;
    return;
  }

  result.innerHTML = matches.map(r => {
    const d    = new Date(r.timestamp);
    const date = d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    const statusColor = r.status === 'Pass' ? 'var(--teal)' : 'var(--coral)';
    return `<div class="lookup-card" style="margin-bottom:8px;">
      <div class="lc-name">${escHtml(r.name)}</div>
      <div class="lc-row">Email: <span>${escHtml(r.email)}</span></div>
      <div class="lc-row">Role: <span>${escHtml(r.role)}</span></div>
      <div class="lc-row">Score: <span>${r.score}/16 (${Math.round(r.percent)}%)</span></div>
      <div class="lc-row">Status: <span style="color:${statusColor};font-weight:700;">${r.status}</span></div>
      <div class="lc-row">Submitted: <span>${date}</span></div>
      ${r.failed ? `<div class="lc-row">Failed Qs: <span style="color:var(--coral);">${escHtml(r.failed)}</span></div>` : ''}
    </div>`;
  }).join('');
}

// ── Table ───────────────────────────────────────────────────────────────────────────────
function renderTable() {
  const rows = dashFiltered;
  $('dash-count').textContent = rows.length + ' record(s)';

  if (!rows.length) {
    $('dash-table-wrap').innerHTML = '<p class="muted" style="font-size:13px;">No submissions in this date range.</p>';
    return;
  }

  $('dash-table-wrap').innerHTML = `
    <table class="dash-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Score</th>
          <th>%</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => {
          const d    = new Date(r.timestamp);
          const date = d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
          const statusClass = r.status === 'Pass' ? 'status-pass' : 'status-fail';
          return `<tr>
            <td style="white-space:nowrap;">${date}</td>
            <td>${escHtml(r.name)}</td>
            <td style="color:var(--gray-muted);">${escHtml(r.email)}</td>
            <td style="color:var(--gray-muted);">${escHtml(r.role)}</td>
            <td style="font-weight:700;">${r.score}/16</td>
            <td>${Math.round(r.percent)}%</td>
            <td class="${statusClass}">${r.status}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

// ════════════════════════════════════════════════════════════════════════════════
// NEW ANALYTICS CHARTS (additive — all existing charts/functions above unchanged)
// ════════════════════════════════════════════════════════════════════════════════

// ── Module filter helpers ─────────────────────────────────────────────────────
function filterByModule(rows, mod) {
  if (!mod) return rows;
  return rows.filter(r => (r.module || 'mod1') === mod);
}

function updateLastUpdatedLabel() {
  const el = $('dash-last-updated');
  if (!el || !dashLastUpdated) return;
  const t = dashLastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  el.textContent = 'Last updated: ' + t;
}

function refreshDash() {
  showDashContent();
}

// ── Pass rate by role — any attempt ──────────────────────────────────────────
function renderPassRateByRole(rows) {
  const el = $('dash-role-pass');
  if (!el) return;
  if (!rows.length) { el.innerHTML = '<p class="muted" style="font-size:13px;">No data yet.</p>'; return; }

  const roleMap = {};
  rows.forEach(r => {
    const role = r.role || 'Unknown';
    if (!roleMap[role]) roleMap[role] = { unique: new Set(), passed: new Set() };
    roleMap[role].unique.add(r.email);
    if (r.status === 'Pass') roleMap[role].passed.add(r.email);
  });

  const entries = Object.entries(roleMap).map(([role, d]) => {
    const n = d.unique.size, p = d.passed.size;
    return { role, n, p, rate: n ? p / n : 0 };
  }).sort((a, b) => b.rate - a.rate);

  const allUnique = new Set(rows.map(r => r.email));
  const allPassed = new Set(rows.filter(r => r.status === 'Pass').map(r => r.email));
  const totalRate = allUnique.size ? allPassed.size / allUnique.size : 0;

  el.innerHTML = renderRoleBars([
    { role: 'Total', n: allUnique.size, p: allPassed.size, rate: totalRate, isTotal: true },
    ...entries
  ]);
}

// ── Pass rate by role — first attempt only ────────────────────────────────────
function renderFirstAttemptPassRate(rows) {
  const el = $('dash-role-first');
  if (!el) return;
  if (!rows.length) { el.innerHTML = '<p class="muted" style="font-size:13px;">No data yet.</p>'; return; }

  // One row per email: the earliest submission = first attempt
  const firstByEmail = {};
  rows.forEach(r => {
    if (!firstByEmail[r.email] || new Date(r.timestamp) < new Date(firstByEmail[r.email].timestamp)) {
      firstByEmail[r.email] = r;
    }
  });
  const firstAttempts = Object.values(firstByEmail);

  const roleMap = {};
  firstAttempts.forEach(r => {
    const role = r.role || 'Unknown';
    if (!roleMap[role]) roleMap[role] = { n: 0, p: 0 };
    roleMap[role].n++;
    if (r.status === 'Pass') roleMap[role].p++;
  });

  const entries = Object.entries(roleMap).map(([role, d]) => ({
    role, n: d.n, p: d.p, rate: d.n ? d.p / d.n : 0
  })).sort((a, b) => b.rate - a.rate);

  const totalN = firstAttempts.length;
  const totalP = firstAttempts.filter(r => r.status === 'Pass').length;

  el.innerHTML = renderRoleBars([
    { role: 'Total', n: totalN, p: totalP, rate: totalN ? totalP / totalN : 0, isTotal: true },
    ...entries
  ]);
}

// ── Shared role bar renderer ──────────────────────────────────────────────────
function renderRoleBars(entries) {
  return entries.map(e => {
    const pct   = e.n ? Math.round(e.rate * 100) : 0;
    const color = e.isTotal ? 'var(--yellow)'
                : pct >= 70 ? '#14B8A6'
                : pct >= 40 ? '#FFC72C'
                : '#F87171';
    const label = e.n ? `${pct}% (${e.p} / ${e.n})` : 'No data';
    return `<div class="role-bar-row${e.isTotal ? ' role-bar-total' : ''}">
      <span class="role-bar-label">${escHtml(e.role)}</span>
      <div class="role-bar-track">
        <div class="role-bar-fill" style="width:${pct}%;background:${color};"></div>
      </div>
      <span class="role-bar-val" style="color:${color};">${label}</span>
    </div>`;
  }).join('');
}

// ── Attempts required to pass (vertical bar canvas) ───────────────────────────
function renderAttemptsToPAss(rows) {
  const canvas = $('chart-attempts');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Per email: sort all submissions by timestamp, find first passing row
  const byEmail = {};
  rows.forEach(r => {
    if (!byEmail[r.email]) byEmail[r.email] = [];
    byEmail[r.email].push(r);
  });

  const passers = [];
  let notYetPassed = 0;
  Object.values(byEmail).forEach(attempts => {
    attempts.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const firstPass = attempts.findIndex(r => r.status === 'Pass');
    if (firstPass === -1) {
      notYetPassed++;
    } else {
      passers.push(firstPass + 1); // 1-based attempt number
    }
  });

  const buckets = [
    { label: '1',  min: 1, max: 1 },
    { label: '2',  min: 2, max: 2 },
    { label: '3',  min: 3, max: 3 },
    { label: '4+', min: 4, max: Infinity }
  ];
  buckets.forEach(b => {
    b.count = passers.filter(n => n >= b.min && n <= b.max).length;
  });

  const note = $('chart-attempts-note');
  if (note) {
    note.textContent = notYetPassed > 0
      ? `${notYetPassed} ${notYetPassed === 1 ? 'person has' : 'people have'} attempted without passing yet.`
      : '';
  }

  const total = passers.length || 1;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const padL = 24, padR = 8, padT = 24, padB = 32;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxCount = Math.max(...buckets.map(b => b.count), 1);
  const barW = chartW / buckets.length;
  const gap  = 10;

  buckets.forEach((b, i) => {
    const pct = Math.round((b.count / total) * 100);
    const bh  = (b.count / maxCount) * chartH;
    const x   = padL + i * barW + gap / 2;
    const y   = padT + chartH - bh;

    ctx.fillStyle = '#14B8A6';
    ctx.beginPath();
    ctx.roundRect(x, y, barW - gap, Math.max(bh, 1), [4, 4, 0, 0]);
    ctx.fill();

    if (b.count > 0) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Calibri, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${pct}% (${b.count})`, x + (barW - gap) / 2, y - 4);
    }

    ctx.fillStyle = '#94A3B8';
    ctx.font = '11px Calibri, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(b.label, x + (barW - gap) / 2, H - padB + 14);
  });

  ctx.fillStyle = '#94A3B8';
  ctx.font = '10px Calibri, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Attempts to pass', W / 2, H - 2);
}

// ── Question drill-down modal ─────────────────────────────────────────────────
function showDrillDown(qNum) {
  const q = QUESTIONS.find(x => x.id === qNum);
  if (!q) return;

  const correctLetter = ANSWER_KEY['Q' + qNum];
  const rows = dashFiltered;
  const total = rows.length || 1;

  // Count wrong-answer option selections
  const wrongPicks = { A: 0, B: 0, C: 0, D: 0 };
  let totalWrong = 0;
  let failCount  = 0;
  rows.forEach(r => {
    if (!r.answers) return;
    const given = (r.answers['Q' + qNum] || '').toUpperCase();
    if (!given) return;
    if (given !== correctLetter) {
      wrongPicks[given] = (wrongPicks[given] || 0) + 1;
      totalWrong++;
      failCount++;
    }
  });

  const failPct = Math.round((failCount / total) * 100);

  const optionsHTML = ['A', 'B', 'C', 'D'].map(letter => {
    const isCorrect = letter === correctLetter;
    const picked    = wrongPicks[letter] || 0;
    const wrongPct  = totalWrong ? Math.round((picked / totalWrong) * 100) : 0;
    const cls = isCorrect ? 'correct' : (picked > 0 ? 'wrong-picked' : 'not-picked');
    const statHTML = isCorrect
      ? `<div class="drill-option-stat">✓ Correct answer</div>`
      : (picked > 0 ? `<div class="drill-option-stat">${picked} selection${picked !== 1 ? 's' : ''} — ${wrongPct}% of wrong answers</div>` : '');
    return `<div class="drill-option ${cls}">
      <span class="drill-option-letter">${letter}</span>
      <div class="drill-option-text">
        <div>${escHtml(q.options[letter])}</div>
        ${statHTML}
      </div>
    </div>`;
  }).join('');

  const noDataNote = !rows.some(r => r.answers)
    ? '<p class="muted" style="font-size:12px;margin-bottom:12px;">Per-option breakdown not available for submissions before this feature was enabled.</p>'
    : '';

  $('drill-content').innerHTML = `
    <div class="drill-q-num">Question ${qNum} · ${escHtml(q.section)}</div>
    <div class="drill-q-text">${escHtml(q.text)}</div>
    <div class="drill-fail-rate">${failPct}% failure rate (${failCount} of ${total} submission${total !== 1 ? 's' : ''})</div>
    ${noDataNote}
    ${optionsHTML}
    <div class="drill-slide-ref">📖 Slide${q.slideRefs.includes(',') ? 's' : ''} ${escHtml(q.slideRefs)}</div>
  `;

  $('drill-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeDrillDown(event) {
  // Close if: X button clicked (no event), or overlay background clicked (not the panel)
  if (event && event.target !== $('drill-modal')) return;
  $('drill-modal').classList.add('hidden');
  document.body.style.overflow = '';
}
