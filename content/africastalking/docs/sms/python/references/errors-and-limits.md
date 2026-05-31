# Africa's Talking SMS — Common Errors & Fixes

## Authentication errors

**`401 Unauthorized` / `InvalidApiKey`**
- API key does not match the username
- Fix: verify both `AT_USERNAME` and `AT_API_KEY` env vars
- Sandbox: any API key works with `username="sandbox"`

**`InvalidSenderId` (statusCode 402)**
- Sender ID not registered or pending approval
- Fix: use your shortcode number, or submit sender ID for approval in dashboard
- Sandbox: sender IDs are not validated

## Phone number errors

**`InvalidPhoneNumber` (statusCode 403)**
- Not in E.164 format (must start with `+` and country code)
- Wrong: `0712345678` | Correct: `+254712345678`

**`UnsupportedNumberType` (statusCode 404)**
- VoIP number, landline, or number not on a supported network
- Common with some Tanzanian and South Sudan numbers

## Balance / routing errors

**`InsufficientBalance` (statusCode 405)**
- Recharged at https://account.africastalking.com
- Sandbox accounts have unlimited virtual credit

**`CouldNotRoute` (statusCode 407)**
- Temporary: network congestion or operator issue
- Fix: retry with exponential backoff (3 attempts, 2s/4s/8s)

## Rate limits

- Default: 200 requests/minute per API key
- Bulk: up to 1,000 recipients per `sms.send()` call
- For > 1,000 recipients, chunk and add 300ms delay between calls

```python
import time

def send_bulk_chunked(sms, message, all_recipients, chunk_size=1000):
    results = []
    for i in range(0, len(all_recipients), chunk_size):
        chunk = all_recipients[i:i + chunk_size]
        resp = sms.send(message=message, recipients=chunk)
        results.extend(resp["SMSMessageData"]["Recipients"])
        if i + chunk_size < len(all_recipients):
            time.sleep(0.3)
    return results
```

## Webhook reliability

AT retries failed deliveries to your callback URL up to 3 times (5s, 30s, 5min intervals).
- Always return HTTP 200 immediately, process async
- Use a queue (Celery, Redis) for heavy processing

```python
from flask import Flask, request
from threading import Thread

app = Flask(__name__)

def process_async(data):
    # heavy processing here
    pass

@app.route("/sms/inbound", methods=["POST"])
def inbound():
    data = dict(request.form)
    Thread(target=process_async, args=(data,), daemon=True).start()
    return "", 200  # return fast, AT won't retry
```

## Unicode / Kiswahili SMS length

Standard GSM-7 SMS: 160 chars/segment
Unicode (any non-ASCII): 70 chars/segment — costs more per segment

```python
def sms_segment_count(text: str) -> int:
    """Estimate segments for cost calculation."""
    try:
        text.encode("gsm03.38")  # raises UnicodeEncodeError if non-GSM
        limit = 160
    except (UnicodeEncodeError, LookupError):
        limit = 70
    return -(-len(text) // limit)  # ceiling division
```
