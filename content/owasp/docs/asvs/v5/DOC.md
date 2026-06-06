---
name: asvs
description: "OWASP Application Security Verification Standard (ASVS) v5.0.0 — requirement structure, referencing, mapping findings, and machine-readable assets."
metadata:
  languages: "http"
  versions: "5.0.0"
  revision: 1
  updated-on: "2026-03-22"
  source: community
  tags: "owasp,asvs,security,verification,requirements,appsec"
---

# OWASP ASVS v5 for agents

The OWASP Application Security Verification Standard (ASVS) provides a list of security requirements for web application design, development, and testing. It normalizes the range and rigor of application security verification into a commercially-workable open standard.

## What ASVS is for

- **As a metric** — Assess the degree of trust that can be placed in a web application's security
- **As guidance** — Tell developers what security controls to build
- **During procurement** — Specify application security verification requirements in contracts
- **During testing** — Map security findings to structured requirement IDs

ASVS is **not** a penetration testing methodology. It is a requirements checklist that tells you _what_ to verify, not _how_ to test it.

## Requirement structure

ASVS v5.0.0 organizes requirements into chapters, sections, and individual requirements:

```
<chapter>.<section>.<requirement>
```

| Level | Example | Meaning |
|-------|---------|---------|
| Chapter | `1` | Encoding and Sanitization |
| Section | `1.2` | Injection Prevention |
| Requirement | `1.2.5` | Specific requirement within that section |

### ASVS v5.0.0 chapters

| # | Chapter |
|---|---------|
| 1 | Encoding and Sanitization |
| 2 | Validation and Business Logic |
| 3 | Authentication |
| 4 | Session Management |
| 5 | Access Control |
| 6 | Cryptography |
| 7 | Error Handling and Logging |
| 8 | Data Protection |
| 9 | Communication |
| 10 | Configuration |
| 11 | BOM (Bill of Materials) |
| 12 | API and Web Services |
| 13 | Files and Resources |
| 14 | Self-contained Tokens |

## How to reference requirements

### Preferred format (version-pinned)

```
v<version>-<chapter>.<section>.<requirement>
```

Examples:
- `v5.0.0-1.2.5` — Requirement 1.2.5 from ASVS version 5.0.0
- `v5.0.0-3.1.1` — Requirement 3.1.1 (Authentication chapter)

**Rules:**
- The `v` prefix is always lowercase
- Always include the version to avoid ambiguity as the standard evolves
- Without a version prefix, the identifier is assumed to refer to the latest version

### Example requirement

`v5.0.0-1.2.5`:
> Verify that the application protects against OS command injection and that operating system calls use parameterized OS queries or use contextual command line output encoding.

## How to map findings to ASVS

When you have a security finding (from a scan, pen test, or code review), map it to ASVS like this:

1. **Identify the vulnerability class** — e.g., SQL injection, XSS, weak password policy
2. **Find the relevant ASVS chapter** — e.g., injection → Chapter 1 (Encoding and Sanitization)
3. **Find the specific section** — e.g., SQL injection → Section 1.2 (Injection Prevention)
4. **Match the specific requirement** — read the requirement text to confirm it covers your finding
5. **Reference it** — use `v5.0.0-<chapter>.<section>.<requirement>`

### Common vulnerability → ASVS mapping

| Vulnerability | ASVS Area |
|--------------|-----------|
| SQL Injection | Chapter 1 — Encoding and Sanitization |
| XSS (Cross-Site Scripting) | Chapter 1 — Encoding and Sanitization |
| Broken Authentication | Chapter 3 — Authentication |
| Session Fixation | Chapter 4 — Session Management |
| IDOR / Broken Access Control | Chapter 5 — Access Control |
| Sensitive Data Exposure | Chapter 8 — Data Protection |
| TLS/SSL Issues | Chapter 9 — Communication |
| Security Misconfiguration | Chapter 10 — Configuration |
| Insecure Deserialization | Chapter 1 — Encoding and Sanitization |
| Insufficient Logging | Chapter 7 — Error Handling and Logging |

## How to use machine-readable assets

ASVS v5.0.0 is available in machine-readable formats for programmatic use:

| Format | URL |
|--------|-----|
| **CSV** | https://github.com/OWASP/ASVS/raw/v5.0.0/5.0/docs_en/OWASP_Application_Security_Verification_Standard_5.0.0_en.csv |
| **PDF** | https://github.com/OWASP/ASVS/raw/v5.0.0/5.0/OWASP_Application_Security_Verification_Standard_5.0.0_en.pdf |
| **Word** | https://github.com/OWASP/ASVS/raw/v5.0.0/5.0/docs_en/OWASP_Application_Security_Verification_Standard_5.0.0_en.docx |
| **GitHub (source)** | https://github.com/OWASP/ASVS/tree/v5.0.0/5.0 |

### Using the CSV

The CSV is ideal for building tooling around ASVS. It contains columns for:
- Requirement ID (chapter.section.requirement)
- Requirement text
- Level (L1, L2, L3)
- CWE mapping

```python
import csv

with open("OWASP_ASVS_5.0.0_en.csv") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(f"{row['req_id']}: {row['req_description']}")
```

## Verification levels

ASVS defines three verification levels:

| Level | Use case | Rigor |
|-------|----------|-------|
| **L1** | All applications | Low-hanging fruit, automatable checks |
| **L2** | Applications handling sensitive data | Most applications should target this |
| **L3** | Critical applications (medical, military, financial) | Full verification, defense in depth |

Each requirement specifies which levels it applies to. L1 is a subset of L2, which is a subset of L3.

## Common pitfalls

1. **Using requirements without version prefix.** Always use `v5.0.0-X.Y.Z` format — requirement IDs can change between versions.
2. **Treating ASVS as a pentest checklist.** ASVS defines _what_ to verify, not _how_ to test. Use OWASP Testing Guide for test procedures.
3. **Targeting L3 for all apps.** Not every application needs L3. Determine the appropriate level based on risk and data sensitivity.
4. **Ignoring the CWE mappings.** ASVS requirements map to CWE IDs, which in turn map to CVEs. Use these mappings to connect ASVS to vulnerability databases.
5. **Not updating when the standard changes.** ASVS v5.0.0 restructured chapters significantly from v4.x. Re-map your requirements when upgrading.

## Related OWASP resources

- OWASP Top Ten: https://owasp.org/Top10/
- OWASP Testing Guide: https://owasp.org/www-project-web-security-testing-guide/
- OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
- OWASP SAMM: https://owaspsamm.org/

## Official sources

- ASVS project page: https://owasp.org/www-project-application-security-verification-standard/
- ASVS v5.0.0 on GitHub: https://github.com/OWASP/ASVS/tree/v5.0.0
- Machine-readable downloads: https://github.com/OWASP/ASVS/tree/v5.0.0/5.0

## Reference files

- `references/requirement-referencing.md` — Full referencing format, cross-walk between v4.x and v5.0.0, integration with tools
- `references/machine-readable-assets.md` — CSV/JSON sources, parsing examples, and building ASVS-based tooling
