# Global React Frontend Instructions

You are working on a modern React + TypeScript application for a microservices-based platform.

## Priorities

1. Business correctness and API contract compliance.
2. Readability and solution simplicity.
3. Security and resilience.
4. Performance and UX.
5. Testability and maintainability.

## Global Rules

- Use TypeScript strict mode and avoid `any`.
- Build modularly: feature-first, not "everything in one place".
- Every screen must support loading, empty, error, and success states.
- Every API call must include timeout, error handling, and mapping to a clear UI message.
- Validate input data and server responses (for example with Zod).
- Deliver changes in small steps, with tests.
- Do not duplicate logic; prefer shared hooks and utilities.

## Change Implementation Standard

For every change, Copilot should provide:
- A step-by-step plan.
- Implementation code.
- Tests.
- A short summary of risks and technical decisions.

## Backend Integration

- Treat the API contract as the source of truth.
- Separate the API client layer from UI components.
- Use DTOs and mappers for UI models.
- Do not mix transport logic (HTTP) with presentation logic.

## Quality

- Lint + format + typecheck must pass.
- Key business flows must have tests.
- Do not introduce breaking changes without clear justification.

## Prompt Architecture

When executing a task, use this structure:
- Context: screen/feature and backend dependencies.
- Goal: what should work after the change.
- Constraints: standards, edge cases, performance, security.
- Output: code + tests + verification checklist.
