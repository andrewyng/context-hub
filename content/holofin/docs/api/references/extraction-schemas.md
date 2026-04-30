# Extraction Response Schemas

## Common Structure

All extraction results follow the same envelope:

```json
{
  "extraction": {
    "document_parts": [
      {
        "key": "segment_1",
        "part_type": "bank_statement",
        "label": "Account description",
        "validation_status": "OK",
        "pages": [1, 2, 3],
        "data": { ... }
      }
    ]
  }
}
```

- `key`: Unique segment identifier (segment_1, segment_2, ...)
- `part_type`: Document type of this segment
- `validation_status`: `"OK"` | `"WARN"` | `"ERROR"` | `null`
- `pages`: Array of 1-indexed page numbers
- `data`: Type-specific structured data

## Bank Statement (`part_type: "bank_statement"`)

```json
{
  "properties": {
    "bank_name": "BNP Paribas",
    "account_number": "FR76 3000 1234 5678 9012 345",
    "account_holder": "SARL Example",
    "currency": "EUR",
    "start_date": "2026-01-01",
    "end_date": "2026-01-31",
    "start_balance": 1500.00,
    "end_balance": 2300.50
  },
  "transactions": [
    {
      "transaction_date": "2026-01-05",
      "value_date": "2026-01-05",
      "description": "VIREMENT SALAIRE JANVIER",
      "amount": 3200.00,
      "transaction_type": "credit"
    },
    {
      "transaction_date": "2026-01-10",
      "value_date": "2026-01-10",
      "description": "PRLV LOYER BUREAU",
      "amount": -1200.00,
      "transaction_type": "debit"
    }
  ]
}
```

**Validation**: Balance equation check — `start_balance + sum(credits) - sum(debits) = end_balance` (€0.02 tolerance).

## Custom Extraction Schemas

For workflows with custom extractors, `data` contains whatever fields were defined in the extraction schema. Field names and types match your schema configuration.

```json
{
  "data": {
    "invoice_number": "INV-2026-001",
    "total_amount": 1234.56,
    "line_items": [
      {"description": "Widget A", "quantity": 10, "unit_price": 123.456}
    ]
  }
}
```

## Multi-Segment Documents

A single PDF can produce multiple `document_parts` when the segmenter detects multiple documents (e.g., 3 bank statements from different accounts stapled together). Each part has its own `pages` array and `validation_status`.
