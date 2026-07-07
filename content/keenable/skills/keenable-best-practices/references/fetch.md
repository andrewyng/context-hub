# Keenable fetch reference

`GET /v1/fetch/public?url=...` (keyless) or `GET /v1/fetch?url=...` (with `X-API-Key`). Fetches a single URL and returns its main content as markdown.

## Request

| Param | Type | Required | Notes |
|---|---|---|---|
| `url` | string | yes | The absolute `http(s)` URL to fetch, URL-encoded in the query string. |

## Response

```json
{
  "url": "https://example.com/article",
  "title": "Article title",
  "content": "# Article title\n\nClean markdown body ...",
  "description": "Optional meta description",
  "author": "Optional author",
  "published_at": "2026-02-03T00:00:00Z"
}
```

`content` is the main article text as markdown, boilerplate stripped. `description`, `author`, and `published_at` appear when the page exposes them.

## Examples

```python
import os, requests
from urllib.parse import quote

def keenable_fetch(url):
    key = os.environ.get("KEENABLE_API_KEY")
    base = "https://api.keenable.ai/v1/fetch" if key else "https://api.keenable.ai/v1/fetch/public"
    headers = {"X-API-Key": key} if key else {}
    r = requests.get(base, params={"url": url}, headers=headers)
    r.raise_for_status()
    return r.json()

page = keenable_fetch("https://example.com/article")
print(page["title"], "\n", page["content"][:500])
```

```javascript
async function keenableFetch(url) {
  const key = process.env.KEENABLE_API_KEY;
  const base = key ? "/v1/fetch" : "/v1/fetch/public";
  const headers = key ? { "X-API-Key": key } : {};
  const res = await fetch(`https://api.keenable.ai${base}?url=${encodeURIComponent(url)}`, { headers });
  if (!res.ok) throw new Error(`Keenable fetch failed (${res.status})`);
  return res.json();
}
```

## Notes

- Pair fetch with search: search returns URLs, fetch reads the ones worth grounding on.
- Prefer fetch over a raw HTTP GET plus your own HTML-to-text step; it returns clean markdown directly.
- Only fetch pages you actually need; it is heavier than search.
