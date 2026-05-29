---
name: fhir-patient
description: "HL7 FHIR R4 Patient resource schema — demographics, identifiers, contact info, and key query patterns for healthcare app development"
metadata:
  languages: "json"
  versions: "4.0.1"
  revision: 1
  updated-on: "2026-05-29"
  source: community
  tags: "fhir,hl7,healthcare,patient,ehr,r4"
---

# HL7 FHIR R4 Patient Resource

The FHIR Patient resource captures demographic and administrative data about a person receiving healthcare. It is the anchor resource for almost every clinical interaction.

**FHIR version:** R4 (4.0.1) — the most widely deployed version as of 2026.

## Minimal Valid Patient

```json
{
  "resourceType": "Patient",
  "id": "example-patient-001",
  "name": [
    {
      "use": "official",
      "family": "Smith",
      "given": ["Jane", "Marie"]
    }
  ],
  "gender": "female",
  "birthDate": "1985-04-12"
}
```

## Full Patient with Common Fields

```json
{
  "resourceType": "Patient",
  "id": "example-patient-002",
  "meta": {
    "profile": ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"]
  },
  "text": {
    "status": "generated",
    "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Jane Smith</div>"
  },
  "identifier": [
    {
      "use": "usual",
      "type": {
        "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/v2-0203", "code": "MR" }]
      },
      "system": "urn:oid:2.16.840.1.113883.19.5",
      "value": "MRN-12345"
    },
    {
      "use": "secondary",
      "system": "http://hl7.org/fhir/sid/us-ssn",
      "value": "999-99-9999"
    }
  ],
  "active": true,
  "name": [
    {
      "use": "official",
      "family": "Smith",
      "given": ["Jane", "Marie"],
      "prefix": ["Ms."]
    },
    {
      "use": "nickname",
      "given": ["Jenny"]
    }
  ],
  "telecom": [
    { "system": "phone", "value": "555-867-5309", "use": "home" },
    { "system": "email", "value": "jane.smith@example.com", "use": "work" }
  ],
  "gender": "female",
  "birthDate": "1985-04-12",
  "deceasedBoolean": false,
  "address": [
    {
      "use": "home",
      "type": "both",
      "line": ["123 Maple Street", "Apt 4B"],
      "city": "Springfield",
      "state": "IL",
      "postalCode": "62701",
      "country": "US"
    }
  ],
  "maritalStatus": {
    "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus", "code": "M", "display": "Married" }]
  },
  "contact": [
    {
      "relationship": [
        { "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/v2-0131", "code": "N", "display": "Next-of-Kin" }] }
      ],
      "name": { "family": "Smith", "given": ["Robert"] },
      "telecom": [{ "system": "phone", "value": "555-555-1234" }]
    }
  ],
  "communication": [
    {
      "language": {
        "coding": [{ "system": "urn:ietf:bcp:47", "code": "en", "display": "English" }]
      },
      "preferred": true
    }
  ],
  "generalPractitioner": [
    { "reference": "Practitioner/practitioner-001", "display": "Dr. Alice Chen" }
  ],
  "managingOrganization": {
    "reference": "Organization/org-001",
    "display": "Springfield General Hospital"
  }
}
```

## Key Fields Reference

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `resourceType` | string | Yes | Always `"Patient"` |
| `id` | string | Server-assigned | Logical ID on the server |
| `identifier` | array | Recommended | MRN, SSN, driver's license, etc. |
| `active` | boolean | No | Default `true` |
| `name` | array | Recommended | Multiple names allowed (official, nickname, maiden) |
| `telecom` | array | No | phone, fax, email, pager, url, sms |
| `gender` | code | Recommended | `male`, `female`, `other`, `unknown` |
| `birthDate` | date | Recommended | YYYY-MM-DD format |
| `deceased[x]` | boolean\|dateTime | No | `deceasedBoolean` or `deceasedDateTime` |
| `address` | array | No | Home, work, temp, old |
| `maritalStatus` | CodeableConcept | No | Coded from v3-MaritalStatus |
| `contact` | array | No | Next-of-kin, emergency contacts |
| `communication` | array | No | Preferred communication language |
| `link` | array | No | Links to other patient records (merges) |

## Common `name.use` Values

- `official` — registered legal name
- `nickname` — commonly used name
- `maiden` — name before marriage
- `anonymous` — anonymous patient
- `temp` — temporary name

## Identifier Systems

| System | Code | Description |
|--------|------|-------------|
| `http://hl7.org/fhir/sid/us-ssn` | — | US Social Security Number |
| `http://hl7.org/fhir/sid/us-npi` | — | US National Provider Identifier |
| `urn:oid:2.16.840.1.113883.19.5` | MR | Medical Record Number (OID-based) |
| `http://terminology.hl7.org/CodeSystem/v2-0203` | DL | Driver's License |
| `http://terminology.hl7.org/CodeSystem/v2-0203` | PPN | Passport Number |

## FHIR REST API Patterns

### Create a Patient

```
POST /Patient
Content-Type: application/fhir+json

{ "resourceType": "Patient", ... }
```

Response: `201 Created` with `Location: /Patient/[id]/_history/1`

### Read a Patient

```
GET /Patient/example-patient-001
Accept: application/fhir+json
```

### Update a Patient (full replace)

```
PUT /Patient/example-patient-001
Content-Type: application/fhir+json

{ "resourceType": "Patient", "id": "example-patient-001", ... }
```

### Search Patients

```
GET /Patient?family=Smith&birthdate=1985-04-12
GET /Patient?identifier=urn:oid:2.16.840.1.113883.19.5|MRN-12345
GET /Patient?_id=example-patient-001
GET /Patient?name=Jane&_count=10&_sort=-_lastUpdated
```

Common search parameters: `_id`, `identifier`, `name`, `family`, `given`, `birthdate`, `gender`, `address`, `address-city`, `address-state`, `address-postalcode`, `telecom`, `email`, `phone`, `active`, `deceased`, `general-practitioner`, `organization`.

### Conditional Create (prevent duplicates)

```
POST /Patient
Content-Type: application/fhir+json
If-None-Exist: identifier=urn:oid:2.16.840.1.113883.19.5|MRN-12345

{ "resourceType": "Patient", ... }
```

Returns `200` if match found, `201` if created.

## Bundle for Multiple Patients (Transaction)

```json
{
  "resourceType": "Bundle",
  "type": "transaction",
  "entry": [
    {
      "fullUrl": "urn:uuid:patient-temp-1",
      "resource": { "resourceType": "Patient", "name": [{ "family": "Doe", "given": ["John"] }] },
      "request": { "method": "POST", "url": "Patient" }
    }
  ]
}
```

## US Core Patient Profile

US Core adds required fields for US interoperability:

- **Race** — extension `us-core-race` (required for US Core)
- **Ethnicity** — extension `us-core-ethnicity`
- **Birth Sex** — extension `us-core-birthsex`

```json
{
  "resourceType": "Patient",
  "extension": [
    {
      "url": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race",
      "extension": [
        {
          "url": "ombCategory",
          "valueCoding": {
            "system": "urn:oid:2.16.840.1.113883.6.238",
            "code": "2106-3",
            "display": "White"
          }
        },
        { "url": "text", "valueString": "White" }
      ]
    },
    {
      "url": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex",
      "valueCode": "F"
    }
  ],
  "identifier": [
    { "system": "http://hospital.example.org/mrns", "value": "MRN-12345" }
  ],
  "name": [{ "family": "Smith", "given": ["Jane"] }],
  "gender": "female",
  "birthDate": "1985-04-12"
}
```

## Patient Merge / Link

Use `link` to connect duplicate records:

```json
{
  "resourceType": "Patient",
  "id": "patient-old",
  "active": false,
  "link": [
    {
      "other": { "reference": "Patient/patient-canonical" },
      "type": "replaced-by"
    }
  ]
}
```

Link types: `replaced-by`, `replaces`, `refer`, `seealso`.

## Common Pitfalls

- **Date format**: Always use ISO 8601 (`YYYY-MM-DD`). FHIR rejects `04/12/1985`.
- **Gender vs. birth sex**: `gender` is administrative gender. Use the `us-core-birthsex` extension for clinical birth sex.
- **Name ordering**: `family` is surname. `given` is an array — first element is first name, second is middle name.
- **Identifiers**: Always include a `system` URI. Without a system, identifiers are not interoperable.
- **References**: Use relative references (`Patient/123`) within the same server; absolute (`https://server/Patient/123`) for external.
- **`text.div`**: Narrative is not required but many EHR systems reject resources without it.

## See Also

- [References: Extensions, Deceased, and Advanced Queries](references/advanced.md)
