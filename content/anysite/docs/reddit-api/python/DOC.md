---
name: reddit-api
description: "Extract Reddit user posts, comments, subreddit content, and search discussions"
metadata:
  languages: "python"
  versions: "0.0.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "subreddit,threads,discussion,community,scraping,forum"
---

# Anysite Reddit API Coding Guidelines (Python)

You are an Anysite Reddit API coding expert. Help me write Python code using the Anysite REST API for Reddit data extraction.

API documentation: https://api.anysite.io/docs

## Golden Rule: All Endpoints Use POST with JSON Body

- **Base URL:** `https://api.anysite.io`
- **Method:** All endpoints use `POST`
- **Auth:** Pass your API key in the `access-token` header
- **Content-Type:** `application/json`
- **Identifiers:** Reddit entities use usernames, post URLs, or subreddit names

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
    """Make a POST request to the Anysite Reddit API."""
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

### Get User Comments

Retrieve recent public comments by a Reddit user. Costs 1 credit per batch.

**POST** `/api/reddit/user/comments`

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `username` | string | Yes | - | Reddit username |
| `count` | integer | No | 25 | Number of comments to return |

```python
comments = anysite_post("/api/reddit/user/comments", {
    "username": "spez",
    "count": 20
})

for comment in comments:
    print(comment["text"])
    print(comment["subreddit"], "-", comment["score"], "points")
    print(comment["created_at"])
    print("---")
```

**Key response fields (`RedditUserComment`):**

| Field | Type | Description |
|---|---|---|
| `text` | string | Comment text (may contain markdown) |
| `subreddit` | string | Subreddit name where comment was posted |
| `score` | integer | Net upvotes (upvotes minus downvotes) |
| `created_at` | integer | Unix timestamp of comment creation |
| `permalink` | string | Relative URL path to the comment |
| `post_url` | string | Relative URL path to the parent post |
| `id` | string | Comment ID (prefixed with `t1_`) |
| `author` | object | Author object with `id` and `name` fields (`@reddit_author`) |

### Get User Posts

Retrieve posts submitted by a Reddit user. Costs 1 credit per batch.

**POST** `/api/reddit/user/posts`

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `username` | string | Yes | - | Reddit username |
| `count` | integer | No | 25 | Number of posts to return |

```python
posts = anysite_post("/api/reddit/user/posts", {
    "username": "spez",
    "count": 10
})

for post in posts:
    print(post["title"])
    print(f"r/{post['subreddit']} - {post['score']} points")
    print(post["comment_count"], "comments")
    print(post["post_type"])
    print("---")
```

**Key response fields (`RedditPostDetail`):**

| Field | Type | Description |
|---|---|---|
| `id` | string | Post ID (prefixed with `t3_`) |
| `title` | string | Post title |
| `subreddit` | string | Subreddit name (e.g. `"r/redditstock"`) |
| `subreddit_id` | string | Subreddit ID (prefixed with `t5_`) |
| `score` | integer | Net upvotes |
| `comment_count` | integer | Number of comments |
| `post_type` | string | Post type |
| `author` | object | Author object with `id` and `name` fields (`@reddit_author`) |
| `created_at` | integer | Unix timestamp |
| `url` | string | Relative URL path to the post |

### Get Post Details

Retrieve a Reddit post by its URL. Costs 1 credit.

**POST** `/api/reddit/posts`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `post_url` | string | Yes | Full URL to the Reddit post |

```python
result = anysite_post("/api/reddit/posts", {
    "post_url": "https://www.reddit.com/r/technology/comments/abc123/example_post/"
})

post = result[0]
print(post["title"])
print(post["selftext"])
print(post["score"], "points,", post["comment_count"], "comments")
print(post["author"]["name"])
```

Returns an array of `RedditPostDetail`.

### Get Post Comments

Retrieve comments on a Reddit post. Costs 1 credit.

**POST** `/api/reddit/posts/comments`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `post_url` | string | Yes | Full URL to the Reddit post |

```python
comments = anysite_post("/api/reddit/posts/comments", {
    "post_url": "https://www.reddit.com/r/technology/comments/abc123/example_post/"
})

for comment in comments:
    print(comment["author"]["name"], ":", comment["text"][:100])
    print(comment["score"], "points")
    print("---")
```

**Key response fields (`RedditComment`):**

| Field | Type | Description |
|---|---|---|
| `text` | string | Comment text (may contain markdown) |
| `author` | object | Author object with `id` and `name` fields (`@reddit_author`) |
| `score` | integer | Net upvotes |
| `created_at` | integer | Unix timestamp |
| `permalink` | string | Relative URL path |
| `post_url` | string | Relative URL path to the parent post |
| `subreddit` | string | Subreddit name |
| `id` | string | Comment ID (prefixed with `t1_`) |

### Search Posts

Search Reddit posts by query. Costs 1 credit per batch.

**POST** `/api/reddit/search/posts`

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `query` | string | Yes | - | Search query keywords |
| `count` | integer | Yes | - | Number of results to return |
| `sort` | string | No | `"relevance"` | Sort order |
| `time_filter` | string | No | `"all"` | Time filter |

```python
results = anysite_post("/api/reddit/search/posts", {
    "query": "python web framework",
    "count": 20
})

for post in results:
    print(post["title"])
    print(f"r/{post['subreddit']['alias']} - {post['vote_count']} points")
    print(post["comment_count"], "comments")
    print("---")
```

**Key response fields (`RedditPost`):**

| Field | Type | Description |
|---|---|---|
| `id` | string | Post ID (prefixed with `t3_`) |
| `title` | string | Post title |
| `url` | string | Full post URL |
| `subreddit` | object | Subreddit object (`@reddit_subreddit`) with `id`, `alias`, `url`, etc. |
| `vote_count` | integer | Net upvotes |
| `comment_count` | integer | Number of comments |
| `created_at` | integer | Unix timestamp |

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
