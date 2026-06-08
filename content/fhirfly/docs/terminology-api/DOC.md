---
name: terminology-api
description: "Healthcare reference data API: terminology lookups (SNOMED, ICD-10, RxNorm, NDC, LOINC, CVX, MVX), provider registry (NPI), drug labels (FDA), claims intelligence (NCCI, MUE, PFS, coverage), and Medicaid connectivity (SMA endpoints)"
metadata:
  languages: "javascript"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-09"
  source: maintainer
  tags: "fhirfly,healthcare,snomed,icd10,rxnorm,ndc,loinc,npi,cvx,terminology,fhir,medical-coding,claims,billing,cms"
---
# FHIRfly Terminology API

REST API for healthcare reference data: terminology lookups, provider search, drug labels, claims intelligence, and Medicaid connectivity. All endpoints return consistent response shapes with provenance and licensing metadata.

**Base URLs:**
```
Production: https://api.fhirfly.io
Dev:        https://devapi.fhirfly.io
```

## Authentication

All endpoints require authentication via either an API key or a Bearer token. Obtain credentials at [fhirfly.io](https://fhirfly.io).

```javascript
// API key
const headers = { "x-api-key": "ffly_sk_live_..." };

// Or Bearer token (OAuth2 client credentials)
const headers = { Authorization: `Bearer ${accessToken}` };
```

Each endpoint requires a specific scope (e.g., `ndc.read`, `npi.search`, `claims.read`). Scopes are listed per endpoint below.

## Response Shapes

All lookup and search endpoints support three response shapes via `?shape=`:

| Shape | Description | Default for |
|-------|-------------|-------------|
| `compact` | Minimal fields (code, display, status) | — |
| `standard` | Core structured data with legal metadata | REST |
| `full` | Complete data with source provenance | MCP/agents |

All responses include `meta.legal` with license and attribution info.

---

## Terminology Endpoints

### NDC — National Drug Codes

**Scope:** `ndc.read` (lookup/batch), `ndc.search` (search)

#### `GET /v1/ndc/:code` — Single Lookup

```javascript
const res = await fetch("https://api.fhirfly.io/v1/ndc/0069-0151-01", {
  headers: { Authorization: `Bearer ${token}` },
});
const { data } = await res.json();
// data: { code, name, labeler, dosage_form, route, strength, rxcui, status, ... }
```

Auto-detects product (9-10 digits) vs package (11 digits). Accepts hyphenated or plain formats.

#### `POST /v1/ndc/_batch` — Batch Lookup (max 500)

```javascript
const res = await fetch("https://api.fhirfly.io/v1/ndc/_batch", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ codes: ["0069-0151-01", "0002-8215"] }),
});
// Per-item status: "ok", "not_found", "invalid"
```

#### `GET /v1/ndc/search` — Search

| Parameter | Description |
|-----------|-------------|
| `q` | Text search across all fields |
| `name` | Brand/product name |
| `ingredient` | Active ingredient |
| `strength` | e.g., "200mg", "10mg/5ml" |
| `dosage_form` | e.g., "TABLET", "SOLUTION" |
| `route` | e.g., "ORAL", "INTRAVENOUS" |
| `labeler` | Manufacturer name |
| `product_type` | "otc" \| "rx" \| "all" |
| `dea_schedule` | "ci" \| "cii" \| "ciii" \| "civ" \| "cv" \| "none" |
| `is_active` | "true" \| "false" |
| `has_rxcui` | "true" \| "false" |
| `rxcui` | Filter by RxNorm CUI |
| `limit` | 1–500 (default: 20) |
| `page` | 1–1000 |
| `sort` | "relevance" \| "name" \| "labeler" |

Returns paginated results with facets (dosage_form, product_type, route, dea_schedule).

---

### ICD-10 — Diagnosis and Procedure Codes

**Scope:** `icd10.read` (lookup/batch), `icd10.search` (search)

#### `GET /v1/icd10/:code` — Single Lookup

```javascript
const res = await fetch("https://api.fhirfly.io/v1/icd10/E11.9", {
  headers: { Authorization: `Bearer ${token}` },
});
const { data } = await res.json();
// data: { code, system, display, billable, description, fiscal_year, status, fhir_coding }
```

Auto-detects CM (diagnosis, 3-7 chars) vs PCS (procedure, exactly 7 chars). Accepts dotted (`E11.9`) or plain (`E119`).

#### `POST /v1/icd10/_batch` — Batch Lookup (max 100)

Can mix CM and PCS codes in a single batch.

```javascript
const res = await fetch("https://api.fhirfly.io/v1/icd10/_batch", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ codes: ["E11.9", "I10", "0016070"] }),
});
```

#### `GET /v1/icd10/search` — Search

| Parameter | Description |
|-----------|-------------|
| `q` | Text search (required) |
| `code_system` | "CM" \| "PCS" |
| `billable` | "true" \| "false" |
| `status` | "active" \| "inactive" |
| `fiscal_year` | e.g., "2025" |
| `limit` | 1–500 (default: 20) |
| `page` | 1–1000 |
| `sort` | "relevance" \| "code" |

---

### RxNorm — Drug Terminology

**Scope:** `rxnorm.read` (lookup/batch), `rxnorm.search` (search)

#### `GET /v1/rxnorm/:rxcui` — Single Lookup

```javascript
const res = await fetch("https://api.fhirfly.io/v1/rxnorm/213169", {
  headers: { Authorization: `Bearer ${token}` },
});
const { data } = await res.json();
// data: { rxcui, name, tty, status, prescribable, brand_names, ingredients }
```

#### `POST /v1/rxnorm/_batch` — Batch Lookup (max 100)

```javascript
body: JSON.stringify({ codes: ["213169", "197856"] })
```

#### `GET /v1/rxnorm/search` — Search

| Parameter | Description |
|-----------|-------------|
| `q` | Text search (required) |
| `ingredient` | Ingredient name |
| `tty` | Term type: "SBD", "SCD", "BN", "GPCK", etc. |
| `status` | "ACTIVE" \| "RETIRED" |
| `is_prescribable` | "true" \| "false" |
| `limit` | 1–500 (default: 20) |
| `page` | 1–1000 |

---

### LOINC — Laboratory Codes

**Scope:** `loinc.read` (lookup/batch), `loinc.search` (search)

#### `GET /v1/loinc/:code` — Single Lookup

```javascript
const res = await fetch("https://api.fhirfly.io/v1/loinc/2339-0", {
  headers: { Authorization: `Bearer ${token}` },
});
const { data } = await res.json();
// data: { code, long_name, short_name, component, property, time_aspect, system, scale, class, status, units }
```

#### `POST /v1/loinc/_batch` — Batch Lookup (max 100)

```javascript
body: JSON.stringify({ codes: ["2339-0", "2345-7"] })
```

#### `GET /v1/loinc/search` — Search

| Parameter | Description |
|-----------|-------------|
| `q` | Text search (required) |
| `component` | e.g., "Glucose" |
| `class` | "CHEM", "HEMA", "UA", "MICRO", etc. |
| `system` | "Bld", "Urine", "Serum", etc. |
| `scale` | "Qn", "Ord", "Nom" |
| `status` | "ACTIVE" \| "DEPRECATED" |
| `order_obs` | "Order" \| "Observation" \| "Both" |
| `limit` | 1–500 (default: 20) |
| `page` | 1–1000 |

---

### SNOMED CT — Clinical Terminology (IPS Free Set)

**Scope:** `snomed.read` (lookup/batch/categories/mappings), `snomed.search` (search)

#### `GET /v1/snomed/:concept_id` — Single Lookup

```javascript
const res = await fetch("https://api.fhirfly.io/v1/snomed/73211009", {
  headers: { Authorization: `Bearer ${token}` },
});
const { data } = await res.json();
// data: { concept_id, active, fsn, preferred_term, synonyms, ips_category, semantic_tag }
```

#### `POST /v1/snomed/_batch` — Batch Lookup (max 100)

```javascript
body: JSON.stringify({ codes: ["84114007", "73211009", "38341003"] })
// Per-item status: "ok", "not_found", "invalid"
```

#### `GET /v1/snomed/search` — Search

| Parameter | Description |
|-----------|-------------|
| `q` | Text search across preferred terms, FSN, synonyms |
| `ips_category` | Filter by IPS category (see below) |
| `semantic_tag` | e.g., "disorder", "substance" |
| `active` | boolean (default: true) |
| `limit` | 1–500 (default: 100) |
| `skip` | Offset for pagination |

**IPS categories:** `substance`, `product`, `condition`, `finding`, `procedure`, `body_structure`, `organism`, `qualifier`, `device`, `observable`, `specimen`, `situation`, `event`, `environment`, `social`

#### `GET /v1/snomed/categories` — List IPS Categories

Returns all valid categories with descriptions.

#### `GET /v1/snomed/:concept_id/mappings` — Cross-Terminology Mappings

Find codes from other systems that map to a SNOMED concept.

```javascript
const res = await fetch("https://api.fhirfly.io/v1/snomed/73211009/mappings", {
  headers: { Authorization: `Bearer ${token}` },
});
const { data } = await res.json();
// data.mappings[]: { source_system, source_code, map_type, mapping_source }
```

**Source systems:** `rxnorm`, `icd10_cm`, `icd10_pcs`, `ndc`
**Mapping types:** `equivalent`, `broader`, `narrower`, `related`

#### Common SNOMED Concepts

| Concept ID | Preferred Term | Category |
|------------|----------------|----------|
| `716186003` | No known allergies | situation |
| `787481004` | No known medication use | situation |
| `73211009` | Diabetes mellitus | condition |
| `38341003` | Hypertension | condition |
| `195967001` | Asthma | condition |
| `387458008` | Aspirin | substance |

**Data source:** SNOMED CT IPS Free Set (~12,000 concepts). License: CC BY 4.0 (attribution required).

---

### CVX — Vaccine Codes

**Scope:** `cvx.read` (lookup/batch), `cvx.search` (search)

#### `GET /v1/cvx/:code` — Single Lookup

```javascript
const res = await fetch("https://api.fhirfly.io/v1/cvx/208", {
  headers: { Authorization: `Bearer ${token}` },
});
// data: { code, display, status, vaccine_name, vaccine_type, notes }
```

Code format: 1-3 digits (1–999).

#### `POST /v1/cvx/_batch` — Batch Lookup (max 100)

#### `GET /v1/cvx/search` — Search

| Parameter | Description |
|-----------|-------------|
| `q` | Text search (required) |
| `vaccine_type` | e.g., "influenza", "covid-19" |
| `is_covid_vaccine` | "true" \| "false" |
| `status` | "active" \| "inactive" |
| `limit` | 1–500 (default: 20) |

---

### MVX — Vaccine Manufacturer Codes

**Scope:** `mvx.read` (lookup/batch), `mvx.search` (search)

#### `GET /v1/mvx/:code` — Single Lookup

```javascript
const res = await fetch("https://api.fhirfly.io/v1/mvx/PFR", {
  headers: { Authorization: `Bearer ${token}` },
});
// data: { code, display, status, manufacturer_name }
```

Code format: 1-3 uppercase letters.

#### `POST /v1/mvx/_batch` — Batch Lookup (max 100)

#### `GET /v1/mvx/search` — Search

| Parameter | Description |
|-----------|-------------|
| `q` | Text search (required) |
| `status` | "active" \| "inactive" |
| `limit` | 1–500 (default: 20) |

---

## Provider Registry

### NPI — National Provider Identifiers

**Scope:** `npi.read` (lookup/batch), `npi.search` (search)

#### `GET /v1/npi/:npi` — Single Lookup

```javascript
const res = await fetch("https://api.fhirfly.io/v1/npi/1234567890", {
  headers: { Authorization: `Bearer ${token}` },
});
const { data } = await res.json();
// data: { npi, entity_type, name, taxonomies, practice_address, enumeration_date, active }
```

10-digit NPI number. Returns individual or organization provider data with specialties and license info.

#### `POST /v1/npi/_batch` — Batch Lookup (max 100)

```javascript
body: JSON.stringify({ codes: ["1234567890", "0987654321"] })
```

#### `GET /v1/npi/search` — Search

| Parameter | Description |
|-----------|-------------|
| `q` | Text search |
| `first_name` | First name |
| `last_name` | Last name |
| `organization` | Organization name |
| `taxonomy` | Taxonomy code or description |
| `specialty` | Specialty (e.g., "cardiology") |
| `state` | 2-letter state code |
| `city` | City name |
| `postal_code` | ZIP code |
| `entity_type` | "individual" \| "organization" |
| `active` | "true" \| "false" |
| `limit` | 1–500 (default: 20) |
| `page` | 1–1000 |
| `sort` | "relevance" \| "name" \| "location" |

Returns paginated results with facets.

#### `GET /v1/npi/:npi/connectivity` — Provider Connectivity

Returns connectivity and endpoint information for a provider.

---

## Drug Labels

### FDA Labels

**Scope:** `fda-label.read`

#### `GET /v1/fda-label/:identifier` — Label Lookup

```javascript
// Fetch safety sections for a drug by NDC, RxCUI, or Set ID
const res = await fetch(
  "https://api.fhirfly.io/v1/fda-label/0069-0151-01?bundle=safety",
  { headers: { Authorization: `Bearer ${token}` } }
);
const { data } = await res.json();
// data: { metadata, sections: { boxed_warning, warnings, precautions, ... } }
```

**Identifier auto-detection:** NDC, RxCUI (numeric), or Set ID (UUID).

**Section control** (pick one):
- `?sections=boxed_warning,contraindications` — specific sections
- `?bundle=safety` — predefined bundle
- Neither — returns full label

**Predefined bundles:**

| Bundle | Sections included |
|--------|-------------------|
| `safety` | boxed_warning, warnings, precautions, adverse_reactions |
| `dosing` | dosage_and_administration, overdosage |
| `interactions` | drug_interactions |
| `pregnancy` | pregnancy, nursing_mothers, pediatric_use, geriatric_use |
| `ingredients` | active_ingredient, inactive_ingredient |

#### `GET /v1/fda-label/:identifier/sections/:bundle` — Bundle Shortcut

```javascript
const res = await fetch(
  "https://api.fhirfly.io/v1/fda-label/0069-0151-01/sections/safety",
  { headers: { Authorization: `Bearer ${token}` } }
);
```

#### `POST /v1/fda-label/_batch` — Batch Lookup (max 50, metadata only)

Returns label metadata without section content.

#### `GET /v1/fda-label/sections-info` — List Available Sections and Bundles

#### `GET /v1/fda-label/search` — Search

| Parameter | Description |
|-----------|-------------|
| `q` | Text search (required) |
| `substance` | Active ingredient |
| `indication` | Indication/use text |
| `product_type` | "otc" \| "prescription" \| "animal" |
| `is_active` | "true" \| "false" |
| `limit` | 1–500 |

---

## Claims Intelligence

**Scope:** `claims.read` for all claims endpoints

### NCCI — Code Pair Validation

#### `GET /v1/ncci/validate` — Check Billing Compatibility

```javascript
const params = new URLSearchParams({ code1: "99213", code2: "99214" });
const res = await fetch(
  `https://api.fhirfly.io/v1/ncci/validate?${params}`,
  { headers: { Authorization: `Bearer ${token}` } }
);
const { data } = await res.json();
// data: { code1, code2, can_bill_together, claim_type, summary }
```

| Parameter | Description |
|-----------|-------------|
| `code1` | First CPT/HCPCS code (required) |
| `code2` | Second CPT/HCPCS code (required) |
| `claim_type` | "practitioner" \| "hospital" (default: both) |

### MUE — Medically Unlikely Edits

#### `GET /v1/mue/:hcpcs` — Units Limit Lookup

```javascript
const res = await fetch("https://api.fhirfly.io/v1/mue/99213", {
  headers: { Authorization: `Bearer ${token}` },
});
const { data } = await res.json();
// data.limits[]: { service_type, mue_value, mue_indicator }
```

| Parameter | Description |
|-----------|-------------|
| `service_type` | "practitioner" \| "outpatient_hospital" \| "dme" |

#### `POST /v1/mue/_batch` — Batch MUE (max 100)

### PFS — Physician Fee Schedule / RVU

#### `GET /v1/pfs/:hcpcs` — Fee Schedule Lookup

```javascript
const res = await fetch("https://api.fhirfly.io/v1/pfs/99213", {
  headers: { Authorization: `Bearer ${token}` },
});
const { data } = await res.json();
// data: { code, descriptor, rvu: { work, practice_expense_facility, practice_expense_non_facility, malpractice_insurance }, calculated_payment: { facility, non_facility } }
```

#### `POST /v1/pfs/_batch` — Batch PFS (max 100)

### Coverage Determination

#### `GET /v1/coverage/check` — LCD Policy Lookup

```javascript
const params = new URLSearchParams({ hcpcs: "99213" });
const res = await fetch(
  `https://api.fhirfly.io/v1/coverage/check?${params}`,
  { headers: { Authorization: `Bearer ${token}` } }
);
const { data } = await res.json();
// data: { hcpcs, policies_found, lcds: [{ lcd_id, contractor_name, status, effective_date, summary }] }
```

| Parameter | Description |
|-----------|-------------|
| `hcpcs` | CPT/HCPCS code (required) |
| `active` | "true" (default) \| "false" |

---

## Medicaid Connectivity (SMA)

**Scope:** `connectivity.read`

### `GET /v1/sma/states` — List State Endpoints

```javascript
const res = await fetch("https://api.fhirfly.io/v1/sma/states", {
  headers: { Authorization: `Bearer ${token}` },
});
const { data } = await res.json();
// data.states[]: { abbreviation, name, vendor, status, fhir_version, implemented, endpoints }
```

| Parameter | Description |
|-----------|-------------|
| `implemented` | "true" \| "false" |
| `vendor` | Vendor name filter |
| `status` | e.g., "active", "pilot" |
| `fhir_version` | e.g., "R4", "R5" |

### `GET /v1/sma/states/:state` — State Detail

Accepts abbreviation ("CA"), underscore ID ("california"), or display name ("California").

### `GET /v1/sma/stats` — Aggregate Statistics

```javascript
// Returns: total_states, implemented_count, implementation_rate, vendor_breakdown, fhir_version_distribution
```

---

## SDK — @fhirfly-io/terminology

Node.js SDK (v0.10.0, requires Node 18+).

```bash
npm install @fhirfly-io/terminology
```

```javascript
import { Fhirfly } from "@fhirfly-io/terminology";

const client = new Fhirfly({ apiKey: "ffly_sk_live_..." });

// Terminology lookups
const ndc = await client.ndc.lookup("0069-0151-01", { shape: "full" });
const icd = await client.icd10.lookup("E11.9");
const rx = await client.rxnorm.lookup("213169");
const loinc = await client.loinc.lookup("2339-0");
const snomed = await client.snomed.lookup("73211009");
const cvx = await client.cvx.lookup("208");

// Batch lookups
const results = await client.ndc.lookupMany(["0069-0151-01", "0002-8215"]);

// Provider search
const providers = await client.npi.search({ q: "smith", state: "CA", specialty: "cardiology" });

// Claims intelligence
const ncci = await client.claims.validateNcci("99213", "99214");
const mue = await client.claims.lookupMue("99213");
const pfs = await client.claims.lookupPfs("99213");
const coverage = await client.claims.checkCoverage("99213");
```

---

## Common Patterns

### Batch Requests

All batch endpoints accept `{ codes: [...] }` and return per-item status:

```json
{
  "data": {
    "results": [
      { "code": "E11.9", "status": "ok", "concept": { "..." } },
      { "code": "XXXXX", "status": "not_found", "concept": null },
      { "code": "!!!", "status": "invalid", "concept": null }
    ]
  }
}
```

**Batch limits:** NDC: 500, most others: 100, FDA labels: 50.

### Search Pagination

All search endpoints support `limit` (results per page) and `page` (page number):

```javascript
const params = new URLSearchParams({ q: "aspirin", limit: "20", page: "2" });
const res = await fetch(`https://api.fhirfly.io/v1/ndc/search?${params}`, { headers });
const { total, page, has_more, items } = await res.json();
```

### Error Handling

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "ICD-10 code Z99.99 not found"
  }
}
```

| Status | Meaning |
|--------|---------|
| `400` | Invalid parameters |
| `401` | Missing or invalid token |
| `403` | Token lacks required scope |
| `404` | Code not found |
| `413` | Batch size exceeded |
| `429` | Rate limit exceeded |

### Available Scopes

| Scope | Covers |
|-------|--------|
| `ndc.read`, `ndc.search` | NDC lookups and search |
| `icd10.read`, `icd10.search` | ICD-10 lookups and search |
| `rxnorm.read`, `rxnorm.search` | RxNorm lookups and search |
| `loinc.read`, `loinc.search` | LOINC lookups and search |
| `snomed.read`, `snomed.search` | SNOMED CT lookups and search |
| `cvx.read`, `cvx.search` | CVX lookups and search |
| `mvx.read`, `mvx.search` | MVX lookups and search |
| `npi.read`, `npi.search` | NPI lookups and search |
| `fda-label.read` | FDA label lookups |
| `claims.read` | NCCI, MUE, PFS, coverage |
| `connectivity.read` | SMA state endpoints |
