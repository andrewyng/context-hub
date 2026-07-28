# Visualization Patterns

Patterns for visualizing ADE parse and extraction results: block image
cropping, bounding box overlays, line-level highlights from atomic
grounding, and word-level grounding highlights.

All patterns use the v2 Parse API. Remember the v2 conventions:
`grounding.page` is **1-indexed** (PyMuPDF page index = `page - 1`),
`grounding.box` is normalized 0 to 1 with keys `xmin`, `ymin`, `xmax`,
`ymax`, and a block's text is `markdown[range.start:range.end]`.

> **Mandatory:** after producing any crop or overlay, read back at least
> one output PNG as an image and confirm its content matches the request
> (see the post-crop visual verification rule in SKILL.md). Page
> indexing and coordinate bugs are easy to miss without a visual check.

---

## 1. Block Image Extraction

Crop individual blocks from document pages using bounding box
coordinates. Useful for QA, debugging, and building visual search
indexes.

```python
from pathlib import Path
from typing import Any, Optional

from PIL import Image

try:
    import pymupdf
except ImportError:
    pymupdf = None  # type: ignore[assignment]


def save_block_images(
    parse_result: Any,
    document_path: Path,
    output_dir: Path,
    zoom: float = 2.0,
) -> Optional[Path]:
    """Crop and save each block as a PNG image.

    Creates: output_dir/<doc_stem>/page_<N>/<type>.<id>.png

    Args:
        parse_result: from client.v2.parse()
        document_path: original document file
        output_dir: base directory for block images
        zoom: render scale factor (2.0 = 144 DPI)

    Returns:
        Path to created document directory, or None on error.
    """
    if pymupdf is None:
        print("Install pymupdf: pip install pymupdf")
        return None

    doc_dir = output_dir / document_path.stem
    is_pdf = document_path.suffix.lower() == ".pdf"

    def _render(page_number: int) -> Image.Image:
        """Render one 1-indexed page as a PIL image."""
        if is_pdf:
            pdf = pymupdf.open(document_path)
            pix = pdf[page_number - 1].get_pixmap(
                matrix=pymupdf.Matrix(zoom, zoom)
            )
            img = Image.frombytes(
                "RGB", [pix.width, pix.height], pix.samples
            )
            pdf.close()
            return img
        return Image.open(document_path).convert("RGB")

    try:
        for page in parse_result.structure.children:
            page_number = page.grounding.page   # 1-indexed
            img = _render(page_number)
            w, h = img.size
            page_dir = doc_dir / f"page_{page_number}"
            page_dir.mkdir(parents=True, exist_ok=True)
            for block in page.children:
                box = block.grounding.box
                crop = img.crop((
                    int(box.xmin * w),
                    int(box.ymin * h),
                    int(box.xmax * w),
                    int(box.ymax * h),
                ))
                crop.save(page_dir / f"{block.type}.{block.id}.png")
        return doc_dir
    except Exception as exc:
        print(f"Failed to save block images: {exc}")
        return None
```

### Usage

```python
from landingai_ade import LandingAIADE
from pathlib import Path

client = LandingAIADE()
pr = client.v2.parse(document=Path("report.pdf"), model="dpt-3-pro-latest")
save_block_images(pr, Path("report.pdf"), Path("block_images/"))
# Creates: block_images/report/page_1/text.text-0.png, etc.
```

---

## 2. Grounding Overlay: Bounding Boxes on Pages

Draw color-coded bounding boxes on rendered page images to show where
each block was detected.

```python
from pathlib import Path
from typing import Any, Dict, Tuple

from PIL import Image, ImageDraw

try:
    import pymupdf
except ImportError:
    pymupdf = None  # type: ignore[assignment]

# Color map for block types (RGB tuples)
BLOCK_COLORS: Dict[str, Tuple[int, int, int]] = {
    "text": (40, 167, 69),         # green
    "table": (0, 123, 255),        # blue
    "table_cell": (0, 200, 255),   # light blue
    "marginalia": (111, 66, 193),  # purple
    "figure": (255, 0, 255),       # magenta
    "logo": (144, 238, 144),       # light green
    "card": (255, 165, 0),         # orange
    "attestation": (0, 255, 255),  # cyan
    "scan_code": (255, 193, 7),    # yellow
}
DEFAULT_COLOR = (200, 200, 200)


def render_page_image(
    document_path: Path,
    page_number: int,
    zoom: float = 2.0,
) -> Image.Image:
    """Render a single 1-indexed page as a PIL Image."""
    if document_path.suffix.lower() == ".pdf":
        if pymupdf is None:
            raise ImportError("pip install pymupdf")
        pdf = pymupdf.open(document_path)
        pix = pdf[page_number - 1].get_pixmap(
            matrix=pymupdf.Matrix(zoom, zoom)
        )
        img = Image.frombytes(
            "RGB", [pix.width, pix.height], pix.samples
        )
        pdf.close()
        return img
    return Image.open(document_path).convert("RGB")


def annotate_blocks(
    img: Image.Image,
    blocks: list,
    line_width: int = 3,
) -> Image.Image:
    """Draw bounding boxes for the given blocks on a page image."""
    annotated = img.copy()
    draw = ImageDraw.Draw(annotated)
    w, h = img.size

    for block in blocks:
        box = block.grounding.box
        color = BLOCK_COLORS.get(block.type, DEFAULT_COLOR)
        coords = [
            int(box.xmin * w),
            int(box.ymin * h),
            int(box.xmax * w),
            int(box.ymax * h),
        ]
        draw.rectangle(coords, outline=color, width=line_width)
    return annotated


def visualize_parse(
    parse_result: Any,
    document_path: Path,
    output_dir: Path,
    zoom: float = 2.0,
) -> None:
    """Render all parsed pages with block bounding box overlays.

    Saves: output_dir/<doc_stem>/page_<N>_annotated.png
    """
    doc_dir = output_dir / document_path.stem
    doc_dir.mkdir(parents=True, exist_ok=True)

    for page in parse_result.structure.children:
        page_number = page.grounding.page
        img = render_page_image(document_path, page_number, zoom)
        annotated = annotate_blocks(img, list(page.children))
        annotated.save(doc_dir / f"page_{page_number}_annotated.png")
```

### Visualize Extracted Fields Only

v2 Extract grounds each field with `ranges` (character offsets into the
input Markdown), not block references. To draw boxes for extracted
fields, map each field's ranges back to the parse blocks whose
`grounding.range` overlaps them:

```python
from collections import defaultdict
from pathlib import Path
from typing import Any


def blocks_for_field_ranges(
    parse_result: Any,
    extract_result: Any,
) -> dict[str, list]:
    """Map each extracted field to the parse blocks that contain it.

    Uses range overlap: a block contains a field value when the
    field's range falls inside the block's grounding.range.
    Requires that extract ran on this parse result's markdown.
    """
    field_blocks: dict[str, list] = defaultdict(list)
    # extraction_metadata is a plain dict: {field: {"value": ..., "ranges": [...]}}
    for field, meta in extract_result.extraction_metadata.items():
        ranges = meta.get("ranges") if isinstance(meta, dict) else None
        if not ranges:
            continue   # synthesized value: no source location
        for fr in ranges:
            for page in parse_result.structure.children:
                for block in page.children:
                    br = block.grounding.range
                    if br.start <= fr["start"] and fr["end"] <= br.end:
                        field_blocks[field].append(block)
    return field_blocks


def visualize_extraction(
    parse_result: Any,
    extract_result: Any,
    document_path: Path,
    output_dir: Path,
    zoom: float = 2.0,
) -> None:
    """Draw boxes only for blocks that contain extracted field values."""
    doc_dir = output_dir / document_path.stem
    doc_dir.mkdir(parents=True, exist_ok=True)

    field_blocks = blocks_for_field_ranges(parse_result, extract_result)
    ref_ids = {b.id for blocks in field_blocks.values() for b in blocks}

    for page in parse_result.structure.children:
        page_number = page.grounding.page
        blocks = [b for b in page.children if b.id in ref_ids]
        if not blocks:
            continue
        img = render_page_image(document_path, page_number, zoom)
        annotated = annotate_blocks(img, blocks)
        annotated.save(doc_dir / f"page_{page_number}_annotated.png")
```

---

## 3. Line-Level Highlighting with Atomic Grounding

v2 leaf blocks carry `atomic_grounding`: a list of `{page, range, box}`
objects, one per visual line for `text` and `marginalia` blocks. This
gives line-level boxes directly from the parse response, with no OCR,
and each entry's `range` tells you exactly which slice of the Markdown
that line holds. Use it to highlight the specific lines where a term
appears.

```python
from pathlib import Path
from typing import Any, List

from PIL import Image, ImageDraw

try:
    import pymupdf
except ImportError:
    pymupdf = None  # type: ignore[assignment]

HIGHLIGHT = (255, 255, 0, 120)   # semi-transparent yellow


def find_term_lines(
    parse_result: Any,
    term: str,
) -> List[Any]:
    """Return atomic_grounding entries for lines containing term."""
    md = parse_result.markdown
    hits = []
    for page in parse_result.structure.children:
        for block in page.children:
            for line in block.atomic_grounding or []:
                text = md[line.range.start:line.range.end]
                if term.lower() in text.lower():
                    hits.append(line)
    return hits


def highlight_lines(
    document_path: Path,
    lines: List[Any],
    output_dir: Path,
    zoom: float = 2.0,
) -> None:
    """Overlay semi-transparent highlights on each line's box.

    Saves one annotated PNG per page that has at least one hit.
    """
    if pymupdf is None:
        raise ImportError("pip install pymupdf")
    output_dir.mkdir(parents=True, exist_ok=True)

    by_page: dict[int, list] = {}
    for line in lines:
        by_page.setdefault(line.page, []).append(line)

    pdf = pymupdf.open(document_path)
    for page_number, page_lines in by_page.items():
        pix = pdf[page_number - 1].get_pixmap(
            matrix=pymupdf.Matrix(zoom, zoom)
        )
        img = Image.frombytes(
            "RGB", [pix.width, pix.height], pix.samples
        ).convert("RGBA")
        overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        w, h = img.size
        for line in page_lines:
            b = line.box
            draw.rectangle(
                [int(b.xmin * w), int(b.ymin * h),
                 int(b.xmax * w), int(b.ymax * h)],
                fill=HIGHLIGHT,
            )
        out = Image.alpha_composite(img, overlay)
        out.convert("RGB").save(
            output_dir / f"page_{page_number}_lines.png"
        )
    pdf.close()
```

### Usage

```python
from landingai_ade import LandingAIADE
from pathlib import Path

client = LandingAIADE()
pr = client.v2.parse(document=Path("paper.pdf"), model="dpt-3-pro-latest")

lines = find_term_lines(pr, "quantization")
highlight_lines(Path("paper.pdf"), lines, Path("highlights/"))
```

Atomic grounding is line-level, not word-level: the box covers the whole
visual line. For word-level boxes, use Section 4.

---

## 4. Word-Level Grounding

Two approaches depending on whether the PDF contains native text or is
scanned.

| Scenario | Approach |
|----------|----------|
| Native text PDF (most PDFs) | **4a**: PyMuPDF native extraction (exact, fast, no extra deps) |
| Scanned / image-only PDF | **4b**: Tesseract OCR + fuzzy match |

---

## 4a. Native PDF Word Search (preferred)

For text-based PDFs, PyMuPDF's `get_text("words", clip=rect)` finds
words exactly with no OCR required. The key pattern is **spatially
restricting the search to specific ADE block bounding boxes**, so
occurrences in adjacent sections on the same page (for example, an
abstract above the introduction) are automatically excluded.

```python
from pathlib import Path
from typing import List

try:
    import pymupdf
except ImportError:
    pymupdf = None  # type: ignore[assignment]


def find_term_in_blocks(
    pdf_path: Path,
    page_number: int,     # 1-indexed (ADE convention)
    blocks: list,         # v2 block objects with grounding
    term: str,
    zoom: float = 2.0,
) -> List[dict]:
    """Find term only within the given block bounding boxes.

    Uses PyMuPDF native text extraction clipped to each block rect so
    occurrences outside the supplied blocks are ignored.

    Returns list of dicts: text, left, top, width, height (pixel
    coords at zoom scale, matching render_page_image() output).
    """
    if pymupdf is None:
        raise ImportError("pip install pymupdf")
    pdf = pymupdf.open(pdf_path)
    page = pdf[page_number - 1]
    pw, ph = page.rect.width, page.rect.height

    boxes = []
    for block in blocks:
        b = block.grounding.box
        clip = pymupdf.Rect(
            b.xmin * pw, b.ymin * ph, b.xmax * pw, b.ymax * ph
        )
        # Each word entry: (x0, y0, x1, y1, "word", block_no, line_no, word_no)
        for x0, y0, x1, y1, text, *_ in page.get_text("words", clip=clip):
            if text.strip(".,;:!?()[]{}\"'-") == term:
                boxes.append({
                    "text":   text,
                    "left":   int(x0 * zoom),
                    "top":    int(y0 * zoom),
                    "width":  int((x1 - x0) * zoom),
                    "height": int((y1 - y0) * zoom),
                })
    pdf.close()
    return boxes
```

### Annotation and Redaction

The same overlay function handles both use cases; the only difference
is the alpha value of the fill colour:

```python
from typing import List, Tuple

from PIL import Image, ImageDraw

# Highlight: semi-transparent colour (text remains readable)
HIGHLIGHT = (255, 255, 0, 120)   # yellow

# Redact: opaque box (text is visually hidden)
REDACT = (0, 0, 0, 255)          # black, fully opaque


def overlay_word_boxes(
    page_img: Image.Image,
    boxes: List[dict],
    fill: Tuple[int, int, int, int] = HIGHLIGHT,
) -> Image.Image:
    """Overlay filled rectangles on a page image.

    Pass HIGHLIGHT for annotation or REDACT to cover sensitive content.
    Output is a PNG image, not a PDF-native redaction.
    """
    rgba = page_img.convert("RGBA")
    overlay = Image.new("RGBA", rgba.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for b in boxes:
        draw.rectangle(
            [b["left"], b["top"],
             b["left"] + b["width"], b["top"] + b["height"]],
            fill=fill,
        )
    return Image.alpha_composite(rgba, overlay)
```

> **PDF-native redaction** (permanently removes underlying text, not
> just visually covers it) uses `page.add_redact_annot()` /
> `page.apply_redactions()` from PyMuPDF. That does not depend on ADE.

### Usage

```python
from landingai_ade import LandingAIADE
from pathlib import Path

client = LandingAIADE()
pr = client.v2.parse(document=Path("paper.pdf"), model="dpt-3-pro-latest")
md = pr.markdown

# Select only the blocks you want to search within (page 2 here)
target_blocks = []
for page in pr.structure.children:
    if page.grounding.page != 2:
        continue
    for block in page.children:
        r = block.grounding.range
        if "introduction" in md[r.start:r.end].lower():
            target_blocks.append(block)

boxes = find_term_in_blocks(Path("paper.pdf"), page_number=2,
                            blocks=target_blocks, term="L2S")
img = render_page_image(Path("paper.pdf"), page_number=2)
highlighted = overlay_word_boxes(img, boxes, fill=HIGHLIGHT)
highlighted.convert("RGB").save("page_2_highlighted.png")
```

---

## 4b. OCR Word-Level Grounding (scanned PDFs)

For precise highlighting of extracted values within blocks of scanned
documents. Uses Tesseract OCR on block crops + fuzzy matching to locate
exact words.

> **Requires:** `pytesseract`, `tesseract` system binary, `fuzzywuzzy`

```python
from typing import List, Tuple

from PIL import Image, ImageDraw

try:
    import pytesseract
    from fuzzywuzzy import fuzz
    WORD_GROUNDING_AVAILABLE = True
except ImportError:
    WORD_GROUNDING_AVAILABLE = False


def find_words_in_image(
    block_image: Image.Image,
    search_text: str,
    confidence_threshold: int = 60,
    fuzzy_threshold: int = 80,
) -> List[dict]:
    """Find word-level bounding boxes matching search_text.

    Returns list of dicts with keys: text, left, top, width,
    height, conf, match_score.
    """
    if not WORD_GROUNDING_AVAILABLE:
        raise ImportError(
            "pip install pytesseract fuzzywuzzy python-Levenshtein"
        )

    ocr_data = pytesseract.image_to_data(
        block_image, output_type=pytesseract.Output.DICT
    )
    search_words = search_text.lower().split()
    matches: List[dict] = []

    for i, word in enumerate(ocr_data["text"]):
        conf = int(ocr_data["conf"][i])
        if conf < confidence_threshold or not word.strip():
            continue
        for sw in search_words:
            score = fuzz.ratio(word.lower(), sw)
            if score >= fuzzy_threshold:
                matches.append({
                    "text": word,
                    "left": ocr_data["left"][i],
                    "top": ocr_data["top"][i],
                    "width": ocr_data["width"][i],
                    "height": ocr_data["height"][i],
                    "conf": conf,
                    "match_score": score,
                })
    return matches


def highlight_words(
    block_image: Image.Image,
    matches: List[dict],
    color: Tuple[int, int, int, int] = (255, 255, 0, 100),
) -> Image.Image:
    """Draw semi-transparent highlights over matched words."""
    highlighted = block_image.convert("RGBA")
    overlay = Image.new("RGBA", highlighted.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    for m in matches:
        draw.rectangle(
            [
                m["left"],
                m["top"],
                m["left"] + m["width"],
                m["top"] + m["height"],
            ],
            fill=color,
        )
    return Image.alpha_composite(highlighted, overlay)
```

### Full Word-Level Grounding Pipeline

For each extracted field, locate its source block through range
overlap, crop the block, then OCR-match the extracted value inside it:

```python
from pathlib import Path
from typing import Any


def word_level_grounding(
    parse_result: Any,
    extract_result: Any,
    document_path: Path,
    output_dir: Path,
    zoom: float = 2.0,
) -> None:
    """For each extracted field, find and highlight the exact
    words in the source block.

    Requires that extract ran on this parse result's markdown.
    Saves highlighted block crops to output_dir.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    extraction = extract_result.extraction

    for field_name, meta in extract_result.extraction_metadata.items():
        ranges = meta.get("ranges") if isinstance(meta, dict) else None
        value = meta.get("value") if isinstance(meta, dict) else None
        if not ranges or not value or not isinstance(value, str):
            continue

        # Find the first block whose range contains the field's range
        fr = ranges[0]
        source_block = None
        for page in parse_result.structure.children:
            for block in page.children:
                br = block.grounding.range
                if br.start <= fr["start"] and fr["end"] <= br.end:
                    source_block = block
                    break
            if source_block:
                break
        if source_block is None:
            continue

        # Crop the block from its page
        page_number = source_block.grounding.page
        page_img = render_page_image(document_path, page_number, zoom)
        box = source_block.grounding.box
        w, h = page_img.size
        crop = page_img.crop((
            int(box.xmin * w),
            int(box.ymin * h),
            int(box.xmax * w),
            int(box.ymax * h),
        ))

        # Find and highlight words
        matches = find_words_in_image(crop, value)
        if matches:
            highlighted = highlight_words(crop, matches)
            out = output_dir / f"{field_name}_{source_block.id}.png"
            highlighted.save(out)
```

---

## Dependencies

```
# Block images + bounding box overlays + atomic grounding + native word search (Sections 1-4a)
pip install landingai-ade Pillow pymupdf

# OCR word-level grounding / scanned PDFs (Section 4b)
pip install landingai-ade Pillow pymupdf pytesseract fuzzywuzzy python-Levenshtein
# Also requires: brew install tesseract (macOS) or apt install tesseract-ocr (Linux)
```
