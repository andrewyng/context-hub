# Gradium Pronunciations API Reference

## Create Pronunciation Dictionary

**`POST /pronunciations/`**

**Content-Type:** `application/json`

```json
{
  "name": "tech-terms",
  "language": "en",
  "description": "Technical term pronunciations",
  "rules": [
    {"original": "API", "rewrite": "A P I", "case_sensitive": true},
    {"original": "SQL", "rewrite": "sequel", "case_sensitive": true},
    {"original": "nginx", "rewrite": "engine x", "case_sensitive": false}
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Dictionary name |
| `language` | string | Yes | Language code (e.g., `en`, `fr`, `de`, `es`, `pt`) |
| `description` | string | No | Dictionary description |
| `rules` | array | No | Pronunciation rules (default: empty) |

**Rule fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `original` | string | Yes | Text to match |
| `rewrite` | string | Yes | Replacement pronunciation |
| `case_sensitive` | boolean | No | Case-sensitive matching (default: false) |

**Response (201):**
```json
{
  "uid": "dict_abc123",
  "name": "tech-terms",
  "description": "Technical term pronunciations",
  "language": "en",
  "org_uid": "org_uuid",
  "created_at": "2026-03-10T12:00:00Z",
  "rules": [
    {"uid": "rule_1", "original": "API", "rewrite": "A P I", "case_sensitive": true}
  ]
}
```

---

## List Pronunciation Dictionaries

**`GET /pronunciations/`**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | int | 100 | Maximum results (max: 1000) |
| `offset` | int | 0 | Number of results to skip |
| `language` | string | — | Filter by language |

**Response (200):**
```json
{
  "dictionaries": [...],
  "total": 5
}
```

---

## Get Pronunciation Dictionary

**`GET /pronunciations/{uid}`**

Returns the full dictionary with all rules.

---

## Update Pronunciation Dictionary

**`PUT /pronunciations/{uid}`**

**Content-Type:** `application/json`

All fields are optional:

```json
{
  "name": "updated-name",
  "description": "Updated description",
  "language": "fr",
  "rules": [
    {"original": "bonjour", "rewrite": "bon jour"}
  ]
}
```

---

## Delete Pronunciation Dictionary

**`DELETE /pronunciations/{uid}`**

**Response:** 204 No Content

---

## Using Pronunciation Dictionaries with TTS

Pass the dictionary UID in the TTS setup or POST request via `pronunciation_id`:

```json
{
  "type": "setup",
  "voice_id": "YTpq7expH9539ERJ",
  "model_name": "default",
  "output_format": "wav",
  "pronunciation_id": "dict_abc123"
}
```
