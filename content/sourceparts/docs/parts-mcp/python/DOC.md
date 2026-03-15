---
name: parts-mcp
description: "MCP server for electronic parts sourcing — search components, compare prices, check availability, process BOMs, read datasheets, submit DFM analysis, and integrate with KiCad"
metadata:
  languages: "python"
  versions: "0.1.3"
  revision: 1
  updated-on: "2026-03-15"
  source: maintainer
  tags: "mcp,electronics,parts,sourcing,bom,kicad,pcb,components,eda,datasheet,dfm,manufacturing"
---

# Parts MCP

MCP server for sourcing electronic components. Thin client wrapping the [Source Parts API](https://api.source.parts) — search, pricing, availability, BOM processing, datasheet reading, DFM analysis, and KiCad integration happen server-side. Local tools handle filesystem access (BOM uploads, KiCad project discovery, datasheet PDFs).

## Installation

```bash
pip install parts-mcp
```

Requires Python 3.10+.

## Configuration

### Environment Variables

```bash
SOURCE_PARTS_API_KEY=your_api_key      # Required — get from source.parts
SOURCE_PARTS_API_URL=https://api.source.parts/v1  # Optional, default shown
KICAD_SEARCH_PATHS=/path/to/projects   # Optional, for find_kicad_projects
PARTS_CACHE_DIR=~/.cache/parts-mcp     # Optional
CACHE_EXPIRY_HOURS=24                  # Optional
```

### Claude Desktop

```json
{
  "mcpServers": {
    "parts": {
      "command": "parts-mcp",
      "env": {
        "SOURCE_PARTS_API_KEY": "your_api_key"
      }
    }
  }
}
```

### Claude Code

```json
{
  "mcpServers": {
    "parts": {
      "command": "parts-mcp",
      "env": {
        "SOURCE_PARTS_API_KEY": "your_api_key"
      }
    }
  }
}
```

## Tools Quick Reference

### Search

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `search_parts` | Search by keyword, part number, or description | `query`, `category?`, `filters?`, `limit?` |
| `search_by_parameters` | Parametric search within a category | `parameters`, `category`, `limit?` |
| `get_part_details` | Full details for a specific part | `part_number`, `manufacturer?` |

### Sourcing

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `compare_prices` | Price comparison across suppliers | `part_number`, `quantity?`, `suppliers?` |
| `check_availability` | Stock check for multiple parts | `part_numbers`, `quantities?` |
| `find_alternatives` | Find compatible replacements | `part_number`, `parameters?` |
| `calculate_bom_cost` | Total cost for a bill of materials | `bom`, `quantity?`, `preferred_suppliers?` |
| `estimate_cost` | Quick cost estimate for a parts list | `parts`, `currency?` |

### Manufacturing

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `upload_bom` | Upload BOM file for processing | `file_path` (local only) |
| `check_bom_status` | Poll BOM processing, get matched/unmatched | `job_id` |
| `submit_dfm` | Queue DFM analysis | `project_id`, `bom_id?`, `priority?` |
| `check_dfm_status` | Poll DFM job status | `job_id` |
| `quote_fabrication` | Get PCB fab quote | `project_id`, `quantity?`, `layers?`, etc. |
| `upload_gerbers_for_quote` | Upload gerbers for fab quote | `file_path`, `quantity?`, etc. (local only) |
| `quote_assembly` | Combined fab + assembly quote | `gerber_path`, `bom_path`, etc. (local only) |
| `check_manufacturing_status` | Poll any manufacturing job | `job_id` |

### Datasheet

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `list_datasheet_sections` | Get TOC without reading full content | `file_path?`, `sku?` |
| `read_datasheet` | Read/chunk datasheet with optional filtering | `file_path?`, `sku?`, `query?`, `chunk_pages?` |

### KiCad (local mode only)

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `find_kicad_projects` | Discover projects in search paths | (none) |
| `extract_bom_from_kicad` | Extract BOM from .kicad_pro | `project_path` |
| `analyze_kicad_project` | File counts and structure analysis | `project_path` |
| `extract_netlist_from_project` | Connectivity analysis | `project_path` |
| `match_components_to_parts` | Match KiCad components to real parts | `components`, `auto_search?` |
| `export_parts_to_kicad` | Export sourced parts as CSV/JSON | `parts`, `output_path`, `format?` |
| `highlight_net_traces` | Render highlighted nets as PDFs | `project_path`, `net_names`, `colors?`, `mode?` |
| `open_in_kicad` | Launch KiCad with a project | `project_path` |

### Identification

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `identify_pcb` | Identify PCB/component from photo | `file_path`, `project_id?` (local only) |
| `check_identification_status` | Poll identification job | `job_id` |
| `get_identified_item` | Get identified item details | `short_code` |

## Core Workflow: Search to Source

```python
# 1. Search for a part
result = search_parts(query="STM32F411CEU6")

# 2. Get detailed specs
details = get_part_details(part_number="STM32F411CEU6", manufacturer="STMicroelectronics")

# 3. Compare prices across suppliers
prices = compare_prices(part_number="STM32F411CEU6", quantity=100)

# 4. Check if it's in stock
availability = check_availability(
    part_numbers=["STM32F411CEU6"],
    quantities=[100]
)

# 5. If unavailable or expensive, find alternatives
alternatives = find_alternatives(
    part_number="STM32F411CEU6",
    parameters={"core": "ARM Cortex-M4", "flash": "512KB"}
)
```

## BOM Processing

BOM upload is asynchronous — upload, poll, then review results.

```python
# 1. Upload BOM file (CSV, XLSX, XLS, JSON, or XML)
upload = upload_bom(file_path="/path/to/bom.csv")
job_id = upload["job_id"]

# 2. Poll until complete
status = check_bom_status(job_id=job_id)
# status["status"] will be "in_progress", "complete", or "failed"

# 3. When complete, review matches
matched = status["matched_parts"]      # Successfully identified parts
unmatched = status["unknown_parts"]    # Parts needing manual resolution

# 4. Calculate total cost
cost = calculate_bom_cost(
    bom=[{"part_number": p["mpn"], "quantity": p["quantity"]} for p in matched],
    quantity=100
)
```

Supported BOM formats: CSV, XLSX, XLS, JSON, XML. Max file size: 50 MB.

Six EDA tools supported: KiCad, Altium Designer, Autodesk Fusion 360, Eagle, PADS, Protel 99.

## KiCad Integration

```python
# 1. Discover projects
projects = find_kicad_projects()

# 2. Extract BOM from a project
bom = extract_bom_from_kicad(project_path="/path/to/project.kicad_pro")

# 3. Match components to real parts
matches = match_components_to_parts(
    components=bom["bom_files"][0]["analysis"]["components"],
    auto_search=True
)

# 4. Export sourced parts back to KiCad format
export_parts_to_kicad(
    parts=matches["suggestions"],
    output_path="/path/to/sourced_parts.csv",
    format="csv"
)
```

KiCad tools require local mode (stdio transport). Set `KICAD_SEARCH_PATHS` to directories containing your `.kicad_pro` files.

## Datasheet Reading

Datasheets can be large. Use `list_datasheet_sections` first to see what's available, then `read_datasheet` with a `query` to filter relevant chunks.

```python
# 1. See what sections exist (lightweight, no content returned)
sections = list_datasheet_sections(sku="STM32F411CEU6")
# Returns: [{"title": "Electrical Characteristics", "page": 42}, ...]

# 2. Read only relevant chunks
data = read_datasheet(
    sku="STM32F411CEU6",
    query="maximum input voltage absolute ratings",
    chunk_pages=5
)
# Returns filtered chunks matching the query keywords
# context_savings shows reduction (e.g., "reduction_pct": 75)
```

Two input modes: `file_path` (upload local PDF) or `sku` (fetch cached chunks from API). Using `sku` is faster when parts have been previously processed.

## Manufacturing

```python
# DFM analysis
dfm = submit_dfm(project_id="proj_123", priority="high")
dfm_result = check_dfm_status(job_id=dfm["job_id"])

# Fabrication quote
fab = quote_fabrication(
    project_id="proj_123",
    quantity=10,
    layers=4,
    thickness=1.6,
    surface_finish="ENIG",
    color="black"
)
fab_result = check_manufacturing_status(job_id=fab["job_id"])

# Combined fab + assembly quote (local mode)
assembly = quote_assembly(
    gerber_path="/path/to/gerbers.zip",
    bom_path="/path/to/bom.csv",
    quantity=10,
    layers=4
)
```

All manufacturing operations are asynchronous. Use `check_manufacturing_status` or the specific status tools (`check_dfm_status`, `check_bom_status`) to poll for results.

## Hosted vs Local Mode

| Capability | Local (stdio) | Hosted (HTTP) |
|-----------|---------------|---------------|
| Search, pricing, availability | Yes | Yes |
| BOM cost calculation | Yes | Yes |
| DFM, fab quoting (by project ID) | Yes | Yes |
| Manufacturing status checks | Yes | Yes |
| Datasheet reading (by SKU) | Yes | Yes |
| Datasheet reading (local PDF) | Yes | No |
| BOM file upload | Yes | No |
| Gerber file upload | Yes | No |
| KiCad integration | Yes | No |
| PCB identification (photo) | Yes | No |
| Assembly quoting (file upload) | Yes | No |

Local mode runs via `parts-mcp` (stdio). Hosted mode runs as an HTTP server with OAuth authentication.

## Common Pitfalls

**Missing API key**: All tools except KiCad project discovery require `SOURCE_PARTS_API_KEY`. Set it in your environment or MCP config.

**KiCad CLI not in PATH**: `extract_bom_from_kicad` and `extract_netlist_from_project` invoke `kicad-cli` if no existing BOM/netlist files are found. Ensure KiCad 8+ is installed and `kicad-cli` is accessible.

**Context-heavy datasheet reads**: Always call `list_datasheet_sections` before `read_datasheet`. Use the `query` parameter to filter chunks — an unfiltered read of a 200-page datasheet will consume significant context.

**BOM status polling**: `check_bom_status` should be called repeatedly until `status` is `"complete"` or `"failed"`. Processing time depends on BOM size and part matching complexity.

**File size limits**: BOM and gerber uploads are limited to 50 MB. Image uploads for identification accept: jpg, jpeg, png, gif, heic, webp.

## Resources

- [Source Parts](https://source.parts) — Main platform
- [GitHub](https://github.com/SourceParts/parts-mcp) — Source code
- [PyPI](https://pypi.org/project/parts-mcp/) — Package
- [API Documentation](https://source.parts/docs/api) — API reference

See [tools.md](./references/tools.md) for complete parameter reference and [workflows.md](./references/workflows.md) for multi-step workflow recipes.
