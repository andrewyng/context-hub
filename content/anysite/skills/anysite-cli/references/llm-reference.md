# LLM Analysis Reference

## Setup

```bash
anysite llm setup
```

Interactive configuration: selects provider (`openai` or `anthropic`), API key environment variable, default model, and optionally tests the connection. Writes to `~/.anysite/config.yaml` under the `llm:` key.

### Configuration Format

```yaml
llm:
  default_provider: openai
  providers:
    openai:
      provider: openai
      api_key_env: OPENAI_API_KEY
      default_model: gpt-4.1-mini
    anthropic:
      provider: anthropic
      api_key_env: ANTHROPIC_API_KEY
      default_model: claude-sonnet-4-5-20250514
  cache_enabled: true
  default_temperature: 0.0
  default_max_tokens: 4096
  rate_limit: "50/m"
```

### Provider Support

| Provider | SDK | Structured Output | Default Model |
|----------|-----|-------------------|---------------|
| OpenAI | `openai` (AsyncOpenAI) | JSON Schema via `response_format` | `gpt-4.1-mini` |
| Anthropic | `anthropic` (AsyncAnthropic) | System-prompt with JSON schema instruction | `claude-sonnet-4-5-20250514` |

## Commands

### `anysite llm summarize`

Summarize each record in a dataset source.

```bash
anysite llm summarize <dataset.yaml> --source <source_id> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `--source, -s` | Source to summarize (required) |
| `--max-length` | Max words in summary (default: 100) |
| `--output-column` | Column name for summary (default: `summary`) |
| `--prompt` | Custom prompt override |
| `--prompt-file` | Read prompt from file |
| `--dry-run` | Show prompt without calling LLM |

### `anysite llm classify`

Classify records into categories.

```bash
anysite llm classify <dataset.yaml> --source <source_id> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `--source, -s` | Source to classify (required) |
| `--categories, -c` | Comma-separated categories (auto-detects if omitted) |
| `--multi` | Allow multiple categories per record |
| `--output-column` | Column name for category (default: `category`) |
| `--prompt` | Custom prompt override |
| `--prompt-file` | Read prompt from file |
| `--dry-run` | Show prompt without calling LLM |

When `--categories` is omitted, the classifier auto-detects 3-7 categories from the first 20 records.

### `anysite llm enrich`

Enrich records with LLM-extracted attributes.

```bash
anysite llm enrich <dataset.yaml> --source <source_id> --add <spec> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `--source, -s` | Source to enrich (required) |
| `--add` | Field spec: `name:type_or_values` (repeatable, at least one required) |
| `--prompt` | Custom prompt override |
| `--prompt-file` | Read prompt from file |
| `--dry-run` | Show prompt without calling LLM |

**Field spec formats:**

| Format | Example | Description |
|--------|---------|-------------|
| Enum | `sentiment:positive/negative/neutral` | Constrained to listed values |
| Type | `language:string` | Free-form string |
| Range | `quality_score:1-10` | Integer value |
| Boolean | `is_technical:boolean` | True/false |
| Number | `relevance:number` | Floating point |

### `anysite llm generate`

Generate text for each record using a custom prompt.

```bash
anysite llm generate <dataset.yaml> --source <source_id> --prompt <template> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `--source, -s` | Source to process (required) |
| `--prompt` | Prompt with `{field}` placeholders (required unless `--prompt-file`) |
| `--prompt-file` | Read prompt from file |
| `--output-column` | Column name for generated text (default: `text`) |
| `--dry-run` | Show prompt without calling LLM |

The prompt template supports `{field_name}` placeholders that are replaced with record values. Example: `"Write a bio for {name} who works as {headline}"`.

Default temperature is 0.7 (higher than other commands).

### `anysite llm match`

Match records between two dataset sources.

```bash
anysite llm match <dataset.yaml> --source-a <id> --source-b <id> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `--source-a` | First source (required) |
| `--source-b` | Second source (required) |
| `--fields-a` | Fields from source A to include |
| `--fields-b` | Fields from source B to include |
| `--top-k` | Max matches per source-a record (default: 3) |
| `--threshold` | Min match score 0.0-1.0 (default: 0.5) |
| `--prompt` | Custom prompt override |
| `--prompt-file` | Read prompt from file |
| `--dry-run` | Show prompt without calling LLM |

Processes each source-a record against batches of 10 source-b records. Returns matches with score and reason.

### `anysite llm deduplicate`

Find semantic duplicates in a dataset source.

```bash
anysite llm deduplicate <dataset.yaml> --source <source_id> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `--source, -s` | Source to deduplicate (required) |
| `--key, -k` | Field for blocking (grouping similar records) (default: `name`) |
| `--threshold` | Min confidence for duplicate (default: 0.8) |
| `--prompt` | Custom prompt override |
| `--prompt-file` | Read prompt from file |
| `--dry-run` | Show prompt without calling LLM |

Uses a blocking pass (first 3 chars of key field) to group candidate duplicates before LLM evaluation.

### `anysite llm cache-stats`

Show LLM cache statistics (entry count, total input/output tokens).

```bash
anysite llm cache-stats
anysite llm cache-stats --json    # Machine-readable JSON output
```

### `anysite llm cache-clear`

Clear all cached LLM responses.

```bash
anysite llm cache-clear
anysite llm cache-clear --json    # Machine-readable JSON output
```

## Common Options

These options are shared across `summarize`, `classify`, `enrich`, `generate`, `match`, and `deduplicate`:

| Option | Description | Default |
|--------|-------------|---------|
| `--provider` | LLM provider name | From config |
| `--model` | Model ID override | From config |
| `--parallel, -j` | Concurrent LLM calls | 5 |
| `--rate-limit` | Rate limit (e.g., `"50/m"`, `"10/s"`) | From config |
| `--temperature` | LLM temperature | 0.0 (0.7 for generate) |
| `--max-tokens` | Max response tokens | 4096 |
| `--no-cache` | Skip cache lookup | false |
| `--format, -f` | Output format: json/jsonl/csv/table | json |
| `--output, -o` | Write results to file | stdout |
| `--fields` | Record fields to include in LLM prompt | All fields |
| `--quiet, -q` | Suppress progress/stats output | false |
| `--dry-run` | Show prompt without calling LLM | false |
| `--prompt` | Custom prompt template | Built-in |
| `--prompt-file` | Read prompt from file | - |

## Prompt System

### Built-in Prompts

| Key | Used by | Description |
|-----|---------|-------------|
| `summarize` | `summarize` | Summarize record in N words |
| `classify` | `classify` | Classify records into categories |
| `classify_auto_detect` | `classify` (no categories) | Auto-detect categories from sample |
| `match` | `match` | Rank candidates by relevance |
| `deduplicate` | `deduplicate` | Identify semantic duplicates |
| `enrich` | `enrich` | Extract specified attributes |

### Custom Prompts

Use `--prompt` for inline templates or `--prompt-file` to read from a file.

Template variables:
- `{record}` -- formatted record (all non-underscore fields)
- `{records}` -- formatted batch of records with indices
- `{field_name}` -- individual record field value
- Command-specific variables: `{max_length}`, `{categories}`, `{field_descriptions}`, `{source_a_name}`, `{source_b_name}`, etc.

### Field Filtering

`--fields "name,headline,location"` restricts which record fields are sent to the LLM. Supports dot-notation for nested fields (e.g., `urn.value`).

## Cache System

SQLite database at `~/.anysite/llm_cache.db` with WAL mode. Cache keys are SHA256 hashes of `{provider}:{system_prompt+user_prompt}:{input_data}`.

Disable per-command with `--no-cache`. Disable globally by setting `cache_enabled: false` in config.

## Examples

```bash
# Classify LinkedIn posts by sentiment
anysite llm classify dataset.yaml --source posts \
  --categories "positive,negative,neutral" \
  --fields "text,title" --format table --output sentiment.csv

# Summarize company profiles
anysite llm summarize dataset.yaml --source companies \
  --fields "name,description,industry" --max-length 50 --format table

# Enrich profiles with multiple attributes
anysite llm enrich dataset.yaml --source profiles \
  --add "seniority:junior/mid/senior/executive" \
  --add "department:string" \
  --add "is_technical:boolean" \
  --format csv --output enriched.csv

# Generate personalized messages
anysite llm generate dataset.yaml --source profiles \
  --prompt "Write a cold outreach message for {name}, {headline} at {company}" \
  --temperature 0.7 --model gpt-4.1

# Match people to companies
anysite llm match dataset.yaml --source-a profiles --source-b companies \
  --fields-a "name,headline,skills" --fields-b "name,industry,description" \
  --top-k 3 --threshold 0.6

# Find duplicate profiles
anysite llm deduplicate dataset.yaml --source profiles \
  --key name --threshold 0.8 --fields "name,headline,location"

# Preview prompt without calling LLM
anysite llm classify dataset.yaml --source posts --dry-run

# Use a custom prompt from file
anysite llm generate dataset.yaml --source profiles --prompt-file my_prompt.txt
```
