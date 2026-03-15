# Parts MCP — Workflow Recipes

Multi-step workflows for common electronic sourcing tasks.

## End-to-End PCB Sourcing (KiCad to Priced BOM)

Complete workflow from a KiCad project to a fully priced bill of materials.

```
1. find_kicad_projects()
   → Pick project from results

2. extract_bom_from_kicad(project_path="...")
   → Get component list from the project

3. match_components_to_parts(components=bom_components, auto_search=True)
   → Each component matched to real supplier parts

4. For unmatched components:
   search_parts(query=component_value)
   → Manual search with value/footprint keywords

5. check_availability(part_numbers=[all_matched_mpns], quantities=[all_quantities])
   → Verify everything is in stock

6. For unavailable parts:
   find_alternatives(part_number=unavailable_mpn)
   → Get drop-in replacements

7. calculate_bom_cost(bom=final_parts_list, quantity=100)
   → Total cost at production quantity

8. export_parts_to_kicad(parts=sourced_parts, output_path="sourced_bom.csv")
   → Export back for KiCad integration
```

## Obsolete Part Replacement

When a part is end-of-life or unavailable, find and validate a replacement.

```
1. get_part_details(part_number="OBSOLETE-PART")
   → Get specifications of the original part

2. find_alternatives(
     part_number="OBSOLETE-PART",
     parameters={"package": "TSSOP-20", "voltage": "3.3V"}
   )
   → Find parts matching critical parameters

3. For each alternative:
   get_part_details(part_number=alternative_mpn)
   → Verify specs match requirements

4. compare_prices(part_number=best_alternative, quantity=needed_qty)
   → Check pricing for the replacement

5. check_availability(part_numbers=[best_alternative], quantities=[needed_qty])
   → Confirm stock levels
```

## Multi-Board Assembly Quoting

Get combined fab + assembly quotes for a multi-board product.

```
For each board:

1. quote_assembly(
     gerber_path="/path/to/board_gerbers.zip",
     bom_path="/path/to/board_bom.csv",
     quantity=100,
     layers=4,
     surface_finish="ENIG"
   )
   → Returns fab_job_id, bom_job_id

2. check_manufacturing_status(job_id=fab_job_id)
   → Poll until fab quote ready

3. check_bom_status(job_id=bom_job_id)
   → Poll until BOM processed, note unmatched parts

4. For unmatched parts:
   search_parts(query=part_description)
   → Resolve manually

Aggregate COGS across all boards for total assembly cost.
```

## Parametric Search with Filtering

Find parts matching specific electrical parameters.

```
1. search_by_parameters(
     parameters={
       "capacitance": "100nF",
       "voltage_rating": "50V",
       "package": "0402",
       "dielectric": "X7R"
     },
     category="capacitor"
   )
   → Parts matching all criteria

2. For top candidates:
   compare_prices(part_number=candidate, quantity=1000)
   → Price at volume

3. check_availability(part_numbers=top_3_candidates, quantities=[1000, 1000, 1000])
   → Stock check across candidates

4. Pick the best available option by price and stock.
```

## Datasheet Deep-Dive

Extract specific parameters from a datasheet efficiently.

```
1. list_datasheet_sections(sku="LM1117-3.3")
   → Get table of contents with page numbers
   → Identify relevant sections (e.g., "Electrical Characteristics" on page 5)

2. read_datasheet(
     sku="LM1117-3.3",
     query="dropout voltage output current thermal",
     chunk_pages=5
   )
   → Returns only chunks matching keywords
   → context_savings shows how much context was saved

3. If you need a specific section not returned by query:
   read_datasheet(
     sku="LM1117-3.3",
     query="absolute maximum ratings",
     chunk_pages=3
   )
   → Targeted follow-up read
```

## DFM and Fabrication Pipeline

Full manufacturing preparation workflow.

```
1. submit_dfm(project_id="proj_123", bom_id="bom_456", priority="high")
   → Queue DFM analysis

2. check_dfm_status(job_id=dfm_job_id)
   → Poll until complete
   → Review issues and warnings

3. If DFM passes:
   quote_fabrication(
     project_id="proj_123",
     quantity=10,
     layers=2,
     surface_finish="HASL",
     color="green"
   )
   → Get fab pricing

4. check_manufacturing_status(job_id=fab_job_id)
   → Poll until quote ready

5. For local gerber files:
   upload_gerbers_for_quote(
     file_path="/path/to/gerbers.zip",
     quantity=10,
     layers=2
   )
   → Alternative: upload gerbers directly
```

## PCB Identification and Cataloging

Identify components on a physical PCB from photos.

```
1. identify_pcb(
     file_path="/path/to/pcb_photo.jpg",
     project_id="proj_123"
   )
   → Submits image for barcode/QR detection, OCR, component ID

2. check_identification_status(job_id=id_job_id)
   → Poll until identification complete

3. For each identified item:
   get_identified_item(short_code="SP-ABC123")
   → Get full details including barcodes, OCR text, metadata

4. For identified part numbers:
   get_part_details(part_number=identified_mpn)
   → Cross-reference with parts database
```

## BOM File Upload and Review

Upload a BOM from any supported EDA tool and review matching results.

```
1. upload_bom(file_path="/path/to/altium_bom.xlsx")
   → Accepts CSV, XLSX, XLS, JSON, XML
   → Supports KiCad, Altium, Eagle, PADS, Fusion 360, Protel 99

2. check_bom_status(job_id=bom_job_id)
   → Poll until "complete"
   → Returns matched_parts and unknown_parts

3. For each unknown part:
   search_parts(query=unknown["value"] + " " + unknown["footprint"])
   → Try to resolve manually

4. calculate_bom_cost(
     bom=[
       {"part_number": p["mpn"], "quantity": p["quantity"]}
       for p in all_resolved_parts
     ],
     quantity=50,
     preferred_suppliers=["LCSC", "Mouser"]
   )
   → Get total cost with supplier preferences
```
