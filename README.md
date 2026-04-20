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

1. Each participant enters their name on the welcome screen.
2. For each of 10 questions they listen to blind samples **A** and **B**, then rate:
   - **Audio Quality** (−3 … +3) — overall perceptual quality.
   - **Prompt Following** (−3 … +3) — faithfulness to the MusicCaps prompt shown above the players.
3. After the last question, the **Results** page reveals the true identities (`p8` / `p9v1`) and shows weighted-score summaries per metric.
4. Participant clicks **Export JSON** — a file named like `pairwise_p8_vs_p9v1__Alice_Chen__2026-04-20-08-30-15.json` is downloaded. Hand this back to the coordinator.

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

## Dataset

Default: 10 MusicCaps clips × 2 variants (`p8` and `p9v1`), FLAC.
To swap the dataset: replace the files in `audio/`, update the question entries + `variants` in [`data.js`](data.js).

## Files

- `index.html` — App shell + Welcome screen + routing.
- `data.js` — Dataset, CMOS scale options, metrics definitions, icons.
- `runner.jsx` — Evaluate screen (audio transport, CMOS scales, ticker).
- `overview.jsx` — Overview grid + Results screen (per-metric cards + reveal table + JSON export).
- `styles.css` / `runner.css` / `overview.css` — styling.
- `audio/` — FLAC dataset.
