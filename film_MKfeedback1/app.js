/* ===================================================================
   TutorBot — capability film engine (MK-feedback cut)
   A Reel sequencer walks 14 scenes that mirror ../prompt.txt:
   Open · Section 1 The Foundation · Section 2 the four learning
   principles · Section 3 Where we are today · Section 4 the next nine
   months (Classroom Pilots + Teacher AI: worksheets, lesson plans,
   voice admin assistant) · Closing vision.
   One reelTick() RAF loop drives the clock scenes; every scene runs a
   keyframe timeline (runTimeline) for video-style staged reveals.
   Text + product UI only, no voiceover — a music bed (audio/music.mp3)
   plays underneath and ducks on the interactive beats.
   Engine forked from the AI4B-Transcribe capability-film engine.
   =================================================================== */
"use strict";
const SVGNS = "http://www.w3.org/2000/svg";
const rand = (a, b) => a + Math.random() * (b - a);

// Official Bodhan origami-swan mark (transparent PNG; inlined by bundle.py for offline use).
const BIRD = `<img class="bmark" src="images/bodhan_mark.png" alt="Bodhan" />`;
// India map SVG (states carry data-state); loaded in boot(), or inlined by bundle.py.
let INDIA_SVG = "";

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
  timecode: document.getElementById("timecode"),
  music: document.getElementById("music"),
  clipLessons: document.getElementById("clipLessons"),
  clipAdmin: document.getElementById("clipAdmin"),
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
// Type `text` into `el` one character at a time; returns {kfs, end}.
// Chars are pre-placed (final wrapped layout fixed) and revealed one by one — so a long prompt
// never reflows/jumps lines as it types.
function typeKfs(el, text, start, step) {
  const kfs = []; step = step || 26;
  el.innerHTML = [...text].map((ch) => `<span class="tc">${ch === " " ? " " : ch === "<" ? "&lt;" : ch}</span>`).join("");
  const spans = [...el.querySelectorAll(".tc")];
  kfs.push({ at: start, fn: () => el.classList.add("typing-live") });
  spans.forEach((sp, n) => kfs.push({ at: start + (n + 1) * step, fn: () => sp.classList.add("on") }));
  const end = start + text.length * step;
  kfs.push({ at: end + 120, fn: () => el.classList.remove("typing-live") });
  return { kfs, end: end + 120 };
}
// Sutradhara — a short standalone "chapter card": one quiet italic line, centred, with a small
// flourish, on a calm backdrop. A watching voice that hands you into the next section.
function sceneSutra(id, text, cloud) {
  return makeClockScene({
    id, duration: cloud ? 5800 : 4200,
    enter() {
      clearCaption();
      const viz = buildMotes(14);
      if (cloud) viz.appendChild(buildWordCloud(cloud));
      showVisual(viz);
      const card = showCard(
        `<div class="sutra-slide"><span class="sutra-rule"></span><div class="sutra-text">${text}</div></div>`,
        "sutra-card");
      const line = card.querySelector(".sutra-slide");
      // when a word cloud is present, let it drift in and settle first, then bring the line in
      return [{ at: cloud ? 1700 : 450, fn: () => line.classList.add("on") }];
    },
  });
}
// faint, slowly-drifting pedagogy terms behind an Interlude card
function buildWordCloud(terms) {
  const c = document.createElement("div"); c.className = "wordcloud";
  // scattered anchor positions (%) — spread across the frame, clear of the centre line
  // kept out of the central band (x22–78, y38–62) so nothing collides with the interlude line
  const spots = [
    [38, 8], [63, 12], [16, 15], [84, 10], [50, 22], [27, 27], [73, 25], [9, 32],
    [40, 70], [63, 84], [24, 86], [80, 72], [52, 91], [14, 75], [89, 83], [34, 79],
  ];
  terms.forEach((term, i) => {
    const el = document.createElement("span");
    el.className = "wc-term" + (term.strike ? " wc-strike" : "") + (term.hot ? " wc-hot" : "");
    el.textContent = term.t;
    const p = spots[i % spots.length];
    el.style.left = p[0] + "%"; el.style.top = p[1] + "%";
    el.style.setProperty("--wc-s", (term.s || 1));
    el.style.animationDuration = (16 + i * 2) + "s";
    el.style.animationDelay = (-i * 1.7) + "s";
    c.appendChild(el);
  });
  return c;
}
// Stream a headline into the top caption word by word; returns {kfs, end}.
// All words are pre-placed (final layout fixed) and faded in one by one — so the line NEVER
// reflows/jitters as it "types" (fixes the last-word-wraps-then-jumps-back problem).
function streamTitle(line, punch, start, gap) {
  start = start || 400; gap = gap || 130;
  const words = [...String(line).split(" ").filter(Boolean).map((w) => ({ w, g: false })),
                 ...String(punch || "").split(" ").filter(Boolean).map((w) => ({ w, g: true }))];
  els.title.innerHTML = words.map((x) => `<span class="sw${x.g ? " grad" : ""}">${x.w}</span>`).join(" ");
  const spans = [...els.title.querySelectorAll(".sw")];
  const kfs = [];
  spans.forEach((sp, i) => kfs.push({ at: start + i * gap, fn: () => sp.classList.add("on") }));
  const end = start + words.length * gap;
  return { kfs, end: end + 60 };
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
// A warm Indian-classroom backdrop: sunlit wall, green chalkboard, ceiling fan,
// a barred window, a wall map, and a row of bench-desks along the bottom.
function buildClassroom() {
  const w = frame("viz-tint viz-class");
  // Simplified: just a subtle chalkboard motif (fan / wall-map / window / desks removed to declutter).
  w.innerHTML =
    `<div class="cl-board"><span class="cl-chalk">½ + ¼ = ?</span><span class="cl-chalk cl-chalk2">TODAY'S LESSON</span><span class="cl-tray"></span></div>`;
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
    `<div class="chat-top"><span class="ct-mark">${BIRD}</span><span class="ct-name">Tutor<b>Bot</b></span>` +
    (meta.subject ? `<span class="ct-subj">${meta.subject}</span>` : "") + `</div>` +
    `<div class="chat-scroll"></div>`;
  return wrap;
}
function addBubble(scroll, m) {
  const row = document.createElement("div"); row.className = "msg " + m.who;
  if (m.who === "bot") {
    row.innerHTML = `<span class="av">${BIRD}</span><div class="bwrap"><div class="bhead"> </div>` +
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
      const appear = t + 1500;
      kfs.push({ at: appear, fn: () => { typing(scroll, false); addBubble(scroll, m); } });
      t = appear + readMs(m.text) * 1.35;
    } else {
      kfs.push({ at: t, fn: () => addBubble(scroll, m) });
      t = t + readMs(m.text) * 1.05;
    }
  });
  return { kfs, end: t };
}

/* =====================================================================
   Framed product screenshot — browser-window chrome + slow camera push,
   optional annotation pin. Used for the real hint / lesson-plan /
   interactive / child-safety captures.
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
   Thin-lens helper for the convex-lens sim (Principle 4).
   doPx = object distance in px; FPX = focal length in px.
   Returns image distance di, magnification m (negative = inverted).
   ===================================================================== */
const FPX = 78;
function lensStats(doPx) {
  const di = (doPx * FPX) / (doPx - FPX);      // 1/v - 1/u = 1/f (real-image branch)
  const m = -di / doPx;
  return { di, m };
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
      const auto = revealSeq(els.stage, "[data-seq]", 1400, 560);
      kfs = auto.concat(own).sort((a, b) => a.at - b.at);
      pulseCaption();
    },
    update(t) { runTimeline(tl, t, kfs); if (update) update.call(this, t); },
    exit() { if (exit) exit(); },
  };
}
// Add a timed caption-callout ("💡 …") to a card; returns its keyframe.
function calloutKf(card, text, at) {
  const cap = document.createElement("div"); cap.className = "beat-cap"; cap.innerHTML = `💡 ${text}`;
  card.appendChild(cap);
  return { at, fn: () => cap.classList.add("on") };
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
         <div class="o-specs"><div class="o-spec"></div><div class="o-spec"></div></div>`, "open-card");
      const swap = card.querySelector(".o-swap");
      const specsBox = card.querySelector(".o-specs");
      const specEls = [...card.querySelectorAll(".o-spec")];
      const say = (text, cls) => { swap.className = "o-swap o-line" + (cls ? " " + cls : ""); swap.innerHTML = text; void swap.offsetWidth; swap.classList.add("text-pop"); };
      const kfs = [
        { at: 350, fn: () => say(R.lines[0]) },
        { at: 1650, fn: () => say(R.lines[1]) },
        { at: 2950, fn: () => say(R.lines[2]) },
        { at: 4400, fn: () => say(R.tease, "o-tease") },
        { at: 5500, fn: () => say(`<span class="mark-inline">${BIRD}</span>${R.logo}`, "o-logo") },
      ];
      let t = 6100;
      kfs.push({ at: t - 150, fn: () => specsBox.classList.add("show") });
      const STEP = 24;
      R.specs.forEach((txt, i) => {
        const el = specEls[i], start = t;
        kfs.push({ at: start, fn: () => { el.textContent = ""; } });
        for (let n = 1; n <= txt.length; n++) kfs.push({ at: start + n * STEP, fn: () => { el.textContent = txt.slice(0, n); } });
        t = start + txt.length * STEP + 450;
      });
      return kfs;   // open ends on the TutorBot lockup + specs — no closing tagline
    },
  });
}

// ---- 2 — SECTION 1 · The Foundation (pipeline) ----------------------
function sceneFoundation() {
  const R = REEL.foundation;
  return makeClockScene({
    id: "foundation", duration: R.dur,
    enter() {
      clearCaption(); showVisual(buildMotes(20));
      // The headline streams in word by word (like tokens); then a pause; then the centre
      // pipeline builds one stage at a time.
      setCaption(`${R.kicker}`, "", "");
      const card = showCard(
        `<div class="found" id="fPipe">
           <div class="pipe">${R.pipeline.map((s, i) =>
            `${i ? `<div class="pipe-arrow" data-p="${i}"><span></span></div>` : ""}` +
            `<div class="pipe-stage" data-p="${i}"><div class="ps-ico">${s.ico}</div>` +
            `<div class="ps-title">${s.title}</div><div class="ps-sub">${s.sub}</div></div>`).join("")}</div>
         </div>`, "found-card");
      const pipe = card.querySelector("#fPipe");
      const stages = [...card.querySelectorAll(".pipe-stage")];
      const arrows = [...card.querySelectorAll(".pipe-arrow")];
      // 1 — stream the headline, word by word (pre-placed so it never reflows/jitters)
      const st = streamTitle(R.line, R.punch, 1300, 155);
      const kfs = st.kfs;
      const streamEnd = st.end;
      // 2 — pause, then the pipeline builds stage → arrow → stage …
      let t = streamEnd + 1400;
      kfs.push({ at: t, fn: () => pipe.classList.add("show") });
      t += 400;
      stages.forEach((s, i) => {
        const onAt = t;
        kfs.push({ at: onAt, fn: () => s.classList.add("on") });
        const sub = s.querySelector(".ps-sub");
        if (sub) kfs.push({ at: onAt + 520, fn: () => sub.classList.add("in") });   // sub-heading arrives a beat later
        t += 1100;
        if (arrows[i]) { kfs.push({ at: t, fn: () => arrows[i].classList.add("on") }); t += 760; }
      });
      kfs.push({ at: t + 200, fn: () => stages[stages.length - 1].classList.add("live") });
      return kfs;
    },
  });
}

// ---- 3 — SECTION 2 · intro (section-title beat) ---------------------
function scenePrinciplesIntro() {
  const R = REEL.principlesIntro;
  return makeClockScene({
    id: "principlesIntro", duration: R.dur,
    enter() {
      clearCaption(); showVisual(buildMotes(22));
      showCard(
        `<div class="section-eyebrow" data-seq>${R.kicker}</div>
         <h2 class="section-title" data-seq>${R.line} <span class="grad">${R.punch}</span></h2>
         <!-- <div class="section-sub" data-seq>${R.sub}</div> -->
         <div class="section-dots" data-seq><i></i><i></i><i></i><i></i></div>`, "section-card");
      return [];
    },
  });
}

// ---- 4 & 5 — Principles 1 & 2 (chat exchanges) ----------------------
function scenePrincipleChat(id, R) {
  return makeClockScene({
    id, duration: R.dur,
    enter() {
      clearCaption(); showVisual(buildMotes(20));
      setCaption(`${R.kicker}`, "", R.sub || "");
      const card = showCard(``, "chat-card principle-card");
      const cf = chatFrame({ subject: R.subject }); card.appendChild(cf);
      cf.style.opacity = "0"; cf.style.transition = "opacity .5s ease";
      // 1 — stream the headline; 2 — pause; 3 — the chat fades in and plays
      const st = streamTitle(R.line, R.punch, 1300, 155);
      const chatStart = st.end + 1100;
      st.kfs.push({ at: chatStart - 400, fn: () => { cf.style.opacity = "1"; } });
      const { kfs, end } = chatKfs(cf.querySelector(".chat-scroll"), R.chat, chatStart);
      const all = st.kfs.concat(kfs);
      if (R.transform) {
        // bottom punchline: show "from", strike it through, then reveal "to"
        const swap = document.createElement("div"); swap.className = "rote-swap";
        swap.innerHTML = `<span class="rs-from">${R.transform.from}</span><span class="rs-arrow">→</span><span class="rs-to">${R.transform.to}</span>`;
        card.appendChild(swap);
        const from = swap.querySelector(".rs-from"), arrow = swap.querySelector(".rs-arrow"), to = swap.querySelector(".rs-to");
        all.push({ at: end + 400, fn: () => swap.classList.add("on") });
        all.push({ at: end + 1600, fn: () => from.classList.add("struck") });
        all.push({ at: end + 2400, fn: () => { arrow.classList.add("on"); to.classList.add("on"); } });
      } else {
        all.push(calloutKf(card, R.caption, end + 300));
      }
      return all;
    },
  });
}

// ---- 6 — Principle 3 · Scaffolding (same steps, three languages side by side) -
// 7a — Scaffolding · the Socratic dialogue in English (reuses the chat system)
function sceneScaffold() {
  const R = REEL.p3;
  return makeClockScene({
    id: "p3", duration: R.dur,
    enter() {
      clearCaption(); showVisual(buildMotes(18));
      setCaption(`${R.kicker}`, "", "");
      const card = showCard(``, "chat-card principle-card");
      const cf = chatFrame({ subject: R.subject }); card.appendChild(cf);
      cf.style.opacity = "0"; cf.style.transition = "opacity .5s ease";
      const st = streamTitle(R.line, R.punch, 1300, 155);
      const chatStart = st.end + 1100;
      st.kfs.push({ at: chatStart - 400, fn: () => { cf.style.opacity = "1"; } });
      const { kfs, end } = chatKfs(cf.querySelector(".chat-scroll"), R.chat, chatStart);
      const all = st.kfs.concat(kfs);
      all.push(calloutKf(card, R.caption, end + 300));
      return all;
    },
  });
}

// 7b — Scaffolding · the SAME dialogue tutored in Hindi + Telugu, side by side
function sceneScaffoldML() {
  const R = REEL.p3;
  return makeClockScene({
    id: "p3ml", duration: R.mlDur,
    enter() {
      clearCaption(); showVisual(buildMotes(18));
      setCaption(`${R.kicker}`, "", "");
      const card = showCard(`<div class="scaf-ml"></div>`, "scaf-ml-card");
      const wrap = card.querySelector(".scaf-ml");
      const frames = R.langs.map((l) => {
        // human touch: a named student, in their state, tutored in their own language
        const cf = chatFrame({ subject: l.who ? `${l.who} · ${l.where}` : l.label });
        cf.classList.add("scaf-ml-col");
        cf.style.opacity = "0"; cf.style.transition = "opacity .5s ease";
        wrap.appendChild(cf); return cf;
      });
      const scrolls = frames.map((f) => f.querySelector(".chat-scroll"));
      const st = streamTitle(R.mlLine, R.mlPunch, 1300, 155);
      const chatStart = st.end + 1100;
      st.kfs.push({ at: chatStart - 400, fn: () => frames.forEach((f) => { f.style.opacity = "1"; }) });
      // both columns reveal the same turn together, paced by the longest text in that turn
      const kfs = []; let t = chatStart;
      R.langs[0].chat.forEach((m, i) => {
        const longest = Math.max(...R.langs.map((l) => readMs(l.chat[i].text)));
        if (m.who === "bot") {
          kfs.push({ at: t, fn: () => scrolls.forEach((s) => typing(s, true)) });
          const appear = t + 1500;
          kfs.push({ at: appear, fn: () => scrolls.forEach((s, ci) => { typing(s, false); addBubble(s, R.langs[ci].chat[i]); }) });
          t = appear + longest * 1.3;
        } else {
          kfs.push({ at: t, fn: () => scrolls.forEach((s, ci) => addBubble(s, R.langs[ci].chat[i])) });
          t = t + longest * 1.05;
        }
      });
      // footer: the same lesson reaches all 22 official Indian languages (native scripts)
      const strip = document.createElement("div"); strip.className = "lang-strip";
      const row = LANGS_22.map((n) => `<span>${n}</span>`).join("");
      strip.innerHTML = `<div class="ls-lead"> NCF 2023 calls for teaching in a child's familiar language.</div>` +
        `<div class="ls-marquee"><div class="ls-track">${row}${row}</div></div>`;
      card.appendChild(strip);
      const all = st.kfs.concat(kfs);
      all.push({ at: t + 300, fn: () => strip.classList.add("on") });
      return all;
    },
  });
}
// The 22 scheduled (8th Schedule) languages of India, each in its own native script.
const LANGS_22 = ["অসমীয়া", "বাংলা", "बड़ो", "डोगरी", "ગુજરાતી", "हिन्दी", "ಕನ್ನಡ", "कॉशुर",
  "कोंकणी", "मैथिली", "മലയാളം", "মৈতৈলোন্", "मराठी", "नेपाली", "ଓଡ଼ିଆ", "ਪੰਜਾਬੀ",
  "संस्कृतम्", "ᱚᱞ ᱪᱤᱠᱤ", "سنڌي", "தமிழ்", "తెలుగు", "اردو"];

// ---- 6b — Rooted in IKS (split screen, short breather) --------------
function sceneIKS() {
  const R = REEL.iks;
  return makeClockScene({
    id: "iks", duration: R.dur,
    enter() {
      clearCaption(); showVisual(buildMotes(18));
      setCaption(R.kicker, `${R.line} <span class="grad">${R.punch}</span>`, R.subject);
      showCard(
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

// ---- 8 — Principle 4 · Activity-Based Learning (convex-lens ray sim) -
function sceneActive() {
  const R = REEL.p4;
  const CX = 300, AY = 165, HO = 44;            // lens centre x, axis y, object height
  return makeClockScene({
    id: "p4", duration: R.dur,
    enter() {
      clearCaption(); showVisual(buildMotes(16));
      setCaption(`${R.kicker}`, "", R.subject);
      const Fl = CX - FPX, Fr = CX + FPX, Fl2 = CX - 2 * FPX, Fr2 = CX + 2 * FPX;
      const mk = (x, lbl) => `<g class="lenspt"><circle cx="${x}" cy="${AY}" r="3.5"/><text x="${x}" y="${AY + 20}">${lbl}</text></g>`;
      const card = showCard(
        `<div class="sim lens-sim">
           <div class="sim-head">${R.simTitle}</div>
           <div class="sim-intro">${R.simIntro}</div>
           <div class="sim-stage">
             <svg viewBox="0 0 600 330" class="lens-svg">
               <line x1="24" y1="${AY}" x2="576" y2="${AY}" class="axis"/>
               <path class="lens" d="M${CX} 60 C ${CX + 34} 110, ${CX + 34} 220, ${CX} 270 C ${CX - 34} 220, ${CX - 34} 110, ${CX} 60 Z"/>
               <line x1="${CX}" y1="52" x2="${CX}" y2="278" class="lens-axis"/>
               ${mk(Fl, "F")}${mk(Fr, "F'")}${mk(Fl2, "2F")}${mk(Fr2, "2F'")}
               <path class="ray ray-a" d=""/><path class="ray ray-b" d=""/><path class="ray ray-c" d=""/>
               <line class="obj-stem" x1="0" y1="0" x2="0" y2="0"/><polygon class="obj-head" points="0,0 0,0 0,0"/>
               <text class="obj-lbl" x="0" y="0">Object</text>
               <line class="img-stem" x1="0" y1="0" x2="0" y2="0"/><polygon class="img-head" points="0,0 0,0 0,0"/>
               <text class="img-lbl" x="0" y="0">Image</text>
             </svg>
             <div class="sim-stats">
               <div class="st"><div class="sv" id="stU">—</div><div class="sl">object dist. (u)</div></div>
               <div class="st"><div class="sv" id="stV">—</div><div class="sl">image dist. (v)</div></div>
               <div class="st"><div class="sv" id="stM">—</div><div class="sl">magnification (m)</div></div>
               <div class="st st-nat"><div class="sv" id="stN">—</div><div class="sl">image nature</div></div>
             </div>
           </div>
           <div class="sim-legend">
             <span><i class="lg-a"></i>Parallel ray → through F'</span>
             <span><i class="lg-b"></i>Ray through centre → undeviated</span>
             <span><i class="lg-c"></i>Ray through F → exits parallel</span>
           </div>
           <div class="sim-tip">💡 ${R.tip}</div>
           <div class="sim-note">${R.note}</div>
         </div>`, "active-card");
      const q = (s) => card.querySelector(s);
      this._sim = {
        doPx: 245, target: 245, Fl, Fr,   // start far beyond 2F (small, inverted), then sweep inward once
        rayA: q(".ray-a"), rayB: q(".ray-b"), rayC: q(".ray-c"),
        objStem: q(".obj-stem"), objHead: q(".obj-head"), objLbl: q(".obj-lbl"),
        imgStem: q(".img-stem"), imgHead: q(".img-head"), imgLbl: q(".img-lbl"),
        stU: q("#stU"), stV: q("#stV"), stM: q("#stM"), stN: q("#stN"),
      };
      // 1 — stream the headline; 2 — pause; 3 — the sim card fades in and animates
      card.style.opacity = "0"; card.style.transition = "opacity .6s ease";
      const st = streamTitle(R.line, R.punch, 1300, 155);
      const base = st.end + 900;
      return st.kfs.concat([
        { at: base - 500, fn: () => { card.style.opacity = "1"; } },
        // one continuous inward glide: far (small) → 2F (same size) → between F & 2F (magnified), then hold
        { at: base + 2000, fn: () => this._sim.target = 156 }, // at 2F → same size
        { at: base + 6800, fn: () => this._sim.target = 128 }, // between F & 2F → magnified (and hold here)
      ]);
    },
    update() {
      const s = this._sim; if (!s) return;
      s.doPx += (s.target - s.doPx) * 0.05;
      const ox = CX - s.doPx, oTip = AY - HO;
      const { di, m } = lensStats(s.doPx);
      const imgX = CX + di, imgTip = AY - m * HO;         // m<0 → tip below axis (inverted)
      // object arrow (up, orange)
      s.objStem.setAttribute("x1", ox); s.objStem.setAttribute("y1", AY);
      s.objStem.setAttribute("x2", ox); s.objStem.setAttribute("y2", oTip);
      s.objHead.setAttribute("points", `${ox - 6},${oTip + 9} ${ox + 6},${oTip + 9} ${ox},${oTip - 2}`);
      s.objLbl.setAttribute("x", ox); s.objLbl.setAttribute("y", oTip - 8);
      // image arrow (down, red)
      s.imgStem.setAttribute("x1", imgX.toFixed(1)); s.imgStem.setAttribute("y1", AY);
      s.imgStem.setAttribute("x2", imgX.toFixed(1)); s.imgStem.setAttribute("y2", imgTip.toFixed(1));
      const hy = imgTip > AY ? imgTip - 9 : imgTip + 9, ty = imgTip > AY ? imgTip + 2 : imgTip - 2;
      s.imgHead.setAttribute("points", `${(imgX - 6).toFixed(1)},${hy.toFixed(1)} ${(imgX + 6).toFixed(1)},${hy.toFixed(1)} ${imgX.toFixed(1)},${ty.toFixed(1)}`);
      s.imgLbl.setAttribute("x", imgX.toFixed(1)); s.imgLbl.setAttribute("y", (imgTip > AY ? imgTip + 20 : imgTip - 8).toFixed(1));
      // rays, all converging on the image tip
      s.rayA.setAttribute("d", `M${ox} ${oTip} L${CX} ${oTip} L${imgX.toFixed(1)} ${imgTip.toFixed(1)}`);
      s.rayB.setAttribute("d", `M${ox} ${oTip} L${imgX.toFixed(1)} ${imgTip.toFixed(1)}`);
      const slopeC = (AY - oTip) / (s.Fl - ox), ycLens = oTip + slopeC * (CX - ox);
      s.rayC.setAttribute("d", `M${ox} ${oTip} L${CX} ${ycLens.toFixed(1)} L${imgX.toFixed(1)} ${ycLens.toFixed(1)}`);
      // stats
      const am = Math.abs(m);
      s.stU.textContent = (s.doPx / FPX).toFixed(2) + "f";
      s.stV.textContent = (di / FPX).toFixed(2) + "f";
      s.stM.textContent = m.toFixed(2) + "×";
      s.stN.textContent = "Real · Inverted · " + (am > 1.08 ? "Magnified" : am < 0.92 ? "Diminished" : "Same size");
    },
  });
}

// ---- 7c — Safe by design (a live guardrail chat that types on + behaviour flow) --
function sceneSafety() {
  const R = REEL.safety;
  return makeClockScene({
    id: "safety", duration: R.dur,
    enter() {
      clearCaption(); showVisual(buildMotes(16));
      setCaption(R.kicker, "", "");
      const card = showCard(``, "safety-card");
      const cf = chatFrame({ subject: R.subject }); card.appendChild(cf);
      cf.style.opacity = "0"; cf.style.transition = "opacity .5s ease";
      // flat single-stroke line icons (accent orange) — calm treatment for a child-safety beat
      const ICONS = [
        '<svg viewBox="0 0 24 24" class="ric"><path d="M8 13v-7.5a1.5 1.5 0 0 1 3 0v6.5"/><path d="M11 5.5v-2a1.5 1.5 0 1 1 3 0v8.5"/><path d="M14 5.5a1.5 1.5 0 0 1 3 0v6.5"/><path d="M17 7.5a1.5 1.5 0 0 1 3 0v8.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7a69.74 69.74 0 0 1 -.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.28 1.28"/></svg>',   // refuses (stopping hand)
        '<svg viewBox="0 0 24 24" class="ric"><path d="M12 20.4C12 20.4 3.7 15 3.7 8.9C3.7 6 5.9 4 8.3 4C10 4 11.3 5 12 6.4C12.7 5 14 4 15.7 4C18.1 4 20.3 6 20.3 8.9C20.3 15 12 20.4 12 20.4Z"/></svg>',   // care (heart outline)
        '<svg viewBox="0 0 24 24" class="ric"><circle cx="12" cy="8" r="3.3"/><path d="M6 18.6c0-3.7 12-3.7 12 0"/></svg>',                                  // trusted adult (person)
      ];
      const flow = document.createElement("div"); flow.className = "safe-flow";
      flow.innerHTML = R.steps.map((s, i) =>
        `${i ? `<span class="sf-arrow">→</span>` : ""}<div class="safe-step"><span class="ss-ico">${ICONS[i]}</span><span class="ss-t">${s.t}</span></div>`).join("");
      card.append(flow);
      const steps = [...flow.querySelectorAll(".safe-step")];
      const arrows = [...flow.querySelectorAll(".sf-arrow")];
      // 1 — stream the headline; 2 — pause; 3 — the chat fades in and types on; 4 — the flow
      const st = streamTitle(R.line, R.punch, 1300, 155);
      const kfs = st.kfs;
      const chatStart = st.end + 900;
      kfs.push({ at: chatStart - 400, fn: () => { cf.style.opacity = "1"; } });
      const chat = chatKfs(cf.querySelector(".chat-scroll"), R.chat, chatStart);
      chat.kfs.forEach((k) => kfs.push(k));
      // the guardrail flow reveals once the refusal has landed
      let t = chat.end + 500;
      steps.forEach((s, i) => {
        if (arrows[i - 1]) kfs.push({ at: t - 300, fn: () => arrows[i - 1].classList.add("on") });
        kfs.push({ at: t, fn: () => s.classList.add("on") });
        t += 950;
      });
      return kfs;
    },
  });
}

// ---- 8 — SECTION 3 · Where we are today (checklist) -----------------
function sceneToday() {
  const R = REEL.today;
  return makeClockScene({
    id: "today", duration: R.dur,
    enter() {
      clearCaption(); showVisual(buildMotes(16));
      setCaption(`${R.kicker}`, "", "");   // 1 — "Where we are today" lands first
      const card = showCard(
        `<div class="check-list">${R.items.map((it) => {
          const rocket = /pilot/i.test(it);   // the launch item gets a 🚀 instead of the green tick
          const mark = rocket ? `<span class="check-box rocket">🚀</span>`
            : `<span class="check-box"><svg viewBox="0 0 24 24"><path d="M5 13 L10 18 L19 6"/></svg></span>`;
          return `<div class="check-row${rocket ? " is-rocket" : ""}">${mark}<span class="check-text">${it}</span></div>`;
        }).join("")}</div>`,
        "check-card");
      const rows = [...card.querySelectorAll(".check-row")];
      // 2 — then the headline streams in; 3 — then the checklist ticks through
      const st = streamTitle(R.line, R.punch, 1500, 150);
      const kfs = st.kfs;
      const base = st.end + 900;
      rows.forEach((r, i) => kfs.push({ at: base + i * 1250, fn: () => r.classList.add("on") }));
      return kfs;
    },
  });
}

// ---- 9 — SECTION 4A · Classroom Pilots ------------------------------
function scenePilots() {
  const R = REEL.pilots;
  return makeClockScene({
    id: "pilots", duration: R.dur,
    enter() {
      clearCaption(); showVisual(buildMotes(18));
      const L = R.launch;
      // Centred like the rest of the film: kicker → big launch headline → partnership (seal badge)
      // → the four measures as a centred row of cards (consistent orange line icons, no emoji).
      // line icons that stroke themselves in (pathLength="1" + dash animation, see styles.css)
      const ICONS = [
        '<svg viewBox="0 0 22 22" class="ric"><circle cx="11" cy="11" r="8" pathLength="1"/><circle cx="11" cy="11" r="4.2" pathLength="1"/><circle class="fdot" cx="11" cy="11" r="1.7"/></svg>',   // learning outcomes (target)
        '<svg viewBox="0 0 22 22" class="ric"><path pathLength="1" d="M11 3 L12.8 9.2 L19 11 L12.8 12.8 L11 19 L9.2 12.8 L3 11 L9.2 9.2 Z"/></svg>',                                                 // student engagement (spark)
        '<svg viewBox="0 0 22 22" class="ric"><circle cx="11" cy="7.2" r="3.2" pathLength="1"/><path pathLength="1" d="M4.6 18 C4.6 12.8, 17.4 12.8, 17.4 18"/></svg>',                              // teacher adoption (person)
        '<svg viewBox="0 0 22 22" class="ric"><rect x="3.2" y="4.8" width="15.6" height="11" rx="1.8" pathLength="1"/><path pathLength="1" d="M7.3 10.4 l2.5 2.5 l4.7 -4.7"/></svg>',                 // classroom usability (board + check)
      ];
      const cards = R.measures.map((m, i) =>
        `<div class="pc-m"><span class="mico">${ICONS[i]}</span><span class="mtext">${m.text}</span></div>`).join("");
      const card = showCard(
        `<div class="pilots-center">
           <div class="pc-kicker">${R.kicker}</div>
           <h2 class="pc-head">
             <span class="hl hl-1">${L.pre} <span class="grad">${L.date}</span></span>
             <span class="hl hl-2">in ${L.where}</span>
           </h2>
           <div class="pc-partner"><img class="pl-badge" src="images/ap_emblem.png" alt="Government of Andhra Pradesh" /><span>${L.partner}</span></div>
           <div class="pc-lead">${R.lead}</div>
           <div class="pc-measures">${cards}</div>
         </div>`, "pilots2-card");
      const mrows = [...card.querySelectorAll(".pc-m")];
      const kfs = [];
      // paced build — each beat lands, settles, then the next arrives
      const seq = [
        [500, ".pc-kicker"],    // eyebrow
        [1250, ".hl-1"],        // "Launching on September 5"
        [1950, ".hl-2"],        // "in Andhra Pradesh"
        [3000, ".pc-partner"],  // seal + partnership
        [4000, ".pc-lead"],     // "What the pilots will measure"
      ];
      seq.forEach(([at, sel]) => { const el = card.querySelector(sel); kfs.push({ at, fn: () => el.classList.add("on") }); });
      mrows.forEach((el, i) => kfs.push({ at: 4800 + i * 560, fn: () => el.classList.add("on") }));  // cards draw in one at a time
      return kfs;
    },
  });
}

// ---- 10 — SECTION 4B · Teachers need AI too (student side → teacher) -
function sceneTeacherTurn() {
  const R = REEL.teacherTurn;
  return makeClockScene({
    id: "teacherTurn", duration: R.dur,
    enter() {
      clearCaption(); showVisual(buildMotes(14));
      // The whole slide is a classroom blackboard; the two-sides story is written in chalk —
      // students' side ticked off (✓ done), teachers' side as the next chalk to-do (→ next).
      const S = R.modes[0], T = R.modes[1];
      const chalkCol = (m, cls, mark) =>
        `<div class="chalk-col ${cls}">
           <div class="chalk-tag" data-c>${m.tag} <b>${m.state === "done" ? "✓ done" : "→ next"}</b></div>
           <ul>${m.items.map((it) => `<li data-c><span class="ck">${mark}</span><span>${it}</span></li>`).join("")}</ul>
         </div>`;
      const card = showCard(
        `<div class="board">
           <div class="board-surface">
             <div class="chalk-head" id="cHead">${R.line}</div>
             <div class="chalk-cols">
               ${chalkCol(S, "c-done", "✓")}
               <div class="chalk-div" id="cDiv"></div>
               ${chalkCol(T, "c-next", "→")}
             </div>
           </div>
           <div class="board-tray"><i class="chalk-a"></i><i class="chalk-b"></i></div>
         </div>`, "board-card");
      card.style.opacity = "0"; card.style.transition = "opacity .5s ease";
      const head = card.querySelector("#cHead");
      const div = card.querySelector("#cDiv");
      const sItems = [...card.querySelectorAll(".c-done [data-c]")];
      const tItems = [...card.querySelectorAll(".c-next [data-c]")];
      const kfs = [];
      kfs.push({ at: 400, fn: () => { card.style.opacity = "1"; } });
      kfs.push({ at: 800, fn: () => head.classList.add("on") });     // chalk headline + underline draw
      let t = 1700;
      sItems.forEach((el, i) => kfs.push({ at: t + i * 360, fn: () => el.classList.add("on") }));   // tick off the student side
      t += sItems.length * 360 + 350;
      kfs.push({ at: t, fn: () => div.classList.add("on") });          // chalk divider draws down
      t += 550;
      tItems.forEach((el, i) => kfs.push({ at: t + i * 430, fn: () => el.classList.add("on") }));   // the teacher to-do, one by one
      return kfs;
    },
  });
}

// ---- 11 — B1 · Differentiated Worksheets (prompt → two worksheets) --
function sceneWorksheets() {
  const R = REEL.worksheets;
  return makeClockScene({
    id: "worksheets", duration: R.dur,
    enter() {
      clearCaption(); showVisual(buildMotes(16));
      setCaption(R.kicker, "", "");
      const card = showCard(
        `<div class="prompt-bar"><span class="pb-label">Teacher</span><span class="pb-text" id="pbText"></span><span class="pb-caret">▌</span></div>
         <div class="ws2-row">${R.cards.map((c) =>
          `<div class="ws2-card t-${c.tint}">
             <div class="ws2-head"><span class="ws2-who">${c.who}</span><span class="ws2-focus">${c.focus}</span></div>
             <ul class="ws2-items">${c.items.map((it) => `<li>${it}</li>`).join("")}</ul>
             <div class="ws2-note">${c.note}</div>
           </div>`).join("")}</div>`, "ws2-wrap");
      card.style.opacity = "0"; card.style.transition = "opacity .5s ease";
      const pb = card.querySelector("#pbText");
      const cards = [...card.querySelectorAll(".ws2-card")];
      // 1 — stream headline; 2 — pause; 3 — the prompt types, then the worksheets fan in
      const st = streamTitle(R.line, R.punch, 1300, 155);
      const kfs = st.kfs;
      kfs.push({ at: st.end + 600, fn: () => { card.style.opacity = "1"; } });
      const typed = typeKfs(pb, R.prompt, st.end + 1000, 22);
      typed.kfs.forEach((k) => kfs.push(k));
      const end = typed.end;
      cards.forEach((c, i) => kfs.push({ at: end + 500 + i * 800, fn: () => c.classList.add("on") }));
      kfs.push(calloutKf(card, R.caption, end + 500 + cards.length * 800 + 300));
      return kfs;
    },
  });
}

// ---- 12 — B2 · Differentiated Lesson Plans (prompt → two-track plan) -
function sceneLessons() {
  const R = REEL.lessons;
  return makeClockScene({
    id: "lessons", duration: R.dur,
    enter() {
      clearCaption(); showVisual(buildMotes(14));
      setCaption(R.kicker, "", "");
      const lz = R.localize;
      // No screenshot — the two-track plan is the whole stage, so it can breathe wider.
      const tA = R.tracks[0], tC = R.tracks[1];   // Still struggling / Ready to stretch
      // ONE plan, two lanes: a shared central spine of numbered steps; each step forks into a
      // differentiated activity on the left (still struggling) and the right (ready to stretch).
      const card = showCard(
        `<div class="lp2-main solo">
           <div class="prompt-bar"><span class="pb-label">Teacher</span><span class="pb-text" id="pbText"></span><span class="pb-caret">▌</span></div>
           <div class="lp1">
             <div class="lp1-head">
               <span class="lp1-lane a" data-h>${tA.label}</span>
               <span class="lp1-plan" data-h>One plan · both speeds</span>
               <span class="lp1-lane c" data-h>${tC.label}</span>
             </div>
             <div class="lp1-grid">
               <span class="lp1-spine"></span>
               ${tA.steps.map((s, i) =>
                 `<div class="lp1-cell left"><span class="lp1-phase">${s.e}</span><span class="lp1-txt">${s.t}</span></div>` +
                 `<div class="lp1-node">${i + 1}</div>` +
                 `<div class="lp1-cell right"><span class="lp1-phase">${tC.steps[i].e}</span><span class="lp1-txt">${tC.steps[i].t}</span></div>`
               ).join("")}
             </div>
           </div>
           <div class="lp2-localize" id="lpLocal">
             <span class="lz-badge">Localising for Darbhanga</span>
             <div class="lz-text">${lz.pre}<span class="lz-strike" id="lzStrike">${lz.strike}</span><span class="lz-swap" id="lzSwap">${lz.swap}</span>${lz.post}</div>
           </div>
         </div>`, "lessons2-card");
      card.style.opacity = "0"; card.style.transition = "opacity .5s ease";
      const pb = card.querySelector("#pbText");
      const heads = [...card.querySelectorAll("[data-h]")];
      const nodes = [...card.querySelectorAll(".lp1-node")];
      const cells = [...card.querySelectorAll(".lp1-cell")];
      const spine = card.querySelector(".lp1-spine");
      const local = card.querySelector("#lpLocal");
      const strike = card.querySelector("#lzStrike");
      const swap = card.querySelector("#lzSwap");
      // 1 — stream headline; 2 — pause; 3 — the prompt types at teacher-voice pace (~8.5s clip)
      const st = streamTitle(R.line, R.punch, 1300, 155);
      const TYPE_SPAN = 8200;   // pace typing to the Ashutosh voice clip
      const step = Math.max(20, Math.round(TYPE_SPAN / Math.max(1, R.prompt.length)));
      const typed = typeKfs(pb, R.prompt, st.end + 1000, step);
      const kfs = st.kfs.concat(typed.kfs); const end = typed.end;
      kfs.push({ at: st.end + 600, fn: () => { card.style.opacity = "1"; } });
      kfs.push({ at: st.end + 1000, fn: () => Clip.play(els.clipLessons) });   // teacher's voice
      // headers land → the spine draws down → each numbered step beads in, both lanes branching out
      let t = end + 600;
      heads.forEach((h, i) => kfs.push({ at: t + i * 130, fn: () => h.classList.add("on") }));
      t += 800;
      kfs.push({ at: t, fn: () => spine.classList.add("on") });
      t += 380;
      for (let r = 0; r < nodes.length; r++) {
        kfs.push({ at: t, fn: () => nodes[r].classList.add("on") });
        kfs.push({ at: t + 130, fn: () => cells[r * 2] && cells[r * 2].classList.add("on") });
        kfs.push({ at: t + 260, fn: () => cells[r * 2 + 1] && cells[r * 2 + 1].classList.add("on") });
        t += 760;
      }
      // the localisation lands a beat later, once the plan has settled
      t += 900;
      kfs.push({ at: t, fn: () => local.classList.add("on") });
      kfs.push({ at: t + 1000, fn: () => strike.classList.add("struck") });
      kfs.push({ at: t + 1550, fn: () => swap.classList.add("in") });
      kfs.push(calloutKf(card, R.caption, t + 2300));
      return kfs;
    },
  });
}

// ---- 13 — B3 · Administrative Assistant (voice → transcript → notes) -
function sceneAdmin() {
  const R = REEL.admin;
  return makeClockScene({
    id: "admin", duration: R.dur,
    enter() {
      clearCaption(); showVisual(buildMotes(14));
      setCaption(R.kicker, "", "");
      const bars = Array.from({ length: 32 }, (_, i) =>
        `<span class="wbar" style="--d:${(i % 7) * 0.09}s;--h:${28 + (i * 37 % 60)}%"></span>`).join("");
      const card = showCard(
        `<div class="voice">
           <div class="mic-wrap">
             <button class="mic" id="mic"><span class="mic-ico">🎙</span><span class="mic-ring"></span></button>
             <div class="wave" id="wave">${bars}</div>
             <div class="mic-hint" id="micHint">${R.micHint}</div>
           </div>
           <div class="vtrans" id="vtrans">${R.transcript.map(() => `<div class="vline"></div>`).join("")}</div>
           <div class="vgen" id="vgen"><span class="vg-spin"></span>${R.genLabel}</div>
           <div class="notes" id="notes">${R.notes.map((n) =>
            `<div class="note t-${n.tint}"><div class="note-head"><span class="note-to">${n.to}</span>${n.lang ? `<span class="note-lang">🌐 ${n.lang}</span>` : ""}</div><div class="note-body${n.deva ? " deva" : ""}">${n.body}</div></div>`).join("")}</div>
         </div>`, "admin-card");
      const mic = card.querySelector("#mic");
      const wave = card.querySelector("#wave");
      const hint = card.querySelector("#micHint");
      const lines = [...card.querySelectorAll(".vline")];
      const gen = card.querySelector("#vgen");
      const notes = [...card.querySelectorAll(".note")];
      const voice = card.querySelector(".voice");
      voice.style.opacity = "0"; voice.style.transition = "opacity .5s ease";
      // 0 — stream the headline first, then a pause, then the voice UI fades in
      const st = streamTitle(R.line, R.punch, 1300, 155);
      const kfs = st.kfs;
      const B = st.end + 900;
      kfs.push({ at: B - 500, fn: () => { voice.style.opacity = "1"; } });
      // 1 — start "listening" (play the teacher's voice clip)
      kfs.push({ at: B, fn: () => { mic.classList.add("live"); wave.classList.add("live"); hint.textContent = "Listening…"; Clip.play(els.clipAdmin); } });
      // 2 — transcript types on, paced to the Priya voice clip (~14.6s)
      const CLIP_MS = 14600, GAP = 900;
      const totalChars = R.transcript.join("").length;
      const span = CLIP_MS - 900 - (R.transcript.length - 1) * GAP;   // leave room for gaps + a tail
      const step = Math.max(28, Math.round(span / Math.max(1, totalChars)));
      let t = B + 500;
      R.transcript.forEach((txt, i) => {
        const r = typeKfs(lines[i], txt, t, step);
        r.kfs.forEach((k) => kfs.push(k));
        kfs.push({ at: t, fn: () => lines[i].classList.add("on") });
        t = r.end + GAP;
      });
      // 3 — hand off: stop listening, show generating
      kfs.push({ at: t, fn: () => { mic.classList.remove("live"); mic.classList.add("done"); wave.classList.remove("live"); wave.classList.add("done"); hint.textContent = "Done"; } });
      kfs.push({ at: t + 500, fn: () => gen.classList.add("on") });
      // 4 — hand off to the notes: the mic + transcript clear, the parent notes take the stage
      t += 1600;
      kfs.push({ at: t, fn: () => voice.classList.add("notes-phase") });
      notes.forEach((n, i) => kfs.push({ at: t + 250 + i * 900, fn: () => n.classList.add("on") }));
      kfs.push(calloutKf(card, R.caption, t + 250 + notes.length * 900 + 300));
      return kfs;
    },
  });
}

// ---- 14 — Closing vision -------------------------------------------
function sceneClose() {
  const R = REEL.close;
  return makeClockScene({
    id: "close", hold: true,
    enter() {
      const M = R.map;
      clearCaption(); showVisual(buildStars(80));
      // One card holds the promise lines and (hidden) the India map; we cross-fade between them.
      const card = showCard(
        `<div class="close-stack">
           <div class="vision" id="visionBlk">
             <div class="vision-kicker" data-seq>${R.kicker}</div>
             <div class="vision-lines">${R.lines.map((l) => `<div class="vision-line" data-seq>${l}</div>`).join("")}</div>
           </div>
         </div>`, "close-card");
      const vision = card.querySelector("#visionBlk");
      const seq = [...card.querySelectorAll("[data-seq]")];
      const kfs = [];
      // the promise lines reveal one by one, hold, then hand off straight to the end card (no map)
      seq.forEach((el, i) => kfs.push({ at: 600 + i * 850, fn: () => el.classList.add("on") }));
      const T_END = 600 + seq.length * 850 + 2800;
      kfs.push({ at: T_END - 650, fn: () => vision.classList.add("gone") });

      // Phase C: high-contrast end card
      kfs.push({ at: T_END, fn: () => {
        els.stage.querySelectorAll(".center-card").forEach((n) => n.remove());
        clearCaption(); els.body.classList.add("end-dark");
        const end = document.createElement("div"); end.className = "end-card end-dark-card";
        end.innerHTML =
          `<span class="bird bird-lg">${BIRD}</span>
           <div class="end-eyebrow" style="color:#FFC486">${R.endEyebrow}</div>
           <div class="end-title" style="color:#fff;line-height:1.05">${(R.endTitle || "").replace(/\n/g, "<br>")}</div>
           <div class="end-sub" style="color:#f0dccb">${R.endSub}</div>
           <div class="end-line" style="color:#FFC486">${R.endLine}</div>
           <button class="start-btn replay-btn" id="replayBtn">↺ Replay the film</button>`;
        els.stage.appendChild(end);
        end.querySelector("#replayBtn").addEventListener("click", () => { els.body.classList.remove("end-dark"); Reel.mlIdx = 0; Reel.goToScene(0); Music.restart(); });
        Music.fadeOut(3200);
      } });
      return kfs;
    },
    exit() {},
  });
}

/* =====================================================================
   Scene table + chapter names
   ===================================================================== */
function buildScenes() {
  const S = REEL.sutra;
  return [
    sceneOpen(),
    sceneFoundation(),
    sceneSutra("sutra1", S.principles, PEDAGOGY_CLOUD),
    scenePrinciplesIntro(),
    scenePrincipleChat("p1", REEL.p1),
    scenePrincipleChat("p2", REEL.p2),
    sceneScaffold(),
    sceneScaffoldML(),
    sceneActive(),
    sceneSafety(),
    sceneToday(),
    sceneSutra("sutra3", S.pilots),
    scenePilots(),
    sceneSutra("sutra4", S.teacher),
    sceneTeacherTurn(),
    sceneWorksheets(),
    sceneLessons(),
    sceneAdmin(),
    sceneClose(),
  ];
}
const CHAPTERS = ["Open", "The Foundation", "Interlude", "The Principles", "Constructivism",
  "Dialogic Learning", "Scaffolding", "In their language", "Activity-Based Learning", "Safe by design",
  "Where we are today", "Interlude", "Classroom Pilots",
  "Interlude", "Teachers need AI too", "Worksheets", "Lesson plans", "Admin assistant",
  "The promise"];
// pedagogy word cloud drifting faintly behind the first Interlude
const PEDAGOGY_CLOUD = [
  { t: "inquiry-based learning", s: 1.55, hot: true },
  { t: "conceptual understanding", s: 1.3, hot: true },
  { t: "developmental scaffolding", s: 1.35 },
  { t: "formative assessment", s: 1.1 },
  { t: "inquiry & reasoning", s: 1.2 },
  { t: "learning by doing", s: 1.0 },
  { t: "critical thinking", s: 0.95 },
  { t: "rote learning", s: 1.05, strike: true },
  { t: "active learning", s: 1.15 },
  { t: "metacognition", s: 1.0 },
  { t: "guided discovery", s: 1.2, hot: true },
  { t: "prior knowledge", s: 0.95 },
  { t: "growth mindset", s: 1.05 },
  { t: "multilingual tutoring", s: 1.15 },
  { t: "socratic questioning", s: 1.0 },
  { t: "differentiated instruction", s: 1.1 },
];
// No language toggle: the Scaffolding beat shows English/Telugu/Hindi side by side, and the
// admin beat renders Marathi–English + Telugu–English output inline.
const HAS_ML = {};
const ML_NAMES = {};

/* =====================================================================
   Music controller (no voiceover; ducks under interactive demos)
   ===================================================================== */
const Music = {
  el: els.music, ctx: null, src: null, gain: null, ready: false, base: 0.55, _pendingSeek: null,
  // music.mp3 (Saffron Ledger) opens with a silent lead-in; skip it so the score is
  // audible right at the film's 0:00. Tweak this if the first beat is clipped or late.
  intro: 2.0,
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
    // Play synchronously inside the user gesture, then (if the AudioContext started
    // suspended) resume it and re-seek/replay so the opening bar is never dropped —
    // routing through a MediaElementSource is silent until the context is running.
    const play = () => { this.seek(this.intro); this.el.play().catch(() => {}); };
    play();
    if (this.ctx && this.ctx.state !== "running") this.ctx.resume().then(play).catch(() => {});
  },
  seek(sec) { const d = this.el.duration; if (!d || isNaN(d)) { this._pendingSeek = sec; return; } try { this.el.currentTime = Math.max(0, sec) % d; } catch (e) {} },
  seekToScene(i) { this.seek(this.intro + ((Reel.sceneOffsets && Reel.sceneOffsets[i]) || 0)); },
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

// Scene voice clips (TTS). One clip per beat; music ducks while it plays.
const Clip = {
  cur: null,
  play(el) {
    this.stop();
    if (!el) return;
    this.cur = el;
    Music.fadeTo(Music.base * 0.06, 600);   // fade the music right down under the voice
    try { el.currentTime = 0; el.play().catch(() => {}); } catch (e) {}
    el.onended = () => { if (this.cur === el) { Music.unduck(); this.cur = null; } };
  },
  pause() { if (this.cur) { try { this.cur.pause(); } catch (e) {} } },
  resume() { if (this.cur) { try { this.cur.play().catch(() => {}); } catch (e) {} } },
  stop() {
    if (!this.cur) return;
    try { this.cur.pause(); this.cur.currentTime = 0; } catch (e) {}
    this.cur.onended = null; this.cur = null; Music.unduck();
  },
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
    if (els.timecode && Reel.totalSec) {
      const base = Reel.sceneOffsets[Reel.idx] || 0;
      const local = Math.min(localFrac, 1) * sceneEstSeconds(sc);
      const elapsed = Math.min(Reel.totalSec, base + local);
      els.timecode.textContent = fmtTime(elapsed) + " / " + fmtTime(Reel.totalSec);
    }
  }
  reelRaf = requestAnimationFrame(reelTick);
}
function clearScene() {
  els.chips.innerHTML = ""; els.extra.innerHTML = "";
  els.stage.querySelectorAll(".end-card, .center-card, .sutra").forEach((n) => n.remove());
}
function triggerWipe() { els.wipe.classList.remove("active"); void els.wipe.offsetWidth; els.wipe.classList.add("active"); }
function sceneEstSeconds(sc) { return (sc.duration && sc.duration !== Infinity) ? sc.duration / 1000 : 6; }
function fmtTime(sec) { sec = Math.max(0, sec); const m = Math.floor(sec / 60), s = Math.floor(sec % 60); return m + ":" + String(s).padStart(2, "0"); }

const Reel = {
  scenes: [], idx: -1, startMs: 0, paused: false, _pausedAt: 0, sceneOffsets: [], mlIdx: 0,
  init(s) { this.scenes = s; this.computeOffsets(); },
  computeOffsets() { let acc = 0; this.sceneOffsets = this.scenes.map((sc) => { const o = acc; acc += sceneEstSeconds(sc); return o; }); this.totalSec = acc; },
  start() { this.goToScene(0); },
  goToScene(i) {
    if (i < 0 || i >= this.scenes.length) return;
    const prev = this.idx >= 0 ? this.scenes[this.idx] : null;
    if (prev && prev.exit) prev.exit();
    const sameScene = (i === this.idx);      // toggling re-enters the same scene; keep mlIdx then
    if (!sameScene) this.mlIdx = 0;
    clearScene();
    els.body.classList.remove("end-dark");
    this.idx = i; this.paused = false; this.startMs = performance.now();
    const sc = this.scenes[i];
    els.body.dataset.scene = sc.id;
    triggerWipe();
    Clip.stop();   // stop any voice clip from the previous scene
    if (HAS_ML[sc.id]) {
      els.mlToggle.hidden = false;
      els.mlToggle.classList.toggle("on", this.mlIdx > 0);
      const names = ML_NAMES[sc.id] || [];
      els.mlLabel.textContent = names[this.mlIdx] || "multilingual";
    } else els.mlToggle.hidden = true;
    // lessons & admin duck via their voice clips; p4 sim ducks the music directly
    if (sc.id === "p4") Music.duck(); else if (sc.id !== "lessons" && sc.id !== "admin") Music.unduck();
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
  if (Reel.paused) { Reel.resume(); Music.resume(); Clip.resume(); }
  else { Reel.pause(); Music.pause(); Clip.pause(); }
}
function goNext() { const b = Reel.idx; Reel.next(); if (Reel.idx !== b) Music.seekToScene(Reel.idx); }
function goPrev() { const b = Reel.idx; Reel.prev(); if (Reel.idx !== b) Music.seekToScene(Reel.idx); }

async function boot() {
  try {
    const imgs = ["child_safety"];
    imgs.forEach((n) => { const im = new Image(); im.src = "images/" + n + ".png"; });
  } catch (e) {}
  // India map: use the bundle-inlined SVG if present, else fetch it (dev server).
  INDIA_SVG = window.__INDIA_SVG__ || "";
  if (!INDIA_SVG) { try { INDIA_SVG = await (await fetch("assets/india.svg")).text(); } catch (e) { INDIA_SVG = ""; } }
  Reel.init(buildScenes());
  els.startBtn.disabled = false;
  els.startBtn.textContent = "▶  Start the Film";
  els.mlToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const sc = Reel.scenes[Reel.idx]; const count = sc && HAS_ML[sc.id];
    if (!count) return;
    Reel.mlIdx = ((Reel.mlIdx || 0) + 1) % count;
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

// Size the responsive 16:9 stage to the ACTUAL visible viewport and centre it — reliable across
// mobile browsers (portrait plays as a widescreen strip), WITHOUT scaling the stage (so the
// design.md clamp() font caps are respected: cqw/cqh resolve against the real stage size).
function fitScreen() {
  const el = document.getElementById("screen"); if (!el) return;
  const vw = window.innerWidth, vh = window.innerHeight;
  const w = Math.min(vw, vh * 16 / 9), h = Math.min(vh, vw * 9 / 16);
  el.style.width = Math.round(w) + "px";
  el.style.height = Math.round(h) + "px";
  el.style.left = Math.round((vw - w) / 2) + "px";
  el.style.top = Math.round((vh - h) / 2) + "px";
  el.style.transform = "none";
}
window.addEventListener("resize", fitScreen);
window.addEventListener("orientationchange", () => setTimeout(fitScreen, 250));
window.addEventListener("load", fitScreen);
if (window.visualViewport) window.visualViewport.addEventListener("resize", fitScreen);
fitScreen();
requestAnimationFrame(fitScreen);

boot();
