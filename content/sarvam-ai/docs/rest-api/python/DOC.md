---
name: rest-api
description: "Sarvam AI - Indian Language AI APIs (STT, TTS, Translation, LLM)"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: community
  tags: "sarvam,indian-languages,indic,speech-to-text,text-to-speech,translation,transliteration,llm,hindi,tamil,api,integration"
---

# Sarvam AI API

> **Golden Rule:** Sarvam AI provides Indian language AI APIs covering speech, translation, and LLM chat. A Python SDK (`sarvamai`) exists on PyPI, but you can also use `httpx` for direct REST access. Most endpoints use `api-subscription-key` header; the chat endpoint uses `Bearer` token. Free ₹1,000 credits on signup.

## Installation

```bash
pip install httpx
# Or use the official SDK: pip install -U sarvamai
```

## Base URL

`https://api.sarvam.ai`

## Authentication

**Type:** API Subscription Key (custom header)

```python
import httpx

API_KEY = "your-sarvam-api-key"  # From dashboard.sarvam.ai
BASE_URL = "https://api.sarvam.ai"

# For most endpoints (STT, TTS, Translation, etc.)
headers = {"api-subscription-key": API_KEY}
client = httpx.AsyncClient(headers=headers, timeout=60.0)

# For chat/LLM endpoint — use Bearer token instead
chat_headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}
```

## Rate Limiting

| Plan | Requests/min | Cost |
|---|---|---|
| Starter | 60 | Pay-as-you-go |
| Pro | 200 | ₹10,000 |
| Business | 1,000 | ₹50,000 |

All accounts get ₹1,000 free credits (never expire). Chat LLM is currently free.

## Supported Languages

Hindi (`hi-IN`), Bengali (`bn-IN`), Gujarati (`gu-IN`), Kannada (`kn-IN`), Malayalam (`ml-IN`), Marathi (`mr-IN`), Odia (`od-IN`), Punjabi (`pa-IN`), Tamil (`ta-IN`), Telugu (`te-IN`), English (`en-IN`). Extended models support 22 Indian languages total.

## Methods

### `translate`

**Endpoint:** `POST /translate`

Translate text between Indian languages and English.

| Parameter | Type | Default |
|---|---|---|
| `input` | `str` | **required** (max 2000 chars) |
| `source_language_code` | `str` | **required** (`auto` for auto-detect) |
| `target_language_code` | `str` | **required** (e.g., `hi-IN`) |
| `model` | `str` | `mayura:v1` (or `sarvam-translate:v1` for 22 langs) |
| `mode` | `str` | `formal` (also: `modern-colloquial`, `classic-colloquial`, `code-mixed`) |
| `speaker_gender` | `str` | `None` (`Male` or `Female`) |

**Returns:** JSON with `translated_text`

```python
payload = {
    "input": "Hello, how are you?",
    "source_language_code": "auto",
    "target_language_code": "hi-IN",
    "model": "mayura:v1",
    "mode": "formal"
}
response = await client.post(f"{BASE_URL}/translate", json=payload)
response.raise_for_status()
data = response.json()
translated = data["translated_text"]  # "नमस्ते, आप कैसे हैं?"
```

### `speech_to_text`

**Endpoint:** `POST /speech-to-text`

Transcribe audio in Indian languages. Supports WAV, MP3, OGG, FLAC, and more.

| Parameter | Type | Default |
|---|---|---|
| `file` | `binary` | **required** (audio file, max 30s for REST) |
| `model` | `str` | `saaras:v3` (recommended) |
| `language_code` | `str` | `unknown` (auto-detect) |
| `mode` | `str` | `transcribe` (also: `translate`, `verbatim`, `translit`) |

**Returns:** JSON with `transcript`, `language_code`, `language_probability`

```python
with open("audio.wav", "rb") as f:
    files = {"file": ("audio.wav", f, "audio/wav")}
    data = {"model": "saaras:v3", "language_code": "hi-IN"}
    response = await client.post(
        f"{BASE_URL}/speech-to-text",
        files=files, data=data,
        headers={"api-subscription-key": API_KEY}
    )
response.raise_for_status()
result = response.json()
transcript = result["transcript"]
```

### `text_to_speech`

**Endpoint:** `POST /text-to-speech`

Convert text to speech in Indian languages. 38 voice options with bulbul:v3.

| Parameter | Type | Default |
|---|---|---|
| `text` | `str` | **required** (max 2500 chars) |
| `target_language_code` | `str` | **required** |
| `model` | `str` | `bulbul:v3` |
| `speaker` | `str` | `Shubh` (38 voices available) |
| `pace` | `float` | `1.0` (0.5-2.0) |
| `temperature` | `float` | `0.6` (0.01-2.0, expressiveness) |
| `speech_sample_rate` | `int` | `24000` |

**Returns:** JSON with `audios` array (base64-encoded audio)

```python
import base64

payload = {
    "text": "नमस्ते, मैं सर्वम हूँ",
    "target_language_code": "hi-IN",
    "model": "bulbul:v3",
    "speaker": "Shubh",
    "pace": 1.0
}
response = await client.post(f"{BASE_URL}/text-to-speech", json=payload)
response.raise_for_status()
data = response.json()
audio_bytes = base64.b64decode(data["audios"][0])
with open("output.wav", "wb") as f:
    f.write(audio_bytes)
```

### `transliterate`

**Endpoint:** `POST /transliterate`

Convert text between scripts while preserving pronunciation.

| Parameter | Type | Default |
|---|---|---|
| `input` | `str` | **required** |
| `source_language_code` | `str` | **required** (or `auto`) |
| `target_language_code` | `str` | **required** |
| `spoken_form` | `bool` | `False` |

**Returns:** JSON with `transliterated_text`

```python
payload = {
    "input": "namaste",
    "source_language_code": "en-IN",
    "target_language_code": "hi-IN"
}
response = await client.post(f"{BASE_URL}/transliterate", json=payload)
response.raise_for_status()
result = response.json()
# result["transliterated_text"] -> "नमस्ते"
```

### `detect_language`

**Endpoint:** `POST /text-lid`

Detect language and script of input text.

| Parameter | Type | Default |
|---|---|---|
| `input` | `str` | **required** (max 1000 chars) |

**Returns:** JSON with `language_code` and `script_code`

```python
payload = {"input": "नमस्ते दुनिया"}
response = await client.post(f"{BASE_URL}/text-lid", json=payload)
response.raise_for_status()
data = response.json()
# data["language_code"] -> "hi-IN", data["script_code"] -> "Deva"
```

### `chat_completion`

**Endpoint:** `POST /v1/chat/completions`

OpenAI-compatible chat endpoint with Sarvam's multilingual LLMs. Supports function calling, streaming, and wiki grounding.

| Parameter | Type | Default |
|---|---|---|
| `model` | `str` | **required** (`sarvam-30b`, `sarvam-105b`, etc.) |
| `messages` | `list` | **required** |
| `temperature` | `float` | `0.2` |
| `max_tokens` | `int` | `None` |
| `stream` | `bool` | `False` |
| `wiki_grounding` | `bool` | `False` |
| `tools` | `list` | `None` (function calling definitions) |

**Returns:** OpenAI-compatible JSON with `choices` array

```python
payload = {
    "model": "sarvam-30b",
    "messages": [
        {"role": "system", "content": "You are a helpful assistant fluent in Indian languages."},
        {"role": "user", "content": "भारत की राजधानी क्या है?"}
    ],
    "temperature": 0.3,
    "wiki_grounding": True
}
response = await client.post(
    f"{BASE_URL}/v1/chat/completions",
    json=payload,
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
)
response.raise_for_status()
data = response.json()
reply = data["choices"][0]["message"]["content"]
```

## Error Handling

```python
import httpx

try:
    response = await client.post(f"{BASE_URL}/translate", json=payload)
    response.raise_for_status()
    data = response.json()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 403:
        print("Authentication failed -- check your API key")
    elif e.response.status_code == 429:
        print("Rate limited or quota exceeded -- back off and retry")
    elif e.response.status_code == 422:
        print(f"Validation error: {e.response.text}")
    else:
        print(f"Sarvam API error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- Most endpoints use `api-subscription-key` header, but chat uses `Authorization: Bearer` -- don't mix them up
- Speech-to-text REST API is limited to 30 seconds of audio -- use Batch API for longer files
- TTS returns base64-encoded audio in the `audios` array -- decode with `base64.b64decode()`
- Text-to-speech max input: 2500 chars (v3) or 1500 chars (v2) -- split longer text
- Translation max input: 2000 chars (sarvam-translate) or 1000 chars (mayura)
- Use `language_code: "unknown"` for auto-detection in STT
- Use `source_language_code: "auto"` for auto-detection in translation
- Set `timeout=60.0` on your client -- speech processing can be slow
- Language codes use BCP-47 format: `hi-IN` (Hindi), `ta-IN` (Tamil), `te-IN` (Telugu), etc.
- Chat LLM is currently free; other APIs use ₹-based credit system
