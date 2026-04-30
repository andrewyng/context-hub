# LinkedIn Company Endpoints

All endpoints: `POST` to `https://api.anysite.io`. Require `access-token` header.

---

## Get Company

**`POST /api/linkedin/company`**

Retrieve company profile by alias, URL, or URN. Cost: 1 credit.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `company` | string | yes | Company slug, full LinkedIn company URL, or URN (e.g., `microsoft` or `company:1035`) |

### Example

```python
result = anysite_post("/api/linkedin/company", {
    "company": "microsoft"
})
company = result[0]
print(company["name"])
print("Employees:", company["employee_count"])
print("URN:", company["urn"]["type"], company["urn"]["value"])
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `name` | string | Company name |
| `urn` | object | Company URN object with `type` (e.g. `"fsd_company"`) and `value` (e.g. `"1035"`) |
| `alias` | string | URL slug |
| `url` | string | LinkedIn company URL |
| `description` | string | Company description |
| `short_description` | string | Brief company description |
| `employee_count` | integer | Total employees |
| `website` | string | Company website |
| `locations` | array | Office locations (objects with `name`, `is_headquarter`, `location`, `postal_code`, `country_code`, `city`, `latitude`, `longitude`) |
| `founded_on` | string | Founding date |
| `phone` | string | Company phone number |
| `logo_url` | string | Logo image URL |
| `organizational_urn` | string | Organizational URN |
| `page_verification_status` | string | Page verification status |

---

## Get Company Employee Stats

**`POST /api/linkedin/company/employee_stats`**

Retrieve employee distribution statistics by function, seniority, and growth trends. Cost: 1 credit.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `urn` | object | yes | Company URN object, e.g. `{"type": "company", "value": "1035"}` |

### Example

```python
stats = anysite_post("/api/linkedin/company/employee_stats", {
    "urn": {"type": "company", "value": "1035"}
})
for loc in stats[0]["locations"]:
    print(loc["name"], "-", loc["count"])
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `locations` | array | Employee count by location (objects with `name` and `count`) |

---

## Get Company Employees

**`POST /api/linkedin/company/employees`**

Retrieve a list of employees for one or more companies. Cost: 150 credits per 100 results.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `companies` | array[string] | yes | List of company URNs in format `company:{id}` |
| `count` | integer | yes | Max results to return |
| `keywords` | string | no | Filter employees by keyword |
| `first_name` | string | no | Filter by first name |
| `last_name` | string | no | Filter by last name |

### Example

```python
employees = anysite_post("/api/linkedin/company/employees", {
    "companies": ["company:1035"],
    "count": 50
})
for emp in employees:
    print(emp["name"])
    print(emp["urn"])   # {"type": "fsd_profile", "value": "..."}
    print(emp["url"])
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `name` | string | Employee name |
| `urn` | object | User URN object with `type` (e.g. `"fsd_profile"`) and `value` |
| `internal_id` | object | Internal ID object with `type` (e.g. `"member"`) and `value` |
| `url` | string | LinkedIn profile URL |
| `image` | string | Profile image URL |

---

## Get Company Posts

**`POST /api/linkedin/company/posts`**

Retrieve posts from a company page. Supports date filtering. Cost: 1 credit per 10 results.

### Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `urn` | object | yes | Company URN object, e.g. `{"type": "company", "value": "1035"}` |
| `count` | integer | yes | Max results to return |

### Example

```python
posts = anysite_post("/api/linkedin/company/posts", {
    "urn": {"type": "company", "value": "1035"},
    "count": 10
})
for post in posts:
    print(post["url"])
    print(post["share_url"])
    print(post["author"]["name"])
    print(post["created_at"])
```

### Response Fields

| Field | Type | Description |
|---|---|---|
| `urn` | object | Post URN object with `type` and `value` |
| `url` | string | Post URL |
| `share_url` | string | Shareable post URL |
| `author` | object | Author object with `name`, `url`, etc. |
| `created_at` | integer | Post timestamp (unix) |
| `share_urn` | string | Share URN |
| `is_empty_repost` | boolean | Whether this is an empty repost |