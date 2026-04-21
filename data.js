// Shared data + helpers for Tonewright A/B listening test
// Subjective: P7v1 vs P8v1 · 8 fixed-prompt clips (peak-normalised to −1 dBFS)
// Exposes: DATA, CMOS_OPTIONS, METRICS, icons

// A/B assignment (fixed, 4 × true / 4 × false so each variant lands on side A four times).
// true  → A is p7v1, B is p8v1
// false → A is p8v1, B is p7v1
const AB_MAP = [true, false, true, false, false, true, false, true];

function mkQ(n, clipName, prompt, v1File, v2File) {
  const aIsV1 = AB_MAP[n - 1];
  const aFileName = aIsV1 ? v1File : v2File;
  const bFileName = aIsV1 ? v2File : v1File;
  return {
    id: n,
    title: clipName,
    clipId: clipName,
    desc: prompt,
    aFile: `audio/${aFileName}`,
    bFile: `audio/${bFileName}`,
    aFileName,
    bFileName,
    aLabel: aIsV1 ? "p7v1" : "p8v1",
    bLabel: aIsV1 ? "p8v1" : "p7v1",
  };
}

// Prompts below are the exact strings fed to infer.py during generation
// (verified against docs/eval/subjective_prompts.md on 140.122.184.29).
// If you swap audio, update the matching `desc` string here too.
const DATA = {
  project: "subjective_p7v1_vs_p8v1",
  projectLabel: "Subjective · P7v1 vs P8v1",
  totalQuestions: 8,
  questions: [
    mkQ(1, "piano",
        "This is a piano cover of a glam metal music piece. The piece is being played gently on a keyboard with a grand piano sound. There is a calming, relaxing atmosphere in this piece.",
        "piano_p7v1.wav", "piano_p8v1.wav"),
    mkQ(2, "metal",
        "This is the recording of a heavy metal music piece. There is a male vocalist singing melodically in the lead. The main tune is being played by the distorted electric guitar while the bass guitar is playing in the background. The rhythmic background consists of a simple acoustic drum beat. The atmosphere is aggressive.",
        "metal_p7v1.wav", "metal_p8v1.wav"),
    mkQ(3, "lofi",
        "The low quality recording features a live performance of a folk song that consists of an arpeggiated electric guitar melody played over groovy bass, punchy snare and shimmering cymbals. It sounds energetic and the recording is noisy and in mono.",
        "lofi_p7v1.wav", "lofi_p8v1.wav"),
    mkQ(4, "edm",
        "This is an electronic dance music piece. There is a synth lead playing the main melody. The beat consists of a kick drum, clap, hi-hat and synthesized bass. The atmosphere is energetic and euphoric.",
        "edm_p7v1.wav", "edm_p8v1.wav"),
    mkQ(5, "cinematic",
        "This is a cinematic orchestral piece. There are strings playing a sweeping melody with brass accents. The piece builds in intensity with a dramatic crescendo. The atmosphere is epic and emotional.",
        "cinematic_p7v1.wav", "cinematic_p8v1.wav"),
    mkQ(6, "acoustic",
        "A solo acoustic guitar piece with fingerpicking. Gentle and melancholic.",
        "acoustic_p7v1.wav", "acoustic_p8v1.wav"),
    mkQ(7, "jazz",
        "A smooth jazz piece with a saxophone lead, upright bass, and brushed drums. Studio quality recording with warm tones.",
        "jazz_p7v1.wav", "jazz_p8v1.wav"),
    mkQ(8, "ambient",
        "A dark ambient soundscape with drone pads, distant reverb, and subtle noise. Lo-fi texture with tape saturation.",
        "ambient_p7v1.wav", "ambient_p8v1.wav"),
  ],
};

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

Object.assign(window, { DATA, CMOS_OPTIONS, METRICS, icons });
