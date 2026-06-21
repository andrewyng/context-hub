---
name: package
description: "Veryfi Python SDK for OCR and structured data extraction from receipts, invoices, bank statements, checks, tax forms, and any document"
metadata:
  languages: "python"
  versions: "5.0.1"
  revision: 1
  updated-on: "2026-03-26"
  source: maintainer
  tags: "veryfi,ocr,data-extraction,receipts,invoices,bank-statements,checks,documents,ai"
---

# Veryfi Python SDK

## What It Is

`veryfi` is the official Python SDK for the [Veryfi OCR API](https://veryfi.com/api/). It extracts structured data from receipts, invoices, bank statements, checks, W-2s, W-8s, W-9s, business cards, and any other document type with a single function call. No templates, no training, no regex.

If you need to pull line items from a receipt, transactions from a bank statement, or fields from a tax form, this is the package.

## Install

```bash
pip install -U veryfi
```

Requires Python 3.9 or later.

## Credentials

You need four values from your Veryfi account:

- `client_id`
- `client_secret`
- `username`
- `api_key`

Get them at [app.veryfi.com/api/settings/keys/](https://app.veryfi.com/api/settings/keys/). If you don't have an account, sign up free at [app.veryfi.com/signup/api/](https://app.veryfi.com/signup/api/).

Set them as environment variables:

```bash
export VERYFI_CLIENT_ID="your_client_id"
export VERYFI_CLIENT_SECRET="your_client_secret"
export VERYFI_USERNAME="your_username"
export VERYFI_API_KEY="your_api_key"
```

## Initialize the Client

```python
import os
from veryfi import Client

client = Client(
    client_id=os.environ["VERYFI_CLIENT_ID"],
    client_secret=os.environ["VERYFI_CLIENT_SECRET"],
    username=os.environ["VERYFI_USERNAME"],
    api_key=os.environ["VERYFI_API_KEY"],
)
```

Optional constructor parameters:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `base_url` | `https://api.veryfi.com/api/` | Override the API base URL |
| `api_version` | `v8` | API version string |
| `timeout` | `30` | Request timeout in seconds |

## Receipts and Invoices

### Process from a Local File

```python
response = client.process_document(
    file_path="/tmp/receipt.jpg",
    categories=["Meals & Entertainment", "Travel"],
)
```

### Process from a URL

```python
response = client.process_document_url(
    file_url="https://cdn.example.com/invoice.pdf",
    categories=["Office Supplies"],
    boost_mode=True,
    external_id="my-ref-001",
    max_pages_to_process=5,
)
```

### Typical Response

```python
{
    "id": 933760836,
    "created_date": "2024-08-15 15:56:56",
    "date": "2022-05-24 13:10:00",
    "vendor": {"name": "Walgreens", "address": "191 E 3rd Ave, San Mateo, CA 94401, US"},
    "total": 29.53,
    "subtotal": 27.60,
    "tax": 1.93,
    "currency_code": "USD",
    "category": "Personal Care",
    "payment": {"type": "visa", "card_number": "1850", "display_name": "Visa ***1850"},
    "line_items": [
        {"description": "RED BULL ENRGY DRNK CNS 8.4OZ 6PK", "total": 8.79, "quantity": 1.0},
        {"description": "COCA COLA MINICAN 7.5Z 6PK", "total": 4.99, "quantity": 1.0},
    ],
    "ocr_text": "WALGREENS #3241\n191 E 3rd Ave...",
    "status": "processed",
}
```

### List, Get, Update, Delete

```python
# Search documents
documents = client.get_documents(q="Walgreens", created_date__gt="2024-01-01+00:00:00")

# Get by ID
document = client.get_document(document_id=933760836)

# Update fields
client.update_document(
    document_id=933760836,
    vendor={"name": "Starbucks", "address": "123 Easy St, San Francisco, CA 94158"},
    category="Meals & Entertainment",
    total=11.23,
)

# Delete
client.delete_document(document_id=933760836)
```

### Line Items

```python
items = client.get_line_items(document_id=933760836)
client.add_line_item(document_id=933760836, payload={"description": "Extra item", "total": 5.00})
client.update_line_item(document_id=933760836, line_item_id=101, payload={"total": 6.00})
client.delete_line_item(document_id=933760836, line_item_id=101)
```

### Tags

```python
client.add_tag(document_id=933760836, tag_name="reimbursable")
client.add_tags(document_id=933760836, tags=["q1", "travel"])
client.get_tags(document_id=933760836)
client.delete_tags(document_id=933760836)
```

### Split Multi-Page PDFs

When a single PDF contains multiple receipts or invoices:

```python
response = client.split_and_process_pdf(file_path="/tmp/multi.pdf")
response = client.split_and_process_pdf_url(file_url="https://cdn.example.com/multi.pdf")
```

## Bank Statements

Extract transactions, balances, and account details:

```python
# From file
response = client.process_bank_statement_document(
    file_path="/tmp/statement.pdf",
    categories=["Transfer", "Credit Card Payments", "Restaurants / Dining / Meals"],
)

# From URL
response = client.process_bank_statement_document_url(
    file_url="https://cdn.example.com/statement.pdf",
    categories=["ATM Deposit", "Interest / Dividends", "Mortgage Payments"],
)
```

The `categories` parameter is optional. When provided, the API maps each transaction to the closest matching category.

```python
# List
statements = client.get_bank_statements(
    created_date__gt="2024-01-01+00:00:00",
    created_date__lte="2024-12-31+23:59:59",
)

# Get by ID
statement = client.get_bank_statement(document_id=4559568)

# Delete
client.delete_bank_statement(document_id=4559568)
```

## Checks

```python
# From file
response = client.process_check(file_path="/tmp/check.jpg")

# From URL
response = client.process_check_url(file_url="https://cdn.example.com/check.jpg")

# With remittance
response = client.process_check_with_remittance(file_path="/tmp/check_remittance.pdf")
response = client.process_check_with_remittance_url(file_url="https://cdn.example.com/check.pdf")

# CRUD
checks = client.get_checks(created_date__gt="2024-01-01+00:00:00")
check = client.get_check(document_id=12345)
client.update_check(document_id=12345, status="cleared")
client.delete_check(document_id=12345)
```

## Business Cards

```python
response = client.process_bussines_card_document(file_path="/tmp/card.jpg")
response = client.process_bussines_card_document_url(file_url="https://cdn.example.com/card.jpg")

cards = client.get_business_cards()
card = client.get_business_card(document_id=67890)
client.delete_business_card(document_id=67890)
```

Note: the method name `process_bussines_card_document` has a typo in the SDK (single 's' in 'bussines'). Use it as-is.

## W-2 Forms

```python
response = client.process_w2_document(file_path="/tmp/w2.pdf")
response = client.process_w2_document_url(file_url="https://cdn.example.com/w2.pdf")

w2s = client.get_w2s(created_date_gt="2024-01-01+00:00:00")
w2 = client.get_w2(document_id=11111)
client.delete_w2(document_id=11111)

# Multi-W-2 PDFs
response = client.split_and_process_w2(file_path="/tmp/multi_w2.pdf")
response = client.split_and_process_w2_url(file_url="https://cdn.example.com/multi_w2.pdf")
```

## W-8 and W-9 Forms

```python
# W-8
response = client.process_w8_document(file_path="/tmp/w8.pdf")
response = client.process_w8_document_url(file_url="https://cdn.example.com/w8.pdf")
w8s = client.get_w8s()
w8 = client.get_w8(document_id=22222)
client.delete_w8(document_id=22222)

# W-9
response = client.process_w9_document(file_path="/tmp/w9.pdf")
response = client.process_w9_document_url(file_url="https://cdn.example.com/w9.pdf")
w9s = client.get_w9s()
w9 = client.get_w9(document_id=33333)
client.delete_w9(document_id=33333)
```

## Any Document (Custom Blueprints)

Extract fields from any document type using a named blueprint:

```python
response = client.process_any_document(
    blueprint_name="my_custom_blueprint",
    file_path="/tmp/custom_doc.pdf",
)

response = client.process_any_document_url(
    blueprint_name="my_custom_blueprint",
    file_url="https://cdn.example.com/custom_doc.pdf",
)

docs = client.get_any_documents(created_date__gt="2024-01-01+00:00:00")
doc = client.get_any_document(document_id=44444)
client.delete_any_document(document_id=44444)
```

Built-in blueprints include: `passport`, `us_driver_license`, `uk_drivers_license`, `us_health_insurance_card`, `auto_insurance_card`, `restaurant_menu`, `bill_of_lading`, `air_waybill`, `freight_invoice`, `shipping_label`, `vehicle_registration`, `work_order`, `settlement_letter`, `construction_estimate`, `diploma`, `price_sheet`, `mortgage_application_form`, `w2`, `w8`, and more.

Create custom blueprints at [app.veryfi.com/inboxes/anydocs?tab=blueprints](https://app.veryfi.com/inboxes/anydocs?tab=blueprints).

## Document Classification

Identify the document type before processing:

```python
response = client.classify_document(
    file_path="/tmp/unknown.pdf",
    document_types=["receipt", "invoice", "bank_statement"],
)

response = client.classify_document_url(
    file_url="https://cdn.example.com/unknown.pdf",
    document_types=["w2", "w9"],
)
```

Default types when `document_types` is omitted: `receipt`, `invoice`, `purchase_order`, `bank_statement`, `check`, `w2`, `w8`, `w9`, `statement`, `contract`, `credit_note`, `remittance_advice`, `business_card`, `packing_slip`, `other`.

## Error Handling

All API errors raise `VeryfiClientError` or a specific subclass:

```python
from veryfi.errors import (
    VeryfiClientError,
    UnauthorizedAccessToken,
    BadRequest,
    ResourceNotFound,
    AccessLimitReached,
)

try:
    response = client.process_document(file_path="/tmp/receipt.jpg")
except UnauthorizedAccessToken:
    print("Check your client_id, username, and api_key.")
except ResourceNotFound:
    print("The requested document does not exist.")
except AccessLimitReached:
    print("API rate limit reached. Wait before retrying.")
except BadRequest as e:
    print(f"Bad request: {e}")
except VeryfiClientError as e:
    print(f"Unexpected error (HTTP {e.status}): {e}")
```

| Exception | HTTP Status | Cause |
|-----------|-------------|-------|
| `UnauthorizedAccessToken` | 401 | Invalid or missing credentials |
| `BadRequest` | 400 | Malformed request or missing fields |
| `ResourceNotFound` | 404 | Document ID does not exist |
| `UnexpectedHTTPMethod` | 405 | Wrong HTTP method |
| `AccessLimitReached` | 409 | Rate limit exceeded |
| `InternalError` | 500 | Server-side error |
| `ServiceUnavailable` | 503 | Veryfi service temporarily down |

## Common Pitfalls

- Do not hardcode credentials. Use environment variables or a secret manager.
- Do not confuse `client_secret` with `api_key`. Both are required but serve different purposes.
- The method `process_bussines_card_document` has a known typo (single 's'). Use it exactly as named.
- File uploads have a 20 MB size limit. Compress or reduce resolution for large images.
- Default page limits: 15 pages for receipts/invoices, 50 for bank statements. Contact support to increase.
- For multi-page PDFs containing separate documents (like multiple receipts in one file), use `split_and_process_pdf` instead of `process_document`.
- The `ocr_text` field in responses is plain text, not markdown. If you need formatted output, post-process it yourself.
- All list endpoints support date filtering with `created_date__gt` and `created_date__lte` parameters.
- Rate limits depend on your plan tier. On free/starter plans, avoid parallel bursts. Implement exponential backoff on HTTP 429 responses.

## Official Sources

- API documentation: https://docs.veryfi.com/
- SDK reference: https://veryfi.github.io/veryfi-python/reference/veryfi/#client
- PyPI: https://pypi.org/project/veryfi/
- Source repository: https://github.com/veryfi/veryfi-python
- Get API keys: https://app.veryfi.com/api/settings/keys/
- Sign up: https://app.veryfi.com/signup/api/
- Support: support@veryfi.com
