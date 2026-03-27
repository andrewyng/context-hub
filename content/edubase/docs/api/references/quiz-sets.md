# Quiz Sets

Create and manage Quiz sets (question collections) and assign questions to them.

## List Quiz Sets

```bash
curl -d "app={app}&secret={secret}" \
  https://www.edubase.net/api/v1/quizes
```

Returns owned and managed Quiz sets. Supports `search`, `limit` (default: 16), and `page` parameters.

Output per quiz: `quiz` (ID), `id` (external ID if set), `name`.

## Get Quiz Set

```bash
curl -d "app={app}&secret={secret}&quiz={quiz_id}" \
  https://www.edubase.net/api/v1/quiz
```

Returns: `quiz`, `id` (external), `name`.

## Create Quiz Set

```bash
curl -X POST "https://www.edubase.net/api/v1/quiz" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "title=Introduction to Physics" \
  --data "description=Basic physics concepts quiz" \
  --data "mode=TEST" \
  --data "type=set"
# Returns: {"quiz":"..."}
```

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Quiz set title |
| `language` | No | Quiz language |
| `id` | No | External unique identifier (max 64 chars) |
| `description` | No | Short description |
| `copy_settings` | No | Quiz ID to copy settings from |
| `copy_questions` | No | Quiz ID to copy questions from |
| `mode` | No | `TEST` (all questions at once, default) or `TURNS` (one at a time) |
| `type` | No | `set` (practice), `exam` (examination), `private` (testing) |

## Delete Quiz Set

```bash
curl -X DELETE -d "app={app}&secret={secret}&quiz={quiz_id}" \
  https://www.edubase.net/api/v1/quiz
```

## List Questions in Quiz

```bash
curl -d "app={app}&secret={secret}&quiz={quiz_id}" \
  https://www.edubase.net/api/v1/quiz:questions
```

Returns list of questions and question groups:

```json
[
  {"question": "...", "id": "MATH_001", "active": true},
  {"group": "Advanced Problems", "active": true},
  {"question": "...", "id": null, "active": false}
]
```

## Assign Questions to Quiz

```bash
curl -X POST "https://www.edubase.net/api/v1/quiz:questions" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "quiz={quiz_id}" \
  --data "questions=q1,q2,q3"
```

To assign to a specific question group within the quiz:

```bash
curl -X POST "https://www.edubase.net/api/v1/quiz:questions" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "quiz={quiz_id}" \
  --data "group=Advanced Problems" \
  --data "questions=q4,q5"
```

## Remove Questions from Quiz

```bash
curl -X DELETE -d "app={app}&secret={secret}&quiz={quiz_id}&questions=q1,q2" \
  https://www.edubase.net/api/v1/quiz:questions
```

To remove from a specific group:

```bash
curl -X DELETE -d "app={app}&secret={secret}&quiz={quiz_id}&group=Advanced Problems&questions=q4" \
  https://www.edubase.net/api/v1/quiz:questions
```

## Question Groups

Question groups organize questions within a Quiz set. They support three modes:

- **Random selection**: Randomly pick N questions from the group
- **Sequential**: Questions appear in order
- **Complex (mixed)**: All questions appear as one "big" question with sub-parts

When uploading questions via the API, use the `group` field to assign them to a group:

```bash
curl -X POST "https://www.edubase.net/api/v1/question" \
  --data "app={app}" \
  --data "secret={secret}" \
  --data "id=PHYSICS_MOTION_Q1" \
  --data "type=numerical" \
  --data "question=Calculate velocity given distance {d}m and time {t}s." \
  --data "answer={d}/{t}" \
  --data "parameters={d; INTEGER; 10; 100} &&& {t; INTEGER; 1; 10}" \
  --data "group=Kinematics Questions"
```

If the group doesn't exist, it's created automatically as a complex task. Configure group settings (type, question count, scoring) through the EduBase UI.

### Use Cases

**Balanced difficulty distribution:**
Create groups by difficulty, randomly select from each to ensure consistent exam difficulty.

**Reading comprehension:**
Group a passage (READING type) with its comprehension questions (CHOICE/TEXT types) to keep them together.

**Multi-part problems:**
Group related sub-questions that share parameters or context.
