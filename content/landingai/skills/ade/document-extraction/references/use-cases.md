# Use Cases

Common document processing patterns using LandingAI ADE. Each example is self-contained and includes all required imports. Examples use the v2 APIs except where a capability is v1-only (noted inline).

## Invoice Processing (v2)

```python
from pydantic import BaseModel, Field
from landingai_ade import LandingAIADE
from pathlib import Path

class LineItem(BaseModel):
    description: str = Field(description="Item description")
    quantity: int = Field(description="Quantity")
    unit_price: float = Field(description="Unit price in USD")
    amount: float = Field(description="Line total in USD")

class Invoice(BaseModel):
    invoice_number: str = Field(description="Invoice number")
    invoice_date: str = Field(description="Invoice date as YYYY-MM-DD")
    vendor_name: str = Field(description="Vendor company name")
    vendor_address: str = Field(description="Vendor address")
    total_amount: float = Field(description="Total amount due in USD")
    line_items: list[LineItem] = Field(description="List of line items")

client = LandingAIADE()

parse_response = client.v2.parse(document=Path("invoice.pdf"), model="dpt-3-pro-latest")
extract_response = client.v2.extract(
    markdown=parse_response.markdown,
    schema=Invoice,
    model="extract-latest",
)

invoice = extract_response.extraction
print(f"Invoice #{invoice['invoice_number']}: ${invoice['total_amount']}")
for item in invoice['line_items']:
    print(f"  {item['description']}: {item['quantity']} x ${item['unit_price']}")
```

## Form Data Extraction (v2)

```python
from pydantic import BaseModel, Field
from typing import Optional
from landingai_ade import LandingAIADE
from pathlib import Path

class PatientIntake(BaseModel):
    patient_name: str = Field(description="Full patient name")
    date_of_birth: str = Field(description="Date of birth as YYYY-MM-DD")
    insurance_id: str = Field(description="Insurance ID number")
    emergency_contact: str = Field(description="Emergency contact name and phone")
    allergies: list[str] = Field(description="List of known allergies")
    has_existing_conditions: bool = Field(description="Whether patient has existing conditions")
    primary_complaint: Optional[str] = Field(default=None, description="Primary complaint or reason for visit")

client = LandingAIADE()

parse_response = client.v2.parse(document=Path("intake_form.pdf"), model="dpt-3-pro-latest")
extract_response = client.v2.extract(
    markdown=parse_response.markdown,
    schema=PatientIntake,
    model="extract-latest",
)
print(extract_response.extraction)
```

## Field Traceability with Ranges (v2)

Show where each extracted value came from in the document:

```python
from pydantic import BaseModel, Field
from landingai_ade import LandingAIADE
from pathlib import Path

class Report(BaseModel):
    revenue: str = Field(description="Total revenue for the quarter")
    period: str = Field(description="Reporting period")

client = LandingAIADE()

parse_response = client.v2.parse(document=Path("report.pdf"), model="dpt-3-pro-latest")
extract_response = client.v2.extract(markdown=parse_response.markdown, schema=Report)

# extraction_metadata is a plain dict: use dict access
for field, meta in extract_response.extraction_metadata.items():
    if meta["ranges"]:
        sources = [extract_response.markdown[r["start"]:r["end"]] for r in meta["ranges"]]
        print(f"{field} = {meta['value']!r}, from: {sources}")
    else:
        print(f"{field} = {meta['value']!r} (synthesized; no source range)")
```

## Multi-Document Classification and Extraction (v1 pipeline)

Split a batch PDF into document types, then extract type-specific fields from each. **This pipeline is v1 end to end**: the Split API requires v1 Parse output, so the extraction step also stays on v1 (see the compatibility matrix in [SKILL.md](../SKILL.md#which-api-version)).

```python
from pydantic import BaseModel, Field
from landingai_ade.lib import pydantic_to_json_schema
from landingai_ade import LandingAIADE
from pathlib import Path

class LineItem(BaseModel):
    description: str = Field(description="Item description")
    quantity: int = Field(description="Quantity")
    unit_price: float = Field(description="Unit price in USD")
    amount: float = Field(description="Line total in USD")

class Invoice(BaseModel):
    invoice_number: str = Field(description="Invoice number")
    invoice_date: str = Field(description="Invoice date as YYYY-MM-DD")
    vendor_name: str = Field(description="Vendor company name")
    total_amount: float = Field(description="Total amount due in USD")
    line_items: list[LineItem] = Field(description="List of line items")

client = LandingAIADE()

# Step 1: Parse the batch (v1)
parse_response = client.parse(document=Path("batch.pdf"), model="dpt-2-latest")

# Step 2: Split by document type
split_response = client.split(
    markdown=parse_response.markdown,
    split_class=[
        {"name": "Invoice", "description": "Commercial invoice with line items", "identifier": "Invoice Number"},
        {"name": "Receipt", "description": "Payment receipt", "identifier": "Receipt Date"},
        {"name": "Bank Statement", "description": "Monthly bank account statement"}
    ]
)

# Step 3: Extract from each split based on its classification (v1 Extract)
for split in split_response.splits:
    print(f"Type: {split.classification}, Pages: {split.pages}")
    if split.classification == "Invoice":
        extract_response = client.extract(
            schema=pydantic_to_json_schema(Invoice),
            markdown=split.markdowns[0],
            model="extract-latest"
        )
        print(f"  Invoice #{extract_response.extraction['invoice_number']}")
```

Alternative for mixed batches without Split: classify pages with the version-agnostic `client.classify()` (see SKILL.md), then parse the relevant pages with `client.v2.parse(options={"pages": [...]})`.

## Table Extraction (v2)

Find table blocks in the structure tree and convert them to CSV:

```python
from landingai_ade import LandingAIADE
from pathlib import Path
import pandas as pd
from io import StringIO

client = LandingAIADE()

response = client.v2.parse(document=Path("report.pdf"), model="dpt-3-pro-latest")

# Collect table blocks from every page
tables = [
    block
    for page in response.structure.children
    for block in page.children
    if block.type == "table"
]
print(f"Found {len(tables)} tables")

for i, table in enumerate(tables, start=1):
    r = table.grounding.range
    table_html = response.markdown[r.start:r.end]   # tables are HTML by default
    print(f"\nTable {i} ({table.id}) on page {table.grounding.page}:")
    try:
        dfs = pd.read_html(StringIO(table_html))
        if dfs:
            dfs[0].to_csv(f"table_{i:02d}.csv", index=False)
            print(f"Saved table_{i:02d}.csv")
    except Exception as e:
        print(f"Table {i}: could not parse as HTML ({e})")
```

For cell-level work, iterate `table.children`: each `table_cell` has `row`, `col`, `rowspan`, `colspan` (0-indexed) and its own `grounding`.

> **Spreadsheets (XLSX, CSV):** the v2 Parse API does not accept them. Parse spreadsheets with the v1 API; see [v1-parse-extract.md](v1-parse-extract.md).
>
> **Multi-page tables:** see [Table Stitching](../../document-workflows/references/table-stitching.md) in the `document-workflows` skill.

## Figure Extraction with Cropping (v2)

Extract figures from PDFs as individual PNG files using bounding boxes:

```python
from dotenv import load_dotenv
load_dotenv()

import fitz  # PyMuPDF (install with: pip install pymupdf)
from landingai_ade import LandingAIADE
from pathlib import Path

client = LandingAIADE()

# Step 1: Parse the PDF
pdf_path = Path("document.pdf")
response = client.v2.parse(document=pdf_path, model="dpt-3-pro-latest")

# Step 2: Collect figure blocks from the structure tree
figures = [
    block
    for page in response.structure.children
    for block in page.children
    if block.type == "figure"
]
print(f"Found {len(figures)} figures")

# Step 3: Open the PDF with PyMuPDF and crop each figure
pdf_doc = fitz.open(pdf_path)

for idx, block in enumerate(figures, start=1):
    page_num = block.grounding.page          # 1-indexed in v2
    box = block.grounding.box                # normalized 0-1: xmin, ymin, xmax, ymax

    page = pdf_doc[page_num - 1]             # PyMuPDF pages are 0-indexed

    # Convert normalized coordinates to absolute page coordinates
    x0 = box.xmin * page.rect.width
    y0 = box.ymin * page.rect.height
    x1 = box.xmax * page.rect.width
    y1 = box.ymax * page.rect.height

    # Render at 2x zoom for quality
    zoom = 2.0
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat, clip=fitz.Rect(x0, y0, x1, y1))

    output_path = f"figure_{idx:02d}_page{page_num}.png"
    pix.save(output_path)
    print(f"Figure {idx}: saved as {output_path}")

    # IMPORTANT: Read back the first output PNG and visually verify it shows the right content
    # before continuing. Page indexing bugs are easy to miss without a visual check.

pdf_doc.close()
```

**Key Points:**
- v2 bounding boxes are normalized (0 to 1) with keys `xmin`, `ymin`, `xmax`, `ymax`; multiply by page dimensions.
- v2 page numbers are **1-indexed**; subtract 1 when indexing PyMuPDF pages.
- Use `zoom=2.0` or higher for crisp output.
- After saving the first PNG, read it back and confirm it shows the expected figure.
