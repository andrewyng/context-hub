# Database Integration Patterns

Patterns for normalizing ADE extraction results into relational tables
and loading them into databases. Covers DataFrame normalization, CSV
export, and Snowflake insertion. All patterns use the ADE v2 APIs
(`client.v2.*`, `landingai-ade` v1.13.0+).

---

## 1. DataFrame Normalization

ADE extraction results are nested dicts. This pattern flattens them into
4 normalized tables suitable for any relational DB:

| Table | Contents |
|-------|----------|
| `main` | One row per document: top-level extracted fields |
| `line_items` | One row per line item / repeating element |
| `blocks` | One row per parsed block with bounding boxes |
| `markdown` | One row per document: full markdown for traceability |

```python
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


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
    """Transform ADE v2 parse + extract results into 4 row types.

    Returns: (main_row, line_rows, block_rows, markdown_record)

    Args:
        file_path: original document path
        parse_result: from client.v2.parse()
        extract_result: from client.v2.extract()
        run_id: optional batch run identifier
    """
    doc_name = Path(file_path).name
    doc_uuid = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    rid = run_id or doc_uuid

    f = extract_result.extraction  # dict

    # --- markdown record ---
    markdown_record = {
        "run_id": rid,
        "doc_uuid": doc_uuid,
        "document_name": doc_name,
        "processed_at": now,
        "markdown": parse_result.markdown,
    }

    # --- block rows (walk the v2 structure tree) ---
    block_rows: List[Dict[str, Any]] = []
    for page in (parse_result.structure.children or []):
        for block in (page.children or []):
            g = block.grounding
            r = g.range if g else None
            box = g.box if g else None
            text = (
                parse_result.markdown[r.start:r.end]
                if r is not None
                else None
            )
            block_rows.append({
                "run_id": rid,
                "doc_uuid": doc_uuid,
                "document_name": doc_name,
                "block_id": block.id,
                "block_type": block.type,
                "text": text,
                "page": g.page if g else None,  # 1-indexed
                "box_xmin": _to_float(box.xmin if box else None),
                "box_ymin": _to_float(box.ymin if box else None),
                "box_xmax": _to_float(box.xmax if box else None),
                "box_ymax": _to_float(box.ymax if box else None),
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

    return main_row, line_rows, block_rows, markdown_record
```

### Usage: Build DataFrames from a Batch

```python
import pandas as pd
from pathlib import Path
from landingai_ade import LandingAIADE

client = LandingAIADE()
run_id = "batch_2026_07"

all_main, all_lines, all_blocks, all_md = [], [], [], []

for fp in Path("invoices/").glob("*.pdf"):
    pr = client.v2.parse(document=fp, model="dpt-3-pro-latest")
    er = client.v2.extract(
        schema=InvoiceSchema,  # v2 accepts the Pydantic class directly
        markdown=pr.markdown,
    )
    main, lines, blocks, md = rows_from_doc(
        str(fp), pr, er, run_id=run_id
    )
    all_main.append(main)
    all_lines.extend(lines)
    all_blocks.extend(blocks)
    all_md.append(md)

df_main = pd.DataFrame(all_main)
df_lines = pd.DataFrame(all_lines)
df_blocks = pd.DataFrame(all_blocks)
df_md = pd.DataFrame(all_md)

# Save to CSV
for name, df in [
    ("main", df_main),
    ("line_items", df_lines),
    ("blocks", df_blocks),
    ("markdown", df_md),
]:
    df.to_csv(f"{run_id}_{name}.csv", index=False)
```

> **Spreadsheet inputs (v1):** the v2 Parse API accepts PDFs and images
> only. To load XLSX/CSV documents, parse them with the v1 API
> (`client.parse()`), which returns `chunks` instead of a structure
> tree; see the `document-extraction` skill's v1 reference for the
> response shape.

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

-- Parsed blocks with bounding boxes (v2: normalized 0-1, page 1-indexed)
CREATE TABLE IF NOT EXISTS ade_blocks (
    run_id          VARCHAR,
    doc_uuid        VARCHAR REFERENCES ade_extractions(doc_uuid),
    document_name   VARCHAR,
    block_id        VARCHAR,
    block_type      VARCHAR,
    text            VARCHAR,
    page            INTEGER,
    box_xmin        FLOAT,
    box_ymin        FLOAT,
    box_xmax        FLOAT,
    box_ymax        FLOAT
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
    df_blocks: "pd.DataFrame",
    df_md: "pd.DataFrame",
) -> None:
    """Upload all 4 normalized tables to Snowflake."""
    # Column names must be UPPER CASE for Snowflake
    for table, df in [
        ("ADE_EXTRACTIONS", df_main),
        ("ADE_LINE_ITEMS", df_lines),
        ("ADE_BLOCKS", df_blocks),
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

### Full Pipeline: Parse, Extract, Snowflake

```python
import pandas as pd
from pathlib import Path
from landingai_ade import LandingAIADE


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

    all_main, all_lines, all_blocks, all_md = (
        [], [], [], []
    )
    for fp in files:
        try:
            pr = client.v2.parse(
                document=fp,
                model="dpt-3-pro-latest",
            )
            er = client.v2.extract(
                schema=schema_cls,
                markdown=pr.markdown,
            )
            main, lines, blocks, md = rows_from_doc(
                str(fp), pr, er, run_id=run_id
            )
            all_main.append(main)
            all_lines.extend(lines)
            all_blocks.extend(blocks)
            all_md.append(md)
        except Exception as exc:
            print(f"FAILED {fp.name}: {exc}")

    upload_to_snowflake(
        sf_conn,
        pd.DataFrame(all_main),
        pd.DataFrame(all_lines),
        pd.DataFrame(all_blocks),
        pd.DataFrame(all_md),
    )
    return len(all_main)
```

---

## 3. CSV Export Patterns

### Summary CSV: One Row per Document

```python
import pandas as pd
from pathlib import Path


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

Use `save_to` directly on `client.v2.parse()` and `client.v2.extract()`
to persist each document's JSON response (no separate save helper
needed):

```python
from pathlib import Path
from landingai_ade import LandingAIADE

client = LandingAIADE()
file_path = Path("invoices/inv-001.pdf")
output_dir = Path("./results")

parse_result = client.v2.parse(
    document=file_path,
    model="dpt-3-pro-latest",
    save_to=output_dir,  # writes output_dir/{stem}_parse_output.json
)
extract_result = client.v2.extract(
    schema=InvoiceSchema,
    markdown=parse_result.markdown,
    save_to=output_dir / f"{file_path.stem}_extract_output.json",
)
```

Then call `extractions_to_summary_csv()` (above) on the collected
`extract_result.extraction` dicts to write the combined CSV.

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
