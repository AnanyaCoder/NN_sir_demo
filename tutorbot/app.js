/* ===================================================================
   TutorBot — capability film engine
   A Reel sequencer walks 14 scenes. One reelTick() RAF loop drives the
   clock scenes; every scene runs a keyframe timeline (runTimeline) for
   video-style staged reveals. Text + product UI only, no voiceover —
   a music bed (audio/music.mp3) plays underneath and ducks on demos.
   Architecture forked from the AI4B-Transcribe capability-film engine
   (see ../film): same Reel/clock-scene/timeline/Music contract, retuned
   for chat, product screenshots and interactive mocks.
   =================================================================== */
"use strict";
const SVGNS = "http://www.w3.org/2000/svg";
const rand = (a, b) => a + Math.random() * (b - a);

// Origami-bird mark (the Bodhan / TutorBot glyph), inlined so it works offline.
const BIRD = `<svg viewBox="0 0 100 100" class="bird-svg"><path class="bird-path" d="M20 62 L52 28 L74 44 L54 51 L67 72 L45 59 L30 74 Z"/></svg>`;

const els = {
  body: document.body,
  gate: document.getElementById("gate"),
  startBtn: document.getElementById("startBtn"),
  stage: document.getElementById("stage"),
  visual: document.getElementById("visualLayer"),
  cap: document.getElementById("captionLayer"),
  kicker: document.getElementById("capKicker"),
  title: document.getElementById("capTitle"),
  sub: document.getElementById("capSub"),
  chips: document.getElementById("chips"),
  extra: document.getElementById("sceneExtra"),
  rail: document.getElementById("railFill"),
  chapter: document.getElementById("chapter"),
  music: document.getElementById("music"),
  wipe: document.getElementById("wipe"),
  mlToggle: document.getElementById("mlToggle"),
  mlLabel: document.getElementById("mlLabel"),
};

/* =====================================================================
   Caption + card + timeline helpers  (shared engine primitives)
   ===================================================================== */
function runTimeline(state, t, kfs) {
  while (state.cursor < kfs.length && t >= kfs[state.cursor].at) kfs[state.cursor++].fn(t);
}
function popText(el, html) {
  el.innerHTML = html || "";
  el.classList.remove("text-pop"); void el.offsetWidth; if (html) el.classList.add("text-pop");
}
function setCaption(kicker, title, sub) {
  popText(els.kicker, kicker || "");
  popText(els.title, title || "");
  popText(els.sub, sub || "");
}
function pulseCaption() { els.cap.classList.remove("enter"); void els.cap.offsetWidth; els.cap.classList.add("enter"); }
function clearCaption() { setCaption("", "", ""); els.chips.innerHTML = ""; els.extra.innerHTML = ""; }
function showVisual(node) { els.visual.innerHTML = ""; if (node) els.visual.appendChild(node); }
function frame(cls) { const d = document.createElement("div"); d.className = "viz " + (cls || ""); return d; }
function showCard(inner, cls) {
  els.stage.querySelectorAll(".center-card").forEach((n) => n.remove());
  const c = document.createElement("div"); c.className = "center-card " + (cls || ""); c.innerHTML = inner;
  els.stage.appendChild(c); return c;
}
function cardHead(kicker, title, sub) {
  return `<div class="card-head">${kicker ? `<div class="cap-kicker" data-seq>${kicker}</div>` : ""}` +
    `${title ? `<h2 class="card-title" data-seq>${title}</h2>` : ""}` +
    `${sub ? `<div class="cap-sub" data-seq style="margin-inline:auto">${sub}</div>` : ""}</div>`;
}
function chip(ico, text, hot) { return `<span class="chip${hot ? " hot" : ""}"><span class="ico">${ico}</span>${text}</span>`; }
// Keyframes that add .on to every [sel] node in DOM order, one every `gap` ms.
function revealSeq(scope, sel, start, gap) {
  return Array.from(scope.querySelectorAll(sel)).map((el, i) => ({ at: start + i * gap, fn: () => el.classList.add("on") }));
}

/* =====================================================================
   Backdrops (CSS-animated; the class does the work)
   ===================================================================== */
function buildAurora() { return frame("viz-tint viz-aurora"); }
function buildMotes(n) {
  const w = frame("viz-tint viz-aurora");
  for (let i = 0; i < (n || 26); i++) {
    const m = document.createElement("div"); m.className = "mote";
    m.style.left = rand(0, 100) + "%"; m.style.top = rand(0, 100) + "%";
    m.style.setProperty("--s", rand(3, 9).toFixed(1) + "px");
    m.style.animationDuration = rand(7, 16) + "s"; m.style.animationDelay = (-rand(0, 12)) + "s";
    w.appendChild(m);
  }
  return w;
}
function buildStars(n) {
  const w = frame("viz-tint viz-stars");
  for (let i = 0; i < (n || 90); i++) {
    const s = document.createElement("div"); s.className = "star";
    s.style.left = rand(0, 100) + "%"; s.style.top = rand(0, 100) + "%";
    s.style.setProperty("--s", rand(1, 3).toFixed(1) + "px");
    s.style.animationDuration = rand(2.4, 6) + "s"; s.style.animationDelay = (-rand(0, 6)) + "s";
    w.appendChild(s);
  }
  return w;
}
function buildDesk() {
  const w = frame("viz-tint viz-desk");
  const lamp = document.createElement("div"); lamp.className = "lamp-glow"; w.appendChild(lamp);
  for (let i = 0; i < 5; i++) { const p = document.createElement("div"); p.className = "paper"; p.style.left = rand(6, 70) + "%"; p.style.top = rand(50, 82) + "%"; p.style.setProperty("--rot", rand(-8, 8) + "deg"); p.style.animationDelay = (i * 0.4) + "s"; w.appendChild(p); }
  return w;
}

/* =====================================================================
   Chat frame — the product's chat UI. Bubbles land one at a time, with a
   typing indicator before each Bodhan turn. Returns keyframes + end time.
   ===================================================================== */
const readMs = (t) => Math.max(1500, Math.min(4400, String(t).length * 34));
function chatFrame(meta) {
  const wrap = document.createElement("div"); wrap.className = "chat-frame";
  wrap.innerHTML =
    `<div class="chat-top"><span class="ct-mark">${BIRD}</span><span class="ct-name">TutorBot</span>` +
    (meta.subject ? `<span class="ct-subj">${meta.subject}</span>` : "") +
    (meta.mlLabel ? `<span class="ct-ml">🌐 ${meta.mlLabel}</span>` : "") + `</div>` +
    `<div class="chat-scroll"></div>`;
  return wrap;
}
function addBubble(scroll, m) {
  const row = document.createElement("div"); row.className = "msg " + m.who;
  if (m.who === "bot") {
    row.innerHTML = `<span class="av">${BIRD}</span><div class="bwrap"><div class="bhead">Bodhan</div>` +
      `<div class="bub ${m.q ? "q" : ""}">${m.q ? `<span class="qtag">↩ asks a question</span>` : ""}${m.text}</div></div>`;
  } else {
    row.innerHTML = `<div class="bub ${m.win ? "win" : ""}">${m.text}${m.win ? `<span class="wintag">✓ got it</span>` : ""}</div>`;
  }
  scroll.appendChild(row);
  requestAnimationFrame(() => { row.classList.add("in"); scroll.scrollTop = scroll.scrollHeight; });
}
function typing(scroll, on) {
  let t = scroll.querySelector(".typing");
  if (on) {
    if (t) return;
    t = document.createElement("div"); t.className = "msg bot typing in";
    t.innerHTML = `<span class="av">${BIRD}</span><div class="bwrap"><div class="bub dots"><i></i><i></i><i></i></div></div>`;
    scroll.appendChild(t); scroll.scrollTop = scroll.scrollHeight;
  } else if (t) t.remove();
}
// Build a full chat scene body inside a center-card; returns its keyframes.
function chatKfs(scroll, chat, start) {
  const kfs = []; let t = start || 500;
  chat.forEach((m) => {
    if (m.who === "bot") {
      kfs.push({ at: t, fn: () => typing(scroll, true) });
      const appear = t + 1000;
      kfs.push({ at: appear, fn: () => { typing(scroll, false); addBubble(scroll, m); } });
      t = appear + readMs(m.text);
    } else {
      kfs.push({ at: t, fn: () => addBubble(scroll, m) });
      t = t + readMs(m.text) * 0.7;
    }
  });
  return { kfs, end: t };
}

/* =====================================================================
   Framed product screenshot — browser-window chrome + slow camera push,
   optional annotation pin. Used for the real Atlas / hint / lesson-plan
   / graded-review captures.
   ===================================================================== */
function framedShot(src, opts = {}) {
  const f = document.createElement("div"); f.className = "shot" + (opts.tall ? " tall" : "");
  f.innerHTML =
    `<div class="shot-bar"><i></i><i></i><i></i><span class="shot-url">${opts.url || "app.bodhan.ai"}</span></div>` +
    `<div class="shot-view"><img src="${src}" alt="${opts.alt || "TutorBot product"}" class="${opts.push ? "push" : ""}"/>` +
    (opts.pin ? `<div class="shot-pin" style="left:${opts.pin.x}%;top:${opts.pin.y}%"><span></span><em>${opts.pin.label}</em></div>` : "") +
    `</div>` + (opts.cap ? `<div class="shot-cap">${opts.cap}</div>` : "");
  return f;
}

/* =====================================================================
   Physics helper for the incline sim
   ===================================================================== */
function inclineStats(deg) {
  const g = 9.8, L = 4.0, rad = deg * Math.PI / 180;
  const a = g * Math.sin(rad);                 // accel along frictionless slope
  const t = Math.sqrt(2 * L / Math.max(0.01, a));
  const v = a * t;                             // final speed
  return { a, t, v };
}

/* =====================================================================
   Generic clock scene  (same contract as the AI4B engine)
   ===================================================================== */
function makeClockScene({ id, duration, enter, update, exit, hold }) {
  let tl = { cursor: 0 }, kfs = [];
  return {
    id, driver: "clock", duration: hold ? Infinity : duration,
    localProgress() { return hold ? 1 : null; },
    enter() {
      tl = { cursor: 0 };
      const own = enter.call(this, this) || [];
      const auto = revealSeq(els.stage, "[data-seq]", 240, 430);
      kfs = auto.concat(own).sort((a, b) => a.at - b.at);
      pulseCaption();
    },
    update(t) { runTimeline(tl, t, kfs); if (update) update.call(this, t); },
    exit() { if (exit) exit(); },
  };
}

/* =====================================================================
   SCENES
   ===================================================================== */
// ---- 1 — Open -------------------------------------------------------
function sceneOpen() {
  const R = REEL.open;
  return makeClockScene({
    id: "open", duration: R.dur,
    enter() {
      clearCaption(); showVisual(buildStars());
      const card = showCard(
        `<div class="o-swap o-line"></div>
         <div class="o-specs"><div class="o-spec"></div><div class="o-spec"></div></div>
         <div class="o-final"></div>`, "open-card");
      const swap = card.querySelector(".o-swap");
      const specsBox = card.querySelector(".o-specs");
      const specEls = [...card.querySelectorAll(".o-spec")];
      const finalEl = card.querySelector(".o-final");
      const say = (text, cls) => { swap.className = "o-swap o-line" + (cls ? " " + cls : ""); swap.innerHTML = text; void swap.offsetWidth; swap.classList.add("text-pop"); };
      const kfs = [
        { at: 350, fn: () => say(R.lines[0]) },
        { at: 1650, fn: () => say(R.lines[1]) },
        { at: 2950, fn: () => say(R.lines[2]) },
        { at: 4400, fn: () => say(R.tease, "o-tease") },
        { at: 5350, fn: () => say(`<span class="mark-inline">${BIRD}</span>${R.logo}`, "o-logo") },
      ];
      let t = 6100;
      kfs.push({ at: t - 150, fn: () => specsBox.classList.add("show") });
      const STEP = 28;
      R.specs.forEach((txt) => {
        const el = specEls[R.specs.indexOf(txt)], start = t;
        kfs.push({ at: start, fn: () => { el.textContent = ""; } });
        for (let n = 1; n <= txt.length; n++) kfs.push({ at: start + n * STEP, fn: () => { el.textContent = txt.slice(0, n); } });
        t = start + txt.length * STEP + 500;
      });
      const clearAt = t + 700;
      kfs.push({ at: clearAt, fn: () => { swap.className = "o-swap o-line o-logo gone"; specsBox.className = "o-specs show gone"; } });
      kfs.push({ at: clearAt + 600, fn: () => { finalEl.innerHTML = R.langLine; finalEl.classList.add("show"); void finalEl.offsetWidth; finalEl.classList.add("text-pop"); } });
      return kfs;
    },
  });
}

// ---- shared chat-scene factory (scenes 2 & 3, and ML overrides) -----
function chatScene(id, R, opts = {}) {
  return makeClockScene({
    id, duration: R.dur,
    enter() {
      const ml = Reel.ml && R.ml;
      const chat = ml ? R.ml.chat : R.chat;
      clearCaption();
      showVisual(opts.bg ? opts.bg() : buildMotes(20));
      setCaption(R.kicker, `${R.line} <span class="grad">${R.punch || ""}</span>`, R.subject || "");
      const card = showCard(``, "chat-card");
      const cf = chatFrame({ subject: R.subject, mlLabel: ml ? R.ml.label : "" });
      card.appendChild(cf);
      // optional real-product proof strip beside the chat
      if (opts.proof && R.proofShot && !ml) {
        card.classList.add("with-proof");
        const p = framedShot(R.proofShot, { cap: R.proofCap, url: "app.bodhan.ai", alt: "TutorBot product" });
        p.classList.add("proof-inset"); card.appendChild(p);
      }
      const scroll = cf.querySelector(".chat-scroll");
      const start = opts.beat ? 1300 : 600;
      return chatKfs(scroll, chat, start).kfs;
    },
  });
}

// ---- 4 — Rooted in IKS (split screen) -------------------------------
function sceneIKS() {
  const R = REEL.iks;
  return makeClockScene({
    id: "iks", duration: R.dur,
    enter() {
      clearCaption(); showVisual(buildMotes(18));
      setCaption(R.kicker, `${R.line} <span class="grad">${R.punch}</span>`, R.subject);
      const card = showCard(
        `<div class="split">
           <div class="split-pane sp-old" data-seq>
             <div class="sp-tag">${R.left.tag} · ${R.left.era}</div>
             <pre class="verse deva">${R.left.verse}</pre>
             <div class="sp-gloss">${R.left.gloss}</div>
           </div>
           <div class="split-arrow" data-seq>→</div>
           <div class="split-pane sp-new" data-seq>
             <div class="sp-tag">${R.right.tag}</div>
             <div class="sp-title">${R.right.title}</div>
             <div class="sp-body">${R.right.body}</div>
             <div class="sp-eqn">${R.right.eqn}</div>
           </div>
         </div>
         <div class="bridge" data-seq>${R.bridge}</div>`, "iks-card");
      return [];
    },
  });
}

// ---- 5 — Active learning (interactive incline sim) ------------------
function sceneActive() {
  const R = REEL.active;
  return makeClockScene({
    id: "active", duration: R.dur,
    enter() {
      const ml = Reel.ml && R.ml;
      clearCaption(); showVisual(buildMotes(16));
      setCaption(R.kicker, `${R.line} <span class="grad">${R.punch}</span>`, R.subject);
      if (ml) {
        const card = showCard(``, "chat-card");
        const cf = chatFrame({ subject: R.subject, mlLabel: R.ml.label });
        card.appendChild(cf);
        return chatKfs(cf.querySelector(".chat-scroll"), R.ml.chat, 600).kfs;
      }
      const card = showCard(
        `<div class="sim">
           <div class="sim-head">${R.simTitle}</div>
           <div class="sim-intro">${R.simIntro}</div>
           <div class="sim-stage">
             <svg viewBox="0 0 520 300" class="ramp-svg">
               <line x1="40" y1="260" x2="500" y2="260" class="ground"/>
               <g class="ramp-g">
                 <path class="ramp" d="M40 260 L40 260 L40 260 Z"/>
                 <circle class="ball" r="12" cx="60" cy="248"/>
               </g>
               <path class="angle-arc" d="" />
               <text class="angle-lbl" x="0" y="0"></text>
               <g class="drag-handle"><circle r="13"/><text x="0" y="4">⇕</text></g>
             </svg>
             <div class="sim-stats">
               <div class="st"><div class="sv" id="stAngle">—</div><div class="sl">angle</div></div>
               <div class="st"><div class="sv" id="stSpeed">—</div><div class="sl">speed at bottom</div></div>
               <div class="st"><div class="sv" id="stTime">—</div><div class="sl">time to bottom</div></div>
             </div>
           </div>
           <div class="sim-tip" id="simTip">💡 ${R.tip}</div>
         </div>`, "active-card");
      // real-product proof inset
      const p = framedShot(R.proofShot, { cap: R.proofCap, url: "app.bodhan.ai · Optics" });
      p.classList.add("proof-float"); card.appendChild(p);

      const svg = card.querySelector(".ramp-svg");
      const rampG = svg.querySelector(".ramp-g");
      const ramp = svg.querySelector(".ramp");
      const ball = svg.querySelector(".ball");
      const handle = svg.querySelector(".drag-handle");
      const arc = svg.querySelector(".angle-arc");
      const albl = svg.querySelector(".angle-lbl");
      const stA = card.querySelector("#stAngle"), stS = card.querySelector("#stSpeed"), stT = card.querySelector("#stTime");
      const ox = 60, oy = 260, len = 320;                 // ramp origin + horizontal run
      this._sim = { deg: 18, target: 18, ball: 0, ballV: 0, ox, oy, len, ramp, ball2: ball, handle, arc, albl, stA, stS, stT, rolling: false, rollT: 0 };
      // choreograph the "drag": ease the angle up, then down, to show the effect
      return [
        { at: 900, fn: () => this._sim.target = 34 },
        { at: 4200, fn: () => this._sim.target = 12 },
        { at: 7200, fn: () => this._sim.target = 26 },
        { at: 9800, fn: () => this._sim.target = 40 },
      ];
    },
    update(t) {
      const s = this._sim; if (!s) return;
      s.deg += (s.target - s.deg) * 0.06;
      const rad = s.deg * Math.PI / 180;
      const ex = s.ox + s.len, ey = s.oy - Math.tan(rad) * s.len; // top of ramp
      s.ramp.setAttribute("d", `M${s.ox} ${s.oy} L${ex} ${ey} L${ex} ${s.oy} Z`);
      // ball rolls from top; loops so motion is always visible
      s.rollT += 0.016;
      const st = inclineStats(s.deg);
      const period = st.t + 0.7;
      const ph = (s.rollT % period);
      let frac = ph < st.t ? 0.5 * st.a * ph * ph / 4.0 : 1;  // s = ½at², normalised by L=4
      frac = Math.max(0, Math.min(1, frac));
      const bx = ex + (s.ox - ex) * frac, by = ey + (s.oy - ey) * frac - 12 * Math.cos(rad);
      s.ball2.setAttribute("cx", bx.toFixed(1)); s.ball2.setAttribute("cy", by.toFixed(1));
      s.handle.setAttribute("transform", `translate(${ex.toFixed(1)},${ey.toFixed(1)})`);
      // angle arc + label
      const r = 46; const a2 = -rad;
      s.arc.setAttribute("d", `M${s.ox + r} ${s.oy} A${r} ${r} 0 0 0 ${(s.ox + r * Math.cos(a2)).toFixed(1)} ${(s.oy + r * Math.sin(a2)).toFixed(1)}`);
      s.albl.setAttribute("x", (s.ox + r + 8).toFixed(1)); s.albl.setAttribute("y", (s.oy - 12).toFixed(1));
      s.albl.textContent = Math.round(s.deg) + "°";
      s.stA.textContent = Math.round(s.deg) + "°";
      s.stS.textContent = st.v.toFixed(1) + " m/s";
      s.stT.textContent = st.t.toFixed(2) + " s";
    },
  });
}

// ---- 6 — Atlas (real screenshot, camera push, annotation) ----------
function sceneAtlas() {
  const R = REEL.atlas;
  return makeClockScene({
    id: "atlas", duration: R.dur,
    enter() {
      const ml = Reel.ml && R.ml;
      clearCaption(); showVisual(buildStars(70));
      setCaption(R.kicker, `${R.line} <span class="grad">${R.punch}</span>`, R.subject);
      if (ml) {
        const card = showCard(``, "chat-card");
        const cf = chatFrame({ subject: R.subject, mlLabel: R.ml.label });
        card.appendChild(cf);
        return chatKfs(cf.querySelector(".chat-scroll"), R.ml.chat, 600).kfs;
      }
      const card = showCard(``, "shot-card");
      const shot = framedShot(R.shot, {
        push: true, tall: true, url: "app.bodhan.ai · Atlas",
        pin: { x: 33, y: 46, label: "Normal Force · unresolved" },
        alt: "Atlas concept graph",
      });
      card.appendChild(shot);
      const note = document.createElement("div"); note.className = "shot-note"; note.dataset.seq = ""; note.innerHTML = R.note;
      card.appendChild(note);
      return [{ at: 2600, fn: () => shot.querySelector(".shot-pin").classList.add("on") }];
    },
  });
}

// ---- 7 — Formative MCQ (mock, wrong pick → diagnostic follow-up) ----
function sceneMCQ() {
  const R = REEL.mcq;
  return makeClockScene({
    id: "mcq", duration: R.dur,
    enter() {
      const ml = Reel.ml && R.ml;
      clearCaption(); showVisual(buildMotes(16));
      setCaption(R.kicker, `${R.line} <span class="grad">${R.punch}</span>`, R.subject);
      if (ml) {
        const card = showCard(``, "chat-card");
        const cf = chatFrame({ subject: R.subject, mlLabel: R.ml.label });
        card.appendChild(cf);
        return chatKfs(cf.querySelector(".chat-scroll"), R.ml.chat, 600).kfs;
      }
      const card = showCard(
        `<div class="mcq">
           <div class="mcq-q">${R.question}</div>
           <div class="mcq-opts">${R.options.map((o) =>
            `<div class="mcq-opt" data-key="${o.key}"><span class="ok">${o.key}</span>${o.text}<span class="mark"></span></div>`).join("")}</div>
         </div>
         <div class="follow" id="follow"><div class="cap-kicker">${R.followKicker}</div><div class="follow-body">${R.follow}</div></div>`, "mcq-card");
      const opts = card.querySelectorAll(".mcq-opt");
      const pick = R.options.findIndex((o) => o.picked);
      const corr = R.options.findIndex((o) => o.correct);
      return [
        { at: 1600, fn: () => { const el = opts[pick]; el.classList.add("picked"); el.querySelector(".mark").textContent = "✕"; } },
        { at: 2600, fn: () => opts[pick].classList.add("wrong") },
        { at: 3600, fn: () => { const el = opts[corr]; el.classList.add("correct"); el.querySelector(".mark").textContent = "✓"; } },
        { at: 4800, fn: () => card.querySelector("#follow").classList.add("on") },
      ];
    },
  });
}

// ---- 8 — Scaffolded hints (real hint screenshot + escalation) ------
function sceneHints() {
  const R = REEL.hints;
  return makeClockScene({
    id: "hints", duration: R.dur,
    enter() {
      const ml = Reel.ml && R.ml;
      clearCaption(); showVisual(buildMotes(16));
      setCaption(R.kicker, `${R.line} <span class="grad">${R.punch}</span>`, R.subject);
      if (ml) {
        const card = showCard(``, "chat-card");
        const cf = chatFrame({ subject: R.subject, mlLabel: R.ml.label });
        card.appendChild(cf);
        return chatKfs(cf.querySelector(".chat-scroll"), R.ml.chat, 600).kfs;
      }
      const card = showCard(``, "hints-card with-proof");
      const shot = framedShot(R.shot, { cap: "Real product · the first rung, never the answer", url: "app.bodhan.ai" });
      shot.classList.add("proof-inset");
      const stack = document.createElement("div"); stack.className = "hint-stack";
      stack.innerHTML = R.steps.map((s) =>
        `<div class="hint-card2" data-seq><div class="hc-tag">${s.tag}</div><div class="hc-body">${s.text}</div></div>`).join("");
      card.append(shot, stack);
      return [];
    },
  });
}

// ---- 9 — Turn to teachers ------------------------------------------
function sceneTurn() {
  const R = REEL.turn;
  return makeClockScene({
    id: "turn", duration: R.dur,
    enter() {
      clearCaption(); showVisual(buildDesk());
      const card = showCard(
        cardHead(R.kicker, R.line, "") +
        `<div class="turn-punch" data-seq>${R.punch}</div>`, "turn-card");
      const shot = framedShot(R.safeShot, { cap: R.safeCap, url: "app.bodhan.ai" });
      shot.classList.add("proof-corner"); shot.dataset.seq = "";
      card.appendChild(shot);
      return [];
    },
  });
}

// ---- 10 — Lesson plans (typed prompt → 5E plan → real screenshot) --
function sceneLessons() {
  const R = REEL.lessons;
  return makeClockScene({
    id: "lessons", duration: R.dur,
    enter() {
      clearCaption(); showVisual(buildMotes(14));
      setCaption(R.kicker, `${R.line} <span class="grad">${R.punch}</span>`, "");
      const card = showCard(
        `<div class="prompt-bar"><span class="pb-label">Teacher</span><span class="pb-text" id="pbText"></span><span class="pb-caret">▌</span></div>
         <div class="plan-5e" id="plan5e">${R.plan.map((p) =>
          `<div class="plan-row"><span class="pe">${p.e}</span><span class="pt">${p.t}</span></div>`).join("")}</div>`, "lessons-card");
      const shot = framedShot(R.shot, { cap: R.shotCap, url: "app.bodhan.ai · Lesson plans", tall: true });
      shot.classList.add("proof-inset"); card.classList.add("with-proof"); card.appendChild(shot);
      const pb = card.querySelector("#pbText");
      const rows = card.querySelectorAll(".plan-row");
      const kfs = [];
      const STEP = 26; const txt = R.prompt;
      for (let n = 1; n <= txt.length; n++) kfs.push({ at: 400 + n * STEP, fn: () => pb.textContent = txt.slice(0, n) });
      const after = 400 + txt.length * STEP + 500;
      rows.forEach((r, i) => kfs.push({ at: after + i * 520, fn: () => r.classList.add("on") }));
      kfs.push({ at: after + rows.length * 520 + 400, fn: () => shot.classList.add("on") });
      return kfs;
    },
  });
}

// ---- 11 — Differentiated worksheets (fan-out) ----------------------
function sceneWorksheets() {
  const R = REEL.worksheets;
  return makeClockScene({
    id: "worksheets", duration: R.dur,
    enter() {
      clearCaption(); showVisual(buildMotes(18));
      setCaption(R.kicker, `${R.line} <span class="grad">${R.punch}</span>`, R.subject);
      showCard(
        `<div class="ws-fan">${R.cards.map((c, i) =>
          `<div class="ws-card t-${c.tint}" data-seq style="--i:${i - 1.5}">
             <div class="ws-level">${c.level}</div>
             <div class="ws-desc${c.deva ? " deva" : ""}">${c.desc}</div>
             <div class="ws-note">${c.note}</div>
           </div>`).join("")}</div>`, "ws-card-wrap");
      return [];
    },
  });
}

// ---- 12 — Local context (before/after swap + real screenshot) ------
function sceneLocal() {
  const R = REEL.local;
  return makeClockScene({
    id: "local", duration: R.dur,
    enter() {
      clearCaption(); showVisual(buildMotes(16));
      setCaption(R.kicker, `${R.line} <span class="grad">${R.punch}</span>`, "");
      const card = showCard(
        `<div class="swaps">${R.swaps.map((s) =>
          `<div class="swap-row" data-seq><span class="sw-before">${s.before}</span><span class="sw-arrow">→</span><span class="sw-after">${s.after}</span></div>`).join("")}</div>`,
        "local-card with-proof");
      const shot = framedShot(R.shot, { cap: R.shotCap, url: "app.bodhan.ai · Lesson plans", tall: true });
      shot.classList.add("proof-inset"); card.appendChild(shot);
      // reveal the "after" of each row a beat after the row lands
      const rows = card.querySelectorAll(".swap-row");
      return Array.from(rows).map((r, i) => ({ at: 1400 + i * 1100, fn: () => r.classList.add("swapped") }));
    },
  });
}

// ---- 13 — Mistake or misconception --------------------------------
function sceneMisconception() {
  const R = REEL.misconception;
  return makeClockScene({
    id: "misconception", duration: R.dur,
    enter() {
      clearCaption(); showVisual(buildMotes(14));
      setCaption(R.kicker, R.line, "");
      const card = showCard(
        `<div class="miss">
           <div class="miss-grid">${R.rows.map((r) =>
            `<div class="miss-row" data-seq><span class="mq">${r.q}</span><span class="ma">= ${r.wrong}</span><span class="mx">✕</span></div>`).join("")}</div>
           <div class="miss-pattern" id="missPat"><span class="mp-line"></span><b>${R.pattern}</b></div>
         </div>`, "miss-card with-proof");
      const shot = framedShot(R.shot, { cap: R.shotCap, url: "app.bodhan.ai · Grading", tall: true });
      shot.classList.add("proof-inset"); card.appendChild(shot);
      return [
        { at: R.rows.length * 430 + 900, fn: () => { popText(els.title, `<span class="grad">${R.punch}</span>`); } },
        { at: R.rows.length * 430 + 1400, fn: () => card.querySelector("#missPat").classList.add("on") },
      ];
    },
  });
}

// ---- 14 — Close ----------------------------------------------------
function sceneClose() {
  const R = REEL.close;
  return makeClockScene({
    id: "close", hold: true,
    enter() {
      clearCaption(); showVisual(buildStars(80));
      const card = showCard(
        `<div class="close-cols">
           <div class="cc a">${R.lines.map((l) => `<div class="cc-line" data-seq>${l}</div>`).join("")}</div>
           <div class="cc-div" data-seq></div>
           <div class="cc b">${R.linesB.map((l) => `<div class="cc-line" data-seq>${l}</div>`).join("")}</div>
         </div>`, "close-card");
      return [
        { at: 4200, fn: () => {
          els.stage.querySelectorAll(".center-card").forEach((n) => n.remove());
          const end = document.createElement("div"); end.className = "end-card";
          end.innerHTML =
            `<span class="bird bird-lg"><svg viewBox="0 0 100 100"><path class="bird-path" d="M20 62 L52 28 L74 44 L54 51 L67 72 L45 59 L30 74 Z"/></svg></span>
             <div class="end-eyebrow">${R.endEyebrow}</div>
             <div class="end-title">${R.endTitle}</div>
             <div class="end-sub">${R.endSub}</div>
             <div class="logo-grid">${R.platforms.map((p) => `<div class="logo-chip ph"><div class="ln">${p.name}</div><div class="tag">TBD</div></div>`).join("")}</div>
             <button class="start-btn replay-btn" id="replayBtn">↺ Replay the film</button>`;
          els.stage.appendChild(end);
          end.querySelector("#replayBtn").addEventListener("click", () => { Reel.ml = false; Reel.goToScene(0); Music.restart(); });
          Music.fadeOut(2600);
        } },
      ];
    },
    exit() {},
  });
}

/* =====================================================================
   Scene table + chapter names
   ===================================================================== */
function buildScenes() {
  return [
    sceneOpen(),
    chatScene("withheld", REEL.withheld, { beat: true, bg: () => buildMotes(20) }),
    chatScene("socratic", REEL.socratic, { proof: true, bg: () => buildMotes(20) }),
    sceneIKS(), sceneActive(), sceneAtlas(), sceneMCQ(), sceneHints(),
    sceneTurn(), sceneLessons(), sceneWorksheets(), sceneLocal(),
    sceneMisconception(), sceneClose(),
  ];
}
const CHAPTERS = ["Open", "Withheld answer", "Socratic", "IKS", "Active learning", "Atlas",
  "MCQs", "Hints", "Turn to teachers", "Lesson plans", "Worksheets", "Local context",
  "Misconception", "Close"];
// Scenes carrying a multilingual example (enables the 🌐 toggle).
const HAS_ML = { socratic: 1, active: 1, atlas: 1, mcq: 1, hints: 1 };

/* =====================================================================
   Music controller (no voiceover; ducks under interactive demos)
   ===================================================================== */
const Music = {
  el: els.music, ctx: null, src: null, gain: null, ready: false, base: 0.55, _pendingSeek: null,
  init() {
    if (this.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.src = this.ctx.createMediaElementSource(this.el);
      this.gain = this.ctx.createGain(); this.gain.gain.value = this.base;
      this.src.connect(this.gain).connect(this.ctx.destination); this.ready = true;
    } catch (e) { this.ready = false; }
    this.el.addEventListener("loadedmetadata", () => { if (this._pendingSeek != null) { this.seek(this._pendingSeek); this._pendingSeek = null; } });
  },
  start() {
    this.init();
    this.el.volume = this.ready ? 1 : this.base;
    if (this.ready && this.gain) this.gain.gain.value = this.base;
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
    this.seek(0); this.el.play().catch(() => {});
  },
  seek(sec) { const d = this.el.duration; if (!d || isNaN(d)) { this._pendingSeek = sec; return; } try { this.el.currentTime = Math.max(0, sec) % d; } catch (e) {} },
  seekToScene(i) { this.seek((Reel.sceneOffsets && Reel.sceneOffsets[i]) || 0); },
  pause() { this.el.pause(); },
  resume() { if (this.ctx && this.ctx.state === "suspended") this.ctx.resume().catch(() => {}); this.el.play().catch(() => {}); },
  restart() { this.start(); this.unduck(); },
  fadeTo(v, ms) {
    v = Math.max(0.0001, v);
    if (this.ready && this.gain) {
      const now = this.ctx.currentTime;
      this.gain.gain.cancelScheduledValues(now);
      this.gain.gain.setValueAtTime(this.gain.gain.value, now);
      this.gain.gain.linearRampToValueAtTime(v, now + ms / 1000);
    } else {
      const s = this.el.volume, t0 = performance.now();
      const step = () => { const p = Math.min(1, (performance.now() - t0) / ms); this.el.volume = s + (v - s) * p; if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }
  },
  duck() { this.fadeTo(this.base * 0.4, 400); },
  unduck() { this.fadeTo(this.base, 600); },
  fadeOut(ms = 2400) { this.fadeTo(0, ms); },
};

/* =====================================================================
   Reel sequencer  (same contract as the AI4B engine)
   ===================================================================== */
let reelRaf = 0;
function reelTick() {
  const sc = Reel.scenes[Reel.idx];
  if (sc) {
    let localFrac = 0;
    if (sc.driver === "clock" && !Reel.paused) {
      const t = performance.now() - Reel.startMs;
      if (sc.update) sc.update(t);
      localFrac = sc.duration === Infinity ? 1 : Math.min(1, t / sc.duration);
      if (sc.duration !== Infinity && t >= sc.duration) Reel.next();
    }
    if (els.rail) els.rail.style.width = ((Reel.idx + localFrac) / Reel.scenes.length * 100).toFixed(2) + "%";
  }
  reelRaf = requestAnimationFrame(reelTick);
}
function clearScene() {
  els.chips.innerHTML = ""; els.extra.innerHTML = "";
  els.stage.querySelectorAll(".end-card, .center-card").forEach((n) => n.remove());
}
function triggerWipe() { els.wipe.classList.remove("active"); void els.wipe.offsetWidth; els.wipe.classList.add("active"); }
function sceneEstSeconds(sc) { return (sc.duration && sc.duration !== Infinity) ? sc.duration / 1000 : 6; }

const Reel = {
  scenes: [], idx: -1, startMs: 0, paused: false, _pausedAt: 0, sceneOffsets: [], ml: false,
  init(s) { this.scenes = s; this.computeOffsets(); },
  computeOffsets() { let acc = 0; this.sceneOffsets = this.scenes.map((sc) => { const o = acc; acc += sceneEstSeconds(sc); return o; }); },
  start() { this.goToScene(0); },
  goToScene(i) {
    if (i < 0 || i >= this.scenes.length) return;
    const prev = this.idx >= 0 ? this.scenes[this.idx] : null;
    if (prev && prev.exit) prev.exit();
    clearScene();
    this.idx = i; this.paused = false; this.startMs = performance.now();
    const sc = this.scenes[i];
    els.body.dataset.scene = sc.id;
    triggerWipe();
    // multilingual toggle visibility + duck music on interactive/demo beats
    if (HAS_ML[sc.id]) { els.mlToggle.hidden = false; els.mlToggle.classList.toggle("on", this.ml); els.mlLabel.textContent = this.ml ? "English" : "multilingual"; }
    else els.mlToggle.hidden = true;
    if (sc.id === "active") Music.duck(); else Music.unduck();
    if (sc.enter) sc.enter();
    if (els.chapter) els.chapter.textContent = `${i + 1} / ${this.scenes.length} · ${CHAPTERS[i]}`;
    pulseCaption();
    if (!reelRaf) reelRaf = requestAnimationFrame(reelTick);
  },
  next() { if (this.idx < this.scenes.length - 1) this.goToScene(this.idx + 1); },
  prev() { if (this.idx > 0) this.goToScene(this.idx - 1); },
  pause() { if (this.paused) return; this.paused = true; this._pausedAt = performance.now(); els.body.classList.add("paused"); },
  resume() { if (!this.paused) return; this.paused = false; this.startMs += performance.now() - this._pausedAt; els.body.classList.remove("paused"); },
};

/* =====================================================================
   Controls + boot
   ===================================================================== */
function togglePause() {
  if (Reel.paused) { Reel.resume(); Music.resume(); }
  else { Reel.pause(); Music.pause(); }
}
function goNext() { const b = Reel.idx; Reel.next(); if (Reel.idx !== b) Music.seekToScene(Reel.idx); }
function goPrev() { const b = Reel.idx; Reel.prev(); if (Reel.idx !== b) Music.seekToScene(Reel.idx); }

async function boot() {
  // Preload the product screenshots so scene reveals don't flash empty frames.
  try {
    const imgs = ["Atlas", "hint", "scafolding_socratic", "interactive_convexlens",
      "LessonPlan1", "LessonPlan2", "Assessment1", "child_safety"];
    imgs.forEach((n) => { const im = new Image(); im.src = "images/" + n + ".png"; });
  } catch (e) {}
  Reel.init(buildScenes());
  els.startBtn.disabled = false;
  els.startBtn.textContent = "▶  Start the Film";
  els.mlToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    Reel.ml = !Reel.ml;
    Reel.goToScene(Reel.idx);
    Music.seekToScene(Reel.idx);
  });
}

els.startBtn.addEventListener("click", () => {
  els.gate.classList.add("hide");
  els.stage.hidden = false;
  Music.start();
  Reel.start();
});
els.stage.addEventListener("click", (e) => { if (e.target.closest(".ml-toggle, .replay-btn")) return; togglePause(); });
document.addEventListener("keydown", (e) => {
  if (els.stage.hidden) return;
  if (e.code === "Space") { e.preventDefault(); togglePause(); }
  else if (e.code === "ArrowRight") goNext();
  else if (e.code === "ArrowLeft") goPrev();
});

// gate copy from reel
els.startBtn && (function () {
  const g = REEL.gate || {};
  const t = document.getElementById("gateTitle"), ey = document.getElementById("gateEyebrow");
  if (t && g.title) t.textContent = g.title;
  if (ey && g.eyebrow) ey.textContent = g.eyebrow;
})();

boot();
