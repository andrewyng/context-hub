---
name: messaging
description: "Cloud communications platform for SMS, voice, video, and WhatsApp messaging with programmable APIs"
metadata:
  languages: "python"
  versions: "9.10.9"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "twilio,sdk,sms,voice,communications"
---
# Twilio Python Library Coding Guidelines

You are a Twilio Python SDK expert. Help me with writing code using the Twilio Python library to interact with Twilio's communication APIs.

Please follow the following guidelines when generating code.

You can find the official SDK documentation and code samples here:
https://www.twilio.com/docs/libraries/python

## Golden Rule: Use the Correct and Current SDK

Always use the official Twilio Python library to interact with Twilio APIs, which is the standard and actively maintained library for all Twilio API interactions.

- **Library Name:** Twilio Python Helper Library
- **Python Package:** `twilio`
- **Current Version:** 9.10.9

**Installation:**

- **Correct:** `pip3 install twilio`
- **Incorrect:** `pip install twilio-sdk` or other unofficial packages

**APIs and Usage:**

- **Correct:** `from twilio.rest import Client`
- **Incorrect:** `import twilio` (doesn't expose the Client directly)
- **Correct:** `client = Client(account_sid, auth_token)`
- **Correct:** `client.messages.create(...)`
- **Correct:** `from twilio.base.exceptions import TwilioRestException`

## Supported Python Versions

The library supports the following Python versions:

- Python 3.7
- Python 3.8
- Python 3.9
- Python 3.10
- Python 3.11
- Python 3.12
- Python 3.13

## Installation and Setup

Install using pip:

```bash
pip3 install twilio
```

For development, you can also install from source:

```bash
python3 setup.py install
```

## Initialization and Authentication

The Twilio client supports multiple authentication methods:

### Account SID and Auth Token Authentication

```python
from twilio.rest import Client

account_sid = "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
auth_token = "your_auth_token"
client = Client(account_sid, auth_token)
```

### API Key and Secret Authentication

```python
from twilio.rest import Client

api_key = "XXXXXXXXXXXXXXXXX"
api_secret = "YYYYYYYYYYYYYYYYYY"
account_sid = "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
client = Client(api_key, api_secret, account_sid)
```

### Environment Variables

Use environment variables for security:

```python
from twilio.rest import Client
# Looks for TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
client = Client()
```

### Regional Configuration

For global infrastructure, specify region and edge:

```python
from twilio.rest import Client

client = Client(region='au1', edge='sydney')
# Or set after initialization
client.region = 'au1'
client.edge = 'sydney'
```

## Core Messaging Features

### Send SMS Messages

```python
from twilio.rest import Client

client = Client(account_sid, auth_token)

message = client.messages.create(
    to="+15558675309",
    from_="+15017250604",
    body="Hello from Python!"
)

print(message.sid)
```

### Send MMS with Media

```python
message = client.messages.create(
    to="+15558675309",
    from_="+15017250604",
    body="Check out this image!",
    media_url=["https://example.com/image.jpg"]
)
```

### Retrieve Message Information

```python
# Get specific message
message = client.messages.get("MMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
print(f"Status: {message.status}")
print(f"Direction: {message.direction}")
print(f"Error Code: {message.error_code}")
```

## Voice Features

### Make Phone Calls

```python
from twilio.rest import Client

client = Client(account_sid, auth_token)

call = client.calls.create(
    to="+15558675309",
    from_="+15017250604",
    url="http://demo.twilio.com/docs/voice.xml"
)

print(call.sid)
```

### Get Call Information

```python
call = client.calls.get("CA42ed11f93dc08b952027ffbc406d0868")
print(f"Duration: {call.duration}")
print(f"Status: {call.status}")
```

## Data Iteration and Pagination

The library handles pagination automatically:

### Using List Method

```python
# Get all messages (automatically handles pagination)
for message in client.messages.list():
    print(f"To: {message.to}, Body: {message.body}")

# With limits and page size
messages = client.messages.list(limit=20, page_size=10)
```

### Using Stream Method

```python
# Lazy loading with iterator
for message in client.messages.stream(limit=100):
    print(message.sid)
```

## TwiML Generation

Generate TwiML responses for webhooks:

### Voice TwiML

```python
from twilio.twiml.voice_response import VoiceResponse

response = VoiceResponse()
response.say("Hello! Welcome to our service.")
response.play("https://api.twilio.com/cowbell.mp3")

# For call forwarding
response.dial("+15551234567")

print(str(response))
```

### Messaging TwiML

```python
from twilio.twiml.messaging_response import MessagingResponse

response = MessagingResponse()
response.message("Thanks for your message! We'll get back to you soon.")

print(str(response))
```

### Advanced Voice TwiML

```python
from twilio.twiml.voice_response import VoiceResponse, Gather

response = VoiceResponse()

gather = Gather(input='speech dtmf', timeout=3, action='/process-input')
gather.say("Please say your name or press a key")
response.append(gather)

# Fallback if no input
response.say("We didn't receive any input. Goodbye!")
```

## Asynchronous Operations

For non-blocking requests, use async client:

```python
import asyncio
from twilio.http.async_http_client import AsyncTwilioHttpClient
from twilio.rest import Client

async def send_message_async():
    account_sid = "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    auth_token = "your_auth_token"

    http_client = AsyncTwilioHttpClient()
    client = Client(account_sid, auth_token, http_client=http_client)

    message = await client.messages.create_async(
        to="+12316851234",
        from_="+15555555555",
        body="Hello there!"
    )

    return message.sid

# Run the async function
result = asyncio.run(send_message_async())
```

## Error Handling

Handle Twilio-specific exceptions:

```python
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

client = Client(account_sid, auth_token)

try:
    message = client.messages.create(
        to="+12316851234",
        from_="+15555555555",
        body="Hello there!"
    )
except TwilioRestException as e:
    print(f"Twilio Error {e.status}: {e.msg}")
    print(f"Error Code: {e.code}")
    print(f"More info: https://www.twilio.com/docs/errors/{e.code}")
except Exception as e:
    print(f"Other error: {e}")
```

## Webhook Validation

Validate incoming webhook requests:

```python
from twilio.request_validator import RequestValidator

def validate_twilio_request(request):
    validator = RequestValidator("your_auth_token")

    # Get the URL and signature from request
    url = request.url
    params = request.form  # or request.json for JSON requests
    signature = request.headers.get('X-Twilio-Signature', '')

    if validator.validate(url, params, signature):
        return True
    else:
        return False

# Example with Flask
from flask import Flask, request

app = Flask(__name__)

@app.route("/webhook", methods=['POST'])
def handle_webhook():
    if not validate_twilio_request(request):
        return "Unauthorized", 401

    # Process the webhook
    return "OK", 200
```

## Advanced Features

### Custom HTTP Client

Create custom HTTP client for proxy support:

```python
from twilio.http.http_client import TwilioHttpClient
from twilio.rest import Client
import os

class ProxyHttpClient(TwilioHttpClient):
    def request(self, method, url, params=None, data=None, headers=None,
                auth=None, timeout=None, allow_redirects=False):
        # Customize the request here
        session = self._build_session()
        session.proxies.update({
            'http': os.environ.get('HTTP_PROXY'),
            'https': os.environ.get('HTTPS_PROXY')
        })

        response = session.request(
            method=method,
            url=url,
            params=params,
            data=data,
            headers=headers,
            auth=auth,
            timeout=timeout,
            allow_redirects=allow_redirects
        )

        return self._build_response(response)

# Use custom client
custom_client = ProxyHttpClient()
client = Client(account_sid, auth_token, http_client=custom_client)
```

### Debug Logging

Enable request/response logging:

```python
import logging
from twilio.rest import Client

client = Client(account_sid, auth_token)

# Log to console
logging.basicConfig()
client.http_client.logger.setLevel(logging.INFO)

# Log to file
logging.basicConfig(filename='./twilio_log.txt')
client.http_client.logger.setLevel(logging.INFO)
```

### Advanced Service Access

Access specific Twilio services directly:

```python
# Video API
rooms = client.video.rooms.list()

# Verify API
verification = client.verify.services("VAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX") \
    .verifications.create(to="+15017122661", channel="sms")

# Sync API
sync_service = client.sync.services.create(friendly_name="My Service")

# Studio API
executions = client.studio.flows("FWXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX") \
    .executions.list()
```

## Best Practices

### Security
- Always use environment variables for credentials
- Validate webhook requests
- Use API keys instead of Auth Tokens when possible
- Implement proper error handling

### Performance
- Use pagination limits for large datasets
- Consider async operations for high-volume applications
- Implement retry logic for network failures
- Use connection pooling for multiple requests

### Error Handling
- Always catch `TwilioRestException` for API errors
- Check response status codes
- Log errors with context for debugging
- Implement graceful fallbacks

### Resource Management
- Close async clients properly
- Use context managers when appropriate
- Monitor API usage and rate limits
- Cache frequently accessed data

## Available APIs and Services

The Twilio Python library provides access to numerous APIs:

- **Messaging**: SMS, MMS, WhatsApp, Facebook Messenger
- **Voice**: Calls, conferences, recordings, transcriptions
- **Video**: Rooms, participants, compositions
- **Verify**: Phone verification, TOTP, email verification
- **Sync**: Real-time synchronization
- **Chat**: Programmable chat (legacy)
- **Conversations**: Next-generation chat and messaging
- **Studio**: Visual workflow builder
- **Functions**: Serverless runtime
- **Flex**: Contact center platform
- **TaskRouter**: Workflow and task distribution
- **Proxy**: Phone number masking
- **Notify**: Push notifications and messaging
- **Authy**: Two-factor authentication (via Verify)
- **Lookup**: Phone number intelligence
- **Pricing**: Cost information
- **Usage**: Account usage statistics

## Useful Links

- Documentation: https://www.twilio.com/docs/libraries/python
- API Reference: https://www.twilio.com/docs/api
- TwiML Reference: https://www.twilio.com/docs/voice/twiml
- Console: https://console.twilio.com
- Status Page: https://status.twilio.com
- Support: https://support.twilio.com

## Notes

The Twilio Python library is auto-generated from OpenAPI specifications, ensuring it stays current with Twilio's APIs. Always refer to the official documentation for the most up-to-date API parameters and responses. The library provides both synchronous and asynchronous interfaces, comprehensive error handling, and extensive webhook validation capabilities for building robust communication applications.
