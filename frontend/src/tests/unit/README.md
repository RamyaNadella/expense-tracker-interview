# Frontend Unit Tests

## Purpose
Unit tests validate component and hook behavior in isolation with fast feedback.

## Folder Structure
- `*.test.tsx` and `*.test.ts` files.
- `bugs/` contains known-defect tests for frontend unit-level issues.
- Shared helpers live in `src/tests/test-utils.tsx`.

## Framework
- Runner: Vitest with `jsdom`.
- Config include pattern: `src/tests/unit/**/*.test.{ts,tsx}`.
- Uses Testing Library patterns for user-centric assertions.

## What This Layer Should Cover
- Component validation rules and local state transitions.
- Hook behavior and localStorage/query behavior.
- Formatting/derived-value logic that does not require full routing flow.

## What Not To Cover Here
- Multi-page navigation contracts (frontend integration/e2e).
- Full browser + backend realism (e2e).

## How To Run
From `frontend/`:
- Run all frontend unit tests:
  - `npm run test:unit`
- Run only unit bug tests:
  - `npm run test:run -- src/tests/unit/bugs`
- Run one file:
  - `npm run test:run -- src/tests/unit/bugs/expense-form-amount-input.test.tsx`

## Prerequisites
- Install deps in `frontend/`: `npm install`

## Debugging Tips
- Prefer accessible queries (`getByRole`, `getByLabelText`).
- Keep mocks minimal and reset with `vi.clearAllMocks()`.
- Assert visible user outcomes over implementation internals.

## Adding New Tests
1. Keep tests deterministic and behavior-focused.
2. Avoid brittle selector assumptions.
3. Use `test-utils` wrappers for provider setup.
