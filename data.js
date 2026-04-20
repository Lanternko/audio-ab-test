// Shared data + helpers for Tonewright A/B listening test
// Pairwise: Phase 8 vs P9 V1 (bug-fix) · 10 MusicCaps clips, seed=123
// Exposes: DATA, CMOS_OPTIONS, METRICS, icons

// A/B assignment is deterministic but non-alternating, so the reveal has signal.
// true  → A is p8 , B is p9v1
// false → A is p9v1, B is p8
const AB_MAP = [false, true, false, true, true, false, true, false, true, false];

function mkQ(n, clipId, prompt, p8File, p9File) {
  const aIsP8 = AB_MAP[n - 1];
  const aFileName = aIsP8 ? p8File : p9File;
  const bFileName = aIsP8 ? p9File : p8File;
  return {
    id: n,
    title: `clip_${String(n).padStart(2, "0")}`,
    clipId,
    desc: prompt,
    aFile: `audio/${aFileName}`,
    bFile: `audio/${bFileName}`,
    aFileName,
    bFileName,
    aLabel: aIsP8 ? "p8" : "p9v1",
    bLabel: aIsP8 ? "p9v1" : "p8",
  };
}

const DATA = {
  project: "pairwise_p8_vs_p9v1",
  projectLabel: "Pairwise · P8 vs P9v1",
  totalQuestions: 10,
  questions: [
    mkQ(1, "HRVVqstIabc_240",
        "The low quality recording features an orchestra song that consists of a string section melody. The section contains violin melody playing in the left channel, cello in the right channel and later on, double bass in the middle. It sounds emotional and …",
        "01_HRVVqstIabc_240_p8.flac", "01_HRVVqstIabc_240_p9v1.flac"),
    mkQ(2, "gsIB8HjsRtw_100",
        "The low quality recording features a live performance of a folk song that contains an accordion melody playing over acoustic rhythm guitar, groovy bass, punchy kick and snare hits, shimmering cymbals, saxophone and trumpet melody. It sounds passionat…",
        "02_gsIB8HjsRtw_100_p8.flac", "02_gsIB8HjsRtw_100_p9v1.flac"),
    mkQ(3, "u68Ghaf_Phs_10",
        "This folk song features a variety of instruments. The main melody is played on a violin, flute and accordion. The double bass plays a running bass pattern. An acoustic guitar strums chords. A hammered dulcimer plays parts that give a percussive feel.",
        "03_u68Ghaf_Phs_10_p8.flac",  "03_u68Ghaf_Phs_10_p9v1.flac"),
    mkQ(4, "W2nlA65AwtU_390",
        "The music features a synth sound playing a repeating melody. An electric piano accompanies the melody with chords. In the second half of the music except the drums and bass guitar kick in. Listening to this music I get lounge vibes.",
        "04_W2nlA65AwtU_390_p8.flac", "04_W2nlA65AwtU_390_p9v1.flac"),
    mkQ(5, "5r4jLwjj_Ik_140",
        "This is a jazz music piece. There is a saxophone playing a solo in the lead. A tuba is playing the bass line. There is an electric guitar strumming chords. The rhythm is being played on the ride cymbal by the acoustic drums. The instrumentals have a …",
        "05_5r4jLwjj_Ik_140_p8.flac", "05_5r4jLwjj_Ik_140_p9v1.flac"),
    mkQ(6, "50fuQm8B2Yg_110",
        "This jazz song features a saxophone playing the main melody. This is accompanied by percussion playing a jazz beat. A piano plays jazz chords. The double bass plays the root notes with flourishes and fills. This song is the outro of a song and abrupt…",
        "06_50fuQm8B2Yg_110_p8.flac", "06_50fuQm8B2Yg_110_p9v1.flac"),
    mkQ(7, "FdvGsAq99r0_30",
        "This is an Arabic music piece being performed live by an orchestra. There is a new flute playing a solo in the lead. The melodic background consists of the violin, the oud, and the qanun while the cello and the bass guitar are playing in the lower ra…",
        "07_FdvGsAq99r0_30_p8.flac",  "07_FdvGsAq99r0_30_p9v1.flac"),
    mkQ(8, "2UnlMwW8nyI_30",
        "This children's song features an accordion playing chords. This is accompanied by percussion playing a simple beat. The bass plays the root notes of the chords. An instrument like the xylophone plays the main melody on the low frequencies. There are …",
        "08_2UnlMwW8nyI_30_p8.flac",  "08_2UnlMwW8nyI_30_p9v1.flac"),
    mkQ(9, "CM7jMnBXw2Y_20",
        "This rock song features a guitar solo being played on a distortion guitar. This starts off with a string bend followed by a descending lick. A harmonic string scratch technique is played to produce a screeching sound. This is followed by a fast ascen…",
        "09_CM7jMnBXw2Y_20_p8.flac",  "09_CM7jMnBXw2Y_20_p9v1.flac"),
    mkQ(10, "GPwzpw_47Dg_260",
        "Low fidelity live recording of an instrumental eastern European string ensemble with bowed violin, bowed bass. Crowd noise is audible. No drums are present. There is a feeling of gaiety and levity.",
        "10_GPwzpw_47Dg_260_p8.flac", "10_GPwzpw_47Dg_260_p9v1.flac"),
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
