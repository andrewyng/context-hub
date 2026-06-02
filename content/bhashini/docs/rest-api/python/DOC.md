---
name: rest-api
description: "Bhashini - Indian Government Indic Language Platform (ASR, Translation, TTS)"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: community
  tags: "bhashini,indian-languages,indic,speech-to-text,translation,text-to-speech,asr,nmt,tts,government,meity,api,integration"
---

# Bhashini API

> **Golden Rule:** Bhashini is the Indian government's language technology platform (MeitY). It has no official Python SDK. Use `httpx` for direct REST access. The ULCA/Dhruva Pipeline API is **free** but requires a 2-phase auth flow: first get config (returns dynamic auth + service IDs), then call compute. Supports 22 Indian languages.

## Installation

```bash
pip install httpx
```

## Base URLs

| Step | URL |
|---|---|
| Pipeline Config | `https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline` |
| Pipeline Compute | `https://dhruva-api.bhashini.gov.in/services/inference/pipeline` |

**Important:** The compute URL is returned dynamically in the config response as `callbackUrl`. Always use the returned URL.

## Authentication

**Type:** Two-phase (ULCA credentials → dynamic auth token)

```python
import httpx

USER_ID = "your-ulca-user-id"      # From bhashini.gov.in/ulca/profile
ULCA_API_KEY = "your-ulca-api-key"  # Generate at profile page (max 5 keys)

CONFIG_URL = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline"

# Phase 1: Config call uses ULCA credentials
config_headers = {
    "userID": USER_ID,
    "ulcaApiKey": ULCA_API_KEY,
    "Content-Type": "application/json"
}

client = httpx.AsyncClient(timeout=60.0)
```

Register free at: https://bhashini.gov.in/ulca/user/register

## Supported Languages

All 22 scheduled languages of India plus English. Common codes:

| Language | Code | Language | Code |
|---|---|---|---|
| Hindi | `hi` | Tamil | `ta` |
| Bengali | `bn` | Telugu | `te` |
| Gujarati | `gu` | Kannada | `kn` |
| Marathi | `mr` | Malayalam | `ml` |
| Punjabi | `pa` | Odia | `or` |
| Urdu | `ur` | Assamese | `as` |
| English | `en` | Nepali | `ne` |

Also: Bodo (`brx`), Dogri (`doi`), Maithili (`mai`), Manipuri (`mni`), Santali (`sat`), Sanskrit (`sa`), Sindhi (`sd`), Kashmiri (`ks`), Konkani (`gom`)

## Methods

### `get_pipeline_config` (Step 1 — Required)

**Endpoint:** `POST https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline`

Get available models and dynamic auth credentials for pipeline tasks. Must be called before any compute request.

| Parameter | Type | Default |
|---|---|---|
| `pipelineTasks` | `list` | **required** (task types: `asr`, `translation`, `tts`) |
| `pipelineRequestConfig.pipelineId` | `str` | **required** (`64392f96daac500b55c543cd` for MeitY) |

**Returns:** JSON with available models, service IDs, and `pipelineInferenceAPIEndPoint` (contains `callbackUrl` and `inferenceApiKey`)

```python
config_payload = {
    "pipelineTasks": [
        {"taskType": "translation", "config": {
            "language": {"sourceLanguage": "hi", "targetLanguage": "en"}
        }}
    ],
    "pipelineRequestConfig": {
        "pipelineId": "64392f96daac500b55c543cd"
    }
}

response = await client.post(CONFIG_URL, json=config_payload, headers=config_headers)
response.raise_for_status()
config = response.json()

# Extract dynamic auth and compute URL
endpoint = config["pipelineInferenceAPIEndPoint"]
compute_url = endpoint["callbackUrl"]
auth_key = endpoint["inferenceApiKey"]
compute_headers = {
    auth_key["name"]: auth_key["value"],  # "Authorization": "<dynamic-token>"
    "Content-Type": "application/json"
}

# Extract service ID for translation
service_id = config["pipelineResponseConfig"][0]["config"][0]["serviceId"]
```

### `translate` (Step 2 — Compute)

**Endpoint:** `POST {callbackUrl}` (from config response)

Translate text between Indian languages.

```python
payload = {
    "pipelineTasks": [{
        "taskType": "translation",
        "config": {
            "language": {"sourceLanguage": "hi", "targetLanguage": "en"},
            "serviceId": service_id
        }
    }],
    "inputData": {
        "input": [{"source": "नमस्ते, आप कैसे हैं?"}],
        "audio": [{"audioContent": None}]
    }
}
response = await client.post(compute_url, json=payload, headers=compute_headers)
response.raise_for_status()
result = response.json()
translated = result["pipelineResponse"][0]["output"][0]["target"]
# "Hello, how are you?"
```

### `speech_to_text` (ASR Compute)

**Endpoint:** `POST {callbackUrl}`

Transcribe audio in any supported Indian language.

```python
import base64

with open("audio.wav", "rb") as f:
    audio_b64 = base64.b64encode(f.read()).decode()

payload = {
    "pipelineTasks": [{
        "taskType": "asr",
        "config": {
            "language": {"sourceLanguage": "hi"},
            "serviceId": asr_service_id,
            "audioFormat": "wav",
            "samplingRate": 16000
        }
    }],
    "inputData": {
        "input": [{"source": None}],
        "audio": [{"audioContent": audio_b64}]
    }
}
response = await client.post(compute_url, json=payload, headers=compute_headers)
response.raise_for_status()
result = response.json()
transcript = result["pipelineResponse"][0]["output"][0]["source"]
```

### `text_to_speech` (TTS Compute)

**Endpoint:** `POST {callbackUrl}`

Generate speech audio from text.

```python
payload = {
    "pipelineTasks": [{
        "taskType": "tts",
        "config": {
            "language": {"sourceLanguage": "ta"},
            "serviceId": tts_service_id,
            "gender": "female"
        }
    }],
    "inputData": {
        "input": [{"source": "வணக்கம், எப்படி இருக்கிறீர்கள்?"}],
        "audio": [{"audioContent": None}]
    }
}
response = await client.post(compute_url, json=payload, headers=compute_headers)
response.raise_for_status()
result = response.json()
audio_b64 = result["pipelineResponse"][0]["audio"][0]["audioContent"]
audio_bytes = base64.b64decode(audio_b64)
with open("output.wav", "wb") as f:
    f.write(audio_bytes)
```

### Full Pipeline (ASR → Translation → TTS)

Chain multiple tasks in a single compute call:

```python
# First get config for all 3 tasks
config_payload = {
    "pipelineTasks": [
        {"taskType": "asr", "config": {"language": {"sourceLanguage": "hi"}}},
        {"taskType": "translation", "config": {"language": {"sourceLanguage": "hi", "targetLanguage": "ta"}}},
        {"taskType": "tts", "config": {"language": {"sourceLanguage": "ta"}}}
    ],
    "pipelineRequestConfig": {"pipelineId": "64392f96daac500b55c543cd"}
}
# ... get config, extract service IDs ...

# Then compute full pipeline
payload = {
    "pipelineTasks": [
        {"taskType": "asr", "config": {"language": {"sourceLanguage": "hi"}, "serviceId": asr_sid, "audioFormat": "wav", "samplingRate": 16000}},
        {"taskType": "translation", "config": {"language": {"sourceLanguage": "hi", "targetLanguage": "ta"}, "serviceId": nmt_sid}},
        {"taskType": "tts", "config": {"language": {"sourceLanguage": "ta"}, "serviceId": tts_sid, "gender": "female"}}
    ],
    "inputData": {
        "input": [{"source": None}],
        "audio": [{"audioContent": audio_b64}]
    }
}
response = await client.post(compute_url, json=payload, headers=compute_headers)
response.raise_for_status()
# Result contains all 3 pipeline outputs
```

## Error Handling

```python
import httpx

try:
    response = await client.post(compute_url, json=payload, headers=compute_headers)
    response.raise_for_status()
    data = response.json()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        print("Auth failed -- re-fetch config to get fresh credentials")
    elif e.response.status_code == 429:
        print("Rate limited -- back off and retry")
    elif e.response.status_code == 400:
        print(f"Bad request: {e.response.text}")
    else:
        print(f"Bhashini API error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- **Two API calls required**: You MUST call config first to get dynamic auth credentials and service IDs before compute
- **Do NOT hardcode service IDs** -- they are dynamic and returned by the config endpoint
- **Auth tokens are temporary** -- if compute returns 401, re-fetch config for fresh credentials
- Audio is **base64-encoded** in both request (ASR input) and response (TTS output)
- ASR supports `wav` and `flac` formats at 16000 Hz sampling rate
- TTS gender options: `"male"` or `"female"`
- Language codes use ISO 639 format: `hi` (Hindi), `ta` (Tamil), `bn` (Bengali) -- NOT BCP-47 (`hi-IN`)
- Pipeline ID `64392f96daac500b55c543cd` (MeitY) or `643930aa521a4b1ba0f4c41d` (AI4Bharat)
- The ULCA platform is described as "for PoC" -- contact Bhashini for production access
- Set `timeout=60.0` -- speech processing can be slow
- Registration is free at https://bhashini.gov.in/ulca/user/register (max 5 API keys per account)
