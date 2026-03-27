# Webhooks

Webhooks notify external systems about events in EduBase. Configured per organization.

## Create a Webhook

```bash
curl -X POST "https://www.edubase.net/api/v1/organization:webhook" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "organization={org_id}" \
  --data "name=Exam Results Webhook" \
  --data "trigger_event=exam-play-result" \
  --data "endpoint=https://example.com/webhook/edubase" \
  --data "method=POST" \
  --data "authentication=key" \
  --data "authentication_send=bearer" \
  --data "authentication_key=my_secret_token" \
  --data "retry=error"
```

Returns: `{"organization":"...","webhook":"..."}`

## Trigger Events

| Event | Description |
|-------|-------------|
| `exam-play-result` | User (org member) completes an exam |
| `quiz-play-result` | User (org member) completes a quiz in practice mode |
| `api` | Manual trigger via API — useful for testing |

## Authentication Options

`authentication` field:
- `none`: No authentication (default)
- `key`: Use a secret key/password

When `authentication=key`, configure how to send it:

`authentication_send` field:
- `header`: As a custom header (`authentication_send_header` specifies header name)
- `bearer`: As Bearer token in Authorization header
- `data`: As a data field (`authentication_send_data` specifies field name)

```bash
# Bearer token
--data "authentication=key" \
--data "authentication_send=bearer" \
--data "authentication_key=mysecret"

# Custom header
--data "authentication=key" \
--data "authentication_send=header" \
--data "authentication_send_header=X-Webhook-Secret" \
--data "authentication_key=mysecret"

# Data field
--data "authentication=key" \
--data "authentication_send=data" \
--data "authentication_send_data=webhook_token" \
--data "authentication_key=mysecret"
```

## Additional Options

- `extra_data`: JSON string sent with every notification
- `retry`: `none` (no retry) or `error` (delayed retry on failure, default)

## Manage Webhooks

```bash
# Get webhook details
curl -d "app={app}&secret={secret}&organization={org_id}&webhook={webhook_id}" \
  https://www.edubase.net/api/v1/organization:webhook

# Enable/disable
curl -X PATCH -d "app={app}&secret={secret}&organization={org_id}&webhook={webhook_id}&active=false" \
  https://www.edubase.net/api/v1/organization:webhook

# Delete
curl -X DELETE -d "app={app}&secret={secret}&organization={org_id}&webhook={webhook_id}" \
  https://www.edubase.net/api/v1/organization:webhook
```

## Test a Webhook

Trigger an `api`-type webhook manually with optional custom payload:

```bash
curl -X POST "https://www.edubase.net/api/v1/organization:webhook:trigger" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "organization={org_id}" \
  --data "webhook={webhook_id}" \
  --data 'data={"test": true, "message": "Hello from EduBase"}'
```

Only triggers webhooks where `trigger_event` is set to `api`.