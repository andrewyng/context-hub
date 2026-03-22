---
name: nvd-cpe-api
description: "NVD CPE and CPE Match APIs v2.0 — query the Official CPE Dictionary and match criteria for product identification and vulnerability correlation."
metadata:
  languages: "http"
  versions: "2.0"
  revision: 1
  updated-on: "2026-03-22"
  source: community
  tags: "nist,nvd,cpe,product,vulnerability,security,api"
---

# NVD CPE APIs v2.0

The NVD Product APIs let you query the Official CPE Dictionary (1.6M+ CPE Names, 420K+ match strings). There are two distinct APIs: the **CPE API** for looking up product entries and the **Match Criteria API** for resolving CPE match strings used in CVE configurations.

> "This product uses data from the NVD API but is not endorsed or certified by the NVD."

## CPE names vs CPE match strings

### CPE Name
A CPE (Common Platform Enumeration) Name uniquely identifies a specific product version. It uses the CPE 2.3 formatted string with 13 colon-separated components:

```
cpe:2.3:<part>:<vendor>:<product>:<version>:<update>:<edition>:<language>:<sw_edition>:<target_sw>:<target_hw>:<other>
```

Example:
```
cpe:2.3:a:apache:http_server:2.4.49:*:*:*:*:*:*:*
```

| Component | Values | Meaning |
|-----------|--------|---------|
| `part` | `a` = application, `o` = OS, `h` = hardware | Product type |
| `vendor` | e.g. `apache`, `microsoft` | Vendor name |
| `product` | e.g. `http_server`, `windows_10` | Product name |
| `version` | e.g. `2.4.49`, `*` | Specific version or wildcard |
| Others | `*` = any, `-` = not applicable | Remaining attributes |

### CPE Match String
A match string is a CPE pattern with optional version ranges. It is used in CVE configurations to define which products are affected. Unlike a CPE Name, a match string can use wildcards in the `part`, `vendor`, `product`, or `version` fields and can include `versionStartIncluding`, `versionEndExcluding`, etc.

## CPE API

Look up CPE Names in the Official CPE Dictionary.

### Base URL

```
https://services.nvd.nist.gov/rest/json/cpes/2.0
```

### Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `cpeNameId` | UUID of a specific CPE record | `?cpeNameId=87316812-...` |
| `cpeMatchString` | CPE 2.3 pattern to match against | `?cpeMatchString=cpe:2.3:a:apache:*:*:*:*:*:*:*:*:*` |
| `keywordSearch` | Text search in CPE titles | `?keywordSearch=apache http` |
| `keywordExactMatch` | Require exact phrase | `?keywordExactMatch&keywordSearch=Apache HTTP Server` |
| `matchCriteriaId` | UUID of a match criteria | `?matchCriteriaId=...` |
| `lastModStartDate` / `lastModEndDate` | Modified date range (ISO-8601) | `?lastModStartDate=2024-01-01T00:00:00.000` |
| `startIndex` | Pagination offset (0-based) | `?startIndex=0` |
| `resultsPerPage` | Page size | `?resultsPerPage=100` |

### Example: Find CPEs for Apache HTTP Server
```bash
curl -s "https://services.nvd.nist.gov/rest/json/cpes/2.0?\
keywordSearch=apache+http+server&\
resultsPerPage=5" \
  -H "apiKey:YOUR_KEY" | jq '.products[].cpe.cpeName'
```

### Example: Look up by CPE match string
```bash
curl -s "https://services.nvd.nist.gov/rest/json/cpes/2.0?\
cpeMatchString=cpe:2.3:a:apache:http_server:*:*:*:*:*:*:*:*&\
resultsPerPage=5" \
  -H "apiKey:YOUR_KEY"
```

### Response structure

```json
{
  "resultsPerPage": 1,
  "startIndex": 0,
  "totalResults": 1,
  "products": [
    {
      "cpe": {
        "cpeName": "cpe:2.3:a:apache:http_server:2.4.49:*:*:*:*:*:*:*",
        "cpeNameId": "87316812-...",
        "deprecated": false,
        "lastModified": "2023-...",
        "created": "2021-...",
        "titles": [
          { "title": "Apache HTTP Server 2.4.49", "lang": "en" }
        ],
        "refs": [
          { "ref": "https://httpd.apache.org/", "type": "Vendor" }
        ]
      }
    }
  ]
}
```

## CPE Match API

Look up match criteria — the CPE patterns with version ranges used in CVE configurations.

### Base URL

```
https://services.nvd.nist.gov/rest/json/cpematch/2.0
```

### Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `cveId` | Match criteria associated with a CVE | `?cveId=CVE-2023-44487` |
| `matchCriteriaId` | UUID of a specific match criteria | `?matchCriteriaId=...` |
| `lastModStartDate` / `lastModEndDate` | Modified date range | Same format as CVE API |
| `startIndex` | Pagination offset | `?startIndex=0` |
| `resultsPerPage` | Page size | `?resultsPerPage=100` |

### Example: Match criteria for a CVE
```bash
curl -s "https://services.nvd.nist.gov/rest/json/cpematch/2.0?\
cveId=CVE-2023-44487&\
resultsPerPage=10" \
  -H "apiKey:YOUR_KEY" | jq '.matchStrings[].matchString'
```

### Response structure

```json
{
  "resultsPerPage": 1,
  "startIndex": 0,
  "totalResults": 1,
  "matchStrings": [
    {
      "matchString": {
        "matchCriteriaId": "...",
        "criteria": "cpe:2.3:a:apache:http_server:*:*:*:*:*:*:*:*",
        "versionStartIncluding": "2.4.0",
        "versionEndExcluding": "2.4.58",
        "lastModified": "2024-...",
        "cpeLastModified": "2024-...",
        "created": "2023-...",
        "status": "Active",
        "matches": [
          {
            "cpeName": "cpe:2.3:a:apache:http_server:2.4.49:*:*:*:*:*:*:*",
            "cpeNameId": "87316812-..."
          }
        ]
      }
    }
  ]
}
```

Key fields in match strings:
- `versionStartIncluding` / `versionStartExcluding` — lower bound of affected versions
- `versionEndIncluding` / `versionEndExcluding` — upper bound of affected versions
- `matches` — list of specific CPE Names that satisfy this match criteria

## Common search patterns

### "Is my product version affected by this CVE?"

1. Get the CVE: `GET /cves/2.0?cveId=CVE-YYYY-NNNN`
2. Extract `configurations[].nodes[].cpeMatch[].criteria` and version ranges
3. Compare your product's CPE name against the match criteria

### "What CPE Name represents my product?"

```bash
curl -s "https://services.nvd.nist.gov/rest/json/cpes/2.0?\
keywordSearch=nginx&resultsPerPage=10" \
  -H "apiKey:YOUR_KEY" | jq '.products[].cpe | {cpeName, title: .titles[0].title}'
```

### "What products are affected by this match criteria?"

```bash
curl -s "https://services.nvd.nist.gov/rest/json/cpematch/2.0?\
matchCriteriaId=UUID_HERE" \
  -H "apiKey:YOUR_KEY" | jq '.matchStrings[].matchString.matches[].cpeName'
```

## Common pitfalls

1. **CPE Name ≠ match string.** A CPE Name identifies a specific product/version. A match string is a pattern with optional version ranges. Don't confuse the two APIs.
2. **Wildcard encoding.** The `*` in CPE strings must be URL-encoded as `%2A` in query parameters, or use the exact CPE string as-is if your HTTP client handles encoding.
3. **Version ranges are in match strings, not CPE Names.** To determine affected version ranges, use the Match Criteria API or parse CVE configurations directly.
4. **Same rate limits.** Both CPE APIs share the same rate limits as the CVE API (5 req/30s public, 50 req/30s keyed).
5. **Deprecated CPEs.** Some CPE Names are deprecated (replaced by newer names). Check the `deprecated` field and follow `deprecatedBy` references.

## Official sources

- CPE and Match Criteria API docs: https://nvd.nist.gov/developers/products
- CPE specification: https://csrc.nist.gov/publications/detail/nistir/7695/final
- CPE dictionary statistics: https://nvd.nist.gov/products/cpe/statistics
- Getting started: https://nvd.nist.gov/developers/start-here

## Reference files

- `references/cpe-match-api.md` — Deep dive into match criteria, version range resolution, and CPE dictionary lookups
- `references/cpe-format-and-match-strings.md` — CPE 2.3 format breakdown, encoding rules, and common patterns
