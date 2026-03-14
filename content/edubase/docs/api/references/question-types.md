# Question Types & Parametric Generation

## Question Types Reference

### Basic Types

**GENERIC** — Strict exact matching including spaces and punctuation. Use for technical answers where precision matters (code keywords, chemical formulas).

**TEXT** — Text input with flexible matching. Ignores spaces and punctuation (`  apple.` matches `apple`). Good for fill-in-the-blank, vocabulary.

**NUMERICAL** — Numeric value validation. Handles integers, decimals, fractions (a/b), constants (pi, e). Supports interval responses `{from}-{to}`. Configure precision with `decimals` field (default: 2). Use `tolerance` for acceptable error ranges.

**DATE/TIME** — Calendar date validation. Adjustable precision: year (`YYYY`), month (`MM/YYYY`), day (`MM/DD/YYYY`). Configure with `datetime_precision`. Flexible input parsing — spaces, punctuation, slashes don't matter. Supports BC/AD dates and range responses.

**EXPRESSION** — Mathematical expression evaluation. Compares formulas symbolically/numerically. Supports parametrization. Configure with `expression_check` (`RANDOM`, `EXPLICIT`, `COMPARE`), `expression_variable` (default: `x`), `expression_decimals`, `expression_functions` (`+`/`-` to enable/disable function input).

**FREE-TEXT** — Extended text with semi-automatic grading. Supports keyword-based auto-rules. Falls back to manual grading for complex answers. Use `answer_format=code:python` (or other language) for syntax-highlighted display.

**READING** — Non-assessed text display. No scoring, no answer required. Used as the first question in a group to provide context for subsequent questions.

### Choice-Based Types

**CHOICE** — Single correct answer. Options randomized by default.

```bash
curl -X POST "https://www.edubase.net/api/v1/question" \
  --data "app={app}&secret={secret}" \
  --data "id=CHOICE_EXAMPLE" \
  --data "type=choice" \
  --data "question=What is the capital of France?" \
  --data "answer=Paris" \
  --data "options=London &&& Berlin &&& Madrid"
```

**MULTIPLE-CHOICE** — Multiple correct answers. Can limit max selections.

```bash
curl -X POST "https://www.edubase.net/api/v1/question" \
  --data "app={app}&secret={secret}" \
  --data "id=MULTI_CHOICE" \
  --data "type=multiple-choice" \
  --data "question=Which are citrus fruits?" \
  --data "answer=Lemon &&& Orange" \
  --data "options=Apple &&& Banana &&& Grape"
```

**TRUE/FALSE** — Statement evaluation. True statements in `answer`, false in `options`. Displayed in random order. Optionally add a third option.

```bash
curl -X POST "https://www.edubase.net/api/v1/question" \
  --data "app={app}&secret={secret}" \
  --data "id=TRUE_FALSE" \
  --data "type=true/false" \
  --data "answer=The Earth orbits the Sun &&& Water boils at 100°C at sea level" \
  --data "options=The Sun orbits the Earth &&& Sound travels faster than light"
```

**ORDER** — Sequence arrangement. Items from `answer` displayed randomly; user must arrange in correct order.

### Grouping Types

**GROUPING** — Assign elements to predefined groups. Groups in `answer`, elements in `answer_label` or via triple-arrow (`>>>`) in `answer`.

**PAIRING** — Match elements to pairs. Same syntax as grouping.

### Matrix & Set Types

**MATRIX** — Matrix/vector evaluation with numerical validation. Format: `[a11; a12 | a21; a22]` (semicolons separate columns, pipes separate rows).

**MATRIX:GENERIC** — Matrix with strict exact matching (like GENERIC type). Each element requires exact match including spaces and punctuation.

**MATRIX:EXPRESSION** — Each matrix element evaluated as an expression. For rotation matrices, Jacobians, etc.

**SET** — Unordered collection of numbers. Order and repetition don't matter.

**SET:TEXT** — Unordered collection of text elements.

### Special Types

**HOTSPOT** — Mark areas on an image. Not available to all users.

**FILE** — File upload with semi-automatic grading. Not available to all users.

## Parametric Question Generation

Parameters create unique question variants per student. Define in the `parameters` field, separated by `&&&`. Reference in question text and answers with `{name}`.

### Parameter Types

**FIX** — Constant value:
```
{pi; FIX; 3.14159}
```

**INTEGER** — Random whole number:
```
{a; INTEGER}                              # any integer
{a; INTEGER; 1; 100}                      # between 1 and 100
{a; INTEGER; -; -; [10-20]; [14-16]}      # 10-20, excluding 14-16
```

**FLOAT** — Random decimal:
```
{x; FLOAT; 2}                            # 2 decimal places
{x; FLOAT; 3; 0; 1}                      # between 0 and 1, 3 decimals
```

**FORMULA** — Computed from other parameters:
```
{d; FORMULA; {b}^2-4*{a}*{c}}            # discriminant
{result; FORMULA; {a}+{b}; 2}            # with precision
```

**LIST** — Random selection from values:
```
{animal; LIST; dog; cat; snake; camel}
```

**PERMUTATION** — Creates indexed sub-parameters `{name_1}`, `{name_2}`, etc., all guaranteed different:
```
{primes; PERMUTATION; 2; 3; 5; 7}
# Use as {primes_1}, {primes_2} — guaranteed to be different values
```

**FORMAT** — Format another parameter for display:
```
{pp; FORMAT; p; NUMBER; 1}               # round to 1 decimal
{pp; FORMAT; p; NUMBERTEXT}              # number as text
{pp; FORMAT; p; ROMAN}                   # as Roman numeral
```

### Constraints

Ensure valid parameter combinations:

```bash
--data "constraints={b}^2-4*{a}*{c}>0"
```

Multiple constraints separated by `&&&`. Allowed relations: `<`, `<=`, `=`, `>=`, `>`, `<>`.

If constraints are too restrictive and generation frequently fails, EduBase may auto-deactivate the question.

### Syncing LIST Parameters

When using multiple LIST parameters that should stay in sync (e.g. country-capital pairs):

```bash
--data "parameters={country; LIST; France; Germany; Italy} &&& {capital; LIST; Paris; Berlin; Rome}" \
--data "parameters_sync=+"
```

With `parameters_sync=+`, if `{country}` picks index 2 (Italy), `{capital}` also picks index 2 (Rome).

### Full Parametric Example

```bash
curl -X POST "https://www.edubase.net/api/v1/question" \
  --data "app={app}&secret={secret}" \
  --data "id=QUADRATIC_DISCRIMINANT" \
  --data "type=numerical" \
  --data "question=For the equation {a}x² + {b}x + {c} = 0, calculate the discriminant." \
  --data "question_format=LATEX" \
  --data "answer={d}" \
  --data "parameters={a; INTEGER; 1; 5} &&& {b; INTEGER; -10; 10} &&& {c; INTEGER; -10; 10} &&& {d; FORMULA; {b}^2-4*{a}*{c}}" \
  --data "constraints={d}>0" \
  --data "subject=Mathematics" \
  --data "category=Algebra" \
  --data "difficulty=3" \
  --data "hint=The discriminant formula is b²-4ac" \
  --data "solution=D = {b}² - 4·{a}·{c} = {d}"
```

## Question Text Formatting

### LaTeX

Enable with `question_format=LATEX`. Inline: `$$...$$`. Block: `$$$$...$$$$`.

```bash
--data "question=Calculate $$\sqrt{x^2 + y^2}$$ for x={a}, y={b}." \
--data "question_format=LATEX"
```

### EduTags

Bold: `[[B]]...[[/B]]`, Italic: `[[I]]...[[/I]]`, Underline: `[[U]]...[[/U]]`, Subscript: `[[SUB]]...[[/SUB]]`, Superscript: `[[SUP]]...[[/SUP]]`.

Code: `[[CODE]]...[[/CODE]]` (inline), `[[CODEBLOCK]]...[[/CODEBLOCK]]` (block), `[[LINES]]...[[/LINES]]` (with line numbers).

Color: `[[COLOR:red]]...[[/COLOR]]`, Background: `[[BACKGROUND:yellow]]...[[/BACKGROUND]]`.

### Tables

Use `[[..]]` format: `[[Header 1; Header 2 | Data 1; Data 2]]` (semicolons = columns, pipes = rows).

### Images

`[[IMAGE:filename.png]]` — file must be provided in the `images` field with that exact name.

### Answer Placeholders

`[[___]]` (three underscores) — visual placeholder for answer fields within question text (fill-in-the-gaps style).

### Quick Expressions

Use triple-wave `~~~...~~~` for inline calculations: `The area is ~~~{r}*{r}*pi~~~`.

## Options Ordering

### Fixed Ordering

`options_fix` field values:
- `all`: Answers first, then options
- `abc`: Alphabetical sort of all items
- `first:N`: Place first N options at the end
- `last:N`: Place last N options at the end
- `answers`: Place all answers at the end

### Custom Ordering

`options_order` field — reference items by position:

```bash
--data "options_order=OPTION:0 &&& ANSWER:0 &&& OPTION:1 &&& ANSWER:1"
```

All answers and options must be referenced exactly once.

## Expression Evaluation Functions

Available in `expression` and `matrix:expression` types, in `FORMULA` parameters, and in `constraints`:

**Basic**: `sqrt(x)`, `abs(x)`, `round(x)`, `floor(x)`, `ceil(x)`

**Logarithmic**: `ln(x)`, `log(x)` (base 10), `log10(x)`

**Trigonometric**: `sin(x)`, `cos(x)`, `tan(x)`, `csc(x)`, `sec(x)`, `arcsin(x)`/`asin(x)`, `arccos(x)`/`acos(x)`, `arctan(x)`/`atan(x)`

**Hyperbolic**: `sinh(x)`, `cosh(x)`, `tanh(x)`, `arcsinh(x)`/`asinh(x)`, `arccosh(x)`/`acosh(x)`, `arctanh(x)`/`atanh(x)`

**Conversions**: `degree2radian(x)`, `radian2degree(x)`, `number2binary(x)`, `binary2number(x)`, `number2roman(x)`, `roman2number(x)`, and octal/hexadecimal variants.

**Two-parameter** (use semicolon separator): `min(a;b)`, `max(a;b)`, `mod(n;i)`, `fmod(n;i)`, `div(a;b)`, `intdiv(a;b)`

## Additional Question Fields

### Numerical & Date Validation

| Field | Applicable Types | Description |
|-------|------------------|-------------|
| `decimals` | NUMERICAL, MATRIX, SET | Number of decimal places (default: 2) |
| `tolerance` | NUMERICAL, MATRIX, SET | Validation tolerance. Values: `ABSOLUTE:N` (e.g. ±0.1), `RELATIVE:N%` (e.g. ±5%), `QUOTIENT` (integer multiple), `QUOTIENT2` (scalar multiple) |
| `numerical_range` | NUMERICAL | Enable interval answers `{from}-{to}` with `+` |
| `datetime_precision` | DATE/TIME | Granularity: `YEAR`, `MONTH`, `DAY` (default) |
| `datetime_range` | DATE/TIME | Enable date range answers with `+` |

### Choice & True/False Options

| Field | Applicable Types | Description |
|-------|------------------|-------------|
| `maximum_choices` | MULTIPLE-CHOICE | Limit maximum number of selections |
| `truefalse_third_options` | TRUE/FALSE | Add a third option (e.g. "Cannot determine") |
| `truefalse_third_options_label` | TRUE/FALSE | Label for the third option |

### Free-Text & File Options

| Field | Applicable Types | Description |
|-------|------------------|-------------|
| `freetext_characters` | FREE-TEXT | Character limit for response |
| `freetext_words` | FREE-TEXT | Word limit for response |
| `freetext_rules` | FREE-TEXT | Auto-grading keyword rules |
| `file_count` | FILE | Number of files allowed |
| `file_types` | FILE | Allowed file extensions |

### Hotspot Options

| Field | Applicable Types | Description |
|-------|------------------|-------------|
| `hotspot_image` | HOTSPOT | Image for marking areas |
| `hotspot_zones` | HOTSPOT | Zone definitions for valid areas |

### Organization & Metadata

| Field | Description |
|-------|-------------|
| `label` | Instance-level categorization (predefined by administrators) |
| `tags` | User-defined tags, separated by `&&&` |
| `ai` | Set to any value to mark question as AI-generated |
| `group` | Question group name (when uploading to Quiz set) |