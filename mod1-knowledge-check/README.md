# MOD 1 Knowledge Check — Forecast Enrichment UK Pilot

Self-hosted knowledge-check quiz for the Forecast Enrichment Programme MOD 1 training (Baseline & Workflow Foundations).

## Architecture

```
[Participant browser]
        │
        │  Static HTML + CSS + JS
        ▼
[GitHub Pages — index.html]
        │
        │  HTTPS POST (JSON — answers only, no key)
        ▼
[Google Apps Script Web App]
        │  ├─ Scores submission (answer key is server-side only)
        │  ├─ Appends row to Google Sheet
        │  └─ Sends emails via Gmail
        ▼
[Google Sheet — "MOD 1 Quiz Responses"]
        │
        └─ Participant email + internal notification
```

## Features

- **16 multiple-choice questions** across 9 sections of MOD 1.
- **80% pass threshold** (≥ 13/16 correct).
- **Server-side scoring** — the answer key never leaves the Apps Script; participants cannot cheat by inspecting the source.
- **Persistent state** — answers saved to localStorage; if a participant refreshes mid-quiz, they're offered to resume.
- **Mobile-responsive** — dark navy/teal palette matches the MOD 1 facilitator deck; large touch targets.
- **Automatic emails** — pass/fail template to participant, plus internal notification to the trainer.
- **Google Sheets storage** — one row per submission with per-question answer and correctness columns.
- **No login required** — public URL, accessible to anyone with the link.

## File Structure

```
mod1-knowledge-check/
├── index.html          — Single-page quiz UI (welcome → identity → 16 questions → confirm → results)
├── style.css           — Dark navy/teal/yellow theme, mobile-first
├── quiz.js             — State machine, question bank (no answer key), localStorage persistence, fetch
├── backend/
│   └── apps-script.gs  — Google Apps Script: doPost, scoring, Sheet write, email send
├── SETUP.md            — Step-by-step setup guide for non-technical users
└── README.md           — This file
```

## Quick Start

See **SETUP.md** for full step-by-step instructions.

1. Create a Google Sheet named "MOD 1 Quiz Responses".
2. Open Extensions → Apps Script, paste `backend/apps-script.gs`, update `RENE_EMAIL`.
3. Deploy as Web App (Execute as: Me, Who has access: Anyone). Copy the URL.
4. In `quiz.js`, replace `APPS_SCRIPT_URL` with your deployed URL.
5. Push files to a public GitHub repo and enable GitHub Pages.
6. Share the Pages URL with participants.

## Score Sheet Structure

| Column | Contents |
|--------|----------|
| A | Timestamp |
| B | Full Name |
| C | Email |
| D | Role |
| E | Role (Other detail) |
| F | Score (0–16) |
| G | Score % |
| H | Pass / Fail |
| I–AJ | Q1–Q16: Answer submitted + Correct? |
| AK | Failed question numbers |
| AL | Email Sent? |
| AM | User-Agent |
| AN | **Module** (e.g. `mod1`, `mod2`) |
| AO | **Attempt Number** — count of prior submissions for this email + module, plus 1. Historic MOD 1 rows predate this field and default to 1 in the dashboard. |

## Dashboard Analytics

The results dashboard (password-gated, same page) includes:

- **KPIs** — submissions, pass count, retry count, avg score, pass rate
- **Pass/Fail donut** and **Score distribution histogram**
- **Question failure rate** — click any bar for a drill-down showing full question text, all four answer options with ✓ on the correct answer, and a breakdown of how wrong answers were distributed across the other choices
- **Pass rate by role** — overall (any attempt) and first-attempt-only, with a pinned Total bar
- **Attempts required to pass** — frequency chart showing how many attempts passers needed

### Module selector

The dashboard header includes a **Module** dropdown:
- **All modules** (default) — combined MOD 1 + MOD 2 data
- **MOD 1 — Baseline & Workflow**
- **MOD 2 — Enrichment Practice**

Selection re-renders all charts without a page reload. State persists in the URL as `?module=mod1` so filtered views are shareable.

### Data refresh

Click **↻ Refresh data** in the dashboard header to re-fetch the Sheet without leaving the page. A "Last updated: HH:MM" timestamp is shown next to the button.

## Maintenance

- **Close the quiz:** Set `QUIZ_CLOSED = true` in `apps-script.gs` and redeploy.
- **Update a question:** Edit `quiz.js` (question text/options) and `apps-script.gs` (`QUESTION_TEXT`, `ANSWER_KEY`, `SLIDE_REFS`) together.
- **Change pass threshold:** Update `PASS_THRESHOLD` in both `quiz.js` and `apps-script.gs`.
- **Add a new deployment:** Always create a "New version" in Apps Script deployment manager — redeploying to the same version does not apply code changes.
- **After any Apps Script change:** open the Apps Script editor → Deploy → Manage deployments → pencil icon on the active deployment → Version: "New version" → Deploy.

## License

MIT — see `LICENSE`.
