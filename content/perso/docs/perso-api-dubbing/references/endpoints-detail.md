# Perso API — Detailed Endpoint Reference

## Request Body Conventions

Most endpoints use **camelCase** for request bodies. Two exceptions use **snake_case**:
- `PUT /file/api/upload/video/external` — `space_seq`, `url`, `lang`
- `POST /file/api/v1/video-translator/external/metadata` — `space_seq`, `url`, `lang`

## Endpoint Summary

### File API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/file/api/upload/sas-token` | Get Azure Blob SAS token |
| PUT | `/file/api/upload/video` | Register uploaded video |
| PUT | `/file/api/upload/audio` | Register uploaded audio |
| PUT | `/file/api/upload/video/external` | Upload from YouTube/TikTok/GDrive |
| POST | `/file/api/v1/media/validate` | Pre-validate media metadata |
| POST | `/file/api/v1/video-translator/external/metadata` | Get external video metadata |

### Space API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/portal/api/v1/spaces` | List user's spaces |
| GET | `/portal/api/v1/spaces/{spaceSeq}` | Get space details |

### Dubbing API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/video-translator/api/v1/projects/spaces/{spaceSeq}/translate` | Request translation |
| GET | `/video-translator/api/v1/projects/{projectSeq}/spaces/{spaceSeq}` | Get project |
| GET | `/video-translator/api/v1/projects/spaces/{spaceSeq}` | List projects |
| DELETE | `/video-translator/api/v1/projects/{projectSeq}/spaces/{spaceSeq}` | Delete project |
| PATCH | `.../projects/{projectSeq}/spaces/{spaceSeq}/title` | Update title |
| PATCH | `.../projects/{projectSeq}/spaces/{spaceSeq}/access` | Update access |
| GET | `.../projects/{projectSeq}/spaces/{spaceSeq}/script` | Get script |
| GET | `.../projects/{projectSeq}/spaces/{spaceSeq}/download` | Download files |
| GET | `.../projects/{projectSeq}/space/{spaceSeq}/progress` | Poll progress |
| POST | `.../projects/{projectSeq}/spaces/{spaceSeq}/cancel` | Cancel project |
| GET | `.../projects/{projectSeq}/share` | Get share link |
| PATCH | `.../projects/{projectSeq}/share` | Toggle sharing |
| GET | `.../projects/{projectSeq}/spaces/{spaceSeq}/video-info` | Video metadata |
| GET | `.../projects/{projectSeq}/space/{spaceSeq}/export-history` | Export history |
| GET | `.../projects/{projectSeq}/spaces/{spaceSeq}/download-info` | Download availability |
| GET | `.../projects/{projectSeq}/spaces/{spaceSeq}/retranslation/status` | Retranslation status |
| GET | `.../projects/{projectSeq}/spaces/{spaceSeq}/used-features` | Used features |

### Editing API

| Method | Path | Description |
|--------|------|-------------|
| PATCH | `/video-translator/api/v1/project/{projectSeq}/audio-sentence/{sentenceSeq}` | Translate sentence |
| PATCH | `.../audio-sentence/{audioSentenceSeq}/generate-audio` | Generate audio |
| PUT | `.../audio-sentence/{audioSentenceSeq}/reset` | Reset translation |
| PUT | `.../audio-sentence/{audioSentenceSeq}/cancel` | Cancel translation |
| POST | `.../audio-sentence/{audioSentenceSeq}/temp-save` | Save draft |
| POST | `.../audio-sentence/{audioSentenceSeq}/match-rewrite` | Get match rate |
| POST | `.../project/{projectSeq}/space/{spaceSeq}/proofread` | Request proofread |

### Lip Sync API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/video-translator/api/v1/projects/{projectSeq}/spaces/{spaceSeq}/lip-sync` | Request lip sync |
| GET | `.../lip-sync/generated` | Generation history |

### Usage API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/video-translator/api/v1/projects/spaces/{spaceSeq}/plan/status` | Get quota |
| GET | `.../spaces/{spaceSeq}/media/quota` | Estimate quota |
| PUT | `.../spaces/{spaceSeq}/queue` | Init/get queue |

### Language API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/video-translator/api/v1/languages` | List supported languages |

### Feedback API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/video-translator/api/v1/projects/feedbacks` | Submit feedback |
| GET | `/video-translator/api/v1/projects/feedbacks` | Get feedback |

### Community Spotlight API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/video-translator/api/v1/projects/recommended` | List featured projects |
| GET | `.../recommended/{projectSeq}` | Get featured project |
| GET | `.../shared/{sharedQuery}` | Get shared project |

## Supported External Platforms

| Platform | URL Patterns |
|----------|-------------|
| YouTube | `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/` |
| TikTok | `tiktok.com/@{user}/video/{id}` |
| Google Drive | `drive.google.com/file/d/{id}/` |

## Matching Rate Levels

Translation quality is measured by matching rate:

| Level | Type | Description |
|-------|------|-------------|
| 1 | VERY_LOW | Poor timing match |
| 2 | LOW | Below target |
| 3 | GOOD | Acceptable |
| 4 | EXCELLENT | Strong match |
| 5 | PERFECT | Optimal timing |

## Member Roles

| Role | Description |
|------|-------------|
| space_owner | Space owner |
| space_member | Space member |
| individual | Individual plan user |
