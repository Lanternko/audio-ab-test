// Shared data + helpers for Audio A/B Test
// Pool-based: each session samples roundSize clips from DATA.pool.
// One participant can do many sessions; per-participant "seen" tracking in
// localStorage keeps repeat sessions from overlapping until the pool is
// exhausted (at which point it silently resets). Round concept is hidden
// from the UI — it only powers the repeat-answering behavior internally.

const APP_NAME = "Audio A/B Test";

// MusicCaps test set v3: 24 prompts deterministically sampled from
// MusicCaps test set (seed=42). See audio_new_v3/subjective_ab_v3/metadata.json.
const POOL = [
  { clipId: "mc01", title: "01", prompt: "An **acoustic piano** is playing a **sad** sounding composition while someone is playing a **synthesizer** lead-sound that sounds like someone crying. You can hear a lot of **white noise** in the recording. This seems to be an **amateur recording**. This song may be playing on a TV show.", files: { p7v1: "mc01_p7v1.wav", p8v1: "mc01_p8v1.wav" } },
  { clipId: "mc02", title: "02", prompt: "This song contains **digital drums** playing a groove that invites to dance along with some percussive sounds. A **bass hit** sounds is adding rhythmic and harmonic elements along with a short **synth lead** sound in the higher register. A **male voice** is shouting/singing with delay on his voice. This song may be playing in a **club**.", files: { p7v1: "mc02_p7v1.wav", p8v1: "mc02_p8v1.wav" } },
  { clipId: "mc03", title: "03", prompt: "The **low quality** recording features an in-game audio recording that features an echoing **female exhale** sound, shimmering **hi hats**, claps, shimmering **bells melody** and **groovy bass guitar**. In the second half of the loop, the song changes and there is a sweet **female vocal** humming a melody. It sounds **exciting**, **happy** and **fun**.", files: { p7v1: "mc03_p7v1.wav", p8v1: "mc03_p8v1.wav" } },
  { clipId: "mc04", title: "04", prompt: "A **male singer** sings this **emotional** melody with a **female backup singer** singing chanting tones. The song is slow tempo with a **guitar** strumming gently and no other instrumentation. The song is emotional and **romantic**. The song is **beautiful** and lilting.", files: { p7v1: "mc04_p7v1.wav", p8v1: "mc04_p8v1.wav" } },
  { clipId: "mc05", title: "05", prompt: "The excerpt starts off with 3 **bass drum** beats after which an **explosion** and a crumbling sound can be heard. After this, downward sliding **strings** or a similar instrument in timbre can be heard creating a sort of **scary** effect. In the background **wind sounds** can be heard throughout.", files: { p7v1: "mc05_p7v1.wav", p8v1: "mc05_p8v1.wav" } },
  { clipId: "mc06", title: "06", prompt: "The **Pop** song features an echoing **synth keys** melody that consists of a **passionate female vocal** singing over **punchy kick**, synth bells melody, echoing synth keys melody and **shimmering hi hats**. It sounds **emotional** and **passionate**.", files: { p7v1: "mc06_p7v1.wav", p8v1: "mc06_p8v1.wav" } },
  { clipId: "mc07", title: "07", prompt: "The **Trap** song features a very short snippet of hard **808 bass**, **shimmering hi hats**, **punchy snare** and **synth keys** melody after which comes the second part of the loop where there is a wide filtered stuttering down sweep sound effect. It sounds like an interlude in the middle of the song.", files: { p7v1: "mc07_p7v1.wav", p8v1: "mc07_p8v1.wav" } },
  { clipId: "mc08", title: "08", prompt: "This is a **cumbia** piece. There is a **female vocal** singing seductively joined by **male back vocals** singing in the chorus. The **trumpet** is playing the main melody joined by the **piano** and the **bass guitar** in the background. **Latin percussion** playing a cumbia beat provides the rhythmic background. The atmosphere of the piece is very **playful**. The ideal setting for this piece can be a **latin dance** course.", files: { p7v1: "mc08_p7v1.wav", p8v1: "mc08_p8v1.wav" } },
  { clipId: "mc09", title: "09", prompt: "The **low quality** recording features an **electric guitar** tuning. The recording is gated so every time the guitar string is plucked it is very **noisy**, while in-between it is a complete **silence**.", files: { p7v1: "mc09_p7v1.wav", p8v1: "mc09_p8v1.wav" } },
  { clipId: "mc10", title: "10", prompt: "The song is an **instrumental** piece. The song is medium tempo with a steady rhythm, **groovy bass line**, **retro keyboard** tones. The song is **dance-like** and entertaining. The song is a **hip hop** tune and an **amateur production**.", files: { p7v1: "mc10_p7v1.wav", p8v1: "mc10_p8v1.wav" } },
  { clipId: "mc11", title: "11", prompt: "The **low quality** recording features a sustained **string melody**, tinny **shimmering bells** and addictive **piano melody**, complementing each other. At the very end of the loop there is a short snippet of flat **female vocal** narrating. At some point during the loop, there is a subtle unwanted **low frequency sputter**, which definitely makes this recording low quality.", files: { p7v1: "mc11_p7v1.wav", p8v1: "mc11_p8v1.wav" } },
  { clipId: "mc12", title: "12", prompt: "This is a **dubstep** piece. The rhythmic background consists of a **hard-hitting electronic drum beat**. A **high-pitched synth** is playing the main melody while a **choir** sample is played in the background for the chords. There is a **high energy** atmosphere in the piece. It could be played at **nightclubs**. This piece could also take place in **DJ** setlists.", files: { p7v1: "mc12_p7v1.wav", p8v1: "mc12_p8v1.wav" } },
  { clipId: "mc13", title: "13", prompt: "This is a **movie music** piece. The music starts playing with a **film reel effect**. A **strings section** with **cinematic** characteristics are playing a **dramatic** tune while percussive elements resembling a **timpani** and a **big cymbal** are playing accentuated hits to put emphasis on this feeling. The atmosphere is **epic**. There is the aura of a story about to be told in this piece. It could be used in the soundtrack of a **documentary**, an **action** or a **thriller** movie. It could also be used in the soundtrack of a **thriller video game**.", files: { p7v1: "mc13_p7v1.wav", p8v1: "mc13_p8v1.wav" } },
  { clipId: "mc14", title: "14", prompt: "The song is an **instrumental** with a **devilish voice** laughing. The tempo is fast with a **fast paced drumming** rhythm with strong **cymbal crashes**. The song is probably an **adult animated show** designed to scare.", files: { p7v1: "mc14_p7v1.wav", p8v1: "mc14_p8v1.wav" } },
  { clipId: "mc15", title: "15", prompt: "A **male guitarist** plays a cool guitar like on an **electric guitar**. The song is medium tempo with a **guitar solo** with heavy **echoes** played though a **guitar amplifier** and no other instrumentation. The song is **bluesy** and **passionate**. The song is a casual blue slick played on a guitar.", files: { p7v1: "mc15_p7v1.wav", p8v1: "mc15_p8v1.wav" } },
  { clipId: "mc16", title: "16", prompt: "The song is **instrumental**. The tempo is **fast** with a beautifully played **hand pan** arrangement by a soloist. The song is **ethereal** and **innocent** in its beauty. The audio quality is **average**.", files: { p7v1: "mc16_p7v1.wav", p8v1: "mc16_p8v1.wav" } },
  { clipId: "mc17", title: "17", prompt: "The **low quality** recording features a musician practicing **bassoon** scale. In the background, there is a muffled **male vocal**. The recording is **mono** and **noisy**.", files: { p7v1: "mc17_p7v1.wav", p8v1: "mc17_p8v1.wav" } },
  { clipId: "mc18", title: "18", prompt: "This music is an **electronic instrumental**. The tempo is fast with **punchy drumming** rhythm, **keyboard harmony**, vigorous **guitar rhythm** and electronically arranged sounds like a **dissonant booming drum**, water bubbling, hissing and whistle like instrument playing harmony. The song is **youthful**, **energetic**, **enthusiastic**, vigorous, vivacious and youthful with a **dance groove**. This music is **EDM**.", files: { p7v1: "mc18_p7v1.wav", p8v1: "mc18_p8v1.wav" } },
  { clipId: "mc19", title: "19", prompt: "This song features a **harmonica** playing the main melody. This is accompanied by **percussion** playing a simple beat with the focus on the **snare**. The **bass** plays the root note of the chord. Due to the **low quality** of the audio, the other instruments cannot be heard. T.", files: { p7v1: "mc19_p7v1.wav", p8v1: "mc19_p8v1.wav" } },
  { clipId: "mc20", title: "20", prompt: "**Male singers** sing this **vocal harmony**. The song is medium fast tempo with a **groovy bass line**, **steady drumming** rhythm, **piano accompaniment** and **guitar rhythm**. The song is **devotional** and **congregational**. The song is a **classic Christian praise** hit.", files: { p7v1: "mc20_p7v1.wav", p8v1: "mc20_p8v1.wav" } },
  { clipId: "mc21", title: "21", prompt: "We hear the bright ringing of two **metal objects** clanging against each other. This is the bright **metallic** sound of steel ringing. In the distance, we faintly hear a **country rock** song. Specifically, we hear a **country rock guitar riff** being played in the background. There is also the sound of a non-steel object being placed on a surface.", files: { p7v1: "mc21_p7v1.wav", p8v1: "mc21_p8v1.wav" } },
  { clipId: "mc22", title: "22", prompt: "A **male vocalist** sings this **animated** song. The tempo is medium with vocal emphasis, a bright **ukelele harmony**, **groovy bass guitar**, rhythmic **acoustic guitar** and **piano accompaniment**. The song is **emphatic**, **passionate**, jealous, **emotional**, sentimental and story telling. The song has an **orchestral** vibe.", files: { p7v1: "mc22_p7v1.wav", p8v1: "mc22_p8v1.wav" } },
  { clipId: "mc23", title: "23", prompt: "This audio contains someone playing a clean **e-guitar** melody that sounds **soothing**. This song may be playing at a little **living room concert**.", files: { p7v1: "mc23_p7v1.wav", p8v1: "mc23_p8v1.wav" } },
  { clipId: "mc24", title: "24", prompt: "This clip brings about the sensation of **building up** to something. It features an **arpeggiated melody** on the **piano**, and **timpani drum rolls**. The audio quality is **low**.", files: { p7v1: "mc24_p7v1.wav", p8v1: "mc24_p8v1.wav" } },
];

const DATA = {
  appName: APP_NAME,
  project: "audio_ab_test_musiccaps_p7v1_vs_p8v1",
  projectLabel: "Q vs NQ",
  variants: ["p7v1", "p8v1"],
  roundSize: 8,
  pool: POOL,
  variantDescriptions: {
    "p7v1": { en: "p7v1 — model configuration 7, variant 1", zh: "p7v1 — 模型配置 7，第 1 版本" },
    "p8v1": { en: "p8v1 — model configuration 8, variant 1", zh: "p8v1 — 模型配置 8，第 1 版本" },
  },
};

const LEGACY_PROJECT_KEYS = ["subjective_p7v1_vs_p8v1", "audio_ab_test_p7v1_vs_p8v1"];

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
      blindNotice: () => `While you rate, A and B stay anonymous. Submit when you're done.`,
      keepGoing: "",
      nameLabel: "Name",
      namePlaceholder: "e.g. Alice Chen",
      start: "Start test",
    },
    metrics: {
      audioQuality: {
        label: "Audio Quality",
        hint: "Does it sound clean and natural, or are there glitches and distortion?",
      },
      promptFollowing: {
        label: "Prompt Following",
        hint: "Does the music match the description written above?",
      },
    },
    runner: {
      noRound: "No questions in progress",
      restartHint: "Click the × next to your name in the top bar to restart from the welcome screen.",
      jumpToQuestion: (idx, answered) => `Jump to question ${idx}${answered ? " (rated)" : ""}`,
      slug: (round, question, total) => `${DATA.projectLabel} · Question ${question} / ${total}`,
      pairTitle: "A vs B",
      promptTag: "Prompt",
      blindSample: "Blind sample",
      play: "Play",
      pause: "Pause",
      previous: "Previous",
      next: "Next",
      viewResults: "View results",
      backToResults: "Back to results",
      keyboardHint: "← → to navigate",
      reviewMode: "Read-only review — ratings are locked",
      ready: "Rated · ready for next",
      partial: "Rate both dimensions to continue",
      answered: (count, total) => `${count} / ${total} answered`,
      overview: "Overview",
    },
    overview: {
      eyebrow: () => `${DATA.projectLabel} · Overview`,
      title: "Overview",
      lede: "Each card is one question. Rated cards show your AQ and PF scores. A / B identities are revealed once all questions are answered.",
      answered: "Answered",
      participantRound: "Participant",
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
      eyebrow: (round, participant) => `${DATA.projectLabel} · Results · ${participant || "anonymous"}`,
      title: "Results",
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
      noRound: "No questions in progress",
      abDiffTitle: "What are A and B?",
      backToReview: "← Listen again",
      submitMessage: "Submit your ratings. If the upload fails, a backup JSON file downloads automatically.",
      exportMessage: "Download your ratings as JSON.",
      backup: "Download backup JSON",
      downloadOnly: "Download JSON only",
      downloadAndNext: "Download & continue",
      submit: "Submit results",
      nextRound: "Continue",
      uploading: "Uploading…",
      retry: "Retry upload",
      exportConfirm: (round, participant) => `Download results for "${participant}"?`,
      submitConfirm: (round, participant) => `Submit results for "${participant}"?`,
      exported: () => `Results exported.`,
      submitted: (round, shortId) => `Results submitted · id ${shortId}.`,
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
      blindNotice: () => `作答時不會顯示 A 與 B 的真實來源。完成後請送出。`,
      keepGoing: "",
      nameLabel: "姓名",
      namePlaceholder: "例如：Alice Chen",
      start: "開始測試",
    },
    metrics: {
      audioQuality: {
        label: "音質",
        hint: "聽起來乾淨自然嗎？還是有雜音或失真？",
      },
      promptFollowing: {
        label: "Prompt 符合度",
        hint: "音樂是否符合上方的文字描述？",
      },
    },
    runner: {
      noRound: "目前沒有題目",
      restartHint: "可點選上方姓名旁的 ×，回到歡迎頁重新開始。",
      jumpToQuestion: (idx, answered) => `跳到第 ${idx} 題${answered ? "（已評分）" : ""}`,
      slug: (round, question, total) => `${DATA.projectLabel} · 第 ${question} / ${total} 題`,
      pairTitle: "A vs B",
      promptTag: "Prompt 原文",
      blindSample: "盲測樣本",
      play: "播放",
      pause: "暫停",
      previous: "上一題",
      next: "下一題",
      viewResults: "查看結果",
      backToResults: "回到結果",
      keyboardHint: "← → 切換題目",
      reviewMode: "唯讀回顧 — 評分已提交",
      ready: "已完成，可前往下一題",
      partial: "完成兩個維度的評分後才能繼續",
      answered: (count, total) => `已完成 ${count} / ${total} 題`,
      overview: "總覽",
    },
    overview: {
      eyebrow: () => `${DATA.projectLabel} · 總覽`,
      title: "總覽",
      lede: "每張卡片代表一題。已作答的卡片會顯示 AQ 與 PF 分數；全部完成後才會揭示 A / B 真實身分。",
      answered: "已作答",
      participantRound: "測試者",
      status: "狀態",
      readyToReveal: "可查看結果",
      notStarted: "尚未開始",
      inProgress: "進行中",
      notRated: "尚未評分，點擊即可作答",
      allDone: "全部完成，可以查看結果。",
      remaining: (count) => `還有 ${count} 題未完成，請完成聆聽與評分。`,
      continue: "繼續作答",
      viewResults: "查看結果",
    },
    results: {
      eyebrow: (round, participant) => `${DATA.projectLabel} · 結果 · ${participant || "匿名"}`,
      title: "結果",
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
      noRound: "目前沒有題目",
      abDiffTitle: "A 和 B 是什麼？",
      backToReview: "← 回去聽",
      submitMessage: "送出評分即可完成上傳。若上傳失敗，系統會自動下載備份 JSON。",
      exportMessage: "請下載評分結果 JSON。",
      backup: "下載備份 JSON",
      downloadOnly: "只下載 JSON",
      downloadAndNext: "下載並繼續",
      submit: "送出結果",
      nextRound: "繼續",
      uploading: "上傳中…",
      retry: "重新上傳",
      exportConfirm: (round, participant) => `要下載 ${participant} 的評分結果嗎？`,
      submitConfirm: (round, participant) => `要送出 ${participant} 的評分結果嗎？`,
      exported: () => `評分結果已匯出。`,
      submitted: (round, shortId) => `評分結果已送出 · id ${shortId}。`,
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
    titleZh: poolItem.titleZh || poolItem.title,
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

function boldifyHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

Object.assign(window, {
  DATA, POOL, LANG_OPTIONS, LEGACY_PROJECT_KEYS, icons,
  getText, getMetrics, getCmosOptions, detectPreferredLang,
  sampleRoundIndices, makeAbMap, buildQuestion, boldifyHtml,
});
