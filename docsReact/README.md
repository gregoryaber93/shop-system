# React + TypeScript Copilot Instructions Pack

This directory contains a ready-to-use instruction pack for working with GitHub Copilot on a React + TypeScript frontend for this microservices system.

Goals:
- standardize how code is generated,
- enable faster and safer backend integrations,
- split work into smaller, independent areas,
- maintain high quality without technical debt.

## What Is Included

- `copilot-instructions.md` - main global rules file.
- `instructions/*.instructions.md` - detailed instructions split by domain.

## How To Use

1. Copy `docsReact/copilot-instructions.md` to `.github/copilot-instructions.md`.
2. Copy the `docsReact/instructions` folder to `.github/instructions`.
3. Open a frontend task in the repo and work iteratively: plan -> implementation -> tests -> fixes.
4. When Copilot generates code, always reference the relevant instruction area (for example API, testing, UI).

## Recommended Workflow

1. Start with the API contract and user scenarios.
2. Ask Copilot for a feature and folder skeleton.
3. Implement vertically in small slices (screen + data + validation + test).
4. After each slice, run lint, typecheck, and tests.
5. Merge only after meeting the Definition of Done.

## Key Productivity Practices

- Write short prompts with context: goal, constraints, expected output.
- Work with reusable patterns (API hook, Zod schema, form component, test).
- Require complete outputs from Copilot: code + test + type updates + change note.
- Do not accept code without error handling, loading state, and a test for critical logic.
- Prioritize readability and maintainability over clever shortcuts.

## Definition Of Done For Every UI Task

- TypeScript types are strict, with no `any`.
- API has input/output validation.
- The screen includes loading, empty, error, and success states.
- Accessibility is covered: focus, aria-label where needed, contrast, and keyboard navigation.
- Unit tests plus at least one integration scenario.
- No new lint/typecheck errors.

## Pack Maintenance

- Update instructions after major architecture changes.
- Add new `.instructions.md` files when a new work area appears.
- Remove or adjust rules that create unnecessary overhead.
