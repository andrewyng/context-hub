# Scoring & Grading

## Points

Set maximum points with `points` field (default: 1). For questions with multiple answers, points are distributed according to the subscoring method.

## Partial Credit (Subscoring)

The `subscoring` field controls how partial credit is calculated. Not applicable for `choice`, `reading`, and `free-text` types.

**PROPORTIONAL** (default) — Points awarded proportionally to correct answers.

**LINEAR_SUBSTRACTED:N** — Linear scoring with N points subtracted per error.

```bash
--data "subscoring=LINEAR_SUBSTRACTED:2"
```

**CUSTOM** — Custom point distribution. Requires `subpoints` field with percentages separated by `&&&`.

```bash
# First answer worth 50%, second 25%, third 25%
--data "points=4" \
--data "subscoring=CUSTOM" \
--data "subpoints=50 &&& 25 &&& 25"
# Yields: 2 points for first, 1 for second, 1 for third
```

**NONE** — All-or-nothing. No partial credit.

## Penalty Scoring

### Penalty Methods

`penalty_scoring` field:
- `DEFAULT`: Standard penalty behavior (varies by type)
- `PER_ANSWER`: Penalty applied for each incorrect answer
- `PER_QUESTION`: Penalty applied once per question

### Penalty Points

`penalty_points` — Points deducted for completely incorrect answers. No penalty for partially correct or unanswered questions. Use positive values.

```bash
--data "penalty_scoring=PER_ANSWER" \
--data "penalty_points=2"
```

## Assistance Penalties

### Hint Penalties

`hint_penalty` field:
- `NONE`: No penalty (default)
- `ONCE:N`: Single deduction regardless of hints used (N as percentage)
- `PER-HELP:N`: Deduction per hint used

```bash
# 10% penalty per hint used
--data "hint_penalty=PER-HELP:10%"
# or equivalently
--data "hint_penalty=PER-HELP:0.1"
```

### Solution Penalties

`solution_penalty` — Same format as hint_penalty. Applied when student views solution steps.

```bash
# 50% penalty for viewing solution (any number of steps)
--data "solution_penalty=ONCE:50%"
```

### Video Penalties

`video_penalty` — Same format as hint_penalty, except `PER-HELP` not available.

```bash
--data "video_penalty=ONCE:15%"
```

## Manual Scoring

`manual_scoring` field (not applicable for `reading` and `free-text`):
- `NO`: Never (default)
- `NOT_CORRECT`: Only manually score incorrect answers
- `ALWAYS`: Always require manual scoring

## Full Scoring Example

```bash
curl -X POST "https://www.edubase.net/api/v1/question" \
  --data "app={app}&secret={secret}" \
  --data "id=SCORED_PROBLEM" \
  --data "type=expression" \
  --data "question=Find the area of a circle with radius {r}." \
  --data "answer=pi*{r}^2" \
  --data "parameters={r; INTEGER; 2; 10}" \
  --data "points=10" \
  --data "hint=Think about the formula for circle area &&& Remember that area involves squaring the radius" \
  --data "solution=The formula for circle area is pi*r^2 = pi*{r}^2" \
  --data "penalty_scoring=PER_ANSWER" \
  --data "penalty_points=3" \
  --data "hint_penalty=PER-HELP:10%" \
  --data "solution_penalty=ONCE:50%"
```

This configuration:
- Awards up to 10 points for a correct expression
- Deducts 3 points for a completely wrong answer
- Each hint used costs 10% of 10 = 1 point
- Viewing solution costs 50% of 10 = 5 points (once, regardless of steps viewed)