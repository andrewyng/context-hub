# CPE 2.3 format and match strings

Detailed reference for CPE naming conventions, encoding rules, and common patterns.

## CPE 2.3 formatted string

A CPE Name has exactly 13 colon-separated components:

```
cpe:2.3:<part>:<vendor>:<product>:<version>:<update>:<edition>:<language>:<sw_edition>:<target_sw>:<target_hw>:<other>
```

### Component reference

| # | Component | Description | Common values |
|---|-----------|-------------|---------------|
| 1 | `cpe` | Fixed prefix | Always `cpe` |
| 2 | `2.3` | Format version | Always `2.3` |
| 3 | `part` | Product type | `a` = application, `o` = operating system, `h` = hardware |
| 4 | `vendor` | Vendor/publisher | e.g. `apache`, `microsoft`, `google` |
| 5 | `product` | Product name | e.g. `http_server`, `chrome`, `linux_kernel` |
| 6 | `version` | Version string | e.g. `2.4.49`, `10.0.19041` |
| 7 | `update` | Update/patch level | e.g. `sp1`, `*` |
| 8 | `edition` | Legacy edition | Usually `*` |
| 9 | `language` | Language tag | e.g. `en`, `*` |
| 10 | `sw_edition` | Software edition | e.g. `enterprise`, `*` |
| 11 | `target_sw` | Target software platform | e.g. `linux`, `*` |
| 12 | `target_hw` | Target hardware platform | e.g. `x64`, `*` |
| 13 | `other` | Other attributes | Usually `*` |

### Special values

| Value | Meaning |
|-------|---------|
| `*` | ANY — matches any value |
| `-` | NA — not applicable |

### Examples

```
# Apache HTTP Server 2.4.49 (application)
cpe:2.3:a:apache:http_server:2.4.49:*:*:*:*:*:*:*

# Microsoft Windows 10 (operating system)
cpe:2.3:o:microsoft:windows_10:1903:*:*:*:*:*:*:*

# Cisco Router model (hardware)
cpe:2.3:h:cisco:rv340:*:*:*:*:*:*:*:*

# Python 3.9.7 running on Linux
cpe:2.3:a:python:python:3.9.7:*:*:*:*:*:*:*

# Node.js 18.x
cpe:2.3:a:nodejs:node.js:18.0.0:*:*:*:*:*:*:*
```

## URL encoding

When using CPE strings in API query parameters:

| Character | Encoded | Notes |
|-----------|---------|-------|
| `*` | `%2A` | Wildcard — must encode in URLs |
| `:` | `%3A` | Colon — most HTTP clients handle automatically |
| Space | `%20` | Should not appear in CPE names |

### curl example with encoded wildcards
```bash
# Search all Apache HTTP Server versions
curl -s "https://services.nvd.nist.gov/rest/json/cpes/2.0?\
cpeMatchString=cpe:2.3:a:apache:http_server:%2A:%2A:%2A:%2A:%2A:%2A:%2A:%2A" \
  -H "apiKey:YOUR_KEY"
```

Most HTTP libraries handle encoding automatically:
```python
import requests
params = {
    "cpeMatchString": "cpe:2.3:a:apache:http_server:*:*:*:*:*:*:*:*"
}
resp = requests.get("https://services.nvd.nist.gov/rest/json/cpes/2.0", params=params)
```

## Building CPE names

### From package manager data

| Source | How to build CPE |
|--------|-----------------|
| `npm` package | `cpe:2.3:a:<npm_scope_or_author>:<package_name>:<version>:*:*:*:*:node.js:*:*` |
| Python pip | `cpe:2.3:a:<author>:<package_name>:<version>:*:*:*:*:python:*:*` |
| OS packages | Match vendor to distro, product to package name |

**Important:** NVD vendor/product names often don't match package manager names exactly. Always search the CPE dictionary first to find the correct vendor:product pair.

### Common vendor name mappings

| Package manager name | NVD vendor | NVD product |
|---------------------|------------|-------------|
| `express` (npm) | `openjsf` | `express` |
| `django` (pip) | `djangoproject` | `django` |
| `flask` (pip) | `palletsprojects` | `flask` |
| `nginx` | `f5` | `nginx` |
| `openssl` | `openssl` | `openssl` |
| `linux` | `linux` | `linux_kernel` |
| `node` | `nodejs` | `node.js` |

## Match string patterns

### Exact version
```
cpe:2.3:a:apache:http_server:2.4.49:*:*:*:*:*:*:*
```
Matches only version 2.4.49.

### All versions of a product
```
cpe:2.3:a:apache:http_server:*:*:*:*:*:*:*:*
```
Matches any version of Apache HTTP Server.

### Version range (via Match Criteria API)
The CPE string uses `*` for version, and version bounds are in separate fields:
```json
{
  "criteria": "cpe:2.3:a:apache:http_server:*:*:*:*:*:*:*:*",
  "versionStartIncluding": "2.4.0",
  "versionEndExcluding": "2.4.58"
}
```

### All products from a vendor
```
cpe:2.3:a:apache:*:*:*:*:*:*:*:*:*
```
Matches any Apache application product.

## Deprecated CPE names

CPE Names can be deprecated when NVD standardizes naming. The API response includes:

```json
{
  "cpeName": "cpe:2.3:a:old_vendor:old_name:...",
  "deprecated": true,
  "deprecatedBy": [
    { "cpeName": "cpe:2.3:a:new_vendor:new_name:...", "cpeNameId": "..." }
  ]
}
```

Always check `deprecated` and follow `deprecatedBy` to the current name.

## Official sources

- CPE specification (NISTIR 7695): https://csrc.nist.gov/publications/detail/nistir/7695/final
- CPE Dictionary: https://nvd.nist.gov/products/cpe
- NVD Product APIs: https://nvd.nist.gov/developers/products
