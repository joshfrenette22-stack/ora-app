# Rosary Slideshow Art

183 slide images extracted from the original DVD slideshows, for the guided
Rosary. Three of the four mystery sets are covered:

| Set | Folder | Source video | Slides |
|-----|--------|--------------|--------|
| Joyful | `public/rosary/joyful/` | VTS_01_1 | 61 |
| Sorrowful | `public/rosary/sorrowful/` | VTS_03_1 | 61 |
| Glorious | `public/rosary/glorious/` | VTS_02_1 | 61 |
| Luminous | — | (none) | 0 — falls back to existing `MYSTERY_ART` |

## Structure of each set (61 slides)

```
_001                      set title card  ("The Joyful Mysteries")
_002  announcement        Mystery I  ── bead 0  (announcement + Our Father)
_003..012  Hail Marys     Mystery I  ── beads 1–10
_013  fruit card          Mystery I  ── bead 11 (Glory Be + Fatima)
_014  announcement        Mystery II ── bead 0
_015..024  Hail Marys     Mystery II ── beads 1–10
_025  fruit card          Mystery II ── bead 11
... and so on for mysteries III, IV, V
_061  fruit card          Mystery V  ── bead 11 (the "THE END" / Fatima card)
```

The announcement card index for mystery *m* (0-based) is `2 + 12*m`; its ten
Hail Marys follow, and the fruit card is `13 + 12*m`.

## Bead → slide mapping

This lines up 1:1 with the narration in `src/app/rosary/page.tsx`
(`TOTAL_BEADS = 12`):

| Bead | Prayer | Slide |
|------|--------|-------|
| 0 | Our Father (after the mystery is announced) | announcement card |
| 1–10 | Hail Mary 1–10 | the ten paintings |
| 11 | Glory Be + Fatima prayer | fruit-of-the-mystery card |

## How to use in code

Use the typed helper in `src/data/rosarySlides.ts`:

```ts
import { rosarySlide, hasSlides } from "@/data/rosarySlides";

const src = rosarySlide(activeSet, mysteryIdx, bead); // string | null
// null => no art for this set (Luminous); fall back to MYSTERY_ART.
```

A static `public/rosary/manifest.json` mirrors the same data for any
non-TypeScript consumer.

## Card transcriptions (the text "slider" cards)

### Joyful
1. The Annunciation — *Submission of our will to the Will of God*
2. The Visitation — *Charity towards our neighbour*
3. The Birth of Our Saviour — *Glory to God in the highest; peace on earth to men of good will*
4. The Presentation in the Temple — *Obedience to the Laws of the Church*
5. Finding of the Child Jesus in the Temple — *Fidelity to our Christian Duty*

### Sorrowful
1. The Agony in the Garden — *Let us hate sin*
2. The Scourging at the Pillar — *Let us be willing to suffer a little with Jesus*
3. The Crowning with Thorns — *Let us humble our pride*
4. The Carrying of the Cross — *Let us be patient and carry the little crosses of every day*
5. The Crucifixion — *O Jesus, forgive us our sins, save us from the fire of hell, bring us all to heaven*

### Glorious
1. The Resurrection — *Let us rise from sin*
2. The Ascension — *Let us have an ardent desire for Paradise*
3. The Descent of the Holy Spirit — *Let us be faithful to the Holy Church*
4. The Assumption — *Let us be devout to Mary*
5. The Coronation of Mary — *Let us persevere to the end*

> Source masters (original `.jpg` frames, per-day markdown, and a visual
> `preview.html`) are archived outside the repo in the `Videos 2/rosary/` folder.
