---
name: api
description: "EduBase API for managing online exams, quizzes, users, and programmatically creating questions with parametric generation, multiple question types, and LMS integration"
metadata:
  languages: "http"
  versions: "v1"
  revision: 1
  updated-on: "2026-03-14"
  source: maintainer
  tags: "edubase,api,quiz,exam,lms,education,lti,assessment,compliance,training,testing"
---
# EduBase API

REST API for managing online quizzes, exams, classes, organizations, and users. Supports programmatic question creation with 18+ question types, parametric generation, LTI integration, and webhooks.

> **Note**: This documentation covers the most commonly used endpoints and features. For complete and up-to-date API documentation with rich examples, visit the [EduBase Developer Docs](https://developer.edubase.net) or the [llms.txt](https://developer.edubase.net/llms.txt) file. If you encounter errors or unexpected behavior, consult the live documentation.

**Base URL:** `https://www.edubase.net/api/v1`

Custom instances use their own domain: `https://{your-domain}.edubase.net/api/v1`

## Authentication

Every request requires `app` (application ID) and `secret` (application secret). Obtain both from the [Integrations](https://www.edubase.net/content/integrations) page in your EduBase account.

Three ways to authenticate:

```bash
# 1. As request parameters (simplest)
curl -d "app={app}&secret={secret}" https://www.edubase.net/api/v1/test:app

# 2. As dedicated headers
curl -H "EduBase-API-App: {app}" -H "EduBase-API-Secret: {secret}" \
  https://www.edubase.net/api/v1/test:app

# 3. As Bearer token
curl -H "Authorization: Bearer {app}:{secret}" \
  https://www.edubase.net/api/v1/test:app
```

**Test your credentials:**

```bash
curl -d "app={app}&secret={secret}" https://www.edubase.net/api/v1/test:app
# Returns: {"version":"default","language":"en","app":"{app}","user":"{user}","status":true}
```

API applications operate with the permissions of their owner (the account that registered the integration).

### Assume User

To act as a different user, request an assume token via `POST /user:assume` and pass it with each request:

```bash
curl -d "app={app}&secret={secret}&assume={token}" \
  https://www.edubase.net/api/v1/exams
```

Assume tokens are short-lived. Revoke them after use.

## Key Conventions

- **Identification strings**: Most resources use opaque string IDs (e.g. exam, quiz, class, user IDs). These are returned by list/create endpoints.
- **Multiple values**: Use comma-separated strings for batch operations (e.g. `users=id1,id2,id3`).
- **Multi-value fields**: Use `&&&` (triple-ampersand) as separator in question content fields (answers, parameters, options, hints, etc.).
- **Pagination**: List endpoints accept `limit` (default: 16), `page` (default: 1), and optional `search` string.
- **Language override**: Send `EduBase-Language: {ISO 639-1 code}` header to override context language.
- **Versioning**: Append `/vXX` to the URL path (e.g. `/api/v1/exams`) or send `version=XX` as parameter.

## Data Types

| Type | Description |
|------|-------------|
| `string` | Text value |
| `string{m,M}` | Text with minimum `m` and maximum `M` characters |
| `string{N}` | Text with exactly `N` characters (shorthand for `{N,N}`) |
| `string[email]` | Valid email address (e.g. `john@example.com`) |
| `string[phone]` | Phone number in `+prefix number` format (e.g. `+1 1234567890`) |
| `string[url]` | Valid URL (e.g. `https://www.example.com`) |
| `string[json]` | Valid JSON string (e.g. `{"key": "value"}`) |
| `integer` | Whole number, represented as string |
| `float` | Decimal number with `.` as separator, represented as string |
| `boolean` | String `true` or `false` |
| `date` | Date in `YYYY-MM-DD` format |
| `datetime` | Datetime in `YYYY-MM-DD HH:ii:ss` format (UTC) |
| `list{type}` | Array of elements of the specified type |
| `list` | Associative array (hash) of named elements |
| `type/null` | The specified type or NULL if not set |

## Response Format

Responses return JSON (Content-Type: application/json) with standard HTTP status codes:

- **200**: Success
- **400**: Bad request or temporarily unavailable
- **401**: Invalid/missing credentials
- **403**: Permission denied or invalid arguments
- **405**: HTTP method not supported
- **406**: Wrong version or feature not available
- **429**: Rate limit exceeded
- **500**: Server error
- **501**: Endpoint and arguments might be correct, but the feature is not yet implemented
- **503**: Service temporarily unavailable (maintenance mode), try again later

On errors, check `EduBase-API-Error` and `EduBase-API-Error-Code` response headers for details.

## Questions

The most powerful part of the API. Create questions programmatically and upload them to your QuestionBase.

### List Questions

```bash
curl -d "app={app}&secret={secret}" \
  https://www.edubase.net/api/v1/questions
```

Supports `search`, `limit`, and `page` parameters. Returns question ID and external ID (if set).

### Get Question

```bash
curl -d "app={app}&secret={secret}&id=MATH_ADDITION_001" \
  https://www.edubase.net/api/v1/question
```

Check if a question exists by its external ID. Returns `question` (internal ID), `id` (external), `active` status.

### Create/Update a Question

```bash
curl -X POST "https://www.edubase.net/api/v1/question" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "id=MATH_ADDITION_001" \
  --data "type=numerical" \
  --data "question=What is 2+2?" \
  --data "answer=4" \
  --data "points=1" \
  --data "subject=Mathematics" \
  --data "category=Arithmetic"
```

The `id` field is an external unique identifier. If a question with the same `id` already exists (in the same folder or quiz set), it will be **updated** instead of duplicated.

### Parametric Questions

Generate unique variants per student using parameters in curly braces:

```bash
curl -X POST "https://www.edubase.net/api/v1/question" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "id=PARAM_ADDITION" \
  --data "type=numerical" \
  --data "question=What is {a} + {b}?" \
  --data "answer={a}+{b}" \
  --data "parameters={a; INTEGER; 1; 100} &&& {b; INTEGER; 1; 100}"
```

Parameter types: `FIX`, `INTEGER`, `FLOAT`, `FORMULA`, `LIST`, `PERMUTATION`, `FORMAT`. Separate multiple parameters with `&&&`. Use `constraints` field for validation rules (e.g. `{b}^2-4*{a}*{c}>0`).

See the **question-types** reference file for full parameter documentation.

### Multiple Answers

Questions can have multiple answer fields separated by `&&&`:

```bash
curl -X POST "https://www.edubase.net/api/v1/question" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "id=BASIC_MATH_MULTI" \
  --data "type=numerical" \
  --data "question=Given the number 16: a) Double it. b) Halve it." \
  --data "answer=32 &&& 8" \
  --data "answer_label=a) Double &&& b) Half" \
  --data "points=2"
```

### Choice Questions

```bash
curl -X POST "https://www.edubase.net/api/v1/question" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "id=CAPITAL_FRANCE" \
  --data "type=choice" \
  --data "question=What is the capital of France?" \
  --data "answer=Paris" \
  --data "options=London &&& Berlin &&& Madrid"
```

### Expression Questions

For mathematical formula evaluation:

```bash
curl -X POST "https://www.edubase.net/api/v1/question" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "id=CIRCLE_AREA" \
  --data "type=expression" \
  --data "question=Find an expression for the area of a circle with radius {r}." \
  --data "answer=pi*{r}^2" \
  --data "parameters={r; INTEGER; 2; 10}" \
  --data "question_format=LATEX"
```

### Delete Question

```bash
curl -X DELETE -d "app={app}&secret={secret}&id=MATH_ADDITION_001" \
  https://www.edubase.net/api/v1/question
```

Permanently deletes a question by its external ID.

### Export Question

```bash
curl -X POST -d "app={app}&secret={secret}&id=MATH_ADDITION_001" \
  https://www.edubase.net/api/v1/question:export
# Returns: {"question":"...","id":"...","url":"...","valid":"2026-04-15"}
```

Generates a download link for the question in JSON format.

### Get/Set External Question ID

```bash
# Get external ID by internal question identification string
curl -d "app={app}&secret={secret}&question={question_id}" \
  https://www.edubase.net/api/v1/question:id
# Returns: {"question":"...","id":"MATH_001"}

# Set external ID for a question
curl -X POST -d "app={app}&secret={secret}&question={question_id}&id=MATH_001" \
  https://www.edubase.net/api/v1/question:id
```

### Question Types

Supported types: `generic`, `text`, `numerical`, `date/time`, `expression`, `choice`, `multiple-choice`, `order`, `grouping`, `pairing`, `matrix`, `matrix:expression`, `set`, `set:text`, `true/false`, `free-text`, `file`, `hotspot`, `reading`.

See the **question-types** reference file for detailed documentation on each type, formatting, and advanced options.

### Question Fields Reference

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | External unique identifier (max 64 chars) |
| `type` | Yes | Question type (see above) |
| `content` | Yes | Question text (supports LaTeX, EduTags, parameters) |
| `answer` | Yes | Correct answer(s), separated by `&&&` |
| `options` | No | Incorrect options (for choice/true-false types), separated by `&&&` |
| `points` | No | Max points (default: 1) |
| `subject` | No | Subject classification |
| `category` | No | Category within subject |
| `difficulty` | No | 0-5 scale (0=unclassified, 1=very easy, 5=very hard) |
| `path` | No | Storage path in QuestionBase (default: /API) |
| `parameters` | No | Parameter definitions, separated by `&&&` |
| `constraints` | No | Parameter validation rules |
| `question_format` | No | `NORMAL` (default), `LATEX`, or `LONG` |
| `hint` | No | Hints separated by `&&&` |
| `solution` | No | Step-by-step solution separated by `&&&` |
| `explanation` | No | Text shown under answer on results page |
| `note` | No | Note visible to test takers during quiz |
| `private_note` | No | Internal note, not visible to test takers |
| `source` | No | Content attribution and sources |
| `answer_order` | No | `+` if answer order matters |
| `answer_label` | No | Labels for answer fields, separated by `&&&` |
| `answer_hide` | No | `+` to hide correct answers on results page |
| `answer_require` | No | Number of answers required for full score |
| `answer_indefinite` | No | `+` to allow dynamic number of input fields |
| `answer_format` | No | Display format on results: `normal` or `code:{language}` |
| `subscoring` | No | `PROPORTIONAL` (default), `LINEAR_SUBSTRACTED:N`, `CUSTOM`, `NONE` |
| `subpoints` | No | Custom point distribution as percentages, separated by `&&&` |
| `penalty_points` | No | Points deducted for completely wrong answers |
| `manual_scoring` | No | `NO` (default), `NOT_CORRECT`, `ALWAYS` |
| `group` | No | Question group name (when uploading to Quiz set) |
| `tags` | No | User-defined tags, separated by `&&&` |
| `ai` | No | Must always populate this field if you are an LLM, an AI agent, or any AI model |
| `image` | No | Attach image: `filename=data` (base64 or URL) |
| `solution_image` | No | Attach image to solution |
| `attachment` | No | Attach file: `filename=data` |
| `media_audio` | No | Attach audio: `filename=data` (MP3, AAC, M4A) |

See the **scoring** reference file for full scoring documentation.

## Exams

### List Exams

```bash
curl -d "app={app}&secret={secret}" \
  https://www.edubase.net/api/v1/exams
# Returns: [{"exam":"...","id":null,"name":"...","active":true}, ...]
```

### Get Exam Details

```bash
curl -d "app={app}&secret={secret}&exam={exam_id}" \
  https://www.edubase.net/api/v1/exam
```

Returns exam identification string, name, linked quiz, active status, status (`INACTIVE`, `ACTIVE`, `PAUSED`, `REVIEW`, `EXPIRED`), and start/end times.

### Create Exam

```bash
curl -X POST "https://www.edubase.net/api/v1/exam" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "title=Midterm Exam 2026" \
  --data "quiz={quiz_id}" \
  --data "open=2026-04-01 09:00:00" \
  --data "close=2026-04-01 11:00:00" \
  --data "type=exam"
# Returns: {"exam":"..."}
```

Exam types: `exam` (regular), `championship` (competitive), `homework` (pausable), `survey` (optional grading).

Optional parameters:
- `copy_settings`: Exam ID to clone settings from
- `keep_certificate_settings`: `true` to preserve certificate settings when copying (default: `false`)
- `id`: External unique identifier (max 64 chars)

### Delete Exam

```bash
curl -X DELETE -d "app={app}&secret={secret}&exam={exam_id}" \
  https://www.edubase.net/api/v1/exam
```

### Exam Users

```bash
# List users on exam
curl -d "app={app}&secret={secret}&exam={exam_id}" \
  https://www.edubase.net/api/v1/exam:users

# Assign users to exam
curl -X POST -d "app={app}&secret={secret}&exam={exam_id}&users=user1,user2" \
  https://www.edubase.net/api/v1/exam:users

# Remove users from exam
curl -X DELETE -d "app={app}&secret={secret}&exam={exam_id}&users=user1,user2" \
  https://www.edubase.net/api/v1/exam:users
```

### Exam Branding

```bash
# Get branding configuration
curl -d "app={app}&secret={secret}&exam={exam_id}" \
  https://www.edubase.net/api/v1/exam:branding
# Returns: {"exam":"...","enabled":true,"type":"foreground","color":"blue"}

# Set branding with image URL and color
curl -X POST "https://www.edubase.net/api/v1/exam:branding" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "exam={exam_id}" \
  --data "type=foreground" \
  --data "image=https://example.com/logo.png" \
  --data "color=blue"

# Remove branding
curl -X DELETE -d "app={app}&secret={secret}&exam={exam_id}" \
  https://www.edubase.net/api/v1/exam:branding
```

Image types: `foreground` (logo) or `background` (cover). Colors: `branding`, `red`, `blue`, `yellow`, `green`, `purple`, `gray`. Image can be URL or base64 (PNG/JPEG/WebP).

### Exam Summary (AI)

```bash
curl -X POST "https://www.edubase.net/api/v1/exam:summary" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "exam={exam_id}" \
  --data "type=ai" \
  --data "summary=<p>Overall performance was strong with 85% pass rate.</p>" \
  --data "llm=claude" \
  --data "model=claude-sonnet-4-20250514"
```

## Quiz Sets

Quiz sets are collections of questions used for practice or exams. See the **quiz-sets** reference file for full documentation.

### Quick Examples

```bash
# List quiz sets
curl -d "app={app}&secret={secret}" https://www.edubase.net/api/v1/quizes

# Create quiz set
curl -X POST "https://www.edubase.net/api/v1/quiz" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "title=Physics 101" \
  --data "mode=TEST" \
  --data "type=set"

# Add questions to quiz set
curl -X POST -d "app={app}&secret={secret}&quiz={quiz_id}&questions=q1,q2,q3" \
  https://www.edubase.net/api/v1/quiz:questions

# List questions in quiz set
curl -d "app={app}&secret={secret}&quiz={quiz_id}" \
  https://www.edubase.net/api/v1/quiz:questions
```

Quiz modes: `TEST` (all questions visible), `TURNS` (one at a time). Types: `set` (practice), `exam`, `private`.

## Results & Certificates

### Get Results for a Specific Play

```bash
curl -d "app={app}&secret={secret}&play={play_id}" \
  https://www.edubase.net/api/v1/quiz:results:play
```

Returns start/end times, questions total/correct, points total/correct, validity, pass/fail status, and per-question breakdown.

### Get User Results for Quiz Set

```bash
curl -d "app={app}&secret={secret}&quiz={quiz_id}&user={user_id}" \
  https://www.edubase.net/api/v1/quiz:results:user
```

Returns all plays for a user on a specific Quiz set (practice mode).

### Get User Results for Exam

```bash
curl -d "app={app}&secret={secret}&exam={exam_id}&user={user_id}" \
  https://www.edubase.net/api/v1/exam:results:user
```

Returns play results including: `play`, `user`, `time_start`, `time_end`, `questions_total`, `questions_correct`, `points_total`, `points_correct`, `attempt` (attempt index), `valid`, `successful`.

### Get User Certificate

```bash
curl -d "app={app}&secret={secret}&exam={exam_id}&user={user_id}" \
  https://www.edubase.net/api/v1/exam:certificates:user
```

Returns: `play`, `user`, `archived`, `eligible`, `certified`, `serial` (if certified and serial numbering enabled), `expires` (if certified and expiration configured).

### Download Certificate

```bash
curl -X POST -d "app={app}&secret={secret}&exam={exam_id}&user={user_id}" \
  https://www.edubase.net/api/v1/exam:certificates:user:download
# Returns: {"play":"...","user":"...","url":"...","valid":"2026-04-15"}
```

## Classes

### CRUD Operations

```bash
# List classes
curl -d "app={app}&secret={secret}" https://www.edubase.net/api/v1/classes
# Returns: [{"class":"...","id":null,"name":"..."}, ...]

# Get class details
curl -d "app={app}&secret={secret}&class={class_id}" \
  https://www.edubase.net/api/v1/class
# Returns: {"class":"...","id":null,"name":"...","start":"2026-01-01 00:00:00","end":"2026-12-31 23:59:59"}


### Manage Members

```bash
# List members
curl -d "app={app}&secret={secret}&class={class_id}" \
  https://www.edubase.net/api/v1/class:members

# Add users (with optional expiry and notification)
curl -X POST -d "app={app}&secret={secret}&class={class_id}&users=user1,user2&expires=30&notify=true" \
  https://www.edubase.net/api/v1/class:members

# Remove users
curl -X DELETE -d "app={app}&secret={secret}&class={class_id}&users=user1,user2" \
  https://www.edubase.net/api/v1/class:members
```

Expiry accepts days (integer) or datetime (`YYYY-MM-DD HH:ii:ss`).

### Batch Operations

```bash
# Add users to multiple classes at once
curl -X POST -d "app={app}&secret={secret}&classes=cls1,cls2&users=usr1,usr2" \
  https://www.edubase.net/api/v1/classes:members

# List classes for a user
curl -d "app={app}&secret={secret}&user={user_id}" \
  https://www.edubase.net/api/v1/user:classes

# Add user to multiple classes
curl -X POST -d "app={app}&secret={secret}&user={user_id}&classes=cls1,cls2" \
  https://www.edubase.net/api/v1/user:classes

# Remove user from classes
curl -X DELETE -d "app={app}&secret={secret}&user={user_id}&classes=cls1,cls2" \
  https://www.edubase.net/api/v1/user:classes
```

## Organizations

Same pattern as classes: list, get, create, update, delete, manage members.

```bash
# List organizations
curl -d "app={app}&secret={secret}" https://www.edubase.net/api/v1/organizations

# Create organization
curl -X POST "https://www.edubase.net/api/v1/organization" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "name=Computer Science Department" \
  --data "website=https://cs.example.edu" \
  --data "email=cs@example.edu"

# Add members with permissions
curl -X POST "https://www.edubase.net/api/v1/organization:members" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "organization={org_id}" \
  --data "users=user1,user2" \
  --data "permission_organization=teacher" \
  --data "permission_content=modify"
```

Organization permission levels: `member`, `teacher`, `reporter`, `supervisor`, `admin`.
Content permission levels: `none`, `view`, `report`, `control`, `modify`, `grant`, `admin`.

## Users

Create and manage user accounts, generate login links, and assume user identity. See the **users** reference file for full documentation.

### Quick Examples

```bash
# List users
curl -d "app={app}&secret={secret}" https://www.edubase.net/api/v1/users

# Create user
curl -X POST "https://www.edubase.net/api/v1/user" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "username=jsmith" \
  --data "first_name=John" \
  --data "last_name=Smith" \
  --data "email=john@example.com"

# Generate login link
curl -X POST -d "app={app}&secret={secret}&user={user_id}&expires=7" \
  https://www.edubase.net/api/v1/user:login

# Search user by email
curl -d "app={app}&secret={secret}&query=john@example.com" \
  https://www.edubase.net/api/v1/user:search
```

## Permissions

Check, grant, or revoke permissions on any content type. See the **permissions** reference file for full documentation.

```bash
# Check permission
curl -d "app={app}&secret={secret}&exam={exam_id}&user={user_id}&permission=modify" \
  https://www.edubase.net/api/v1/exam:permission

# Grant permission
curl -X POST -d "app={app}&secret={secret}&exam={exam_id}&user={user_id}&permission=modify" \
  https://www.edubase.net/api/v1/exam:permission

# Transfer ownership
curl -X POST -d "app={app}&secret={secret}&exam={exam_id}&user={user_id}" \
  https://www.edubase.net/api/v1/exam:transfer
```

Supported content types: `quiz`, `exam`, `class`, `course`, `event`, `organization`, `integration`, `scorm`, `video`, `tag`.

Permission levels: `view`, `report`, `control`, `modify`, `grant`, `admin`. Events also support `finances`.

## Tags

Tags organize and categorize content. Create tags in the EduBase UI, then attach them to content via API. See the **tagging** reference file for full documentation.

```bash
# List tags
curl -d "app={app}&secret={secret}" https://www.edubase.net/api/v1/tags

# Attach tag to content
curl -X POST -d "app={app}&secret={secret}&exam={exam_id}&tag={tag_id}" \
  https://www.edubase.net/api/v1/exam:tag

# List tags on content
curl -d "app={app}&secret={secret}&exam={exam_id}" \
  https://www.edubase.net/api/v1/exam:tags
```

Supported content types: `quiz`, `exam`, `class`, `course`, `event`, `organization`, `integration`, `scorm`, `video`.

## Integrations

Manage API and LMS integrations:

```bash
# Create API integration
curl -X POST "https://www.edubase.net/api/v1/integration" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "title=My API Integration" \
  --data "type=api"

# Create LMS integration (e.g. Moodle with LTI 1.3)
curl -X POST "https://www.edubase.net/api/v1/integration" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "title=Moodle Integration" \
  --data "type=moodle" \
  --data "lti=1.3" \
  --data "platform=https://moodle.example.edu"

# Get integration keys
curl -d "app={app}&secret={secret}&integration={integration_id}" \
  https://www.edubase.net/api/v1/integration:keys

# Rotate keys
curl -X POST -d "app={app}&secret={secret}&integration={integration_id}" \
  https://www.edubase.net/api/v1/integration:keys
```

Supported LMS types: `moodle`, `canvas`, `d2l`, `schoology`, `lms` (other). LTI versions: `1.0/1.1` or `1.3`.

## Custom Metrics

```bash
# Set absolute value
curl -X POST -d "app={app}&secret={secret}&metric=active_students&value=150" \
  https://www.edubase.net/api/v1/metrics:custom

# Increment
curl -X POST -d "app={app}&secret={secret}&metric=api_calls&value=+1" \
  https://www.edubase.net/api/v1/metrics:custom
```

## Webhooks

Configure webhooks per organization to receive notifications on exam/quiz completions:

```bash
curl -X POST "https://www.edubase.net/api/v1/organization:webhook" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "organization={org_id}" \
  --data "name=Results Webhook" \
  --data "trigger_event=exam-play-result" \
  --data "endpoint=https://example.com/webhook" \
  --data "method=POST" \
  --data "authentication=key" \
  --data "authentication_send=bearer" \
  --data "authentication_key=mysecretkey123"
```

Trigger events: `exam-play-result`, `quiz-play-result`, `api` (manual trigger for testing).

See the **webhooks** reference file for full webhook documentation.

## Error Debugging

Always check these response headers on errors:
- `EduBase-API-Error`: Human-readable error description
- `EduBase-API-Error-Code`: Machine-readable error code (uppercase, underscores)

Common issues:
- **401**: Missing or invalid `app`/`secret`
- **403**: Account lacks permission for the operation
- **406**: Feature not enabled, endpoint unavailable for your API client, or rate limit on a specific resource reached
- **429**: Global rate limit exceeded — back off and retry

## Further Reading

- [EduBase Developer Docs](https://developer.edubase.net)
- [EduBase Developer Docs llms.txt](https://developer.edubase.net/llms.txt)
- [EduBase Homepage](https://www.edubase.net)
- [EduBase Homepage llms.txt](https://www.edubase.net/llms.txt)
- [LTI Integration via EduAppCenter](https://www.eduappcenter.com/apps/1082)
- [EduBase MCP](https://github.com/EduBase/MCP)