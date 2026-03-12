# Frontend Unit Bug Tests

## Purpose
Tracks known frontend unit-level defects with targeted tests.

## Expected Behavior
- Most tests are expected to fail while bugs are unresolved.
- Tests should turn green only after the specific defect is fixed.

## Coverage Examples
- Input validation guardrails.
- Date derivation logic.
- Auth hydration correctness.
- Trend edge-case rendering.

## How To Run
From `frontend/`:
- Run all unit bug tests:
  - `npm run test:run -- src/tests/unit/bugs`
- Run one bug file:
  - `npm run test:run -- src/tests/unit/bugs/use-auth-hydration.test.tsx`

## Interpreting Results
- Failing: expected for open bugs.
- Passing: either fixed bug or too-permissive assertion; tighten when needed.

## Authoring Guidance
- Assert real bug symptom, not unrelated baseline behavior.
- Avoid string-fragile assertions when behavior assertions are possible.
- Keep one bug theme per test file.
