/* ===================================================================
   window.REEL — all AUTHORED on-screen copy, scene durations, chat
   scripts and multilingual toggles for the TutorBot capability film.
   One plain object. Edit copy, stat numbers, scene timing, chat lines,
   and the multilingual examples here. Loaded before app.js.
   Screenshots referenced by relative path live in images/.
   Storyboard of record: ../script.txt  ·  spec: ../prompt.txt
   =================================================================== */
window.REEL = {
  brand: "TutorBot",
  by: "bodhan.ai",
  launch: "TBD",

  gate: {
    title: "One tutor. Every student.",
    eyebrow: "Capability Film · bodhan.ai",
  },

  // 1 — Open (title-sequence lockup)
  open: {
    lines: ["One tutor.", "Every student.", "Every subject."],
    tease: "Meet",
    logo: "TutorBot",
    // typed beneath the brand, then cleared for the payoff line
    specs: ["Built for NCF 2023 and NEP 2020", "— not retrofitted for it afterward."],
    langLine: "The tutor that asks, not tells.",
    dur: 10500,
  },

  // 2 — The withheld answer — Photosynthesis (quick beat: text + visual land together)
  withheld: {
    kicker: "The withheld answer",
    line: "We didn’t answer the question.",
    punch: "We asked one back.",
    subject: "Photosynthesis · Class 7",
    chat: [
      { who: "student", text: "Why do plants need sunlight to make food?" },
      { who: "bot", q: true, text: "What do you think happens to a plant kept away from sunlight for a week?" },
    ],
    dur: 11500,
  },

  // 3 — Socratic demo — Algebra (chat log plays out; every bot turn is a question)
  socratic: {
    kicker: "Socratic demo",
    line: "It doesn’t solve it.",
    punch: "It hands back the next question — until the student gets there.",
    subject: "Algebra · solve 2x + 3 = 11",
    chat: [
      { who: "student", text: "Sir, how do I solve 2x + 3 = 11?" },
      { who: "bot", q: true, text: "First tell me — what do you get if you take 3 away from both sides?" },
      { who: "student", text: "2x = 8." },
      { who: "bot", q: true, text: "Good. Now if you divide both sides by 2?" },
      { who: "student", text: "x = 4!", win: true },
      { who: "bot", text: "You solved it. I only asked the questions." },
    ],
    proofShot: "images/scafolding_socratic.png",
    proofCap: "Real product · the question always comes back",
    ml: {
      label: "Hindi–English code-mixed",
      chat: [
        { who: "student", text: "Sir, 2x + 3 = 11 kaise solve karu?" },
        { who: "bot", q: true, text: "Pehle batao — dono taraf se 3 kam karne se kya milega?" },
        { who: "student", text: "2x = 8." },
        { who: "bot", q: true, text: "Ab dono taraf 2 se divide karo to?" },
        { who: "student", text: "x = 4!", win: true },
      ],
    },
    dur: 16500,
  },

  // 4 — Rooted in IKS — Geometry (split screen: Shulba Sutra → NCERT Pythagoras)
  iks: {
    kicker: "Rooted in IKS",
    line: "Guiding isn’t only asking questions.",
    punch: "It’s showing a student where the idea came from.",
    subject: "Geometry · Class 9",
    left: {
      tag: "Baudhāyana Śulba Sūtra",
      era: "c. 800 BCE",
      verse: "दीर्घचतुरश्रस्याक्ष्णया रज्जुः\nपार्श्वमानी तिर्यङ्मानी च\nयत्पृथग्भूते कुरुतस्तदुभयं करोति।",
      gloss: "“The rope stretched along the diagonal of a rectangle makes an area that the vertical and horizontal sides make together.”",
    },
    right: {
      tag: "NCERT Class 9 · Theorem 6.8",
      title: "Pythagoras Theorem",
      body: "In a right triangle, the square of the hypotenuse equals the sum of the squares of the other two sides.",
      eqn: "a² + b² = c²",
    },
    bridge: "Stated centuries before Pythagoras — and that’s exactly where the lesson begins.",
    dur: 11500,
  },

  // 5 — Active learning — Newton's Motion (drag-to-explore, live stats, tip callout)
  active: {
    kicker: "Active learning",
    line: "Some things you don’t explain.",
    punch: "You let a student play with them.",
    subject: "Motion · the inclined plane",
    simTitle: "Motion on an Incline",
    simIntro: "A ball rolls from rest down a frictionless ramp. Drag the angle — watch how fast it reaches the bottom.",
    tip: "Steeper ramp → more of gravity pulls along the slope → the ball speeds up and reaches the bottom sooner.",
    proofShot: "images/interactive_convexlens.png",
    proofCap: "The same drag-to-explore pattern, live in the product (Optics)",
    ml: {
      label: "Telugu–English code-mixed",
      chat: [
        { who: "student", text: "Idi angle penchite emavutundi?" },
        { who: "bot", q: true, text: "Try chesi choodu — slider ni easy ga marchu, speed ela marutundo choodu." },
        { who: "student", text: "Oh, angle perigithe speed kuda perigindi!", win: true },
      ],
    },
    dur: 15000,
  },

  // 6 — Atlas — the concept graph — Force & Friction (real screenshot, camera push)
  atlas: {
    kicker: "Atlas · the concept graph",
    line: "Every student gets stuck somewhere different.",
    punch: "TutorBot knows exactly where.",
    subject: "Force & Friction",
    shot: "images/Atlas.png",
    note: "A friction problem is quietly traced back to an unresolved <b>Normal Force</b> node from two lessons ago.",
    ml: {
      label: "Kannada–English code-mixed",
      chat: [
        { who: "student", text: "Idu friction problem nange artha aagta illa." },
        { who: "bot", q: true, text: "Nimma friction problem, normal force node ge connect aagide — adna revise madona." },
      ],
    },
    dur: 12500,
  },

  // 7 — Formative MCQs — Human Body (mock MCQ shown wrong → diagnostic follow-up)
  mcq: {
    kicker: "Formative MCQs",
    line: "A wrong answer isn’t the end of the question.",
    punch: "It’s the start of the next one.",
    subject: "Human Body · Class 6",
    question: "Which organ pumps blood around the body?",
    options: [
      { key: "A", text: "Lungs", picked: true, correct: false },
      { key: "B", text: "Heart", correct: true },
      { key: "C", text: "Liver" },
      { key: "D", text: "Kidney" },
    ],
    followKicker: "Diagnostic follow-up",
    follow: "The lungs and the heart sit side by side — but they don’t do the same job. Which one adds oxygen to the blood, and which one pushes it around?",
    ml: {
      label: "Bengali–English code-mixed",
      chat: [
        { who: "student", text: "(picks “Lungs” for “which organ pumps blood?”)" },
        { who: "bot", q: true, text: "Tumi ei bhul ta prai koro — kintu heart ar lungs-er kaj eki na. Eta niye ekta question dekhi." },
      ],
    },
    dur: 12000,
  },

  // 8 — Scaffolded hints — Light (real hint-card screenshot + escalation)
  hints: {
    kicker: "Scaffolded hints",
    line: "We don’t hand over the ladder.",
    punch: "We hand over the first rung.",
    subject: "Light · refraction",
    shot: "images/hint.png",
    steps: [
      { tag: "HINT · 1 — GENTLE NUDGE", text: "What changes when light moves from air into water?" },
      { tag: "HINT · 2 — SHARPER", text: "Light bends at the boundary. Which way does it bend going into a denser medium?" },
      { tag: "HINT · 3 — LAST RESORT", text: "That bending is refraction — it’s why the pencil looks broken at the surface." },
    ],
    ml: {
      label: "Konkani–English code-mixed",
      chat: [
        { who: "student", text: "Mhaka kalona pencil vakud kityak dista glass antlyan." },
        { who: "bot", q: true, text: "HINT · 1 — Amchi convex lens vishim uloile ti utram yaad kaddat? Ata light air thaun water bhitor gele tor kitem badta?" },
      ],
    },
    dur: 12000,
  },

  // 9 — Turn to teachers (the turn) + a responsibility proof (child_safety shot)
  turn: {
    kicker: "The turn",
    line: "All of this holds up a mirror to the classroom itself.",
    punch: "Meet the other side of TutorBot —<br>built for the teacher’s evening, not just the student’s afternoon.",
    safeShot: "images/child_safety.png",
    safeCap: "Safe by design · it refuses what it shouldn’t answer",
    dur: 8500,
  },

  // 10 — Lesson plans (typed prompt → 5E plan assembles; real screenshot payoff)
  lessons: {
    kicker: "Lesson plans",
    line: "A blank page tonight —",
    punch: "a complete lesson by the time the tea’s gone cold.",
    prompt: "Explain Fractions for my Class 6 in Darbhanga — mixed classroom, mostly first-generation learners.",
    plan: [
      { e: "Engage", t: "A roti, torn into equal shares at the family meal." },
      { e: "Explore", t: "Fold paper strips into halves, thirds, quarters — name each piece." },
      { e: "Explain", t: "“Out of”: 3 parts out of 4 equal parts = 3/4." },
      { e: "Elaborate", t: "Share a plot of land among 4 siblings — each gets 1/4." },
      { e: "Evaluate", t: "Exit ticket: shade 2/5 of a strip; explain in your own words." },
    ],
    shot: "images/LessonPlan1.png",
    shotCap: "Real output · localised to Darbhanga",
    dur: 12500,
  },

  // 11 — Differentiated worksheets (four cards fan out from one prompt)
  worksheets: {
    kicker: "Differentiated worksheets",
    line: "One topic.",
    punch: "Four versions — every student gets something built for them.",
    subject: "Fractions",
    cards: [
      { level: "Struggling", tint: "a", desc: "Shade 1/2 of the circle.", note: "Visual, one step, generous scaffolds." },
      { level: "Standard", tint: "b", desc: "Which is bigger — 2/3 or 3/4?", note: "On-grade practice, mixed formats." },
      { level: "Stretch", tint: "c", desc: "A recipe for 4 needs 3/4 cup. Scale it for 6.", note: "Multi-step, applied reasoning." },
      { level: "Home language", tint: "d", desc: "आधा और एक-चौथाई में कौन बड़ा है?", note: "Same rigour, home language.", deva: true },
    ],
    dur: 10500,
  },

  // 12 — Local context (before/after swap; real screenshot proof)
  local: {
    kicker: "Local context",
    line: "The worksheet stops being generic —",
    punch: "and starts being theirs.",
    swaps: [
      { before: "A pizza is cut into 8 slices…", after: "A roti is torn into 8 pieces…" },
      { before: "Share 12 sandwiches among 4 friends…", after: "Share 12 laddoos among 4 friends…" },
      { before: "A train travels from Boston to New York…", after: "A bus travels from Darbhanga to Patna…" },
    ],
    shot: "images/LessonPlan2.png",
    shotCap: "Real output · the vegetable market, the land, the local words",
    dur: 10000,
  },

  // 13 — Mistake or misconception (repeated wrong answer → one pattern; graded-review proof)
  misconception: {
    kicker: "Mistake or misconception",
    line: "A wrong answer on its own tells you nothing.",
    punch: "The same wrong answer, six times in a row, tells you everything.",
    rows: [
      { q: "−5 + 3", wrong: "−8", flag: true },
      { q: "−2 + 7", wrong: "−9", flag: true },
      { q: "4 + (−6)", wrong: "10", flag: true },
      { q: "−1 + 9", wrong: "−10", flag: true },
      { q: "−3 + 8", wrong: "−11", flag: true },
      { q: "6 + (−10)", wrong: "16", flag: true },
    ],
    pattern: "Not careless. One misconception: adding the digits, ignoring the signs.",
    shot: "images/Assessment1.png",
    shotCap: "Real graded review · summary, per-question feedback, follow-up",
    dur: 12000,
  },

  // 14 — Close
  close: {
    kicker: "The line that doesn’t move",
    lines: ["AI drafts.", "AI suggests.", "AI saves time."],
    linesB: ["Teacher decides.", "Teacher verifies.", "Teacher teaches."],
    platforms: [
      { name: "Platform / hosting", placeholder: true },
      { name: "Launch date", placeholder: true },
    ],
    endEyebrow: "bodhan.ai",
    endTitle: "TutorBot",
    endSub: "One tutor. Every student. Every subject.",
  },
};
