// Runner screen: the A/B testing UI
// Each Transport owns its own <audio> element — enables real seek + clean reset across questions.
// A shared "audio-ab-test-play" event implements the "only one plays at a time" mutex.

const { useState, useEffect, useRef, useMemo } = React;

function Transport({ src, side, trueLabel, labelSide, revealed, lang }) {
  const copy = getText(lang);
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => {
      setElapsed(a.currentTime);
      const d = isFinite(a.duration) ? a.duration : 0;
      setProgress(d ? a.currentTime / d : 0);
    };
    const onLoaded = () => setDuration(isFinite(a.duration) ? a.duration : 0);
    const onPlay = () => {
      setPlaying(true);
      window.dispatchEvent(new CustomEvent("audio-ab-test-play", { detail: a }));
    };
    const onPause = () => setPlaying(false);
    const onEnded = () => { setPlaying(false); };

    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("durationchange", onLoaded);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);

    const onClaim = (e) => { if (e.detail !== a) { try { a.pause(); } catch (err) {} } };
    window.addEventListener("audio-ab-test-play", onClaim);

    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("durationchange", onLoaded);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
      window.removeEventListener("audio-ab-test-play", onClaim);
      try { a.pause(); } catch (err) {}
    };
  }, []);

  const bars = useMemo(() => {
    const seed = [...src].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const arr = [];
    for (let i = 0; i < 56; i++) {
      const v = (Math.sin(seed + i * 0.7) * 0.5 + 0.5) * 0.7
              + (Math.sin(seed * 0.3 + i * 0.21) * 0.5 + 0.5) * 0.3;
      arr.push(0.25 + v * 0.75);
    }
    return arr;
  }, [src]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      const p = a.play();
      if (p && p.catch) p.catch((e) => console.warn("play failed", e));
    } else {
      a.pause();
    }
  };

  const seekTo = (clientX, track) => {
    const a = audioRef.current;
    if (!a || !isFinite(a.duration) || !a.duration) return;
    const rect = track.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    a.currentTime = frac * a.duration;
    setElapsed(a.currentTime);
    setProgress(frac);
  };

  const onScrubDown = (e) => {
    const track = e.currentTarget;
    seekTo(e.clientX, track);
    const move = (ev) => seekTo(ev.clientX, track);
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const fmt = (t) => {
    if (!isFinite(t)) t = 0;
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className={`player ${playing ? "playing" : ""}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="player-head">
        <div className="badge">
          <span className="chip">{side}</span>
          {revealed && trueLabel ? (
            <span className="identity-pill" data-side={labelSide}>{trueLabel}</span>
          ) : (
            <span className="hint">{copy.runner.blindSample}</span>
          )}
        </div>
        <button className="btn" onClick={toggle}>
          <span dangerouslySetInnerHTML={{__html: playing ? icons.pause : icons.play}} />
          {playing ? `${copy.runner.pause} ${side}` : `${copy.runner.play} ${side}`}{revealed && trueLabel ? ` · ${trueLabel}` : ""}
        </button>
      </div>

      <div className="transport">
        <button className="play-btn" onClick={toggle} aria-label={playing ? copy.runner.pause : copy.runner.play}>
          <span dangerouslySetInnerHTML={{__html: playing ? icons.pause : icons.play}} />
        </button>
        <span className="time">{fmt(elapsed)}</span>
        <div className="scrub" onMouseDown={onScrubDown}>
          <div className="scrub-fill" style={{ width: `${progress * 100}%` }}>
            <div className="scrub-knob" style={{ left: "100%" }} />
          </div>
        </div>
        <span className="time">{fmt(duration)}</span>
      </div>

      <div className="waveform">
        {bars.map((h, i) => {
          const played = (i / bars.length) < progress;
          const peek = Math.abs((i / bars.length) - progress) < 0.025;
          return (
            <div
              key={i}
              className={`bar ${played ? "lit" : ""} ${peek && playing ? "peek" : ""}`}
              style={{ height: `${h * 100}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}

function Ticker({ total, current, answers, onJump, lang }) {
  const copy = getText(lang);
  return (
    <div>
      <div className="ticker">
        {Array.from({length: total}).map((_, i) => {
          const idx = i + 1;
          const a = answers[idx];
          const answered = a && a.audioQuality != null && a.promptFollowing != null;
          const isCurrent = idx === current;
          return (
            <button
              key={i}
              type="button"
              className={`tick ${answered ? "done" : ""} ${isCurrent ? "current" : ""}`}
              onClick={() => onJump && onJump(i)}
              aria-label={copy.runner.jumpToQuestion(idx, answered)}
              title={copy.runner.jumpToQuestion(idx, answered)}
            />
          );
        })}
      </div>
      <div className="ticker-label">
        {String(current).padStart(2,"0")} / {String(total).padStart(2,"0")} · {lang === "zh" ? "進度" : "Progress"}
      </div>
    </div>
  );
}

function CmosScale({ label, hint, value, onChange, lang }) {
  const copy = getText(lang);
  const options = getCmosOptions(lang);
  return (
    <div className="cmos-row">
      <div className="cmos-meta">
        <div className="cmos-label">{label}</div>
        <div className="cmos-hint">{hint}</div>
      </div>
      <div className="cmos-track">
        <span className="cmos-end left">{copy.cmos.leftEnd}</span>
        <div className="cmos-buttons">
          {options.map(opt => (
            <button
              key={opt.val}
              type="button"
              className={`cmos-btn side-${opt.side} ${value === opt.val ? "selected" : ""}`}
              onClick={() => onChange(opt.val)}
              title={opt.label}
              aria-label={opt.label}
            >
              {opt.val > 0 ? `+${opt.val}` : opt.val}
            </button>
          ))}
        </div>
        <span className="cmos-end right">{copy.cmos.rightEnd}</span>
      </div>
    </div>
  );
}

function Runner({ state, setState, goto, lang }) {
  const copy = getText(lang);
  const metrics = getMetrics(lang);
  const roundSize = state.selection ? state.selection.length : 0;

  // Edge case: state shows a participant but no round selected yet.
  // Shouldn't happen in normal flow (App sets selection on startRound)
  // but bail gracefully if state schema was reset mid-round.
  if (!roundSize) {
    return (
      <div className="canvas canvas-compact">
        <div className="runner-head">
          <div>
            <h1>{copy.runner.noRound}</h1>
            <div className="muted sans" style={{fontSize:13, marginTop:4}}>
              {copy.runner.restartHint}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const poolIdx = state.selection[state.currentIdx];
  const aIsV1 = state.abMap[state.currentIdx];
  const poolItem = DATA.pool[poolIdx];
  const q = buildQuestion(poolItem, state.currentIdx + 1, aIsV1, DATA.variants);
  const answer = state.answers[q.id] || {};
  const sideOf = (label) => DATA.variants[0] === label ? "left" : "right";

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
      if (e.key === "ArrowLeft" && state.currentIdx > 0) {
        setState(s => ({...s, currentIdx: s.currentIdx - 1 }));
      }
      if (e.key === "ArrowRight" && state.currentIdx < roundSize - 1) {
        setState(s => ({...s, currentIdx: s.currentIdx + 1 }));
      }
      if (e.key === "Enter") {
        const cur = state.answers[state.currentIdx + 1] || {};
        const done = cur.audioQuality != null && cur.promptFollowing != null;
        if (!done) return;
        if (state.currentIdx === roundSize - 1) goto("results");
        else setState(s => ({...s, currentIdx: s.currentIdx + 1}));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.currentIdx, roundSize]);

  const setMetric = (metric, val) => {
    setState(s => ({
      ...s,
      answers: {
        ...s.answers,
        [q.id]: {
          ...(s.answers[q.id] || {}),
          [metric]: val,
          updatedAt: new Date().toISOString(),
        }
      }
    }));
  };

  const hasBoth = answer.audioQuality != null && answer.promptFollowing != null;
  const answeredCount = Object.values(state.answers).filter(a => a && a.audioQuality != null && a.promptFollowing != null).length;

  return (
    <div className="canvas canvas-compact">
      <div className="runner-head">
        <div>
          <div className="slug">{copy.runner.slug(state.roundIndex || 1, q.id, roundSize)}</div>
          <h1>{lang === "zh" ? q.titleZh : q.title}<span className="dim" style={{fontWeight:400, marginLeft:10, fontSize:22}}>·</span> <em>{copy.runner.pairTitle}</em></h1>
        </div>
        <Ticker total={roundSize} current={q.id} answers={state.answers} onJump={(i) => setState(s => ({...s, currentIdx: i}))} lang={lang} />
      </div>

      <div className="prompt-box">
        <span className="prompt-tag">{copy.runner.promptTag}</span>
        <span className="prompt-text">{q.desc}</span>
      </div>

      <div className="pair">
        <Transport key={`${state.roundIndex}-${q.id}-A`} src={q.aFile} side="A" trueLabel={q.aLabel} labelSide={sideOf(q.aLabel)} revealed={state.revealed} lang={lang} />
        <Transport key={`${state.roundIndex}-${q.id}-B`} src={q.bFile} side="B" trueLabel={q.bLabel} labelSide={sideOf(q.bLabel)} revealed={state.revealed} lang={lang} />
      </div>

      <div className="cmos-judgement">
        {metrics.map(m => (
          <CmosScale
            key={m.key}
            label={m.label}
            hint={m.hint}
            value={answer[m.key]}
            onChange={(v) => setMetric(m.key, v)}
            lang={lang}
          />
        ))}
      </div>

      <div className="footer-bar">
        <div className="nav-actions">
          <button className="btn" onClick={() => setState(s => ({...s, currentIdx: Math.max(0, s.currentIdx - 1)}))} disabled={state.currentIdx === 0}>
            <span dangerouslySetInnerHTML={{__html: icons.arrowL}} /> {copy.runner.previous}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (state.currentIdx === roundSize - 1) goto("results");
              else setState(s => ({...s, currentIdx: s.currentIdx + 1 }));
            }}
            disabled={!hasBoth}
          >
            {state.currentIdx === roundSize - 1 ? copy.runner.viewResults : copy.runner.next} <span dangerouslySetInnerHTML={{__html: icons.arrowR}} />
          </button>
        </div>
      </div>
    </div>
  );
}

window.Runner = Runner;
