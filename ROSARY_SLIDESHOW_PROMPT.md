# Wiring Prompt — Rosary Slideshow synced to the guided narration

Paste everything below into your AI coding tool (Claude Code, Cursor, etc.) with
this repo open. It is written so the tool can verify its own assumptions and
implement the feature end to end.

---

## Task

Add a **synchronized slideshow** to the Holy Rosary player so that, as the AI
TTS reads each prayer aloud, a matching devotional painting is shown — one image
per Hail Mary, the mystery's announcement card during the Our Father, and the
"fruit of the mystery" card during the Glory Be. It must work in both **Fully
Guided** (auto-advancing TTS) and **Interactive** (tap-to-advance) modes, and
degrade gracefully for the Luminous mysteries (which have no slide art).

The image assets and a typed data layer are **already in the repo** — you are
wiring up the UI, not sourcing art.

## Step 0 — Verify the ground truth before coding

Don't trust this prompt blindly; confirm against the code:

1. Confirm the stack: open `package.json`. Expected: **Next.js (App Router) +
   React + TypeScript + Tailwind**. If it differs, adapt the implementation
   accordingly and note what changed.
2. Open and read these files so your integration matches reality:
   - `src/app/rosary/page.tsx` — the player. Note the local state
     `activeSet` (`"Joyful" | "Sorrowful" | "Glorious" | "Luminous"`),
     `mysteryIdx` (0–4) and `bead` (0–11), `TOTAL_BEADS = 12`, and that
     `useNarration({ onSegmentChange })` already updates `mysteryIdx`/`bead` as
     the TTS advances. **This is the sync signal — reuse it; do not add a second
     timer.**
   - `src/components/PrayerPlayer.tsx` — `useNarration`, `NarrationSegment`,
     `onSegmentChange(index)`. Global segment index = `mysteryIdx * 12 + bead`.
   - `src/data/rosarySlides.ts` — **already created.** Exports
     `rosarySlide(set, mysteryIdx, bead): string | null`, `hasSlides(set)`,
     `ROSARY_SLIDES`, and types. Read its header comment for the bead→slide map.
   - `src/components/Illustration.tsx` — the existing `next/image` wrapper and
     the dark-mode look. The new slides are **photographic**, so do NOT apply
     the `invert()` dark filter or the line-art feather mask to them.
   - `src/lib/illustrations.ts` — `MYSTERY_ART[set]` is the existing ambient
     illustration key; use it as the Luminous fallback.
3. Confirm assets exist: `public/rosary/{joyful,sorrowful,glorious}/<set>_001.webp`
   … `_061.webp` (61 each, 183 total). Spot-check one path resolves at
   `http://localhost:3000/rosary/joyful/joyful_003.webp` once dev is running.

## The mapping (already implemented in `rosarySlides.ts`)

Each mystery has exactly 12 slides, matching the 12 beads:

| Bead | Prayer read by TTS | Slide |
|------|--------------------|-------|
| 0 | Mystery announced + Our Father | announcement card |
| 1–10 | Hail Mary 1–10 | the ten paintings |
| 11 | Glory Be + Fatima | fruit-of-the-mystery card |

`rosarySlide(activeSet, mysteryIdx, bead)` returns the right `/rosary/...webp`
path, or `null` for sets without art (Luminous). Because `activeSet`,
`mysteryIdx`, and `bead` are already React state, **the current slide is a pure
derived value** — it updates on every bead change automatically in both modes.

## Step 1 — Build a `RosarySlide` component

Create `src/components/RosarySlide.tsx`, a client component:

- Props: `{ set: string; mysteryIdx: number; bead: number; titleCard?: boolean }`.
- Compute `const src = rosarySlide(set, mysteryIdx, bead)`.
- If `src === null`, render nothing (the page keeps its existing ambient
  `MYSTERY_ART` illustration as fallback — see Step 2).
- Render with `next/image` (`fill` inside a positioned wrapper, or fixed
  width/height to taste). Use `sizes` appropriate to the layout and
  `priority` only for the first shown image.
- **Crossfade on change.** Keep the previous `src` mounted briefly and fade
  between layers (opacity transition ~400–600ms, `var(--ease-sacred)` if
  defined) so swaps feel reverent, not jarring. A simple approach: track
  `[current, previous]` in state via `useEffect` on `src`, stack two absolutely
  positioned `<Image>`s, fade the old out / new in.
- **Preload the next slide** to avoid flashes: compute the next bead's src
  (`bead + 1`, rolling into the next mystery; clamp at the end) and prefetch it
  (e.g. an off-screen `<Image>` or `new window.Image().src = next`).
- Respect `prefers-reduced-motion` (skip the crossfade, hard-cut instead).
- Alt text: use the mystery name + prayer label, e.g.
  `"The Annunciation — Hail Mary 3"`. Pull names from `ROSARY_SLIDES[set]`.
- Match the dark sacred aesthetic: rounded corners, soft shadow, maybe a faint
  gold inner border (`var(--gold)`), no harsh rectangle. Do not invert colors.

## Step 2 — Integrate into `src/app/rosary/page.tsx`

In the prayer view (the `mode !== "menu"` branch, inside `<main>`):

- Render `<RosarySlide set={activeSet} mysteryIdx={mysteryIdx} bead={bead} />`
  as the focal visual for the current prayer. Place it prominently near the
  mystery name / above the `SpokenText`, sized so it reads as the main image
  while praying.
- Keep the existing ambient `<Illustration name={MYSTERY_ART[activeSet]} … />`
  but only show it (as the background texture) **when `hasSlides(activeSet)` is
  false** — i.e. Luminous keeps today's look; the three sets with art lead with
  the photographs. (Or layer the ambient behind the slide at low opacity for all
  sets — your call, but Luminous must still look complete.)
- Do not change the narration/segment logic. The slide follows `mysteryIdx` and
  `bead`, which `onSegmentChange`, `advance()`, `seek()`, and `jumpToMystery()`
  already drive. Verify by reading those handlers — no new wiring required.
- Optional nicety: when `mode === "menu"`, you may show
  `ROSARY_SLIDES[activeSet].titleCard` as a hero if `hasSlides(activeSet)`.

## Step 3 — Quality, performance, correctness

- **No hydration mismatch.** `activeSet` is set from the weekday in a client
  `useEffect`; keep slide rendering client-side and stable on first paint.
- **Smoothness:** preload next image; crossfade; `priority` only on the first.
  Confirm no layout shift (reserve the image box).
- **Accessibility:** meaningful `alt`; the slideshow is decorative-adjacent but
  should not trap focus or autoplay sound (audio is the existing TTS).
- **Luminous:** with `activeSet === "Luminous"`, `rosarySlide` returns `null`
  everywhere — verify the page still looks intentional via the fallback.
- **Reduced motion** honored.

## Step 4 — Acceptance criteria

1. `npm run dev`, open `/rosary`, choose **Fully Guided** on a Joyful/
   Sorrowful/Glorious day. As the TTS reads, the image changes on every bead:
   announcement card on the Our Father, a new painting on each Hail Mary, the
   fruit card on the Glory Be, then the next mystery's announcement.
2. **Interactive** mode: tapping **Continue** advances the slide in lockstep
   with the prayer text. Jumping mysteries in the sidebar jumps the slide.
3. Switching mystery sets swaps to that set's art immediately.
4. **Luminous** day: no broken images; falls back to the existing illustration.
5. `npm run build` and `npx tsc --noEmit` both pass. `npm run lint` is clean.
6. Crossfades are smooth; no flashes of unstyled/loading image; reduced-motion
   users get hard cuts.

## Notes

- Assets: `public/rosary/<set>/<set>_NNN.webp` (61 per set). Reference docs:
  `docs/rosary-slides/README.md`. Static data mirror:
  `public/rosary/manifest.json`.
- The source DVDs only covered Joyful, Sorrowful, and Glorious. If you later add
  Luminous art, drop 61 webp frames in `public/rosary/luminous/` and extend
  `ROSARY_SLIDES` + `SlideSetKey` in `src/data/rosarySlides.ts`; the helper and
  UI will pick it up with no other changes.
