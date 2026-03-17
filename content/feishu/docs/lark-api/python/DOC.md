---
name: lark-api
description: "Feishu/Lark Open Platform API for messaging, calendar, documents, bitable, and drive — using the official lark-oapi Python SDK"
metadata:
  languages: "python"
  versions: "2.3.0"
  updated-on: "2026-03-17"
  source: community
  tags: "feishu,lark,messaging,calendar,documents,bitable,im,china"
---

# Feishu / Lark Open Platform — Python SDK Coding Guidelines

You are a Feishu/Lark API coding expert. Help write code using the official `lark-oapi` Python SDK.

Official docs: https://open.feishu.cn/document/home/index
SDK repo: https://github.com/larksuite/oapi-sdk-python

## Setup

```bash
pip install lark-oapi
```

```python
import lark_oapi as lark
from lark_oapi.api.im.v1 import *
from lark_oapi.api.calendar.v4 import *
from lark_oapi.api.bitable.v1 import *

client = lark.Client.builder() \
    .app_id("cli_xxx") \
    .app_secret("your_app_secret") \
    .build()
```

## Authentication

Feishu uses **App Access Token** (tenant-wide, auto-managed by SDK) or **User Access Token** (OAuth, required for user-visible calendar/drive operations).

```python
# User token via OAuth callback:
from lark_oapi.api.authen.v1 import CreateAccessTokenRequest, CreateAccessTokenRequestBody

request = CreateAccessTokenRequest.builder() \
    .request_body(CreateAccessTokenRequestBody.builder()
        .grant_type("authorization_code")
        .code("oauth_code_from_callback")
        .build()) \
    .build()
response = client.authen.v1.access_token.create(request)
user_access_token = response.data.access_token
```

## IM — Send Messages

```python
from lark_oapi.api.im.v1 import CreateMessageRequest, CreateMessageRequestBody

# Send text to a user
request = CreateMessageRequest.builder() \
    .receive_id_type("open_id") \
    .request_body(CreateMessageRequestBody.builder()
        .receive_id("ou_xxx")
        .msg_type("text")
        .content('{"text": "Hello!"}')
        .build()) \
    .build()
response = client.im.v1.message.create(request)

# Send to a group
request = CreateMessageRequest.builder() \
    .receive_id_type("chat_id") \
    .request_body(CreateMessageRequestBody.builder()
        .receive_id("oc_xxx")
        .msg_type("text")
        .content('{"text": "Hello group!"}')
        .build()) \
    .build()
```

## Calendar — Create Event (requires user token)

```python
from lark_oapi.api.calendar.v4 import CreateCalendarEventRequest, CalendarEvent, TimeInfo

event = CalendarEvent.builder() \
    .summary("Team Standup") \
    .start_time(TimeInfo.builder().timestamp("1710000000").timezone("Asia/Shanghai").build()) \
    .end_time(TimeInfo.builder().timestamp("1710003600").timezone("Asia/Shanghai").build()) \
    .build()

request = CreateCalendarEventRequest.builder() \
    .calendar_id("primary") \
    .request_body(event) \
    .build()

response = client.calendar.v4.calendar_event.create(
    request,
    option=lark.RequestOption.builder().user_access_token(user_token).build()
)
```

## Bitable — Read/Write Records

```python
from lark_oapi.api.bitable.v1 import ListAppTableRecordRequest, CreateAppTableRecordRequest, AppTableRecord

# List records
request = ListAppTableRecordRequest.builder() \
    .app_token("bascnXxx").table_id("tblXxx").page_size(20).build()
response = client.bitable.v1.app_table_record.list(request)
for record in response.data.items:
    print(record.record_id, record.fields)

# Create record
record = AppTableRecord.builder() \
    .fields({"Name": "Alice", "Score": 100}) \
    .build()
request = CreateAppTableRecordRequest.builder() \
    .app_token("bascnXxx").table_id("tblXxx").request_body(record).build()
response = client.bitable.v1.app_table_record.create(request)
```

## Error Handling

```python
if not response.success():
    print(f"Error {response.code}: {response.msg}")
    # 99991663 — token expired
    # 230013   — no permission
    # 1300012  — chat not found
```

## Webhook Event Handling

```python
from lark_oapi.event import EventDispatcherHandler
from lark_oapi.api.im.v1.model import P2ImMessageReceiveV1

def on_message(data: P2ImMessageReceiveV1):
    msg = data.event.message
    sender_id = data.event.sender.sender_id.open_id
    print(f"From {sender_id}: {msg.content}")

handler = EventDispatcherHandler.builder(
    encrypt_key="your_encrypt_key",
    verification_token="your_verification_token"
).register_p2_im_message_receive_v1(on_message).build()
```

## Common Pitfalls

- **`receive_id_type` must match the ID format**: `open_id` for `ou_xxx`, `chat_id` for `oc_xxx`
- **Calendar events need `user_access_token`**: App token cannot create user-visible events; pass token via `RequestOption`
- **Use `"primary"` for default calendar**: Not the calendar ID string
- **Bitable field types are strict**: Numbers must be `int`/`float`, dates must be millisecond timestamps (not ISO strings)
- **Webhook URL verification**: Feishu sends a `url_verification` challenge on first setup — respond with `{"challenge": data["challenge"]}`
