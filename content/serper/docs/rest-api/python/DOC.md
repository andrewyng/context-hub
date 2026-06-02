---
name: rest-api
description: "Serper.dev Google Search API for AI Agents"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: community
  tags: "serper,google,search,serp,images,news,videos,scholar,scraping,api,integration"
---

# Serper.dev API

> **Golden Rule:** Serper.dev has no official Python SDK. Use `httpx` (async) or `requests` (sync) for direct REST API access. All endpoints are POST with JSON body. Authentication uses the `X-API-KEY` header (not Bearer). Free tier includes 2,500 credits.

## Installation

```bash
pip install httpx
```

## Base URL

`https://google.serper.dev`

Scraping endpoint uses: `https://scrape.serper.dev`

## Authentication

**Type:** API Key (custom header)

```python
import httpx

API_KEY = "your-serper-api-key"
BASE_URL = "https://google.serper.dev"

headers = {
    "X-API-KEY": API_KEY,
    "Content-Type": "application/json"
}
client = httpx.AsyncClient(headers=headers)
```

**Important:** Serper uses `X-API-KEY` header, NOT `Authorization: Bearer`.

## Rate Limiting

| Tier | Rate Limit |
|---|---|
| Free | 5 requests/second |
| Ultimate | 300 requests/second |

Free tier includes 2,500 credits (no credit card required). Credits expire after 6 months.

## Methods

### `search`

**Endpoint:** `POST /search`

Google web search returning structured JSON with organic results, knowledge graph, answer box, and more.

| Parameter | Type | Default |
|---|---|---|
| `q` | `str` | **required** |
| `gl` | `str` | `None` (country code, e.g., `us`) |
| `hl` | `str` | `None` (language code, e.g., `en`) |
| `num` | `int` | `10` (>10 costs 2 credits) |
| `page` | `int` | `1` |
| `location` | `str` | `None` |
| `tbs` | `str` | `None` (time filter: `qdr:h`, `qdr:d`, `qdr:w`, `qdr:m`, `qdr:y`) |

**Returns:** JSON with `organic`, `knowledgeGraph`, `answerBox`, `peopleAlsoAsk`, `relatedSearches`

```python
payload = {"q": "best AI frameworks 2025", "gl": "us", "num": 10}
response = await client.post(f"{BASE_URL}/search", json=payload)
response.raise_for_status()
data = response.json()
organic = data.get("organic", [])
for result in organic:
    print(f"{result['title']}: {result['link']}")
```

### `search_news`

**Endpoint:** `POST /news`

Google News search.

| Parameter | Type | Default |
|---|---|---|
| `q` | `str` | **required** |
| `gl` | `str` | `None` |
| `hl` | `str` | `None` |
| `num` | `int` | `10` |
| `tbs` | `str` | `None` (e.g., `qdr:d` for past 24h) |

**Returns:** JSON with `news` array (each: `title`, `link`, `snippet`, `date`, `source`, `imageUrl`)

```python
payload = {"q": "AI regulation", "gl": "us", "tbs": "qdr:d"}
response = await client.post(f"{BASE_URL}/news", json=payload)
response.raise_for_status()
data = response.json()
news = data.get("news", [])
```

### `search_images`

**Endpoint:** `POST /images`

Google Images search.

| Parameter | Type | Default |
|---|---|---|
| `q` | `str` | **required** |
| `gl` | `str` | `None` |
| `num` | `int` | `10` |

**Returns:** JSON with `images` array (each: `title`, `link`, `imageUrl`, `source`)

```python
payload = {"q": "machine learning diagram", "num": 5}
response = await client.post(f"{BASE_URL}/images", json=payload)
response.raise_for_status()
images = response.json().get("images", [])
```

### `search_scholar`

**Endpoint:** `POST /scholar`

Google Scholar academic search.

| Parameter | Type | Default |
|---|---|---|
| `q` | `str` | **required** |
| `as_ylo` | `int` | `None` (filter from this year onward) |
| `num` | `int` | `10` |

**Returns:** JSON with `organic` array of academic results

```python
payload = {"q": "transformer architecture attention", "as_ylo": 2023}
response = await client.post(f"{BASE_URL}/scholar", json=payload)
response.raise_for_status()
papers = response.json().get("organic", [])
```

### `search_places`

**Endpoint:** `POST /places`

Google Maps places search.

| Parameter | Type | Default |
|---|---|---|
| `q` | `str` | **required** |
| `location` | `str` | `None` |
| `gl` | `str` | `None` |

**Returns:** JSON with `places` array (each: `title`, `address`, `rating`, `ratingCount`, `link`)

```python
payload = {"q": "coffee shops", "location": "San Francisco, CA"}
response = await client.post(f"{BASE_URL}/places", json=payload)
response.raise_for_status()
places = response.json().get("places", [])
```

### `scrape_webpage`

**Endpoint:** `POST https://scrape.serper.dev/`

Scrape and extract clean content from a webpage.

| Parameter | Type | Default |
|---|---|---|
| `url` | `str` | **required** |
| `include_markdown` | `bool` | `True` |

**Returns:** Cleaned webpage content (Markdown by default)

```python
SCRAPE_URL = "https://scrape.serper.dev"
payload = {"url": "https://example.com/article", "include_markdown": True}
response = await client.post(SCRAPE_URL, json=payload)
response.raise_for_status()
data = response.json()
```

### Other Endpoints

| Endpoint | Description |
|---|---|
| `POST /videos` | Google Videos search |
| `POST /shopping` | Google Shopping (costs 2 credits) |
| `POST /maps` | Google Maps search |
| `POST /reviews` | Google reviews (use `placeId` param for precision) |
| `POST /patents` | Google Patents search |
| `POST /autocomplete` | Google autocomplete suggestions |
| `POST /lens` | Google Lens visual search |

## Error Handling

```python
import httpx

try:
    response = await client.post(f"{BASE_URL}/search", json={"q": "test"})
    response.raise_for_status()
    data = response.json()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        print("Authentication failed -- check your X-API-KEY")
    elif e.response.status_code == 429:
        print("Rate limited -- reduce request frequency")
    elif e.response.status_code == 400:
        print(f"Bad request: {e.response.text}")
    else:
        print(f"Serper API error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- All endpoints use **POST** (not GET) with JSON body
- Auth header is `X-API-KEY` (not `Authorization: Bearer`)
- Requesting `num` > 10 results costs 2 credits instead of 1
- Shopping searches always cost 2 credits
- Autocorrect is on by default -- set `"autocorrect": false` to disable
- Credits expire after 6 months
- Time filter `tbs` values: `qdr:h` (hour), `qdr:d` (day), `qdr:w` (week), `qdr:m` (month), `qdr:y` (year)
- Scraping uses a different base URL: `https://scrape.serper.dev`
- Set a reasonable timeout: `httpx.AsyncClient(timeout=10.0)` -- typical latency is 1-2s
