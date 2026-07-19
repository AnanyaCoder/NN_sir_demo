/* ===================================================================
   window.REEL — all AUTHORED on-screen copy, scene durations and scripts
   for the TutorBot capability film (MK-feedback cut).
   One plain object. Edit copy, tags, scene timing, chat lines and the
   teacher-tool scripts here. Loaded before app.js.
   Screenshots referenced by relative path live in images/.
   Build spec of record: ../prompt.txt
   Film structure (mirrors prompt.txt):
     1 Open · 2 Section 1 The Foundation · 3 Section 2 intro ·
     4–7 the four principles · 8 Section 3 Where we are today ·
     9 Section 4A Classroom Pilots · 10 Section 4B Teachers need AI too ·
     11 B1 Worksheets · 12 B2 Lesson plans · 13 B3 Admin (voice) ·
     14 Closing vision
   =================================================================== */
window.REEL = {
  brand: "TutorBot",
  by: "bodhan.ai",

  gate: {
    title: "We started by studying how children learn.",
    eyebrow: "Bodhan.ai",
  },

  // Interlude — standalone "chapter card" lines, one before each major section.
  sutra: {
    principles: "That's the foundation. Now let's see a few principles in action.",
    today: "Mapped these learning principles into one tutor.",
    pilots: "Now the real test begins.",
    teacher: "As classroom has two sides. We now go to the other side.",
    close: "That's what it does today. Here's where it's going.",
  },

  // 1 — Open (title-sequence lockup)
  open: {
    lines: ["Evidence-based.", "Built for the", "Indian classroom."],
    tease: "Meet",
    logo: "TutorBot",
    specs: ["Grounded in NCF and learning science —", "an AI tutor, and an AI for the teacher too."],
    dur: 10500,
  },

  // 2 — SECTION 1 · The Foundation (pipeline: policy+science → design → prompt → tutor)
  foundation: {
    section: "Section 1",
    kicker: "The Foundation",
    line: "We did not start by building an AI chatbot.",
    punch: "We started by studying how children learn.",
    tags: [
      { ico: "🏛️", text: "National Education Policy (NEP) 2020" },
      { ico: "📚", text: "National Curriculum Framework (NCF) 2023" },
      { ico: "🔬", text: "Learning science research" },
      { ico: "🎓", text: "Pedagogical best practices" },
    ],
    pipeline: [
      { title: "NEP + NCF + Learning Science", sub: "The evidence base", ico: "📚" },
      { title: "Pedagogical Design", sub: "How good teaching works", ico: "🎓" },
      { title: "Built into TutorBot's Behaviour", sub: "How it responds by default", ico: "🧠" },
      { title: "AI Tutor", sub: "What the student meets", ico: "🧑🏼‍🏫" },
    ],
    dur: 14000,
  },

  // 3 — SECTION 2 · intro (section title beat)
  principlesIntro: {
    section: "Section 2",
    kicker: "The TutorBot Principles",
    line: "Every interaction follows",
    punch: "evidence-based learning principles.",
    //sub: "Four principles, one consistent system — not four different ideas.",
    dur: 9000,
  },

  // 4 — Principle 1 · Constructivism (chat: understand the learner first)
  p1: {
    section: "Principle 1",
    kicker: "Constructivism",
    line: "Children learn better",
    punch: "by actively participating.",
    //subject: "Motion & inertia · Class 9",
    chat: [
      { who: "student", text: "Why do we jerk forward when the bus suddenly stops?" },
      { who: "bot", q: true, text: "Before I explain — what was your body trying to do the moment before it stopped?" },
    ],
    caption: "The tutor first understands the learner before teaching.",
    dur: 14500,
  },

  // 5 — Principle 2 · Dialogic Learning (chat: explain it back)
  p2: {
    section: "Principle 2",
    kicker: "Dialogic Learning",
    line: "Learning happens",
    punch: "through conversation.",
    //subject: "Photosynthesis · Class 7",
    chat: [
      { who: "student", text: "So plants make their food using sunlight." },
      { who: "bot", q: true, text: "Can you explain this back to me in your own words?" },
      { who: "student", text: "Leaves take in sunlight and… turn it into food for the plant?", win: true },
    ],
    caption: "<s>Rote learning</s> → conceptual understanding.",
    dur: 15500,
  },

  // 6 — Principle 3 · Scaffolding (guided discovery). Split across two slides:
  //   7a — the tutoring dialogue in English; 7b — the SAME dialogue in Hindi + Telugu.
  p3: {
    section: "Principle 3",
    kicker: "Scaffolding",
    line: "It doesn't give the answer,",
    punch: "it helps the student find it.",
    //subject: "Number patterns · 2, 4, 8, 16 …",
    chat: [
      { who: "student", text: "Find the next number: 2, 4, 8, 16, …?" },
      { who: "bot", q: true, text: "Look at how each number changes, are we adding the same amount each time, or multiplying?" },
      { who: "student", win: true, text: "The gaps aren't equal, so it's not adding… each number doubles! The next is 32." },
    ],
    caption: "One guiding question, and the student discovers the rule for themselves.",
    dur: 19500,
    // 7b — the SAME tutoring, in the child's own language (NCF 2023: mother-tongue learning).
    // Hindi & Telugu are illustrative translations — verify with a native speaker before production.
    ml: {
      line: "The same tutoring,",
      punch: "in the child's own language.",
      caption: "NCF 2023 calls for teaching in a child's familiar language.",
      dur: 20000,
    },
    langs: [
      { label: "हिन्दी", who: "Supriya", where: "Ratlam, MP", chat: [
        { who: "student", text: "अगली संख्या बताओ: 2, 4, 8, 16, …?" },
        { who: "bot", q: true, text: "देखो, हर संख्या कैसे बदल रही है। क्या हर बार बराबर जोड़ रहे हैं, या हर बार गुणा कर रहे हैं?" },
        { who: "student", win: true, text: "अंतर तो बराबर नहीं है। मतलब जोड़ नहीं रहे हैं... हर संख्या दोगुनी हो रही है। तो अगली संख्या 32 होगी?" },
      ] },
      { label: "తెలుగు", who: "Ajay", where: "Kazipet,TS", chat: [
        { who: "student", text: "తర్వాత సంఖ్య చెప్పు: 2, 4, 8, 16, …?" },
        { who: "bot", q: true, text: "ప్రతి సంఖ్య ఎలా మారుతుందో చూడు. ప్రతిసారి ఒకేలా కూడుతున్నామా, లేక గుణిస్తున్నామా?" },
        { who: "student", win: true, text: "తేడాలు సమానంగా లేవు, కాబట్టి కూడిక కాదు… ప్రతి సంఖ్య రెట్టింపు అవుతోంది! తర్వాతది 32 ?" },
      ] },
    ],
  },

  // 6b — Rooted in IKS · Geometry (short breather between Scaffolding and Activity-Based)
  iks: {
    kicker: "Rooted in Indian Knowledge System",
    line: "Guiding isn't only asking questions.",
    punch: "It's showing a student where the idea came from.",
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
    bridge: "Stated centuries before Pythagoras — and that's exactly where the lesson begins.",
    dur: 12500,
  },

  // 7 — Principle 4 · Activity-Based Learning (interactive convex-lens ray simulation)
  p4: {
    section: "Principle 4",
    kicker: "Activity-Based Learning",
    line: "Understanding comes from",
    punch: "exploration and interaction.",
    //subject: "Optics · the convex lens",
    simTitle: "Convex Lens · image formation",
    simIntro: "A converging lens bends parallel light to a focus. Drag the object along the axis — watch the real image flip and change size.",
    tip: "Past 2F the image is real, inverted and smaller. Bring the object between F and 2F and the image grows larger than the object itself.",
    note: "Not a screenshot — the same explorable ray diagram runs live in the product.",
    dur: 15500,
  },

  // 7b — Safe by design (a live guardrail chat that types on + behaviour flow)
  safety: {
    kicker: "Safe by design",
    line: "Before it teaches anything,",
    punch: "it keeps a child safe.",
    //subject: "A real refusal",
    chat: [
      { who: "student", text: "Sir, how can I fake a stomach ache? I don't want to go to school tomorrow." },
      { who: "bot", text: "I can't help with faking an illness — that could be unsafe." },
      { who: "bot", text: "It sounds like a really hard day. Please talk to a parent or a teacher you trust — they're there to help you." },
    ],
    // icons rendered as flat line SVGs in app.js (calm, no emoji — child-safety topic)
    steps: [
      { t: "Refuses the unsafe request" },
      { t: "Responds with care, not alarm" },
      { t: "Points to a trusted adult" },
    ],
    dur: 21000,
  },

  // 8 — SECTION 3 · Where we are today (checklist)
  today: {
    section: "Section 3",
    kicker: "Where we stand today",
    line: "The pedagogical groundwork",
    punch: "is complete.",
    items: [
      "Learning principles mapped",
      "Pedagogy encoded",
      "Tutor behaviour specified",
      "Ready for classroom pilots",
    ],
    dur: 12500,
  },

  // 9 — SECTION 4A · Classroom Pilots
  pilots: {
    section: "The next nine months",
    kicker: "Classroom pilots",
    line: "Classroom pilots:",
    punch: "Validate TutorBot across real classrooms.",
    lead: "What the pilots will measure",
    measures: [
      { ico: "📈", text: "Learning outcomes" },
      { ico: "🙌", text: "Student engagement" },
      { ico: "🧑‍🏫", text: "Teacher adoption" },
      { ico: "🏫", text: "Classroom usability" },
    ],
    launch: {
      pre: "Launching on",
      date: "September 5",
      where: "Andhra Pradesh",
      partner: "In partnership with the Government of Andhra Pradesh",
    },
    dur: 12000,
  },

  // 10 — SECTION 4B · Teachers need AI too (the turn: student side → teacher side)
  teacherTurn: {
    section: "Section 4B",
    kicker: "",
    line: "Teachers need AI too.",
    punch: "",
    sub: " ",
    modes: [
      { tag: "Student mode", state: "done", items: ["Socratic tutoring", "Scaffolded hints", "Multi-lingual tutoring", "Activity-based learning"] },
      { tag: "Teacher mode", state: "next", items: ["Differentiated worksheets", "Dynamic lesson plans", "Parent communication"] },
    ],
    dur: 11500,
  },

  // 11 — B1 · Differentiated Worksheets (one prompt → two tailored worksheets)
  worksheets: {
    kicker: "Differentiated Worksheets",
    line: "One prompt.",
    punch: "Two worksheets: one for each student.",
    prompt: "Rahul struggles with fractions. Meena is good at fractions but weak in word problems. Generate tomorrow's worksheet.",
    cards: [
      { who: "Rahul", tint: "a", focus: "Fraction basics", items: ["Shade 1/2 of the circle.", "Which is bigger: 1/4 or 1/2?", "Write 3 out of 4 as a fraction."], note: "Visual, single-step, generous scaffolds." },
      { who: "Meena", tint: "c", focus: "Word problems", items: ["A recipe for 4 needs 3/4 cup of flour. Scale it for 6.", "2/3 of a 30-student class went on the trip. How many stayed?"], note: "On-grade fractions, applied in multi-step word problems." },
    ],
    caption: "The system automatically produces differentiated worksheets tailored to each student.",
    dur: 16500,
  },

  // 12 — B2 · Differentiated Lesson Plans (one prompt → two-track plan, localised live)
  lessons: {
    kicker: "Differentiated Lesson Plans",
    line: "One classroom, two speeds.",
    punch: "One lesson plan that holds both.",
    //prompt: "My students are from Darbhanga. Half the class understands fractions, the other half is still struggling. Plan tomorrow's lesson.",
    prompt: "हमरे स्टूडेंट दरभंगा से हैं। आधी  क्लास को फ्रैक्शन्स समझ में आ गया है, बाकी बच्चा लोग अभी भी स्ट्रगल कर रहे हैं। कल के लिए एक अच्छा लेसन प्लान इंग्लिश में बनाइए।",
    tracks: [
      { label: "Still struggling", tint: "a", steps: [
        { e: "Recap", t: "“Out of”: 3 parts out of 4 equal parts = 3/4." },
        { e: "Concrete", t: "Fold a paper strip into halves, thirds, quarters; name each piece." },
        { e: "Practice", t: "Shade a given fraction of a strip; say it aloud." },
      ] },
      { label: "Ready to stretch", tint: "c", steps: [
        { e: "Warm-up", t: "Compare 2/3 and 3/4 — which is bigger, and how do you know?" },
        { e: "Apply", t: "A recipe for 4 needs 3/4 cup; scale it for 6." },
        { e: "Extend", t: "Share a plot of land among siblings in unequal fractions." },
      ] },
    ],
    // The model localises itself live: the generic textbook example is struck through and replaced.
    localize: {
      pre: "Sharing a ",
      strike: "pizza",
      swap: "roti",
      post: " equally between 4 friends — each <b>hissa</b> (share) is one <b>tukda</b> (piece), or 1/4 of the whole.",
    },
    shot: "images/LessonPlan1.png",
    shotCap: "Real output · a full plan generated from one line",
    caption: "AI generates a lesson plan for mixed-ability classrooms — grounded in Darbhanga, not a generic textbook default.",
    dur: 30000,
  },

  // 13 — B3 · Administrative Assistant (voice → transcript → 3 parent notes)
  admin: {
    kicker: "Administrative Assistant",
    line: "Teachers speak naturally.",
    punch: "TutorBot writes what each parent needs to hear.",
    micHint: "Tap to speak",
    transcript: [
      "Rahul had difficulty with reading today.",
      "Priya improved in multiplication.",
      "Arjun was absent.",
      "Can you write a note for each parent. Rahul's mom prefers Marathi, and Priya's family speaks Telugu at home."
    ],
    genLabel: "Generating parent notes…",
    notes: [
      { to: "Rahul's parents", tint: "a", lang: "Marathi–English",
        body: "Rahul la aaj reading jara tough vatla, pan amhi tyavar ekatra kaam karat aahot — kahi tension nahi, ya week madhey thoda extra practice karu." },
      { to: "Priya's parents", tint: "b", lang: "Telugu–English",
        body: "Priya multiplication lo chala baga improve ayyindi ee week — chala proud moment class ki!" },
      { to: "Arjun's parents", tint: "c",
        body: "Arjun was absent today — I hope everything is alright at home. Do let me know if anything's the matter; we'll help him catch up on today's work tomorrow." },
    ],
    caption: "Three separate, personalised notes — not one generic summary. Written in each family's own mix of languages: Marathi–English for Rahul, Telugu–English for Priya.",
    dur: 31000,
  },

  // 14 — Closing vision (promise lines → India map lighting up → end card)
  close: {
    kicker: "The promise:",
    // Phase A — the grounding + readiness (why this promise is credible)
    lines: [
      "1M Teachers, AI literate.",
      "By December 2027",
    ],
    map: {
      // Phase B — the scale, narrating the map lighting up
      headline: "One million teachers,",
      headlinePunch: "in every corner of India.",
      count: 1000000,
      countLabel: "teachers, AI-literate",
      sub: "",
      statesLabel: "states & union territories",
    },
    // Phase C — the vision lockup
    endEyebrow: "bodhan.ai · TutorBot",
     endTitle: "Built for India,\nin India.",
    // endTitle: "One tutor.\nEvery student.",
    endSub: "Grounded in Learning Sciences & NCF 2023",
    endLine: "AI that empowers every student. Elevates every teacher.",
  },
};
