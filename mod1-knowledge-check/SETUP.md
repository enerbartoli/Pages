# MOD 1 Knowledge Check — Setup Guide

This guide walks through everything you need to do to get the quiz live. No coding required — just copy-paste and click.

---

## What you'll end up with

- A Google Sheet that captures every submission automatically.
- A backend (Google Apps Script) that scores answers, stores them, and sends emails.
- A public quiz URL (GitHub Pages) you share with participants.

**Time required:** ~30–45 minutes for a first-time setup.

---

## Part 1 — Google Sheet & Apps Script

### Step 1: Create the Google Sheet

1. Open [Google Drive](https://drive.google.com) — sign in with your **personal Gmail** (the one you'll use to send emails).
2. Click **New → Google Sheets**.
3. Click the title "Untitled spreadsheet" at the top and rename it to exactly:
   ```
   MOD 1 Quiz Responses
   ```
4. Leave the tab/sheet name as "Sheet1" for now — the script will rename it on first use.
5. **Copy the URL of this sheet** — you'll need it later for your records. It looks like:
   `https://docs.google.com/spreadsheets/d/XXXXXXXX/edit`

### Step 2: Open Apps Script

1. In the Sheet, click the menu: **Extensions → Apps Script**.
2. A new tab opens showing the Apps Script editor with some placeholder code.
3. **Select all** the existing code in the editor (Ctrl+A / Cmd+A) and **delete it**.
4. Open the file `backend/apps-script.gs` from this project folder.
5. **Copy the entire contents** and paste it into the Apps Script editor.

### Step 3: Update your email address

In the Apps Script editor, find this line near the top:

```javascript
const RENE_EMAIL = 'rene.bartoli@gmail.com';
```

Replace `rene.bartoli@gmail.com` with your actual Gmail address.

### Step 4: Save the script

Press **Ctrl+S** (or Cmd+S on Mac), or click the floppy-disk icon. Name the project something like `MOD1 Quiz Backend`.

### Step 5: Deploy as a Web App

1. Click the blue **Deploy** button (top right) → **New deployment**.
2. Click the gear icon next to "Select type" → choose **Web App**.
3. Fill in the settings:
   - **Description:** `MOD 1 Quiz v1`
   - **Execute as:** `Me` (your Google account)
   - **Who has access:** `Anyone`
4. Click **Deploy**.
5. Google will ask you to **authorize** the app — click through the prompts. You may see a "Google hasn't verified this app" warning — click **Advanced → Go to [project name] (unsafe)** — this is normal for your own scripts.
6. After authorization, you'll see a **Web App URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycbXXXXXXXXXXXXX/exec
   ```
   **Copy this URL.** You'll need it in the next part.

---

## Part 2 — Frontend (GitHub Pages)

### Step 6: Update the Apps Script URL in the quiz

1. Open the file `quiz.js` in a text editor (Notepad, TextEdit, VS Code, etc.).
2. Find this line near the top:
   ```javascript
   const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID_HERE/exec';
   ```
3. Replace `YOUR_DEPLOYMENT_ID_HERE/exec` with the full URL you copied in Step 5.
4. Save the file.

Also update `apps-script.gs` (for the retake link in fail emails):

```javascript
const QUIZ_URL = 'https://YOUR_GITHUB_USERNAME.github.io/mod1-knowledge-check/';
```

Replace `YOUR_GITHUB_USERNAME` with your GitHub username.

### Step 7: Create the GitHub repository

1. Go to [github.com](https://github.com) and sign in (or create a free account).
2. Click the **+** icon (top right) → **New repository**.
3. Settings:
   - **Repository name:** `mod1-knowledge-check`
   - **Visibility:** Public ← important for GitHub Pages
   - Leave "Initialize this repository with a README" **unchecked**
4. Click **Create repository**.

### Step 8: Upload the quiz files

On the new (empty) repository page:

1. Click **uploading an existing file** (or the "+" button → Upload files).
2. Drag and drop these files:
   - `index.html`
   - `style.css`
   - `quiz.js`
   - `README.md`
   - `SETUP.md`
   - `.gitignore`
3. Also create a folder called `backend` and upload `backend/apps-script.gs` inside it.
   - GitHub's upload UI: click "choose your files" → navigate to the `backend` folder → upload `apps-script.gs`. GitHub will create the folder automatically.
4. In the **Commit changes** box at the bottom, type a message like `Initial quiz upload`.
5. Click **Commit changes**.

### Step 9: Enable GitHub Pages

1. In your repository, click **Settings** (top navigation bar).
2. In the left sidebar, click **Pages**.
3. Under **Source**, select:
   - **Deploy from a branch**
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**.
5. Wait 2–3 minutes. Refresh the Pages settings page. You'll see:
   ```
   Your site is live at https://YOUR_GITHUB_USERNAME.github.io/mod1-knowledge-check/
   ```
6. **Copy this URL** — this is the link you share with participants.

---

## Part 3 — End-to-end test

### Step 10: Test the full flow

1. Open the GitHub Pages URL in your browser (ideally on your phone too).
2. Complete the quiz with a test name/email (use your own Gmail so you receive the test email).
3. Deliberately answer some questions wrong to test the fail path.
4. After submitting, check:
   - [ ] Results screen shows the correct score.
   - [ ] A new row appears in your Google Sheet (may take 5–10 seconds).
   - [ ] You receive the **participant email** (pass or fail template).
   - [ ] You receive the **internal notification email**.

If the submission fails, see the Troubleshooting section below.

---

## Part 4 — Share with participants

### Step 11: Distribute the quiz URL

Send participants the URL:
```
https://YOUR_GITHUB_USERNAME.github.io/mod1-knowledge-check/
```

Suggested message:
> "Following our MOD 1 session, please complete the knowledge check at the link below.
> It takes about 10 minutes and you need 80% to advance to MOD 2.
> You'll receive your score and a results email immediately after submitting."

---

## Maintenance

### Closing the quiz (optional)

To stop accepting new submissions after the pilot:

1. Open the Apps Script editor (Extensions → Apps Script in the Sheet).
2. Find the line: `const QUIZ_CLOSED = false;`
3. Change `false` to `true`.
4. Click **Deploy → Manage deployments → Edit** (pencil icon on the existing deployment).
5. Change the version to **New version** and click **Deploy**.

### Viewing results

Open your Google Sheet. The columns are:
- **A:** Timestamp
- **B:** Full Name
- **C:** Email
- **D:** Role
- **F:** Score (0–16)
- **G:** Score %
- **H:** Pass / Fail
- **I–AJ:** Per-question answer and correct? pairs
- **AK:** Failed question numbers

You can add a pivot table (Insert → Pivot table) to analyse pass rates by role or score distribution by question.

---

## Troubleshooting

### "Submission failed" error on the quiz

Most common causes:

1. **Apps Script URL not updated** — make sure `quiz.js` has the actual deployed URL, not `YOUR_DEPLOYMENT_ID_HERE`.
2. **Script not deployed as "Anyone"** — re-deploy with "Who has access: Anyone".
3. **Authorization expired** — open Apps Script → Run → `doPost` manually to re-authorize.

### No email received

- Check spam / junk folder.
- Check Apps Script execution logs: Apps Script editor → **Executions** (left sidebar).
- Verify `RENE_EMAIL` is your correct Gmail address.

### Sheet not found

The script creates the sheet automatically on first run. If you see a sheet-not-found error, make sure you opened Apps Script from inside the correct Google Sheet (Extensions → Apps Script — not from a standalone script).

### Google "unsafe app" warning during authorization

This is normal. Click **Advanced → Go to [project name]**. Your own scripts always show this warning until they're verified by Google (verification is for apps published to others — not needed here).
