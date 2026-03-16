---
name: webparser
description: "Scrape web pages, extract content and contacts, parse sitemaps, and search via DuckDuckGo"
metadata:
  languages: "python"
  versions: "0.0.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "scraping,html,crawling,duckduckgo,sitemap,extract"
---

# Web Parser API Coding Guidelines (Python)

You are a Web Parser API coding expert. Help me write Python code using the Anysite REST API for web parsing, sitemap extraction, and DuckDuckGo search.

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

## Web Parser Endpoints

### Parse Webpage

Extract content from a webpage with flexible filtering options. Costs 1 credit.

**POST** `/api/webparser/parse`

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `url` | string | Yes | - | Full URL of the page to parse |
| `only_main_content` | boolean | No | false | Extract only the main content area |
| `strip_all_tags` | boolean | No | false | Remove all HTML tags from output |
| `return_full_html` | boolean | No | false | Return the full raw HTML |
| `extract_contacts` | boolean | No | false | Extract emails and phone numbers |
| `social_links_only` | boolean | No | false | Extract only social media links |
| `same_origin_links` | boolean | No | false | Extract only links to the same domain |
| `remove_comments` | boolean | No | true | Remove HTML comments |
| `remove_base64_images` | boolean | No | true | Remove base64-encoded images |
| `min_text_block` | integer | No | 200 | Minimum text block size |
| `extract_minimal` | boolean | No | false | Extract minimal content |

```python
result = anysite_post("/api/webparser/parse", {
    "url": "https://example.com/article",
    "only_main_content": True,
    "strip_all_tags": True
})

page = result[0]
print(page["title"])
print(page["cleaned_html"])
print(page["url"])
```

**Key response fields (`WebParserResult`):**

| Field | Type | Description |
|---|---|---|
| `title` | string | Page title |
| `cleaned_html` | string | Extracted/cleaned HTML content |
| `url` | string | Final URL (after redirects) |
| `meta_description` | string | Page meta description (may be null) |
| `metadata` | object | Additional page metadata |
| `links` | array | Extracted links from the page (may be null) |
| `emails` | array | Extracted email addresses (if `extract_contacts` is true, may be null) |
| `phones` | array | Extracted phone numbers (if `extract_contacts` is true, may be null) |

Extract contacts and social links:

```python
result = anysite_post("/api/webparser/parse", {
    "url": "https://example.com/contact",
    "extract_contacts": True,
    "social_links_only": True
})

page = result[0]
print(page.get("emails"))   # extracted email addresses
print(page.get("phones"))   # extracted phone numbers
print(page.get("links"))    # social media links
```

### Get Sitemap

Retrieve and parse a website's sitemap. Costs 1 credit.

**POST** `/api/webparser/sitemap`

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `url` | string | Yes | - | Website URL (sitemap is auto-discovered) |
| `count` | integer | No | null | Maximum number of URLs to return |
| `same_host_only` | boolean | No | true | Only return URLs from the same host |
| `respect_robots` | boolean | No | true | Respect robots.txt directives |
| `return_details` | boolean | No | false | Return full sitemap entry details |
| `include_patterns` | array | No | null | URL patterns to include |
| `exclude_patterns` | array | No | null | URL patterns to exclude |

```python
result = anysite_post("/api/webparser/sitemap", {
    "url": "https://example.com",
    "count": 100
})

sitemap = result[0]
print("Total found:", sitemap["total_found"])
for url in sitemap["urls"]:
    print(url)
for loc in sitemap["sitemap_locations"]:
    print("Sitemap:", loc)
```

**Key response fields (`SitemapResult`):**

| Field | Type | Description |
|---|---|---|
| `urls` | array | List of discovered page URLs |
| `entries` | array | Detailed sitemap entries (when `return_details` is true) |
| `total_found` | integer | Total number of URLs found |
| `sitemap_locations` | array | Discovered sitemap XML URLs |

## Search Endpoint

### DuckDuckGo Search

Search the web using DuckDuckGo. Results are ordered by relevance (first result is the most relevant). Costs 1 credit.

**POST** `/api/duckduckgo/search`

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `query` | string | Yes | - | Search query |
| `count` | integer | No | 10 | Number of results to return |

```python
results = anysite_post("/api/duckduckgo/search", {
    "query": "python requests library tutorial",
    "count": 10
})

for item in results:
    print(item["title"])
    print(item["url"])
    print(item["description"])
    print("---")
```

**Key response fields (`DuckDuckGoSearchResult`):**

| Field | Type | Description |
|---|---|---|
| `title` | string | Page title |
| `url` | string | Result URL |
| `description` | string | Snippet/description text |

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
