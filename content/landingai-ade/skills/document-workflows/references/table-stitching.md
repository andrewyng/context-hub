# Table Stitching — Multi-Page Table Extraction

When a table spans multiple pages, ADE emits separate chunks per page and
may represent some pages as plain text instead of `<table>` HTML. This
inconsistency can occur on **any** page — not just the last one. This
reference covers three approaches to stitch those chunks into a single
output, generalized for any document type.

---

## Decision Guide

| Approach | ADE Calls | Handles non-table chunks | Fragility | Best when |
|----------|-----------|--------------------------|-----------|-----------|
| **A — Parse + Extract** | 2 | ✓ LLM reads full markdown | Low | Accuracy is paramount; cost is secondary |
| **B — HTML table parsing** | 1 | ✓ with fallback regex | **High** — requires uniform row structure | Rows are highly uniform; cost savings justify fragility |
| **C — pandas read_html** | 1 | ✗ misses non-table chunks | Medium | Quick prototyping; missing some rows is acceptable |

---

## Approach A — Parse + Extract (LLM-based)

The simplest and most robust approach. Parse the document, then call
`client.extract()` with a schema that describes the full table as a
`List[RowModel]`. The LLM reads the entire markdown — including any
pages where the table was emitted as plain text — and returns structured
JSON.

### Schema design for multi-page tables

```python
from typing import List, Optional
from pydantic import BaseModel, Field


class TableRow(BaseModel):
    """Customize fields for your specific table."""
    key_column: str = Field(
        description=(
            "Primary identifier (e.g., date, ID, row number). "
            "Use empty string for continuation rows."
        )
    )
    description: str = Field(
        description="Description or label column."
    )
    amount_a: Optional[str] = Field(
        default=None,
        description=(
            "First amount column (digits and commas only, "
            "no currency symbol). "
            "Null if not applicable for this row."
        ),
    )
    amount_b: Optional[str] = Field(
        default=None,
        description=(
            "Second amount column. "
            "Null if not applicable."
        ),
    )
    running_total: str = Field(
        description="Running total or balance after this row."
    )


class DocumentWithTable(BaseModel):
    rows: List[TableRow] = Field(
        description=(
            "All data rows in order across ALL pages of the "
            "document. Include rows from every page of the "
            "table, even if some pages render as plain text "
            "rather than tables. "
            "Skip column-header rows and section-header rows."
        )
    )
```

### Key schema tips

- **Say "across ALL pages"** in the `List` field description — this
  tells the LLM to look beyond the first table chunk.
- **Mention "even if some pages render as plain text"** — the LLM
  will then scan text chunks for table-like content.
- **Say "Skip column-header rows"** — continued tables often repeat
  headers on each page.
- **Use `Optional[str]` for mutually exclusive columns** — e.g., when
  only one of "debit" or "credit" applies per row.
- **Use `str` (not `float`) for amounts** to preserve original
  formatting (commas, decimals). Convert downstream if needed.

### Implementation pattern

```python
import json
from pathlib import Path

from landingai_ade import LandingAIADE
from landingai_ade.lib import pydantic_to_json_schema

client = LandingAIADE()

# Step 1: Parse (cache the result to avoid re-parsing)
parse_json = Path("output/parsed.json")
if parse_json.exists():
    data = json.loads(parse_json.read_text())
    markdown = data["markdown"]
else:
    pr = client.parse(document=Path("document.pdf"))
    parse_json.parent.mkdir(parents=True, exist_ok=True)
    parse_json.write_text(
        json.dumps(pr.model_dump(), indent=2, default=str)
    )
    markdown = pr.markdown

# Step 2: Extract with the multi-page table schema
er = client.extract(
    schema=pydantic_to_json_schema(DocumentWithTable),
    markdown=markdown,
)
rows = er.extraction["rows"]
```

### Pros / Cons

- ✅ Handles all pages uniformly, including plain-text edge cases
- ✅ No custom parsing code
- ❌ Two ADE API calls → ~2× credit cost
- ❌ Slower: two network round-trips

---

## Approach B — HTML Table Parsing (parse-only, fragile)

Reuse the cached parse result (zero extra credits). Parse `<table>`
elements from the ADE markdown, detect which tables belong to the
target table, merge their rows, then fall back to regex for any
plain-text rows.

> **Warning:** This approach requires **strong similarity between rows**
> to write reliable detection and extraction regex. It is brittle when
> table format varies across documents or even across pages of the same
> document. Always validate against Approach A on a sample before
> relying on this in production.

### Generic HTML table parser

```python
from html.parser import HTMLParser


class TableParser(HTMLParser):
    """Extract all <table> elements as list-of-rows-of-cells."""

    def __init__(self) -> None:
        super().__init__()
        self._tables: list[list[list[str]]] = []
        self._tbl: list[list[str]] | None = None
        self._row: list[str] | None = None
        self._cell: list[str] | None = None

    def handle_starttag(self, tag: str, attrs: list) -> None:
        if tag == "table":
            self._tbl = []
        elif tag == "tr" and self._tbl is not None:
            self._row = []
        elif tag == "td" and self._row is not None:
            self._cell = []

    def handle_endtag(self, tag: str) -> None:
        if tag == "table" and self._tbl is not None:
            self._tables.append(self._tbl)
            self._tbl = None
        elif tag == "tr" and self._tbl is not None:
            if self._row is not None:
                self._tbl.append(self._row)
            self._row = None
        elif tag == "td" and self._row is not None:
            if self._cell is not None:
                self._row.append(
                    "".join(self._cell).strip()
                )
            self._cell = None

    def handle_data(self, data: str) -> None:
        if self._cell is not None:
            self._cell.append(data)

    @property
    def tables(self) -> list[list[list[str]]]:
        return self._tables


def extract_html_tables(
    markdown: str,
) -> list[list[list[str]]]:
    p = TableParser()
    p.feed(markdown)
    return p.tables
```

### Table detection strategies

Column count alone is often insufficient — multiple table types may
share the same number of columns. Use content-based signals:

```
Is there a header row with known column names?
  ├─ YES → Match on header content (most reliable)
  │        e.g., cells[0]=="Date" and "Description" in cells[1]
  └─ NO → Does the first data cell match a known pattern?
       ├─ YES → Match on first-column pattern
       │        e.g., regex for "Mon DD" date format
       └─ NO → Use column count + content heuristics
                (least reliable — last resort)
```

### Row filtering

After detecting the target table, filter out non-data rows:

- **Column-header rows** — repeated on each page (e.g., `cells[0] == "Date"`)
- **Section sub-headers** — account names, category labels
- **Summary/totals rows** — may need special handling

### Plain-text fallback

When ADE emits table rows as a text chunk, use regex to extract them.
This is the most fragile part — it requires the text to have a
predictable structure:

```python
import re

# Example: lines starting with a date pattern
DATE_RE = re.compile(
    r"^((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
    r"\s+\d{1,2})\s+(.*)"
)
AMOUNT_RE = re.compile(r"[\d,]+\.\d{2}")


def parse_text_rows(
    text: str,
) -> list[dict[str, str]]:
    """Extract rows from plain-text table content.

    Customize the date/amount patterns for your document type.
    """
    rows: list[dict[str, str]] = []
    for line in text.splitlines():
        m = DATE_RE.match(line.strip())
        if not m:
            continue
        date_str, rest = m.group(1), m.group(2)
        amounts = AMOUNT_RE.findall(rest)
        desc = AMOUNT_RE.sub("", rest).strip()
        rows.append({
            "date": date_str,
            "description": desc,
            "amounts": amounts,
        })
    return rows
```

### Domain-specific semantic checks

After stitching, add validation that leverages domain knowledge to
both **confirm correctness** and **resolve ambiguity**:

| Domain | Check | Example |
|--------|-------|---------|
| Financial | Running balance | `prev ± amount ≈ new_balance` |
| Financial | Column totals | Sum of rows = reported total |
| Inventory | Quantity conservation | `in - out = remaining` |
| Time-series | Chronological order | Dates are monotonically increasing |
| Scientific | Consistent units | All values in same column share units |

These checks are especially valuable when plain-text fallback
produces amounts that could belong to multiple columns.

### Pros / Cons

- ✅ Single ADE API call → half the credit cost
- ✅ Fast (parse result is cached; parsing runs locally)
- ❌ Requires strong row similarity for reliable regex
- ❌ Brittle — format changes across documents break detection
- ❌ Plain-text fallback needs domain-specific validation

---

## Approach C — pandas `read_html` (parse-only, quick)

Let pandas do the heavy lifting. Extract `<table>` HTML strings with
a regex, feed each to `pd.read_html()`, use pandas signals to detect
target tables, then `pd.concat` to merge.

> **Limitation:** This approach cannot recover rows from non-table
> chunks. If ADE emits some pages as plain text, those rows are lost.

### Implementation pattern

```python
import re
from io import StringIO

import pandas as pd

TABLE_RE = re.compile(r"<table\b[^>]*>.*?</table>", re.DOTALL)


def stitch_tables_pandas(
    markdown: str,
    expected_cols: int,
    date_pattern: str = (
        r"^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
        r"\s+\d+"
    ),
) -> pd.DataFrame:
    """Extract and merge multi-page tables from ADE markdown.

    Args:
        markdown: Full ADE markdown output.
        expected_cols: Expected number of columns in the target table.
        date_pattern: Regex to match date-like values in column 0.
    """
    table_htmls = TABLE_RE.findall(markdown)
    target_dfs: list[pd.DataFrame] = []

    for html in table_htmls:
        df = pd.read_html(StringIO(html), thousands=",")[0]
        if df.shape[1] != expected_cols:
            continue
        col0 = df.iloc[:, 0]
        has_date = bool(
            col0.astype(str).str.match(date_pattern).any()
        )
        has_numeric = (
            df.select_dtypes(include="number").shape[1] >= 1
        )
        if has_date or has_numeric:
            target_dfs.append(df)

    if not target_dfs:
        raise ValueError("No target tables found")
    return pd.concat(target_dfs, ignore_index=True)
```

### Detection signals from pandas

| Signal | How | Use |
|--------|-----|-----|
| `df.shape` | Column count | Filter by expected column count |
| `select_dtypes("number")` | Numeric column count | Tables without headers have auto-inferred numeric cols |
| `col0.str.match(pattern)` | First-column pattern | Date, ID, or other key column pattern |
| `col0.str.strip() == "Header"` | Header presence | Detect repeated column headers to drop |

### Pitfall: pandas 3.x NaN trap

After `pd.read_html`, empty cells are `float('nan')`. In pandas 3.x,
after `.astype(str)`, StringDtype keeps them as the `float('nan')`
**object** rather than the string `"nan"`. This means:

```python
# BROKEN in pandas 3.x:
col_str = df.iloc[:, 0].astype(str)
mask = col_str == "nan"  # Always False!

# CORRECT — check on the raw column before string conversion:
mask = pd.isna(df.iloc[:, 0])
```

### Amount formatting

`pd.read_html(thousands=",")` strips commas from numbers during dtype
inference. If you need comma-formatted output in CSV:

```python
def fmt_amount(val: object) -> str:
    if pd.isna(val):
        return ""
    if isinstance(val, float):
        return f"{val:,.2f}"
    s = str(val).strip()
    try:
        return f"{float(s):,.2f}"
    except ValueError:
        return s
```

### Pros / Cons

- ✅ Least code — `pd.read_html` + `pd.concat` do most of the work
- ✅ No custom HTML parser or regex
- ✅ pandas dtype signals give a clear detection path
- ❌ Cannot recover rows from non-table chunks
- ❌ `pd.NA` / `float('nan')` trap in pandas 3.x
- ❌ `thousands=","` strips commas — must re-format for output

---

## Common Pitfalls

1. **ADE may emit any page as plain text** — not just the last page.
   Always check chunk types across all pages during pre-flight.

2. **Column count alone is insufficient** — when multiple table types
   share the same column count, use content-based detection (header
   matching, first-column patterns, dtype signals).

3. **Approach B regex is brittle** — test on multiple documents before
   relying on it. Format variations across documents (or even across
   pages of the same document) will break detection.

4. **Always validate with domain-specific semantic checks** — these
   catch errors that structural parsing misses and resolve ambiguities
   in column assignment.

5. **Cache parse results** — save `pr.model_dump()` to JSON after the
   first parse. Load it for development instead of calling
   `client.parse()` again. Only re-parse when the document changes.

---

## Pre-Flight Checklist for Table Stitching

Before choosing an approach, run the diagnostic parse and check:

| What to check | How | Why |
|---------------|-----|-----|
| Chunk types per page | Count `type == "table"` vs `"text"` per page | Any page may have inconsistent types |
| Column count consistency | Compare column counts across table chunks | Inconsistent counts may indicate different tables |
| Header row presence | Check first row of each table chunk | Needed for detection and row filtering |
| Non-target tables | Look for summary/metadata tables with same column count | Must distinguish target from others |
| Row uniformity | Compare row structure across pages | Low uniformity makes Approach B fragile |
| Plain-text table content | Inspect text chunks for table-like patterns | Determines if fallback is needed |
