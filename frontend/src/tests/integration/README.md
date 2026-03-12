# Frontend Integration Tests

## Purpose
Integration tests validate page-level behavior and cross-component wiring inside the frontend app.

## Folder Structure
- `*.test.tsx` files for route/page-level behavior.
- `bugs/` holds integration tests for currently known UX/flow defects.

## Framework
- Runner: Vitest + `jsdom`.
- Config include pattern: `src/tests/integration/**/*.test.{ts,tsx}`.
- Uses mocked hooks/services selectively to test wiring logic.

## What This Layer Should Cover
- Route transitions and page-level behaviors in app shell context.
- Component collaboration (e.g., dashboard actions navigating to expenses).
- Integration of hooks and UI states (loading/error/empty/interaction).

## What Not To Cover Here
- Real backend/DB behavior (backend integration + e2e).
- Browser engine specifics (Playwright e2e).

## How To Run
From `frontend/`:
- Run all frontend integration tests:
  - `npm run test:integration`
- Run only integration bug tests:
  - `npm run test:run -- src/tests/integration/bugs`
- Run one file:
  - `npm run test:run -- src/tests/integration/bugs/dashboard-expense-actions.test.tsx`

## Prerequisites
- `npm install`

## Debugging Tips
- Use `waitFor` for async view transitions.
- Verify both navigation result and target UI state.
- Keep assertions tied to user-visible outcome.

## Adding New Tests
1. Prefer scenario-driven naming.
2. Test one integration contract per test.
3. Keep mocked data realistic and minimal.
