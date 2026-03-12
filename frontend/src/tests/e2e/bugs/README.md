# Frontend E2E Bug Tests

## Purpose
This folder contains bug-focused Playwright scenarios for high-risk cross-layer defects.

## Expected Behavior
- These tests are intended to fail until corresponding bugs are fixed.
- After fixes, keep them as permanent regressions.

## Important Current Limitation
- Default Playwright config uses `testDir: src/tests/e2e/specs`.
- This `bugs/` folder is **not** picked up by `npm run test:e2e` today.

## How To Run
From `frontend/`:
- Default suite (does **not** include this folder):
  - `npm run test:e2e`
- Bug suite with shared Playwright setup:
  - `npm run test:e2e:bugs`

## Notes On Current Bug Runner State
- `test:e2e:bugs` uses `playwright.bugs.config.ts`, which reuses root config and only overrides `testDir` to this folder.
- Backend env vars (including `JWT_SECRET`) come from the Playwright-launched backend process, not backend Vitest setup files.
- Since this config extends `frontend/playwright.config.ts`, bug E2E runs also get explicit backend `JWT_SECRET` injection.
- Bug runs also inherit failure artifacts from base config:
  - screenshot on failure (`test-failed-1.png`)
  - video retained on failure (`video.webm`)
  - trace on first retry

## Authoring Guidance
- Keep this folder minimal and high-signal.
- Add only scenarios that truly need browser + API + DB realism.
