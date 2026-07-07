# Keenable search reference

`POST /v1/search/public` (keyless) or `POST /v1/search` (with `X-API-Key`).

## Request

JSON body:

| Field | Type | Required | Notes |
|---|---|---|---|
| `query` | string | yes | The search query. |
| `mode` | string | no | Search mode. Defaults to `"pro"` (deeper retrieval, higher quality). |
| `site` | string | no | Restrict results to one domain, e.g. `"techcrunch.com"`. |
| `published_after` | string | no | Only pages published on or after this date (`YYYY-MM-DD`). |
| `published_before` | string | no | Only pages published on or before this date (`YYYY-MM-DD`). |
| `acquired_after` | string | no | Only pages indexed by Keenable on or after this date (`YYYY-MM-DD`). |
| `acquired_before` | string | no | Only pages indexed on or before this date (`YYYY-MM-DD`). |

## Response

```json
{
  "results": [
    {
      "title": "TypeScript Best Practices 2026",
      "url": "https://example.com/ts-best-practices",
      "description": "A comprehensive guide ...",
      "published_at": "2026-01-15T10:30:00Z",
      "acquired_at": "2026-01-16T08:12:34Z"
    }
  ]
}
```

`published_at` and `acquired_at` appear when known. The API returns a fixed-size result set; cap it client-side if you need fewer.

## Examples

```python
import os, requests

def keenable_search(query, **filters):
    key = os.environ.get("KEENABLE_API_KEY")
    payload = {"query": query, "mode": "pro", **filters}
    if key:
        r = requests.post("https://api.keenable.ai/v1/search",
                          headers={"X-API-Key": key}, json=payload)
    else:
        r = requests.post("https://api.keenable.ai/v1/search/public", json=payload)
    r.raise_for_status()
    return r.json()["results"]

# Recent results from a single domain
results = keenable_search("agent frameworks", site="github.com", published_after="2026-01-01")
```

```javascript
async function keenableSearch(query, filters = {}) {
  const key = process.env.KEENABLE_API_KEY;
  const path = key ? "/v1/search" : "/v1/search/public";
  const headers = { "Content-Type": "application/json" };
  if (key) headers["X-API-Key"] = key;
  const res = await fetch(`https://api.keenable.ai${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, mode: "pro", ...filters }),
  });
  if (!res.ok) throw new Error(`Keenable search failed (${res.status})`);
  return (await res.json()).results;
}
```
