---
applyTo: "src/**/*.{ts,tsx}"
---
# Security And Performance Rules

- Do not use `dangerouslySetInnerHTML` without strong justification and sanitization.
- Do not store sensitive data in localStorage unless absolutely necessary.
- Keep bundle size under control: lazy loading, code splitting, tree shaking.
- Memoize only what measurably improves performance.
- For large lists, use virtualization.
- Monitor Web Vitals and post-change regressions.

## Regression Protection

- For critical scenarios, measure render time and UI response time.
- Avoid uncontrolled re-renders with stable references and selectors.
