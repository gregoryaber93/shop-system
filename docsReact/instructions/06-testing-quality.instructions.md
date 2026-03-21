---
applyTo: "src/**/*.{ts,tsx}"
---
# Testing And Quality Rules

- Tests are part of every change, not an optional step.
- Cover with tests:
  - business logic,
  - data mapping layer,
  - key user interactions.
- Prefer behavior tests over implementation-detail tests.
- Stub backend calls with MSW or an equivalent mechanism.
- Keep integration tests for critical screens.

## Quality Gates

- No lint errors.
- No typecheck errors.
- Tests pass locally.
- No regressions in critical flows.
