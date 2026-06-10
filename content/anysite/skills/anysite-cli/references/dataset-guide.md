# Dataset Pipeline & Database Guide

## Agent Workflow

Follow these steps when building a new dataset pipeline:

1. **Discover endpoint fields**: `anysite describe <endpoint> --json` -- see input params (with examples, defaults) and output fields (with nested structure)
2. **Draft YAML config** -- use output fields from step 1 for `dependency.field` paths
3. **Validate**: `anysite dataset validate dataset.yaml --json` -- catches structural errors in < 0.1s
4. **Dry run**: `anysite dataset collect dataset.yaml --dry-run` -- preview plan with estimated request counts
5. **Collect**: `anysite dataset collect dataset.yaml` or `anysite dataset collect dataset.yaml --load-db mydb`

**Key rule**: ALWAYS run `anysite describe` before setting `dependency.field`. The output fields show exactly which paths exist. For example, `/api/linkedin/user/posts` output has `author` as `object{@type,internal_id,urn,...}` -- so the author's URN is `author.urn.value`, NOT `urn.value` (which is the post's own URN).

---

## Dataset YAML Configuration

### Full Structure

```yaml
name: my-dataset
description: Optional description

sources:
  - id: source_id              # Unique identifier
    endpoint: /api/...         # API endpoint path
    input: {}                  # Static API parameters
    from_file: inputs.txt      # Input file (txt/JSONL/CSV)
    file_field: column_name    # CSV column to extract
    input_key: param_name      # API parameter for input values
    input_template: {}         # Transform values before API call
    dependency:                # Link to parent source
      from_source: parent_id
      field: urn.value         # Dot-notation field to extract
      match_by: name           # Alternative: fuzzy match by name
      dedupe: true             # Remove duplicate values
    parallel: 3                # Concurrent requests
    rate_limit: "10/s"         # Rate limiting
    on_error: skip             # stop or skip
    refresh: always            # auto (default), always, or never (skip if data exists)
    filter: '.count > 10'     # Source filter (before LLM + Parquet write)
    transform:                 # Export filter (after Parquet write, for exports only)
      filter: '.status == "active"'
      fields: [name, url]     # Field selection with aliases
      add_columns:             # Static columns to inject
        batch: "q1-2026"
    export:                    # Per-source export destinations
      - type: file
        path: ./output/{{source}}-{{date}}.csv
        format: csv            # json, jsonl, csv
      - type: webhook
        url: https://example.com/hook
        headers: {X-Token: abc}
    llm:                       # LLM enrichment (after collection, before Parquet)
      - type: enrich           # enrich, classify, summarize, generate
        add:                   # Field specs for enrich type
          - "sentiment:positive/negative/neutral"
          - "language:string"
        fields: [name, headline]  # Record fields to include in LLM prompt
      - type: classify
        categories: "dev,recruiter,exec"  # Omit for auto-detect
        output_column: role    # Default: "category"
      - type: summarize
        max_length: 50
        output_column: bio     # Default: "summary"
      - type: generate
        prompt: "Pitch for {name}"  # Required for generate
        output_column: pitch   # Default: "text"
        temperature: 0.7       # Per-step overrides
    db_load:                   # Database loading config
      filter: '.active == true'  # DB load filter (only matching records to DB)
      table: custom_name       # Override table name
      key: urn.value           # Unique key for diff-based incremental sync
      sync: full               # full (INSERT/DELETE/UPDATE) or append (no DELETE)
      fields: [name, url, sentiment, language, role, bio, pitch]
      exclude: [_input_value]  # Fields to exclude

storage:
  format: parquet
  path: ./data/
  partition_by: [source_id, collected_date]

schedule:                      # Collection schedule
  cron: "0 9 * * *"           # Standard cron expression

notifications:                 # Webhook notifications
  on_complete:
    - url: "https://hooks.slack.com/xxx"
      headers: {X-Token: abc}
  on_failure:
    - url: "https://alerts.example.com/fail"
```

### Six Source Types

**Independent** -- single API call with static input:
```yaml
- id: search_results
  endpoint: /api/linkedin/search/users
  input:
    keywords: "software engineer"
    count: 50
```

**from_file** -- iterate over values from a file:
```yaml
- id: companies
  endpoint: /api/linkedin/company
  from_file: companies.txt      # One value per line
  input_key: company             # API parameter name
  parallel: 3
```

**Dependent** -- extract values from parent source output:
```yaml
- id: employees
  endpoint: /api/linkedin/company/employees
  dependency:
    from_source: companies       # Parent source ID
    field: urn.value             # Dot-notation path in parent records
    dedupe: true                 # Deduplicate extracted values
  input_key: companies           # API parameter name
  input_template:                # Transform value before API call
    companies:
      - type: company
        value: "{value}"         # {value} is replaced with extracted value
    count: 5
```

**Union** -- combine multiple sources into one:
```yaml
- id: all_results
  type: union
  sources: [search_cto, search_vp]    # Parent source IDs to combine
  dedupe_by: urn.value                 # Optional: remove duplicates by field
```
All parent sources must have the same endpoint. Records are annotated with `_union_source` (parent source ID). Cannot have `endpoint`, `dependency`, `from_file`, `input_key`, or `input`.

**LLM Source (type: llm)** -- process parent data through LLM without API calls:
```yaml
- id: profiles_analyzed
  type: llm                       # Source type: api (default) | llm
  dependency:
    from_source: profiles         # Parent source (required)
    field: name                   # Optional -- omit if not extracting values
  llm:                            # LLM enrichment steps (required for type: llm)
    - type: classify
      categories: "strong_fit,moderate_fit,weak_fit"
      output_column: fit_category
      fields: [headline, experience]
    - type: enrich
      add:
        - "fit_score:1-10"
        - "key_strengths:string"
        - "concerns:string"
      fields: [name, headline, experience, skills]
  export:
    - type: file
      path: ./output/analyzed-{{date}}.csv
      format: csv
```

**type: llm source rules:**
- **Requires**: `dependency` (parent source) and non-empty `llm` list
- **Cannot have**: `endpoint`, `from_file`, `input_key`, `input`
- **Use case**: Run LLM enrichment on already-collected data without re-calling the API
- **Run with**: `anysite dataset collect dataset.yaml --source profiles_analyzed`

The LLM source reads the parent's Parquet data directly, applies LLM steps, and writes enriched records to its own Parquet file. This allows re-analyzing data with different prompts or categories without re-collecting from the API.

**SQL (type: sql)** -- query a named database connection:
```yaml
- id: billing_users
  type: sql
  connection: billing
  query: "SELECT name, email FROM subscriptions WHERE status = 'inactive'"
```
Runs the query and stores results as records. Downstream sources can depend on SQL output. Uses connections from `anysite db add`. Supports `query_file` for external `.sql` files.

**type: sql source rules:**
- **Requires**: `connection` and either `query` or `query_file`
- **Cannot have**: `endpoint`, `from_file`, `input_key`, `input`, `parallel`, `rate_limit`, `on_error`
- **Use case**: Bring external DB data into the pipeline for API enrichment

### Dependency Chains

Sources are topologically sorted -- parents always run before children. Multi-level chains work automatically:

```
companies -> employees -> profiles -> posts -> comments
```

**Common dependency fields:**
- `/api/linkedin/company/employees` returns: `name`, `headline`, `url`, `image`, `location`, `internal_id`, `urn` -- use `urn.value` (not `alias`) to chain into `/api/linkedin/user`
- `/api/linkedin/user` accepts both human-readable aliases (`satyanadella`) and URN values as the `user` parameter

Always run `anysite describe <endpoint>` to verify available fields before setting up dependencies.

**Note:** You can also use the `${source.field}` shorthand instead of explicit `dependency` + `input_key`. See the "Shorthand Syntax" section below.

### input_template

Transforms extracted values before passing to the API. Use `{value}` placeholder:

```yaml
input_template:
  urn: "urn:li:fsd_profile:{value}"
  count: 5
```

If `field: urn.value` extracts `"ACoAABCDEF"`, the API receives:
```json
{"urn": "urn:li:fsd_profile:ACoAABCDEF", "count": 5}
```

### Dot-Notation Field Extraction

When Parquet stores nested objects as JSON strings, dot-notation traverses them:

- `urn.value` -- parses JSON string in `urn` field, extracts `.value`
- `experience[0].company_urn` -- array index + nested field
- `internal_id.value` -- nested object access

### Common Dependency Chains

Quick reference for popular endpoint combinations. Always verify with `anysite describe <endpoint>`.

| Parent endpoint | Child endpoint | `field` | `input_key` | Notes |
|----------------|---------------|---------|-------------|-------|
| `/api/linkedin/search/users` | `/api/linkedin/user` | `urn.value` | `user` | |
| `/api/linkedin/user` | `/api/linkedin/user/posts` | `urn.value` | `urn` | |
| `/api/linkedin/user/posts` | `/api/linkedin/post/comments` | `urn.value` | `urn` | |
| `/api/linkedin/user/posts` | `/api/linkedin/user` (author) | `author.urn.value` | `user` | NOT `urn.value` |
| `/api/linkedin/user` | `/api/linkedin/company` | `company.universalName` | `company` | |
| `/api/linkedin/company` | `/api/linkedin/company/posts` | `universalName` | `company` | needs `input_template` |
| `/api/linkedin/company` | `/api/linkedin/company/employees` | `urn.value` | `companies` | needs `input_template` |

**Posts -> Author Profiles** (most common mistake -- using wrong field):
```yaml
- id: author_profiles
  endpoint: /api/linkedin/user
  dependency:
    from_source: posts
    field: author.urn.value       # AUTHOR's URN, not post URN
    dedupe: true
  input_key: user
  parallel: 5
```

**Companies -> Employees** (requires array input_template):
```yaml
- id: employees
  endpoint: /api/linkedin/company/employees
  dependency:
    from_source: companies
    field: urn.value
  input_key: companies
  input_template:
    companies:
      - type: company
        value: "{value}"
    count: 5
  parallel: 2
```

### Shorthand Syntax (`${source.field}`)

Instead of writing explicit `dependency` + `input_key`, you can use `${source.field}` directly in `input`:

```yaml
# Shorthand (auto-expands to dependency + input_key):
- id: profiles
  endpoint: /api/linkedin/user
  input:
    user: ${search_results.urn.value}
    count: 20
```

This is equivalent to:
```yaml
- id: profiles
  endpoint: /api/linkedin/user
  dependency:
    from_source: search_results
    field: urn.value
  input_key: user
  input:
    count: 20
```

The `${source.field}` syntax extracts the source ID and field path automatically. Static parameters (like `count: 20`) are passed through as-is.

### Required Fields by Source Type

| Field | `api` (default) | `llm` | `union` | `sql` |
|-------|-----------------|-------|---------|-------|
| `id` | required | required | required | required |
| `type` | optional (defaults to "api") | required: `llm` | required: `union` | required: `sql` |
| `endpoint` | required | N/A | N/A | N/A |
| `connection` | N/A | N/A | N/A | **required** |
| `query` | N/A | N/A | N/A | required (or `query_file`) |
| `query_file` | N/A | N/A | N/A | required (or `query`) |
| `dependency` | optional | **required** | N/A | optional |
| `llm` | optional | **required** (>= 1 step) | optional | optional |
| `sources` | N/A | N/A | **required** | N/A |
| `input` | optional | N/A | N/A | N/A |
| `input_key` | optional | N/A | N/A | N/A |
| `input_template` | optional | N/A | N/A | N/A |
| `from_file` | optional | N/A | N/A | N/A |
| `parallel` | optional (default: 1) | N/A | N/A | N/A |
| `filter` | optional | optional | optional | optional |
| `transform` | optional | optional | optional | optional |
| `export` | optional | optional | optional | optional |
| `db_load` | optional | optional | optional | optional |
| `dedupe_by` | N/A | N/A | optional | N/A |

**Key notes:**
- `dependency.field` is optional (not required) -- needed for value extraction but not for LLM sources
- `endpoint` must start with `/` (e.g., `/api/linkedin/user`)
- `categories` in classify steps is a comma-separated **string**, not an array
- `partition_by` in storage config is accepted but not currently used -- layout is always `raw/<source_id>/<date>.parquet`

---

## Validation

Validate dataset config before collecting. Catches structural errors, missing dependencies, invalid filters, and bad LLM specs.

```bash
anysite dataset validate dataset.yaml                    # Validate config
anysite dataset validate dataset.yaml --json             # Machine-readable output
```

---

## Collection Commands

```bash
# Validate config first (recommended)
anysite dataset validate dataset.yaml

# Preview collection plan with estimated request counts
anysite dataset collect dataset.yaml --dry-run

# Full collection
anysite dataset collect dataset.yaml

# Collect and auto-load into database
anysite dataset collect dataset.yaml --load-db pg

# Incremental -- skip inputs already collected
anysite dataset collect dataset.yaml --incremental --load-db pg

# Single source + its dependencies
anysite dataset collect dataset.yaml --source employees

# Quiet mode
anysite dataset collect dataset.yaml --quiet

# Pilot run: max 100 inputs per source
anysite dataset collect dataset.yaml --limit 100
```

### Provenance Tracking

Dependent and from_file records automatically get metadata columns:
- `_input_value` -- the raw extracted value that produced this record
- `_parent_source` -- parent source ID (dependent sources only)

These enable FK linking when loading into a database.

### Incremental Collection

With `--incremental`:
1. Independent sources: skipped if already collected today
2. Dependent/from_file sources: skips individual input values already in `metadata.json`
3. New values are still collected and tracked

### Refresh Mode

Per-source `refresh` field controls behavior with `--incremental`:

```yaml
- id: posts
  endpoint: /api/linkedin/user/posts
  dependency: { from_source: profiles, field: urn.value }
  input_key: user
  refresh: always    # Re-collect every run even with --incremental
```

| Setting | `--incremental` | No flag |
|---------|----------------|---------|
| `refresh: auto` (default) | Skip collected inputs | Collect all |
| `refresh: always` | Collect all (ignore cache) | Collect all |
| `refresh: never` | Skip if data exists | Skip if data exists |

Use `refresh: always` for sources with frequently changing data (e.g., posts, activity feeds) where you want fresh snapshots each run while still caching stable parent data. Use `refresh: never` for stable reference data that only needs to be collected once.

### Storage Layout

```
<storage.path>/
  raw/<source_id>/<YYYY-MM-DD>.parquet
  metadata.json
```

---

## Query Commands (DuckDB)

Each source becomes a DuckDB view named after its ID. Hyphens and dots in source IDs are replaced with underscores (e.g., `search-results` -> `search_results`).

```bash
# Direct SQL
anysite dataset query dataset.yaml --sql "SELECT * FROM companies LIMIT 10"

# Shorthand: --source auto-generates SELECT
anysite dataset query dataset.yaml --source profiles

# Dot-notation field extraction
anysite dataset query dataset.yaml --source profiles \
  --fields "name, urn.value AS urn_id, headline"
# Generates: SELECT name, json_extract_string(urn, '$.value') AS urn_id, headline FROM profiles

# Exclude internal columns
anysite dataset query dataset.yaml --source profiles --exclude "_input_value,_parent_source"

# Output options
anysite dataset query dataset.yaml --sql "SELECT * FROM companies" \
  --format csv --output companies.csv

# Interactive SQL shell
anysite dataset query dataset.yaml --interactive

# Column statistics
anysite dataset stats dataset.yaml --source companies

# Data profiling (completeness, record counts)
anysite dataset profile dataset.yaml
```

---

## Database Loading (load-db)

Load Parquet data into a relational database with automatic FK linking.

```bash
anysite dataset load-db dataset.yaml -c <connection_name> [OPTIONS]
```

### Options
```
--connection, -c TEXT    Database connection name (required)
--source, -s TEXT        Load specific source + dependencies
--drop-existing          Drop tables before creating
--snapshot TEXT           Load a specific snapshot date (YYYY-MM-DD)
--dry-run                Show plan without executing
--quiet, -q              Suppress output
```

### What load-db Does

1. Reads Parquet files for each source (in topological order)
2. Infers SQL schema from data (integer, float, text, json, etc.)
3. Creates tables with auto-increment `id` primary key
4. Inserts rows, tracking which `_input_value` maps to which `id`
5. For child sources: adds `{parent_source}_id` FK column using provenance

### Incremental Sync with `db_load.key`

When `db_load.key` is set and the table already exists with >=2 snapshots, `load-db` uses diff-based incremental sync instead of full re-insertion:

1. Compares the two most recent Parquet snapshots using `DatasetDiffer`
2. **Added** records -> INSERT into DB
3. **Removed** records -> DELETE from DB (by key) -- only in `sync: full` mode
4. **Changed** records -> UPDATE modified fields (by key)

This keeps the database in sync without duplicates.

**Sync modes** (`db_load.sync`):
- `full` (default) -- applies INSERT, DELETE, and UPDATE from diff
- `append` -- applies INSERT and UPDATE only, skips DELETE. Use for sources where the API returns only the latest N items (e.g., posts, comments) and you want to accumulate records over time.

| Scenario | Behavior |
|----------|----------|
| First load (table doesn't exist) | Full INSERT of latest snapshot |
| Table exists + `db_load.key` + >=2 snapshots | Diff-based sync (INSERT/DELETE/UPDATE delta) |
| `--drop-existing` | Drop table, full INSERT of latest snapshot |
| `--snapshot 2026-01-15` | Full INSERT of that specific snapshot |
| No `db_load.key` set | Full INSERT of latest snapshot (no diff) |

### db_load Config

Control which fields go to the database per source:

```yaml
db_load:
  table: people                    # Custom table name (default: source ID)
  key: urn.value                   # Unique key for diff-based incremental sync
  sync: append                     # full (default) or append (no DELETE on diff)
  fields:                          # Explicit field list
    - name
    - url
    - urn.value AS urn_id          # Dot-notation with alias
    - experience                   # JSON columns stored as TEXT/JSONB
  exclude:                         # Fields to skip (default: _input_value, _parent_source)
    - _input_value
    - _parent_source
    - raw_html
```

Without `db_load`: all fields except `_input_value` and `_parent_source` are loaded.

### FK Linking Example

Given: companies -> employees -> posts

Result in database:
- `companies` table: `id`, name, url, ...
- `employees` table: `id`, name, ..., `companies_id` (FK to companies.id)
- `posts` table: `id`, text, ..., `employees_id` (FK to employees.id)

---

## Database Commands (anysite db)

### Connection Management
```bash
anysite db add <name> --type postgres --host localhost --database mydb --user app --password secret
anysite db add <name> --type postgres --host localhost --database mydb --user app --password-env DB_PASS
anysite db list                    # List all connections
anysite db test <name>             # Test connectivity
anysite db info <name>             # Show connection details
anysite db remove <name>           # Delete connection
```

Connections stored in `~/.anysite/connections.yaml`. Passwords use env var references for security.

### Schema Inspection
```bash
anysite db schema <name>                  # List all tables
anysite db schema <name> --table users    # Show columns
```

### Data Operations
```bash
# Insert from stdin (auto-create table)
cat data.jsonl | anysite db insert <name> --table users --stdin --auto-create

# Insert from file
anysite db insert <name> --table users --file data.jsonl

# Upsert (update on conflict)
anysite db upsert <name> --table users --conflict-columns id --stdin

# Insert with conflict handling
anysite db insert <name> --table users --file data.jsonl \
  --on-conflict ignore --conflict-columns email
```

### SQL Queries
```bash
anysite db query <name> --sql "SELECT * FROM users" --format table
anysite db query <name> --file report.sql --format csv --output report.csv
```

### Supported Databases
- **SQLite** -- `--type sqlite --path ./data.db`
- **PostgreSQL** -- `--type postgres --host localhost --database mydb --user app --password-env DB_PASS`
- PostgreSQL also supports `--url-env DATABASE_URL` for connection strings

---

## Three-Level Filtering

The pipeline supports filtering at three independent stages:

```
Collection -> [source.filter] -> LLM -> Parquet -> [transform.filter] -> Export
                                                    [db_load.filter]  -> DB
```

| Level | Config | When | Effect |
|-------|--------|------|--------|
| 1 | `source.filter` | After collection, before LLM + Parquet | Drops records entirely |
| 2 | `transform.filter` | After Parquet, before exports | Parquet keeps all |
| 3 | `db_load.filter` | Before DB loading | Parquet keeps all |

```yaml
- id: analyzed
  type: llm
  dependency: { from_source: comments, field: urn.value }
  filter: '.is_commenter_post_author == false'   # Level 1
  llm:
    - type: enrich
      add: ["score:1-10"]
  transform:
    filter: '.score > 5'                          # Level 2
    fields: [text, author, score]
  db_load:
    filter: '.score > 8'                          # Level 3
    fields: [text, author, score]
```

### Filter Syntax
Safe expression parser (no `eval()`). Supported operators: `==`, `!=`, `>`, `<`, `>=`, `<=`. Connectors: `and`, `or`. Values: strings (`"..."`), numbers, booleans (`true`/`false`), `null`.

```
.field > 10
.status == "active"
.active == true
.hidden == false
.location != ""
.name != null
.count > 5 and .count < 100
.status == "active" or .status == "pending"
```

### Per-Source Transform

`transform` block applies to export destinations only. Parquet always stores full records.

```yaml
transform:
  filter: '.employee_count > 10 and .status == "active"'
  fields:
    - name
    - url
    - urn.value AS urn_id          # Dot-notation with alias
    - employee_count
  add_columns:
    batch: "q1-2026"
    source: "linkedin"
```

---

## LLM Enrichment

Optional `llm` list per source. Steps run **after collection, before Parquet write**, so enriched fields are stored in Parquet and flow to DB via `db_load.fields`.

### Step Types

| Type | Purpose | Required | Output |
|------|---------|----------|--------|
| `enrich` | Extract structured attributes | `add` specs | One column per spec |
| `classify` | Categorize records | `categories` (optional -- auto-detects if omitted) | `category` + `category_confidence` |
| `summarize` | Concise text summary | -- | `summary` |
| `generate` | Custom text from prompt template | `prompt` | `text` |

### Config Example

```yaml
sources:
  - id: profiles
    endpoint: /api/linkedin/user
    llm:
      - type: enrich
        add:
          - "sentiment:positive/negative/neutral"
          - "language:string"
          - "quality_score:1-10"
        fields: [headline, summary]     # Fields sent to LLM (empty = all)
      - type: classify
        categories: "developer,recruiter,executive"
        output_column: role_type        # Default: "category"
        fields: [headline]
      - type: summarize
        max_length: 50
        output_column: bio              # Default: "summary"
      - type: generate
        prompt: "Write a pitch for {name} who works as {headline}"
        output_column: pitch            # Default: "text"
        temperature: 0.7                # Higher for creative generation
    db_load:
      fields: [name, headline, sentiment, language, quality_score, role_type, bio, pitch]
```

### Enrich Field Spec Formats

| Format | Example | JSON Schema Type |
|--------|---------|-----------------|
| Enum | `sentiment:positive/negative/neutral` | `string` with `enum` |
| String | `language:string` | `string` |
| Integer | `count:integer` | `integer` |
| Range | `score:1-10` | `integer` |
| Number | `weight:number` | `number` |
| Boolean | `active:boolean` | `boolean` |

### Per-Step Overrides

Each step supports: `provider`, `model`, `temperature`, `max_tokens`, `fields`, `output_column`.

### Collect Flags

```bash
# Collect with LLM enrichment (default when llm: is configured)
anysite dataset collect dataset.yaml

# Skip LLM steps
anysite dataset collect dataset.yaml --no-llm

# Dry run shows LLM step count per source
anysite dataset collect dataset.yaml --dry-run
```

### LLM Response Caching

LLM responses are cached in SQLite (`~/.anysite/llm_cache.db`). Re-running collection on the same data reuses cached results without calling the LLM provider. Clear with `anysite llm cache-clear`.

### Incremental Behavior

`--incremental` skips already-collected inputs at collection stage -- only new records reach LLM enrichment. LLM response cache provides additional savings for repeated content.

---

## Per-Source Export

Export destinations run after Parquet write. Transform is applied to export records if configured.

### File Export
```yaml
export:
  - type: file
    path: ./output/{{source}}-{{date}}.csv
    format: csv                    # json, jsonl, csv
```

Template variables: `{{date}}` (YYYY-MM-DD), `{{datetime}}` (ISO), `{{source}}` (source ID), `{{dataset}}` (dataset name).

### Webhook Export
```yaml
export:
  - type: webhook
    url: https://example.com/hook
    headers:
      X-Token: abc
```

Sends POST with JSON body: `{dataset, source, count, records, timestamp}`.

---

## Run History & Logs

Every `collect` run is automatically recorded in SQLite (`~/.anysite/dataset_history.db`).

```bash
# View run history
anysite dataset history my-dataset
anysite dataset history my-dataset --limit 5

# View logs for a specific run
anysite dataset logs my-dataset --run 42

# View latest run logs
anysite dataset logs my-dataset
```

---

## Scheduling

Generate cron or systemd entries from the `schedule.cron` config.

```bash
# Crontab entry (default)
anysite dataset schedule dataset.yaml --incremental --load-db pg

# Systemd timer units
anysite dataset schedule dataset.yaml --systemd --incremental --load-db pg
```

Output example:
```
0 9 * * * /path/to/anysite dataset collect dataset.yaml --incremental --load-db pg >> ~/.anysite/logs/my-dataset_cron.log 2>&1
```

---

## Notifications

Webhook notifications sent on collection complete or failure.

```yaml
notifications:
  on_complete:
    - url: "https://hooks.slack.com/services/xxx"
      headers: {Authorization: "Bearer token"}
  on_failure:
    - url: "https://alerts.example.com/fail"
```

Payload: `{event: "complete"|"failure", dataset, timestamp, record_count, source_count, duration, error}`.

---

## Comparing Snapshots (Diff)

Compare two collection snapshots to find added, removed, and changed records.

```bash
# Compare two most recent snapshots (auto-detect dates)
anysite dataset diff dataset.yaml --source profiles --key _input_value

# Compare with dot-notation key (JSON fields)
anysite dataset diff dataset.yaml --source profiles --key urn.value

# Compare specific dates
anysite dataset diff dataset.yaml --source profiles --key urn.value --from 2026-01-30 --to 2026-02-01

# Only compare specific fields
anysite dataset diff dataset.yaml --source profiles --key urn --fields "name,headline,follower_count"

# Output as JSON/CSV
anysite dataset diff dataset.yaml --source profiles --key urn --format json --output diff.json
```

**Options:**
- `--source, -s` (required) -- source to compare
- `--key, -k` (required) -- field to match records by. Supports dot-notation for JSON fields (e.g., `urn.value`)
- `--from` / `--to` -- snapshot dates (default: two most recent)
- `--fields, -f` -- restrict both comparison and output to these fields
- `--format` -- output format (table, json, jsonl, csv)
- `--output, -o` -- write to file

**Output** shows summary counts and a table of changes:
- **added** -- records in the new snapshot but not the old
- **removed** -- records in the old snapshot but not the new
- **changed** -- records with the same key but different values (shows `old -> new`)

---

## Reset Incremental State

Clear collected input tracking to force re-collection.

```bash
# Reset all sources
anysite dataset reset-cursor dataset.yaml

# Reset specific source
anysite dataset reset-cursor dataset.yaml --source profiles
```

---

## Common Mistakes

| # | Mistake | Fix |
|---|---------|-----|
| 1 | `field: urn.value` for author profiles (wrong URN) | Use `field: author.urn.value` -- run `anysite describe` to find correct path |
| 2 | `input_template: { company: "microsoft" }` (missing placeholder) | Use `company: "{value}"` -- `{value}` is replaced with extracted value |
| 3 | `endpoint: api/linkedin/user` (no leading `/`) | Use `endpoint: /api/linkedin/user` |
| 4 | `categories: ["pos", "neg"]` (array) | Use `categories: "pos,neg"` -- comma-separated string |
| 5 | `parallel: 50` (too high) | Use `parallel: 3` to `5` -- higher causes rate limiting |
| 6 | Confusing `field` and `input_key` | `field` = WHAT to extract from parent; `input_key` = WHERE to put it in API call |
| 7 | `type: llm` without `dependency` | LLM sources require `dependency` (parent source) and `llm` (>= 1 step) |
| 8 | SQL query uses `search-results` view name | Hyphens -> underscores in DuckDB views: use `search_results` |

**Validate catches most errors:**
```bash
anysite dataset validate dataset.yaml --json
# "Endpoint must start with '/'"           -> add leading /
# "enrich step requires 'add'"             -> add 'add' list to enrich step
# "LLM source must have a dependency"      -> add dependency block
# "did you mean '=='?"                     -> replace = with == in filter
```
