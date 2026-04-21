// Overview + Results screens

const { useEffect: useEffectOV, useState: useStateOV } = React;

const SCHEMA_VERSION = "v2-cmos7pt-2metrics";

function makeSubmissionId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
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
    // Non-JSON but 2xx — treat as success
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

function Overview({ state, setState, goto }) {
  const answered = Object.values(state.answers).filter(isAnswered).length;
  const remaining = DATA.totalQuestions - answered;

  return (
    <div className="canvas">
      <div className="view-head">
        <div>
          <div className="eyebrow">{DATA.projectLabel} · Overview</div>
          <h1>Question <em>overview</em></h1>
        </div>
        <div className="lede">
          Each card is one question. Rated cards show your scores for audio quality (AQ) and prompt following (PF).
          True A / B identities are revealed once all questions are answered.
        </div>
      </div>

      <div className="stats-strip">
        <div className="stat">
          <div className="label">Answered</div>
          <div className="value"><em>{answered}</em><span className="suffix">/ {DATA.totalQuestions}</span></div>
        </div>
        <div className="stat">
          <div className="label">Participant</div>
          <div className="value" style={{fontSize: 22, fontFamily: "var(--font-serif)"}}>{state.participant || "—"}</div>
        </div>
        <div className="stat">
          <div className="label">Status</div>
          <div className="value" style={{fontSize: 22, fontFamily: "var(--font-serif)"}}>
            {answered === DATA.totalQuestions ? "Ready to reveal" : answered === 0 ? "Not started" : "In progress"}
          </div>
        </div>
      </div>

      <div className="overview-grid">
        {DATA.questions.map((q, i) => {
          const a = state.answers[q.id] || {};
          const done = isAnswered(a);
          const isCurrent = i === state.currentIdx;
          return (
            <div
              key={q.id}
              className={`q-card ${done ? "answered" : ""} ${isCurrent ? "current" : ""}`}
              onClick={() => { setState(s => ({...s, currentIdx: i})); goto("runner"); }}
            >
              <div className="q-num">Q{String(q.id).padStart(2, "0")} / {DATA.totalQuestions}</div>
              <div className="q-title">{q.title}</div>
              <div className="q-tag">{q.desc.length > 68 ? q.desc.slice(0, 68) + "…" : q.desc}</div>
              <div className="q-spacer" />
              {done ? (
                <div className="q-ratings">
                  <div className="q-metric"><span>AQ</span><strong>{formatVal(a.audioQuality)}</strong></div>
                  <div className="q-metric"><span>PF</span><strong>{formatVal(a.promptFollowing)}</strong></div>
                </div>
              ) : (
                <div className="q-pending">Not rated — click to open</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="overview-actions">
        <div className="msg">
          {answered === DATA.totalQuestions ? (
            <><strong>All done.</strong> Ready to reveal A / B identities?</>
          ) : (
            <><strong>{remaining}</strong> question{remaining === 1 ? "" : "s"} remaining — listen through before rating.</>
          )}
        </div>
        <div style={{display: "flex", gap: 8}}>
          <button className="btn" onClick={() => goto("runner")}>Continue</button>
          <button className="btn btn-primary" onClick={() => goto("results")} disabled={answered < DATA.totalQuestions}>
            Reveal results
          </button>
        </div>
      </div>
    </div>
  );
}

function computeDist(answers, metric, leftL, rightL) {
  const dist = {
    [`${leftL}_3`]: 0, [`${leftL}_2`]: 0, [`${leftL}_1`]: 0,
    tie: 0,
    [`${rightL}_1`]: 0, [`${rightL}_2`]: 0, [`${rightL}_3`]: 0,
  };
  DATA.questions.forEach(q => {
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

function computeScores(answers, metric, leftL, rightL) {
  const scores = { [leftL]: 0, [rightL]: 0 };
  DATA.questions.forEach(q => {
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

function MetricCard({ metric, answers, leftL, rightL }) {
  const dist = computeDist(answers, metric.key, leftL, rightL);
  const scores = computeScores(answers, metric.key, leftL, rightL);
  const leader = scores[leftL] === scores[rightL] ? null
    : scores[leftL] > scores[rightL] ? leftL : rightL;

  const segs = [
    { key: `${leftL}_3`,  label: `${leftL} +3` },
    { key: `${leftL}_2`,  label: `${leftL} +2` },
    { key: `${leftL}_1`,  label: `${leftL} +1` },
    { key: "tie",          label: "tie" },
    { key: `${rightL}_1`, label: `${rightL} +1` },
    { key: `${rightL}_2`, label: `${rightL} +2` },
    { key: `${rightL}_3`, label: `${rightL} +3` },
  ];

  return (
    <div className="metric-card">
      <div className="metric-head">
        <h2>{metric.label}</h2>
        <div className="metric-sub">{metric.hint}</div>
      </div>
      <div className="score-row">
        <div className={`score-card score-a ${leader === leftL ? "winner" : ""}`}>
          <div className="score-label">{leftL}</div>
          <div className="score-value">{scores[leftL]}<span className="score-sub"> pts</span></div>
          <div className="score-breakdown">
            +3 × {dist[`${leftL}_3`]} · +2 × {dist[`${leftL}_2`]} · +1 × {dist[`${leftL}_1`]}
          </div>
        </div>
        <div className="score-card score-tie">
          <div className="score-label">Tie</div>
          <div className="score-value">{dist.tie}<span className="score-sub"> Qs</span></div>
          <div className="score-breakdown">about the same</div>
        </div>
        <div className={`score-card score-b ${leader === rightL ? "winner" : ""}`}>
          <div className="score-label">{rightL}</div>
          <div className="score-value">{scores[rightL]}<span className="score-sub"> pts</span></div>
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
        <span className="a">← prefer {leftL}</span>
        <span>tie</span>
        <span className="b">prefer {rightL} →</span>
      </div>
    </div>
  );
}

function Results({ state, setState, goto }) {
  useEffectOV(() => {
    if (!state.revealed) setState(s => ({ ...s, revealed: true }));
  }, []);

  const [submitState, setSubmitState] = useStateOV({ phase: "idle", message: "" });

  const variants = [...new Set(DATA.questions.flatMap(q => [q.aLabel, q.bLabel]))].sort();
  const leftL  = variants[0] || "A";
  const rightL = variants[1] || "B";

  const answered = Object.values(state.answers).filter(isAnswered).length;
  const submitUrl = (typeof window !== "undefined" && window.SUBMIT_URL) || "";
  const hasEndpoint = !!submitUrl;

  const buildPayload = () => {
    const now = new Date().toISOString();
    const log = DATA.questions.map(q => {
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
    METRICS.forEach(m => {
      summary[m.key] = {
        scores: computeScores(state.answers, m.key, leftL, rightL),
        dist:   computeDist(state.answers, m.key, leftL, rightL),
      };
    });
    return {
      schemaVersion: SCHEMA_VERSION,
      submissionId: makeSubmissionId(),
      project: DATA.project,
      projectLabel: DATA.projectLabel,
      variants: [leftL, rightL],
      participant: state.participant,
      startedAt: state.startedAt,
      completedAt: now,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      totalQuestions: DATA.totalQuestions,
      answeredQuestions: answered,
      metrics: METRICS.map(m => m.key),
      scale: "cmos-7-point (-3..+3; positive=A preferred, negative=B preferred)",
      log,
      summary,
    };
  };

  const downloadJSON = (payload) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safe = (state.participant || "anonymous").replace(/[^A-Za-z0-9_-]+/g, "_");
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    link.href = url;
    link.download = `${DATA.project}__${safe}__${ts}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => downloadJSON(buildPayload());

  const submitAndReset = async () => {
    const payload = buildPayload();

    // No cloud endpoint → old behavior: export + reset
    if (!hasEndpoint) {
      if (!confirm("No cloud endpoint configured. Export JSON and start a new participant?")) return;
      downloadJSON(payload);
      setState({ participant: "", startedAt: null, currentIdx: 0, answers: {}, revealed: false });
      return;
    }

    if (!confirm(`Submit ratings for "${state.participant}" to the coordinator?`)) return;

    setSubmitState({ phase: "uploading", message: "Uploading…" });
    try {
      await uploadSubmission(payload, submitUrl);
      setSubmitState({ phase: "ok", message: `Submitted · id ${payload.submissionId.slice(0, 8)}` });
      // Give the user a beat to read the confirmation, then reset for the next participant.
      setTimeout(() => {
        setState({ participant: "", startedAt: null, currentIdx: 0, answers: {}, revealed: false });
      }, 1500);
    } catch (err) {
      console.error("Upload failed", err);
      // Auto-download as backup so the data is never lost.
      downloadJSON(payload);
      setSubmitState({
        phase: "err",
        message: `Upload failed: ${err.message}. A JSON backup was downloaded — please email it to the coordinator.`,
      });
    }
  };

  const aqScores = computeScores(state.answers, "audioQuality", leftL, rightL);
  const pfScores = computeScores(state.answers, "promptFollowing", leftL, rightL);
  const aqLeader = aqScores[leftL] === aqScores[rightL] ? "tie"
    : aqScores[leftL] > aqScores[rightL] ? leftL : rightL;
  const pfLeader = pfScores[leftL] === pfScores[rightL] ? "tie"
    : pfScores[leftL] > pfScores[rightL] ? leftL : rightL;

  return (
    <div className="canvas">
      <div className="results-head">
        <div className="title-block">
          <div className="eyebrow">{DATA.projectLabel} · Reveal · {state.participant || "anonymous"}</div>
          <h1>Results · <em>AQ: {aqLeader}</em> · <em>PF: {pfLeader}</em></h1>
        </div>
        <div className="summary-metric">
          <div className="num">{answered}<span className="denom"> / {DATA.totalQuestions}</span></div>
          <div className="caption">Questions rated</div>
        </div>
      </div>

      {METRICS.map(m => (
        <MetricCard key={m.key} metric={m} answers={state.answers} leftL={leftL} rightL={rightL} />
      ))}

      <div className="reveal-table">
        <div className="reveal-row header">
          <div>#</div>
          <div>Question</div>
          <div>AQ</div>
          <div>PF</div>
          <div>Identity · A / B</div>
        </div>
        {DATA.questions.map(q => {
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
                <span className="pill">A · {q.aLabel}</span>
                <span className="pill">B · {q.bLabel}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="meta-card">
        <div className="msg">
          {hasEndpoint ? (
            <>
              <strong>Submit your ratings.</strong> Clicking <em>Submit</em> uploads the full log
              (every per-question rating, audio filenames, true A / B identities) directly to the coordinator.
              If the upload fails, a JSON backup downloads automatically.
            </>
          ) : (
            <>
              <strong>Export your rating log.</strong> No cloud endpoint is configured for this deployment —
              please export the JSON and hand the file back to the coordinator.
            </>
          )}
        </div>
        <div className="actions">
          <button className="btn" onClick={exportJSON} disabled={submitState.phase === "uploading"}>
            Export JSON {hasEndpoint ? "(backup)" : ""}
          </button>
          <button
            className="btn btn-primary"
            onClick={submitAndReset}
            disabled={submitState.phase === "uploading"}
          >
            {submitState.phase === "uploading"
              ? "Uploading…"
              : hasEndpoint
                ? "Submit to coordinator"
                : "Export JSON & start new participant"}
          </button>
        </div>
        {submitState.phase !== "idle" && (
          <div className={`submit-status submit-status-${submitState.phase}`}>
            {submitState.message}
          </div>
        )}
      </div>
    </div>
  );
}

window.Overview = Overview;
window.Results = Results;
