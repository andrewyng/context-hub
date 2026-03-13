---
name: acs-voice
description: "Azure Communication Services (ACS) Voice — real-time AI voice bots with call handling, agent transfer, and outbound calls using azure-communication-callautomation"
metadata:
  languages: "python"
  versions: "1.4.0"
  updated-on: "2026-03-10"
  source: community
  tags: "azure,acs,voice,callautomation,voicebot,telephony,ai"
---

# Azure Communication Services (ACS) Voice — Python Guidelines

You are an ACS Voice coding expert. Help me build AI voice bots using Azure Communication Services Call Automation SDK.

Official docs: https://learn.microsoft.com/en-us/azure/communication-services/concepts/call-automation/call-automation

## Installation

```bash
pip install azure-communication-callautomation
pip install azure-eventgrid
```

## Key Concepts

- **ACS** handles the telephony layer (phone calls, PSTN, VoIP)
- **Call Automation SDK** lets you programmatically control calls (answer, transfer, play audio, recognize speech)
- **Azure AI Voice Live** (preview) — streams audio to/from an OpenAI Realtime API model for natural conversation
- Your backend receives events via **webhooks** (EventGrid or direct callback URL)
- **CallbackUrl** must be a publicly reachable HTTPS endpoint for ACS to POST call events to

## Initialization

```python
from azure.communication.callautomation import CallAutomationClient

client = CallAutomationClient.from_connection_string(
    os.environ["ACS_CONNECTION_STRING"]
)
```

Never hardcode credentials. Use environment variables or Azure Key Vault.

## Answering Inbound Calls

```python
# ACS POSTs an IncomingCall event to your webhook
from azure.eventgrid import EventGridEvent
from azure.communication.callautomation import CallAutomationClient

@app.post("/acs/inbound")
async def handle_inbound(request: Request):
    events = await request.json()
    for event_dict in events:
        event = EventGridEvent.from_dict(event_dict)
        if event.event_type == "Microsoft.Communication.IncomingCall":
            incoming_call_context = event.data["incomingCallContext"]
            callback_url = f"https://your-app.azurewebsites.net/acs/callback"
            
            answer_result = client.answer_call(
                incoming_call_context=incoming_call_context,
                callback_url=callback_url,
            )
            call_connection_id = answer_result.call_connection_id
```

## Making Outbound Calls

```python
from azure.communication.callautomation.models import (
    PhoneNumberIdentifier,
    CommunicationUserIdentifier,
)

# IMPORTANT: target must use the actual phone number, not hardcoded
target_phone = PhoneNumberIdentifier(phone_number)  # e.g. "+12025551234"
source_caller_id = PhoneNumberIdentifier(os.environ["ACS_PHONE_NUMBER"])

call_result = client.create_call(
    target_participant=target_phone,
    callback_url=callback_url,
    source_caller_id_number=source_caller_id,
)
call_connection_id = call_result.call_connection_id
```

## Handling Call Events (Webhook Callback)

```python
@app.post("/acs/callback")
async def handle_callback(request: Request):
    events = await request.json()
    for event_dict in events:
        event_type = event_dict.get("type") or event_dict.get("Type")
        call_connection_id = event_dict.get("data", {}).get("callConnectionId")

        if event_type == "Microsoft.Communication.CallConnected":
            # Call is live — start your AI interaction here
            pass

        elif event_type == "Microsoft.Communication.CallDisconnected":
            # Clean up call state
            pass

        elif event_type == "Microsoft.Communication.RecognizeCompleted":
            # Speech recognition result
            speech_result = event_dict["data"]["speechResult"]["speech"]
            pass
```

## Agent Transfer (Human Handoff)

Transfer the call to a human agent when AI can't handle it:

```python
from azure.communication.callautomation.models import TransferCallToParticipantResult

call_connection = client.get_call_connection(call_connection_id)

# Transfer to agent phone number
agent_phone = PhoneNumberIdentifier(agent_phone_number)
transfer_result = call_connection.transfer_call_to_participant(
    target_participant=agent_phone,
    # Pass context so agent knows what the caller said
    user_to_user_information="Customer inquired about policy #12345",
)
```

## Azure AI Voice Live (Realtime OpenAI Integration)

For full conversational AI (not just TTS/STT), use Voice Live which streams audio to Azure OpenAI Realtime:

```python
from azure.communication.callautomation.models import (
    StartMediaStreamingOptions,
    MediaStreamingTransportType,
    MediaStreamingContentType,
    MediaStreamingAudioChannelType,
)

# After call is connected, start media streaming
call_connection = client.get_call_connection(call_connection_id)

# Use WebSocket to stream audio to your AI backend
websocket_url = f"wss://your-app.azurewebsites.net/ws/{call_connection_id}"
call_connection.start_media_streaming(
    StartMediaStreamingOptions(
        transport_url=websocket_url,
        transport_type=MediaStreamingTransportType.WEBSOCKET,
        content_type=MediaStreamingContentType.AUDIO,
        audio_channel_type=MediaStreamingAudioChannelType.MIXED,
        start_media_streaming=True,
    )
)
```

## Common Pitfalls

- **Callback URL must be HTTPS and publicly reachable** — `localhost` won't work for ACS events. Use Azure App Service or ngrok for local dev.
- **Azure hostname detection** — when deployed, detect your actual hostname from the `HOST` env var or `X-Forwarded-Host` header, not hardcoded `localhost:8000`
- **Outbound call phone number** — never hardcode the target phone number; always pass it dynamically
- **MCP tool calling in Voice Live** — tool call responses from the OpenAI Realtime API are sometimes spoken aloud as text in ACS Voice Live (known issue as of early 2026). Implement tool results as plain text injected back into the conversation context instead.
- **Callback path mismatch** — ensure the callback URL path matches exactly what your FastAPI/Flask route expects (e.g. `/acs/callback` not `/acs/agent-transfer-callback`)
- **Event type field** — ACS events may use `type` or `Type` (capitalized) depending on the event source. Check both.

## Environment Variables

```bash
ACS_CONNECTION_STRING=endpoint=https://...;accesskey=...
ACS_PHONE_NUMBER=+12025551234   # Your ACS-acquired phone number
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your-key
```

## FastAPI + WebSocket Pattern (Voice Streaming Backend)

```python
from fastapi import FastAPI, WebSocket
import asyncio

app = FastAPI()

@app.websocket("/ws/{call_id}")
async def audio_stream(websocket: WebSocket, call_id: str):
    await websocket.accept()
    # Forward audio chunks to Azure OpenAI Realtime API
    # Receive AI audio response, send back to ACS
    async for audio_chunk in websocket.iter_bytes():
        ai_response = await send_to_openai_realtime(audio_chunk)
        await websocket.send_bytes(ai_response)
```
