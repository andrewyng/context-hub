---
name: twitter-api
description: "Extract Twitter/X user profiles, tweets, and search posts and users"
metadata:
  languages: "python"
  versions: "0.0.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "x.com,tweets,timeline,social-media,scraping,microblog"
---

# Anysite Twitter/X API Coding Guidelines (Python)

You are an Anysite Twitter API coding expert. Help me write Python code using the Anysite REST API for Twitter/X data extraction.

API documentation: https://api.anysite.io/docs

## Golden Rule: All Endpoints Use POST with JSON Body

- **Base URL:** `https://api.anysite.io`
- **Method:** All endpoints use `POST`
- **Auth:** Pass your API key in the `access-token` header
- **Content-Type:** `application/json`
- **Identifiers:** Twitter entities use handles (usernames), tweet IDs, or full URLs

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
    """Make a POST request to the Anysite Twitter API."""
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

## Endpoints

### Get User Profile

Retrieve a Twitter/X user profile by handle or URL. Costs 1 credit.

**POST** `/api/twitter/user`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `user` | string | Yes | Twitter handle (e.g. `"elonmusk"`) or profile URL |

```python
result = anysite_post("/api/twitter/user", {
    "user": "elonmusk"
})

user = result[0]
print(user["name"])
print(user["alias"])
print(user["description"])
print(user["follower_count"])
print(user["following_count"])
print(user["tweet_count"])
print(user["is_blue_verified"])
print(user["image"])
```

**Key response fields (`TwitterUser`):**

| Field | Type | Description |
|---|---|---|
| `name` | string | Display name |
| `alias` | string | Twitter handle (without @) |
| `description` | string | Bio text |
| `follower_count` | integer | Number of followers |
| `following_count` | integer | Number of accounts followed |
| `tweet_count` | integer | Total tweets posted |
| `favorites_count` | integer | Total tweets liked |
| `media_count` | integer | Total media posted |
| `listed_count` | integer | Number of lists the user is on |
| `verified` | boolean | Legacy verification status |
| `verified_type` | string | Verification type |
| `is_blue_verified` | boolean | Twitter Blue verification status |
| `image` | string | Profile picture URL |
| `banner_url` | string | Banner image URL |
| `created_at` | integer | Account creation date (unix timestamp) |
| `location` | string | User-set location |
| `url` | string | Profile URL |
| `rest_id` | string | Twitter user ID |
| `internal_id` | string | Internal identifier |
| `professional` | object | Professional account info (if applicable) |

### Get User Posts

Retrieve recent posts (tweets) from a Twitter/X user. Costs 1 credit per batch.

**POST** `/api/twitter/user/posts`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `user` | string | Yes | Twitter handle or profile URL |
| `count` | integer | Yes | Number of tweets to return |

```python
tweets = anysite_post("/api/twitter/user/posts", {
    "user": "elonmusk",
    "count": 20
})

for tweet in tweets:
    print(tweet["text"])
    print(tweet["favorite_count"], "likes,", tweet["retweet_count"], "retweets")
    print(tweet["created_at"])  # unix timestamp
    print("---")
```

**Key response fields (`TwitterPost`):**

| Field | Type | Description |
|---|---|---|
| `text` | string | Tweet text content |
| `favorite_count` | integer | Number of likes |
| `retweet_count` | integer | Number of retweets |
| `reply_count` | integer | Number of replies |
| `quote_count` | integer | Number of quote tweets |
| `bookmark_count` | integer | Number of bookmarks |
| `views_count` | integer | Number of views |
| `created_at` | integer | Tweet creation timestamp (unix) |
| `id` | string | Tweet ID |
| `user` | object | Author info (`name`, `alias`, etc.) |
| `media` | array | Attached media objects (images, videos) |
| `urls` | array | URLs mentioned in the tweet |
| `is_retweet` | boolean | Whether this is a retweet |
| `is_quote` | boolean | Whether this is a quote tweet |
| `lang` | string | Detected language code |

### Search Posts

Search Twitter/X posts by keyword or query. Costs 1 credit per batch.

**POST** `/api/twitter/search/posts`

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `query` | string | No | `""` | Search query (keywords, hashtags, operators) |
| `count` | integer | Yes | - | Number of results to return |
| `search_type` | string | No | `"Top"` | Search type filter |

```python
results = anysite_post("/api/twitter/search/posts", {
    "query": "artificial intelligence",
    "count": 20
})

for tweet in results:
    print(f"@{tweet['user']['alias']}: {tweet['text'][:100]}")
    print(tweet["favorite_count"], "likes")
    print("---")
```

### Search Users

Search for Twitter/X user profiles. Costs 1 credit per batch.

**POST** `/api/twitter/search/users`

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `query` | string | No | `""` | Search query (name, keyword, topic) |
| `count` | integer | Yes | - | Number of results to return |

```python
results = anysite_post("/api/twitter/search/users", {
    "query": "machine learning researcher",
    "count": 10
})

for user in results:
    print(user["name"], f"(@{user['alias']})")
    print(user["description"][:100])
    print(user["follower_count"], "followers")
    print("---")
```

Returns an array of `TwitterUser`.

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
