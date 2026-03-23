# Supported File Formats

## Overview

LandingAI ADE supports 20+ file formats across PDFs, images, documents, presentations, and spreadsheets. This reference details supported formats, limitations, and considerations for each category.

## Quick Reference

| Category | Formats | Notes |
|----------|---------|-------|
| **PDF** | PDF | Up to 100 pages in Playground; see rate limits for API |
| **Images** | JPEG, JPG, PNG, + 15 more | Common formats fully supported |
| **Documents** | DOC, DOCX, ODT | Converted to PDF before parsing |
| **Presentations** | PPT, PPTX, ODP | Converted to PDF before parsing |
| **Spreadsheets** | CSV, XLSX | Up to 10 MB in Playground; no limit in API |

## PDFs

### Supported
- Standard PDF files (.pdf)
- Multi-page PDFs (up to 100 pages in Playground)
- Scanned PDFs (OCR applied automatically)

### API Limits
- Playground: Up to 100 pages
- API: See [Rate Limits](https://docs.landing.ai/ade/ade-rate-limits)
- Parse Jobs (async): Up to 1 GB or 6,000 pages



### Usage Example
```python
from landingai_ade import LandingAIADE
from pathlib import Path

client = LandingAIADE()
response = client.parse(
    document=Path("document.pdf"),
    model="dpt-2-latest"
)
```

## Images

### Fully Supported (Playground + API)
- **JPEG** - Joint Photographic Experts Group
- **JPG** - JPEG variant
- **PNG** - Portable Network Graphics

### API-Only Supported
- **APNG** - Animated PNG
- **BMP** - Bitmap
- **DCX** - Multi-page PCX
- **DDS** - DirectDraw Surface
- **DIB** - Device Independent Bitmap
- **GD** - GD Graphics
- **GIF** - Graphics Interchange Format
- **ICNS** - Apple Icon
- **JP2** - JPEG 2000
- **PCX** - PC Paintbrush
- **PPM** - Portable Pixmap
- **PSD** - Photoshop Document
- **TGA** - Truevision Graphics Adapter
- **TIFF** - Tagged Image File Format
- **WEBP** - Web Picture format

### Considerations
- All images are processed with OCR if they contain text
- Images with complex layouts benefit from DPT-2
- Scanned documents work best as images or PDFs

### Usage Example
```python
# Parse an image file
response = client.parse(
    document=Path("receipt.jpg"),
    model="dpt-2-latest"
)

# Parse from URL
response = client.parse(
    document_url="https://example.com/invoice.png",
    model="dpt-2-latest"
)
```

## Text Documents

### Supported Formats
- **DOC** - Microsoft Word (legacy)
- **DOCX** - Microsoft Word
- **ODT** - OpenDocument Text (LibreOffice)

### Important: File Conversion

**All text documents are converted to PDF before parsing.**

**Impact:**
- Layout may change during conversion
- Unsupported fonts are replaced (may cause text wrapping changes)
- Page count may increase or decrease
- Text may overflow onto additional pages

**Parsing Quality:**
Despite layout changes, ADE still parses content correctly. The semantic chunking and content extraction work as expected.

### Best Practices
- Test with sample documents to understand conversion impact
- For critical layout preservation, convert to PDF manually first
- Use DPT-2 for documents with complex formatting

### Usage Example
```python
# Parse Word document
response = client.parse(
    document=Path("contract.docx"),
    model="dpt-2-latest"
)
```

## Presentations

### Supported Formats
- **PPT** - Microsoft PowerPoint (legacy)
- **PPTX** - Microsoft PowerPoint
- **ODP** - OpenDocument Presentation (LibreOffice)

### Important: File Conversion

**All presentations are converted to PDF before parsing.**

**Impact:**
- Each slide becomes a page in the PDF
- Animations and transitions are lost
- Layout may change (same considerations as text documents)
- Speaker notes may not be preserved

**Parsing Quality:**
Slide content, text, images, and tables are extracted correctly.

### Best Practices
- Test presentation conversion with sample files
- For critical slides, export to PDF manually first
- Use DPT-2 for slides with complex graphics or logos

### Usage Example
```python
# Parse PowerPoint
response = client.parse(
    document=Path("presentation.pptx"),
    model="dpt-2-latest"
)
```

## Spreadsheets

### Supported Formats
- **CSV** - Comma-Separated Values
- **XLSX** - Microsoft Excel

### Limits

| Environment | CSV Limit | XLSX Limit | Sheets/Rows/Columns |
|-------------|-----------|------------|---------------------|
| Playground | 10 MB | 10 MB | Unlimited |
| API/Library | Unlimited | Unlimited | Unlimited |

**Note:** In Playground, a render limit applies and only a truncated version is displayed. This does **not** affect parsing results.

### How Spreadsheets are Parsed

**Each table/sheet:**
- Extracted as `table` chunk type
- Cell-level IDs generated for traceability
- Converted to HTML tables in Markdown
- Grounding includes cell positions

### Best Practices
- Use CSV for simple data (faster processing)
- Use XLSX for multi-sheet workbooks
- For large spreadsheets, use Parse Jobs API (async)
- Filter specific sheets if only subset needed

### Usage Example
```python
# Parse Excel file
response = client.parse(
    document=Path("sales_data.xlsx"),
    model="dpt-2-latest"
)

# Access table chunks
tables = [chunk for chunk in response.chunks if chunk.type == 'table']
for table in tables:
    print(table.markdown)  # HTML table
```

## Loading from Bytes

### Python Library Support

You can load documents from bytes (useful for API responses, web uploads, or in-memory processing):

```python
from pathlib import Path

# Load PDF from bytes
with open("document.pdf", "rb") as f:
    pdf_bytes = f.read()

response = client.parse(
    document=pdf_bytes,  # Pass bytes directly
    model="dpt-2-latest"
)

# Load image from bytes
with open("image.jpg", "rb") as f:
    image_bytes = f.read()

response = client.parse(
    document=image_bytes,
    model="dpt-2-latest"
)
```

**Use Cases:**
- Processing files from web uploads without saving to disk
- Working with files from cloud storage APIs
- Processing encrypted files after decryption in memory

## Format Selection Guide

### When to Use Each Format

| Format | Best For | Considerations |
|--------|----------|----------------|
| **PDF** | Any document type, forms, reports | Native format - no conversion |
| **Images** | Receipts, photos, scanned docs | Use high resolution for better OCR |
| **DOCX** | Contracts, reports, letters | Layout may change during conversion |
| **PPTX** | Slide content extraction | Animations lost |
| **XLSX** | Financial data, tables, lists | Best for structured data |
| **CSV** | Simple tabular data | Fast processing |

## Troubleshooting

### Error: "document closed or encrypted"
**Cause:** Password-protected document
**Solution:** Pass `password="..."` parameter (requires ZDR enabled). Without ZDR, remove password protection before parsing.

### Poor OCR Results from Images
**Possible Causes:**
- Low resolution (< 300 DPI)
- Poor image quality
- Blurry or skewed text

**Solutions:**
- Increase image resolution
- Ensure good lighting for scanned documents
- Use deskewing tools if needed

### Unexpected Layout Changes (DOCX/PPTX)
**Cause:** File conversion to PDF
**Solutions:**
- Convert to PDF manually with preferred tool
- Test conversion with sample files
- Accept layout changes if content extraction is primary goal

### Large File Processing Slow
**Solutions:**
- Use Parse Jobs API for files > 50 pages
- Compress images before processing
- Split multi-document PDFs if possible

### Spreadsheet Too Large
**Solutions:**
- Filter to specific sheets before parsing
- Split large XLSX into smaller files
- Use CSV format if possible (faster)
- Use Parse Jobs API (async processing)

## API vs Playground Support

| Feature | Playground | API/Library |
|---------|------------|-------------|
| PDF Pages | Up to 100 | See rate limits |
| Common Images | ✓ | ✓ |
| Extended Images | ✗ | ✓ |
| Documents | ✓ | ✓ |
| Presentations | ✓ | ✓ |
| Spreadsheets | Up to 10 MB | Unlimited |
| Parse Jobs | ✗ | ✓ |
| Bytes Loading | ✗ | ✓ |

## References

- [Official File Types Documentation](https://docs.landing.ai/ade/ade-file-types)
- [Rate Limits](https://docs.landing.ai/ade/ade-rate-limits)
- [Parse Jobs for Large Files](https://docs.landing.ai/ade/ade-parse-async)
- [Python Library](https://docs.landing.ai/ade/ade-python)
