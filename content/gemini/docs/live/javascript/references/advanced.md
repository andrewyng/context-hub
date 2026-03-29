# Gemini Live API — Advanced Topics (JavaScript/TypeScript)

## Raw WebSocket API (No SDK)

For environments where the SDK is unavailable, connect directly via WebSocket.

### Endpoint

**Server-side only.** Never embed your API key in client-side code. For
browser clients, use ephemeral tokens (see below).

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

## Ephemeral Tokens

Short-lived tokens for direct browser-to-API connections. Created server-side
(typically in Python or Node.js backend), passed to the browser client.

### Browser WebSocket Endpoint (with ephemeral token)

```
wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained?access_token={token}
```

### Browser Usage Example

```typescript
// Token received from your backend (endpoint must be authenticated + rate-limited)
const ephemeralToken = await fetch('/api/gemini-token').then(r => r.json());

const ws = new WebSocket(
    `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained?access_token=${ephemeralToken.token}`
);

ws.onopen = () => {
    ws.send(JSON.stringify({
        config: {
            model: 'models/gemini-3.1-flash-live-preview',
            responseModalities: ['AUDIO'],
        },
    }));
};
```

Tokens can be locked to specific configurations with `liveConnectConstraints`
for additional security.

## Async Function Calling (Gemini 2.5 Flash Live Only)

**Not supported on Gemini 3.1 Flash Live.** Allows the model to continue
interacting while a function runs in the background.

Set `behavior: 'NON_BLOCKING'` on the function declaration:

```typescript
tools: [{
    functionDeclarations: [{
        name: 'slowLookup',
        description: 'A slow database lookup',
        parameters: { type: 'object', properties: { query: { type: 'string' } } },
        behavior: 'NON_BLOCKING',
    }],
}]
```

When sending the function response, set `scheduling`:

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
| `sendClientContent` | Initial history only | Throughout conversation |
| Turn coverage default | `TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO` | `TURN_INCLUDES_ONLY_ACTIVITY` |
| Async function calling | No | Yes (`NON_BLOCKING`) |
| Proactive audio (v1alpha) | No | Yes |
| Affective dialog (v1alpha) | No | Yes |
| Context window | 128k tokens | 32k tokens |
