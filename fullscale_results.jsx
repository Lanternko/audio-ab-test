// Four-system Results screen for the full-scale listening study.
// The original app's Results view is intentionally two-variant; this view
// keeps the same submission schema while aggregating scores over all six
// pairings among Stage 1, NoQ, K2, and K3.
const FSResultsReact = React;
const { useEffect: useEffectFS, useState: useStateFS } = FSResultsReact;

function fullscaleScores(answers, metric, questions) {
  const scores = Object.fromEntries(DATA.variants.map(v => [v, 0]));
  const wins = Object.fromEntries(DATA.variants.map(v => [v, 0]));
  let ties = 0;
  questions.forEach(q => {
    const a = answers[q.id];
    if (!a || a[metric] == null) return;
    const value = Number(a[metric]);
    if (value === 0) { ties++; return; }
    const winner = value > 0 ? q.aLabel : q.bLabel;
    scores[winner] += Math.abs(value);
    wins[winner] += 1;
  });
  return { scores, wins, ties };
}

function fullscalePayload(state, questions, clientIp) {
  const metrics = getMetrics("en");
  const log = questions.map(q => {
    const a = state.answers[q.id] || {};
    return {
      questionId: q.id,
      clipId: q.clipId,
      title: q.title,
      prompt: q.desc,
      aFile: q.aFileName,
      bFile: q.bFileName,
      aLabel: q.aLabel,
      bLabel: q.bLabel,
      audioQuality: a.audioQuality ?? null,
      promptFollowing: a.promptFollowing ?? null,
      ratedAt: a.updatedAt || null,
    };
  });
  const summary = {};
  metrics.forEach(m => {
    const s = fullscaleScores(state.answers, m.key, questions);
    summary[m.key] = { scores: s.scores, wins: s.wins, ties: s.ties };
  });
  const now = new Date().toISOString();
  return {
    schemaVersion: "v4-cmos7pt-2metrics-pool-rounds-clientid",
    submissionId: makeSubmissionId(),
    project: DATA.project,
    projectLabel: DATA.projectLabel,
    variants: DATA.variants.slice(),
    participant: state.participant,
    roundIndex: state.roundIndex || 1,
    roundSize: questions.length,
    poolSize: DATA.pool.length,
    poolResetThisRound: !!state.poolResetThisRound,
    selection: questions.map(q => q.clipId),
    startedAt: state.startedAt,
    completedAt: now,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    clientId: getClientId(),
    clientIp: clientIp || "",
    totalQuestions: questions.length,
    answeredQuestions: questions.filter(q => isAnswered(state.answers[q.id])).length,
    metrics: metrics.map(m => m.key),
    scale: "cmos-7-point (-3..+3; positive=A preferred, negative=B preferred)",
    log,
    summary,
  };
}

function FullscaleResults({ state, setState, goto, lang }) {
  const copy = getText(lang);
  const questions = roundQuestions(state);
  const answered = questions.filter(q => isAnswered(state.answers[q.id])).length;
  const [submitState, setSubmitState] = useStateFS({ phase: "idle", message: "" });
  const submitUrl = (typeof window !== "undefined" && window.SUBMIT_URL) || "";

  const download = payload => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safe = (state.participant || "anonymous").replace(/[^\p{Letter}\p{Number}_-]+/gu, "_");
    link.href = url;
    link.download = `${DATA.project}__${safe}__r${state.roundIndex || 1}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const submit = async () => {
    const payload = fullscalePayload(state, questions, await fetchClientIp());
    if (!submitUrl) {
      download(payload);
      setSubmitState({ phase: "ok", message: "JSON 已下載；目前為 export-only 模式。" });
      setState(s => ({ ...s, submitted: true, submitting: false }));
      return;
    }
    setSubmitState({ phase: "uploading", message: "正在提交結果…" });
    try {
      await uploadSubmission(payload, submitUrl);
      setSubmitState({ phase: "ok", message: "結果已提交。" });
      setState(s => ({ ...s, submitted: true, submitting: false }));
    } catch (err) {
      download(payload);
      setSubmitState({ phase: "err", message: `提交失敗，已下載備份：${err.message}` });
    }
  };

  useEffectFS(() => {
    if (state.submitting && !state.submitted && submitState.phase === "idle" && answered === questions.length) submit();
  }, [state.submitting, state.submitted, answered, questions.length]);

  if (!questions.length) return <div className="canvas canvas-compact"><h1>{copy.results.noRound}</h1></div>;

  return (
    <div className="canvas fullscale-results">
      <div className="results-head">
        <div className="title-block">
          <div className="eyebrow">Full-scale · {state.participant || "anonymous"}</div>
          <h1>Results</h1>
        </div>
        <div className="summary-metric"><div className="num">{answered}<span className="denom"> / {questions.length}</span></div><div className="caption">questions rated</div></div>
      </div>

      <div className="ab-diff-card">
        <h3>Four systems · six blind pairings</h3>
        <div className="ab-diff-row">
          {DATA.variants.map(v => <div key={v} className="ab-diff-item"><span className="ab-diff-label">{variantLabel(v)}</span><span className="ab-diff-desc">{DATA.variantDescriptions[v].en}</span></div>)}
        </div>
      </div>

      {getMetrics(lang).map(metric => {
        const result = fullscaleScores(state.answers, metric.key, questions);
        const best = Math.max(...DATA.variants.map(v => result.scores[v]));
        return (
          <div className="metric-card" key={metric.key}>
            <div className="metric-head"><h2>{metric.label}</h2><div className="metric-sub">weighted CMOS points · ties: {result.ties}</div></div>
            <div className="score-row">
              {DATA.variants.map(v => <div className={`score-card ${result.scores[v] === best && best > 0 ? "winner" : ""}`} key={v}><div className="score-label">{variantLabel(v)}</div><div className="score-value">{result.scores[v]}<span className="score-sub"> points</span></div><div className="score-breakdown">preferred in {result.wins[v]} pairings</div></div>)}
            </div>
          </div>
        );
      })}

      <div className="reveal-table">
        <div className="reveal-row header"><div>#</div><div>Prompt</div><div>AQ</div><div>PF</div><div>A / B identity</div></div>
        {questions.map(q => { const a = state.answers[q.id] || {}; return <div className="reveal-row" key={q.id}><div className="num-cell">Q{String(q.id).padStart(2, "0")}</div><div className="title-cell">{q.title}<span className="sub">{q.desc.length > 80 ? q.desc.slice(0, 80) + "…" : q.desc}</span></div><div className="rating-cell">{formatVal(a.audioQuality)}</div><div className="rating-cell">{formatVal(a.promptFollowing)}</div><div className="reveal-cell"><span className="pill">A · {variantLabel(q.aLabel)}</span><span className="pill">B · {variantLabel(q.bLabel)}</span></div></div>; })}
      </div>

      <div className="meta-card"><div className="msg">{submitState.message || (submitUrl ? "結果將提交至 Google Sheets。" : "結果會下載成 JSON。")}</div><div className="actions"><button className="btn" onClick={async () => download(fullscalePayload(state, questions, await fetchClientIp()))}>Download JSON</button>{submitState.phase === "err" && <button className="btn btn-primary" onClick={submit}>Retry</button>}</div></div>
    </div>
  );
}

window.Results = FullscaleResults;
Results = FullscaleResults;
