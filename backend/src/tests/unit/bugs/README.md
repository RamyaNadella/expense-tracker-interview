# Backend Unit Bug Tests

## Purpose
This folder tracks known backend unit-level defects with focused tests.

## Expected Behavior Of This Suite
- Many tests are intentionally expected to fail until the related bug is fixed.
- After a fix, the same tests become regression protection and should pass.

## Coverage Scope
- Security/config defects (e.g., JWT secret handling).
- Validation defects (status code/contract mismatches).
- Parsing/date logic defects detectable at unit level.

## How To Run
From `backend/`:
- Run all bug unit tests:
  - `npm run test:run -- src/tests/unit/bugs`
- Run a single bug test:
  - `npm run test:run -- src/tests/unit/bugs/import-parsing-strictness.test.ts`

## Interpreting Results
- **Failing** can mean bug still exists (expected for open bugs).
- **Passing** can mean:
  - bug was fixed, or
  - test is too weak (tighten assertions to avoid false positives).

## When Adding A New Bug Test
1. Make the assertion fail on current buggy behavior.
2. Avoid broad assertions that can pass accidentally.
3. Name file by behavior, not ticket number.
