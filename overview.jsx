// Overview + Results screens

const { useEffect: useEffectOV, useState: useStateOV } = React;

const SCHEMA_VERSION = "v4-cmos7pt-2metrics-pool-rounds-clientid";

function makeSubmissionId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Persistent per-browser ID so we can tell if the same device submits twice.
// Not tied to identity — cleared localStorage or a different browser resets it.
function getClientId() {
  try {
    const KEY = "abtest.clientId";
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch (_err) {
    return "";
  }
}

// Best-effort public IP lookup. Returns "" on any failure / timeout so a
// flaky IP service never blocks submission.
async function fetchClientIp() {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2000);
    const res = await fetch("https://api.ipify.org?format=json", { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return "";
    const data = await res.json();
    return (data && data.ip) || "";
  } catch (_err) {
    return "";
  }
}

// POST the payload as text/plain to avoid a CORS preflight — Apps Script
// web apps handle this correctly while rejecting application/json preflights.
async function uploadSubmission(payload, url) {
  const res = await fetch(url, {
    method: "POST",
    mode: "cors",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const raw = await res.text();
  try {
    const data = JSON.parse(raw);
    if (data && data.ok === false) throw new Error(data.error || "server rejected");
    return data;
  } catch (_parseErr) {
    return { ok: true, raw };
  }
}

function formatVal(val) {
  if (val == null) return "—";
  return val > 0 ? `+${val}` : `${val}`;
}

function isAnswered(a) {
  return a && a.audioQuality != null && a.promptFollowing != null;
}

// Expand state.selection + state.abMap into rendered question objects
// (used by Overview, Results, and the export payload).
function roundQuestions(state) {
  if (!state.selection) return [];
  return state.selection.map((poolIdx, pos) => {
    const item = DATA.pool[poolIdx];
    return buildQuestion(item, pos + 1, state.abMap[pos], DATA.variants);
  });
}

function Overview({ state, setState, goto, lang, requestViewResults }) {
  const copy = getText(lang);
  const questions = roundQuestions(state);
  const roundSize = questions.length;
  const answered = Object.values(state.answers).filter(isAnswered).length;
  const remaining = roundSize - answered;

  return (
    <div className="canvas">
      <div className="view-head">
        <div>
          <div className="eyebrow">{copy.overview.eyebrow(state.roundIndex || 1)}</div>
          <h1>{copy.overview.title}</h1>
        </div>
        <div className="lede">{copy.overview.lede}</div>
      </div>

      <div className="stats-strip">
        <div className="stat">
          <div className="label">{copy.overview.answered}</div>
          <div className="value"><em>{answered}</em><span className="suffix">/ {roundSize}</span></div>
        </div>
        <div className="stat">
          <div className="label">{copy.overview.participantRound}</div>
          <div className="value" style={{fontSize: 22, fontFamily: "var(--font-serif)"}}>
            {state.participant || "—"}
          </div>
        </div>
        <div className="stat">
          <div className="label">{copy.overview.status}</div>
          <div className="value" style={{fontSize: 22, fontFamily: "var(--font-serif)"}}>
            {answered === roundSize && roundSize > 0 ? copy.overview.readyToReveal : answered === 0 ? copy.overview.notStarted : copy.overview.inProgress}
          </div>
        </div>
      </div>

      <div className="overview-grid">
        {questions.map((q, i) => {
          const a = state.answers[q.id] || {};
          const done = isAnswered(a);
          const isCurrent = i === state.currentIdx;
          return (
            <div
              key={i}
              className={`q-card ${done ? "answered" : ""} ${isCurrent ? "current" : ""}`}
              onClick={() => { setState(s => ({...s, currentIdx: i})); goto("runner"); }}
            >
              <div className="q-num">Q{String(q.id).padStart(2, "0")} / {roundSize}</div>
              <div className="q-title">{q.title}</div>
              <div className="q-tag">{q.desc.length > 68 ? q.desc.slice(0, 68) + "…" : q.desc}</div>
              <div className="q-spacer" />
              {done ? (
                <div className="q-ratings">
                  <div className="q-metric"><span>AQ</span><strong>{formatVal(a.audioQuality)}</strong></div>
                  <div className="q-metric"><span>PF</span><strong>{formatVal(a.promptFollowing)}</strong></div>
                </div>
              ) : (
                <div className="q-pending">{copy.overview.notRated}</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="overview-actions">
        <div className="msg">
          {answered === roundSize && roundSize > 0 ? (
            <><strong>{lang === "zh" ? "全部完成。" : "All done."}</strong> {copy.overview.allDone}</>
          ) : (
            <>{copy.overview.remaining(remaining)}</>
          )}
        </div>
        <div className="overview-actions-buttons">
          <button className="btn" onClick={() => goto("runner")}>{copy.overview.continue}</button>
          <button
            className="btn btn-primary"
            onClick={() => requestViewResults && requestViewResults()}
            disabled={answered < roundSize || roundSize === 0 || state.submitting || state.submitted}
          >
            {copy.overview.viewResults}
          </button>
        </div>
      </div>
    </div>
  );
}

function computeDist(answers, metric, leftL, rightL, questions) {
  const dist = {
    [`${leftL}_3`]: 0, [`${leftL}_2`]: 0, [`${leftL}_1`]: 0,
    tie: 0,
    [`${rightL}_1`]: 0, [`${rightL}_2`]: 0, [`${rightL}_3`]: 0,
  };
  questions.forEach(q => {
    const a = answers[q.id];
    if (!a) return;
    const val = a[metric];
    if (val == null) return;
    if (val === 0) { dist.tie++; return; }
    const prefLabel = val > 0 ? q.aLabel : q.bLabel;
    dist[`${prefLabel}_${Math.abs(val)}`]++;
  });
  return dist;
}

function computeScores(answers, metric, leftL, rightL, questions) {
  const scores = { [leftL]: 0, [rightL]: 0 };
  questions.forEach(q => {
    const a = answers[q.id];
    if (!a) return;
    const val = a[metric];
    if (val == null || val === 0) return;
    if (val > 0) {
      scores[q.aLabel] = (scores[q.aLabel] || 0) + val;
    } else {
      scores[q.bLabel] = (scores[q.bLabel] || 0) + Math.abs(val);
    }
  });
  return scores;
}

function MetricCard({ metric, answers, leftL, rightL, questions, lang }) {
  const copy = getText(lang);
  const dist = computeDist(answers, metric.key, leftL, rightL, questions);
  const scores = computeScores(answers, metric.key, leftL, rightL, questions);
  const leader = scores[leftL] === scores[rightL] ? null
    : scores[leftL] > scores[rightL] ? leftL : rightL;

  const lLabel = variantLabel(leftL);
  const rLabel = variantLabel(rightL);
  const segs = [
    { key: `${leftL}_3`,  label: `${lLabel} +3` },
    { key: `${leftL}_2`,  label: `${lLabel} +2` },
    { key: `${leftL}_1`,  label: `${lLabel} +1` },
    { key: "tie",          label: copy.results.tie },
    { key: `${rightL}_1`, label: `${rLabel} +1` },
    { key: `${rightL}_2`, label: `${rLabel} +2` },
    { key: `${rightL}_3`, label: `${rLabel} +3` },
  ];

  return (
    <div className="metric-card">
      <div className="metric-head">
        <h2>{metric.label}</h2>
        <div className="metric-sub">{metric.hint}</div>
      </div>
      <div className="score-row">
        <div className={`score-card score-a ${leader === leftL ? "winner" : ""}`}>
          <div className="score-label">{lLabel}</div>
          <div className="score-value">{scores[leftL]}<span className="score-sub"> {copy.results.points}</span></div>
          <div className="score-breakdown">
            +3 × {dist[`${leftL}_3`]} · +2 × {dist[`${leftL}_2`]} · +1 × {dist[`${leftL}_1`]}
          </div>
        </div>
        <div className="score-card score-tie">
          <div className="score-label">{copy.results.tie}</div>
          <div className="score-value">{dist.tie}<span className="score-sub"> {copy.results.questionsUnit}</span></div>
          <div className="score-breakdown">{copy.results.tieCaption}</div>
        </div>
        <div className={`score-card score-b ${leader === rightL ? "winner" : ""}`}>
          <div className="score-label">{rLabel}</div>
          <div className="score-value">{scores[rightL]}<span className="score-sub"> {copy.results.points}</span></div>
          <div className="score-breakdown">
            +3 × {dist[`${rightL}_3`]} · +2 × {dist[`${rightL}_2`]} · +1 × {dist[`${rightL}_1`]}
          </div>
        </div>
      </div>
      <div className="dist-bar">
        {segs.map(s => {
          const n = dist[s.key] || 0;
          return (
            <div
              key={s.key}
              className="dist-seg"
              style={{ flex: `${n || 0.001}`, minWidth: n ? 60 : 2 }}
            >
              {n > 0 && `${s.label} · ${n}`}
            </div>
          );
        })}
      </div>
      <div className="dist-legend">
        <span className="a">← {copy.results.preferLeft(lLabel)}</span>
        <span>{copy.results.tie.toLowerCase ? copy.results.tie.toLowerCase() : copy.results.tie}</span>
        <span className="b">{copy.results.preferRight(rLabel)} →</span>
      </div>
    </div>
  );
}

function Results({ state, setState, goto, finishAndStartNext, lang }) {
  const copy = getText(lang);
  const metrics = getMetrics(lang);
  useEffectOV(() => {
    if (!state.revealed) setState(s => ({ ...s, revealed: true }));
  }, []);

  const [submitState, setSubmitState] = useStateOV({ phase: "idle", message: "" });

  const questions = roundQuestions(state);
  const roundSize = questions.length;
  const [leftL, rightL] = DATA.variants;

  const answered = Object.values(state.answers).filter(isAnswered).length;
  const submitUrl = (typeof window !== "undefined" && window.SUBMIT_URL) || "";
  const hasEndpoint = !!submitUrl;

  // If user lands on Results without having pressed "View Results" first,
  // bounce them back so they must go through the confirm + submit flow.
  useEffectOV(() => {
    if (roundSize > 0 && !state.submitting && !state.submitted) {
      goto(answered === roundSize ? "overview" : "runner");
    }
  }, []);

  const buildPayload = (clientIp = "") => {
    const now = new Date().toISOString();
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
      summary[m.key] = {
        scores: computeScores(state.answers, m.key, leftL, rightL, questions),
        dist:   computeDist(state.answers, m.key, leftL, rightL, questions),
      };
    });
    return {
      schemaVersion: SCHEMA_VERSION,
      submissionId: makeSubmissionId(),
      project: DATA.project,
      projectLabel: DATA.projectLabel,
      variants: [leftL, rightL],
      participant: state.participant,
      roundIndex: state.roundIndex || 1,
      roundSize,
      poolSize: DATA.pool.length,
      poolResetThisRound: !!state.poolResetThisRound,
      selection: questions.map(q => q.clipId),
      startedAt: state.startedAt,
      completedAt: now,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      clientId: getClientId(),
      clientIp: clientIp || "",
      totalQuestions: roundSize,      // kept for backwards-compat with any consumer reading this
      answeredQuestions: answered,
      metrics: metrics.map(m => m.key),
      scale: "cmos-7-point (-3..+3; positive=A preferred, negative=B preferred)",
      log,
      summary,
    };
  };

  const downloadJSON = (payload) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safe = (state.participant || copy.common.anonymous).replace(/[^\p{Letter}\p{Number}_-]+/gu, "_");
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    link.href = url;
    link.download = `${DATA.project}__${safe}__r${state.roundIndex || 1}__${ts}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = async () => downloadJSON(buildPayload(await fetchClientIp()));

  // Auto-submit runs once on mount when the user has pressed View Results
  // (state.submitting = true) but upload hasn't completed yet.
  const runUpload = async () => {
    const payload = buildPayload(await fetchClientIp());

    if (!hasEndpoint) {
      downloadJSON(payload);
      setSubmitState({ phase: "ok", message: copy.results.exported(state.roundIndex || 1) });
      setState(s => ({ ...s, submitted: true, submitting: false }));
      return;
    }

    setSubmitState({ phase: "uploading", message: copy.results.uploading });
    try {
      await uploadSubmission(payload, submitUrl);
      setSubmitState({ phase: "ok", message: copy.results.submitted(state.roundIndex || 1, payload.submissionId.slice(0, 8)) });
      setState(s => ({ ...s, submitted: true, submitting: false }));
    } catch (err) {
      console.error("Upload failed", err);
      downloadJSON(payload);
      setSubmitState({
        phase: "err",
        message: copy.results.uploadFailed(err.message),
      });
    }
  };

  useEffectOV(() => {
    if (roundSize > 0 && state.submitting && !state.submitted && submitState.phase === "idle") {
      runUpload();
    }
  }, [state.submitting, state.submitted, roundSize]);

  const retryUpload = async () => {
    const payload = buildPayload(await fetchClientIp());
    setSubmitState({ phase: "uploading", message: copy.results.retrying });
    try {
      await uploadSubmission(payload, submitUrl);
      setSubmitState({ phase: "ok", message: copy.results.submitted(state.roundIndex || 1, payload.submissionId.slice(0, 8)) });
      setState(s => ({ ...s, submitted: true, submitting: false }));
    } catch (err) {
      setSubmitState({ phase: "err", message: copy.results.retryFailed(err.message) });
    }
  };

  const startNextRound = () => {
    const clipIds = questions.map(q => q.clipId);
    const poolReset = !!state.poolResetThisRound;
    finishAndStartNext && finishAndStartNext(clipIds, poolReset);
  };

  if (roundSize === 0) {
    return (
      <div className="canvas">
        <div className="results-head">
          <div className="title-block">
            <h1>{copy.results.noRound}</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="canvas">
      <div className="results-head">
        <div className="title-block">
          <div className="eyebrow">{copy.results.eyebrow(state.roundIndex || 1, state.participant || copy.common.anonymous)}</div>
          <h1>{copy.results.title}</h1>
        </div>
        <div className="summary-metric">
          <div className="num">{answered}<span className="denom"> / {roundSize}</span></div>
          <div className="caption">{copy.results.questionsRated}</div>
        </div>
      </div>

      {metrics.map(m => (
        <MetricCard key={m.key} metric={m} answers={state.answers} leftL={leftL} rightL={rightL} questions={questions} lang={lang} />
      ))}

      <div className="ab-diff-card">
        <h3>{copy.results.abDiffTitle}</h3>
        {copy.results.abDiffIntro && (
          <p className="ab-diff-intro">{copy.results.abDiffIntro}</p>
        )}
        <div className="ab-diff-row">
          {[leftL, rightL].map(v => (
            <div key={v} className={`ab-diff-item ${v === leftL ? "left" : "right"}`}>
              <span className="ab-diff-label">
                {DATA.variantDescriptions?.[v]?.displayName || v}
              </span>
              <span className="ab-diff-desc">
                {lang === "zh"
                  ? (DATA.variantDescriptions?.[v]?.zh || v)
                  : (DATA.variantDescriptions?.[v]?.en || v)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="reveal-table">
        <div className="reveal-row header">
          <div>{copy.results.table.number}</div>
          <div>{copy.results.table.question}</div>
          <div>{copy.results.table.aq}</div>
          <div>{copy.results.table.pf}</div>
          <div>{copy.results.table.identity}</div>
        </div>
        {questions.map(q => {
          const a = state.answers[q.id] || {};
          return (
            <div key={q.id} className="reveal-row">
              <div className="num-cell">Q{String(q.id).padStart(2, "0")}</div>
              <div className="title-cell">
                {q.title}
                <span className="sub">{q.desc.length > 80 ? q.desc.slice(0, 80) + "…" : q.desc}</span>
              </div>
              <div className="rating-cell">{formatVal(a.audioQuality)}</div>
              <div className="rating-cell">{formatVal(a.promptFollowing)}</div>
              <div className="reveal-cell">
                <span className="pill">A · {variantLabel(q.aLabel)}</span>
                <span className="pill">B · {variantLabel(q.bLabel)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="meta-card">
        <div className="msg">
          {hasEndpoint ? copy.results.submitMessage : copy.results.exportMessage}
        </div>
        <div className="actions">
          {submitState.phase === "err" ? (
            <button className="btn btn-primary" onClick={retryUpload}>
              {copy.results.retry}
            </button>
          ) : submitState.phase === "uploading" ? (
            <button className="btn btn-primary" disabled>
              {copy.results.uploading}
            </button>
          ) : null}
          <button className="btn" onClick={exportJSON} disabled={submitState.phase === "uploading"}>
            {hasEndpoint ? copy.results.backup : copy.results.downloadOnly}
          </button>
        </div>
        {submitState.phase === "err" || submitState.phase === "uploading" ? (
          <div className={`submit-status submit-status-${submitState.phase}`}>
            {submitState.message}
          </div>
        ) : null}
      </div>
    </div>
  );
}

window.Overview = Overview;
window.Results = Results;
