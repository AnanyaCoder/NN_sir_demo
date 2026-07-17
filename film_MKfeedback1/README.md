# TutorBot — Capability Film (MK-feedback cut)

A self-contained, autoplaying film that plays like a short video in the browser: it
auto-advances scene → scene over a music bed and walks the story in the exact order of the
updated build spec (`../prompt.txt`) — the foundation, the four learning principles, where
we are today, and the next nine months. **Text + product UI only, no voiceover.**

Built on the same engine as the AI4B-Transcribe film (`../film`) and the earlier `../tutorbot`
cut: a `Reel` sequencer walks the scenes, each running a keyframe timeline for video-style
staged reveals — retuned here for chat, real product screenshots, and interactive mocks in
TutorBot's warm orange/peach, product-native look.

## Run it (dev)
```bash
cd film_MKfeedback1
./serve.sh 8124          # or any free port
# open http://localhost:8124/  → click "Start the Film"
```
A local server is needed because the fonts/screenshots load over `http://`, not `file://`.

Controls: **click / Space** = pause · **← →** = skip scene · Replay button on the end card.
Music bed: `audio/music.mp3` (Sitar Classroom Pulse). Brand mark: `images/bodhan_mark.png` (official Bodhan origami-swan logo).

## Share it (portable single file)
```bash
python3 bundle.py        # writes ../TutorBot_Film_MKfeedback1.html
```
The portable HTML inlines every asset (music, fonts, screenshots) — **double-click to open,
no server or network needed**. Send it on, or screen-record it for an MP4.

## Editing
- **Copy / tags / scene durations / chat scripts / teacher-tool scripts** → `reel.js` (one plain object).
- **Look / animation** → `styles.css` (per-scene themes under `body[data-scene=…]`).
- **New scene types / behavior** → `app.js` (scene builders + the `Reel` sequencer).
- After changing anything, re-run `bundle.py` to refresh the portable file.

## The 16 scenes (mirrors ../prompt.txt)
1. Open — title lockup
2. **Section 1 · The Foundation** — 4 tags (NEP 2020 · NCF 2023 · learning science · pedagogy) → animated NEP+NCF+Science → Pedagogical Design → *Built into TutorBot's Behaviour* → AI Tutor pipeline
3. **Section 2** intro — "Every interaction follows evidence-based learning principles."
4. Principle 1 · Social Constructivism — chat (bus & inertia)
5. Principle 2 · Dialogic Learning — chat (explain it back)
6. Principle 3 · Scaffolding — the same 2x+3=11 steps shown side by side in three languages (English · Telugu · Hindi)
7. Rooted in Indian Knowledge Systems — Śulba Sūtra → NCERT Pythagoras (short breather)
8. Principle 4 · Activity-Based Learning — **built** interactive convex-lens ray simulation (draggable object, live u/v/m/nature)
9. **Safe by design** — still child-safety screenshot + a refuse → respond-with-care → trusted-adult guardrail flow
10. **Section 3** — Where we are today (checklist ticks in one at a time)
11. **Section 4A** — Classroom Pilots + four measure tags
12. **Section 4B** — Teachers need AI too (student-mode ✓ → teacher-mode handoff)
13. B1 · Differentiated Worksheets — one prompt → Rahul + Meena worksheets
14. B2 · Differentiated Lesson Plans — Darbhanga prompt → two-track plan; live highlighted pizza→roti localization; real screenshot
15. B3 · Administrative Assistant — mocked voice input → transcript → three parent notes (Marathi–English, Telugu–English, plain English)
16. Closing vision — the promise by December 2027 → high-contrast dark end card

Source storyboard: `../script.txt` · build spec: `../prompt.txt`.

## Product screenshots used (from `../Resources`, copied into `images/`)
lesson plan (B2 · Lesson Plans) · child-safety guardrail (Safe by design). The convex-lens
simulation and the escalating hint card are **built as live mocks inspired by** the product's
`interactive_convexlens` and `hint` captures rather than shown as static screenshots. The
interactive beats (chat, lens sim, worksheet fan-out, two-track plan, voice admin) are all
live mocks matching the product's look.
