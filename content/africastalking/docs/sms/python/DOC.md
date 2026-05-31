---
name: sms
description: "Africa's Talking SMS API for sending bulk SMS, receiving inbound messages, and delivery reporting across African telecom networks"
metadata:
  languages: "python"
  versions: "2.0.2"
  revision: 1
  updated-on: "2026-03-10"
  source: community
  tags: "africastalking,sms,africa,kenya,nigeria,ghana,tanzania,telecom,bulk-sms"
---
# Africa's Talking SMS API — Python

You are an Africa's Talking Python SDK expert. Help me write code using the `africastalking` Python library to send SMS, handle delivery reports, and receive inbound messages across African telecom networks.

- **PyPI package:** `africastalking`
- **Current version:** 2.0.2
- **Supported networks:** Safaricom, Airtel, Telkom (Kenya); MTN, Vodafone, AirtelTigo (Ghana); MTN, Airtel, 9mobile (Nigeria); Vodacom, Airtel, TIGO (Tanzania); and 20+ other African operators
- **Official docs:** https://developers.africastalking.com/docs/sms

## Installation

```bash
pip install africastalking
```

## Initialization

Always initialize once at module level. Use `sandbox` username and a test API key for development.

```python
import africastalking

# Production
africastalking.initialize(
    username="your_username",
    api_key=os.environ["AT_API_KEY"]
)

# Sandbox (free testing — no real SMS sent)
africastalking.initialize(
    username="sandbox",
    api_key="your_sandbox_api_key"  # any string works in sandbox
)

sms = africastalking.SMS
```

**Critical:** Import the service *after* calling `initialize()`. Service objects captured before initialization will not have credentials.

## Send SMS

### Basic send

```python
import africastalking
import os

africastalking.initialize(username="myapp", api_key=os.environ["AT_API_KEY"])
sms = africastalking.SMS

response = sms.send(
    message="Hello from Africa's Talking!",
    recipients=["+254712345678"],   # E.164 format required
)

# Response structure
# {
#   "SMSMessageData": {
#     "Message": "Sent to 1/1 Total Cost: KES 0.8000",
#     "Recipients": [
#       {
#         "statusCode": 101,
#         "number": "+254712345678",
#         "status": "Success",
#         "cost": "KES 0.8000",
#         "messageId": "ATXid_abc123"
#       }
#     ]
#   }
# }
print(response["SMSMessageData"]["Recipients"][0]["status"])  # "Success"
```

### Bulk send (up to 1,000 recipients per call)

```python
recipients = ["+254712345678", "+254723456789", "+254734567890"]

response = sms.send(
    message="Reminder: Community meeting tomorrow at 2pm.",
    recipients=recipients,
    sender_id="MYAPP",   # optional alphanumeric sender ID (pre-registered)
)

for r in response["SMSMessageData"]["Recipients"]:
    print(f"{r['number']}: {r['status']} — {r['cost']}")
```

### Send with shortcode / sender ID

```python
# sender_id must be pre-approved by Africa's Talking
response = sms.send(
    message="Your OTP is 847291. Valid for 10 minutes.",
    recipients=["+254712345678"],
    sender_id="MYCOMPANY",
)
```

### Premium SMS (subscription messages)

```python
response = sms.send(
    message="Your weekly update",
    recipients=["+254712345678"],
    keyword="updates",
    link_id="link_id_from_subscription",
    retry_duration_in_hours=1,
)
```

## Fetch Inbox (inbound messages)

```python
# Fetch unread messages from your inbox
response = sms.fetch_messages()

# response["SMSMessageData"]["Messages"] is a list
for msg in response["SMSMessageData"]["Messages"]:
    print(f"From: {msg['from']}")
    print(f"Text: {msg['text']}")
    print(f"Date: {msg['date']}")
    print(f"linkId: {msg.get('linkId')}")  # present for premium/USSD-linked
```

## Fetch Delivery Reports

```python
# messageId comes from the send response
msg_id = "ATXid_abc123"
report = sms.get_subscription(short_code="12345", keyword="updates")
```

## Inbound SMS Webhook (Flask)

Africa's Talking POSTs to your callback URL when an SMS arrives on your shortcode.

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/sms/inbound", methods=["POST"])
def inbound_sms():
    data = request.form  # AT sends form-encoded POST

    sender    = data.get("from")       # e.g. "+254712345678"
    message   = data.get("text")
    to        = data.get("to")         # your shortcode
    date      = data.get("date")
    msg_id    = data.get("id")
    link_id   = data.get("linkId")     # present if reply to USSD prompt

    print(f"SMS from {sender}: {message}")

    # Must return 200 OK — AT retries on non-200
    return "", 200


@app.route("/sms/delivery", methods=["POST"])
def delivery_report():
    data = request.form

    msg_id    = data.get("id")
    status    = data.get("status")      # "Success", "Failed", "Buffered"
    network   = data.get("networkCode")
    phone     = data.get("phoneNumber")
    failure   = data.get("failureReason")  # present when status == "Failed"

    print(f"Delivery {msg_id} → {phone}: {status}")
    return "", 200
```

## USSD (triggered-SMS pattern)

When integrating SMS replies into a USSD session flow, the `linkId` from the USSD response connects the SMS to the session:

```python
# After handling USSD, send a confirmation SMS
def send_ussd_followup(phone: str, link_id: str, message: str):
    response = sms.send(
        message=message,
        recipients=[phone],
        link_id=link_id,
    )
    return response["SMSMessageData"]["Recipients"][0]["status"] == "Success"
```

## Bilingual / Kiswahili messages

Africa's Talking supports Unicode (UTF-8). Kiswahili messages are sent identically to English.

```python
# Unicode SMS counts at 70 chars per segment (vs 160 for ASCII)
messages = {
    "en": "Alert: Drought risk HIGH in your county. Reduce livestock.",
    "sw": "Tahadhari: Hatari ya ukame ni KUBWA katika kaunti yako. Punguza mifugo."
}

for lang, text in messages.items():
    sms.send(message=text, recipients=["+254712345678"])
```

## County-level bulk targeting (Kenya pattern)

```python
import africastalking

def send_county_alert(county_recipients: dict[str, list[str]], message: str):
    """
    county_recipients: {"Turkana": ["+254..."], "Marsabit": [...]}
    Sends per-county with county name injected.
    """
    sms = africastalking.SMS
    results = {}
    for county, phones in county_recipients.items():
        county_msg = f"[{county}] {message}"
        resp = sms.send(message=county_msg, recipients=phones)
        results[county] = resp["SMSMessageData"]["Recipients"]
    return results
```

## Error Handling

```python
try:
    response = sms.send(
        message="Test message",
        recipients=["+254712345678"]
    )
    recipients = response["SMSMessageData"]["Recipients"]
    failed = [r for r in recipients if r["status"] != "Success"]
    if failed:
        for r in failed:
            print(f"Failed: {r['number']} — {r['status']}")

except Exception as e:
    # Network errors, auth errors, invalid API key
    print(f"API error: {e}")
```

## Status codes

| statusCode | Meaning |
|---|---|
| 100 | Processed |
| 101 | Sent |
| 102 | Queued |
| 401 | RiskHold |
| 402 | InvalidSenderId |
| 403 | InvalidPhoneNumber |
| 404 | UnsupportedNumberType |
| 405 | InsufficientBalance |
| 406 | UserInBlacklist |
| 407 | CouldNotRoute |
| 500 | InternalServerError |

## Sandbox testing

In sandbox mode no real SMS is sent. Use the simulator at https://simulator.africastalking.com to send test inbound messages to your callback URL.

```python
# Sandbox initialization — safe for CI/CD
africastalking.initialize(username="sandbox", api_key="test")
sms = africastalking.SMS
response = sms.send("Test", ["+254712345678"])
# Always returns statusCode 101 in sandbox
```

## Environment variable pattern

```python
import os
import africastalking

def get_sms_service():
    africastalking.initialize(
        username=os.environ["AT_USERNAME"],  # "sandbox" for dev
        api_key=os.environ["AT_API_KEY"],
    )
    return africastalking.SMS
```

## Useful links

- Dashboard: https://account.africastalking.com
- Sandbox simulator: https://simulator.africastalking.com
- SMS pricing: https://africastalking.com/sms
- API reference: https://developers.africastalking.com/docs/sms
- GitHub SDK: https://github.com/AfricasTalkingLtd/africastalking-python
