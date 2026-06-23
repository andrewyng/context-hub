# Gradium Voices API Reference

## Clone Voice

**`POST /api/voice/clone`**

Clone a voice by uploading a raw audio file. This is the simplest way to create a custom voice — just send the audio bytes directly as the request body.

**Response (200):**
```json
{
  "voice_id": "abc123def456"
}
```

```javascript
// Browser: from a recorded Blob
const file = new File([wavBlob], "recording.wav", { type: "audio/wav" });
const response = await fetch("https://eu.api.gradium.ai/api/voice/clone", {
    method: "POST",
    headers: { "x-api-key": gradiumApiKey },
    body: file,
});
const { voice_id } = await response.json();
```

```javascript
// Server-side (e.g., Next.js API route)
const formData = await req.formData();
const file = formData.get("audio");
const apiKey = req.headers.get("x-gradium-api-key") || process.env.GRADIUM_API_KEY;

const gradiumRes = await fetch("https://eu.api.gradium.ai/api/voice/clone", {
    method: "POST",
    headers: { "x-api-key": apiKey },
    body: file,
});
const { voice_id } = await gradiumRes.json();
```

---

## Create Voice (with metadata)

**`POST /voices/`**

Create a custom voice from an audio file upload. **Minimum audio sample: 10 seconds** of clear speech.

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `audio_file` | file | Yes | Audio file for voice cloning |
| `name` | string | Yes | Voice name |
| `input_format` | string | No | Audio format of the uploaded file |
| `description` | string | No | Voice description |
| `language` | string | No | Voice language |
| `start_s` | number | No | Start time in the audio file (default: 0) |
| `timeout_s` | number | No | Processing timeout (default: 10) |

**Response (201):**
```json
{
  "uid": "abc123",
  "name": "my-voice",
  "description": "Custom voice",
  "filename": "sample.wav",
  "start_s": 0,
  "is_catalog": false,
  "is_pro_clone": false,
  "language": "en",
  "tags": []
}
```

---

## List Voices

**`GET /voices/`**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `skip` | int | 0 | Number of voices to skip |
| `limit` | int | 100 | Maximum voices to return |
| `include_catalog` | bool | false | Include Gradium's built-in catalog voices |

**Response (200):** Array of voice objects.

---

## Get Voice

**`GET /voices/{voice_uid}`**

**Response (200):**
```json
{
  "uid": "YTpq7expH9539ERJ",
  "name": "Emma",
  "description": "English female voice",
  "filename": null,
  "start_s": null,
  "is_catalog": true,
  "is_pro_clone": false,
  "language": "en",
  "tags": [
    {"category": "gender", "value": "female"},
    {"category": "language", "value": "en"}
  ]
}
```

---

## Update Voice

**`PUT /voices/{voice_uid}`**

**Content-Type:** `application/json`

```json
{
  "name": "updated-name",
  "description": "Updated description",
  "language": "en"
}
```

All fields are optional. Only provided fields are updated.

---

## Delete Voice

**`DELETE /voices/{voice_uid}`**

**Response:** 204 No Content

---

## Voice Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Unique voice identifier (use as `voice_id` in TTS) |
| `name` | string | Voice name |
| `description` | string/null | Voice description |
| `filename` | string/null | Original upload filename |
| `start_s` | number/null | Start offset in source audio |
| `is_catalog` | boolean | Whether this is a Gradium built-in voice |
| `is_pro_clone` | boolean | Whether this is a professional clone |
| `language` | string/null | Voice language code |
| `tags` | array | Tags with `category` and `value` fields |

---

## Flagship Voice Catalog

14 flagship voices across 5 languages, plus 200+ additional catalog voices.

| Name | Language |
|------|----------|
| Emma | US English |
| Kent | US English |
| Sydney | US English |
| John | US English |
| Eva | GB English |
| Jack | GB English |
| Elise | French |
| Leo | French |
| Mia | German |
| Maximilian | German |
| Valentina | Mexican Spanish |
| Sergio | Spanish |
| Alice | Brazilian Portuguese |
| Davi | Brazilian Portuguese |

Use `GET /voices/?include_catalog=true` to retrieve voice IDs for the full catalog.
