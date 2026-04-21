// Shared data + helpers for Audio A/B Test
// Pool-based: each round samples roundSize clips from DATA.pool.
// One participant can do many rounds; per-participant "seen" tracking in
// localStorage keeps successive rounds from overlapping until the pool is
// exhausted (at which point it silently resets so they can keep going).

const APP_NAME = "Audio A/B Test";

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
  appName: APP_NAME,
  project: "audio_ab_test_p7v1_vs_p8v1",
  projectLabel: "P7v1 vs P8v1",
  variants: ["p7v1", "p8v1"],
  roundSize: 8,
  pool: POOL,
};

const LEGACY_PROJECT_KEYS = ["subjective_p7v1_vs_p8v1"];

const LANG_OPTIONS = [
  { key: "en", label: "EN", ariaLabel: "Switch interface language to English" },
  { key: "zh", label: "中文", ariaLabel: "切換介面語言為繁體中文" },
];

const UI_TEXT = {
  en: {
    nav: {
      evaluate: "Evaluate",
      overview: "Overview",
      results: "Results",
    },
    common: {
      anonymous: "anonymous",
      switchParticipant: "Switch participant",
      roundBadge: "R",
    },
    welcome: {
      eyebrow: "Audio A/B Test · blind listening",
      heroName: "AudioTest",
      titleLead: "Welcome to",
      intro: (roundSize) => `You will compare ${roundSize} pairs of audio clips. Each pair has an A version and a B version. After listening, choose which one feels better in these two areas:`,
      criteria: {
        audioQuality: "Which clip sounds clearer, cleaner, and more pleasant overall?",
        promptFollowing: "Which clip matches the text prompt more closely?",
      },
      blindNotice: (roundSize, poolSize) => `While you rate, A and B stay anonymous. After you submit a round, the next round starts automatically with another random set of ${roundSize} clips from the ${poolSize}-clip pool.`,
      keepGoing: "You can stop after one round, or keep going if you want to rate more clips.",
      nameLabel: "Name",
      namePlaceholder: "e.g. Alice Chen",
      start: "Start test",
    },
    metrics: {
      audioQuality: {
        label: "Audio Quality",
        hint: "Overall perceptual quality: artefacts, clarity, fidelity.",
      },
      promptFollowing: {
        label: "Prompt Following",
        hint: "How faithfully the clip matches the prompt shown above.",
      },
    },
    runner: {
      noRound: "No round in progress",
      restartHint: "Click the × next to your name in the top bar to restart from the welcome screen.",
      jumpToQuestion: (idx, answered) => `Jump to question ${idx}${answered ? " (rated)" : ""}`,
      slug: (round, question, total) => `${DATA.projectLabel} · Round ${round} · Question ${question} / ${total}`,
      pairTitle: "A vs B",
      promptTag: "Prompt",
      blindSample: "Blind sample",
      play: "Play",
      pause: "Pause",
      previous: "Previous",
      next: "Next",
      viewResults: "View results",
      ready: "Rated · ready for next",
      partial: "Rate both dimensions to continue",
      answered: (count, total) => `${count} / ${total} answered`,
      overview: "Round overview",
    },
    overview: {
      eyebrow: (round) => `${DATA.projectLabel} · Round ${round} · Overview`,
      title: "Round overview",
      lede: "Each card is one question in the current round. Rated cards show your AQ and PF scores. A / B identities are revealed once all questions are answered.",
      answered: "Answered",
      participantRound: "Participant · Round",
      status: "Status",
      readyToReveal: "Ready to view results",
      notStarted: "Not started",
      inProgress: "In progress",
      notRated: "Not rated — click to open",
      allDone: "All done. You can view the results now.",
      remaining: (count) => `${count} question${count === 1 ? "" : "s"} remaining — listen through before rating.`,
      continue: "Continue rating",
      viewResults: "View results",
    },
    results: {
      eyebrow: (round, participant) => `${DATA.projectLabel} · Round ${round} · Results · ${participant || "anonymous"}`,
      title: "Round results",
      questionsRated: "Questions rated",
      tie: "Tie",
      tieCaption: "about the same",
      points: "pts",
      questionsUnit: "Qs",
      preferLeft: (label) => `prefer ${label}`,
      preferRight: (label) => `prefer ${label}`,
      table: {
        number: "#",
        question: "Question",
        aq: "AQ",
        pf: "PF",
        identity: "A / B identities",
      },
      noRound: "No round in progress",
      submitMessage: "Submit this round to upload your ratings. If the upload fails, a backup JSON file downloads automatically. A new round starts after a successful submit.",
      exportMessage: "Download this round as JSON. The next round will start right after the file is saved.",
      backup: "Download backup JSON",
      downloadOnly: "Download JSON only",
      downloadAndNext: "Download & next round",
      submit: "Submit results",
      uploading: "Uploading…",
      retry: "Retry upload",
      exportConfirm: (round, participant) => `Download round ${round} for "${participant}" and start the next round?`,
      submitConfirm: (round, participant) => `Submit round ${round} for "${participant}"?`,
      exported: (round) => `Round ${round} exported. Starting next round…`,
      submitted: (round, shortId) => `Round ${round} submitted · id ${shortId}. Starting next round…`,
      uploadFailed: (message) => `Upload failed: ${message}. A backup JSON file was downloaded. You can retry below, or share that file with the study team.`,
      retrying: "Retrying upload…",
      retryFailed: (message) => `Retry failed: ${message}. Use the backup JSON file that was already downloaded.`,
    },
    cmos: {
      aMuchBetter: "A much better",
      aBetter: "A better",
      aSlightlyBetter: "A slightly better",
      same: "About the same",
      bSlightlyBetter: "B slightly better",
      bBetter: "B better",
      bMuchBetter: "B much better",
      leftEnd: "A much better",
      rightEnd: "B much better",
    },
  },
  zh: {
    nav: {
      evaluate: "作答",
      overview: "總覽",
      results: "結果",
    },
    common: {
      anonymous: "匿名",
      switchParticipant: "切換測試者",
      roundBadge: "第",
    },
    welcome: {
      eyebrow: "Audio A/B Test · 盲測聆聽",
      heroName: "AudioTest",
      titleLead: "歡迎使用",
      intro: (roundSize) => `你將比較 ${roundSize} 組音檔。每一組都有 A 與 B 兩個版本。聽完後，請依照下面兩個方向判斷哪一個比較好：`,
      criteria: {
        audioQuality: "哪個版本聽起來更清楚、更自然、整體更舒服？",
        promptFollowing: "哪個版本更貼近畫面上方顯示的文字描述？",
      },
      blindNotice: (roundSize, poolSize) => `作答時不會顯示 A 與 B 的真實來源。送出一輪後，系統會自動從 ${poolSize} 個音檔中重新抽出 ${roundSize} 題，開始下一輪。`,
      keepGoing: "你可以做完一輪就結束，也可以繼續評更多音檔。",
      nameLabel: "姓名",
      namePlaceholder: "例如：Alice Chen",
      start: "開始測試",
    },
    metrics: {
      audioQuality: {
        label: "音質",
        hint: "整體聽感品質，例如失真、清晰度與保真度。",
      },
      promptFollowing: {
        label: "Prompt 符合度",
        hint: "音檔是否符合上方顯示的英文 prompt。",
      },
    },
    runner: {
      noRound: "目前沒有進行中的輪次",
      restartHint: "可點選上方姓名旁的 ×，回到歡迎頁重新開始。",
      jumpToQuestion: (idx, answered) => `跳到第 ${idx} 題${answered ? "（已評分）" : ""}`,
      slug: (round, question, total) => `${DATA.projectLabel} · 第 ${round} 輪 · 第 ${question} / ${total} 題`,
      pairTitle: "A 對 B",
      promptTag: "Prompt 原文",
      blindSample: "盲測樣本",
      play: "播放",
      pause: "暫停",
      previous: "上一題",
      next: "下一題",
      viewResults: "查看結果",
      ready: "已完成，可前往下一題",
      partial: "完成兩個維度的評分後才能繼續",
      answered: (count, total) => `已完成 ${count} / ${total} 題`,
      overview: "本輪總覽",
    },
    overview: {
      eyebrow: (round) => `${DATA.projectLabel} · 第 ${round} 輪 · 總覽`,
      title: "本輪總覽",
      lede: "每張卡片代表本輪的一題。已作答的卡片會顯示 AQ 與 PF 分數；全部完成後才會揭示 A / B 真實身分。",
      answered: "已作答",
      participantRound: "測試者 · 輪次",
      status: "狀態",
      readyToReveal: "可查看結果",
      notStarted: "尚未開始",
      inProgress: "進行中",
      notRated: "尚未評分，點擊即可作答",
      allDone: "本輪已完成，可以查看結果。",
      remaining: (count) => `還有 ${count} 題未完成，請完成聆聽與評分。`,
      continue: "繼續作答",
      viewResults: "查看結果",
    },
    results: {
      eyebrow: (round, participant) => `${DATA.projectLabel} · 第 ${round} 輪 · 結果 · ${participant || "匿名"}`,
      title: "本輪結果",
      questionsRated: "已評分題數",
      tie: "平手",
      tieCaption: "兩者相同",
      points: "分",
      questionsUnit: "題",
      preferLeft: (label) => `偏好 ${label}`,
      preferRight: (label) => `偏好 ${label}`,
      table: {
        number: "#",
        question: "題目",
        aq: "AQ",
        pf: "PF",
        identity: "A / B 真實身分",
      },
      noRound: "目前沒有進行中的輪次",
      submitMessage: "送出本輪結果即可完成上傳。若上傳失敗，系統會自動下載備份 JSON；成功送出後會自動開始下一輪。",
      exportMessage: "請先下載本輪 JSON。檔案儲存完成後，系統會自動開始下一輪。",
      backup: "下載備份 JSON",
      downloadOnly: "只下載 JSON",
      downloadAndNext: "下載並開始下一輪",
      submit: "送出結果",
      uploading: "上傳中…",
      retry: "重新上傳",
      exportConfirm: (round, participant) => `要下載 ${participant} 的第 ${round} 輪結果，並開始下一輪嗎？`,
      submitConfirm: (round, participant) => `要送出 ${participant} 的第 ${round} 輪結果嗎？`,
      exported: (round) => `第 ${round} 輪已匯出，正在開始下一輪…`,
      submitted: (round, shortId) => `第 ${round} 輪已送出 · id ${shortId}。正在開始下一輪…`,
      uploadFailed: (message) => `上傳失敗：${message}。系統已下載備份 JSON，你可以在下方重試，或把檔案交給研究團隊。`,
      retrying: "重新上傳中…",
      retryFailed: (message) => `重新上傳失敗：${message}。請使用先前下載的備份 JSON。`,
    },
    cmos: {
      aMuchBetter: "A 明顯較好",
      aBetter: "A 較好",
      aSlightlyBetter: "A 稍微較好",
      same: "差不多",
      bSlightlyBetter: "B 稍微較好",
      bBetter: "B 較好",
      bMuchBetter: "B 明顯較好",
      leftEnd: "A 明顯較好",
      rightEnd: "B 明顯較好",
    },
  },
};

function getText(lang = "en") {
  return UI_TEXT[lang] || UI_TEXT.en;
}

function detectPreferredLang() {
  if (typeof navigator !== "undefined") {
    const preferred = (navigator.language || "").toLowerCase();
    if (preferred.startsWith("zh")) return "zh";
  }
  return "en";
}

function getMetrics(lang = "en") {
  const text = getText(lang);
  return [
    { key: "audioQuality", label: text.metrics.audioQuality.label, hint: text.metrics.audioQuality.hint },
    { key: "promptFollowing", label: text.metrics.promptFollowing.label, hint: text.metrics.promptFollowing.hint },
  ];
}

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

// 7-point CMOS scale. Positive = A preferred, negative = B preferred, 0 = tie.
function getCmosOptions(lang = "en") {
  const text = getText(lang);
  return [
    { val:  3, side: "A",   label: text.cmos.aMuchBetter },
    { val:  2, side: "A",   label: text.cmos.aBetter },
    { val:  1, side: "A",   label: text.cmos.aSlightlyBetter },
    { val:  0, side: "tie", label: text.cmos.same },
    { val: -1, side: "B",   label: text.cmos.bSlightlyBetter },
    { val: -2, side: "B",   label: text.cmos.bBetter },
    { val: -3, side: "B",   label: text.cmos.bMuchBetter },
  ];
}

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
  DATA, POOL, LANG_OPTIONS, LEGACY_PROJECT_KEYS, icons,
  getText, getMetrics, getCmosOptions, detectPreferredLang,
  sampleRoundIndices, makeAbMap, buildQuestion,
});
