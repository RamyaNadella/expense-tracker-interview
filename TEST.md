# Test Findings And Reliability Notes

## Purpose
This document captures:
- Bugs identified during the current test review
- High-risk areas in the app architecture and test setup
- Reliability improvements that should be considered, even if not fixed immediately

## Identified Bugs

### P0
- **JWT secret fallback is insecure**
  - `backend/src/middleware/auth.ts` falls back to a hardcoded default secret.
- **Date/timezone drift across app**
  - Use of `toISOString().split('T')[0]` can shift calendar date in some timezones.
  - Affects expense defaults/filters, monthly totals, and CSV date normalization.
- **Dashboard recent expense Edit flow is broken**
  - Dashboard routes to `/expenses?edit=<id>` but Expenses page does not consume this query param.
- **Dashboard recent expense Delete action is no-op**
  - Delete callback is wired as empty function in dashboard recent list path.
- **Invalid categoryId returns 500**
  - Expense create/update relies on DB FK failure and returns generic server error instead of a controlled 4xx.

### P1
- **Invalid custom date ranges are allowed**
  - `To` can be earlier than `From`, resulting in inconsistent query behavior.
- **Amount input is too permissive**
  - Negative values and exponent-like inputs can pass through UI paths.
- **CSV amount parsing is permissive**
  - Values like `123 Coffee` are parsed as valid numeric values.
- **Import validation/messaging gaps**
  - Some invalid-row scenarios are not explained clearly enough for users.
- **Dashboard trend edge behavior**
  - Zero-vs-zero trend is hidden.
  - Very small previous totals can yield extreme percent values.
- **Auth hydration false-positive**
  - Frontend can treat stale local token/user as authenticated until API call fails.
- **Pagination query validation gap**
  - Invalid `limit`/`offset` inputs are not validated early and can become server errors.

## Risk Areas

- **Authentication and security**
  - Secret management and token trust model are fragile in current state.
- **Date handling and money correctness**
  - Timezone drift and permissive numeric parsing can corrupt financial reporting.
- **Error contract stability**
  - 500 responses on user input errors reduce API reliability and client recoverability.
- **Cross-page UX wiring**
  - Dashboard actions that navigate to other pages are not strongly contract-tested.
- **Import pipeline integrity**
  - Parsing, validation, skip behavior, and history counts need stricter guarantees.

## Reliability Improvements (Recommended)

### Immediate (high impact, low-to-medium effort)
- Enforce **env-only JWT secret** in non-test environments (fail fast on missing secret).
- Replace UTC date string construction with **local-safe date formatting helpers**.
- Validate and return **4xx** for invalid `categoryId`, `limit`, `offset`, and invalid date range.
- Make Expense amount input strict (min, step, no exponent handling, explicit validation).
- Wire dashboard Edit/Delete actions to real behavior paths and add assertions for them.

### Near-term
- Harden CSV parsing:
  - Strict numeric regex parsing for amount fields
  - Explicit delimiter/file-type handling and user-facing error messages
- Standardize error payloads across backend routes for predictable frontend handling.
- Add reliability guardrails:
  - Retry strategy where safe
  - Better defensive null handling around optional API fields

### Medium-term
- Add a small shared utility package for:
  - Date-only conversion
  - Amount parsing/validation
  - Common API error mapping
- Improve observability:
  - Add structured error codes
  - Tag import session lifecycle events for diagnostics

## Test Coverage Gaps To Prioritize

- Delimiter matrix coverage for import (`comma`, `semicolon`, `tab`).
- File-format behavior coverage (`csv`, `tsv` input expectations).
- Stronger end-to-end assertions for import history counts after skip scenarios.
- Frontend auth hydration test that verifies token validity rather than localStorage presence only.

## Suggested Execution Order

1. Security and API contract correctness (JWT secret, 4xx vs 500 handling).
2. Date and amount correctness (timezone-safe dates, strict numeric validation).
3. Dashboard action wiring and trend display edge behavior.
4. Import parser strictness, delimiter/file-format handling, and message clarity.

## Notes
- Some bug tests currently pass because they are broad or detect proxy behavior, not the root defect.
- Bug tests should be tightened to fail only when the real defect exists and pass after the exact fix.
