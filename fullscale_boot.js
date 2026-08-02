// Full-scale four-system listening test configuration.
// This is loaded after data.js and before the React screens so the original
// app shell can be reused without changing the historical p7v1/p8v1 study.
const FULLSCALE_AUDIO = {
  mc01: { stage1: "mc01_stage1.flac", noq: "mc01_noq.flac", k2: "mc01_k2.flac", k3: "mc01_k3.flac" },
  mc02: { stage1: "mc02_stage1.flac", noq: "mc02_noq.flac", k2: "mc02_k2.flac", k3: "mc02_k3.flac" },
  mc03: { stage1: "mc03_stage1.flac", noq: "mc03_noq.flac", k2: "mc03_k2.flac", k3: "mc03_k3.flac" },
  mc04: { stage1: "mc04_stage1.flac", noq: "mc04_noq.flac", k2: "mc04_k2.flac", k3: "mc04_k3.flac" },
  mc05: { stage1: "mc05_stage1.flac", noq: "mc05_noq.flac", k2: "mc05_k2.flac", k3: "mc05_k3.flac" },
  mc06: { stage1: "mc06_stage1.flac", noq: "mc06_noq.flac", k2: "mc06_k2.flac", k3: "mc06_k3.flac" },
  mc07: { stage1: "mc07_stage1.flac", noq: "mc07_noq.flac", k2: "mc07_k2.flac", k3: "mc07_k3.flac" },
  mc08: { stage1: "mc08_stage1.flac", noq: "mc08_noq.flac", k2: "mc08_k2.flac", k3: "mc08_k3.flac" },
  mc09: { stage1: "mc09_stage1.flac", noq: "mc09_noq.flac", k2: "mc09_k2.flac", k3: "mc09_k3.flac" },
  mc10: { stage1: "mc10_stage1.flac", noq: "mc10_noq.flac", k2: "mc10_k2.flac", k3: "mc10_k3.flac" },
  mc11: { stage1: "mc11_stage1.flac", noq: "mc11_noq.flac", k2: "mc11_k2.flac", k3: "mc11_k3.flac" },
  mc12: { stage1: "mc12_stage1.flac", noq: "mc12_noq.flac", k2: "mc12_k2.flac", k3: "mc12_k3.flac" },
  mc13: { stage1: "mc13_stage1.flac", noq: "mc13_noq.flac", k2: "mc13_k2.flac", k3: "mc13_k3.flac" },
  mc14: { stage1: "mc14_stage1.flac", noq: "mc14_noq.flac", k2: "mc14_k2.flac", k3: "mc14_k3.flac" },
  mc15: { stage1: "mc15_stage1.flac", noq: "mc15_noq.flac", k2: "mc15_k2.flac", k3: "mc15_k3.flac" },
  mc16: { stage1: "mc16_stage1.flac", noq: "mc16_noq.flac", k2: "mc16_k2.flac", k3: "mc16_k3.flac" },
  mc17: { stage1: "mc17_stage1.flac", noq: "mc17_noq.flac", k2: "mc17_k2.flac", k3: "mc17_k3.flac" },
  mc18: { stage1: "mc18_stage1.flac", noq: "mc18_noq.flac", k2: "mc18_k2.flac", k3: "mc18_k3.flac" },
  mc19: { stage1: "mc19_stage1.flac", noq: "mc19_noq.flac", k2: "mc19_k2.flac", k3: "mc19_k3.flac" },
  mc20: { stage1: "mc20_stage1.flac", noq: "mc20_noq.flac", k2: "mc20_k2.flac", k3: "mc20_k3.flac" },
  mc21: { stage1: "mc21_stage1.flac", noq: "mc21_noq.flac", k2: "mc21_k2.flac", k3: "mc21_k3.flac" },
  mc22: { stage1: "mc22_stage1.flac", noq: "mc22_noq.flac", k2: "mc22_k2.flac", k3: "mc22_k3.flac" },
  mc23: { stage1: "mc23_stage1.flac", noq: "mc23_noq.flac", k2: "mc23_k2.flac", k3: "mc23_k3.flac" },
  mc24: { stage1: "mc24_stage1.flac", noq: "mc24_noq.flac", k2: "mc24_k2.flac", k3: "mc24_k3.flac" },
  mc25: { stage1: "mc25_stage1.flac", noq: "mc25_noq.flac", k2: "mc25_k2.flac", k3: "mc25_k3.flac" },
  mc26: { stage1: "mc26_stage1.flac", noq: "mc26_noq.flac", k2: "mc26_k2.flac", k3: "mc26_k3.flac" },
  mc27: { stage1: "mc27_stage1.flac", noq: "mc27_noq.flac", k2: "mc27_k2.flac", k3: "mc27_k3.flac" },
  mc28: { stage1: "mc28_stage1.flac", noq: "mc28_noq.flac", k2: "mc28_k2.flac", k3: "mc28_k3.flac" },
  mc29: { stage1: "mc29_stage1.flac", noq: "mc29_noq.flac", k2: "mc29_k2.flac", k3: "mc29_k3.flac" },
  mc30: { stage1: "mc30_stage1.flac", noq: "mc30_noq.flac", k2: "mc30_k2.flac", k3: "mc30_k3.flac" },
};

DATA.project = "audio_ab_test_stage1_noq_k2_k3_fullscale";
DATA.projectLabel = "Stage 1 · NoQ · K2 · K3";
DATA.variants = ["stage1", "noq", "k2", "k3"];
DATA.roundSize = 12;
DATA.variantDescriptions = {
  stage1: { shortName: "S1", displayName: "Stage 1", en: "400k-step Stage 1 baseline.", zh: "400k iter 的 Stage 1 baseline。" },
  noq: { shortName: "NoQ", displayName: "NoQ S2", en: "Full NoQ Stage 2 baseline.", zh: "完整 NoQ Stage 2 baseline。" },
  k2: { shortName: "K2", displayName: "K2 balanced", en: "Full K2 balanced Q conditioning.", zh: "完整 K2 balanced Q conditioning。" },
  k3: { shortName: "K3", displayName: "K3 balanced", en: "Full K3 balanced Q conditioning.", zh: "完整 K3 balanced Q conditioning。" },
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
