# Security Policy

## Supported versions

Native UI is pre-1.0 and not yet published. Security fixes apply to the latest development version until a supported release table is published.

## Reporting a vulnerability

Do not open a public issue. Use GitHub private vulnerability reporting for the repository. Include affected files/versions, reproduction steps, impact, and any suggested mitigation.

You should receive acknowledgement within seven days. We will coordinate validation, remediation, disclosure timing, and credit with the reporter.

## Security posture

- No browser runtime dependencies.
- No `eval`, dynamic code execution, or hidden remote loading.
- CSP-compatible runtime design.
- OIDC trusted publishing and npm provenance before public release.
- Dependency review, CodeQL, and automated update checks in CI.
