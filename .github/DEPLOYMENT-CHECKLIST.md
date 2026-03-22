# Deployment Checklist

## Build And Test Gates

- [x] Run `npm run type-check`
- [x] Run `npm run test`
- [x] Run `npm run build`
- [x] Run `npm run analyze-bundle`

## Production Validation

- [ ] Start local preview: `npm run preview`
- [ ] Verify login, checkout, profile flows on preview build
- [ ] Verify error states (401, 404, 503, timeout) on preview build

## Observability And Reliability

- [ ] Verify `X-Correlation-Id` is present on requests
- [ ] Verify error UI shows correlation ID when backend returns ProblemDetails
- [ ] Verify retry behavior for 503 and timeout scenarios

## Lighthouse

- [x] Run Lighthouse for desktop
- [x] Run Lighthouse for mobile
- [x] Achieve score >= 80 for Performance, Accessibility, Best Practices (`npm run check:lighthouse`)

## Release Readiness

- [ ] Environment variables set in target environment
- [ ] Rollback plan prepared (previous frontend artifact available)
- [ ] Release notes include user-facing and technical changes
