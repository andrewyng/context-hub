---
name: instagram-api
description: "Extract Instagram profiles, posts, reels, comments, likes, and search content"
metadata:
  languages: "python"
  versions: "0.0.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "scraping,stories,followers,engagement,hashtag,media"
---

# Anysite Instagram API Coding Guidelines (Python)

You are an Anysite Instagram API coding expert. Help me write Python code using the Anysite REST API for Instagram data extraction.

API documentation: https://api.anysite.io/docs

## Golden Rule: All Endpoints Use POST with JSON Body

- **Base URL:** `https://api.anysite.io`
- **Method:** All endpoints use `POST`
- **Auth:** Pass your API key in the `access-token` header
- **Content-Type:** `application/json`
- **Identifiers:** Instagram entities use usernames, post shortcodes, or full URLs

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
    """Make a POST request to the Anysite Instagram API."""
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

Retrieve an Instagram user profile by username. Costs 1 credit.

**POST** `/api/instagram/user`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `user` | string | Yes | Instagram username |
| `with_creation_date` | boolean | No | Include account creation date (default: false) |

```python
result = anysite_post("/api/instagram/user", {
    "user": "natgeo"
})

user = result[0]
print(user["alias"])
print(user["name"])
print(user["description"])
print(user["follower_count"])
print(user["following_count"])
print(user["media_count"])
print(user["is_verified"])
print(user["image"])
```

**Key response fields (`InstagramUser`):**

| Field | Type | Description |
|---|---|---|
| `alias` | string | Instagram handle |
| `name` | string | Display name |
| `description` | string | Bio text |
| `follower_count` | integer | Number of followers |
| `following_count` | integer | Number of accounts followed |
| `media_count` | integer | Total number of posts |
| `is_verified` | boolean | Blue check verification status |
| `is_private` | boolean | Whether account is private |
| `is_business` | boolean | Whether account is a business account |
| `image` | string | Profile picture URL |
| `url` | string | Profile URL |
| `external_url` | string | Link in bio |
| `id` | string | Instagram user ID |
| `category` | string | Account category (e.g. "Media") |
| `email` | string | Contact email (if available) |
| `phone` | string | Contact phone (if available) |
| `whatsapp_number` | string | WhatsApp number (if available) |
| `location` | object | User location info |
| `links` | array | Bio links |
| `mentions` | array | Bio mentions |
| `hashtags` | array | Bio hashtags |
| `created_at` | string | Account creation date (if requested) |

### Get User Followers or Following

Retrieve a user's followers or following list. Costs 1 credit per 25 results.

**POST** `/api/instagram/user/friendships`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `user` | string | Yes | Username or user ID |
| `type` | string | Yes | `"followers"` or `"following"` |
| `count` | integer | Yes | Number of results to return |

```python
followers = anysite_post("/api/instagram/user/friendships", {
    "user": "natgeo",
    "type": "followers",
    "count": 50
})

for follower in followers:
    print(follower["alias"], "-", follower["name"])
    print(follower["is_verified"])
```

**Key response fields (`InstagramUserPreview`):**

| Field | Type | Description |
|---|---|---|
| `alias` | string | Instagram handle |
| `name` | string | Display name |
| `image` | string | Profile picture URL |
| `is_verified` | boolean | Verification status |
| `is_private` | boolean | Whether account is private |
| `id` | string | Instagram user ID |

### Get User Posts

Retrieve posts from an Instagram user's feed. Costs 1 credit per 12 results.

**POST** `/api/instagram/user/posts`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `user` | string | Yes | Username or user ID |
| `count` | integer | Yes | Number of posts to return |

```python
posts = anysite_post("/api/instagram/user/posts", {
    "user": "natgeo",
    "count": 12
})

for post in posts:
    print(post["code"])
    print(post["text"])
    print(post["like_count"], "likes")
    print(post["comment_count"], "comments")
```

### Get User Reels

Retrieve reels from an Instagram user. Costs 1 credit per 12 results.

**POST** `/api/instagram/user/reels`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `user` | string | Yes | Username or user ID |
| `count` | integer | Yes | Number of reels to return |

```python
reels = anysite_post("/api/instagram/user/reels", {
    "user": "natgeo",
    "count": 12
})

for reel in reels:
    print(reel["code"])
    print(reel["text"])
    print(reel["url"])
    print(reel["like_count"], "likes")
```

### Get Post

Retrieve a single Instagram post by its ID or shortcode. Costs 1 credit.

**POST** `/api/instagram/post`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `post` | string | Yes | Post shortcode or media ID |

```python
result = anysite_post("/api/instagram/post", {
    "post": "CxLp3AAMet6"
})

post = result[0]
print(post["code"])
print(post["text"])
print(post["like_count"], "likes")
print(post["comment_count"], "comments")
print(post["user"]["name"])
print(post["created_at"])
```

**Key response fields (`InstagramPost`):**

| Field | Type | Description |
|---|---|---|
| `id` | string | Media ID (format: `{media_id}_{user_id}`) |
| `code` | string | Post shortcode (used in URLs) |
| `url` | string | Full post URL |
| `image` | string | Image/thumbnail URL |
| `text` | string | Post caption text |
| `created_at` | integer | Unix timestamp of post creation |
| `like_count` | integer | Number of likes |
| `comment_count` | integer | Number of comments |
| `reshare_count` | integer | Number of shares |
| `view_count` | integer | Number of views (null for non-video) |
| `user` | object | Author info (`@instagram_user_preview` with `id`, `name`, `alias`) |
| `type` | string | Type of media (`"clips"`, `"image"`, `"carousel"`, etc.) |
| `media` | array | Attached media objects |

### Get Post Comments

Retrieve comments on an Instagram post. Costs 1 credit per 15 results.

**POST** `/api/instagram/post/comments`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `post` | string | Yes | Post shortcode or media ID |
| `count` | integer | Yes | Number of comments to return |

```python
comments = anysite_post("/api/instagram/post/comments", {
    "post": "CxLp3AAMet6",
    "count": 30
})

for comment in comments:
    print(comment["user"]["alias"], ":", comment["text"])
    print(comment["like_count"], "likes")
    print(comment["created_at"])
```

**Key response fields (`InstagramComment`):**

| Field | Type | Description |
|---|---|---|
| `text` | string | Comment text |
| `user` | object | Commenter info (`@instagram_user_preview` with `id`, `name`, `alias`) |
| `like_count` | integer | Number of likes on the comment |
| `created_at` | integer | Unix timestamp |
| `id` | string | Comment ID |

### Get Post Likes

Retrieve users who liked a post. Costs 1 credit per 100 results.

**POST** `/api/instagram/post/likes`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `post` | string | Yes | Post shortcode or media ID |
| `count` | integer | Yes | Number of results to return |

```python
likers = anysite_post("/api/instagram/post/likes", {
    "post": "CxLp3AAMet6",
    "count": 100
})

for user in likers:
    print(user["alias"], "-", user["name"])
```

Returns an array of `InstagramUserPreview` (same schema as followers/following).

### Search Posts

Search Instagram posts by query. Costs 1 credit per 30 results.

**POST** `/api/instagram/search/posts`

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `query` | string | Yes | - | Search query (hashtag, keyword) |
| `count` | integer | Yes | - | Number of results to return |

```python
results = anysite_post("/api/instagram/search/posts", {
    "query": "climate change",
    "count": 30
})

for post in results:
    print(post["code"], "-", post["text"][:80])
    print(post["like_count"], "likes")
```

Returns an array of `InstagramPost`.

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
