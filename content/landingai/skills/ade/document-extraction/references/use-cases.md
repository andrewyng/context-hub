# Use Cases

Common document processing patterns using LandingAI ADE. All examples assume the client and dependencies are set up per `SKILL.md`.

## Invoice Processing

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
    vendor_address: str = Field(description="Vendor address")
    total_amount: float = Field(description="Total amount due in USD")
    line_items: list[LineItem] = Field(description="List of line items")

client = LandingAIADE()

parse_response = client.parse(document=Path("invoice.pdf"), model="dpt-2-latest")
extract_response = client.extract(
    schema=pydantic_to_json_schema(Invoice),
    markdown=parse_response.markdown,
    model="extract-latest"
)

invoice = extract_response.extraction
print(f"Invoice #{invoice['invoice_number']} — ${invoice['total_amount']}")
for item in invoice['line_items']:
    print(f"  {item['description']}: {item['quantity']} x ${item['unit_price']}")
```

## Form Data Extraction

```python
from pydantic import BaseModel, Field
from typing import Optional

class PatientIntake(BaseModel):
    patient_name: str = Field(description="Full patient name")
    date_of_birth: str = Field(description="Date of birth as YYYY-MM-DD")
    insurance_id: str = Field(description="Insurance ID number")
    emergency_contact: str = Field(description="Emergency contact name and phone")
    allergies: list[str] = Field(description="List of known allergies")
    has_existing_conditions: bool = Field(description="Whether patient has existing conditions")
    primary_complaint: Optional[str] = Field(default=None, description="Primary complaint or reason for visit")

# Parse and extract
parse_response = client.parse(document=Path("intake_form.pdf"), model="dpt-2-latest")
extract_response = client.extract(
    schema=pydantic_to_json_schema(PatientIntake),
    markdown=parse_response.markdown,
    model="extract-latest"
)
print(extract_response.extraction)
```

## Multi-Document Classification and Extraction

Split a batch PDF into document types, then extract type-specific fields from each:

```python
from landingai_ade import LandingAIADE
from pathlib import Path

client = LandingAIADE()

# Step 1: Parse the batch
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

# Step 3: Extract from each split based on its classification
for split in split_response.splits:
    print(f"Type: {split.classification}, Pages: {split.pages}")
    if split.classification == "Invoice":
        extract_response = client.extract(
            schema=pydantic_to_json_schema(Invoice),
            markdown=split.markdowns[0],
            model="extract-latest"
        )
        print(f"  Invoice #{extract_response.extraction['invoice_number']}")
    elif split.classification == "Bank Statement":
        # Use bank statement schema
        pass
```

## Table Extraction

```python
from landingai_ade import LandingAIADE
from pathlib import Path
import json

client = LandingAIADE()

# Parse document or spreadsheet
response = client.parse(document=Path("data.xlsx"), model="dpt-2-latest")

# Filter table chunks
tables = [chunk for chunk in response.chunks if chunk.type == "table"]
print(f"Found {len(tables)} tables")

for i, table in enumerate(tables, start=1):
    print(f"\nTable {i} on page {table.grounding.page}:")
    print(table.markdown)  # HTML table — parse with pandas or BeautifulSoup

# Save as CSV using pandas
import pandas as pd
from io import StringIO

for i, table in enumerate(tables, start=1):
    try:
        dfs = pd.read_html(StringIO(table.markdown))
        if dfs:
            dfs[0].to_csv(f"table_{i:02d}.csv", index=False)
            print(f"Saved table_{i:02d}.csv")
    except Exception as e:
        print(f"Table {i}: could not parse as HTML ({e})")
```

> **Multi-page tables:** When a table spans multiple pages, ADE emits separate chunks per page
> and may represent some pages as plain text instead of table chunks. See
> [Table Stitching](../../document-workflows/references/table-stitching.md) in the
> `document-workflows` skill for three approaches to merge them into a single output.

## Figure Extraction with Cropping

Extract figures from PDFs as individual PNG files using bounding boxes:

```python
from dotenv import load_dotenv
load_dotenv()

import fitz  # PyMuPDF — install with: pip install pymupdf
from landingai_ade import LandingAIADE
from pathlib import Path

client = LandingAIADE()

# Step 1: Parse the PDF
pdf_path = Path("document.pdf")
response = client.parse(document=pdf_path, model="dpt-2-latest")

# Step 2: Filter figure chunks
figure_chunks = [chunk for chunk in response.chunks if chunk.type == "figure"]
print(f"Found {len(figure_chunks)} figures")

# Step 3: Open PDF with PyMuPDF and crop each figure
pdf_doc = fitz.open(pdf_path)

for idx, chunk in enumerate(figure_chunks, start=1):
    page_num = chunk.grounding.page
    bbox = chunk.grounding.box  # Always present — API guarantees grounding on returned chunks

    page = pdf_doc[page_num]

    # Convert normalized coordinates (0-1) to absolute pixel coordinates
    x0 = bbox.left * page.rect.width
    y0 = bbox.top * page.rect.height
    x1 = bbox.right * page.rect.width
    y1 = bbox.bottom * page.rect.height

    # Render at 2x zoom for quality
    zoom = 2.0
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat, clip=fitz.Rect(x0, y0, x1, y1))

    output_path = f"figure_{idx:02d}_page{page_num + 1}.png"
    pix.save(output_path)
    print(f"Figure {idx}: saved as {output_path}")

    # IMPORTANT: Read back the first output PNG and visually verify it shows the right content
    # before continuing. Page indexing bugs are easy to miss without a visual check.

pdf_doc.close()
```

**Key Points:**
- Bounding boxes use normalized coordinates (0-1); multiply by page dimensions to get pixels
- Every chunk returned by the API is guaranteed to have `grounding.box`
- Use `zoom=2.0` or higher for crisp output
- Page numbers are zero-indexed in ADE
- After saving the first PNG, read it back and confirm it shows the expected figure
