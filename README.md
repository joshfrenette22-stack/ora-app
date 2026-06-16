# ORA — Prayer Warrior

A reverent Catholic prayer companion: daily Mass readings, the Liturgy of the
Hours, the Holy Rosary, the saint of the day, and the liturgical calendar — with
optional human-voice narration.

Built with Next.js 16 (App Router), React 19, and TypeScript.

## Features

- **Today** — liturgical season/colour, a daily verse, and quick links.
- **Daily Mass** — the day's readings with a follow-along audio player.
- **Liturgy of the Hours** — the current hour's antiphon, read aloud.
- **The Holy Rosary** — hands-free narration that auto-advances the beads.
- **Saints** — the day's celebration with life and collect.
- **Calendar** — the month's feasts and seasons.
- **Settings** — pick a narration voice (with live previews) and night mode.
- Installable PWA with an app icon; responsive (sidebar on desktop, bottom bar on phones).

## Data sources

- **Liturgical calendar** — [`romcal`](https://github.com/romcal/romcal) (General Roman Calendar, US).
- **Mass readings** — the day's *citations* are read from the USCCB lectionary,
  then the scripture text is rendered from a chosen translation:
  **ESV** (if configured) → **Douay–Rheims 1899** (public domain, bundled) →
  the scraped text as a last resort. Using only the citations plus a
  public-domain translation keeps the default fully license-clean.
- **Narration** — Google Cloud Text-to-Speech (natural voices) when configured,
  otherwise the browser's Web Speech API.

## Configuration

All environment variables are **optional** — the app runs without them and
degrades gracefully. See [`.env.example`](./.env.example).

| Variable | Purpose |
| --- | --- |
| `ESV_API_KEY` | Crossway ESV API key. Renders the protocanon in the ESV. Non-commercial free tier; a public app needs a Crossway licence. |
| `GOOGLE_TTS_API_KEY` | Google Cloud TTS key (enable "Cloud Text-to-Speech API"). Switches narration to a human voice. |
| `GOOGLE_TTS_VOICE` | Optional default voice, e.g. `en-US-Neural2-D`. Users can override it in Settings. |

Copy `.env.example` to `.env.local` and fill in what you need.

## Development

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
```

## Regenerating the bundled bible

The Douay–Rheims text in `src/data/dra.json` is generated from public-domain
sources:

```bash
node scripts/build-dra.mjs
```

## Licensing notes

- The bundled **Douay–Rheims 1899** is public domain.
- The **ESV** is © Crossway and the **NABRE** (USCCB) is © CCD — both are used
  only when configured, with attribution shown in the readings source line.
  Confirm you hold the appropriate rights before deploying publicly.
