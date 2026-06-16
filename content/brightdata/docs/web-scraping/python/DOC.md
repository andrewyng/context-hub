---
name: web-scraping
description: "Bright Data Python SDK for web scraping, SERP results, and browser automation using the Web Unlocker, SERP, and Browser APIs."
metadata:
  languages: "python"
  versions: "v1"
  updated-on: "2026-05-08"
  source: community
  tags: "brightdata,web-scraping,serp,proxy,browser-automation,data-collection"
---

# Bright Data Python SDK — Python Guide

You are a Bright Data API coding expert. Help me write Python code using the Bright Data Python SDK.

Official documentation: https://docs.brightdata.com/api-reference/SDK

## Authentication

All API access requires an API token. Generate one from your Bright Data dashboard.

Set the token via environment variable (recommended):

```bash
export BRIGHTDATA_API_TOKEN="YOUR_API_TOKEN"
```

Or pass it directly: `BrightDataClient(api_token="YOUR_API_TOKEN")`.

## Installation

```bash
pip install brightdata-sdk
```

## Core Products

Bright Data exposes several products via the SDK:

| Product | Use case |
|---|---|
| **Web Unlocker** | Fetch any URL bypassing bot detection — returns HTML or JSON |
| **SERP API** | Structured search engine results (Google, Bing, etc.) |
| **Browser API** | Full browser automation via Playwright — handles JS-heavy pages |
| **Scrapers** | Managed scrapers for specific sites (LinkedIn, Amazon, etc.) |
| **Marketplace Datasets** | Pre-built datasets ready for download |

## Async Usage (recommended for pipelines)

`BrightDataClient` is async-native and must be used as an async context manager:

```python
import asyncio
from brightdata import BrightDataClient

async def scrape_urls(urls: list[str]) -> list:
    async with BrightDataClient() as client:  # reads BRIGHTDATA_API_TOKEN from env
        results = await asyncio.gather(*[client.scrape_url(url) for url in urls])
        return [r.data for r in results if r.success]

data = asyncio.run(scrape_urls(["https://example1.com", "https://example2.com"]))
```

## Sync Usage

For sync contexts, use `SyncBrightDataClient` (separate class):

```python
from brightdata import SyncBrightDataClient

client = SyncBrightDataClient()  # reads BRIGHTDATA_API_TOKEN from env

result = client.scrape_url("https://example.com")
if result.success:
    print(result.data)
```

## SERP API

```python
from brightdata import BrightDataClient

async def search_google(query: str, num_results: int = 10) -> list:
    async with BrightDataClient() as client:
        results = await client.search.google(query=query, num_results=num_results)
        return results
```

## Browser API (Playwright)

For JavaScript-heavy pages. Requires `browser_username` and `browser_password` from your Bright Data dashboard. Connects Playwright to Bright Data's managed browser via CDP:

```python
from brightdata import BrightDataClient
from playwright.sync_api import sync_playwright

def scrape_with_browser(url: str) -> str:
    client = BrightDataClient(
        browser_username="YOUR_BROWSER_USERNAME",
        browser_password="YOUR_BROWSER_PASSWORD",
    )
    connect_url = client.browser.get_connect_url(country="us")
    with sync_playwright() as playwright:
        browser = playwright.chromium.connect_over_cdp(connect_url)
        try:
            page = browser.new_page()
            page.goto(url)
            return page.content()
        finally:
            browser.close()
```

## Authentication Methods

| Method | Products |
|---|---|
| API token (SDK) | Web Unlocker, SERP API, Browsers, Scrapers, Marketplace |
| username:password proxy | Proxy networks only |

See https://docs.brightdata.com/api-reference/authentication for full details.
