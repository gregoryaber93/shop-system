---
applyTo: "src/**/*.{ts,tsx}"
---
# State And Data Fetching Rules

- Separate server state from client state.
- For server state, prefer React Query (or an equivalent mechanism).
- For local state, use `useState`/`useReducer`; use global state only when needed.
- Define stable query keys and do not duplicate them across modules.
- Configure cache and staleTime based on data characteristics.
- Handle race conditions and request cancellation.

## Data UX

- Show loading skeletons instead of spinner flicker on every refresh.
- For errors, provide retry actions.
- For empty datasets, use a clear empty state with a CTA.
