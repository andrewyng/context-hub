# Parts MCP — Tool Parameter Reference

Complete parameter reference for all parts-mcp tools. Grouped by category.

## Search Tools

### search_parts

Search for electronic parts across suppliers.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | `str` | required | Search query — part number, description, or keywords |
| `category` | `str \| None` | `None` | Category filter (e.g., "resistor", "capacitor", "microcontroller") |
| `filters` | `dict \| None` | `None` | Parametric filters (e.g., `{"resistance": "10k", "tolerance": "1%"}`) |
| `limit` | `int` | `20` | Maximum results to return |

**Returns:**

```json
{
  "query": "STM32F411",
  "category": null,
  "filters": {},
  "results": [
    {
      "part_number": "STM32F411CEU6",
      "manufacturer": "STMicroelectronics",
      "description": "ARM Cortex-M4 MCU, 512KB Flash, 128KB RAM",
      "category": "microcontroller"
    }
  ],
  "total_results": 15,
  "success": true
}
```

### search_by_parameters

Parametric search within a specific category.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `parameters` | `dict` | required | Search criteria (e.g., `{"capacitance": "100nF", "voltage": "50V", "package": "0402"}`) |
| `category` | `str` | required | Part category |
| `limit` | `int` | `20` | Maximum results |

**Returns:**

```json
{
  "category": "capacitor",
  "parameters": {"capacitance": "100nF", "voltage": "50V"},
  "results": [...],
  "total_results": 42,
  "success": true
}
```

### get_part_details

Get detailed information about a specific part.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `part_number` | `str` | required | Part number to look up |
| `manufacturer` | `str \| None` | `None` | Manufacturer name (disambiguates when multiple manufacturers use same part number) |

**Returns:**

```json
{
  "part_number": "STM32F411CEU6",
  "manufacturer": "STMicroelectronics",
  "details": {
    "description": "...",
    "specifications": {...},
    "datasheet_url": "...",
    "lifecycle_status": "active"
  },
  "success": true
}
```

## Sourcing Tools

### compare_prices

Compare prices across multiple suppliers.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `part_number` | `str` | required | Part number to price |
| `quantity` | `int` | `1` | Quantity needed (affects price breaks) |
| `suppliers` | `list[str] \| None` | `None` | Specific suppliers to check (checks all if omitted) |

**Returns:**

```json
{
  "part_number": "STM32F411CEU6",
  "quantity": 100,
  "suppliers_checked": 5,
  "prices": [
    {
      "supplier": "LCSC",
      "sku": "C478234",
      "unit_price": 3.42,
      "total_price": 342.00,
      "stock": 15000,
      "lead_time": "3-5 days"
    }
  ],
  "best_price": {"supplier": "LCSC", "unit_price": 3.42},
  "success": true
}
```

### check_availability

Check stock levels for multiple parts at once.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `part_numbers` | `list[str]` | required | List of part numbers to check |
| `quantities` | `list[int] \| None` | `None` | Quantities needed per part (defaults to 1 each) |

**Returns:**

```json
{
  "parts": ["STM32F411CEU6", "LM1117-3.3"],
  "quantities": [100, 100],
  "availability": [
    {
      "part_number": "STM32F411CEU6",
      "quantity_needed": 100,
      "available": true,
      "total_stock": 15000,
      "in_stock_suppliers": 3,
      "manufacturer": "STMicroelectronics",
      "description": "ARM Cortex-M4 MCU"
    }
  ],
  "all_available": true,
  "success": true
}
```

### find_alternatives

Find drop-in or compatible replacement parts.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `part_number` | `str` | required | Original part number |
| `parameters` | `dict \| None` | `None` | Key parameters to match (narrows alternatives) |

**Returns:**

```json
{
  "original_part": "STM32F411CEU6",
  "match_parameters": {"core": "ARM Cortex-M4"},
  "alternatives": [
    {
      "part_number": "STM32F401CEU6",
      "manufacturer": "STMicroelectronics",
      "compatibility": "pin-compatible",
      "differences": ["256KB Flash vs 512KB"]
    }
  ],
  "total_alternatives": 8,
  "success": true
}
```

### calculate_bom_cost

Calculate total cost for a complete bill of materials.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `bom` | `list[dict]` | required | BOM items (see format below) |
| `quantity` | `int` | `1` | Number of boards/assemblies |
| `preferred_suppliers` | `list[str] \| None` | `None` | Preferred supplier list |

**BOM item format:**

```json
{
  "part_number": "STM32F411CEU6",
  "quantity": 1,
  "reference": "U1",
  "description": "Main MCU"
}
```

Fields `part_number` (or `mpn`) and `quantity` are required. `reference` and `description`/`value` are optional.

**Returns:**

```json
{
  "bom_items": 25,
  "priced_items": 23,
  "quantity": 100,
  "total_cost": 1250.00,
  "cost_breakdown": [
    {
      "reference": "U1",
      "part_number": "STM32F411CEU6",
      "description": "Main MCU",
      "quantity": 100,
      "unit_price": 3.42,
      "line_total": 342.00,
      "supplier": "LCSC",
      "sku": "C478234"
    }
  ],
  "errors": [{"part_number": "CUSTOM-PART-1", "error": "not found"}],
  "currency": "USD",
  "success": true
}
```

### estimate_cost

Quick cost estimate without full BOM processing.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `parts` | `list[dict]` | required | Parts list with `part_number` and `quantity` |
| `currency` | `str` | `"USD"` | Currency code |

## Manufacturing Tools

### upload_bom

Upload a BOM file for processing and part matching. **Local mode only.**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_path` | `str` | required | Local path to BOM file |

Supported formats: CSV, XLSX, XLS, JSON, XML. Max size: 50 MB.

**Returns:** `job_id` for polling with `check_bom_status`.

### check_bom_status

Poll BOM processing status. When complete, returns matched and unmatched parts.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `job_id` | `str` | required | Job ID from `upload_bom` |

**Returns (when complete):**

```json
{
  "job_id": "bom_abc123",
  "status": "complete",
  "bom_id": "bom_def456",
  "summary": {"total_lines": 25, "matched": 23, "unmatched": 2},
  "matched_parts": [...],
  "unknown_parts": [
    {
      "reference": "U3",
      "value": "CUSTOM-IC",
      "footprint": "QFP-48",
      "manufacturer": "",
      "mpn": "",
      "status": "unmatched"
    }
  ],
  "success": true
}
```

### submit_dfm

Queue a Design for Manufacturability analysis.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `project_id` | `str` | required | Project ID to analyze |
| `bom_id` | `str \| None` | `None` | BOM ID to include |
| `revision` | `str \| None` | `None` | Revision identifier |
| `notes` | `str \| None` | `None` | Analysis notes |
| `priority` | `str` | `"normal"` | `"low"`, `"normal"`, or `"high"` |

### check_dfm_status

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `job_id` | `str` | required | Job ID from `submit_dfm` |

### quote_fabrication

Get a PCB fabrication quote.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `project_id` | `str` | required | Project ID |
| `quantity` | `int` | `5` | Number of boards |
| `layers` | `int` | `2` | PCB layer count |
| `thickness` | `float` | `1.6` | Board thickness in mm |
| `surface_finish` | `str` | `"HASL"` | Surface finish (HASL, ENIG, OSP) |
| `color` | `str` | `"green"` | Solder mask color (green, red, blue, black, white, yellow) |
| `priority` | `str` | `"normal"` | `"low"`, `"normal"`, or `"high"` |

### upload_gerbers_for_quote

Upload gerber zip for fab quoting. **Local mode only.** Same parameters as `quote_fabrication` except uses `file_path` instead of `project_id`.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_path` | `str` | required | Path to gerber zip file |
| `quantity` | `int` | `5` | Number of boards |
| `layers` | `int` | `2` | PCB layer count |
| `thickness` | `float` | `1.6` | Board thickness in mm |
| `surface_finish` | `str` | `"HASL"` | Surface finish |
| `color` | `str` | `"green"` | Solder mask color |
| `priority` | `str` | `"normal"` | Priority level |

### quote_assembly

Combined fabrication + assembly quote. **Local mode only.** Uploads gerbers for fab and BOM for assembly costing. Polls BOM status internally to get `bom_id`, then calculates COGS.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `gerber_path` | `str` | required | Path to gerber zip |
| `bom_path` | `str` | required | Path to BOM file |
| `quantity` | `int` | `5` | Number of assemblies |
| `layers` | `int` | `2` | PCB layer count |
| `thickness` | `float` | `1.6` | Board thickness in mm |
| `surface_finish` | `str` | `"HASL"` | Surface finish |
| `color` | `str` | `"green"` | Solder mask color |
| `priority` | `str` | `"normal"` | Priority level |

### check_manufacturing_status

Poll status of any manufacturing job (fab, DFM, AOI, QC).

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `job_id` | `str` | required | Job ID from any manufacturing submission |

## Datasheet Tools

### list_datasheet_sections

Lightweight TOC extraction. Returns section titles and page numbers without reading content.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_path` | `str \| None` | `None` | Local PDF path (local mode) |
| `sku` | `str \| None` | `None` | Part SKU for cached data |

One of `file_path` or `sku` is required.

**Returns:**

```json
{
  "source": "STM32F411CEU6",
  "total_pages": 196,
  "sections": [
    {"title": "Features", "page": 1},
    {"title": "Electrical Characteristics", "page": 42},
    {"title": "Absolute Maximum Ratings", "page": 55}
  ],
  "section_count": 28,
  "success": true
}
```

### read_datasheet

Read and chunk a datasheet PDF with optional keyword filtering.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_path` | `str \| None` | `None` | Local PDF path |
| `sku` | `str \| None` | `None` | Part SKU for cached chunks |
| `query` | `str \| None` | `None` | Keywords to filter chunks (e.g., "maximum input voltage") |
| `chunk_pages` | `int` | `5` | Pages per chunk |

One of `file_path` or `sku` is required.

**Returns:**

```json
{
  "source": "STM32F411CEU6",
  "total_pages": 196,
  "method": "cached",
  "toc": [{"title": "Features", "page": 1}],
  "chunks": [
    {
      "text": "...chunk content...",
      "start_page": 51,
      "end_page": 55
    }
  ],
  "query": "maximum input voltage",
  "context_savings": {
    "total_chunks": 40,
    "returned_chunks": 3,
    "total_chars": 250000,
    "returned_chars": 18000,
    "reduction_pct": 92.8
  },
  "success": true
}
```

## KiCad Tools (Local Mode Only)

### find_kicad_projects

Discover `.kicad_pro` files in configured search paths. No parameters.

**Returns:**

```json
{
  "projects": [
    {
      "name": "my-board",
      "path": "/home/user/projects/my-board/my-board.kicad_pro",
      "modified": "2026-03-10T14:30:00"
    }
  ],
  "total": 5,
  "search_paths": ["/home/user/projects"]
}
```

### extract_bom_from_kicad

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `project_path` | `str` | required | Path to `.kicad_pro` file |

### analyze_kicad_project

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `project_path` | `str` | required | Path to `.kicad_pro` file |

Returns file counts: total, schematics, PCBs, data files.

### extract_netlist_from_project

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `project_path` | `str` | required | Path to `.kicad_pro` file |

### match_components_to_parts

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `components` | `list[dict]` | required | Components from KiCad BOM extraction |
| `auto_search` | `bool` | `True` | Auto-search for matching parts |

### export_parts_to_kicad

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `parts` | `list[dict]` | required | Parts with: `reference`, `value`, `footprint`, `manufacturer`, `part_number`, `supplier`, `quantity`, `unit_price` |
| `output_path` | `str` | required | Output file path |
| `format` | `str` | `"csv"` | `"csv"` or `"json"` |

### highlight_net_traces

Render highlighted net traces as vector PDFs.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `project_path` | `str` | required | Path to `.kicad_pro` or `.kicad_pcb` |
| `net_names` | `list[str]` | required | Net names to highlight |
| `colors` | `dict \| None` | `None` | Color mapping `{"net_name": "#rrggbb"}` |
| `mode` | `str` | `"both"` | `"overlay"`, `"traces_only"`, or `"both"` |
| `output_dir` | `str \| None` | `None` | Output directory (defaults to project dir) |

### open_in_kicad

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `project_path` | `str` | required | Path to KiCad project file |

## Identification Tools

### identify_pcb

Identify PCB or component from a photo. **Local mode only.**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_path` | `str` | required | Image path (jpg, jpeg, png, gif, heic, webp) |
| `project_id` | `str \| None` | `None` | Project to associate |
| `box_id` | `str \| None` | `None` | Box/shipment to associate |

### check_identification_status

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `job_id` | `str` | required | Job ID from `identify_pcb` |

### get_identified_item

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `short_code` | `str` | required | Item short code (e.g., `SP-XXXXXX`) |

## Error Patterns

All tools return `{"success": false, "error": "message"}` on failure. Common errors:

| Error | Cause | Resolution |
|-------|-------|------------|
| `"API key not configured"` | Missing `SOURCE_PARTS_API_KEY` | Set env var |
| `"File not found"` | Invalid `file_path` | Check path exists |
| `"Unsupported file format"` | Wrong BOM extension | Use CSV, XLSX, XLS, JSON, or XML |
| `"File too large"` | Exceeds 50 MB limit | Split or compress file |
| `"Part not found"` | No match for part number | Try broader search or check spelling |
| `"KiCad CLI not found"` | `kicad-cli` not in PATH | Install KiCad 8+ |
