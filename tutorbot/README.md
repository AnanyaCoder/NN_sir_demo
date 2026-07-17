# TutorBot — Capability Film

A self-contained, colorful, autoplaying film that plays like a short video in the browser:
it auto-advances scene → scene over a music bed and reveals TutorBot's Socratic teaching,
real product UI, and teacher tools in order. **Text + product UI only, no voiceover.**

Built on the same engine architecture as the AI4B-Transcribe film (`../film`): a `Reel`
sequencer walks the scenes, each running a keyframe timeline for video-style staged reveals.
Retuned here for chat, real product screenshots, and interactive mocks — with TutorBot's
warm orange/peach, product-native look.

## Run it (dev)
```bash
cd tutorbot
./serve.sh 8124          # or any free port
# open http://localhost:8124/  → click "Start the Film"
```
A local server is needed because the fonts/screenshots load over `http://`, not `file://`.

Controls: **click / Space** = pause · **← →** = skip scene · **🌐** = toggle the
multilingual example on demo scenes · Replay button on the end card.

## Share it (portable single file)
```bash
python3 bundle.py        # writes ../TutorBot_Film.html
```
`TutorBot_Film.html` inlines every asset (music, fonts, screenshots) — **double-click to
open, no server or network needed**. Send it to investors, or screen-record it for an MP4.

## Editing
- **Copy / stat numbers / scene durations / chat scripts / multilingual toggles** → `reel.js`
  (one plain object).
- **Look / animation** → `styles.css` (per-scene themes under `body[data-scene=…]`).
- **New scene types / behavior** → `app.js` (scene builders + the `Reel` sequencer).
- After changing anything, re-run `bundle.py` to refresh the portable file.

## The 14 scenes
open · withheld answer (Photosynthesis) · Socratic (Algebra) · rooted in IKS (Geometry) ·
active learning (Motion sim) · Atlas concept graph (Force & Friction) · formative MCQs
(Human Body) · scaffolded hints (Light) · turn to teachers · lesson plans (5E) ·
differentiated worksheets · local context · mistake vs misconception · close.

Source storyboard: `../script.txt` · build spec: `../prompt.txt`.

## Product screenshots used (from `../Resources`, copied into `images/`)
Atlas · hint card · Socratic chat · convex-lens interactive · lesson plan (×2) ·
graded review · child-safety guardrail. Each is framed in a browser window with a slow
camera push; the interactive beats (chat, MCQ, incline sim, worksheet fan-out, local swap,
misconception pattern) are built as live mocks matching the product's look.

## Placeholders (fill in when confirmed)
Platform / hosting and launch date on the end card (`reel.js` → `close.platforms`).
