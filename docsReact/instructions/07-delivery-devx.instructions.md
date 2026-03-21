---
applyTo: "**/*"
---
# Delivery And Dev Workflow Rules

- Split large tasks into small, independent PRs.
- In PR descriptions include: goal, scope, risk, rollback plan.
- Every change should be easy to review and easy to revert.
- Update technical documentation when API or UI architecture changes.
- Introduce feature flags where release risk is high.

## Prompting Pattern

Use a consistent request pattern with Copilot:
1. Functional and technical context.
2. Exact expected outcome.
3. Constraints and standards.
4. Test list and acceptance criteria.

## Team Collaboration

- Standardize naming and file structure.
- Do not mix refactoring with new functionality unless necessary.
- Record architecture decisions as short ADR notes in docs.
