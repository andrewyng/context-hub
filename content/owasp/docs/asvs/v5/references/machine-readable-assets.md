# ASVS machine-readable assets

Guide to downloading, parsing, and building tooling around the ASVS CSV, JSON, and other machine-readable formats.

## Available formats

### ASVS v5.0.0

| Format | URL |
|--------|-----|
| CSV (English) | https://github.com/OWASP/ASVS/raw/v5.0.0/5.0/docs_en/OWASP_Application_Security_Verification_Standard_5.0.0_en.csv |
| PDF (English) | https://github.com/OWASP/ASVS/raw/v5.0.0/5.0/OWASP_Application_Security_Verification_Standard_5.0.0_en.pdf |
| Word (English) | https://github.com/OWASP/ASVS/raw/v5.0.0/5.0/docs_en/OWASP_Application_Security_Verification_Standard_5.0.0_en.docx |
| GitHub source | https://github.com/OWASP/ASVS/tree/v5.0.0/5.0 |

Translations available: Turkish, Russian, French, Korean, and more at https://github.com/OWASP/ASVS/tree/v5.0.0/5.0

### Previous version (v4.0.3)

| Format | URL |
|--------|-----|
| GitHub source | https://github.com/OWASP/ASVS/tree/v4.0.3/4.0 |

## CSV structure

The CSV file contains one row per requirement with these key columns:

| Column | Description |
|--------|-------------|
| `chapter_id` | Chapter number |
| `chapter_name` | Chapter title |
| `section_id` | Section number within chapter |
| `section_name` | Section title |
| `req_id` | Full requirement ID (e.g., `1.2.5`) |
| `req_description` | Requirement text |
| `level1` | Applicable to L1 (checkbox) |
| `level2` | Applicable to L2 |
| `level3` | Applicable to L3 |
| `cwe` | CWE ID(s) mapped to this requirement |
| `nist` | NIST mapping (where applicable) |

## Parsing the CSV

### Python: Load all requirements

```python
import csv
from dataclasses import dataclass

@dataclass
class ASVSRequirement:
    chapter: str
    section: str
    req_id: str
    description: str
    level1: bool
    level2: bool
    level3: bool
    cwe: list

def load_asvs(csv_path):
    requirements = []
    with open(csv_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            req = ASVSRequirement(
                chapter=row.get("chapter_name", ""),
                section=row.get("section_name", ""),
                req_id=row.get("req_id", ""),
                description=row.get("req_description", ""),
                level1=bool(row.get("level1", "").strip()),
                level2=bool(row.get("level2", "").strip()),
                level3=bool(row.get("level3", "").strip()),
                cwe=[c.strip() for c in row.get("cwe", "").split(",") if c.strip()],
            )
            requirements.append(req)
    return requirements

reqs = load_asvs("OWASP_ASVS_5.0.0_en.csv")
print(f"Loaded {len(reqs)} requirements")
```

### Python: Filter by verification level

```python
# Get all L2 requirements
l2_reqs = [r for r in reqs if r.level2]
print(f"L2 requirements: {len(l2_reqs)}")

# Get L1 requirements for specific chapter
auth_l1 = [r for r in reqs if r.level1 and r.chapter == "Authentication"]
for r in auth_l1:
    print(f"  v5.0.0-{r.req_id}: {r.description[:80]}")
```

### Python: Build CWE → ASVS index

```python
from collections import defaultdict

cwe_index = defaultdict(list)
for req in reqs:
    for cwe in req.cwe:
        cwe_index[cwe].append(f"v5.0.0-{req.req_id}")

# Look up which ASVS requirements cover CWE-89 (SQL Injection)
print(f"CWE-89: {cwe_index.get('CWE-89', [])}")
```

### JavaScript/Node.js: Parse CSV

```javascript
const fs = require('fs');
const { parse } = require('csv-parse/sync');

const csv = fs.readFileSync('OWASP_ASVS_5.0.0_en.csv', 'utf8');
const records = parse(csv, { columns: true, skip_empty_lines: true });

// Filter L2 requirements
const l2 = records.filter(r => r.level2?.trim());
console.log(`L2 requirements: ${l2.length}`);

// Build CWE index
const cweIndex = {};
for (const r of records) {
  for (const cwe of (r.cwe || '').split(',').map(c => c.trim()).filter(Boolean)) {
    (cweIndex[cwe] ||= []).push(`v5.0.0-${r.req_id}`);
  }
}
```

## Building ASVS-based tools

### Compliance checker template

```python
def check_compliance(findings, asvs_reqs):
    """
    Match security findings (with CWE IDs) against ASVS requirements.
    Returns a compliance report.
    """
    # Build CWE → requirements mapping
    cwe_map = defaultdict(list)
    for req in asvs_reqs:
        for cwe in req.cwe:
            cwe_map[cwe].append(req)

    report = []
    for finding in findings:
        cwe = finding.get("cwe")
        matched_reqs = cwe_map.get(cwe, [])
        for req in matched_reqs:
            report.append({
                "finding": finding["title"],
                "asvs_ref": f"v5.0.0-{req.req_id}",
                "asvs_text": req.description,
                "cwe": cwe,
                "status": "FAIL",
            })
    return report
```

### Generating a gap analysis

```python
def gap_analysis(verified_reqs, target_level="L2"):
    """
    Compare verified requirements against target level.
    Returns missing (unverified) requirements.
    """
    all_reqs = load_asvs("OWASP_ASVS_5.0.0_en.csv")

    target_reqs = set()
    for req in all_reqs:
        if target_level == "L1" and req.level1:
            target_reqs.add(req.req_id)
        elif target_level == "L2" and req.level2:
            target_reqs.add(req.req_id)
        elif target_level == "L3" and req.level3:
            target_reqs.add(req.req_id)

    verified = set(verified_reqs)
    gaps = target_reqs - verified
    return sorted(gaps)
```

## Downloading programmatically

```bash
# Download CSV
curl -sL "https://github.com/OWASP/ASVS/raw/v5.0.0/5.0/docs_en/OWASP_Application_Security_Verification_Standard_5.0.0_en.csv" \
  -o OWASP_ASVS_5.0.0_en.csv

# Download PDF
curl -sL "https://github.com/OWASP/ASVS/raw/v5.0.0/5.0/OWASP_Application_Security_Verification_Standard_5.0.0_en.pdf" \
  -o OWASP_ASVS_5.0.0_en.pdf
```

## Official sources

- ASVS v5.0.0 downloads: https://github.com/OWASP/ASVS/tree/v5.0.0/5.0
- ASVS project page: https://owasp.org/www-project-application-security-verification-standard/
