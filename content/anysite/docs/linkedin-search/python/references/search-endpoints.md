# LinkedIn Search Endpoints

All endpoints: `POST` to `https://api.anysite.io`. Require `access-token` header.

---

## Search Companies

**`POST /api/linkedin/search/companies`**

Search for LinkedIn companies. Cost: 1 credit per 10 results.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `keywords` | string | no | Search keywords (company name, industry, etc.) |
| `location` | array or string | no | Location filter |
| `industry` | array or string | no | Industry filter |
| `employee_count` | array[string] | no | Employee count filter. Values: `"1-10"`, `"11-50"`, `"51-200"`, `"201-500"`, `"501-1000"`, `"1001-5000"`, `"5001-10000"`, `"10001+"` |
| `count` | integer | yes | Max results to return |

### Example

```python
results = anysite_post("/api/linkedin/search/companies", {
    "keywords": "artificial intelligence",
    "location": "San Francisco",
    "employee_count": ["51-200", "201-500"],
    "count": 20
})
for company in results:
    print(company["name"], "-", company["alias"])
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `name` | string | Company name |
| `alias` | string | Company URL slug |
| `url` | string | LinkedIn company URL |
| `urn` | object | Company URN object with `type` and `value` |
| `image` | string | Company logo URL |
| `industry` | string | Company industry |

---

## Search Educations

**`POST /api/linkedin/search/educations`**

Search for educational institutions (for use as filter values). Cost: 1 credit.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Search keywords (school name) |
| `count` | integer | yes | Max results to return |

### Example

```python
results = anysite_post("/api/linkedin/search/educations", {
    "name": "Stanford",
    "count": 10
})
for school in results:
    print(school["name"], "-", school["urn"])
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `name` | string | Institution name |
| `urn` | string | Education URN |

---

## Search Industries

**`POST /api/linkedin/search/industries`**

Search for LinkedIn industries (for use as filter values). Cost: 1 credit.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Search keywords (industry name) |
| `count` | integer | yes | Max results to return |

### Example

```python
results = anysite_post("/api/linkedin/search/industries", {
    "name": "software",
    "count": 10
})
for industry in results:
    print(industry["name"], "-", industry["urn"])
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `name` | string | Industry name |
| `urn` | string | Industry URN |

---

## Search Jobs

**`POST /api/linkedin/search/jobs`**

Search for LinkedIn job postings. Cost: 1 credit per 25 results.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `keywords` | string | no | Search keywords (job title, skill, etc.) |
| `location` | string | no | Location filter (default: `"worldwide"`) |
| `industry` | array or string | no | Industry filter |
| `company` | array | no | Company filter |
| `experience_level` | array | no | Experience level filter |
| `job_types` | array | no | Job type filter |
| `work_types` | array | no | Work type filter (remote, on-site, etc.) |
| `sort` | string | no | Sort order |
| `count` | integer | yes | Max results to return |

### Example

```python
jobs = anysite_post("/api/linkedin/search/jobs", {
    "keywords": "python developer",
    "location": "New York",
    "count": 25
})
for job in jobs:
    print(job["title"], "at", job["company_name"])
    print(job["location"])
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `title` | string | Job title |
| `company_name` | string | Hiring company |
| `company_urn` | string | Company URN |
| `location` | string | Job location |
| `url` | string | Job posting URL |
| `posted_at` | string | Posting date |
| `description` | string | Job description snippet |

---

## Search Locations

**`POST /api/linkedin/search/locations`**

Search for LinkedIn locations (for use as filter values). Cost: 1 credit.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Search keywords (city, region, country) |
| `count` | integer | yes | Max results to return |

### Example

```python
results = anysite_post("/api/linkedin/search/locations", {
    "name": "San Francisco",
    "count": 10
})
for loc in results:
    print(loc["name"], "-", loc["urn"])
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `name` | string | Location name |
| `urn` | string | Location URN |

---

## Search Posts

**`POST /api/linkedin/search/posts`**

Search for LinkedIn posts by keyword. Cost: 1 credit per 50 results.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `keywords` | string | no | Search keywords |
| `sort` | string | no | Sort order (default: `"relevance"`) |
| `date_posted` | string | no | Date filter (default: `"past-month"`) |
| `content_type` | string | no | Filter by content type |
| `author_title` | string | no | Filter by author's title |
| `count` | integer | yes | Max results to return |

### Example

```python
posts = anysite_post("/api/linkedin/search/posts", {
    "keywords": "generative AI startups",
    "count": 20
})
for post in posts:
    print(post["author_name"], ":", post["text"][:100])
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `urn` | string | Post URN |
| `text` | string | Post content |
| `author_name` | string | Author name |
| `author_urn` | string | Author URN |
| `num_likes` | integer | Like count |
| `num_comments` | integer | Comment count |
| `created_at` | string | Post timestamp |

---

## Search Users

**`POST /api/linkedin/search/users`**

Search for LinkedIn users with multiple filters. Cost: 1 credit per 10 results.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `keywords` | string | no | General search keywords |
| `first_name` | string | no | Filter by first name |
| `last_name` | string | no | Filter by last name |
| `title` | string | no | Filter by job title |
| `company_keywords` | string | no | Filter by company keywords |
| `school_keywords` | string | no | Filter by school/education keywords |
| `current_company` | array or string | no | Filter by current company (URN or name) |
| `past_company` | array or string | no | Filter by past company (URN or name) |
| `location` | array or string | no | Filter by location |
| `industry` | array or string | no | Filter by industry |
| `education` | array or string | no | Filter by education institution |
| `count` | integer | yes | Max results to return |

### Example

```python
results = anysite_post("/api/linkedin/search/users", {
    "keywords": "machine learning",
    "title": "Senior Engineer",
    "current_company": "Google",
    "location": "San Francisco Bay Area",
    "count": 20
})
for user in results:
    print(user["name"], "-", user["headline"])
    print(user["urn"])
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `name` | string | Full name |
| `alias` | string | Username slug |
| `url` | string | LinkedIn profile URL |
| `urn` | object | User URN object with `type` (e.g. `"fsd_profile"`) and `value` |
| `internal_id` | object | Internal ID object with `type` (e.g. `"member"`) and `value` |
| `headline` | string | Profile headline |
| `location` | string | Location |
| `image` | string | Avatar URL |
| `open_to_work` | boolean | Whether user is open to work |