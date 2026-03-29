# Gemini Live API — Advanced Topics (Python)

## Raw WebSocket API (No SDK)

For environments where the SDK is unavailable, connect directly via WebSocket.

### Endpoint

```
wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=YOUR_API_KEY
```

### Setup Message (first message after connect)

```json
{
    "config": {
        "model": "models/gemini-3.1-flash-live-preview",
        "responseModalities": ["AUDIO"],
        "systemInstruction": {
            "parts": [{"text": "You are a helpful assistant."}]
        }
    }
}
```

### Sending Audio

```json
{
    "realtimeInput": {
        "audio": {
            "data": "<base64-encoded-pcm-16khz>",
            "mimeType": "audio/pcm;rate=16000"
        }
    }
}
```

### Sending Text

```json
{ "realtimeInput": { "text": "Hello, how are you?" } }
```

### Tool Response

```json
{
    "toolResponse": {
        "functionResponses": [
            { "name": "func_name", "id": "call_id", "response": { "result": "ok" } }
        ]
    }
}
```

### Server Message Fields

Responses are `BidiGenerateContentServerMessage` JSON:

| Field | Description |
|---|---|
| `serverContent.modelTurn.parts[].inlineData.data` | Base64 audio |
| `serverContent.inputTranscription.text` | User speech transcription |
| `serverContent.outputTranscription.text` | Model speech transcription |
| `serverContent.interrupted` | User interrupted the model |
| `serverContent.turnComplete` | Model finished its turn |
| `serverContent.generationComplete` | Generation fully complete |
| `toolCall.functionCalls[]` | Function calls (name, id, args) |
| `goAway.timeLeft` | Time before server disconnects |
| `sessionResumptionUpdate.newHandle` | Handle for session resumption |
| `usageMetadata.totalTokenCount` | Token usage |

## Ephemeral Tokens

Short-lived tokens for direct browser-to-API connections without exposing the
API key. Created server-side, passed to the client.

```python
import datetime
from google import genai

# Must use v1alpha for ephemeral tokens
client = genai.Client(http_options={"api_version": "v1alpha"})

now = datetime.datetime.now(tz=datetime.timezone.utc)
token = client.auth_tokens.create(config={
    "uses": 1,
    "expire_time": now + datetime.timedelta(minutes=30),
    "new_session_expire_time": now + datetime.timedelta(minutes=1),
    "http_options": {"api_version": "v1alpha"},
})

# token.name is the ephemeral token string
# Pass to client for WebSocket connection:
# wss://...BidiGenerateContentConstrained?access_token={token.name}
```

Tokens can be locked to specific configurations with `live_connect_constraints`
for additional security.

### Ephemeral Token WebSocket Endpoint

```
wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained?access_token={token}
```

## Async Function Calling (Gemini 2.5 Flash Live Only)

**Not supported on Gemini 3.1 Flash Live.** Allows the model to continue
interacting while a function executes in the background.

Set `behavior: "NON_BLOCKING"` on the function declaration:

```python
tools = [{
    "function_declarations": [{
        "name": "slow_lookup",
        "description": "A slow database lookup",
        "parameters": {"type": "object", "properties": {"query": {"type": "string"}}},
        "behavior": "NON_BLOCKING",
    }]
}]
```

When sending the `FunctionResponse`, set a `scheduling` field:

| Scheduling | Behavior |
|---|---|
| `INTERRUPT` | Model interrupts current output to address result |
| `WHEN_IDLE` | Model addresses result after finishing current output |
| `SILENT` | Model absorbs result silently for later use |

## Model Feature Comparison

| Feature | 3.1 Flash Live | 2.5 Flash Live |
|---|---|---|
| Thinking config | `thinkingLevel` (minimal/low/medium/high) | `thinkingBudget` (token count) |
| Response events | Single event, multiple parts | Each event, one part |
| `send_client_content` | Initial history only | Throughout conversation |
| Turn coverage default | `TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO` | `TURN_INCLUDES_ONLY_ACTIVITY` |
| Async function calling | No | Yes (`NON_BLOCKING`) |
| Proactive audio (v1alpha) | No | Yes (`proactive_audio: true`) |
| Affective dialog (v1alpha) | No | Yes (`enable_affective_dialog: true`) |
| Context window | 128k tokens | 32k tokens |

## Session Limits

| Constraint | Value |
|---|---|
| Audio-only session | 15 min |
| Audio + video session | 2 min |
| WebSocket connection | ~10 min (use session resumption) |
| Context window (native audio) | 128k tokens |
| Audio token accumulation | ~25 tokens/second |
| Supported languages | 97 |
