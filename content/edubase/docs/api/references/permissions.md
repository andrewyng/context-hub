# Content Permissions

Check, grant, or revoke permissions on any content type. Permissions control who can view, modify, or manage content in EduBase.

## Supported Content Types

Permissions can be managed for: `class`, `course`, `event`, `exam`, `integration`, `organization`, `quiz`, `scorm`, `tag`, `video`.

## Permission Levels

| Level | Description |
|-------|-------------|
| `view` | View the content |
| `report` | View reports and analytics |
| `control` | Control settings (e.g. start/pause exams) |
| `modify` | Edit and modify content |
| `grant` | Grant permissions to others |
| `admin` | Full administrative access |
| `finances` | Financial access (events only) |

## Check Permission

```bash
curl -d "app={app}&secret={secret}&exam={exam_id}&user={user_id}&permission=modify" \
  https://www.edubase.net/api/v1/exam:permission
```

Returns:
```json
{
  "user": "...",
  "content": {
    "type": "exam",
    "code": "...",
    "id": null
  },
  "status": {
    "permission": true,
    "rule": true
  }
}
```

- `permission`: User has this permission (directly or inherited)
- `rule`: A specific permission rule exists with these exact parameters

## Grant Permission

```bash
curl -X POST -d "app={app}&secret={secret}&exam={exam_id}&user={user_id}&permission=modify" \
  https://www.edubase.net/api/v1/exam:permission
```

Returns: `{"user":"...","content":{...},"success":true}`

## Revoke Permission

```bash
curl -X DELETE -d "app={app}&secret={secret}&exam={exam_id}&user={user_id}&permission=modify" \
  https://www.edubase.net/api/v1/exam:permission
```

Returns: `{"user":"...","content":{...},"success":true}`

## Transfer Ownership

Transfer full ownership of content to another user:

```bash
curl -X POST -d "app={app}&secret={secret}&exam={exam_id}&user={user_id}" \
  https://www.edubase.net/api/v1/exam:transfer
```

Returns: `{"user":"...","content":{...},"success":true}`

## Endpoint Patterns

All content types follow the same pattern. Replace `{type}` with the content type:

| Operation | Method | Endpoint |
|-----------|--------|----------|
| Check permission | GET | `/{type}:permission` |
| Grant permission | POST | `/{type}:permission` |
| Revoke permission | DELETE | `/{type}:permission` |
| Transfer ownership | POST | `/{type}:transfer` |

### Examples for Different Content Types

```bash
# Quiz permissions
curl -d "app={app}&secret={secret}&quiz={quiz_id}&user={user_id}&permission=view" \
  https://www.edubase.net/api/v1/quiz:permission

# Class permissions
curl -X POST -d "app={app}&secret={secret}&class={class_id}&user={user_id}&permission=report" \
  https://www.edubase.net/api/v1/class:permission

# Organization transfer
curl -X POST -d "app={app}&secret={secret}&organization={org_id}&user={user_id}" \
  https://www.edubase.net/api/v1/organization:transfer

# SCORM permissions
curl -X DELETE -d "app={app}&secret={secret}&scorm={scorm_id}&user={user_id}&permission=modify" \
  https://www.edubase.net/api/v1/scorm:permission

# Video permissions
curl -d "app={app}&secret={secret}&video={video_id}&user={user_id}&permission=admin" \
  https://www.edubase.net/api/v1/video:permission
```

## Required Parameters

| Parameter | Description |
|-----------|-------------|
| `{type}` | Content identification string (e.g. `exam`, `quiz`, `class`) |
| `user` | User identification string |
| `permission` | Permission level (not required for transfer) |
