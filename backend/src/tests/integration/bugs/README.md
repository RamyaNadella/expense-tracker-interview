# Backend Integration Bug Tests

## Purpose
This folder captures known backend bugs that only show up when full route + auth + DB integration is exercised.

## Expected Behavior Of This Suite
- Tests are intended to fail while bugs remain open.
- Once fixed, tests should pass and guard against regressions.

## Coverage Scope
- API contract defects (wrong status class, unstable payloads).
- DB-backed behavior defects (invalid references, counts, boundaries).
- Import flow defects under real request/response conditions.

## How To Run
From `backend/`:
- Run all bug integration tests:
  - `npm run test:run -- src/tests/integration/bugs`
- Run one file:
  - `npm run test:run -- src/tests/integration/bugs/expenses-api-contract.test.ts`

## Prerequisites
- `npm install`
- DB migrated/available for integration flows:
  - `npm run db:migrate`
  - `npm run db:seed` (if needed for local setup)

## Interpreting Results
- Failing tests normally indicate known defects are still present.
- If a bug test unexpectedly passes, review for weak assertions and tighten.

## Authoring Guidance
- Use unique users/data to avoid cross-test overlap.
- Keep expected status codes precise (e.g., enforce 4xx vs 500).
- Assert both API response and persisted side effects where relevant.
