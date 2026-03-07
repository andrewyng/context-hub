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
  },
  "required": ["field_name"]
}
```

**Key points:**
- Top-level `type` must be `"object"`
- Define fields in the `properties` object
- Use `required` array for mandatory fields
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
  },
  "required": ["patient_name"]
}
```

### 2. Nested Objects

Extract hierarchical data with up to 5 levels of nesting:

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

### 5. Document Classification

Use enum to classify documents and extract different fields per type:

```json
{
  "type": "object",
  "properties": {
    "document_type": {
      "type": "string",
      "enum": ["Passport", "Invoice", "Receipt", "Other"]
    }
  },
  "required": ["document_type"]
}
```

After classification, make a second extraction call with type-specific schema.

### 6. Nullable Fields

**For extract-20251024 (recommended):**
```json
{
  "type": "object",
  "properties": {
    "middle_name": {
      "type": "string",
      "nullable": true,
      "description": "Patient's middle name, if provided"
    }
  }
}
```

**For extract-20250930:**
```json
{
  "type": "object",
  "properties": {
    "middle_name": {
      "type": ["string", "null"],
      "description": "Patient's middle name, if provided"
    }
  }
}
```

### 7. Union Types

When a field can accept multiple types, use `anyOf` (especially with objects or arrays):

```json
{
  "type": "object",
  "properties": {
    "field1": {"type": "string"},
    "field2": {
      "anyOf": [
        {"type": "number"},
        {"type": "object"}
      ]
    }
  }
}
```

> **Validation rule:** Every sub-schema within `anyOf` must include either a `type` or `anyOf` keyword. If a sub-schema is missing both, the API returns a **400 error** identifying the invalid path. For example, `"anyOf": [{"description": "a number"}]` will fail because the sub-schema has no `type`.

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
- Format requirements ("in USD", "as YYYY-MM-DD")
- What to include/exclude ("excluding tax", "including area code")

Example:
```json
{
  "total_amount": {
    "type": "number",
    "description": "Total amount in USD, excluding tax"
  }
}
```

### 3. Match Document Structure
Order fields in your schema to match their order in the document.

### 4. Limit Complexity
- Keep schemas under 30 properties for optimal performance
- Start with a few fields, add more as needed
- Keep names short but descriptive
- Flatten nested arrays when possible
- Reduce optional properties

### 5. Use Appropriate Types
- Use `number` for monetary values or calculations
- Use `integer` for counts
- Use `array` for repeating items (tables, lists)
- Use `object` for hierarchical data

## Model-Specific Considerations

### extract-20251024 (Latest, Recommended)

**Supported Keywords:**
- `type`, `properties`, `required`, `description`, `title`
- `enum` (string only), `nullable`
- `array`, `items`, `maxItems`, `minItems`
- `number`, `maximum`, `minimum`
- `anyOf`, `$ref`, `$defs`
- `format`, `propertyOrdering`

**Behavior:**
- Missing fields return `null` (even if required)
- Falls back to extract-20250930 if schema is too complex

### extract-20250930 (Previous Version)

**Unsupported Keywords:**
- `allOf`, `not`, `dependentRequired`, `dependentSchemas`, `if`, `then`, `else`

**Behavior:**
- Inconsistent handling of missing fields (may return `null`, `0`, empty string, etc.)
- Use type array for nullable: `"type": ["string", "null"]`

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
  },
  "required": ["invoice_number", "total_amount"]
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
        "middle_name": {"type": "string", "nullable": true},
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
