# Tonewright — Audio A/B Blind Listening Test

A browser-based pairwise listening test for evaluating audio variants (e.g., two model versions). 10 MusicCaps clips, 7-point CMOS scale (−3 … +3), two metrics per clip: **Audio Quality** and **Prompt Following**.

## Run locally

The site is static HTML/CSS/JS (React + Babel via CDN). FLAC files are served from `audio/`. Because of browser security, `file://` won't work — run a local HTTP server:

```bash
cd AB-test
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

## Host on GitHub Pages

1. Push this repo to GitHub.
2. In **Settings → Pages**, set source = `main` branch / `/ (root)`.
3. Wait ~1 minute, then visit `https://<your-username>.github.io/<repo-name>/`.

## Workflow

1. Each participant enters their name on the welcome screen (the last-used name is pre-filled for convenience).
2. A **round** is a random sample of **`roundSize`** clips from **`pool`** (default: 8 from 8). For each clip they listen to blind samples **A** and **B**, then rate:
   - **Audio Quality** (−3 … +3) — overall perceptual quality.
   - **Prompt Following** (−3 … +3) — faithfulness to the prompt shown above the players.
3. After the last question, the **Results** page reveals the true identities (`p7v1` / `p8v1`) and shows weighted-score summaries per metric.
4. Participant clicks **Submit & start next round** — the full log POSTs to the cloud endpoint (Google Sheets via Apps Script); a **new round immediately starts with a different sample of clips**. They can keep going indefinitely.
   - Clips already seen by this participant are **excluded** from the next sample (tracked per-name in `localStorage`). When the unseen pool is smaller than `roundSize`, the seen set quietly resets so rounds never stall — `poolResetThisRound: true` is logged so you can filter in analysis.
   - If `SUBMIT_URL` is empty the Submit button falls back to "Export JSON & start next round" — a file is downloaded, the next round still starts.
   - If an upload fails, a JSON backup auto-downloads and the UI shows a **Retry upload** button. State isn't lost.
   - Click the **×** next to the name in the topbar to log out / switch participant.

## Cloud submission setup (Google Apps Script + Sheets)

Five-minute path from zero to live:

1. Create an empty Google Sheet. Copy the URL and note its **ID** — the long string between `/d/` and `/edit`.
2. In that sheet → **Extensions → Apps Script**. Delete the default `Code.gs` contents, paste [`server/apps-script.gs`](server/apps-script.gs), and set `SHEET_ID` to the ID from step 1.
3. Save, then **Deploy → New deployment → Web app**:
   - **Execute as:** Me (your Google account)
   - **Who has access:** Anyone
   - Click **Deploy**. Copy the `/exec` URL it gives you.
4. In [`index.html`](index.html), set `window.SUBMIT_URL = "<paste /exec URL here>"`.
5. `git commit && git push`. GitHub Pages rebuilds in ~1 minute and every subsequent submission lands as a new row in your sheet.

The Apps Script writes one row per submission with per-question ratings flattened into columns (`q1_aq`, `q1_pf`, …) plus a `fullJSON` column for archival. The header row is created automatically on the first submission.

## Scale convention

Positive CMOS = A preferred, negative = B preferred, 0 = tie.
For each answered question:

| val | meaning           |
|-----|-------------------|
| +3  | A much better     |
| +2  | A better          |
| +1  | A slightly better |
|  0  | About the same    |
| −1  | B slightly better |
| −2  | B better          |
| −3  | B much better     |

Weighted score per variant sums the magnitude of votes in its favour (ties contribute nothing). A/B side for each clip is randomised once; `aLabel` / `bLabel` in the JSON reveal the true identity.

## Log format

The exported JSON contains:

- `project`, `projectLabel`, `variants`, `scale`
- `participant`, `startedAt`, `completedAt`
- `log[]`: per-question entries with `questionId`, `clipId`, `prompt`, `aFile`, `bFile`, `aLabel`, `bLabel`, `audioQuality`, `promptFollowing`, `ratedAt`
- `summary`: per-metric aggregate `scores` + `dist` per variant

Every participant's JSON is fully self-contained for offline analysis.

## Dataset (pool)

Default: **8 fixed-prompt clips × 2 variants** (`p7v1` and `p8v1`), WAV (peak-normalised to −1 dBFS).

The **pool** sits in [`data.js`](data.js) under `DATA.pool`. Each entry:
```js
{
  clipId: "piano",
  title: "piano",
  prompt: "…exact string fed to infer.py during generation…",
  files: { p7v1: "piano_p7v1.wav", p8v1: "piano_p8v1.wav" },
}
```

To grow the pool (e.g. from 8 → 20 → 40):
1. Generate the new clips for both variants on the training server.
2. Drop the WAVs into `audio/` (filenames like `<clipId>_p7v1.wav` / `<clipId>_p8v1.wav`).
3. Append entries to `DATA.pool` with the exact prompt text.
4. Commit + push. `DATA.roundSize` (default 8) stays the same — larger pools just mean more rounds per participant before any repeat.

To change which two variants are compared, update `DATA.variants` (must be 2 strings, e.g. `["p8v1", "p9v1"]`).

## Files

- `index.html` — App shell, Welcome screen, routing, `SUBMIT_URL` config.
- `data.js` — Dataset, CMOS scale options, metrics definitions, icons.
- `runner.jsx` — Evaluate screen (audio transport, CMOS scales, ticker).
- `overview.jsx` — Overview grid + Results screen (per-metric cards + reveal table + cloud submit + JSON export).
- `styles.css` / `runner.css` / `overview.css` — styling.
- `audio/` — WAV dataset (peak-normalised to −1 dBFS).
- `server/apps-script.gs` — Google Apps Script `doPost` receiver (deploy to collect submissions into a Sheet).
