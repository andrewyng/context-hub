# LinkedIn User Endpoints

All endpoints: `POST` to `https://api.anysite.io`. Require `access-token` header.

---

## Get User Profile

**`POST /api/linkedin/user`**

Retrieve a full LinkedIn user profile. Cost: 1-9 credits depending on included sections.

### Parameters

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `user` | string | yes | - | LinkedIn username slug, full profile URL, or URN (e.g., `williamhgates`) |
| `with_experience` | boolean | no | `true` | Include work experience |
| `with_education` | boolean | no | `true` | Include education history |
| `with_honors` | boolean | no | `true` | Include honors and awards |
| `with_certificates` | boolean | no | `true` | Include certifications |
| `with_languages` | boolean | no | `true` | Include languages |
| `with_patents` | boolean | no | `true` | Include patents |
| `with_skills` | boolean | no | `true` | Include skills |
| `with_description_and_top_skills` | boolean | no | `true` | Include profile summary and top skills |
| `fast_mode` | boolean | no | `false` | Skip some enrichment for faster response |

### Example

```python
result = anysite_post("/api/linkedin/user", {
    "user": "williamhgates",
    "with_experience": True,
    "with_education": True,
    "with_skills": True,
    "with_honors": False,
    "with_certificates": False,
    "with_languages": False,
    "with_patents": False
})
user = result[0]
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `name` | string | Full name |
| `headline` | string | Profile headline |
| `urn` | object | User URN object with `type` (e.g. `"fsd_profile"`) and `value` |
| `alias` | string | Username slug |
| `url` | string | LinkedIn profile URL |
| `location` | string | Location |
| `description` | string | Profile summary |
| `image` | string | Avatar URL |
| `experience` | array | Work positions (if requested) |
| `education` | array | Education entries (if requested) |
| `skills` | array | Skills list (if requested) |
| `honors` | array | Awards (if requested) |
| `certificates` | array | Certifications (if requested) |
| `languages` | array | Languages (if requested) |
| `patents` | array | Patents (if requested) |

---

## Get User Certificates

**`POST /api/linkedin/user/certificates`**

Retrieve certifications for a user. Cost: 1 credit.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `urn` | string | yes | User URN (e.g., `fsd_profile:ACoAABXy1234`) |
| `count` | integer | yes | Max results to return |

### Example

```python
certs = anysite_post("/api/linkedin/user/certificates", {
    "urn": "fsd_profile:ACoAABXy1234",
    "count": 50
})
for cert in certs:
    print(cert["name"], "-", cert["authority"])
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `name` | string | Certificate name |
| `authority` | string | Issuing organization |
| `license_number` | string | License/credential ID |
| `url` | string | Certificate URL |
| `start_date` | string | Issue date |
| `end_date` | string | Expiry date |

---

## Get User Comments

**`POST /api/linkedin/user/comments`**

Retrieve comments posted by a user. Cost: 1 credit per 10 results.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `urn` | string | yes | User URN |
| `count` | integer | yes | Max results to return |
| `commented_after` | integer | no | Unix timestamp; only return comments after this time |

### Example

```python
comments = anysite_post("/api/linkedin/user/comments", {
    "urn": "fsd_profile:ACoAABXy1234",
    "count": 20
})
for comment in comments:
    print(comment["text"])
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `text` | string | Comment text |
| `created_at` | string | Timestamp |
| `post_urn` | string | URN of the post commented on |
| `num_likes` | integer | Number of likes on the comment |

---

## Get User Education

**`POST /api/linkedin/user/education`**

Retrieve education history. Cost: 1 credit.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `urn` | string | yes | User URN |
| `count` | integer | yes | Max results to return |

### Example

```python
education = anysite_post("/api/linkedin/user/education", {
    "urn": "fsd_profile:ACoAABXy1234",
    "count": 50
})
for entry in education:
    print(entry["school_name"], "-", entry["degree"])
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `school_name` | string | Institution name |
| `degree` | string | Degree type |
| `field_of_study` | string | Major/field |
| `start_date` | string | Start date |
| `end_date` | string | End date |
| `description` | string | Additional details |

---

## Get User Endorsers

**`POST /api/linkedin/user/endorsers`**

Retrieve users who endorsed this user's skills. Cost: 1 credit.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `urn` | string | yes | User URN |
| `count` | integer | yes | Max results to return |

### Example

```python
endorsers = anysite_post("/api/linkedin/user/endorsers", {
    "urn": "fsd_profile:ACoAABXy1234",
    "count": 50
})
for endorser in endorsers:
    print(endorser["name"], "endorsed", endorser["skill_name"])
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `name` | string | Endorser's name |
| `urn` | string | Endorser's URN |
| `skill_name` | string | Endorsed skill |
| `headline` | string | Endorser's headline |

---

## Get User Experience

**`POST /api/linkedin/user/experience`**

Retrieve work experience. Cost: 1 credit.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `urn` | string | yes | User URN |
| `count` | integer | yes | Max results to return |

### Example

```python
experience = anysite_post("/api/linkedin/user/experience", {
    "urn": "fsd_profile:ACoAABXy1234",
    "count": 50
})
for pos in experience:
    print(pos["company_name"], "-", pos["title"])
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `title` | string | Job title |
| `company_name` | string | Company name |
| `company_urn` | string | Company URN |
| `location` | string | Position location |
| `start_date` | string | Start date |
| `end_date` | string | End date (null if current) |
| `description` | string | Role description |

---

## Get User Honors

**`POST /api/linkedin/user/honors`**

Retrieve honors and awards. Cost: 1 credit.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `urn` | string | yes | User URN |
| `count` | integer | yes | Max results to return |

### Example

```python
honors = anysite_post("/api/linkedin/user/honors", {
    "urn": "fsd_profile:ACoAABXy1234",
    "count": 50
})
for honor in honors:
    print(honor["title"], "-", honor["issuer"])
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `title` | string | Award title |
| `issuer` | string | Issuing organization |
| `issued_on` | string | Date issued |
| `description` | string | Details |

---

## Get User Languages

**`POST /api/linkedin/user/languages`**

Retrieve languages. Cost: 1 credit.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `urn` | string | yes | User URN |
| `count` | integer | yes | Max results to return |

### Example

```python
languages = anysite_post("/api/linkedin/user/languages", {
    "urn": "fsd_profile:ACoAABXy1234",
    "count": 50
})
for lang in languages:
    print(lang["name"], "-", lang["proficiency"])
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `name` | string | Language name |
| `proficiency` | string | Proficiency level |

---

## Get User Patents

**`POST /api/linkedin/user/patents`**

Retrieve patents. Cost: 1 credit.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `urn` | string | yes | User URN |
| `count` | integer | yes | Max results to return |

### Example

```python
patents = anysite_post("/api/linkedin/user/patents", {
    "urn": "fsd_profile:ACoAABXy1234",
    "count": 50
})
for patent in patents:
    print(patent["title"], "-", patent["patent_number"])
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `title` | string | Patent title |
| `patent_number` | string | Patent number |
| `issuer` | string | Patent office |
| `issued_on` | string | Date issued |
| `url` | string | Patent URL |
| `description` | string | Patent description |

---

## Get User Posts

**`POST /api/linkedin/user/posts`**

Retrieve posts by a user. Accepts URN or profile URL. Cost: 1 credit per 10 results.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `urn` | string | yes | User URN (`fsd_profile:ACoAABXy1234`) or profile URL |
| `count` | integer | yes | Max results to return |
| `posted_after` | integer | no | Unix timestamp; only return posts after this time |

### Example

```python
posts = anysite_post("/api/linkedin/user/posts", {
    "urn": "fsd_profile:ACoAABXy1234",
    "count": 10
})
for post in posts:
    print(post["text"][:100])
    print(post["num_likes"], "likes,", post["num_comments"], "comments")
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `urn` | string | Post URN |
| `text` | string | Post content |
| `author_name` | string | Author name |
| `num_likes` | integer | Like count |
| `num_comments` | integer | Comment count |
| `num_shares` | integer | Share count |
| `created_at` | string | Post timestamp |
| `reactions` | object | Breakdown by reaction type |

---

## Get User Reactions

**`POST /api/linkedin/user/reactions`**

Retrieve posts a user has reacted to. Cost: 1 credit per 10 results.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `urn` | string | yes | User URN |
| `count` | integer | yes | Max results to return |

### Example

```python
reactions = anysite_post("/api/linkedin/user/reactions", {
    "urn": "fsd_profile:ACoAABXy1234",
    "count": 20
})
for reaction in reactions:
    print(reaction["reaction_type"], "-", reaction["post_urn"])
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `reaction_type` | string | Type (LIKE, CELEBRATE, LOVE, etc.) |
| `post_urn` | string | URN of the reacted post |
| `post_text` | string | Post content snippet |

---

## Get User Skills

**`POST /api/linkedin/user/skills`**

Retrieve skills. Cost: 1 credit.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `urn` | string | yes | User URN |
| `count` | integer | yes | Max results to return |

### Example

```python
skills = anysite_post("/api/linkedin/user/skills", {
    "urn": "fsd_profile:ACoAABXy1234",
    "count": 50
})
for skill in skills:
    print(skill["name"], "-", skill.get("endorsement_count", 0), "endorsements")
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `name` | string | Skill name |
| `endorsement_count` | integer | Number of endorsements |