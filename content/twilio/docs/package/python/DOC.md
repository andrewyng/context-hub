---
name: package
description: "Twilio Python helper library for REST API access, messaging, voice, and TwiML generation"
metadata:
  languages: "python"
  versions: "9.10.9"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "twilio,communications,sms,voice,twiml,oauth"
---

# Twilio Python Package Guide

## Golden Rule

Use the official `twilio` helper library, import the REST client as `from twilio.rest import Client`, and authenticate with environment variables or server-side credentials. When routing through Twilio Global Infrastructure, set both `region` and `edge`; setting only `region` still targets `US1`. Pin at least the major version because Twilio's versioning policy allows minor releases to include small breaking changes.

## Install

Pin the version your project expects:

```bash
python -m pip install "twilio==9.10.9"
```

For a general install without a pin:

```bash
python -m pip install twilio
```

Twilio's PyPI metadata for `9.10.9` declares support for Python `3.7` through `3.13`.

## Authentication And Setup

### Account SID and Auth Token

Prefer environment variables in application code:

```bash
export TWILIO_ACCOUNT_SID="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
export TWILIO_AUTH_TOKEN="your_auth_token"
```

```python
from twilio.rest import Client

client = Client()
```

Explicit credentials also work:

```python
from twilio.rest import Client

client = Client(
    "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "your_auth_token",
)
```

### API key and secret

Use an API key and secret when you do not want to ship the account auth token to a service:

```python
from twilio.rest import Client

client = Client(
    "SKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "your_api_secret",
    "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
)
```

### OAuth client credentials

Twilio documents a beta OAuth 2.0 client-credentials flow for some APIs. Treat it as opt-in and verify API support before switching an existing integration:

```python
from twilio.credential_provider import ClientCredentialProvider
from twilio.rest import Client

provider = ClientCredentialProvider(
    "client_sid",
    "client_secret",
)

client = Client(
    credential_provider=provider,
    account_sid="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
)
```

## Core Usage

### Send an SMS or WhatsApp message

Use E.164 phone numbers. For WhatsApp, prefix the addresses with `whatsapp:`.

```python
from twilio.rest import Client

client = Client()

message = client.messages.create(
    body="Hello from Twilio Python",
    from_="+15017122661",
    to="+15558675310",
)

print(message.sid)
```

### Make an outbound call

Pass either a hosted TwiML URL or inline TwiML:

```python
from twilio.rest import Client

client = Client()

call = client.calls.create(
    to="+15558675310",
    from_="+15017122661",
    url="https://demo.twilio.com/docs/voice.xml",
)

print(call.sid)
```

### List resources without over-fetching

`list()` materializes results eagerly. Prefer `stream()` for large collections:

```python
from twilio.rest import Client

client = Client()

for message in client.messages.stream(limit=50):
    print(message.sid, message.status)
```

### Generate TwiML in Python

```python
from twilio.twiml.voice_response import VoiceResponse

response = VoiceResponse()
response.say("Hello from Twilio")
response.play("https://api.twilio.com/cowbell.mp3")

print(str(response))
```

### Use the async HTTP client

Async operations require `AsyncTwilioHttpClient` plus the `_async` methods:

```python
import asyncio

from twilio.http.async_http_client import AsyncTwilioHttpClient
from twilio.rest import Client

async def main() -> None:
    http_client = AsyncTwilioHttpClient()
    client = Client(http_client=http_client)

    message = await client.messages.create_async(
        body="Hello from async Twilio",
        from_="+15017122661",
        to="+15558675310",
    )
    print(message.sid)

asyncio.run(main())
```

## Configuration Notes

### Region and edge

Set these together when you need Twilio Global Infrastructure routing:

```python
from twilio.rest import Client

client = Client(region="au1", edge="sydney")
```

Equivalent environment variables:

```bash
export TWILIO_REGION="au1"
export TWILIO_EDGE="sydney"
```

If you set `region` without `edge`, the request still goes to `api.twilio.com` and uses `US1`.

### Retries for rate-limited requests

Twilio supports automatic retry for HTTP `429` responses:

```python
from twilio.rest import Client

client = Client(
    account_sid="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    auth_token="your_auth_token",
    auto_retry=True,
    max_retries=3,
)
```

### Error handling

Catch `TwilioRestException` for API errors:

```python
from twilio.base.exceptions import TwilioRestException
from twilio.rest import Client

client = Client()

try:
    client.messages.create(
        body="Hello",
        from_="+15017122661",
        to="+15558675310",
    )
except TwilioRestException as exc:
    print(exc.status)
    print(exc.code)
    print(exc.msg)
```

## Common Pitfalls

- Import `Client` from `twilio.rest`; `import twilio` alone is not the normal entry point for REST usage.
- Message and call APIs use `from_`, not `from`, because `from` is a Python keyword.
- Keep credentials server-side. Do not embed Twilio secrets in frontend or mobile bundles.
- Use E.164 numbers such as `+15558675310`; local or formatted numbers often fail validation.
- `list()` can issue multiple page fetches and grow memory use quickly. Prefer `stream()` when you only need iteration.
- Async usage is not automatic. You need `AsyncTwilioHttpClient` and the `_async` resource methods.
- Region routing is easy to misconfigure. Set both `region` and `edge` together or stay on the default `US1`.
- OAuth client credentials are still beta and not a universal replacement for account credentials.

## Version-Sensitive Notes For 9.10.9

- PyPI and Twilio's official helper-library docs both list `9.10.9` as the current package version as of May 29, 2026.
- Twilio's `9.0.0` upgrade guide says the helper library moved to OpenAPI-generated code and added JSON request-body support; most high-level resource patterns stayed compatible, but older code that relied on undocumented internals is riskier on `9.x`.
- Twilio's versioning policy explicitly recommends pinning at least the major version because minor releases can require manual code changes.
- The published versioning matrix says the current major version supports Python `3.7` through `3.13`. If your runtime is older than `3.7`, `9.10.9` is out of range.
