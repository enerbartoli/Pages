'use strict';

// ── Config ────────────────────────────────────────────────────────────────────
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwZLIenD2Ef1-B5BSzFDsrFDNezDM_jWuT9JrmYdQTv4wSzswFOxJgyp67Y6z24-r_mOw/exec';

const PASS_THRESHOLD    = 12; // ≥12/15 = pass
const TOTAL_QUESTIONS   = 15;
const LS_KEY            = 'mod2_quiz_state';

const ANSWER_KEY = {
  Q1:'A', Q2:'B', Q3:'C', Q4:'C', Q5:'D',
  Q6:'B', Q7:'B', Q8:'C', Q9:'A', Q10:'A',
  Q11:'D', Q12:'C', Q13:'A', Q14:'D', Q15:'B'
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

// ── Question Bank ─────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 1,
    text: 'A carry-forward item shows two consecutive years of stable seasonal demand, with no confirmed commercial event, no supply issue, and no distribution change in scope. The Daybreak baseline and the Resultant Forecast track the same seasonal shape at L3. What is the correct action?',
    options: {
      A: 'Accept the L3 baseline — no enrichment required.',
      B: 'Apply a positive base trend adjustment to lock the seasonal pattern into next year.',
      C: 'Override the Daybreak baseline with the Sales Forecast.',
      D: 'Submit a disaggregation adjustment request to DP/Genpact.'
    },
    slideRefs: '4, 5, 6',
    rationale: 'Two consecutive years of clean history that converge with the baseline mean the model is fit-for-purpose at L3 — adding an enrichment without a missing event would introduce noise without adding value.',
    section: 'Baseline Training'
  },
  {
    id: 2,
    text: 'You are reviewing a scenario where the total demand at L3 looks correct against history, but the customer-level split at L2 routes most of the volume to inactive partners. Where does the issue live?',
    options: {
      A: 'In the L3 baseline — apply a base trend correction.',
      B: 'In the L2 disaggregation — fix the customer mix without changing L3.',
      C: 'In the Daybreak engine — escalate to Genpact for a model rerun.',
      D: 'In both layers — apply offsetting enrichments at L3 and L1.'
    },
    slideRefs: '4',
    rationale: 'When L3 totals are right but the customer mix is wrong, the issue lives in the L2 disaggregation logic — adding an enrichment at L3 would inflate the total instead of fixing the split.',
    section: 'Baseline Training'
  },
  {
    id: 3,
    text: 'An item shipped near zero for several months in 2025 because of a confirmed stockout. The Daybreak baseline now projects 2026 demand at a fraction of the pre-stockout run-rate, because the model learned the suppression as true decline. What is the correct action?',
    options: {
      A: 'Apply a positive promo enrichment to lift demand back to historical levels.',
      B: 'Override the Daybreak baseline with the Sales Forecast each cycle going forward.',
      C: 'Cleanse the stockout-affected months in historical data so Daybreak can rebuild an accurate baseline.',
      D: 'Accept the Daybreak baseline — the model is reading the most recent year correctly.'
    },
    slideRefs: '7, 8',
    rationale: 'Stockout-suppressed history is contaminated input, not a true demand signal, so cleansing the affected months at source rebuilds the baseline durably and avoids re-doing the same correction every cycle.',
    section: 'Baseline Training'
  },
  {
    id: 4,
    text: 'A Warm Start NPI has 16 weeks of actuals that came in below the 2026 Resultant plan. Daybreak interprets this as a structural correction and slashes the 2027 baseline by more than half. The item still has under 12 months of history. What is the correct action?',
    options: {
      A: 'Accept the Daybreak 2027 baseline — 16 weeks of actuals is a strong signal.',
      B: 'Apply a negative base trend in 2026 to match the Daybreak 2027 view.',
      C: 'Recalculate overall demand with Brand Captain and Sales input, preserving NPI logic.',
      D: 'Phase the item out — the early sell-in is signaling end of life.'
    },
    slideRefs: '9, 10',
    rationale: 'Sixteen weeks of actuals on an NPI with under twelve months of history is not enough signal to justify a structural reset of the next-year baseline, so the team recalculates demand together to balance the model\'s signal against commercial knowledge.',
    section: 'Baseline Training'
  },
  {
    id: 5,
    text: 'A carry-forward item is exclusive to a single retailer — that retailer absorbs ~100% of actuals across the past two years. The Current Resultant disaggregation routes a large share to other customers with no recent history, while the Moving Average method routes ~100% to the exclusive partner. What is the correct action?',
    options: {
      A: 'Keep the Current disaggregation; the model will self-correct over time.',
      B: 'Apply a negative base trend to remove the non-active customers.',
      C: 'Submit a disaggregation request to DP/Genpact to rebuild the customer hierarchy.',
      D: 'Switch the L2 disaggregation method from Current to Moving Average.'
    },
    slideRefs: '11, 12, 13, 14',
    rationale: 'For an exclusive item, Moving Average over recent actuals captures the real customer mix while Current Resultant fragments to inactive partners — switching the disaggregation method is the direct fix, no L3 enrichment needed.',
    section: 'Baseline Training'
  },
  {
    id: 6,
    text: 'Which statement correctly describes the difference between a Set and a Base Trend enrichment?',
    options: {
      A: 'A Set is positive only; a Base Trend can be positive or negative.',
      B: 'A Set cleanses out of history after the period passes; a Base Trend enters the baseline permanently.',
      C: 'A Set is owned by Sales; a Base Trend is owned by Demand Planning.',
      D: 'A Set applies to NPI items only; a Base Trend applies to carry-forward items only.'
    },
    slideRefs: '24',
    rationale: 'Sets are for one-time events because they cleanse out of history after they ship; Base Trend is for structural changes that should repeat because it permanently enters the baseline.',
    section: 'Set vs Base Trend'
  },
  {
    id: 7,
    text: 'A customer pulls confirmed annual demand into a specific order window (ladder), with offsetting reductions in the months from which demand is being moved. The full-year total does not change. Which enrichment approach is correct?',
    options: {
      A: 'Positive base trend in the ladder month + negative base trend in the pulled-from months.',
      B: 'Positive set in the ladder month + negative sets in the pulled-from months.',
      C: 'Single positive base trend in the ladder month — the negative offset is not needed.',
      D: 'No enrichment — let the baseline absorb the timing shift over the next cycle.'
    },
    slideRefs: '32',
    rationale: 'A ladder is a timing move, not incremental demand — sets are the right tool because they cleanse out of history, while base trend would permanently distort next year\'s baseline with the same timing shift.',
    section: 'Set vs Base Trend'
  },
  {
    id: 8,
    text: 'A customer is adding new stores to its distribution. The initial pipeline fill ships in one window (F1), and ongoing replenishment continues in those new stores afterwards. Which enrichment approach is correct?',
    options: {
      A: 'Single base trend from F1 onward — covers both the fill and ongoing replenishment.',
      B: 'Single set in F1 — covers the fill; the model will pick up the new run-rate from actuals.',
      C: 'Set in F1 for the new-store fill + base trend from F2 onward for ongoing replenishment.',
      D: 'Two sets — one in F1 for the fill, one in F2 onward for replenishment.'
    },
    slideRefs: '29',
    rationale: 'The new-store fill is one-time (Set, cleanses out) and the higher run-rate is structural (Base Trend, enters baseline) — using a single enrichment type for both would either contaminate next year\'s baseline or leave the ongoing lift uncaptured.',
    section: 'Set vs Base Trend'
  },
  {
    id: 9,
    text: 'An established carry-forward item has a future confirmed retail promotion that is not already reflected in baseline behavior. The promo will generate incremental units in a specific ship window. Which enrichment is correct?',
    options: {
      A: 'Promo enrichment for the confirmed incremental units in the relevant ship week(s).',
      B: 'Positive base trend for the promo lift, to persist into future cycles.',
      C: 'Set enrichment for the entire month containing the promo.',
      D: 'No enrichment — the baseline will capture the lift once actuals come in.'
    },
    slideRefs: '26',
    rationale: 'A confirmed, incremental, time-bounded promo is exactly what the promo enrichment type was built for — base trend would inflate next year\'s baseline, and a set would over-capture by extending beyond the promo window.',
    section: 'Enrichment Types'
  },
  {
    id: 10,
    text: 'A customer has provided a specific pre-order quantity and timing for a new item with no comparable history. What is the correct way to capture it?',
    options: {
      A: 'Pre-order enrichment for the confirmed quantity and timing only.',
      B: 'Pre-order enrichment for the confirmed quantity, plus an additional run-rate estimate for the rest of the year.',
      C: 'Set enrichment for the pre-order, then convert to base trend once actuals start coming in.',
      D: 'No enrichment — the NPI baseline will absorb the pre-order.'
    },
    slideRefs: '37',
    rationale: 'Pre-orders are entered at confirmed quantity only — adding speculative volume beyond the commitment undermines the rationale for using the enrichment type in the first place.',
    section: 'Enrichment Types'
  },
  {
    id: 11,
    text: "An NPI's stat baseline already includes the channel-fill volume in its launch shape, but the team needs the fill visible as a discrete set for allocation traceability. What is the correct approach in F1?",
    options: {
      A: 'Add a positive set for the channel-fill on top of the existing baseline.',
      B: 'Apply a positive base trend in F1 to make the channel-fill visible.',
      C: 'Submit a disaggregation request to split the channel-fill into a separate baseline component.',
      D: 'Two offsetting sets in F1 — negative to remove the embedded fill, positive of equal magnitude to restore it visibly.'
    },
    slideRefs: '31',
    rationale: 'The channel-fill is already in the NPI baseline, so a single positive set would double-count — two offsetting sets keep the total unchanged while making the fill visible for allocation, and both cleanse out after launch.',
    section: 'Enrichment Types'
  },
  {
    id: 12,
    text: 'Last year a deal spike inflated demand for a specific period, and the promotion is not repeating this year. The baseline is now projecting the spike forward as if it were normal seasonality. What is the correct action?',
    options: {
      A: 'Apply a positive promo enrichment to confirm the new run-rate.',
      B: 'Submit a disaggregation adjustment to redistribute the spike across customers.',
      C: 'Apply a negative base trend to remove the phantom spike from the projection.',
      D: 'Let the baseline run — actuals will pull it back to normal within two cycles.'
    },
    slideRefs: '39',
    rationale: 'A non-repeating historical spike that the model is echoing forward needs to be removed structurally — negative base trend corrects it now, and flagging the period for historical cleansing prevents the same correction from being needed next cycle.',
    section: 'Base Trend Corrections'
  },
  {
    id: 13,
    text: 'A specific customer has discontinued an item that remains active at other customers. The baseline is still allocating volume to the dropped customer based on past proportions. What is the correct action?',
    options: {
      A: 'Apply a negative base trend and update the forecasting range to stop allocating to that customer.',
      B: 'Wait — the model will reduce the customer\'s share once actuals show zero.',
      C: 'Submit a disaggregation request to remove the customer from the L2 split.',
      D: 'Apply a one-time negative set for the year, then let the baseline rebuild.'
    },
    slideRefs: '44',
    rationale: 'A customer exit is a structural change — base trend removes the phantom volume while the forecasting-range update prevents the model from continuing to route demand to a customer that no longer takes the item.',
    section: 'Base Trend Corrections'
  },
  {
    id: 14,
    text: 'A customer is changing its buying route from Domestic to Direct Import. Total demand is unchanged — only the channel is moving. The volume in scope currently sits in the baseline. What is the correct approach?',
    options: {
      A: 'Create a positive enrichment on DI and an offsetting negative enrichment on DOM.',
      B: 'Submit a disaggregation request to reroute the volume between channels.',
      C: 'Apply a base trend on DI to grow the channel; let DOM decay through actuals.',
      D: 'Use the channel-shift functionality on the baseline to move volume from DOM to DI.'
    },
    slideRefs: '51',
    rationale: 'Channel shift is a routing change, not new demand — the channel-shift functionality moves baseline volume cleanly between channels, while creating offsetting enrichments would distort total demand.',
    section: 'No-Enrichment Paths'
  },
  {
    id: 15,
    text: 'At the BU/brand level the L3 total is accurate against history, but the L2 customer split allocates too much volume to a customer with declining actuals. What is the correct path?',
    options: {
      A: 'Apply a negative enrichment on the over-allocated customer to bring the split back in line.',
      B: 'Submit a disaggregation adjustment request to DP/Genpact; do not enter an enrichment.',
      C: 'Apply offsetting enrichments — negative on the over-allocated customer, positive on the under-allocated one.',
      D: 'Switch the L2 disaggregation method from Moving Average back to Current Resultant.'
    },
    slideRefs: '54',
    rationale: 'When L3 is right, no enrichment is needed — enriching at L1 to fix an L2 split would inflate L3 total demand, so the correct path is a disaggregation adjustment routed through DP/Genpact.',
    section: 'No-Enrichment Paths'
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

// ── State ──────────────────────────────────────────────────────────────────────
let state = {
  screen: 'welcome',
  questionIndex: 0,
  userData: { name: '', email: '', role: '', roleOther: '' },
  answers: {},
  results: null,
  submitError: null
};

// ── Persistence ────────────────────────────────────────────────────────────────
function saveState() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (_) {}
}
function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved && saved.screen !== 'results' && saved.screen !== 'welcome') return saved;
    }
  } catch (_) {}
  return null;
}
function clearState() {
  try { localStorage.removeItem(LS_KEY); } catch (_) {}
}

// ── DOM helpers ────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const show = el => el && el.classList.remove('hidden');
const hide = el => el && el.classList.add('hidden');

function setScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = $(`screen-${name}`);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Navigation ─────────────────────────────────────────────────────────────────
function goWelcome() { state.screen = 'welcome'; setScreen('welcome'); }
function goIdentity() { state.screen = 'identity'; setScreen('identity'); saveState(); }
function goQuestion(index) {
  state.questionIndex = index;
  state.screen = 'question';
  renderQuestion(index);
  setScreen('question');
  saveState();
}
function goConfirm() { state.screen = 'confirm'; renderConfirm(); setScreen('confirm'); saveState(); }
function goResults(results) {
  state.screen = 'results';
  state.results = results;
  renderResults(results);
  setScreen('results');
  clearState();
}

// ── Welcome ────────────────────────────────────────────────────────────────────
function initWelcome() {
  $('btn-start').addEventListener('click', () => goIdentity());
}

// ── Identity ───────────────────────────────────────────────────────────────────
function initIdentity() {
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
  if (role === 'Other') { show(wrap); } else { hide(wrap); state.userData.roleOther = ''; }
}

function submitIdentity() {
  let valid = true;
  const nameEl = $('input-name'), emailEl = $('input-email');
  const nameErr = $('err-name'), emailErr = $('err-email'), roleErr = $('err-role');

  if (!nameEl.value.trim()) { nameEl.classList.add('error'); nameErr.classList.add('visible'); valid = false; }
  else { nameEl.classList.remove('error'); nameErr.classList.remove('visible'); }

  const emailVal = emailEl.value.trim();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
  if (!emailOk) { emailEl.classList.add('error'); emailErr.classList.add('visible'); valid = false; }
  else { emailEl.classList.remove('error'); emailErr.classList.remove('visible'); }

  if (!state.userData.role) { roleErr.classList.add('visible'); valid = false; }
  else { roleErr.classList.remove('visible'); }

  if (!valid) return;
  state.userData.name  = nameEl.value.trim();
  state.userData.email = emailVal;
  if (state.userData.role === 'Other') {
    state.userData.roleOther = ($('input-role-other').value || '').trim();
  }
  goQuestion(0);
}

// ── Question ───────────────────────────────────────────────────────────────────
function renderQuestion(index) {
  const q   = QUESTIONS[index];
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
  index === 0 ? hide($('btn-back')) : show($('btn-back'));
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
  const q       = QUESTIONS[index];
  const hasAns  = !!state.answers[`Q${q.id}`];
  const nextBtn = $('btn-next');
  nextBtn.disabled = !hasAns;
  nextBtn.textContent = index === TOTAL_QUESTIONS - 1 ? 'Review & Submit' : 'Next →';
}

function initQuestion() {
  $('btn-next').addEventListener('click', () => {
    if (state.questionIndex < TOTAL_QUESTIONS - 1) goQuestion(state.questionIndex + 1);
    else goConfirm();
  });
  $('btn-back').addEventListener('click', () => {
    if (state.questionIndex > 0) goQuestion(state.questionIndex - 1);
    else goIdentity();
  });
}

// ── Confirm ────────────────────────────────────────────────────────────────────
function renderConfirm() {
  const answered = Object.keys(state.answers).length;
  $('confirm-answered').textContent = `${answered} of ${TOTAL_QUESTIONS} questions answered`;
  $('confirm-name').textContent = state.userData.name;
}
function initConfirm() {
  $('btn-submit').addEventListener('click', submitQuiz);
  $('btn-go-back').addEventListener('click', () => goQuestion(TOTAL_QUESTIONS - 1));
}

// ── Submit ─────────────────────────────────────────────────────────────────────
async function submitQuiz() {
  const payload = {
    name:      state.userData.name,
    email:     state.userData.email,
    role:      state.userData.role,
    roleOther: state.userData.roleOther,
    answers:   state.answers,
    module:    'mod2',
    userAgent: navigator.userAgent,
    quizUrl:   window.location.href
  };

  const submitBtn = $('btn-submit');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Submitting…';
  hide($('submit-error'));

  const result = scoreAnswers(state.answers);

  fetch(APPS_SCRIPT_URL, {
    method:  'POST',
    mode:    'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body:    JSON.stringify(payload)
  }).catch(() => {});

  goResults(result);
}

// ── Results ────────────────────────────────────────────────────────────────────
function renderResults(data) {
  const { score, total, percent, pass, failed_questions } = data;
  const pctDisplay = Math.round(percent);

  $('result-score').textContent = `${score} / ${total}`;
  $('result-score').className   = `score-number ${pass ? 'pass' : 'fail'}`;
  $('result-pct').textContent   = `${pctDisplay}%`;

  const badge = $('result-badge');
  badge.textContent = pass ? 'PASSED ✓' : 'BELOW THRESHOLD';
  badge.className   = `pass-badge ${pass ? 'pass' : 'fail'}`;

  $('result-message').textContent = pass
    ? 'Great work — you\'ve met the 80% threshold. Check your email for your confirmation.'
    : 'You\'re below the 80% threshold. Review the topics below and retake when ready.';

  const missedSection = $('missed-section');
  const missedTitle   = $('missed-title');

  if (failed_questions && failed_questions.length > 0) {
    missedSection.classList.remove('hidden');
    missedTitle.textContent = 'Questions to Review to Better Your Understanding';

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
        <div class="slide-ref">📖 Review slide${q.slideRefs.includes(',') ? 's' : ''} ${escHtml(q.slideRefs)} in the MOD 2 facilitator deck</div>
        <div class="slide-ref" style="color:var(--gray-muted);font-style:italic;margin-top:4px;">${escHtml(q.rationale)}</div>
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
  $('input-name').value = '';
  $('input-email').value = '';
  $('input-role-other').value = '';
  document.querySelectorAll('.role-option').forEach(l => l.classList.remove('selected'));
  hide($('other-text-wrap'));
  goWelcome();
}

// ── Resume ─────────────────────────────────────────────────────────────────────
function checkResume(saved) {
  if (!saved) return false;
  const banner = $('resume-banner');
  if (!banner) return false;
  banner.classList.remove('hidden');
  $('btn-resume').addEventListener('click', () => {
    state = saved;
    banner.classList.add('hidden');
    if (state.screen === 'question')   goQuestion(state.questionIndex);
    else if (state.screen === 'confirm') goConfirm();
    else if (state.screen === 'identity') { goIdentity(); restoreIdentityFields(); }
  });
  $('btn-discard').addEventListener('click', () => { clearState(); banner.classList.add('hidden'); });
  return true;
}

function restoreIdentityFields() {
  if (state.userData.name)  $('input-name').value  = state.userData.name;
  if (state.userData.email) $('input-email').value = state.userData.email;
  if (state.userData.role) {
    document.querySelectorAll('.role-option').forEach(label => {
      const input = label.querySelector('input');
      if (input && input.value === state.userData.role) selectRole(state.userData.role, label);
    });
  }
  if (state.userData.roleOther) $('input-role-other').value = state.userData.roleOther;
}

// ── Util ───────────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Boot ───────────────────────────────────────────────────────────────────────
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

const DASH_HASH   = '3112727bdedc9e678230b70a47eb12222f8e6da33f24a9c5539f50cf4c84359c';
const DASH_LS_KEY = 'mod1_dash_unlocked'; // shared session key — same password
const DASH_EXPIRY = 8 * 60 * 60 * 1000;

let dashAllRows     = [];
let dashRows        = [];
let dashFiltered    = [];
let dashModule      = '';
let dashLastUpdated = null;

function initDashboard() {
  $('btn-open-dashboard').addEventListener('click', () => { setScreen('dashboard'); checkDashAuth(); });
  $('btn-open-dashboard-welcome').addEventListener('click', () => { setScreen('dashboard'); checkDashAuth(); });
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
  const pwd  = $('dash-pwd-input').value;
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
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function showDashContent() {
  hide($('dash-gate'));
  show($('dash-content'));

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
  const select  = $('dash-role-filter');
  const current = select.value;
  const rolesInData = [...new Set(dashRows.map(r => r.role).filter(Boolean))];
  const allRoles = ROLES.filter(r => r !== 'Other').concat(rolesInData.filter(r => !ROLES.includes(r)));
  select.innerHTML = '<option value="">All roles</option>' +
    allRoles.map(r => `<option value="${escHtml(r)}" ${r === current ? 'selected' : ''}>${escHtml(r)}</option>`).join('');
}

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
  $('dash-date-from').value   = '';
  $('dash-date-to').value     = '';
  $('dash-role-filter').value = '';
  dashFiltered = dashRows;
  $('dash-filter-label').textContent = '';
  renderDash();
}

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

function renderKPIs() {
  const rows     = dashFiltered;
  const total    = rows.length;
  const passes   = rows.filter(r => r.status === 'Pass').length;
  const fails    = total - passes;
  const avgPct   = total ? Math.round(rows.reduce((s, r) => s + (r.percent || 0), 0) / total) : 0;
  const passRate = total ? Math.round((passes / total) * 100) : 0;

  const kpis = [
    { val: total,          label: 'Submissions', color: 'var(--white)' },
    { val: passes,         label: 'Passed',       color: 'var(--teal)' },
    { val: fails,          label: 'Need retry',   color: 'var(--coral)' },
    { val: avgPct + '%',   label: 'Avg score',    color: 'var(--yellow)' },
    { val: passRate + '%', label: 'Pass rate',    color: 'var(--teal)' },
  ];

  $('dash-kpis').innerHTML = kpis.map(k =>
    `<div class="kpi-card" style="padding:14px 8px;">
      <div class="kpi-val" style="color:${k.color};font-size:26px;">${k.val}</div>
      <div class="kpi-label">${k.label}</div>
    </div>`
  ).join('');
}

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
  let start = -Math.PI / 2;
  [{ val: passes, color: '#14B8A6' }, { val: fails, color: '#F87171' }].forEach(s => {
    const angle = (s.val / total) * 2 * Math.PI;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outer, start, start + angle);
    ctx.closePath(); ctx.fillStyle = s.color; ctx.fill();
    start += angle;
  });

  ctx.beginPath(); ctx.arc(cx, cy, inner, 0, 2 * Math.PI);
  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--navy-mid').trim() || '#1E2A4A';
  ctx.fill();

  ctx.fillStyle = '#fff'; ctx.font = 'bold 22px Calibri, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(rows.length, cx, cy - 8);
  ctx.font = '11px Calibri, sans-serif'; ctx.fillStyle = '#94A3B8';
  ctx.fillText('total', cx, cy + 12);

  $('chart-donut-legend').innerHTML =
    `<span style="color:#14B8A6;">● Pass ${passes}</span>
     <span style="color:#F87171;">● Fail ${fails}</span>`;
}

function renderHistogram() {
  const canvas = $('chart-hist');
  const ctx    = canvas.getContext('2d');
  const rows   = dashFiltered;

  // Buckets for 15-question quiz (pass threshold = 12)
  const buckets = [
    { label: '0-4',   min: 0,  max: 4  },
    { label: '5-8',   min: 5,  max: 8  },
    { label: '9-10',  min: 9,  max: 10 },
    { label: '11',    min: 11, max: 11 },
    { label: '12-13', min: 12, max: 13 },
    { label: '14-15', min: 14, max: 15 },
  ];
  buckets.forEach(b => { b.count = rows.filter(r => r.score >= b.min && r.score <= b.max).length; });

  const maxCount = Math.max(...buckets.map(b => b.count), 1);
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const padL = 24, padR = 8, padT = 10, padB = 32;
  const chartW = W - padL - padR, chartH = H - padT - padB;
  const barW = chartW / buckets.length, gap = 6;

  buckets.forEach((b, i) => {
    const bh = (b.count / maxCount) * chartH;
    const x  = padL + i * barW + gap / 2;
    const y  = padT + chartH - bh;
    const isPass = b.min >= 12; // pass threshold = 12

    ctx.fillStyle = isPass ? '#14B8A6' : '#2D3E6F';
    ctx.beginPath();
    ctx.roundRect(x, y, barW - gap, bh, [4, 4, 0, 0]);
    ctx.fill();

    if (b.count > 0) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Calibri, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.count, x + (barW - gap) / 2, y - 4);
    }

    ctx.fillStyle = '#94A3B8'; ctx.font = '10px Calibri, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(b.label, x + (barW - gap) / 2, H - padB + 14);
  });

  // Pass threshold line at bucket index 4 (12-13 starts)
  ctx.strokeStyle = '#FFC72C'; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padL + 4 * barW, padT);
  ctx.lineTo(padL + 4 * barW, padT + chartH);
  ctx.stroke();
  ctx.setLineDash([]);
}

function renderHeatmap() {
  const rows  = dashFiltered;
  const total = rows.length || 1;

  const failCount = {};
  for (let i = 1; i <= TOTAL_QUESTIONS; i++) failCount[i] = 0;

  rows.forEach(r => {
    if (!r.failed) return;
    String(r.failed).split(',').forEach(s => {
      const n = parseInt(s.trim());
      if (n >= 1 && n <= TOTAL_QUESTIONS) failCount[n]++;
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
      <div class="lc-row">Score: <span>${r.score}/${TOTAL_QUESTIONS} (${Math.round(r.percent)}%)</span></div>
      <div class="lc-row">Status: <span style="color:${statusColor};font-weight:700;">${r.status}</span></div>
      <div class="lc-row">Submitted: <span>${date}</span></div>
      ${r.failed ? `<div class="lc-row">Failed Qs: <span style="color:var(--coral);">${escHtml(r.failed)}</span></div>` : ''}
    </div>`;
  }).join('');
}

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
          <th>Date</th><th>Name</th><th>Email</th><th>Role</th>
          <th>Score</th><th>%</th><th>Status</th>
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
            <td style="font-weight:700;">${r.score}/${TOTAL_QUESTIONS}</td>
            <td>${Math.round(r.percent)}%</td>
            <td class="${statusClass}">${r.status}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

// ── Module filter helpers ──────────────────────────────────────────────────────
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

function refreshDash() { showDashContent(); }

// ── Pass rate by role — any attempt ───────────────────────────────────────────
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

// ── Pass rate by role — first attempt ─────────────────────────────────────────
function renderFirstAttemptPassRate(rows) {
  const el = $('dash-role-first');
  if (!el) return;
  if (!rows.length) { el.innerHTML = '<p class="muted" style="font-size:13px;">No data yet.</p>'; return; }

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

// ── Attempts to pass ───────────────────────────────────────────────────────────
function renderAttemptsToPAss(rows) {
  const canvas = $('chart-attempts');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

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
    if (firstPass === -1) notYetPassed++;
    else passers.push(firstPass + 1);
  });

  const buckets = [
    { label: '1',  min: 1, max: 1 },
    { label: '2',  min: 2, max: 2 },
    { label: '3',  min: 3, max: 3 },
    { label: '4+', min: 4, max: Infinity }
  ];
  buckets.forEach(b => { b.count = passers.filter(n => n >= b.min && n <= b.max).length; });

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
  const chartW = W - padL - padR, chartH = H - padT - padB;
  const maxCount = Math.max(...buckets.map(b => b.count), 1);
  const barW = chartW / buckets.length, gap = 10;

  buckets.forEach((b, i) => {
    const pct = Math.round((b.count / total) * 100);
    const bh  = (b.count / maxCount) * chartH;
    const x   = padL + i * barW + gap / 2;
    const y   = padT + chartH - bh;

    ctx.fillStyle = '#14B8A6';
    ctx.beginPath(); ctx.roundRect(x, y, barW - gap, Math.max(bh, 1), [4, 4, 0, 0]); ctx.fill();

    if (b.count > 0) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Calibri, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${pct}% (${b.count})`, x + (barW - gap) / 2, y - 4);
    }

    ctx.fillStyle = '#94A3B8'; ctx.font = '11px Calibri, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(b.label, x + (barW - gap) / 2, H - padB + 14);
  });

  ctx.fillStyle = '#94A3B8'; ctx.font = '10px Calibri, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Attempts to pass', W / 2, H - 2);
}

// ── Question drill-down modal ──────────────────────────────────────────────────
function showDrillDown(qNum) {
  const q = QUESTIONS.find(x => x.id === qNum);
  if (!q) return;

  const correctLetter = ANSWER_KEY['Q' + qNum];
  const rows = dashFiltered;

  const picks = { A: 0, B: 0, C: 0, D: 0 };
  let totalResponses = 0, hasAnswerData = false;

  rows.forEach(r => {
    if (!r.answers) return;
    const given = (r.answers['Q' + qNum] || '').toUpperCase();
    if (!['A', 'B', 'C', 'D'].includes(given)) return;
    picks[given]++; totalResponses++; hasAnswerData = true;
  });

  const failCount = totalResponses - (picks[correctLetter] || 0);
  const failPct   = totalResponses ? Math.round((failCount / totalResponses) * 100) : 0;

  const optionsHTML = ['A', 'B', 'C', 'D'].map(letter => {
    const isCorrect = letter === correctLetter;
    const count     = picks[letter] || 0;
    const pct       = totalResponses ? Math.round((count / totalResponses) * 100) : 0;
    const cls       = isCorrect ? 'correct' : (count > 0 ? 'wrong-picked' : 'not-picked');
    let statHTML = '';
    if (hasAnswerData) {
      statHTML = isCorrect
        ? `<div class="drill-option-stat">✓ Correct — ${count} selected (${pct}%)</div>`
        : `<div class="drill-option-stat">${count} selected (${pct}%)</div>`;
    } else if (isCorrect) {
      statHTML = `<div class="drill-option-stat">✓ Correct answer</div>`;
    }
    return `<div class="drill-option ${cls}">
      <span class="drill-option-letter">${letter}</span>
      <div class="drill-option-text">
        <div>${escHtml(q.options[letter])}</div>
        ${statHTML}
      </div>
    </div>`;
  }).join('');

  const noDataNote = !hasAnswerData
    ? '<p class="muted" style="font-size:12px;margin-bottom:12px;">Breakdown por opción requiere redesplegar Apps Script — los nuevos submissions lo poblarán automáticamente.</p>'
    : '';

  const displayTotal = totalResponses || rows.length;
  $('drill-content').innerHTML = `
    <div class="drill-q-num">Question ${qNum} · ${escHtml(q.section)}</div>
    <div class="drill-q-text">${escHtml(q.text)}</div>
    <div class="drill-fail-rate">${failPct}% failure rate (${failCount} of ${displayTotal} submission${displayTotal !== 1 ? 's' : ''})</div>
    ${noDataNote}
    ${optionsHTML}
    <div class="drill-slide-ref">📖 Slide${q.slideRefs.includes(',') ? 's' : ''} ${escHtml(q.slideRefs)}</div>
  `;

  $('drill-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeDrillDown(event) {
  if (event && event.target !== $('drill-modal')) return;
  $('drill-modal').classList.add('hidden');
  document.body.style.overflow = '';
}
