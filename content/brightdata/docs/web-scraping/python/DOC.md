---
name: web-scraping
description: "Bright Data Python SDK for web scraping, SERP results, and browser automation using the Unlocker, SERP, and Browser APIs."
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

All API access requires an API key. Generate one from your Bright Data dashboard.

Set the API key via environment variable (recommended):

```bash
export BRIGHTDATA_API_KEY="YOUR_API_KEY"
```

Or pass it directly to the client.

## Installation

```bash
pip install brightdata-sdk
```

## Core Products

Bright Data exposes several products via the SDK:

| Product | Use case |
|---|---|
| **Unlocker API** | Fetch any URL bypassing bot detection — returns HTML or JSON |
| **SERP API** | Structured search engine results (Google, Bing, etc.) |
| **Browser API** | Full browser automation via Playwright — handles JS-heavy pages |
| **Scrapers** | Managed scrapers for specific sites (LinkedIn, Amazon, etc.) |
| **Marketplace Datasets** | Pre-built datasets ready for download |

## Sync Usage

```python
from brightdata import BrightDataClient

client = BrightDataClient()  # reads BRIGHTDATA_API_KEY from env

# Generic URL scrape
result = client.scrape.generic.url("https://example.com")
if result.success:
    print(result.content)
```

## Async Usage (recommended for pipelines)

```python
import asyncio
from brightdata import BrightDataClient

async def scrape_urls(urls: list[str]) -> list:
    async with BrightDataClient() as client:
        results = await client.scrape.generic.url_async(urls)
        return [r.content for r in results if r.success]

data = asyncio.run(scrape_urls(["https://example1.com", "https://example2.com"]))
```

## SERP API

```python
from brightdata import BrightDataClient

async def search_google(query: str, location: str = "United States"):
    async with BrightDataClient() as client:
        results = await client.search.google(query, location=location)
        return results
```

## Browser API (Playwright)

For JavaScript-heavy pages. Bright Data's browser integration uses the Chrome DevTools Protocol (CDP) — connect Playwright to Bright Data's managed browser via `client.connect_browser()`:

```python
from brightdata import BrightDataClient
from playwright.sync_api import sync_playwright

def scrape_with_browser(url: str) -> str:
    client = BrightDataClient()
    with sync_playwright() as playwright:
        browser = playwright.chromium.connect_over_cdp(client.connect_browser())
        try:
            page = browser.new_page()
            page.goto(url)
            return page.content()
        finally:
            browser.close()
```

## CLI Usage

```bash
# SERP
brightdata search google "python tutorial" --location "United States"

# Scrape a URL
brightdata scrape generic "https://example.com" --output-format pretty

# Save output
brightdata search google "AI news" --output-file results.json
```

## Authentication Methods

| Method | Products |
|---|---|
| API key (SDK) | Unlocker API, SERP API, Browsers, Scrapers, Marketplace |
| username:password proxy | Proxy networks only |

See https://docs.brightdata.com/api-reference/authentication for full details.
