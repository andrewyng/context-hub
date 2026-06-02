---
name: rest-api
description: "Browserless - Headless Browser Automation REST API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: community
  tags: "browserless,headless,browser,scraping,screenshot,pdf,puppeteer,playwright,automation,api"
---

# Browserless API

> **Golden Rule:** Every REST API call is stateless -- each request launches a browser, performs one task, and closes the session. Cookies and state do NOT persist between calls. Send either `url` or `html` in the JSON body, never both. Always include your API token as a query parameter.

## Installation

```bash
pip install httpx
```

## Base URL

```
https://production-sfo.browserless.io
```

Your account may use a different region. Check your Browserless dashboard for the exact base URL.

## Authentication

All requests require an API token passed as a query parameter `?token=YOUR_API_TOKEN_HERE`. Obtain your token from the Browserless account dashboard at https://cloud.browserless.io.

```python
import httpx

BASE_URL = "https://production-sfo.browserless.io"
TOKEN = "YOUR_API_TOKEN_HERE"

def browserless_url(endpoint: str) -> str:
    """Build a full Browserless API URL with token."""
    return f"{BASE_URL}{endpoint}?token={TOKEN}"
```

## Rate Limiting

Rate limits depend on your plan tier. Limits are based on concurrent sessions (how many browsers can run simultaneously) and total units per month. Check your dashboard for current usage and limits. The API returns HTTP 429 when limits are exceeded.

## Methods

### POST /content

Fetch fully rendered HTML from a page, including JavaScript-rendered content.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | yes* | URL to fetch |
| `html` | string | yes* | Raw HTML to render (instead of url) |
| `gotoOptions` | object | no | Navigation options (`waitUntil`, `timeout`) |
| `waitForSelector` | object | no | Wait for CSS selector (`selector`, `visible`, `hidden`, `timeout`) |
| `waitForTimeout` | number | no | Wait N milliseconds before returning |
| `bestAttempt` | boolean | no | Continue even if async operations fail |
| `rejectResourceTypes` | array | no | Block resource types (e.g. `["image", "stylesheet"]`) |

*Provide either `url` or `html`, not both.

**Response:** `text/html` -- the fully rendered HTML string.

```python
import httpx

resp = httpx.post(
    browserless_url("/content"),
    json={
        "url": "https://example.com/",
        "gotoOptions": {"waitUntil": "networkidle2"},
    },
    timeout=30.0,
)
resp.raise_for_status()
html_content = resp.text
```

---

### POST /scrape

Extract structured data from a page using CSS selectors. Uses `document.querySelectorAll` under the hood.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | yes | URL to scrape |
| `elements` | array | yes | Array of `{"selector": "css-selector"}` objects |
| `gotoOptions` | object | no | Navigation options |
| `waitForSelector` | object | no | Wait for CSS selector before scraping |
| `waitForTimeout` | number | no | Wait N milliseconds |
| `bestAttempt` | boolean | no | Continue on async failures |

**Response:** `application/json`

```json
{
  "data": [
    {
      "selector": "h1",
      "results": [
        {
          "text": "Page Title",
          "html": "<h1>Page Title</h1>",
          "attributes": [{"name": "class", "value": "title"}],
          "height": 120,
          "width": 736,
          "top": 196,
          "left": 32
        }
      ]
    }
  ]
}
```

```python
import httpx

resp = httpx.post(
    browserless_url("/scrape"),
    json={
        "url": "https://example.com/",
        "elements": [
            {"selector": "h1"},
            {"selector": "meta[name='description']"},
        ],
    },
    timeout=30.0,
)
resp.raise_for_status()
data = resp.json()
for element in data["data"]:
    print(f"Selector: {element['selector']}")
    for result in element["results"]:
        print(f"  Text: {result['text']}")
```

---

### POST /screenshot

Capture a screenshot of a page or rendered HTML.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | yes* | URL to capture |
| `html` | string | yes* | Raw HTML to render (instead of url) |
| `options` | object | no | Screenshot options (see below) |
| `addScriptTag` | array | no | Inject scripts before capture |
| `addStyleTag` | array | no | Inject styles before capture |
| `gotoOptions` | object | no | Navigation options |
| `waitForSelector` | object | no | Wait for CSS selector |
| `waitForTimeout` | number | no | Wait N milliseconds |

**options object:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | string | `"png"` | Image format: `png`, `jpeg`, or `webp` |
| `fullPage` | boolean | `false` | Capture entire scrollable page |
| `quality` | number | - | Image quality 0-100 (jpeg/webp only) |

*Provide either `url` or `html`, not both.

**Response:** Binary image data with `Content-Type: image/png` (or jpeg/webp).

```python
import httpx

resp = httpx.post(
    browserless_url("/screenshot"),
    json={
        "url": "https://example.com/",
        "options": {
            "fullPage": True,
            "type": "png",
        },
    },
    timeout=30.0,
)
resp.raise_for_status()
with open("screenshot.png", "wb") as f:
    f.write(resp.content)
```

---

### POST /pdf

Generate a PDF from a page or rendered HTML.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | yes* | URL to convert |
| `html` | string | yes* | Raw HTML to render (instead of url) |
| `options` | object | no | PDF options (see below) |
| `addScriptTag` | array | no | Inject scripts before generation |
| `addStyleTag` | array | no | Inject styles before generation |
| `gotoOptions` | object | no | Navigation options |
| `waitForSelector` | object | no | Wait for CSS selector |
| `waitForTimeout` | number | no | Wait N milliseconds |

**options object:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `format` | string | `"Letter"` | Page format: `A0`-`A5`, `Letter`, `Legal`, `Tabloid` |
| `printBackground` | boolean | `false` | Include background colors/images |
| `displayHeaderFooter` | boolean | `false` | Show header and footer |
| `landscape` | boolean | `false` | Landscape orientation |
| `margin` | object | - | Margins: `{top, bottom, left, right}` as CSS strings |

*Provide either `url` or `html`, not both.

**Response:** Binary PDF data with `Content-Type: application/pdf`.

```python
import httpx

resp = httpx.post(
    browserless_url("/pdf"),
    json={
        "url": "https://example.com/",
        "options": {
            "format": "A4",
            "printBackground": True,
            "margin": {
                "top": "1cm",
                "bottom": "1cm",
                "left": "1cm",
                "right": "1cm",
            },
        },
    },
    timeout=30.0,
)
resp.raise_for_status()
with open("output.pdf", "wb") as f:
    f.write(resp.content)
```

---

### POST /function

Run custom Puppeteer code server-side. Accepts either `application/javascript` or `application/json`.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | yes | Async JavaScript function (JSON mode) |
| `context` | object | no | Variables passed into the function (JSON mode) |

The function receives `{ page, context }` and must return `{ data, type }`.

**Response:** Varies based on the `type` returned by your function.

```python
import httpx

code = """
export default async ({ page, context }) => {
  await page.goto(context.url);
  const title = await page.title();
  return {
    data: { title: title, url: context.url },
    type: "application/json",
  };
};
"""

resp = httpx.post(
    browserless_url("/function"),
    json={
        "code": code,
        "context": {"url": "https://example.com/"},
    },
    timeout=60.0,
)
resp.raise_for_status()
result = resp.json()
print(result["title"])
```

---

### POST /unblock

Bypass CAPTCHAs and bot detection. Returns only the data you request via boolean flags.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | yes | Target URL to unblock |
| `content` | boolean | no | Return full HTML content |
| `cookies` | boolean | no | Return cookies set by the site |
| `screenshot` | boolean | no | Return base64-encoded screenshot |
| `browserWSEndpoint` | boolean | no | Return WebSocket endpoint for further automation |
| `ttl` | number | no | Time-to-live in ms for browser session (with `browserWSEndpoint`) |

**Note:** Append `&proxy=residential` to the query string for residential proxy support.

**Response:** `application/json` with requested fields (unrequested fields are `null`).

```python
import httpx

resp = httpx.post(
    browserless_url("/unblock"),
    json={
        "url": "https://example.com/",
        "content": True,
        "cookies": True,
    },
    timeout=60.0,
)
resp.raise_for_status()
data = resp.json()
html = data.get("content")
cookies = data.get("cookies")
```

---

### POST /performance

Run a Lighthouse audit for SEO, accessibility, and performance metrics.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | yes | URL to audit |
| `config` | object | no | Lighthouse configuration |

**config object:**

| Field | Type | Description |
|-------|------|-------------|
| `extends` | string | Base config, typically `"lighthouse:default"` |
| `settings` | object | Settings like `onlyCategories: ["performance", "accessibility"]` |

**Response:** `application/json` with Lighthouse audit results.

```python
import httpx

resp = httpx.post(
    browserless_url("/performance"),
    json={
        "url": "https://example.com/",
        "config": {
            "extends": "lighthouse:default",
            "settings": {
                "onlyCategories": ["performance", "seo"],
            },
        },
    },
    timeout=120.0,
)
resp.raise_for_status()
audits = resp.json()["data"]["audits"]
for name, audit in audits.items():
    if audit.get("score") is not None:
        print(f"{audit['title']}: {audit['score']}")
```

---

### POST /download

Retrieve files that Chrome downloads during script execution.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| (body) | string | yes | JavaScript code (sent as `application/javascript`) |

**Response:** Binary file data matching the downloaded file type.

```python
import httpx

code = """
export default async ({ page }) => {
  await page.goto("https://example.com/download-page");
  await page.click("#download-button");
};
"""

resp = httpx.post(
    browserless_url("/download"),
    content=code.encode(),
    headers={"Content-Type": "application/javascript"},
    timeout=60.0,
)
resp.raise_for_status()
with open("downloaded_file", "wb") as f:
    f.write(resp.content)
```

## Shared Request Configuration

These options work across `/content`, `/scrape`, `/screenshot`, and `/pdf` endpoints:

| Option | Type | Description |
|--------|------|-------------|
| `gotoOptions` | object | `{"waitUntil": "networkidle2", "timeout": 30000}` |
| `waitForSelector` | object | `{"selector": ".loaded", "visible": true, "timeout": 5000}` |
| `waitForTimeout` | number | Milliseconds to wait before proceeding |
| `waitForFunction` | object | `{"fn": "() => document.readyState === 'complete'", "timeout": 5000}` |
| `waitForEvent` | object | `{"event": "myCustomEvent", "timeout": 5000}` |
| `bestAttempt` | boolean | Continue processing even when async operations fail |
| `rejectResourceTypes` | array | Block resource types: `["image", "stylesheet", "font", "media"]` |
| `rejectRequestPattern` | array | Block requests matching regex patterns |

### gotoOptions.waitUntil values

| Value | Description |
|-------|-------------|
| `"load"` | Wait for the `load` event |
| `"domcontentloaded"` | Wait for `DOMContentLoaded` event |
| `"networkidle0"` | Wait until 0 network connections for 500ms |
| `"networkidle2"` | Wait until 2 or fewer network connections for 500ms |

## Error Handling

```python
import httpx

def browserless_request(endpoint: str, payload: dict, timeout: float = 30.0) -> httpx.Response:
    """Make a Browserless API request with error handling."""
    try:
        resp = httpx.post(
            browserless_url(endpoint),
            json=payload,
            timeout=timeout,
        )
        resp.raise_for_status()
        return resp
    except httpx.TimeoutException:
        raise RuntimeError(f"Browserless request to {endpoint} timed out after {timeout}s")
    except httpx.HTTPStatusError as e:
        status = e.response.status_code
        if status == 401:
            raise RuntimeError("Invalid or missing API token")
        elif status == 429:
            raise RuntimeError("Rate limit exceeded -- reduce concurrency or upgrade plan")
        elif status == 500:
            raise RuntimeError(f"Browserless server error: {e.response.text}")
        else:
            raise RuntimeError(f"Browserless API error {status}: {e.response.text}")
```

## Common Pitfalls

- **Stateless sessions:** Each API call starts a fresh browser. Cookies, localStorage, and auth state do not persist between requests. Use `/unblock` with `cookies: true` to capture cookies, then pass them in subsequent requests.
- **url vs html:** Never send both `url` and `html` in the same request -- pick one. The API will error or behave unexpectedly.
- **Timeouts:** Default httpx timeout (5s) is too short for most browser operations. Set `timeout=30.0` or higher. For `/performance`, use `timeout=120.0`.
- **Content-Type matters:** `/function` and `/download` can accept `application/javascript` (raw code) or `application/json` (with code + context). Make sure headers match.
- **Bot detection:** If `/content` returns empty or incomplete HTML, switch to `/unblock` which handles CAPTCHAs and bot detection.
- **Resource blocking:** Use `rejectResourceTypes: ["image", "stylesheet", "font"]` to speed up scraping when you only need text content.
- **waitUntil:** Default `gotoOptions.waitUntil` may not wait for JS-rendered content. Use `"networkidle2"` or `waitForSelector` to ensure dynamic content has loaded.
- **Binary responses:** `/screenshot`, `/pdf`, and `/download` return binary data. Use `resp.content` (not `resp.text`) and write in binary mode (`"wb"`).
- **Token exposure:** The API token is in the URL query string. Never log full request URLs in production. Consider using environment variables: `TOKEN = os.environ["BROWSERLESS_TOKEN"]`.
