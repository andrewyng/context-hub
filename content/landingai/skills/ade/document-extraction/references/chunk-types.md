# Chunk Types Reference

## Overview

A **chunk** is a discrete element extracted from a document during parsing. When you send a document to ADE, it analyzes the content, breaks it down into meaningful elements, and returns each as a chunk with structured metadata describing its content and location.

## What Is Semantic Chunking?

ADE uses **semantic chunking**, which intelligently groups content based on meaning rather than just layout or formatting. Instead of splitting at arbitrary points (like fixed lengths or paragraph breaks), ADE identifies coherent units of information and extracts them as individual chunks.

**Benefits:**
- Enables efficient processing of large documents (avoids token limits)
- Improves retrieval granularity for downstream tasks
- Supports semantic search and embeddings
- Maintains human readability and logical relationships

## Chunk Type Details

### text

**Description:** Content consisting entirely of characters (letters and numbers).

**Includes:**
- Paragraphs
- Titles and headings
- Lists (bulleted, numbered)
- Form fields
- Checkboxes and radio buttons
- Equations
- Code blocks
- Handwritten text

**Key-Value Pairs:** If text contains form fields with key-value pairs, the extracted data is returned as key-value pairs separated by line breaks (`\n`).

**Example Output:**
```markdown
## Solar Energy Benefits

Solar energy is a renewable and clean source of power that has numerous advantages:
- Reduces electricity bills
- Environmentally friendly
- Low maintenance costs
- Energy independence
```

### table

**Description:** Grids of rows and columns containing data.

**Includes:**
- Traditional tables with gridlines
- Well-aligned data without gridlines (e.g., receipt line items)
- Spreadsheet data

**Note:** ADE doesn't require gridlines to be present. It interprets well-aligned sets of data as tables.

**Example Output:**
```markdown
| Item | Quantity | Price |
|------|----------|-------|
| Coffee | 2 | $5.00 |
| Sandwich | 1 | $8.50 |
| **Total** | | **$13.50** |
```

### marginalia

**Description:** Text in the top, bottom, or side margins of a document.

**Includes:**
- Page headers
- Page footers
- Page numbers
- Handwritten notes in margins
- Line numbers

**Example Output:**
```markdown
_Confidential Report - Page 3_
```

### figure

**Description:** Visual or graphical non-text content.

**Includes:**
- Pictures and photographs
- Graphs (bar, line, pie charts)
- Flowcharts
- Diagrams

**Example Output:**
```markdown
<::Caption: Bar chart showing quarterly revenue growth from Q1 to Q4::>
```

### logo

**Description:** Company logos and branding elements.

**Availability:** DPT-2 only

**Example Output:**
```markdown
<::Caption: Landing AI logo::>
```

### card

**Description:** Identification cards and licenses.

**Includes:**
- ID cards
- Driver licenses

**Availability:** DPT-2 only

**Example Output:**
```markdown
<::Caption: Driver's license with photo and personal information::>
```

### attestation

**Description:** Elements that serve as authentication or approval.

**Includes:**
- Signatures (handwritten or digital)
- Stamps
- Seals

**Availability:** DPT-2 only

**Example Output:**
```markdown
<::Caption: Handwritten signature::>
```

### scan_code

**Description:** Machine-readable codes.

**Includes:**
- QR codes
- Barcodes (UPC, Code 39, Code 128, etc.)

**Availability:** DPT-2 only

**Example Output:**
```markdown
<::Caption: Barcode::>
```

## Working with Chunks

### Accessing Chunks in Python

```python
from landingai_ade import LandingAIADE
from pathlib import Path

client = LandingAIADE()
response = client.parse(
    document=Path("document.pdf"),
    model="dpt-2-latest"
)

# Access all chunks
for chunk in response.chunks:
    print(f"Type: {chunk.type}")
    print(f"ID: {chunk.id}")
    print(f"Content: {chunk.markdown}")
    print(f"Page: {chunk.grounding.page}")
    print("---")
```

### Filtering by Chunk Type

```python
# Get all text chunks
text_chunks = [chunk for chunk in response.chunks if chunk.type == 'text']

# Get all tables
tables = [chunk for chunk in response.chunks if chunk.type == 'table']

# Get all figures
figures = [chunk for chunk in response.chunks if chunk.type == 'figure']
```

### Filtering by Page

```python
# Get all chunks from page 0 (first page)
page_0_chunks = [chunk for chunk in response.chunks
                 if chunk.grounding.page == 0]
```

### Accessing Chunk Location (Grounding)

```python
for chunk in response.chunks:
    print(f"Chunk ID: {chunk.id}")
    print(f"Page: {chunk.grounding.page}")
    print(f"Bounding box: {chunk.grounding.box}")
    # Bounding box format: {left, top, right, bottom}
    # Values are normalized 0-1
```

### Grounding Type Mapping

The top-level `grounding` dictionary in the Parse response uses **grounding types** (prefixed with `chunk`) rather than chunk types. This allows the grounding dictionary to also include table-specific entries (`table`, `tableCell`) that don't correspond to chunk types.

| Grounding Type | Chunk Type | Notes |
|---|---|---|
| `chunkText` | `text` | |
| `chunkTable` | `table` | Overall table location |
| `chunkFigure` | `figure` | |
| `chunkMarginalia` | `marginalia` | |
| `chunkLogo` | `logo` | DPT-2 only |
| `chunkCard` | `card` | DPT-2 only |
| `chunkAttestation` | `attestation` | DPT-2 only |
| `chunkScanCode` | `scan_code` | DPT-2 only |
| `table` | _(grounding only)_ | HTML `<table>` element within a table chunk |
| `tableCell` | _(grounding only)_ | Individual cell; includes `position` (row, col, rowspan, colspan, chunk_id) |

**Example: looking up grounding type for a chunk:**
```python
for chunk in response.chunks:
    grounding_entry = response.grounding.get(chunk.id)
    if grounding_entry:
        print(f"Chunk type: {chunk.type}")
        print(f"Grounding type: {grounding_entry.type}")
        # e.g. chunk type "text" → grounding type "chunkText"
```

## Common Use Cases by Chunk Type

### text
- Extract document content for RAG systems
- Build searchable document indices
- Extract form field values
- Process questionnaires and surveys

### table
- Extract financial data from statements
- Process invoices and receipts
- Parse spreadsheet data
- Extract structured data from reports

### figure
- Index images for visual search
- Generate image captions for accessibility
- Extract diagrams for documentation
- Archive visual content

### marginalia
- Track document metadata (page numbers, headers)
- Extract document versioning information
- Identify document sections from headers

### logo (DPT-2)
- Brand recognition and classification
- Document authenticity verification
- Company identification from documents

### card (DPT-2)
- KYC (Know Your Customer) processing
- Identity verification workflows
- License verification

### attestation (DPT-2)
- Contract validation
- Approval workflow tracking
- Signature verification
- Document authenticity checks

### scan_code (DPT-2)
- Inventory tracking (barcodes)
- Payment processing (QR codes)
- Product identification
- Link extraction from QR codes

## Best Practices

### 1. Choose the Right Model
- Use **DPT-2** for documents with logos, signatures, ID cards, or barcodes
- Use **DPT-2 mini** for simple, digitally-native documents

### 2. Filter Chunks by Type
Filter chunks to focus on relevant content for your use case:
```python
# Extract only text and tables for data extraction
data_chunks = [c for c in response.chunks
               if c.type in ['text', 'table']]
```

### 3. Use Chunk IDs for Traceability
Each chunk has a unique ID that can be referenced in extraction metadata:
```python
# Extract data and trace back to source chunks
extract_response = client.extract(schema=schema, markdown=response.markdown)
for field, metadata in extract_response.extraction_metadata.items():
    print(f"{field} extracted from chunks: {metadata.chunk_ids}")
```

### 4. Handle Visual Elements
For figures, logos, attestations, and scan_codes, the markdown includes a caption:
```python
# Check if chunk is visual
visual_types = ['figure', 'logo', 'card', 'attestation', 'scan_code']
if chunk.type in visual_types:
    print(f"Visual element: {chunk.markdown}")
    # Caption format: <::Caption: description::>
```

## References

- [Official Chunk Types Documentation](https://docs.landing.ai/ade/ade-chunk-types)
- [Parse Models](https://docs.landing.ai/ade/ade-parse-models)
- [JSON Response Structure](https://docs.landing.ai/ade/ade-json-response)
