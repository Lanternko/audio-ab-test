https://lanternko.github.io/audio-ab-test/

# Audio A/B Test — Blind Listening Interface

A browser-based pairwise listening test for comparing two audio variants (currently `p7v1` vs `p8v1`) on MusicCaps prompts. The app is static HTML/CSS/JS (React + Babel via CDN). One submission = one round of **8** blind A/B comparisons sampled from a **24-clip** pool, with two 7-point CMOS metrics:

- **Audio Quality**
- **Prompt Following**

## What This Repo Supports

- Blind A/B playback with per-question ratings
- **English / 中文** interface toggle
- Autosave of the current round in `localStorage`
- Optional cloud submission to Google Sheets via Google Apps Script
- JSON backup / export from the Results page
- Per-participant seen-clip tracking so starting another round with the same name avoids repeats until the pool is exhausted

## Run Locally

The site is static HTML/CSS/JS. Audio files are served from `audio/`, so `file://` will not work — run a local HTTP server instead:

```bash
cd audio-ab-test
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

## Host on GitHub Pages

1. Push this repo to GitHub.
2. In **Settings → Pages**, set source = `main` branch / `/ (root)`.
3. Wait about 1 minute, then open `https://<your-username>.github.io/<repo-name>/`.

## Storage Model

This app uses a **local-first + optional cloud** storage flow.

During a round, the participant's progress is autosaved in the browser:

- `audio-ab-test-state-v4`: current in-progress round
- `audio-ab-test-seen-v4`: per-participant seen history used to avoid repeats across rounds

When the participant enters the **Results** page:

- If `window.SUBMIT_URL` is set, the app automatically `POST`s the submission payload to that endpoint.
- If `window.SUBMIT_URL` is an empty string, the app runs in **export-only** mode and downloads a JSON file instead of uploading.
- If an upload fails, the app automatically downloads a JSON backup and shows a **Retry upload** button. The current state is not discarded.

In other words, this repo can operate in either of these modes:

- **Cloud mode**: local autosave + Google Sheets submission + optional JSON backup
- **Export-only mode**: local autosave + downloaded JSON only

## Participant Workflow

1. The participant enters their name on the welcome screen.
   - The most recently used name is pre-filled from `localStorage` for convenience.
2. The app samples **8** clips from the **24-clip** pool and randomizes which true variant appears as **A** or **B** for each question.
3. For each question, the participant listens to blind samples **A** and **B**, then rates:
   - **Audio Quality**
   - **Prompt Following**
4. After all questions are answered, the participant clicks **View results** and confirms.
   - At that point the answers are locked.
   - The app then auto-uploads to `SUBMIT_URL` if configured, or auto-downloads a JSON file if not.
5. The **Results** page reveals the true identities (`p7v1` / `p8v1`) and shows:
   - weighted-score summaries per metric
   - per-question AQ / PF ratings
   - A/B identity mapping for each question
6. The participant can optionally click **Download backup JSON** from the Results page.
7. To start another round for the same participant, click the **×** next to the participant name and start again with the same name.
   - Previously seen clips for that name are excluded until the unseen pool is too small.
   - When the pool is exhausted, the seen set resets automatically and `poolResetThisRound: true` is logged in the submission payload.

## Cloud Submission Setup (Google Apps Script + Sheets)

Quick path from zero to live:

1. Create an empty Google Sheet. Copy the URL and note its **ID** — the long string between `/d/` and `/edit`.
2. In that sheet, open **Extensions → Apps Script**.
3. Replace the default `Code.gs` with [`server/apps-script.gs`](server/apps-script.gs), then set `SHEET_ID` to your sheet ID.
4. Save, then deploy:
   - **Deploy → New deployment → Web app**
   - **Execute as:** Me
   - **Who has access:** Anyone
5. Copy the deployed `/exec` URL.
6. In [`index.html`](index.html), set:

```html
window.SUBMIT_URL = "<your Apps Script /exec URL>";
```

7. Commit and push. GitHub Pages will rebuild, and each submission will append one row to the configured sheet.

### Notes

- The frontend sends submissions as `text/plain;charset=utf-8` on purpose. This avoids the CORS preflight problems that commonly affect Apps Script web apps with `application/json`.
- If you want to disable cloud upload, set `window.SUBMIT_URL = ""` and the app will fall back to export-only mode.

The Apps Script writes one row per submission with flattened per-question columns (`q1_aq`, `q1_pf`, ...) plus a `fullJSON` column for archival.

## Scale Convention

Positive CMOS = **A preferred**, negative = **B preferred**, `0` = tie.

| val | meaning |
|-----|---------|
| +3 | A much better |
| +2 | A better |
| +1 | A slightly better |
| 0 | About the same |
| -1 | B slightly better |
| -2 | B better |
| -3 | B much better |

Weighted score per variant sums the magnitude of votes in its favour. Ties contribute nothing. A/B side is randomized independently for each question; `aLabel` and `bLabel` in the payload reveal the true identity.

## Submission Payload

The exported / uploaded JSON includes:

- `schemaVersion`, `submissionId`
- `project`, `projectLabel`, `variants`
- `participant`
- `roundIndex`, `roundSize`, `poolSize`, `poolResetThisRound`
- `selection`
- `startedAt`, `completedAt`, `userAgent`
- `totalQuestions`, `answeredQuestions`, `metrics`, `scale`
- `log[]`: one entry per question with `questionId`, `clipId`, `prompt`, `aFile`, `bFile`, `aLabel`, `bLabel`, `audioQuality`, `promptFollowing`, `ratedAt`
- `summary`: per-metric aggregate `scores` and `dist`

Each submission is self-contained, so you can analyze it offline even without Google Sheets.

## Dataset (Pool)

Current dataset:

- **24 MusicCaps prompts**
- **2 variants per prompt**: `p7v1` and `p8v1`
- audio files stored as WAV under `audio/`
- each round samples **8** questions from the pool

The pool lives in [`data.js`](data.js) under `DATA.pool`. Each item looks like:

```js
{
  clipId: "mc01",
  title: "01",
  prompt: "...prompt text...",
  files: { p7v1: "mc01_p7v1.wav", p8v1: "mc01_p8v1.wav" },
}
```

To expand the pool:

1. Add the new WAV files to `audio/`.
2. Append new entries to `DATA.pool` in `data.js`.
3. Keep `DATA.variants` aligned with the filenames you provide.
4. Commit and push.

If you want to compare a different pair of systems, update `DATA.variants` to a new pair such as `["p8v1", "p9v1"]` and make sure every pool item has matching filenames.

## Files

- `index.html` — app shell, startup flow, localStorage bootstrapping, `SUBMIT_URL` config
- `data.js` — dataset, UI copy, CMOS labels, sampling helpers
- `runner.jsx` — evaluation screen with audio players and rating controls
- `overview.jsx` — overview / results screens, payload builder, upload/export logic
- `styles.css`, `runner.css`, `overview.css` — styling
- `audio/` — WAV dataset
- `server/apps-script.gs` — Google Apps Script receiver that writes submissions into Google Sheets
