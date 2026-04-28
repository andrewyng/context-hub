# Extraction Schema Patterns

This reference provides patterns and examples for creating extraction schemas for the LandingAI ADE Extract API.

## Overview

Extraction schemas are JSON Schema objects that define what structured data should be extracted from parsed documents. You can use either JSON Schema format (for API calls) or Pydantic models (when using the Python library).

## Basic Structure

Every extraction schema must follow this structure:

```json
{
  "type": "object",
  "properties": {
    "field_name": {
      "type": "string",
      "description": "Description of what to extract"
    }
  }
}
```

**Key points:**
- Top-level `type` must be `"object"`
- Define fields in the `properties` object
- The API attempts to extract all defined fields (`required` is ignored)
- Add `description` for better accuracy

## Supported Field Types

| Type | Description | Example Use Case |
|------|-------------|------------------|
| `string` | Text values | Names, addresses, IDs |
| `number` | Numeric values with decimals | Prices, amounts, percentages |
| `integer` | Whole numbers | Counts, quantities |
| `boolean` | True/false values | Checkboxes, yes/no questions |
| `array` | Lists of items | Line items, charges, addresses |
| `object` | Nested structures | Address with street/city/zip |

## Common Patterns

### 1. Basic Field Extraction

Extract simple fields from a document:

```json
{
  "type": "object",
  "properties": {
    "patient_name": {
      "type": "string",
      "description": "The name of the patient"
    },
    "doctor": {
      "type": "string",
      "description": "Primary care physician of the patient"
    },
    "copay": {
      "type": "number",
      "description": "Copay that the patient is required to pay before services are rendered"
    }
  }
}
```

### 2. Nested Objects

Extract hierarchical data in a nested structure:

```json
{
  "type": "object",
  "properties": {
    "invoice": {
      "type": "object",
      "properties": {
        "number": {
          "type": "string",
          "description": "Invoice number"
        },
        "date": {
          "type": "string",
          "description": "Invoice date in YYYY-MM-DD format"
        },
        "total": {
          "type": "number",
          "description": "Total amount in USD"
        }
      }
    },
    "vendor": {
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "address": {"type": "string"},
        "phone": {"type": "string"}
      }
    }
  }
}
```

### 3. Arrays (Lists)

Extract repeating items from tables or lists:

```json
{
  "type": "object",
  "properties": {
    "charges": {
      "type": "array",
      "description": "List of charges on the utility bill",
      "items": {
        "type": "object",
        "properties": {
          "charge_type": {
            "type": "string",
            "description": "Type of charge (e.g., electricity, gas, water)"
          },
          "amount": {
            "type": "number",
            "description": "Charge amount in USD"
          },
          "usage": {
            "type": "string",
            "description": "Usage amount with unit (e.g., '450 kWh', '25 CCF')"
          }
        }
      }
    }
  }
}
```

### 4. Enum (Restricted Values)

Limit extracted values to a specific set (string enums only):

```json
{
  "type": "object",
  "properties": {
    "account_type": {
      "type": "string",
      "enum": ["Premium Checking", "Standard Checking"],
      "description": "Bank account type"
    }
  }
}
```

### 5. Format

Use the `format` keyword to specify how an extracted value should be formatted. It is most commonly applied to `string` fields and accepts natural-language instructions as well as standard JSON Schema format values.

| `format` value | Output example |
|---|---|
| `YYYY-MM-DD` | `2026-01-17` |
| `Month DD, YYYY` | `January 17, 2026` |
| `Currency amount with the $ symbol, for example $12.50` | `$170.23` |
| `Two-letter US state code` | `CA` |

```json
{
  "type": "object",
  "properties": {
    "invoice_date": {
      "type": "string",
      "format": "YYYY-MM-DD",
      "description": "The date the invoice was issued."
    },
    "total_amount": {
      "type": "string",
      "format": "Currency amount with the $ symbol, for example $12.50",
      "description": "Total amount due, including all charges and taxes."
    }
  }
}
```

You can include formatting instructions in `description` instead, but using the dedicated `format` keyword is more effective. The API applies it more precisely than embedded description text.

### 6. Missing Fields

The API always attempts to extract every field defined in your schema. When a field cannot be found in the document, the behavior depends on the field type:

| Field type | Behavior when not found |
|---|---|
| Primitive fields (`boolean`, `integer`, `number`, `string`) | Returns `null`. |
| `array` | Returns an empty array: `[]`. |
| `object` | Never returns `null`, but all primitive fields within it return `null`. |

The `nullable` keyword is silently ignored by the API.

## Pydantic Example (Python Library)

When using the landingai-ade Python library, use Pydantic models:

```python
from pydantic import BaseModel, Field
from landingai_ade.lib import pydantic_to_json_schema

class Invoice(BaseModel):
    invoice_number: str = Field(description="Invoice number")
    invoice_date: str = Field(description="Invoice date")
    total_amount: float = Field(description="Total amount in USD")
    vendor_name: str = Field(description="Vendor name")

# Convert to JSON schema
schema = pydantic_to_json_schema(Invoice)
```

## Best Practices

### 1. Use Descriptive Field Names
- **Good**: `invoice_number`, `patient_name`, `total_amount`
- **Bad**: `number`, `name`, `amount`

### 2. Add Detailed Descriptions
Include in descriptions:
- Exactly what to extract
- What to include/exclude ("excluding tax", "including area code")

Use the `format` keyword (not `description`) for formatting requirements. See [Pattern 5](#5-format).

Example:
```json
{
  "total_amount": {
    "type": "number",
    "description": "Total amount in USD, excluding tax"
  }
}
```

### 3. Keep It Focused
- Start with a few fields, add more as needed
- Keep names short but descriptive
- Flatten nested arrays when possible
- Reduce optional properties

### 4. Use Appropriate Types
- Use `number` for monetary values or calculations
- Use `integer` for counts
- Use `array` for repeating items (tables, lists)
- Use `object` for hierarchical data

## Model-Specific Considerations

### extract-20260314 (Current Default)

This is the default extraction model (also selected by `extract-latest`).

**Supported Keywords:**
- `type`, `description`, `properties` (for objects), `items` (for arrays)
- `enum` (string values only), `format`, `x-alternativeNames`

**Silently ignored or resolved before extraction (no error):**

| Keyword(s) | How the API handles it |
|---|---|
| `required`, `nullable`, `title` | Removed. |
| `anyOf` | If one of the types is `null`, the API removes `null` and uses the other type. If none are `null`, the API falls back to `string`. |
| `default` | If `null`, the keyword is removed. If any other value, the API returns a 206. |
| Reference keywords: `$ref`, `$defs`, `$anchor`, `$id`, `$schema`, `definitions` | All references are resolved, then the keywords are removed. |
| Recursive keywords: `$dynamicAnchor`, `$dynamicRef`, `$recursiveAnchor`, `$recursiveRef` | All references are resolved, then the keywords are removed. |

**Cause errors**: `allOf`, `oneOf`, `const`, `maxItems`, `minItems`, `maxLength`, `minLength`, `maximum`, `minimum`, `pattern`, `propertyOrdering`, `uniqueItems`. See [Keyword Support](https://docs.landing.ai/ade/ade-extract-schema-json#keyword-support) for the full list.

**Key Capabilities:**
- **Unlimited schema size**: No limits on number of fields, nesting levels, or characters
- **Cross-page table reconstruction**: Tables spanning page breaks return as a single array
- **Semantic field matching**: Use `x-alternativeNames` to map field name variations across documents

**`x-alternativeNames` for Field Name Variations:**

When the same data appears under different labels across document types or vendors (for example, "Invoice Total", "Grand Total", "Amount Due"), use `x-alternativeNames` to list the alternative labels. The model uses these to match fields by meaning rather than exact name:

```json
{
  "type": "object",
  "properties": {
    "total_amount": {
      "type": "number",
      "description": "The total monetary value, including all charges and taxes.",
      "x-alternativeNames": ["Invoice Total", "Grand Total", "Amount Due"]
    }
  }
}
```

> **Deprecated models:** `extract-20250930` and `extract-20251024` are deprecated. Migrate to `extract-latest` or pin to `extract-20260314`.

## Troubleshooting

### Schema Validation Errors (422)
- Ensure top-level type is "object"
- Check JSON syntax
- Verify required structure

### Partial Extraction (206)
- Extracted data doesn't match schema
- API returns partial results and consumes credits
- Review field types and descriptions

### Low Accuracy
- Add more detailed descriptions
- Use more specific field names
- Match schema to document structure
- Reduce schema complexity

## Examples by Use Case

### Invoice Processing
```json
{
  "type": "object",
  "properties": {
    "invoice_number": {"type": "string"},
    "invoice_date": {"type": "string", "description": "Date in YYYY-MM-DD format"},
    "due_date": {"type": "string", "description": "Due date in YYYY-MM-DD format"},
    "vendor_name": {"type": "string"},
    "total_amount": {"type": "number", "description": "Total in USD"},
    "line_items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "description": {"type": "string"},
          "quantity": {"type": "integer"},
          "unit_price": {"type": "number"},
          "amount": {"type": "number"}
        }
      }
    }
  }
}

```

### Bank Statement
```json
{
  "type": "object",
  "properties": {
    "account_holder": {"type": "string"},
    "account_number": {"type": "string"},
    "statement_period": {"type": "string"},
    "beginning_balance": {"type": "number"},
    "ending_balance": {"type": "number"},
    "transactions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "date": {"type": "string"},
          "description": {"type": "string"},
          "amount": {"type": "number"},
          "type": {"type": "string", "enum": ["Debit", "Credit"]}
        }
      }
    }
  }
}
```

### Medical Form
```json
{
  "type": "object",
  "properties": {
    "patient": {
      "type": "object",
      "properties": {
        "first_name": {"type": "string"},
        "middle_name": {"type": "string"},
        "last_name": {"type": "string"},
        "date_of_birth": {"type": "string"},
        "insurance_id": {"type": "string"}
      }
    },
    "provider": {
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "specialty": {"type": "string"}
      }
    },
    "has_allergies": {"type": "boolean"},
    "allergies": {
      "type": "array",
      "items": {"type": "string"}
    }
  }
}
```

## References

- [Official Extraction Schema Documentation](https://docs.landing.ai/ade/ade-extract-schema-json)
- [Python Library Documentation](https://docs.landing.ai/ade/ade-python)
- [Extraction Models](https://docs.landing.ai/ade/ade-extract-models)
