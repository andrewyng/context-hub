# Database Integration Patterns

Patterns for normalizing ADE extraction results into relational tables
and loading them into databases. Covers DataFrame normalization, CSV
export, and Snowflake insertion.

---

## 1. DataFrame Normalization

ADE extraction results are nested dicts. This pattern flattens them into
4 normalized tables suitable for any relational DB:

| Table | Contents |
|-------|----------|
| `main` | One row per document — top-level extracted fields |
| `line_items` | One row per line item / repeating element |
| `chunks` | One row per parsed chunk with bounding boxes |
| `markdown` | One row per document — full markdown for traceability |

```python
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


def _dig(obj: Any, *keys: str, default: Any = None) -> Any:
    """Safely traverse nested dicts/objects by key path."""
    for k in keys:
        if obj is None:
            return default
        if isinstance(obj, dict):
            obj = obj.get(k, default)
        else:
            obj = getattr(obj, k, default)
    return obj


def _to_float(v: Any) -> Optional[float]:
    if v is None:
        return None
    try:
        return float(v)
    except (ValueError, TypeError):
        return None


def rows_from_doc(
    file_path: str,
    parse_result: Any,
    extract_result: Any,
    run_id: str | None = None,
) -> Tuple[
    Dict[str, Any],
    List[Dict[str, Any]],
    List[Dict[str, Any]],
    Dict[str, Any],
]:
    """Transform ADE parse + extract results into 4 row types.

    Returns: (main_row, line_rows, chunk_rows, markdown_record)

    Args:
        file_path: original document path
        parse_result: from client.parse()
        extract_result: from client.extract()
        run_id: optional batch run identifier
    """
    doc_name = Path(file_path).name
    doc_uuid = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    rid = run_id or doc_uuid

    f = extract_result.extraction  # dict
    m = getattr(extract_result, "extraction_metadata", {})

    # --- markdown record ---
    markdown_record = {
        "run_id": rid,
        "doc_uuid": doc_uuid,
        "document_name": doc_name,
        "processed_at": now,
        "markdown": parse_result.markdown,
    }

    # --- chunk rows ---
    chunk_rows: List[Dict[str, Any]] = []
    for ch in (parse_result.chunks or []):
        box = (
            ch.grounding.box
            if hasattr(ch, "grounding")
            and hasattr(ch.grounding, "box")
            else None
        )
        chunk_rows.append({
            "run_id": rid,
            "doc_uuid": doc_uuid,
            "document_name": doc_name,
            "chunk_id": getattr(ch, "id", None),
            "chunk_type": getattr(ch, "type", None),
            "text": getattr(ch, "markdown", None),
            "page": (
                ch.grounding.page
                if hasattr(ch, "grounding")
                else None
            ),
            "box_l": _to_float(box.left if box else None),
            "box_t": _to_float(box.top if box else None),
            "box_r": _to_float(box.right if box else None),
            "box_b": _to_float(box.bottom if box else None),
        })

    # --- main row (flatten top-level fields) ---
    main_row: Dict[str, Any] = {
        "run_id": rid,
        "doc_uuid": doc_uuid,
        "document_name": doc_name,
        "processed_at": now,
    }
    # Flatten one level of nesting
    for key, val in f.items():
        if isinstance(val, dict):
            for sub_key, sub_val in val.items():
                main_row[f"{key}__{sub_key}"] = sub_val
        elif isinstance(val, list):
            pass  # lists go to line_items
        else:
            main_row[key] = val

    # --- line item rows ---
    line_rows: List[Dict[str, Any]] = []
    for key, val in f.items():
        if not isinstance(val, list):
            continue
        for idx, item in enumerate(val):
            row: Dict[str, Any] = {
                "run_id": rid,
                "doc_uuid": doc_uuid,
                "document_name": doc_name,
                "list_field": key,
                "line_index": idx,
            }
            if isinstance(item, dict):
                row.update(item)
            else:
                row["value"] = item
            line_rows.append(row)

    return main_row, line_rows, chunk_rows, markdown_record
```

### Usage — Build DataFrames from a Batch

```python
import pandas as pd
from pathlib import Path
from landingai_ade import LandingAIADE
from landingai_ade.lib import pydantic_to_json_schema

client = LandingAIADE()
run_id = "batch_2025_01"

all_main, all_lines, all_chunks, all_md = [], [], [], []

for fp in Path("invoices/").glob("*.pdf"):
    pr = client.parse(document=fp)
    er = client.extract(
        schema=pydantic_to_json_schema(InvoiceSchema),
        markdown=pr.markdown,
    )
    main, lines, chunks, md = rows_from_doc(
        str(fp), pr, er, run_id=run_id
    )
    all_main.append(main)
    all_lines.extend(lines)
    all_chunks.extend(chunks)
    all_md.append(md)

df_main = pd.DataFrame(all_main)
df_lines = pd.DataFrame(all_lines)
df_chunks = pd.DataFrame(all_chunks)
df_md = pd.DataFrame(all_md)

# Save to CSV
for name, df in [
    ("main", df_main),
    ("line_items", df_lines),
    ("chunks", df_chunks),
    ("markdown", df_md),
]:
    df.to_csv(f"{run_id}_{name}.csv", index=False)
```

---

## 2. Snowflake Integration

Upload normalized tables to Snowflake using the connector's
`write_pandas` or staged COPY pattern.

> **Note:** ADE is also available as a **Snowflake Native App** (GA since Nov 2025), which runs ADE directly inside your Snowflake account without data leaving Snowflake. The patterns below use the standard Python SDK connector approach. For the Native App, see [Snowflake Native App docs](https://docs.landing.ai/ade/ade-snowflake).

### Connection Setup

```python
import snowflake.connector
from snowflake.connector.pandas_tools import write_pandas


def get_snowflake_conn(
    account: str,
    user: str,
    password: str,
    database: str,
    schema: str,
    warehouse: str,
    role: str = "SYSADMIN",
) -> snowflake.connector.SnowflakeConnection:
    return snowflake.connector.connect(
        account=account,
        user=user,
        password=password,
        database=database,
        schema=schema,
        warehouse=warehouse,
        role=role,
    )
```

### Table Creation

```sql
-- Main extraction results (one row per document)
CREATE TABLE IF NOT EXISTS ade_extractions (
    run_id          VARCHAR,
    doc_uuid        VARCHAR PRIMARY KEY,
    document_name   VARCHAR,
    processed_at    TIMESTAMP_TZ,
    -- Add flattened extraction columns here
    -- e.g., invoice_info__invoice_number VARCHAR
);

-- Line items (one row per repeating element)
CREATE TABLE IF NOT EXISTS ade_line_items (
    run_id          VARCHAR,
    doc_uuid        VARCHAR REFERENCES ade_extractions(doc_uuid),
    document_name   VARCHAR,
    list_field      VARCHAR,
    line_index      INTEGER,
    -- Add line item columns here
);

-- Parsed chunks with bounding boxes
CREATE TABLE IF NOT EXISTS ade_chunks (
    run_id          VARCHAR,
    doc_uuid        VARCHAR REFERENCES ade_extractions(doc_uuid),
    document_name   VARCHAR,
    chunk_id        VARCHAR,
    chunk_type      VARCHAR,
    text            VARCHAR,
    page            INTEGER,
    box_l           FLOAT,
    box_t           FLOAT,
    box_r           FLOAT,
    box_b           FLOAT
);

-- Full markdown for traceability
CREATE TABLE IF NOT EXISTS ade_markdown (
    run_id          VARCHAR,
    doc_uuid        VARCHAR REFERENCES ade_extractions(doc_uuid),
    document_name   VARCHAR,
    processed_at    TIMESTAMP_TZ,
    markdown        VARCHAR(16777216)
);
```

### Upload DataFrames

```python
def upload_to_snowflake(
    conn: snowflake.connector.SnowflakeConnection,
    df_main: "pd.DataFrame",
    df_lines: "pd.DataFrame",
    df_chunks: "pd.DataFrame",
    df_md: "pd.DataFrame",
) -> None:
    """Upload all 4 normalized tables to Snowflake."""
    # Column names must be UPPER CASE for Snowflake
    for table, df in [
        ("ADE_EXTRACTIONS", df_main),
        ("ADE_LINE_ITEMS", df_lines),
        ("ADE_CHUNKS", df_chunks),
        ("ADE_MARKDOWN", df_md),
    ]:
        if df.empty:
            continue
        df.columns = [c.upper() for c in df.columns]
        write_pandas(
            conn, df, table,
            auto_create_table=True,
            overwrite=False,
        )
        print(f"Uploaded {len(df)} rows to {table}")
```

### Full Pipeline: Parse → Extract → Snowflake

```python
import io
import pandas as pd
from pathlib import Path
from landingai_ade import LandingAIADE
from landingai_ade.lib import pydantic_to_json_schema


def ade_to_snowflake(
    input_dir: Path,
    schema_cls: type,
    sf_conn: "snowflake.connector.SnowflakeConnection",
    run_id: str = "default",
) -> int:
    """Parse, extract, normalize, and upload to Snowflake.

    Returns number of documents processed.
    """
    client = LandingAIADE()
    exts = {".pdf", ".png", ".jpg", ".jpeg"}
    files = [
        p for p in input_dir.glob("*")
        if p.suffix.lower() in exts
    ]

    all_main, all_lines, all_chunks, all_md = (
        [], [], [], []
    )
    for fp in files:
        try:
            pr = client.parse(document=fp)
            er = client.extract(
                schema=pydantic_to_json_schema(schema_cls),
                markdown=io.BytesIO(
                    pr.markdown.encode("utf-8")
                ),
            )
            main, lines, chunks, md = rows_from_doc(
                str(fp), pr, er, run_id=run_id
            )
            all_main.append(main)
            all_lines.extend(lines)
            all_chunks.extend(chunks)
            all_md.append(md)
        except Exception as exc:
            print(f"FAILED {fp.name}: {exc}")

    upload_to_snowflake(
        sf_conn,
        pd.DataFrame(all_main),
        pd.DataFrame(all_lines),
        pd.DataFrame(all_chunks),
        pd.DataFrame(all_md),
    )
    return len(all_main)
```

---

## 3. CSV Export Patterns

### Summary CSV — One Row per Document

```python
def extractions_to_summary_csv(
    results: list[tuple[str, dict]],
    output_path: Path,
) -> "pd.DataFrame":
    """Create a summary CSV with one row per document.

    Args:
        results: list of (filename, extraction_dict) tuples
        output_path: CSV file path
    """
    rows = []
    for name, extraction in results:
        row = {"document_name": name}
        for k, v in extraction.items():
            if isinstance(v, dict):
                for sk, sv in v.items():
                    row[f"{k}__{sk}"] = sv
            elif isinstance(v, list):
                row[f"{k}__count"] = len(v)
            else:
                row[k] = v
        rows.append(row)
    df = pd.DataFrame(rows)
    df.to_csv(output_path, index=False)
    return df
```

### Per-Document JSON + Combined CSV

```python
import json

def save_results(
    file_path: Path,
    parse_result: Any,
    extract_result: Any,
    output_dir: Path,
) -> None:
    """Save individual JSON files + append to combined CSV."""
    stem = file_path.stem
    output_dir.mkdir(parents=True, exist_ok=True)

    # Individual JSON
    for prefix, obj in [
        ("parse", parse_result),
        ("extract", extract_result),
    ]:
        data = (
            obj.model_dump()
            if hasattr(obj, "model_dump")
            else obj
        )
        (output_dir / f"{prefix}_{stem}.json").write_text(
            json.dumps(data, indent=2, default=str),
            encoding="utf-8",
        )
```

---

## Dependencies

```
# DataFrame + CSV only
pip install landingai-ade pandas

# Snowflake integration
pip install landingai-ade pandas snowflake-connector-python[pandas]

# Environment variable management
pip install python-dotenv pydantic-settings
```
