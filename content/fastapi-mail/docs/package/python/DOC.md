---
name: package
description: "FastAPI-Mail package guide for SMTP email sending, templates, attachments, and background delivery in FastAPI apps"
metadata:
  languages: "python"
  versions: "1.6.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "fastapi-mail,fastapi,email,smtp,jinja2,attachments,python"
---

# FastAPI-Mail Python Package Guide

## Install

`fastapi-mail` 1.6.2 is published on PyPI for Python `>=3.10,<4.0`.

Use a virtual environment and pin the package version your app expects:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "fastapi-mail==1.6.2"
```

Optional extra from the maintainer docs:

```bash
python -m pip install "fastapi-mail[httpx]==1.6.2"
```

You still need an SMTP provider or relay. `fastapi-mail` does not send through an API like SendGrid or SES directly; it builds and sends mail through SMTP settings you supply.

## SMTP Configuration

The package centers on `ConnectionConfig`, `FastMail`, and `MessageSchema`.

```python
import os
from pathlib import Path

from fastapi_mail import ConnectionConfig


def env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes", "on"}


conf = ConnectionConfig(
    MAIL_USERNAME=os.environ["MAIL_USERNAME"],
    MAIL_PASSWORD=os.environ["MAIL_PASSWORD"],
    MAIL_FROM=os.environ["MAIL_FROM"],
    MAIL_SERVER=os.environ["MAIL_SERVER"],
    MAIL_PORT=int(os.getenv("MAIL_PORT", "587")),
    MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME", "Example App"),
    MAIL_STARTTLS=env_bool("MAIL_STARTTLS", True),
    MAIL_SSL_TLS=env_bool("MAIL_SSL_TLS", False),
    USE_CREDENTIALS=env_bool("MAIL_USE_CREDENTIALS", True),
    VALIDATE_CERTS=env_bool("MAIL_VALIDATE_CERTS", True),
    TEMPLATE_FOLDER=Path(__file__).resolve().parent / "templates",
)
```

Typical environment variables:

```bash
MAIL_USERNAME=smtp-user-or-email
MAIL_PASSWORD=app-password-or-smtp-password
MAIL_FROM=noreply@example.com
MAIL_FROM_NAME="Example App"
MAIL_SERVER=smtp.example.com
MAIL_PORT=587
MAIL_STARTTLS=true
MAIL_SSL_TLS=false
MAIL_USE_CREDENTIALS=true
MAIL_VALIDATE_CERTS=true
```

Practical setup notes from the maintainer docs:

- The docs show STARTTLS on port `587` and SSL/TLS on port `465`; match the combination your provider documents.
- If your provider does not issue a separate SMTP username, use the sending address as `MAIL_USERNAME`.
- Set `USE_CREDENTIALS=False` only when your relay does not require SMTP authentication.

## Send A Basic HTML Email

`MessageSchema` defines the envelope and body, then `FastMail.send_message()` sends it.

```python
from fastapi import FastAPI
from pydantic import BaseModel, EmailStr
from fastapi_mail import FastMail, MessageSchema, MessageType

app = FastAPI()
fm = FastMail(conf)


class EmailRequest(BaseModel):
    recipients: list[EmailStr]


@app.post("/email/send")
async def send_email(payload: EmailRequest) -> dict[str, str]:
    message = MessageSchema(
        subject="Welcome",
        recipients=payload.recipients,
        body="""
        <h1>Thanks for signing up</h1>
        <p>Your account is ready.</p>
        """,
        subtype=MessageType.html,
        reply_to=["Support <support@example.com>"],
        headers={"X-App-Source": "signup-flow"},
    )

    await fm.send_message(message)
    return {"status": "sent"}
```

Notes:

- Use `subtype=MessageType.html` for HTML mail and `subtype=MessageType.plain` for plain text.
- The docs accept display-name formats such as `"Support <support@example.com>"` in recipient-related fields.
- `reply_to`, `cc`, `bcc`, and `headers` are first-class `MessageSchema` fields when you need them.

## Queue Delivery In `BackgroundTasks`

For typical FastAPI routes, add the send call to `BackgroundTasks` so the response is returned immediately.

```python
from fastapi import BackgroundTasks, FastAPI
from pydantic import BaseModel, EmailStr
from fastapi_mail import FastMail, MessageSchema, MessageType

app = FastAPI()
fm = FastMail(conf)


class EmailRequest(BaseModel):
    recipients: list[EmailStr]


@app.post("/email/send-later")
async def send_email_later(
    payload: EmailRequest,
    background_tasks: BackgroundTasks,
) -> dict[str, str]:
    message = MessageSchema(
        subject="Queued welcome email",
        recipients=payload.recipients,
        body="<p>This was scheduled with FastAPI BackgroundTasks.</p>",
        subtype=MessageType.html,
    )

    background_tasks.add_task(fm.send_message, message)
    return {"status": "queued"}
```

## Render A Jinja2 Template

Set `TEMPLATE_FOLDER` in `ConnectionConfig`, then pass `template_body` and `template_name`.

```python
from fastapi_mail import FastMail, MessageSchema, MessageType

fm = FastMail(conf)

message = MessageSchema(
    subject="Welcome",
    recipients=["user@example.com"],
    template_body={
        "first_name": "Ada",
        "dashboard_url": "https://example.com/dashboard",
    },
    subtype=MessageType.html,
)

await fm.send_message(message, template_name="welcome.html")
```

Example template:

```html
<h1>Hello {{ first_name }}</h1>
<p><a href="{{ dashboard_url }}">Open your dashboard</a></p>
```

Important version note from the maintainer docs:

- Current releases render `template_body` keys directly, so use `{{ first_name }}`.
- The older `{{ body.first_name }}` pattern only applies to versions `<= 0.4.0`.

The docs also recommend inline CSS for better email client compatibility.

## Send Attachments

The package accepts FastAPI `UploadFile` objects in `attachments`.

```python
from fastapi import FastAPI, File, Form, UploadFile
from pydantic import EmailStr
from fastapi_mail import FastMail, MessageSchema, MessageType

app = FastAPI()
fm = FastMail(conf)


@app.post("/email/with-attachment")
async def send_with_attachment(
    recipient: EmailStr = Form(...),
    file: UploadFile = File(...),
) -> dict[str, str]:
    message = MessageSchema(
        subject="Your uploaded file",
        recipients=[recipient],
        body="See attached file.",
        subtype=MessageType.plain,
        attachments=[file],
    )

    await fm.send_message(message)
    return {"status": "sent"}
```

For inline images or custom attachment headers, the docs show attachment dictionaries with keys such as `file`, `headers`, `mime_type`, and `mime_subtype`.

## Send More Than One Message

`FastMail.send_message()` can send a list of `MessageSchema` objects.

```python
from fastapi_mail import FastMail, MessageSchema, MessageType

fm = FastMail(conf)

messages = [
    MessageSchema(
        subject="Hello Alice",
        recipients=["alice@example.com"],
        body="Hi Alice",
        subtype=MessageType.plain,
    ),
    MessageSchema(
        subject="Hello Bob",
        recipients=["bob@example.com"],
        body="Hi Bob",
        subtype=MessageType.plain,
    ),
]

await fm.send_message(messages)
```

## Suppress Sending In Tests

The maintainer docs include a built-in capture mechanism for tests and local validation flows.

```python
from fastapi_mail import FastMail, MessageSchema, MessageType

fm = FastMail(conf)
fm.config.SUPPRESS_SEND = 1

message = MessageSchema(
    subject="Test message",
    recipients=["dev@example.com"],
    body="This should not leave the process.",
    subtype=MessageType.plain,
)

with fm.record_messages() as outbox:
    await fm.send_message(message)

assert len(outbox) == 1
assert outbox[0]["subject"] == "Test message"
```

## Common Pitfalls

- `MAIL_USERNAME`, `MAIL_PASSWORD`, and `MAIL_FROM` are separate settings. Do not assume your provider uses the same value for all three.
- Template rendering depends on `TEMPLATE_FOLDER` being configured correctly and `template_name` matching a real file.
- Current template examples use top-level keys from `template_body`; copying old `body.<key>` examples into `1.6.2` projects will fail.
- HTML email clients have weak CSS support. Prefer inline CSS instead of relying on external stylesheets.
- The maintainer docs still show `fastapi-mail[aioredis]` in one install page, while PyPI metadata for `1.6.2` advertises extras named `httpx` and `redis`. If you need Redis-backed email utilities, check the current package metadata before pinning extras.

## Official Sources

- Maintainer docs: `https://sabuhish.github.io/fastapi-mail/`
- Getting started and config reference: `https://sabuhish.github.io/fastapi-mail/getting-started/`
- Message schema and examples: `https://sabuhish.github.io/fastapi-mail/example/`
- PyPI package page: `https://pypi.org/project/fastapi-mail/`
