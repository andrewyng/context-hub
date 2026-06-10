---
name: sec-filings
description: "Retrieve SEC EDGAR filings, 10-K, 10-Q reports, and search public company disclosures"
metadata:
  languages: "python"
  versions: "0.0.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "edgar,10k,10q,annual-report,public-company,regulatory"
---

# SEC Filings API Coding Guidelines (Python)

You are a SEC Filings API coding expert. Help me write Python code using the Anysite REST API for SEC data extraction.

API documentation: https://api.anysite.io/docs

## Golden Rule: All Endpoints Use POST with JSON Body

- **Base URL:** `https://api.anysite.io`
- **Method:** All endpoints use `POST`
- **Auth:** Pass your API key in the `access-token` header
- **Content-Type:** `application/json`

## Authentication

```python
import requests

BASE_URL = "https://api.anysite.io"
API_KEY = "your-api-key"  # Use env vars in production

HEADERS = {
    "access-token": API_KEY,
    "Content-Type": "application/json"
}


def anysite_post(endpoint: str, payload: dict) -> dict:
    """Make a POST request to the Anysite API."""
    response = requests.post(
        f"{BASE_URL}{endpoint}",
        headers=HEADERS,
        json=payload
    )
    response.raise_for_status()
    return response.json()
```

Store your API key in an environment variable:

```python
import os
API_KEY = os.environ["ANYSITE_API_KEY"]
```

## SEC Endpoints

### Get SEC Document

Retrieve the full content of a SEC filing document by its URL. Costs 1 credit.

**POST** `/api/sec/document`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `document_url` | string | Yes | Full URL to the SEC document (e.g. EDGAR filing URL) |

```python
result = anysite_post("/api/sec/document", {
    "document_url": "https://www.sec.gov/Archives/edgar/data/1234567/000123456789012345/filing.htm"
})

doc = result[0]
print(doc["content"])
print(doc["filing_type"])
print(doc["company_name"])
```

**Key response fields (`SECDocumentResponse`):**

| Field | Type | Description |
|---|---|---|
| `content` | string | Full document text content |
| `filing_type` | string | Filing form type (e.g. "10-K", "10-Q") |
| `company_name` | string | Company name from filing |
| `filing_date` | string | Date of the filing |
| `document_url` | string | Source URL |

### Search SEC Companies

Search SEC registered companies by entity name, form types, location, and date range. Costs 1 credit per batch.

**POST** `/api/sec/search/companies`

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `count` | integer | Yes | - | Number of results to return |
| `entity_name` | string | No | `""` | Company or entity name to search |
| `forms` | array of string | No | null | Filter by form types (e.g. `["10-K", "10-Q", "8-K"]`) |
| `location_codes` | array of string | No | null | Filter by state/location codes (e.g. `["CA", "NY"]`) |
| `date_from` | string | No | null | Start date filter (YYYY-MM-DD) |
| `date_to` | string | No | null | End date filter (YYYY-MM-DD) |

```python
results = anysite_post("/api/sec/search/companies", {
    "entity_name": "Tesla",
    "forms": ["10-K"],
    "count": 10
})

for filing in results:
    print(filing["display_names"])
    print(filing["filing_type"])
    print(filing["file_date"])
    print(filing["document_url"])
    print("---")
```

**Key response fields (`SECFiling`):**

| Field | Type | Description |
|---|---|---|
| `accession_number` | string | SEC accession number |
| `file_name` | string | Filing document file name |
| `document_url` | string | URL to the filing document |
| `filing_type` | string | Filing form type (e.g. `"10-K"`, `"4"`) |
| `file_date` | string | Date the filing was made (YYYY-MM-DD) |
| `period_ending` | string | Period ending date (YYYY-MM-DD) |
| `ciks` | array | List of CIK identifiers (strings) |
| `display_names` | array | List of entity display names with CIK |
| `file_description` | string | Filing description |

## Error Handling

```python
import requests


def anysite_post_safe(endpoint: str, payload: dict) -> dict | None:
    try:
        response = requests.post(
            f"{BASE_URL}{endpoint}",
            headers=HEADERS,
            json=payload,
            timeout=60
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        status = e.response.status_code
        if status == 401:
            print("Invalid or missing access-token")
        elif status == 422:
            print("Validation error:", e.response.json())
        elif status == 429:
            print("Rate limit exceeded - wait and retry")
        elif status >= 500:
            print("Server error - retry later")
        else:
            print(f"HTTP {status}:", e.response.text)
        return None
    except requests.exceptions.Timeout:
        print("Request timed out")
        return None
```

### Common Error Codes

| Status Code | Meaning | Action |
|---|---|---|
| 401 | Invalid or missing `access-token` header | Check your API key |
| 422 | Validation error (bad parameters) | Check parameter names and types |
| 429 | Rate limit exceeded | Back off and retry |
| 500 | Server error | Retry after a delay |

## Optional Request Header

All endpoints accept an optional `x-request-id` header (UUID format) for request tracing and deduplication.
