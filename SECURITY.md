# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by [opening a GitHub issue](https://github.com/andrewyng/context-hub/issues/new) with the label `security`.

Include:

1. A description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)

We will respond promptly and aim to provide a fix within 7 days for critical issues.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |

## Scope

This policy covers the `@aisuite/chub` CLI package and the Context Hub API at `api.aichub.org`.

## Telemetry & Privacy

Context Hub collects optional, anonymous telemetry (disabled with `telemetry: false` in `~/.chub/config.yaml`). No personally identifiable information is collected. The client identifier is a random 32-byte value generated on first run and stored in `~/.chub/client_id`; it is not derived from any hardware identifier and can be reset by deleting that file.
