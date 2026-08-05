---
name: package
description: "Twilio SendGrid Python SDK for sending email and calling the SendGrid Web API v3"
metadata:
  languages: "python"
  versions: "6.12.5"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "sendgrid,twilio,email,transactional-email,templates,delivery"
---

# SendGrid Python Package Guide

## Golden Rule

Use `sendgrid` for Twilio SendGrid Web API v3 access in Python. Authenticate with an API key, verify your sender identity before sending mail, use the `Mail` helper for normal email sends, and drop to `sg.client` when you need endpoints outside the helper surface.

## Install

Pin the version your project expects:

```bash
python -m pip install "sendgrid==6.12.5"
```

Use a virtual environment for local work:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "sendgrid==6.12.5"
```

The package depends on `python-http-client` and `cryptography`.

## Authentication And Setup

Twilio SendGrid's Mail Send API uses bearer-token authentication. Create a restricted API key in the SendGrid console and keep it in `SENDGRID_API_KEY`.

```bash
export SENDGRID_API_KEY="SG..."
```

Basic client setup:

```python
import os
from sendgrid import SendGridAPIClient

sg = SendGridAPIClient(api_key=os.environ["SENDGRID_API_KEY"])
```

Sender verification is required before delivery will work:

- `Single Sender Verification` is fine for proofs of concept and testing.
- `Domain Authentication` is the preferred production setup and lets you send from any address on the authenticated domain.

## Core Usage

### Send a basic HTML email

```python
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

message = Mail(
    from_email="from@example.com",
    to_emails="to@example.com",
    subject="Sending with Twilio SendGrid is Fun",
    html_content="<strong>and easy to do anywhere, even with Python</strong>",
)

sg = SendGridAPIClient(api_key=os.environ["SENDGRID_API_KEY"])
response = sg.send(message)

print(response.status_code)  # 202 on accepted live sends
print(response.headers)
```

Use `sg.send(message)` for the common case. This is the path shown in Twilio's Python quickstart.

### Send with a dynamic template

Dynamic templates use a `template_id` beginning with `d-` and data supplied through `dynamic_template_data`.

```python
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

message = Mail(
    from_email="billing@example.com",
    to_emails="customer@example.com",
)
message.template_id = "d-1234567890abcdef1234567890abcdef"
message.dynamic_template_data = {
    "first_name": "Ada",
    "invoice_total": "$42.00",
    "invoice_url": "https://example.com/invoices/42",
}

sg = SendGridAPIClient(api_key=os.environ["SENDGRID_API_KEY"])
sg.send(message)
```

### Add an attachment

The Mail Send API expects attachment content to be Base64-encoded.

```python
import base64
import os

from sendgrid import SendGridAPIClient

with open("invoice.pdf", "rb") as fh:
    encoded = base64.b64encode(fh.read()).decode()

payload = {
    "personalizations": [
        {
            "to": [{"email": "to@example.com"}],
        }
    ],
    "from": {"email": "from@example.com"},
    "subject": "Invoice",
    "content": [
        {
            "type": "text/plain",
            "value": "See attached.",
        }
    ],
    "attachments": [
        {
            "content": encoded,
            "filename": "invoice.pdf",
            "type": "application/pdf",
            "disposition": "attachment",
        }
    ],
}

sg = SendGridAPIClient(api_key=os.environ["SENDGRID_API_KEY"])
sg.client.mail.send.post(request_body=payload)
```

### Call non-mail endpoints with the fluent client

The package exposes the full Web API v3 via `sg.client`, which is useful for suppressions, stats, templates, marketing, and admin APIs.

```python
import os
from sendgrid import SendGridAPIClient

sg = SendGridAPIClient(api_key=os.environ["SENDGRID_API_KEY"])

response = sg.client.suppression.bounces.get()
print(response.status_code)
print(response.body)
```

## Validation And Safe Testing

Use SendGrid sandbox mode when you want request validation without real delivery. Sandbox requests return `200 OK`; successful live Mail Send requests return `202 Accepted`.

```python
import os
from sendgrid import SendGridAPIClient

payload = {
    "personalizations": [
        {
            "to": [{"email": "to@example.com"}],
        }
    ],
    "from": {"email": "from@example.com"},
    "subject": "Sandbox test",
    "content": [
        {
            "type": "text/plain",
            "value": "This request should validate without sending.",
        }
    ],
    "mail_settings": {
        "sandbox_mode": {
            "enable": True,
        }
    },
}

sg = SendGridAPIClient(api_key=os.environ["SENDGRID_API_KEY"])
response = sg.client.mail.send.post(request_body=payload)
print(response.status_code)  # 200 in sandbox mode
```

## Common Pitfalls

- A `202 Accepted` response means the API accepted the request. It does not prove inbox delivery. Twilio's Event Webhook docs distinguish `processed` from `delivered`, so use event tracking or Email Activity when delivery status matters.
- The `from` address must be a verified sender. The Mail Send API reference calls this out explicitly.
- `Single Sender Verification` is for testing. Complete `Domain Authentication` before production sending.
- Dynamic templates require `template_id` values starting with `d-`; older standard templates use `substitutions` instead of `dynamic_template_data`.
- Attachment content must be Base64-encoded before you send it.
- The `on-behalf-of` header does not work with the Mail Send API. Use it only for supported parent-account and subuser admin endpoints.
- EU regional subusers must target `https://api.eu.sendgrid.com` instead of the global base URL.

## Version-Sensitive Notes

- The version used here `6.12.5` matches the current stable PyPI release as of May 29, 2026.
- PyPI also lists `7.0.0rc1` and `7.0.0rc2` as pre-releases. Do not assume 7.x examples apply to the stable package.
- PyPI's project description says the `6.x` line is a breaking change from `5.x`; do not copy `5.x` tutorials into a `6.12.5` project without checking release notes.
- The Twilio quickstart page is stale in two places: it still says the SDK supports Python `2.7, 3.5, 3.6, 3.7, and 3.8`, and its sample install output still shows `sendgrid-6.4.6`. PyPI classifiers for `6.12.5` include Python `3.12` and `3.13`, and the upstream changelog says `6.12.0` added Python `3.12` and `3.13` support.

## Official Sources

- Twilio SendGrid Python quickstart: `https://www.twilio.com/docs/sendgrid/for-developers/sending-email/quickstart-python`
- Twilio SendGrid Mail Send API reference: `https://www.twilio.com/docs/sendgrid/api-reference/mail-send/mail-send`
- Twilio SendGrid Sender Identity guide: `https://www.twilio.com/docs/sendgrid/for-developers/sending-email/sender-identity`
- Twilio SendGrid Sandbox Mode guide: `https://www.twilio.com/docs/sendgrid/for-developers/sending-email/sandbox-mode`
- Twilio SendGrid Event Webhook reference: `https://www.twilio.com/docs/sendgrid/for-developers/tracking-events/event`
- Twilio SendGrid On Behalf Of reference: `https://www.twilio.com/docs/sendgrid/api-reference/how-to-use-the-sendgrid-v3-api/on-behalf-of`
- PyPI package page: `https://pypi.org/project/sendgrid/`
- Upstream changelog: `https://raw.githubusercontent.com/sendgrid/sendgrid-python/main/CHANGELOG.md`
