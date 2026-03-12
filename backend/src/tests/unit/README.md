# Backend Unit Tests

## Purpose
Unit tests validate backend behavior in isolation (route validation, middleware behavior, service-level rules) with fast feedback and minimal external dependencies.

## Folder Structure
- `*.test.ts` files in this folder and subfolders.
- `bugs/` contains tests that document known defects and expected-fail behavior until fixes land.

## Framework
- Runner: Vitest (Node environment).
- Config include pattern: `src/tests/unit/**/*.test.ts`.
- Shared setup file: `src/tests/setup-env.ts` (loaded by `backend/vitest.config.ts`).
- Typical strategy:
  - mock services when testing route validation behavior;
  - test middleware and utility behavior directly.

## JWT_SECRET Handling In Tests
- Unit tests run under Vitest, so `src/tests/setup-env.ts` sets `process.env.JWT_SECRET` when missing.
- This avoids accidental dependence on middleware fallback values in most tests.
- Security bug tests can still unset/override `process.env.JWT_SECRET` inside the test to verify fail-fast behavior.

## What This Layer Should Cover
- Input validation and status codes.
- Auth middleware behavior for missing/invalid tokens.
- Route contract expectations that do not require full DB workflows.

## What Not To Cover Here
- End-to-end request flows across auth + DB + multiple routes (use integration).
- Browser/UI behavior (use frontend tests).

## How To Run
From `backend/`:
- Run all backend unit tests:
  - `npm run test:unit`
- Run only bug unit tests:
  - `npm run test:run -- src/tests/unit/bugs`
- Run a single file:
  - `npm run test:run -- src/tests/unit/bugs/auth-jwt-secret.test.ts`

## Prerequisites
- Install deps in `backend/`: `npm install`
- For most unit tests, no server start is required.

## Debugging Tips
- Use focused runs with one file.
- If a test depends on mocked modules, clear mocks in `beforeEach`.
- Verify expected status code classes (4xx vs 5xx), not just messages.

## Adding New Tests
1. Add `*.test.ts` in this folder or a logical subfolder.
2. Keep test names behavior-oriented.
3. Prefer narrow assertions that fail only on the intended defect.
