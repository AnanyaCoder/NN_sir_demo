# Design System — Capability Film Style

A reusable design specification distilled from the **AI4B-Transcribe capability film**
(`film/`). It documents the visual language — theme, color, type, spacing, layout,
animation, and motion — so that **other presentations can be built in the same style**
even when their content and slide layouts are completely different.

> **How to read this document.** Everything here is a *reference*, not a mandate. A new
> presentation should adopt the **tokens** (the CSS custom properties in `:root`), the
> **type scale**, the **motion vocabulary**, and the **light-canvas theming model**, and
> then defer on anything content-specific (which scenes exist, how each is laid out, exact
> stat numbers). Where a value is marked *tunable*, expect other decks to override it —
> most commonly the font sizes. Change tokens in one place (`:root`) and the whole deck
> re-themes; never hard-code a color or size that a token already expresses.

---

## 1. Design Philosophy

The film is not a slideshow — it **plays like a video**: scenes auto-advance on a clock or
on a real audio clip, elements build on one at a time (never a whole card at once), and the
whole thing runs full-screen with no chrome. Three principles drive every decision:

1. **Bright, calm, premium.** A soft cool "studio paper" canvas (never flat white, never
   dark), deep navy-slate ink for text, and a small set of grounded-but-vivid accent hues.
   Elevation reads through **soft shadow + a whisper-thin hairline**, not glow or heavy
   borders. Professional enough for an investor room, energetic enough to hold attention.
2. **One system, many chapters.** Every scene shares the same tokens, type scale, and
   motion grammar. Scenes differ only by a per-scene **accent hue** and a faint background
   tint, so they read as distinct chapters of one coherent film.
3. **Staged, filmic motion.** Nothing pops in fully-formed. Lines, numbers, words, and
   photos each enter on their own beat with a short *rise + de-blur* animation. Transitions
   between scenes are a single light-sweep wipe. Motion is always in service of pacing, and
   collapses gracefully under `prefers-reduced-motion`.

---

## 2. Color & Theme

### 2.1 Canvas (surfaces)

The canvas is a soft cool paper, brightest in the centre, tinted toward the scene's accent
at the edges. Historically the token names `--ink*` referred to dark surfaces; here their
**semantics are inverted for a light ground** — the names are kept only for stability.

| Token        | Value       | Role                                                            |
|--------------|-------------|-----------------------------------------------------------------|
| `--ink`      | `#EEF3FA`   | Base body background (the paper)                                 |
| `--ink2`     | `#E4ECF6`   | Secondary surface shade                                          |
| `--ink3`     | `#FFFFFF`   | Brightest centre of every radial wash                           |
| `--cream`    | `#122038`   | **Deep navy-slate INK** — all body text & the brand mark        |
| `--muted`    | `rgba(18,32,56,.62)` | Secondary / sub-text                                   |
| `--surface`  | `#FFFFFF`   | Raised cards, callouts, logo plates                             |
| `--surface-2`| `rgba(18,32,56,.045)` | Faint fill (chips, tracks)                            |
| `--surface-3`| `rgba(18,32,56,.08)`  | Slightly stronger faint fill                          |

### 2.2 Accents

Retuned to be **deeper and richer** so fills and small text hold contrast on a light ground,
yet still vivid. `--accent` / `--accent2` are *pointers* that each scene re-aims (§2.4); the
waveform, markers, rails, and wipes all read from them.

| Token        | Value      | Notes                                                     |
|--------------|------------|-----------------------------------------------------------|
| `--saffron`  | `#E0620D`  | Primary brand accent                                      |
| `--saffron2` | `#B24405`  | **Darker, small-text-safe saffron** — kickers, eyebrows  |
| `--amber`    | `#CC820A`  | Warm secondary                                            |
| `--teal`     | `#0C8C82`  | Cool secondary                                            |
| `--magenta`  | `#CC1E74`  | Highlight / active state                                  |
| `--green`    | `#159A50`  | Consent / success                                         |
| `--violet`   | `#5B44D4`  | Tertiary                                                  |
| `--sky`      | `#1F6FD1`  | Tertiary cool                                             |
| `--accent`   | `var(--saffron)` | Per-scene primary (overridden per scene)           |
| `--accent2`  | `var(--teal)`    | Per-scene secondary (overridden per scene)         |

> **Small-text rule:** never set kicker/label text in `--saffron` (`#E0620D`) — use
> `--saffron2` (`#B24405`), which is tuned to stay legible at label size on paper.

### 2.3 Hairlines & shadows

Elevation is shadow + hairline, never glow. Two shadow tiers and two line weights:

```
--line:    rgba(18,32,56,.12);   --line-2: rgba(18,32,56,.07);
--shadow-1: 0 1px 2px rgba(18,32,56,.06), 0 6px 20px rgba(18,32,56,.08);   /* resting card */
--shadow-2: 0 6px 16px rgba(18,32,56,.08), 0 24px 60px rgba(18,32,56,.14); /* hero / photo  */
--glow:     0 6px 22px rgba(224,98,13,.30);   /* the ONE saffron glow, for CTAs & the rail  */
```

### 2.4 Per-scene theming (the key mechanism)

Each scene sets its own `--accent` / `--accent2` and a faint radial background tint via a
`body[data-scene="…"]` selector. The engine writes `body.dataset.scene = sceneId` on entry,
so the whole page re-themes with a `.9s` background transition. **This is how a new deck gets
per-slide color without touching component CSS.** The pattern:

```css
body[data-scene="myScene"]{
  --accent: var(--teal);
  --accent2: var(--sky);
  background: radial-gradient(130% 120% at 50% 22%, #FFFFFF, #E8F3F4 78%);
}
```

The tint color at the edge is a ~5%-saturation wash of the accent hue over white; the centre
stays pure white so foreground text always has a bright spot to sit on. Reference tints used
in the film: saffron `#F0F4FB`, sky `#EAF1FC`, amber `#FBF3E8`, magenta `#FBEEF4`,
green `#EBF6EE`, teal `#E8F3F4`, violet `#F0EDFB`.

### 2.5 Signature motifs

- **Tricolor top bar** — a fixed 4px `saffron / paper / green` gradient strip at the very
  top (`z-index:60`), a subtle national cue that frames every scene.
- **Grain** — a fixed fractal-noise SVG at `opacity:.04`, `mix-blend-mode:multiply`, to keep
  the paper from ever looking digitally flat.
- **Aurora** — soft, blurred, slowly-drifting radial blobs of accent color behind hero
  scenes (`filter:blur(70–80px)`, `opacity:.26–.28`), animated on a 14–16s alternating loop.
- **Chakra / brand mark** — a spoked-wheel SVG that spins slowly (`spin` 26–30s linear).
- **Brand gradient text** — headline payoffs use a clipped gradient
  `linear-gradient(100–120deg, saffron/amber → magenta → teal)` with `background-clip:text`.
  When text is gradient-clipped, **cancel any `text-shadow`** (a halo tuned for solid ink
  just fogs the gradient's edges).

---

## 3. Typography

### 3.1 Families

| Token      | Stack                                             | Used for                        |
|------------|---------------------------------------------------|---------------------------------|
| `--sans`   | `"Inter","Segoe UI",system-ui,sans-serif`         | Everything (UI + display)       |
| `--serif`  | *same as `--sans`* — Inter is used for display too | Headlines / display (semantic name kept) |

Inter is bundled in weights **400/500/600/700/800** (`fonts/inter-*.woff2`). Indic scripts
each have their own bundled Noto face at **weight 500 only** — see §3.4.

### 3.2 The 4-tier type scale

**Every** font-size in the deck resolves to one of four tiers. Each is a `clamp()` so it is
viewport-responsive, with the `vw` slope and upper bound matched to a fixed reference size.
This is the single most reusable piece for other decks — **other presentations typically
keep this structure and only nudge the numbers.**

| Tier         | Token           | `clamp(min, vw, max)`          | Line-height | Letter-spacing | Reference |
|--------------|-----------------|--------------------------------|-------------|----------------|-----------|
| Display      | `--fs-display`  | `clamp(2.5rem, 6vw, 4.5rem)`   | `1.05`      | `-.035em`      | 4.5rem    |
| Headline     | `--fs-headline` | `clamp(1.75rem, 3.6vw, 2.5rem)`| `1.14`      | `-.022em`      | 2.5rem    |
| Body         | `--fs-body`     | `clamp(.9375rem, 1.8vw, 1.25rem)`| `1.5`     | `0`            | 1.25rem   |
| Label        | `--fs-label`    | `clamp(.8125rem, 1.1vw, .9375rem)`| `1.3`    | `.02em`        | .9375rem  |

Companion line-height / tracking tokens: `--lh-display`/`--ls-display`, `--lh-headline`/
`--ls-headline`, `--lh-body`/`--ls-body`, `--lh-label`/`--lh-label`.

> **Tuning for other decks:** to make a deck feel bigger or smaller overall, change the four
> `--fs-*` reference maxes (and optionally the vw slopes) in `:root` — do **not** introduce
> a fifth size or set pixel sizes on individual components. Keeping four tiers is what makes
> every deck in this family feel related even at different absolute sizes.

### 3.3 Weight & role conventions

- **Display / headline:** weight **800**, tight tracking (negative `letter-spacing`).
- **Kickers / eyebrows / dock heads:** weight **700**, UPPERCASE, wide tracking
  (`.14em`–`.42em`), colored `--saffron2`. Often prefixed by a 22×2px accent tick
  (`::before { width:22px; height:2px; background:var(--accent) }`).
- **Body / sub:** weight 400–500, color `--muted`, `max-width` ~40–62ch to control measure.
- **Stat numbers:** weight 800 at display size, filled with the brand gradient.

### 3.4 Transcript type (the special case)

The word-by-word ASR output is the product's "voice" and gets **one fixed spec used in every
scene and every script**, so the output reads as one consistent thing from the first clip to
the last. Never override transcript sizing per-scene — change it here only:

```
--fs-transcript: clamp(1.1rem, 2vw, 1.5rem);
--lh-transcript: 1.5;
--fw-transcript: 500;   /* the only weight both Inter and the Noto Indic faces ship for real */
```

Weight **500** is deliberate: it is the only cut the bundled Indic faces have, so Latin and
Indic sit at a matched weight instead of the browser faux-bolding Indic to fake 600/800.

**Per-script font mapping** — each transcript word carries a script class that selects a
bundled face; scripts with no bundled face fall back to `--sans` (system):

| Class         | Font family            | Bundled? |
|---------------|------------------------|----------|
| `.latin`      | `--sans` (Inter)       | yes      |
| `.devanagari` | `"Deva"`               | yes      |
| `.malayalam`  | `"Mlym"`               | yes      |
| `.gujarati`   | `"Gujr"`               | yes      |
| `.bengali`    | `"Beng"` (Noto)        | yes      |
| `.tamil`      | `"Taml"` (Noto)        | yes      |
| `.kannada`    | `"Knda"` (Noto)        | yes      |
| `.olchiki`    | `"Olck"` (Noto)        | yes      |
| `.gurmukhi`   | `--sans` (system)      | no       |

In **code-mixed** transcripts (`.mixed`), inline Latin/English words are tinted `--teal` and
*italic* to visually separate them from the native-script run (which stays `--cream`).

---

## 4. Layout & Spacing

### 4.1 Stage model

Everything lives in a single full-screen, fixed `.stage` (`inset:0; overflow:hidden`). Layers
stack by `z-index`:

| Layer            | z-index | Role                                                       |
|------------------|---------|------------------------------------------------------------|
| `.visual-layer`  | 10 (in stage) | Per-scene animated backdrop, injected by JS          |
| `.scrim`         | 5       | Bottom-weighted paper gradient for caption legibility      |
| audio dock / cards | 7–8   | Foreground content                                         |
| `.rail`          | 9       | Bottom progress bar                                        |
| `.wipe`          | 50      | Transition sweep                                           |
| `.grain`         | 55      | Noise overlay                                              |
| `.tricolor`      | 60      | Top strip                                                  |
| `.gate`          | 70      | Start gate (also satisfies the autoplay gesture)           |

The **scrim** is a vertical paper gradient (opaque at bottom → clear in the upper-middle →
faint at very top) so bottom captions stay readable over any backdrop. Content-forward scenes
(map, photo, video, three-column) **drop the scrim** so their imagery reads at full contrast.

### 4.2 Spacing conventions

- Page padding uses **viewport units** so layout scales with the screen: caption bands
  `padding: 0 7vw 8vh`; center cards `7vh 6vw 9vh`; docks `8vh 4vw 9vh 3vw`.
- Gaps between repeated items use `clamp()` so they breathe on large screens and tighten on
  small: e.g. stat rows `gap: clamp(18px,3vw,54px)`, bench columns `clamp(16px,3vw,44px)`.
- Radii: cards/callouts **16–22px**, pills/buttons **100px**, photo frames **18–22px**.
- **Measure control:** titles `max-width: ~20–22ch`, body/sub `~40–62ch`, transcript `~46ch`.

### 4.3 Common layout archetypes (reusable containers)

A new deck can mix and match these; each is a self-contained block that themes off the tokens:

- **Caption layer** — bottom-left `kicker → title → sub`, staged rise on enter. Can be moved
  to top or centered per scene by overriding `.caption-layer` position.
- **Center card** — `place-content:center` grid for hero stat / logo / title moments.
- **Right-side dock** — a `min(42vw,560px)` right column (waveform + transcript) that fades
  in from the right; the main visual is padded left to make room. This is the default
  layout for "media on the left, live output on the right".
- **Split / multi-column stage** — e.g. a 3-column grid where columns build one at a time
  (`.pending → .active → .seen`, later columns dimming earlier ones to `.4` opacity rather
  than removing them), or a 2×2 quadrant grid.
- **Stat row / benchmark bars** — flex rows of big-number + label, or animated vertical bars
  that grow from `height:0` with a `1.1s` ease.
- **Photo cards** — `3/4` aspect, white 3px border, soft rotation (`--rot`), staged pop-in.

---

## 5. Motion & Animation

Motion is a **small, reusable vocabulary** reused everywhere. The signature easing is
`cubic-bezier(.2,.8,.2,1)` (a soft, confident ease-out) — with `cubic-bezier(.2,.9,.2,1)`
for snappier "pop" moments. Durations cluster around **0.4–0.7s** for element entrances.

### 5.1 Core entrance keyframes

| Name       | Duration | What it does                                              | Used by                        |
|------------|----------|-----------------------------------------------------------|--------------------------------|
| `rvUp`     | .72s     | rise 30px + de-blur 9px + fade                            | `[data-seq]`, `.rv` staged reveals |
| `rvWord`   | .5s      | rise 16px + de-blur 6px + fade                            | per-word `.rv-w`               |
| `capRise`  | .7s      | rise 26px + de-blur 6px + fade                            | caption kicker/title/sub, cards |
| `pop`      | .5–.6s   | rise 14px + scale .98→1 + de-blur 4px                     | stats, logos, callouts, text-pop |
| `wordIn`   | .42s     | de-blur 5px + fade (no move)                              | transcript words               |
| `oWordIn`  | .7s      | rise 16px + de-blur 5px + fade                            | title-sequence words           |
| `photoIn`  | .72s     | rise 22px + scale .95→1 (preserves rotation)             | photo cards                    |
| `dockIn`   | .6s      | slide in 28px from the right + fade                       | right-side dock                |

**The consistent recipe:** entrances combine a small **translateY (14–30px)**, a short
**blur→0 (4–9px)**, and a **fade**, on the signature ease. Reuse this recipe for any new
element rather than inventing a new motion.

### 5.2 Staged reveal (the "build-on" pattern)

The defining behavior: elements marked `[data-seq]` or `.rv` start at `opacity:0` and animate
only when the engine adds `.on` at a scheduled beat. Whole cards **never** appear at once —
each line/number/word enters on its own beat, like a film cut. In JS, helpers stagger the
`.on` class with a base delay + per-index step (typical: **200–430ms** between beats).

Word-by-word title/transcript reveals set an `animation-delay` per word (title cadence
`WORD_GAP ≈ 175ms`, `WORD_DUR ≈ 700ms`, tail hold ≈ 1000ms). Transcript reveal is paced to
the clip's real audio duration, with a `REVEAL_SPREAD ≈ 0.9` (words finish revealing at ~90%
of the clip so the last word isn't rushed at the very end).

### 5.3 Ambient / looping motion

Slow, low-opacity, infinite loops that never distract: `aurora` (14–16s drift),
`spin` (26–30s), `breathe` (4.4s subtle scale on figures/photos), `twinkle`, `confetti`,
`floatUp` glyphs, `noteRain`, sound-wave `stroke-dashoffset` flows, `blink` caret (1s steps).

### 5.4 Scene transitions

Between scenes the engine fires a **single light-sweep wipe** (`.wipe.active` → `wipeSweep`
0.6s): a bright `accent → accent2` band translates across the screen. Combined with the
`.9s` background-color transition, each scene change reads as one clean cut. Scenes advance
either on a wall-clock `duration` (clock scenes) or when the last audio clip `ended`
(audio scenes). A bottom **progress rail** fills continuously as a video-style scrubber.

### 5.5 Reduced motion

`@media (prefers-reduced-motion:reduce)` collapses all animation to `~.001s` /
`transition:.2s`, removes decorative loops (rain, streaks, confetti, notes, glyphs,
sound-waves), and zeroes per-word stagger so lines appear at once. **Any new animated element
must degrade here** — decorative loops get `display:none`, functional reveals just snap in.

---

## 6. Component Cheat-Sheet

Quick reference to reusable components and their signature styling (all theme off tokens):

- **Start gate** — full-screen radial, drifting aurora, spinning chakra, gradient-clipped
  title, pill CTA with `--glow`, uppercase wide-tracked eyebrow/foot.
- **Kicker + tick** — 700 uppercase `--saffron2` with a 22×2px `--accent` bar before it.
- **Pill button** — `border-radius:100px`, saffron gradient fill, `--glow`, lifts
  `translateY(-2px) scale(1.03)` on hover.
- **Stat** — display-size 800 number in a `160deg amber→saffron→magenta` clipped gradient,
  `--label` caption in `--muted` below, pops in on its beat.
- **Callout card** — `--surface` fill, `--shadow-1`, 16px radius, `pop` entrance.
- **Progress rail** — 3px track `rgba(18,32,56,.10)`, fill `saffron→magenta` gradient with
  `--glow`, width transitions `.12s linear`.
- **Waveform / visualizer** — reads `--accent`/`--accent2`; drop-shadowed; can dock right,
  strip along the bottom, or float on the stage.
- **Placeholder frame** — dashed saffron border (`rgba(224,98,13,.5)`) on a `.05` saffron
  fill with a centered `--saffron2` label; the standard "asset pending" treatment.

---

## 7. Adapting This Style to a New Presentation

A practical checklist for building a different deck in the same family:

1. **Copy the token block** (`:root` in `styles.css`) verbatim — colors, shadows, the 4-tier
   type scale, and the transcript spec. This alone establishes the look.
2. **Tune the four `--fs-*` sizes** if this deck needs a different overall scale. Keep four
   tiers; keep the `clamp()` structure. Do not add per-component pixel sizes.
3. **Define your scenes** as `body[data-scene="…"]` blocks: each sets `--accent`,
   `--accent2`, and a ~5%-saturation radial background tint of that accent. Nothing else
   should need per-scene color.
4. **Compose from the layout archetypes** (§4.3) — caption layer, center card, right dock,
   multi-column, stat row, photo cards. New layouts are fine; keep the spacing conventions
   (vw padding, `clamp()` gaps, ch-based measures, 16–22px radii).
5. **Animate with the existing vocabulary** (§5.1) — reach for `capRise` / `pop` / `rvUp` /
   `wordIn` before writing a new keyframe. Use the signature ease `cubic-bezier(.2,.8,.2,1)`
   and 0.4–0.7s durations. Build content on one beat at a time; never reveal a whole card
   at once.
6. **Keep the signature frame** — tricolor strip, grain, scene wipe, progress rail — so the
   deck is recognizably part of the family, then diverge freely on content and structure.
7. **Always add the `prefers-reduced-motion` fallback** for anything you animate.

---

*Source of truth: `film/styles.css` (tokens, components, per-scene themes),
`film/app.js` (motion timing, staged-reveal engine, scene transitions), and
`film/reel.js` (authored copy & scene durations). When these diverge from this document,
the code wins — update this file to match.*
