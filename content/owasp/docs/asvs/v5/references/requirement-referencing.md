# ASVS requirement referencing

Detailed guide to referencing ASVS requirements correctly, cross-walking between versions, and integrating with security tools.

## Referencing format

### Full version-pinned reference (recommended)

```
v<version>-<chapter>.<section>.<requirement>
```

- The `v` is always **lowercase**
- `version` is the ASVS release tag (e.g., `5.0.0`, `4.0.3`)
- `chapter`, `section`, and `requirement` are numeric

**Examples:**
- `v5.0.0-1.2.5` — OS command injection protection
- `v5.0.0-3.1.1` — Authentication requirement
- `v4.0.3-2.1.1` — Password length requirement from v4

### Short reference (when version is contextually obvious)

```
<chapter>.<section>.<requirement>
```

Example: `1.2.5`

**Warning:** Without version context, this is assumed to be the latest version. Since requirement IDs change between versions, this can be ambiguous. Always prefer the full format.

## Version changes: v4.x → v5.0.0

ASVS v5.0.0 **restructured chapters significantly**. Chapter numbers and requirement IDs from v4.x do NOT map 1:1 to v5.0.0.

### Chapter mapping (v4 → v5)

| v4 Chapter | v4 Topic | v5 Equivalent |
|------------|----------|---------------|
| V1 | Architecture, Design and Threat Modeling | Restructured across multiple chapters |
| V2 | Authentication | Chapter 3 |
| V3 | Session Management | Chapter 4 |
| V4 | Access Control | Chapter 5 |
| V5 | Validation, Sanitization and Encoding | Chapter 1 (Encoding & Sanitization) + Chapter 2 (Validation & Business Logic) |
| V6 | Stored Cryptography | Chapter 6 |
| V7 | Error Handling and Logging | Chapter 7 |
| V8 | Data Protection | Chapter 8 |
| V9 | Communication | Chapter 9 |
| V10 | Malicious Code | Removed / redistributed |
| V11 | Business Logic | Chapter 2 (Validation and Business Logic) |
| V12 | Files and Resources | Chapter 13 |
| V13 | API and Web Services | Chapter 12 |
| V14 | Configuration | Chapter 10 |

### Migrating references

If you have existing v4.x references:

1. Download both the v4.0.3 and v5.0.0 CSV files
2. Match requirements by their text content, not by ID
3. Update all references to the new `v5.0.0-X.Y.Z` format
4. Audit any requirements that were removed or merged

## Using ASVS in reports

### Security assessment report format

```markdown
## Finding: SQL Injection in User Search

**ASVS Reference:** v5.0.0-1.2.1
**Severity:** High
**CWE:** CWE-89

**Requirement:** Verify that all SQL queries, HQL, OSQL, NOSQL and stored
procedures use parameterized queries or are otherwise protected from injection.

**Status:** FAIL — The /api/users/search endpoint concatenates user input
directly into SQL queries.
```

### Compliance matrix format

```markdown
| ASVS Ref | Requirement Summary | Status | Evidence |
|----------|-------------------|--------|----------|
| v5.0.0-1.2.1 | Parameterized SQL queries | PASS | Code review confirmed |
| v5.0.0-1.2.5 | OS command injection protection | FAIL | See finding #3 |
| v5.0.0-3.1.1 | Authentication mechanism | PASS | OIDC integration verified |
```

## Integration with security tools

### Mapping scanner findings to ASVS

Most security scanners report CWE IDs. ASVS requirements include CWE mappings in the CSV:

```python
import csv

# Build a CWE → ASVS mapping
cwe_to_asvs = {}
with open("OWASP_ASVS_5.0.0_en.csv") as f:
    for row in csv.DictReader(f):
        for cwe in row.get("cwe", "").split(","):
            cwe = cwe.strip()
            if cwe:
                cwe_to_asvs.setdefault(cwe, []).append(row["req_id"])

# Map a scanner finding
scanner_cwe = "CWE-79"  # XSS
asvs_reqs = cwe_to_asvs.get(scanner_cwe, [])
print(f"CWE-79 maps to ASVS: {asvs_reqs}")
```

### Building automated checklists

```python
import csv

def get_requirements_for_level(csv_path, level="L2"):
    """Get all ASVS requirements for a given verification level."""
    reqs = []
    with open(csv_path) as f:
        for row in csv.DictReader(f):
            if row.get(level, "").strip():
                reqs.append({
                    "id": f"v5.0.0-{row['req_id']}",
                    "description": row["req_description"],
                    "chapter": row.get("chapter", ""),
                    "cwe": row.get("cwe", ""),
                })
    return reqs
```

## CWE crosswalk

ASVS requirements map to CWE (Common Weakness Enumeration) IDs. This creates a chain:

```
ASVS Requirement → CWE ID → CVE records (via NVD)
```

This allows you to:
1. Start with an ASVS requirement (what to verify)
2. Find the corresponding CWE (the weakness class)
3. Search NVD for CVEs with that CWE (real-world examples)

```bash
# Find CVEs for CWE-79 (XSS) — which maps to ASVS Chapter 1
curl -s "https://services.nvd.nist.gov/rest/json/cves/2.0?cweId=CWE-79&resultsPerPage=5" \
  -H "apiKey:YOUR_KEY" | jq '.vulnerabilities[].cve.id'
```

## Official sources

- ASVS v5.0.0: https://github.com/OWASP/ASVS/tree/v5.0.0
- ASVS v4.0.3 (for migration reference): https://github.com/OWASP/ASVS/tree/v4.0.3
- ASVS project page: https://owasp.org/www-project-application-security-verification-standard/
