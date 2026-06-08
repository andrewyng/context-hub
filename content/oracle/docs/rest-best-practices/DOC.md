---
name: rest-best-practices
description: "Oracle Fusion Cloud REST API validation protocols, integration patterns, and common pitfalls for building reliable automated provisioning pipelines"
metadata:
  languages: "python"
  versions: "26A"
  revision: 1
  updated-on: "2026-03-10"
  source: community
  tags: "oracle,fusion,rest,api,validation,integration,best-practices"
---
# Oracle Fusion Cloud REST API — Best Practices & Validation Protocols

## 1. Connectivity Validation (Fail-Fast)

Before any REST pipeline, verify environment health:

1. **Network ping:** Ping the host from `ORACLE_BASE_URL`. Retry up to 10 times at 3-second intervals.
2. **REST health check:** `GET /procurementBusinessUnitsLOV` (lightweight endpoint).
   - **Transient failures** (timeout, no response): Retry up to 10 times at 2-second intervals.
   - **Fatal failures** (`400`, `401`, `403`): Terminate immediately. Credential or configuration issues cannot be retried.

## 2. Dynamic Parent Resolution

**Never hardcode IDs** for Business Units, Organizations, or other parent entities.

- Query the appropriate LOV endpoint first (e.g., `/procurementBusinessUnitsLOV`, `/inventoryOrganizations`).
- Parse the response to resolve the correct parent ID.
- For Inventory Organizations, match `OrganizationId == MasterOrganizationId` to find the Item Master.
- Halt execution if no suitable mapping exists.

## 3. Query-Before-Create

Always check for existing objects before `POST`ing:

```
GET /suppliers?q=Supplier='{Name}'
GET /itemsV2?q=ItemNumber='{Number}'
GET /purchaseRequisitions?q=RequisitionHeaderId={Id}
```

If the object exists, capture its surrogate ID and skip creation. This prevents duplicates and wasted API calls.

## 4. Asynchronous Sync Delays

Oracle 26A indexes new objects asynchronously. An immediate `GET` after `POST` will return `404`.

**Mandatory protocol:** Wait **30 seconds** after every successful `POST` before:
- Reading the created object
- Creating child entities (Addresses, Sites, Lines)
- Running validation assertions

For Site objects specifically, implement a polling loop: up to 6 retries at 15-second intervals, catching `404` responses.

## 5. Validation-Gated Progression

A `201 Created` response is **not sufficient**. Programmatic confirmation is required.

After the 30-second delay:
1. `GET` the exact resource URI of the newly created object.
2. Assert that returned values match your input (e.g., `CustomerOrderFlag == true`, `SupplierName == expectedName`).
3. **Halt the entire pipeline** if any assertion fails. Never proceed to create child objects on a misconfigured parent.

## 6. API Schema Discovery

**Do NOT use** Oracle's `/describe` endpoints — they frequently timeout on complex payloads.

Instead:
1. `GET` an existing instance of the target object using a known search string.
2. Export the response payload to a JSON file.
3. Read the JSON to extract exact Oracle attribute naming conventions.

## 7. URL Encoding and Special Characters

- Always URL-encode query parameter values.
- Wrap string values in single quotes within `q=` filters: `q=Supplier='ACME Corp'`
- Spaces in values need encoding: `q=Supplier='ACME%20Corp'`

## 8. Performance Measurement

Wrap all API calls in timing instrumentation:

- Record `DurationMs` for each call.
- Calculate `TokensSent` from request payload byte length.
- Calculate `TokensRecv` from response payload byte length.
- Log Phase, Method, Duration, and token metrics for benchmarking.

## 9. Common Pitfalls

| Pitfall | Impact | Prevention |
|---------|--------|------------|
| Hardcoded BU/Org IDs | Breaks across environments | Always resolve dynamically |
| Missing 30s sync delay | `404` on child creation | Mandatory sleep after every POST |
| Using `/describe` endpoints | Timeouts, wasted tokens | Query existing objects instead |
| Skipping Site Assignment | Supplier invisible to PRs | Always POST assignment after Site |
| Missing `BillToBUId` | `POZ-2130496` error | Always include on Site Assignment |
| UOM shorthand ("Ea") | `POR-2010266` error | Use full name ("Each") |
| Supplier ID instead of name | `POR-2010896` error | Use string name on PR lines |
| `RequestUserAccountFlag` on Contact | `400` error | Not supported in 26A REST |
| `Email` vs `EmailAddress` | Silent failure | Use `Email` attribute |
