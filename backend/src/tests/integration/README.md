# Backend Integration Tests

## Purpose
Integration tests validate real API behavior across routes, auth, DB access, and service wiring.

## Folder Structure
- `*.test.ts` files in this folder and subfolders.
- `helpers/` provides integration setup utilities.
- `bugs/` captures known production defects as regression targets.

## Framework
- Runner: Vitest (Node environment).
- Config include pattern: `src/tests/integration/**/*.test.ts`.
- Uses `supertest` against the Express app with real DB interactions.

## What This Layer Should Cover
- End-to-end backend flows (`auth -> protected route -> persistence`).
- Data scoping and multi-user isolation.
- API error contracts under realistic conditions.
- Import workflows including history and counts.

## What Not To Cover Here
- Pixel/UI interaction details (frontend integration/e2e).
- Fine-grained component rendering behavior.

## How To Run
From `backend/`:
- Run all integration tests:
  - `npm run test:integration`
- Run only bug integration tests:
  - `npm run test:run -- src/tests/integration/bugs`
- Run a single file:
  - `npm run test:run -- src/tests/integration/bugs/import-malformed-rows.test.ts`

## Prerequisites
- Install deps in `backend/`: `npm install`
- DB should be migrated/seeded if required by your flow:
  - `npm run db:migrate`
  - `npm run db:seed`

## Debugging Tips
- If preflight-based tests skip, verify DB and `/api/health`.
- Check response status and payload together.
- For flaky cases, isolate user data with unique emails.

## Adding New Tests
1. Use unique test users and data to avoid collisions.
2. Assert both happy path and failure path where meaningful.
3. Keep assertions deterministic (avoid broad `>=` checks unless intentional).
