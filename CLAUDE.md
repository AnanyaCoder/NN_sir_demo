# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A self-contained, browser-based **investor capability film** for "AI4B-Transcribe", an ASR
system for 25 Indian languages + English. It plays like a video: SVG/CSS-animated scenes
auto-advance, real demo audio clips play over a ducking music bed, and each transcript is
revealed word-by-word in the correct script. **Text only, no voiceover.** All real code lives
in `film/`; the repo root holds the source assets (xlsx of clips/transcripts, music mp3,
raw `audios/`, `child_pilot_images/`) and `AI4B_Transcribe_Film.html`, the generated portable build.

## Commands

```bash
# Dev server (fetch() of local data.json/india.svg needs http://, not file://)
cd film && ./serve.sh 8123          # → http://localhost:8123/ , click "Start the Film"

# Regenerate data.json + film/audio/*.mp3 + film/images/* from the source assets
python3 film/build_data.py          # requires ffmpeg, ffprobe, and openpyxl

# Build the portable single-file HTML (inlines every asset as data URIs)
python3 film/bundle.py              # writes ../AI4B_Transcribe_Film.html (~4.4 MB)
```

There are no tests, linters, or a package manager. After changing anything under `film/`,
re-run `bundle.py` to refresh the portable file. Re-run `build_data.py` only when the source
audio, transcripts, or photos change.

## Playback controls

click / Space = pause · ← → = skip scene · Replay button on the end card.

## Architecture

Three layers, split by who owns the content:

1. **`reel.js` — `window.REEL`**: all authored on-screen copy, per-scene durations, and
   placeholder flags, in one plain object. Edit copy, stat numbers, scene timing, and lyrics
   here. Loaded before `app.js`.

2. **`build_data.py` → `data.json`**: the *real* data pipeline. Reads the two xlsx sheets
   (`trimmed audios and transcripts` for English-accent clips, `Youtube videos` for native
   clips), transcodes each clip + the music to 16 kHz mono mp3, extracts a 200-point waveform
   envelope (`peaks`) per clip, tokenizes each transcript variant (script-aware for code-mixed),
   resolves each clip's home state to a map centroid, and downscales the pilot photos.
   `data.json` is committed — do not hand-edit it; change the xlsx/assets and re-run.

3. **`app.js` — the engine**: a `Reel` sequencer walks the 14 scenes (`buildScenes()`). Each
   scene is one of two kinds:
   - **clock scenes** (`makeClockScene`) — driven by a wall clock (`performance.now()`),
     advance after `duration` ms, run a keyframe timeline (`runTimeline`) for staged reveals.
   - **audio scenes** (`makeAudioScene`) — driven by the `<audio id="player">` element's
     `timeupdate`; a RAF loop paints the waveform and paces the word-by-word transcript reveal
     to the clip's real duration. Advances to the next scene when the last clip `ended`.

   `reelTick()` is the single RAF loop; it updates the active scene and the progress rail.

Cross-cutting pieces in `app.js`:
- **`Music`** controller wraps the music `<audio>` in a WebAudio gain node and ducks it
  (`duck`/`duckHard`/`unduck`) under real clips, since there is no voiceover.
- **Transcript reveal** (`beginTokens`/`revealTo`): tokens carry a script class (`latin`,
  `devanagari`, `malayalam`, `gujarati`) so each renders in the right font; code-mixed tokens
  are tagged per-word.
- **India map** (`assets/india.svg`): each state `<g>` carries `data-state`/`data-cx`/`data-cy`;
  the engine highlights states and drops an animated marker + demographic callout for map scenes.
- **Visual builders** (`buildRain`, `buildMetro`, `buildWedding`, `buildGlyphs`, `figureStage`
  + the `FIG` parametric human-cutout SVGs) generate the animated backdrops per scene.
- **Bundling contract**: `bundle.py` injects `window.__DATA__` and `window.__INDIA_SVG__`;
  `boot()` in `app.js` uses those if present and otherwise `fetch()`es `data.json` +
  `assets/india.svg`. Keep both paths working.

## Styling

`styles.css` themes each scene via `body[data-scene="…"]` selectors (the engine sets
`els.body.dataset.scene = sc.id` on scene entry). Per-scene accent colors flow through the
`--accent` CSS var, which the waveform and marker animations read.

## Filename-mismatch handling (important gotcha)

The on-disk audio filenames don't cleanly match the xlsx. `build_data.py` compensates:
`_canon()`/`resolve_ondisk()` fix a `malayalm`→`malayalam` misspelling and match
case/punctuation-insensitively; the English sheet's demographics are re-paired to clips by
**native language** because the demographic columns are offset from the audio/transcript
columns. Preserve this logic when touching the pipeline.

## Pending/placeholder assets

Several scenes render clean placeholders flagged in `reel.js` (`placeholder: true`,
`photoPlaceholder`, `videoPlaceholder`, `songPlaceholder`, etc.): benchmark numbers, partner
logos (Assam, Maharashtra), platform logos (Bodhan/VoiceEra/Bhashini), the Dhurandhar song clip,
the FLN child-reading video, and a rural-woman HD photo. To swap in a real asset: edit `reel.js`
(drop the placeholder flag), add the file, then re-run `build_data.py` (if it's audio/photos)
and `bundle.py`.
