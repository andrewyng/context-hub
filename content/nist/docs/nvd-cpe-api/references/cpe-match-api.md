# CPE Match API deep dive

Detailed reference for CPE match criteria resolution, version range handling, and correlating products with vulnerabilities.

## What is a match criteria?

A match criteria is a CPE pattern stored in the NVD that maps to one or more specific CPE Names. CVE configurations reference match criteria (by UUID) to define which products/versions are affected.

The flow:
1. A CVE's `configurations` field contains `cpeMatch` entries
2. Each `cpeMatch` has a `matchCriteriaId` (UUID) and a `criteria` (CPE pattern)
3. The Match Criteria API resolves that UUID to the full list of matching CPE Names

## Version range fields

Match strings can include version range bounds:

| Field | Meaning |
|-------|---------|
| `versionStartIncluding` | Affected from this version (inclusive) |
| `versionStartExcluding` | Affected from this version (exclusive) |
| `versionEndIncluding` | Affected through this version (inclusive) |
| `versionEndExcluding` | Affected up to but not including this version |

### Example: Apache HTTP Server 2.4.0 through 2.4.57

```json
{
  "criteria": "cpe:2.3:a:apache:http_server:*:*:*:*:*:*:*:*",
  "versionStartIncluding": "2.4.0",
  "versionEndExcluding": "2.4.58",
  "matchCriteriaId": "..."
}
```

This means: all Apache HTTP Server versions >= 2.4.0 and < 2.4.58 are affected.

### Checking if a specific version is affected

```python
from packaging.version import Version

def is_affected(product_version, match):
    v = Version(product_version)

    start_inc = match.get("versionStartIncluding")
    start_exc = match.get("versionStartExcluding")
    end_inc = match.get("versionEndIncluding")
    end_exc = match.get("versionEndExcluding")

    if start_inc and v < Version(start_inc):
        return False
    if start_exc and v <= Version(start_exc):
        return False
    if end_inc and v > Version(end_inc):
        return False
    if end_exc and v >= Version(end_exc):
        return False
    return True
```

## CVE configuration structure

CVE configurations use a node tree with AND/OR operators:

```json
{
  "configurations": [
    {
      "operator": "OR",
      "negate": false,
      "nodes": [
        {
          "operator": "OR",
          "negate": false,
          "cpeMatch": [
            {
              "vulnerable": true,
              "criteria": "cpe:2.3:a:vendor:product:*:...",
              "versionEndExcluding": "1.2.3",
              "matchCriteriaId": "UUID"
            }
          ]
        }
      ]
    }
  ]
}
```

- **OR nodes**: Any matching CPE means affected
- **AND nodes**: All children must match (common for "running on" relationships)
- `vulnerable: true` = this CPE is the vulnerable product
- `vulnerable: false` = this CPE is a platform requirement (e.g., "running on Windows")

### AND configuration example

"Product X running on Windows" is expressed as:

```json
{
  "operator": "AND",
  "nodes": [
    {
      "cpeMatch": [{ "vulnerable": true, "criteria": "cpe:2.3:a:vendor:product_x:..." }]
    },
    {
      "cpeMatch": [{ "vulnerable": false, "criteria": "cpe:2.3:o:microsoft:windows:..." }]
    }
  ]
}
```

## Workflow: Resolving affected products for a CVE

```python
import requests

HEADERS = {"apiKey": "YOUR_KEY"}

def get_affected_products(cve_id):
    """Get all affected CPE names for a CVE."""
    # Step 1: Get CVE configurations
    resp = requests.get(
        "https://services.nvd.nist.gov/rest/json/cves/2.0",
        params={"cveId": cve_id},
        headers=HEADERS
    )
    cve = resp.json()["vulnerabilities"][0]["cve"]
    configs = cve.get("configurations", [])

    affected = []
    for config in configs:
        for node in config.get("nodes", []):
            for match in node.get("cpeMatch", []):
                if match.get("vulnerable"):
                    affected.append({
                        "criteria": match["criteria"],
                        "matchCriteriaId": match["matchCriteriaId"],
                        "versionStartIncluding": match.get("versionStartIncluding"),
                        "versionEndExcluding": match.get("versionEndExcluding"),
                    })
    return affected
```

## Workflow: Looking up a match criteria by UUID

```bash
curl -s "https://services.nvd.nist.gov/rest/json/cpematch/2.0?\
matchCriteriaId=UUID_HERE" \
  -H "apiKey:YOUR_KEY" \
  | jq '.matchStrings[0].matchString | {criteria, versionStartIncluding, versionEndExcluding, matchCount: (.matches | length)}'
```

The response's `matches` array lists every specific CPE Name that satisfies the match criteria.

## Common patterns

### Build a local "product → CVEs" index

1. Fetch all CVEs (paginated)
2. For each CVE, extract `cpeMatch` entries where `vulnerable=true`
3. Index by the CPE vendor:product pair
4. When querying "what CVEs affect product X version Y?", filter by CPE name and version range

### Build a "CVE → affected products" report

1. Fetch a CVE by ID
2. Extract all `matchCriteriaId` values
3. For each, call the Match Criteria API
4. Collect the `matches[].cpeName` values

## Official sources

- CPE Match Criteria API: https://nvd.nist.gov/developers/products
- CPE specification (NISTIR 7695): https://csrc.nist.gov/publications/detail/nistir/7695/final
