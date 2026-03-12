# Frontend E2E Tests

## Purpose
E2E tests validate full browser behavior with real frontend + backend interaction.

## Folder Structure
- `specs/` main Playwright test suite.
- `POM/` page objects and reusable browser actions.
- `utils/` e2e helpers (test users, scenarios, session helpers).
- `bugs/` dedicated bug-focused e2e scenarios (see bugs README).
- `global.setup.ts` preflight/login sanity setup.

## Framework
- Runner: Playwright Test.
- Default `testDir`: `src/tests/e2e/specs` (from `frontend/playwright.config.ts`).
- Uses Chromium project, trace on first retry, and webServer auto-start for backend/frontend.

## What This Layer Should Cover
- Critical user journeys with real browser behavior.
- UI + API consistency checks where needed.
- Cross-page behavior that lower layers cannot guarantee.

## What Not To Cover Here
- Exhaustive validation matrices already covered by unit/integration layers.
- Implementation-level detail tests.

## How To Run
From `frontend/`:
- Run default e2e suite (`specs/`):
  - `npm run test:e2e`
- Run headed:
  - `npm run test:e2e:headed`
- Show report:
  - `npm run test:e2e:report`

## Prerequisites
- `npm install` in both `frontend/` and `backend/`
- Playwright browsers installed as needed (`npx playwright install`)

## Debugging Tips
- Use `--headed --workers=1` when investigating flaky behavior.
- Inspect traces and HTML report for timing/navigation issues.
- Prefer robust role/label selectors in POM helpers.

## Adding New E2E Tests
1. Add scenarios under `specs/` for stable suite coverage.
2. Reuse/extend POM abstractions in `POM/`.
3. Keep data isolated using unique test users and descriptions.
