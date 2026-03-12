# Frontend Integration Bug Tests

## Purpose
Captures known page-wiring and flow defects at frontend integration level.

## Expected Behavior
- Tests are expected to fail while defects remain open.
- They become regression tests once fixes are applied.

## Coverage Examples
- Dashboard action wiring (`edit`/`delete`).
- Invalid date range flow handling.
- Route-to-state integration defects.

## How To Run
From `frontend/`:
- Run all integration bug tests:
  - `npm run test:run -- src/tests/integration/bugs`
- Run one file:
  - `npm run test:run -- src/tests/integration/bugs/dashboard-expense-actions.test.tsx`

## Interpreting Results
- Red is expected for open defects.
- Any unexpected green should be reviewed for assertion quality.

## Authoring Guidance
- Prefer user-visible page outcomes over internal state checks.
- Use realistic mocked data to surface true integration defects.
