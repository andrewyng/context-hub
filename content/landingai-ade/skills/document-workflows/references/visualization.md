# Visualization Patterns

Patterns for visualizing ADE parse and extraction results: chunk image
cropping, bounding box overlays, and word-level grounding highlights.

---

## 1. Chunk Image Extraction

Crop individual chunks from document pages using bounding box coordinates.
Useful for QA, debugging, and building visual search indexes.

```python
from pathlib import Path
from typing import Any, List, Optional

from PIL import Image

try:
    import pymupdf
except ImportError:
    pymupdf = None  # type: ignore[assignment]


def save_chunk_images(
    parse_result: Any,
    document_path: Path,
    output_dir: Path,
    zoom: float = 2.0,
) -> Optional[Path]:
    """Crop and save each chunk as a PNG image.

    Creates: output_dir/<doc_stem>/page_<N>/<type>.<id>.png

    Args:
        parse_result: from client.parse()
        document_path: original document file
        output_dir: base directory for chunk images
        zoom: render scale factor (2.0 = 144 DPI)

    Returns:
        Path to created document directory, or None on error.
    """
    if pymupdf is None:
        print("Install pymupdf: pip install pymupdf")
        return None

    doc_dir = output_dir / document_path.stem
    chunks = parse_result.chunks or []

    def _save_page_chunks(
        img: Image.Image,
        page_chunks: List[Any],
        page_num: int,
    ) -> None:
        w, h = img.size
        page_dir = doc_dir / f"page_{page_num}"
        page_dir.mkdir(parents=True, exist_ok=True)
        for ch in page_chunks:
            if (
                not hasattr(ch, "grounding")
                or ch.grounding.page != page_num
            ):
                continue
            box = ch.grounding.box
            crop = img.crop((
                int(box.left * w),
                int(box.top * h),
                int(box.right * w),
                int(box.bottom * h),
            ))
            fname = f"{ch.type}.{ch.id}.png"
            crop.save(page_dir / fname)

    try:
        if document_path.suffix.lower() == ".pdf":
            pdf = pymupdf.open(document_path)
            mat = pymupdf.Matrix(zoom, zoom)
            for page_num in range(len(pdf)):
                pix = pdf[page_num].get_pixmap(matrix=mat)
                img = Image.frombytes(
                    "RGB", [pix.width, pix.height], pix.samples
                )
                _save_page_chunks(img, chunks, page_num)
            pdf.close()
        else:
            img = Image.open(document_path).convert("RGB")
            _save_page_chunks(img, chunks, 0)
        return doc_dir
    except Exception as exc:
        print(f"Failed to save chunk images: {exc}")
        return None
```

### Usage

```python
from landingai_ade import LandingAIADE
from pathlib import Path

client = LandingAIADE()
pr = client.parse(document=Path("report.pdf"))
save_chunk_images(pr, Path("report.pdf"), Path("chunk_images/"))
# Creates: chunk_images/report/page_0/text.abc123.png, etc.
```

---

## 2. Grounding Overlay — Bounding Boxes on Pages

Draw color-coded bounding boxes on rendered page images to show where
each chunk was detected.

```python
from pathlib import Path
from typing import Any, Dict, Tuple

from PIL import Image, ImageDraw

try:
    import pymupdf
except ImportError:
    pymupdf = None  # type: ignore[assignment]

# Color map for chunk types (RGB tuples)
CHUNK_COLORS: Dict[str, Tuple[int, int, int]] = {
    "text": (40, 167, 69),         # green
    "table": (0, 123, 255),        # blue
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
    page_num: int,
    zoom: float = 2.0,
) -> Image.Image:
    """Render a single page as a PIL Image."""
    if document_path.suffix.lower() == ".pdf":
        if pymupdf is None:
            raise ImportError("pip install pymupdf")
        pdf = pymupdf.open(document_path)
        pix = pdf[page_num].get_pixmap(
            matrix=pymupdf.Matrix(zoom, zoom)
        )
        img = Image.frombytes(
            "RGB", [pix.width, pix.height], pix.samples
        )
        pdf.close()
        return img
    return Image.open(document_path).convert("RGB")


def annotate_page(
    img: Image.Image,
    chunks: list,
    page_num: int,
    line_width: int = 3,
) -> Image.Image:
    """Draw bounding boxes for all chunks on a page image."""
    annotated = img.copy()
    draw = ImageDraw.Draw(annotated)
    w, h = img.size

    for ch in chunks:
        if (
            not hasattr(ch, "grounding")
            or ch.grounding.page != page_num
        ):
            continue
        box = ch.grounding.box
        color = CHUNK_COLORS.get(
            getattr(ch, "type", ""), DEFAULT_COLOR
        )
        coords = [
            int(box.left * w),
            int(box.top * h),
            int(box.right * w),
            int(box.bottom * h),
        ]
        draw.rectangle(coords, outline=color, width=line_width)
    return annotated


def visualize_parse(
    parse_result: Any,
    document_path: Path,
    output_dir: Path,
    zoom: float = 2.0,
) -> None:
    """Render all pages with chunk bounding box overlays.

    Saves: output_dir/<doc_stem>/page_<N>_annotated.png
    """
    doc_dir = output_dir / document_path.stem
    doc_dir.mkdir(parents=True, exist_ok=True)
    chunks = parse_result.chunks or []

    # Determine page count
    if document_path.suffix.lower() == ".pdf":
        pdf = pymupdf.open(document_path)
        n_pages = len(pdf)
        pdf.close()
    else:
        n_pages = 1

    for page_num in range(n_pages):
        img = render_page_image(document_path, page_num, zoom)
        annotated = annotate_page(img, chunks, page_num)
        out_path = doc_dir / f"page_{page_num + 1}_annotated.png"
        annotated.save(out_path)
```

### Visualize Extracted Fields Only

Show only the chunks that contributed to extracted fields (using
extraction metadata references):

```python
def visualize_extraction(
    parse_result: Any,
    extract_result: Any,
    document_path: Path,
    output_dir: Path,
    zoom: float = 2.0,
) -> None:
    """Draw boxes only for chunks referenced by extracted
    fields."""
    doc_dir = output_dir / document_path.stem
    doc_dir.mkdir(parents=True, exist_ok=True)

    # Collect referenced chunk IDs
    meta = getattr(extract_result, "extraction_metadata", {})
    if isinstance(meta, dict):
        ref_ids = set()
        for field_meta in meta.values():
            refs = (
                field_meta.get("references", [])
                if isinstance(field_meta, dict)
                else getattr(field_meta, "references", [])
            )
            ref_ids.update(refs)
    else:
        ref_ids = set()

    # Filter chunks to only referenced ones
    ref_chunks = [
        ch for ch in (parse_result.chunks or [])
        if getattr(ch, "id", None) in ref_ids
    ]

    if document_path.suffix.lower() == ".pdf":
        pdf = pymupdf.open(document_path)
        n_pages = len(pdf)
        pdf.close()
    else:
        n_pages = 1

    for page_num in range(n_pages):
        img = render_page_image(document_path, page_num, zoom)
        annotated = annotate_page(img, ref_chunks, page_num)
        out = doc_dir / f"page_{page_num + 1}_annotated.png"
        annotated.save(out)
```

---

## 3. Word-Level Grounding

Two approaches depending on whether the PDF contains native text or is scanned.

| Scenario | Approach |
|----------|----------|
| Native text PDF (most PDFs) | **3a** — PyMuPDF native extraction (exact, fast, no extra deps) |
| Scanned / image-only PDF | **3b** — Tesseract OCR + fuzzy match |

---

## 3a. Native PDF Word Search (preferred)

For text-based PDFs, PyMuPDF's `get_text("words", clip=rect)` finds words
exactly with no OCR required. The key pattern is **spatially restricting the
search to specific ADE chunk bounding boxes**, so occurrences in adjacent
sections on the same page (e.g. an abstract above the introduction) are
automatically excluded.

```python
from pathlib import Path
from typing import Any, List, Tuple

from PIL import Image, ImageDraw

try:
    import pymupdf
except ImportError:
    pymupdf = None  # type: ignore[assignment]


def find_term_in_chunks(
    pdf_path: Path,
    page_num: int,
    chunks: list,           # ADE chunk objects with grounding
    term: str,
    zoom: float = 2.0,
) -> List[dict]:
    """Find *term* only within the ADE chunk bounding boxes on *page_num*.

    Uses PyMuPDF native text extraction clipped to each chunk rect so that
    occurrences outside the supplied chunks are ignored.

    Returns list of dicts: text, left, top, width, height (pixel coords
    at *zoom* scale, matching the image from render_page_image()).
    """
    if pymupdf is None:
        raise ImportError("pip install pymupdf")
    pdf = pymupdf.open(pdf_path)
    page = pdf[page_num]
    pw, ph = page.rect.width, page.rect.height

    boxes = []
    for ch in chunks:
        b = ch.grounding.box
        clip = pymupdf.Rect(b.left * pw, b.top * ph, b.right * pw, b.bottom * ph)
        # Each word entry: (x0, y0, x1, y1, "word", block_no, line_no, word_no)
        for x0, y0, x1, y1, text, *_ in page.get_text("words", clip=clip):
            if text.strip(".,;:!?()[]{}\"'–—") == term:
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

The same `annotate_page` function handles both use cases — the only
difference is the alpha value of the fill colour:

```python
# Highlight: semi-transparent colour (text remains readable)
HIGHLIGHT = (255, 255, 0, 120)   # yellow

# Redact: opaque box (text is visually hidden)
REDACT = (0, 0, 0, 255)          # black, fully opaque


def annotate_page(
    page_img: Image.Image,
    boxes: List[dict],
    fill: Tuple[int, int, int, int] = HIGHLIGHT,
) -> Image.Image:
    """Overlay filled rectangles on a page image.

    Pass HIGHLIGHT for annotation or REDACT to cover sensitive content.
    Output is a PNG image — not a PDF-native redaction.
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

> **PDF-native redaction** (permanently removes underlying text, not just
> visually covers it) uses `page.add_redact_annot()` /
> `page.apply_redactions()` from PyMuPDF. That does not depend on ADE and
> belongs in the `pdf` skill.

### Usage

```python
from landingai_ade import LandingAIADE

client = LandingAIADE()
pr = client.parse(document=Path("paper.pdf"))

# Select only the chunks you want to search within
target_chunks = [ch for ch in pr.chunks if ch.grounding.page == 1
                 and "introduction" in (ch.markdown or "").lower()]

boxes = find_term_in_chunks(Path("paper.pdf"), page_num=1,
                            chunks=target_chunks, term="L2S")
img = render_page_image(Path("paper.pdf"), page_num=1)
highlighted = annotate_page(img, boxes, fill=HIGHLIGHT)
highlighted.convert("RGB").save("page_2_highlighted.png")
```

---

## 3b. OCR Word-Level Grounding (scanned PDFs)

For precise highlighting of extracted values within chunks. Uses
Tesseract OCR on chunk crops + fuzzy matching to locate exact words.

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


def find_words_in_chunk(
    chunk_image: Image.Image,
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
        chunk_image, output_type=pytesseract.Output.DICT
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
    chunk_image: Image.Image,
    matches: List[dict],
    color: Tuple[int, int, int, int] = (255, 255, 0, 100),
) -> Image.Image:
    """Draw semi-transparent highlights over matched words."""
    highlighted = chunk_image.convert("RGBA")
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

```python
def word_level_grounding(
    parse_result: Any,
    extract_result: Any,
    document_path: Path,
    output_dir: Path,
    zoom: float = 2.0,
) -> None:
    """For each extracted field, find and highlight the exact
    words in the source chunk.

    Saves highlighted chunk crops to output_dir.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    meta = getattr(extract_result, "extraction_metadata", {})
    extraction = extract_result.extraction

    # Build chunk lookup
    chunk_map = {
        ch.id: ch for ch in (parse_result.chunks or [])
        if hasattr(ch, "id")
    }

    for field_name, field_meta in (
        meta.items() if isinstance(meta, dict) else []
    ):
        refs = (
            field_meta.get("references", [])
            if isinstance(field_meta, dict)
            else getattr(field_meta, "references", [])
        )
        if not refs:
            continue

        # Get the extracted value
        value = _dig_value(extraction, field_name)
        if not value or not isinstance(value, str):
            continue

        chunk_id = refs[0]
        chunk = chunk_map.get(chunk_id)
        if not chunk or not hasattr(chunk, "grounding"):
            continue

        # Crop the chunk from the page
        page_num = chunk.grounding.page
        page_img = render_page_image(
            document_path, page_num, zoom
        )
        box = chunk.grounding.box
        w, h = page_img.size
        crop = page_img.crop((
            int(box.left * w),
            int(box.top * h),
            int(box.right * w),
            int(box.bottom * h),
        ))

        # Find and highlight words
        matches = find_words_in_chunk(crop, str(value))
        if matches:
            highlighted = highlight_words(crop, matches)
            out = output_dir / f"{field_name}_{chunk_id}.png"
            highlighted.save(out)


def _dig_value(d: dict, dotted_key: str) -> Any:
    """Get value from nested dict using __ separator."""
    parts = dotted_key.split("__")
    obj: Any = d
    for p in parts:
        if isinstance(obj, dict):
            obj = obj.get(p)
        else:
            return None
    return obj
```

---

## Dependencies

```
# Chunk images + bounding box overlays + native word search (Sections 1–3a)
pip install landingai-ade Pillow pymupdf

# OCR word-level grounding / scanned PDFs (Section 3b)
pip install landingai-ade Pillow pymupdf pytesseract fuzzywuzzy python-Levenshtein
# Also requires: brew install tesseract (macOS) or apt install tesseract-ocr (Linux)
```
