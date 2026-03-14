# Content Tagging

Tags organize and categorize content in EduBase. Create tags via the EduBase UI, then attach them to content via API.

## Supported Content Types

Tags can be attached to: `class`, `course`, `event`, `exam`, `integration`, `organization`, `quiz`, `scorm`, `video`.

## List Tags

```bash
curl -d "app={app}&secret={secret}" https://www.edubase.net/api/v1/tags
```

Returns: `[{"tag":"...","id":null,"name":"..."}, ...]`

Supports `search`, `limit` (default: 16), and `page` parameters.

## Get Tag Details

```bash
curl -d "app={app}&secret={secret}&tag={tag_id}" \
  https://www.edubase.net/api/v1/tag
```

Returns:
```json
{
  "tag": "...",
  "id": null,
  "name": "Mathematics",
  "color": "#FF5733",
  "icon": "fa-book"
}
```

## List Tags on Content

```bash
curl -d "app={app}&secret={secret}&exam={exam_id}" \
  https://www.edubase.net/api/v1/exam:tags
```

Returns: `[{"tag":"...","name":"..."}, ...]`

## Check Tag Attachment

```bash
curl -d "app={app}&secret={secret}&exam={exam_id}&tag={tag_id}" \
  https://www.edubase.net/api/v1/exam:tag
```

Returns:
```json
{
  "tag": "...",
  "content": {
    "type": "exam",
    "code": "...",
    "id": null
  },
  "status": true
}
```

## Attach Tag to Content

```bash
curl -X POST -d "app={app}&secret={secret}&exam={exam_id}&tag={tag_id}" \
  https://www.edubase.net/api/v1/exam:tag
```

Returns: `{"tag":"...","content":{...},"success":true}`

## Detach Tag from Content

```bash
curl -X DELETE -d "app={app}&secret={secret}&exam={exam_id}&tag={tag_id}" \
  https://www.edubase.net/api/v1/exam:tag
```

Returns: `{"tag":"...","content":{...},"success":true}`

## Endpoint Patterns

All content types follow the same pattern. Replace `{type}` with the content type:

| Operation | Method | Endpoint |
|-----------|--------|----------|
| List tags on content | GET | `/{type}:tags` |
| Check tag attachment | GET | `/{type}:tag` |
| Attach tag | POST | `/{type}:tag` |
| Detach tag | DELETE | `/{type}:tag` |

### Examples for Different Content Types

```bash
# List tags on a quiz
curl -d "app={app}&secret={secret}&quiz={quiz_id}" \
  https://www.edubase.net/api/v1/quiz:tags

# Attach tag to class
curl -X POST -d "app={app}&secret={secret}&class={class_id}&tag={tag_id}" \
  https://www.edubase.net/api/v1/class:tag

# Check tag on organization
curl -d "app={app}&secret={secret}&organization={org_id}&tag={tag_id}" \
  https://www.edubase.net/api/v1/organization:tag

# Detach tag from video
curl -X DELETE -d "app={app}&secret={secret}&video={video_id}&tag={tag_id}" \
  https://www.edubase.net/api/v1/video:tag

# List tags on SCORM
curl -d "app={app}&secret={secret}&scorm={scorm_id}" \
  https://www.edubase.net/api/v1/scorm:tags
```

## Required Parameters

| Parameter | Description |
|-----------|-------------|
| `{type}` | Content identification string (e.g. `exam`, `quiz`, `class`) |
| `tag` | Tag identification string |
