// C2.0 / best-of-3 / worst-of-3 / K=3-q9 quarter MF25 CFG4.5 AB test.
const FULLSCALE_AUDIO = {
  mc01: { c20: "mc01_c20.flac", best: "mc01_best.flac", worst: "mc01_worst.flac", k3: "mc01_k3.flac" },
  mc02: { c20: "mc02_c20.flac", best: "mc02_best.flac", worst: "mc02_worst.flac", k3: "mc02_k3.flac" },
  mc03: { c20: "mc03_c20.flac", best: "mc03_best.flac", worst: "mc03_worst.flac", k3: "mc03_k3.flac" },
  mc04: { c20: "mc04_c20.flac", best: "mc04_best.flac", worst: "mc04_worst.flac", k3: "mc04_k3.flac" },
  mc05: { c20: "mc05_c20.flac", best: "mc05_best.flac", worst: "mc05_worst.flac", k3: "mc05_k3.flac" },
  mc06: { c20: "mc06_c20.flac", best: "mc06_best.flac", worst: "mc06_worst.flac", k3: "mc06_k3.flac" },
  mc07: { c20: "mc07_c20.flac", best: "mc07_best.flac", worst: "mc07_worst.flac", k3: "mc07_k3.flac" },
  mc08: { c20: "mc08_c20.flac", best: "mc08_best.flac", worst: "mc08_worst.flac", k3: "mc08_k3.flac" },
  mc09: { c20: "mc09_c20.flac", best: "mc09_best.flac", worst: "mc09_worst.flac", k3: "mc09_k3.flac" },
  mc10: { c20: "mc10_c20.flac", best: "mc10_best.flac", worst: "mc10_worst.flac", k3: "mc10_k3.flac" },
  mc11: { c20: "mc11_c20.flac", best: "mc11_best.flac", worst: "mc11_worst.flac", k3: "mc11_k3.flac" },
  mc12: { c20: "mc12_c20.flac", best: "mc12_best.flac", worst: "mc12_worst.flac", k3: "mc12_k3.flac" },
  mc13: { c20: "mc13_c20.flac", best: "mc13_best.flac", worst: "mc13_worst.flac", k3: "mc13_k3.flac" },
  mc14: { c20: "mc14_c20.flac", best: "mc14_best.flac", worst: "mc14_worst.flac", k3: "mc14_k3.flac" },
  mc15: { c20: "mc15_c20.flac", best: "mc15_best.flac", worst: "mc15_worst.flac", k3: "mc15_k3.flac" },
  mc16: { c20: "mc16_c20.flac", best: "mc16_best.flac", worst: "mc16_worst.flac", k3: "mc16_k3.flac" },
  mc17: { c20: "mc17_c20.flac", best: "mc17_best.flac", worst: "mc17_worst.flac", k3: "mc17_k3.flac" },
  mc18: { c20: "mc18_c20.flac", best: "mc18_best.flac", worst: "mc18_worst.flac", k3: "mc18_k3.flac" },
  mc19: { c20: "mc19_c20.flac", best: "mc19_best.flac", worst: "mc19_worst.flac", k3: "mc19_k3.flac" },
  mc20: { c20: "mc20_c20.flac", best: "mc20_best.flac", worst: "mc20_worst.flac", k3: "mc20_k3.flac" },
  mc21: { c20: "mc21_c20.flac", best: "mc21_best.flac", worst: "mc21_worst.flac", k3: "mc21_k3.flac" },
  mc22: { c20: "mc22_c20.flac", best: "mc22_best.flac", worst: "mc22_worst.flac", k3: "mc22_k3.flac" },
  mc23: { c20: "mc23_c20.flac", best: "mc23_best.flac", worst: "mc23_worst.flac", k3: "mc23_k3.flac" },
  mc24: { c20: "mc24_c20.flac", best: "mc24_best.flac", worst: "mc24_worst.flac", k3: "mc24_k3.flac" },
  mc25: { c20: "mc25_c20.flac", best: "mc25_best.flac", worst: "mc25_worst.flac", k3: "mc25_k3.flac" },
  mc26: { c20: "mc26_c20.flac", best: "mc26_best.flac", worst: "mc26_worst.flac", k3: "mc26_k3.flac" },
  mc27: { c20: "mc27_c20.flac", best: "mc27_best.flac", worst: "mc27_worst.flac", k3: "mc27_k3.flac" },
  mc28: { c20: "mc28_c20.flac", best: "mc28_best.flac", worst: "mc28_worst.flac", k3: "mc28_k3.flac" },
  mc29: { c20: "mc29_c20.flac", best: "mc29_best.flac", worst: "mc29_worst.flac", k3: "mc29_k3.flac" },
  mc30: { c20: "mc30_c20.flac", best: "mc30_best.flac", worst: "mc30_worst.flac", k3: "mc30_k3.flac" },
};

DATA.project = "audio_ab_test_c20_best_worst_k3_quarter_mf25";
DATA.projectLabel = "C2.0 · Best · Worst · K3";
DATA.variants = ["c20", "best", "worst", "k3"];
DATA.roundSize = 12;
DATA.variantDescriptions = {
  c20: { shortName: "C2.0", displayName: "Caption 2.0", en: "C2.0 multisent NoQ quarter; MusicCaps MF25 CFG4.5.", zh: "Caption 2.0 多句 NoQ quarter；MusicCaps MF25 CFG4.5。" },
  best: { shortName: "Best", displayName: "Best-of-3", en: "Per-clip highest CLAP caption among 3 slots.", zh: "三槽裡 CLAP 最高的那句當訓練 caption。" },
  worst: { shortName: "Worst", displayName: "Worst-of-3", en: "Per-clip lowest CLAP caption among 3 slots.", zh: "三槽裡 CLAP 最低的那句當訓練 caption。" },
  k3: { shortName: "K3", displayName: "K=3 q9", en: "Qwen-3cap MeanSim K=3, inferred at q=9.", zh: "Qwen 三句 MeanSim K=3，推論固定 q=9。" },
};
DATA.pool = DATA.pool.map(item => ({ ...item, files: FULLSCALE_AUDIO[item.clipId] }));

function fullscaleShuffle(xs) {
  const out = xs.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Every 12-question round contains each of the six unordered system pairs
// twice, with A/B identity randomized independently for each question.
function fullscaleMakeAbMap(size) {
  const pairs = [];
  for (let i = 0; i < DATA.variants.length; i++) {
    for (let j = i + 1; j < DATA.variants.length; j++) {
      pairs.push([DATA.variants[i], DATA.variants[j]]);
    }
  }
  const schedule = [];
  while (schedule.length < size) schedule.push(...fullscaleShuffle(pairs));
  return schedule.slice(0, size).map(([left, right]) => ({
    left,
    right,
    aIsLeft: Math.random() < 0.5,
  }));
}

function fullscaleBuildQuestion(poolItem, posInRound, pair, variants) {
  // Keep the old boolean form working for any legacy state in localStorage.
  let left = variants[0], right = variants[1], aIsLeft = !!pair;
  if (pair && typeof pair === "object") {
    left = pair.left;
    right = pair.right;
    aIsLeft = !!pair.aIsLeft;
  }
  const f = poolItem.files;
  return {
    id: posInRound,
    title: poolItem.title,
    titleZh: poolItem.titleZh || poolItem.title,
    clipId: poolItem.clipId,
    desc: poolItem.prompt,
    descZh: poolItem.promptZh || "",
    aFile: `audio/${aIsLeft ? f[left] : f[right]}`,
    bFile: `audio/${aIsLeft ? f[right] : f[left]}`,
    aFileName: aIsLeft ? f[left] : f[right],
    bFileName: aIsLeft ? f[right] : f[left],
    aLabel: aIsLeft ? left : right,
    bLabel: aIsLeft ? right : left,
  };
}

Object.assign(window, {
  makeAbMap: fullscaleMakeAbMap,
  buildQuestion: fullscaleBuildQuestion,
});
// Rebind the classic-script globals used by runner.jsx, overview.jsx, and
// the inline App component; assigning only window properties is insufficient
// for those existing global function bindings.
makeAbMap = fullscaleMakeAbMap;
buildQuestion = fullscaleBuildQuestion;
