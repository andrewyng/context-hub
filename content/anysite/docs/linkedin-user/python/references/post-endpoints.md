# LinkedIn Post Endpoints

All endpoints: `POST` to `https://api.anysite.io`. Require `access-token` header.

---

## Get Post

**`POST /api/linkedin/post`**

Retrieve a LinkedIn post by URN or URL. Cost: 1 credit.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `urn` | string | yes | Post URN (e.g., `activity:7234173400267538433`) |
| `include_all_document_images` | boolean | no | Include all images from document posts (default: false) |

### Example

```python
post = anysite_post("/api/linkedin/post", {
    "urn": "activity:7234173400267538433"
})
print(post["text"])
print(f"{post['num_likes']} likes, {post['num_comments']} comments")
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `urn` | string | Post URN |
| `text` | string | Post content |
| `author_name` | string | Author display name |
| `author_urn` | string | Author URN |
| `num_likes` | integer | Total like count |
| `num_comments` | integer | Comment count |
| `num_shares` | integer | Share/repost count |
| `created_at` | string | Timestamp |
| `reactions` | object | Breakdown by type (LIKE, CELEBRATE, LOVE, etc.) |
| `images` | array | Attached image URLs |
| `article_url` | string | Linked article URL (if any) |

---

## Get Post Comments

**`POST /api/linkedin/post/comments`**

Retrieve comments on a post. Cost: 1 credit per 10 results.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `urn` | string | yes | Post URN |
| `count` | integer | yes | Max results to return |
| `sort` | string | no | Sort order (default: `"recent"`) |

### Example

```python
comments = anysite_post("/api/linkedin/post/comments", {
    "urn": "activity:7234173400267538433",
    "count": 20
})
for comment in comments:
    print(comment["author_name"], ":", comment["text"])
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `text` | string | Comment text |
| `author_name` | string | Commenter name |
| `author_urn` | string | Commenter URN |
| `created_at` | string | Timestamp |
| `num_likes` | integer | Likes on the comment |
| `reply_count` | integer | Number of replies |

---

## Get Post Reactions

**`POST /api/linkedin/post/reactions`**

Retrieve users who reacted to a post. Cost: 1 credit per 10 results.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `urn` | string | yes | Post URN |
| `count` | integer | yes | Max results to return |

### Example

```python
reactions = anysite_post("/api/linkedin/post/reactions", {
    "urn": "activity:7234173400267538433",
    "count": 50
})
for reaction in reactions:
    print(reaction["name"], "-", reaction["reaction_type"])
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `name` | string | Reactor's name |
| `urn` | string | Reactor's URN |
| `headline` | string | Reactor's headline |
| `reaction_type` | string | LIKE, CELEBRATE, LOVE, INSIGHTFUL, CURIOUS, FUNNY |

---

## Get Post Reposts

**`POST /api/linkedin/post/reposts`**

Retrieve reposts (shares) of a post. Cost: 1 credit per 10 results.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `urn` | string | yes | Post URN |
| `count` | integer | yes | Max results to return |

### Example

```python
reposts = anysite_post("/api/linkedin/post/reposts", {
    "urn": "activity:7234173400267538433",
    "count": 20
})
for repost in reposts:
    print(repost["author_name"], "reposted")
    print(repost.get("text", "(no added text)"))
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `urn` | string | Repost URN |
| `text` | string | Added commentary (if any) |
| `author_name` | string | Reposter's name |
| `author_urn` | string | Reposter's URN |
| `created_at` | string | Repost timestamp |
| `num_likes` | integer | Likes on the repost |