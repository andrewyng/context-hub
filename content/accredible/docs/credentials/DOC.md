---
name: credentials
description: "Digital credential platform API for issuing, managing, and verifying certificates and badges — covers credential CRUD, bulk operations, search, and group management"
metadata:
  languages: "http"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-12"
  source: community
  tags: "accredible,credentials,badges,certificates,api,rest"
---

# Accredible Credentials API

Issue, manage, and verify digital credentials (certificates and badges).

## Base URLs

```
https://api.accredible.com/          # Production (US)
https://eu.api.accredible.com/       # Production (EU)
https://sandbox.api.accredible.com/  # Sandbox (testing — no real credentials issued)
```

Use sandbox for development. Switch to production when ready.

## Authentication

All requests require a static API key in the `Authorization` header:

```
Authorization: Token token=YOUR_API_KEY
```

API keys are created in the Accredible dashboard under Settings > API Keys. Keys can be scoped to the full account or a specific department.

## Rate Limits

- 2000 requests per 5 minutes from a single IP
- Counted in 30-second windows
- Exceeding returns HTTP 429

---

## Create Credential

```
POST /v1/credentials
```

Issues a single credential to a recipient.

### Request

```json
{
  "credential": {
    "group_id": 12345,
    "recipient": {
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  }
}
```

**Required fields:**

| Field | Type | Description |
|-------|------|-------------|
| `credential.group_id` | number | Group (template) ID from dashboard |
| `credential.recipient.name` | string | Recipient full name |
| `credential.recipient.email` | string | Recipient email address |

**Common optional fields:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `credential.issued_on` | string | today | Issue date (`YYYY-MM-DD`) |
| `credential.expired_on` | string | null | Expiry date (`YYYY-MM-DD`) |
| `credential.complete` | boolean | true | Whether achievement is complete |
| `credential.approve` | boolean | true | Publish immediately on creation |
| `credential.private` | boolean | false | Hide from public directory |
| `credential.custom_attributes` | object | null | Key-value pairs for design placeholders |
| `credential.meta_data` | object | null | Structured metadata (not displayed) |
| `credential.recipient.phone_number` | string | null | E.164 format (e.g., `"+14155552671"`) |
| `credential.recipient.id` | string | null | Your internal ID for the recipient |

**Full example with optional fields:**

```json
{
  "credential": {
    "group_id": 12345,
    "recipient": {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "id": "EMP-4821"
    },
    "issued_on": "2026-03-01",
    "custom_attributes": {
      "Course": "Advanced Tutoring",
      "Location": "Pittsburgh"
    },
    "approve": true
  }
}
```

### Response (200)

```json
{
  "credential": {
    "id": 98765,
    "name": "Advanced Tutoring Certificate",
    "description": "Awarded for completing...",
    "url": "https://www.credential.net/abc123",
    "encoded_id": "abc123",
    "group_id": 12345,
    "group_name": "advanced-tutoring",
    "issued_on": "2026-03-01",
    "expired_on": null,
    "complete": true,
    "approve": true,
    "private": false,
    "seo_image": "https://...",
    "certificate": {
      "image": { "preview": "https://..." }
    },
    "badge": {
      "image": { "preview": "https://..." }
    },
    "recipient": {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone_number": null,
      "id": "EMP-4821",
      "meta_data": null
    },
    "issuer": {
      "name": "Your Organization",
      "url": "https://yourorg.com",
      "id": 456
    },
    "custom_attributes": {
      "Course": "Advanced Tutoring",
      "Location": "Pittsburgh"
    },
    "meta_data": null,
    "evidence_items": [],
    "references": []
  }
}
```

**Key response fields:**

| Field | Description |
|-------|-------------|
| `credential.id` | Numeric ID — use for update/delete operations |
| `credential.url` | Public verification URL (e.g., `https://www.credential.net/abc123`) |
| `credential.encoded_id` | Short ID used in the URL |
| `credential.badge.image.preview` | Badge image URL |
| `credential.certificate.image.preview` | Certificate image URL |

---

## Get Credential

```
GET /v1/credentials/{id}
```

Retrieve a single credential by numeric ID.

### Response (200)

Same shape as the create response.

---

## Update Credential

```
PUT /v1/credentials/{id}
```

Update a credential's fields. Send only the fields you want to change.

### Request

```json
{
  "credential": {
    "name": "Updated Name",
    "custom_attributes": {
      "Location": "New York"
    }
  }
}
```

---

## Delete Credential

```
DELETE /v1/credentials/{id}
```

Permanently deletes a credential. The public verification URL will no longer work.

### Response (200)

```json
{
  "credential": { ... }
}
```

---

## Search Credentials

```
POST /v1/credentials/search
```

Search across all credentials in your account.

### Request

```json
{
  "group_id": 12345,
  "recipient_email": "jane@example.com"
}
```

Filter fields include: `group_id`, `recipient_email`, `recipient_name`, `issued_on`, `expired_on`.

---

## Bulk Create Credentials

### v1 (up to 100)

```
POST /v1/credentials/bulk_create
```

### v2 (up to 30, with partial success support)

```
POST /v2/credentials/bulk_create
```

### Request

```json
{
  "credentials": [
    {
      "group_id": 12345,
      "recipient": { "name": "Jane Smith", "email": "jane@example.com" }
    },
    {
      "group_id": 12345,
      "recipient": { "name": "John Doe", "email": "john@example.com" }
    }
  ]
}
```

### Response codes

| Status | Meaning |
|--------|---------|
| 200 | All credentials created successfully |
| 207 | Mixed results (v2 only) — some succeeded, some failed |
| 422 | All credentials failed validation |

---

## Evidence Items

Attach evidence (files or URLs) to a credential at creation time:

```json
{
  "credential": {
    "group_id": 12345,
    "recipient": { "name": "Jane Smith", "email": "jane@example.com" },
    "evidence_items": [
      {
        "description": "Project portfolio",
        "category": "url",
        "url": "https://portfolio.example.com"
      },
      {
        "description": "Completion certificate scan",
        "category": "file",
        "file": "https://storage.example.com/cert.pdf"
      }
    ]
  }
}
```

---

## Common Patterns

### Issue and get the verification URL

```python
import requests

API_KEY = "your_api_key"
BASE_URL = "https://api.accredible.com"

resp = requests.post(
    f"{BASE_URL}/v1/credentials",
    headers={"Authorization": f"Token token={API_KEY}"},
    json={
        "credential": {
            "group_id": 12345,
            "recipient": {
                "name": "Jane Smith",
                "email": "jane@example.com"
            }
        }
    }
)

credential = resp.json()["credential"]
verification_url = credential["url"]       # https://www.credential.net/abc123
credential_id = credential["id"]           # 98765 (for future update/delete)
badge_image = credential["badge"]["image"]["preview"]
```

### Issue in Java (HttpsURLConnection)

```java
URL url = URI.create("https://api.accredible.com/v1/credentials").toURL();
HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
conn.setRequestProperty("Authorization", "Token token=" + apiKey);
conn.setRequestProperty("Content-Type", "application/json");
conn.setRequestMethod("POST");
conn.setDoOutput(true);

JSONObject recipient = new JSONObject();
recipient.put("name", recipientName);
recipient.put("email", recipientEmail);

JSONObject credential = new JSONObject();
credential.put("group_id", groupId);
credential.put("recipient", recipient);

JSONObject body = new JSONObject();
body.put("credential", credential);

try (OutputStream os = conn.getOutputStream()) {
    os.write(body.toString().getBytes("UTF-8"));
}

// Read response
JSONObject response = new JSONObject(readStream(conn.getInputStream()));
String verificationUrl = response.getJSONObject("credential").getString("url");
int credentialId = response.getJSONObject("credential").getInt("id");
```

### Delete (revoke) a credential

```python
resp = requests.delete(
    f"{BASE_URL}/v1/credentials/{credential_id}",
    headers={"Authorization": f"Token token={API_KEY}"}
)
```

## Error Responses

| Status | Meaning |
|--------|---------|
| 401 | Invalid or missing API key |
| 404 | Credential or group not found |
| 422 | Validation error (missing required fields, invalid email, etc.) |
| 429 | Rate limit exceeded — retry after the window resets |
