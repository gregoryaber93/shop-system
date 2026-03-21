---
applyTo: "src/**/*.{ts,tsx}"
---
# API Integration Rules

- Handle each backend service through a dedicated API client.
- Do not call `fetch`/`axios` directly in components.
- Define request/response types and validate response schemas.
- Use timeout, retry (where safe), and error mapping.
- Translate technical errors into user-friendly UI messages.
- For mutations, use optimistic updates only when rollback is safe.

## Contract And Versioning

- Treat API contract changes as a separate step (types, mappers, tests).
- Keep backward compatibility in the UI where possible.
- Document endpoint dependencies on permissions.

## Security

- Do not log tokens or sensitive data.
- Configure auth headers centrally.
- Normalize and sanitize external data.
