// Shared data + helpers for Tonewright A/B listening test
// Pool-based: each round samples roundSize clips from DATA.pool.
// One participant can do many rounds; per-participant "seen" tracking in
// localStorage keeps successive rounds from overlapping until the pool is
// exhausted (at which point it silently resets so they can keep going).

const POOL = [
  {
    clipId: "piano",
    title: "piano",
    prompt: "This is a piano cover of a glam metal music piece. The piece is being played gently on a keyboard with a grand piano sound. There is a calming, relaxing atmosphere in this piece.",
    files: { p7v1: "piano_p7v1.wav", p8v1: "piano_p8v1.wav" },
  },
  {
    clipId: "metal",
    title: "metal",
    prompt: "This is the recording of a heavy metal music piece. There is a male vocalist singing melodically in the lead. The main tune is being played by the distorted electric guitar while the bass guitar is playing in the background. The rhythmic background consists of a simple acoustic drum beat. The atmosphere is aggressive.",
    files: { p7v1: "metal_p7v1.wav", p8v1: "metal_p8v1.wav" },
  },
  {
    clipId: "lofi",
    title: "lofi",
    prompt: "The low quality recording features a live performance of a folk song that consists of an arpeggiated electric guitar melody played over groovy bass, punchy snare and shimmering cymbals. It sounds energetic and the recording is noisy and in mono.",
    files: { p7v1: "lofi_p7v1.wav", p8v1: "lofi_p8v1.wav" },
  },
  {
    clipId: "edm",
    title: "edm",
    prompt: "This is an electronic dance music piece. There is a synth lead playing the main melody. The beat consists of a kick drum, clap, hi-hat and synthesized bass. The atmosphere is energetic and euphoric.",
    files: { p7v1: "edm_p7v1.wav", p8v1: "edm_p8v1.wav" },
  },
  {
    clipId: "cinematic",
    title: "cinematic",
    prompt: "This is a cinematic orchestral piece. There are strings playing a sweeping melody with brass accents. The piece builds in intensity with a dramatic crescendo. The atmosphere is epic and emotional.",
    files: { p7v1: "cinematic_p7v1.wav", p8v1: "cinematic_p8v1.wav" },
  },
  {
    clipId: "acoustic",
    title: "acoustic",
    prompt: "A solo acoustic guitar piece with fingerpicking. Gentle and melancholic.",
    files: { p7v1: "acoustic_p7v1.wav", p8v1: "acoustic_p8v1.wav" },
  },
  {
    clipId: "jazz",
    title: "jazz",
    prompt: "A smooth jazz piece with a saxophone lead, upright bass, and brushed drums. Studio quality recording with warm tones.",
    files: { p7v1: "jazz_p7v1.wav", p8v1: "jazz_p8v1.wav" },
  },
  {
    clipId: "ambient",
    title: "ambient",
    prompt: "A dark ambient soundscape with drone pads, distant reverb, and subtle noise. Lo-fi texture with tape saturation.",
    files: { p7v1: "ambient_p7v1.wav", p8v1: "ambient_p8v1.wav" },
  },
];

const DATA = {
  project: "subjective_p7v1_vs_p8v1",
  projectLabel: "Subjective · P7v1 vs P8v1",
  variants: ["p7v1", "p8v1"],
  roundSize: 8,
  pool: POOL,
};

// Sample k distinct pool indices, preferring clips not yet seen by this
// participant. If the unseen pool is smaller than k, quietly reset and
// sample from the full pool — caller can look at `poolReset` in the
// result if it wants to log this.
function sampleRoundIndices(pool, roundSize, excludeClipIds) {
  const exclude = new Set(excludeClipIds || []);
  const unseenIndices = pool
    .map((_, i) => i)
    .filter(i => !exclude.has(pool[i].clipId));
  const k = Math.min(roundSize, pool.length);
  let source;
  let poolReset = false;
  if (unseenIndices.length >= k) {
    source = unseenIndices.slice();
  } else {
    poolReset = true;
    source = pool.map((_, i) => i);
  }
  // Fisher-Yates
  for (let i = source.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [source[i], source[j]] = [source[j], source[i]];
  }
  return { indices: source.slice(0, k), poolReset };
}

function makeAbMap(size) {
  return Array.from({ length: size }, () => Math.random() < 0.5);
}

// Build a runtime "question" object from a pool item + A/B flip decision.
// `aIsV1` true → A is variants[0] (left / pink), B is variants[1] (right / lavender).
function buildQuestion(poolItem, posInRound, aIsV1, variants) {
  const [v1, v2] = variants;
  const f = poolItem.files;
  return {
    id: posInRound,
    title: poolItem.title,
    clipId: poolItem.clipId,
    desc: poolItem.prompt,
    aFile: `audio/${aIsV1 ? f[v1] : f[v2]}`,
    bFile: `audio/${aIsV1 ? f[v2] : f[v1]}`,
    aFileName: aIsV1 ? f[v1] : f[v2],
    bFileName: aIsV1 ? f[v2] : f[v1],
    aLabel: aIsV1 ? v1 : v2,
    bLabel: aIsV1 ? v2 : v1,
  };
}

const METRICS = [
  { key: "audioQuality",    label: "Audio Quality",    hint: "Overall perceptual quality: artefacts, clarity, fidelity." },
  { key: "promptFollowing", label: "Prompt Following", hint: "How faithfully the clip matches the written prompt above." },
];

// 7-point CMOS scale. Positive = A preferred, negative = B preferred, 0 = tie.
const CMOS_OPTIONS = [
  { val:  3, side: "A",   label: "A much better" },
  { val:  2, side: "A",   label: "A better" },
  { val:  1, side: "A",   label: "A slightly better" },
  { val:  0, side: "tie", label: "About the same" },
  { val: -1, side: "B",   label: "B slightly better" },
  { val: -2, side: "B",   label: "B better" },
  { val: -3, side: "B",   label: "B much better" },
];

// Plain SVG icons (no emoji)
const icons = {
  play:  '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4 3.5v9a.5.5 0 0 0 .77.42l7-4.5a.5.5 0 0 0 0-.84l-7-4.5A.5.5 0 0 0 4 3.5Z"/></svg>',
  pause: '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><rect x="4" y="3" width="3.2" height="10" rx="1"/><rect x="8.8" y="3" width="3.2" height="10" rx="1"/></svg>',
  arrowL:'<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3 5 8l5 5"/></svg>',
  arrowR:'<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3l5 5-5 5"/></svg>',
  check: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5 6.5 12 13 4.5"/></svg>',
  grid:  '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="2.5" width="4" height="4" rx="0.5"/><rect x="9.5" y="2.5" width="4" height="4" rx="0.5"/><rect x="2.5" y="9.5" width="4" height="4" rx="0.5"/><rect x="9.5" y="9.5" width="4" height="4" rx="0.5"/></svg>',
};

Object.assign(window, {
  DATA, POOL, METRICS, CMOS_OPTIONS, icons,
  sampleRoundIndices, makeAbMap, buildQuestion,
});
