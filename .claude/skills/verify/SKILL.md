---
name: verify
description: Build, launch, and drive this Next.js prayer app to verify changes at the UI surface.
---

# Verifying ora-app

## Build & launch

```bash
npm install --no-audit --no-fund     # node_modules is not checked in
npm run build                        # next build; routes print at the end
PORT=3211 npx next start             # serve the production build (background)
curl -s --noproxy localhost http://localhost:3211/   # wait for 200
```

## Drive (headless Chromium)

Playwright is installed globally, not in the project:

```bash
NODE_PATH=/opt/node22/lib/node_modules node your-drive-script.js
```

Chromium lives at `/opt/pw-browsers` (Playwright finds it via
`PLAYWRIGHT_BROWSERS_PATH`; do not run `playwright install`).

## Gotchas

- The app shows a "Tap to Enter" splash on first load; the first click
  dismisses it, so screenshot *after* an initial interaction, or click
  the body once before capturing.
- `/api/tts?probe=1` returns 503 without TTS API keys — expected in dev;
  every page with a Listen button logs this console error.
- Prayer flows to spot-check: `/rosary`, `/holy-face`, `/divine-mercy`
  (mode menu → Interactive → tap "Continue" through steps; sidebar
  sections jump via `narration.seek`).
