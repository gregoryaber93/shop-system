---
applyTo: "src/**/*.{ts,tsx}"
---
# React Architecture Rules

- Use a feature-first approach:
  - `src/features/<feature-name>`
  - `src/shared`
  - `src/app`
- In each feature, separate:
  - `api`
  - `model`
  - `ui`
  - `hooks`
  - `tests`
- Components should be small and single-responsibility.
- Keep business logic outside presentational components.
- Avoid passing many props through multiple levels; prefer composition and dedicated hooks.
- For larger capabilities, define module boundaries and a public entry point.

## Requirements For New Features

- Clear responsibility boundaries between UI and data layers.
- No shortcut imports that break modularity.
- Shared types and helpers belong in `shared` only when truly shared.
