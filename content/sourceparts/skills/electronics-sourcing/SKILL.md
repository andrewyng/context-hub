---
name: electronics-sourcing
description: "Guide for AI agents to source electronic components using parts-mcp — tool sequencing, decision patterns, and multi-step workflows"
metadata:
  revision: 1
  updated-on: "2026-03-15"
  source: maintainer
  tags: "electronics,sourcing,bom,components,pcb,manufacturing,workflow"
---

# Electronics Sourcing Skill

This skill teaches you how to source electronic components effectively using parts-mcp tools. It covers tool sequencing, decision patterns, and how to handle common scenarios.

## When to Use Which Search Tool

**`search_parts`** — Use when you have a part number, description, or general keywords. This is your default starting point.

```
"Find me a 100nF capacitor" → search_parts(query="100nF capacitor")
"Look up STM32F411" → search_parts(query="STM32F411")
```

**`search_by_parameters`** — Use when you need to match specific electrical parameters within a category. More precise than keyword search.

```
"I need a 50V 100nF X7R 0402 cap" → search_by_parameters(
  parameters={"capacitance": "100nF", "voltage": "50V", "dielectric": "X7R", "package": "0402"},
  category="capacitor"
)
```

**Decision rule**: If the user gives you 3+ specific parameters, use `search_by_parameters`. For part numbers or general queries, use `search_parts`.

## The Search → Price → Availability → Alternative Pattern

This is the core sourcing workflow. Follow this sequence:

```
1. SEARCH → Find the part
2. DETAILS → Get full specifications (if needed for validation)
3. PRICE → Compare across suppliers
4. AVAILABILITY → Check stock levels
5. ALTERNATIVE → Find replacements (only if price is too high or stock is insufficient)
```

Do not skip steps 3 and 4. A part that exists in the database may be out of stock or prohibitively expensive.

When the user asks to "source" or "find" a part, they expect pricing and availability — not just search results. Always follow through to at least step 4.

## BOM Processing Pattern

BOM processing is asynchronous. Always follow this exact sequence:

```
1. upload_bom(file_path=path)           → Get job_id
2. check_bom_status(job_id=job_id)      → Poll until status is "complete"
3. Review matched_parts and unknown_parts
4. For unmatched: search_parts() to resolve manually
5. calculate_bom_cost() with all resolved parts
```

**Polling**: Call `check_bom_status` and check the `status` field. If `"in_progress"`, wait and poll again. Do not assume instant completion.

**Handling unmatched parts**: When `unknown_parts` is not empty, try `search_parts` with the `value` and `footprint` fields as the query. If still unmatched, report them to the user — do not silently skip them.

## Datasheet Reading Strategy

Datasheets can be hundreds of pages. Always use this two-step approach:

```
1. list_datasheet_sections(sku="PART-NUMBER")
   → See the table of contents
   → Identify which sections contain what you need

2. read_datasheet(sku="PART-NUMBER", query="relevant keywords")
   → Read only matching chunks
   → Saves significant context window
```

**Never** call `read_datasheet` without a `query` parameter unless the datasheet is short (< 20 pages). An unfiltered read of a 200-page datasheet will consume excessive context.

**Keyword tips**: Use specific technical terms. "maximum input voltage absolute ratings" is better than "voltage". Multiple keywords narrow the results.

## Manufacturing Pipeline

Manufacturing operations (DFM, fab quoting, assembly) are all asynchronous:

```
submit_dfm() → check_dfm_status()       # DFM analysis
quote_fabrication() → check_manufacturing_status()  # Fab quote
quote_assembly() → polls internally      # Combined fab + assembly
```

**DFM first**: Always run DFM analysis before requesting a fabrication quote. DFM may reveal issues that affect manufacturability or cost.

**Assembly quotes** combine fabrication and BOM costing in one call. Use `quote_assembly` when the user wants a complete per-unit cost including both PCB fabrication and component assembly.

## Handling Partial Failures

Real-world sourcing often has partial results. Handle gracefully:

**Some parts not found in BOM**:
- Report the unmatched count clearly
- Attempt `search_parts` for each unmatched part
- If still unmatched, list them for the user with their reference designators and values
- Calculate cost for matched parts, noting the incomplete total

**Some parts unavailable**:
- Report which parts are out of stock
- Automatically call `find_alternatives` for each unavailable part
- Present alternatives with their specifications and pricing
- Let the user decide on substitutions

**Price comparison with missing suppliers**:
- Report how many suppliers were checked
- Note if key suppliers (the user's preferred ones) returned no results
- Present available pricing data without waiting for all suppliers

## KiCad Project Workflow

When working with KiCad projects:

```
1. find_kicad_projects()                    → Discover available projects
2. analyze_kicad_project(project_path=...)  → Understand project structure
3. extract_bom_from_kicad(project_path=...) → Get component list
4. match_components_to_parts(components=...) → Match to real parts
5. Follow the BOM processing pattern above for unmatched components
```

**KiCad CLI requirement**: BOM extraction may invoke `kicad-cli` if no existing BOM file is found in the project. Ensure KiCad 8+ is installed.

**Local mode only**: All KiCad tools require local mode (stdio transport). They are not available in hosted/HTTP mode.

## Cost Optimization Tips

When helping users optimize costs:

1. **Check quantity breaks**: Call `compare_prices` with different quantities (1, 10, 100, 1000) to show price break curves
2. **Suggest alternatives**: If a part is expensive, call `find_alternatives` and compare pricing
3. **Preferred suppliers**: Use `preferred_suppliers` in `calculate_bom_cost` to bias toward the user's existing supplier relationships
4. **Consolidation**: When multiple parts come from the same supplier, note the potential for consolidated shipping

## Response Patterns

**When a user asks to "source a part"**:
→ `search_parts` → `get_part_details` → `compare_prices` → `check_availability`
Present: part details, best price, stock status, and any concerns.

**When a user provides a BOM file**:
→ `upload_bom` → poll `check_bom_status` → report matched/unmatched → `calculate_bom_cost`
Present: match rate, unmatched items, total cost, per-line breakdown.

**When a user asks "is this in stock?"**:
→ `check_availability` with quantities
Present: stock levels, number of suppliers with stock, whether quantity is meetable.

**When a user asks about a datasheet**:
→ `list_datasheet_sections` → `read_datasheet` with targeted query
Present: the specific information requested, citing page numbers.

**When a user asks for a manufacturing quote**:
→ `submit_dfm` (if not already done) → `quote_fabrication` or `quote_assembly`
Present: DFM issues (if any), estimated cost, lead time.
