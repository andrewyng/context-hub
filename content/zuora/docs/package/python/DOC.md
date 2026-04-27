---
name: package
description: "Zuora Python SDK (zuora-sdk) for subscription billing, invoicing, payments, and product catalog management with auto-authentication and thread-safe token refresh"
metadata:
  languages: "python"
  versions: "3.15.0"
  revision: 1
  updated-on: "2026-03-31"
  source: maintainer
  tags: "zuora,python,sdk,billing,subscriptions,payments"
---
# Zuora Python SDK Guide

## 1. Golden Rules

**Always use the `ZuoraClient` class** — it handles OAuth2 authentication, automatic token refresh (every 10 minutes), and thread-safe access. Never manage tokens manually.

**Always call `client.initialize()`** after creating the client. This authenticates and starts the background token refresh daemon thread.

**Always catch `ApiException`** for API errors. Parse `e.body` as JSON to get structured error codes and messages.

**Current SDK Version:** 3.15.0 | **API Version:** 2025-08-12 | **Python:** 3.9+

## 2. Installation

```bash
pip install zuora-sdk
```

```bash
poetry add zuora-sdk
```

```bash
uv add zuora-sdk
```

### Dependencies

The SDK depends on: `urllib3`, `python-dateutil`, `pydantic>=2.6`, `typing-extensions`, `certifi`

### Environment Variables

```bash
# Required
ZUORA_CLIENT_ID=your-client-id
ZUORA_CLIENT_SECRET=your-client-secret

# Optional
ZUORA_BASE_URL=https://rest.apisandbox.zuora.com
```

**CRITICAL:** Never commit credentials to version control. Use `.env` files with `python-dotenv` or secure secret managers.

## 3. Initialization

### Basic Setup

```python
import os
from zuora_sdk.zuora_client import ZuoraClient, ZuoraEnvironment

client = ZuoraClient(
    client_id=os.environ['ZUORA_CLIENT_ID'],
    client_secret=os.environ['ZUORA_CLIENT_SECRET'],
    env=ZuoraEnvironment.SBX
)
client.initialize()  # Authenticates and starts background token refresh
```

### With dotenv

```python
import os
from dotenv import load_dotenv
from zuora_sdk.zuora_client import ZuoraClient, ZuoraEnvironment
from zuora_sdk.rest import ApiException

load_dotenv()

def get_client():
    try:
        client = ZuoraClient(
            client_id=os.environ.get('ZUORA_CLIENT_ID'),
            client_secret=os.environ.get('ZUORA_CLIENT_SECRET'),
            env=ZuoraEnvironment.SBX
        )
        client.set_debug(True)  # Enable request/response logging
        client.initialize()
        return client
    except ApiException as ex:
        print(f"Failed to initialize client: {ex}")
        raise
```

### Available Environments

| Enum | Environment |
|---|---|
| `ZuoraEnvironment.SBX` | US Sandbox (Cloud 2) |
| `ZuoraEnvironment.SBX_NA` | US Sandbox (Cloud 1) |
| `ZuoraEnvironment.SBX_EU` | EU Sandbox |
| `ZuoraEnvironment.CSBX` | US Central Sandbox |
| `ZuoraEnvironment.CSBX_EU` | EU Central Sandbox |
| `ZuoraEnvironment.CSBX_AP` | AP Central Sandbox |
| `ZuoraEnvironment.PROD` | US Production (Cloud 2) |
| `ZuoraEnvironment.PROD_NA` | US Production (Cloud 1) |
| `ZuoraEnvironment.PROD_EU` | EU Production |
| `ZuoraEnvironment.PROD_AP` | AP Production |

## 4. API Client Methods

The `ZuoraClient` exposes typed API accessors:

| Method | API Surface |
|---|---|
| `client.accounts_api()` | Account CRUD operations |
| `client.orders_api()` | Order & subscription lifecycle |
| `client.invoices_api()` | Invoice creation & management |
| `client.payments_api()` | Payment processing |
| `client.products_api()` | Product catalog CRUD |
| `client.product_rate_plans_api()` | Rate plan management |
| `client.product_rate_plan_charges_api()` | Charge management |
| `client.object_queries_api()` | Object Query (search/filter/expand) |
| `client.usage_api()` | Usage record submission |
| `client.bill_run_api()` | Bill run operations |
| `client.credit_memos_api()` | Credit memo operations |
| `client.debit_memos_api()` | Debit memo operations |

## 5. Core Usage

### Accounts

```python
from zuora_sdk import CreateAccountRequest
from zuora_sdk.rest import ApiException

# Create account
try:
    account = client.accounts_api().create_account(
        CreateAccountRequest(
            name='Acme Corp',
            bill_to_contact={
                'first_name': 'Jane',
                'last_name': 'Doe',
                'state': 'California',
                'country': 'USA'
            },
            auto_pay=False,
            currency='USD',
            bill_cycle_day='1'
        ))
    print(f"Account created: {account.account_number}")
except ApiException as e:
    print(f"Error: {e.status} {e.reason}")
```

```python
# Query account with expansion
account = client.object_queries_api().query_account_by_key(
    'A00000001',
    expand=['billTo'])
print(account.to_json())
```

```python
# Query accounts with filters
accounts = client.object_queries_api().query_accounts(
    filter=['currency.EQ:USD'],
    sort=['accountNumber.ASC'],
    page_size=20)
```

### Products

```python
from zuora_sdk import CreateProductRequest

# Create product
product = client.products_api().create_product(
    CreateProductRequest(
        name='Gold Membership',
        description='Premium tier',
        effective_start_date='2024-01-01',
        effective_end_date='2034-01-01'
    ))
if product.success:
    print(f"Product ID: {product.id}")
```

```python
# Query products
products = client.object_queries_api().query_products()
for prod in products.data:
    print(f"{prod.product_number}: {prod.name}")
```

```python
# Query rate plans with charge details
rate_plans = client.object_queries_api().query_product_rate_plans(
    filter=['productId.EQ:' + product_id],
    expand=['productrateplancharges',
            'productrateplancharges.productrateplanchargetiers'])
```

```python
# Get and delete product
product_detail = client.products_api().get_product(product_id)
client.products_api().delete_product(product_id)
```

### Orders & Subscriptions

```python
from datetime import date
from zuora_sdk import (
    CreateOrderRequest, PreviewOrderRequest,
    ProcessingOptionsWithDelayedCapturePayment
)

# Preview order (dry run)
preview = client.orders_api().preview_order(
    PreviewOrderRequest(
        order_date=date.today().strftime('%Y-%m-%d'),
        existing_account_number='A00000001',
        subscriptions=[{
            'order_actions': [{
                'type': 'CreateSubscription',
                'create_subscription': {
                    'terms': {'initial_term': {'term_type': 'EVERGREEN'}},
                    'subscribe_to_rate_plans': [
                        {'product_rate_plan_number': 'PRP-00000151'}
                    ]
                }
            }]
        }],
        preview_options={
            'preview_thru_type': 'NumberOfPeriods',
            'preview_number_of_periods': 1,
            'preview_types': ['BillingDocs']
        }
    ))
print(preview.to_json())
```

```python
# Create order (subscription)
order = client.orders_api().create_order(
    CreateOrderRequest(
        order_date=date.today().strftime('%Y-%m-%d'),
        existing_account_number='A00000001',
        subscriptions=[{
            'order_actions': [{
                'type': 'CreateSubscription',
                'create_subscription': {
                    'terms': {'initial_term': {'term_type': 'EVERGREEN'}},
                    'subscribe_to_rate_plans': [
                        {'product_rate_plan_number': 'PRP-00000151'}
                    ]
                }
            }]
        }],
        processing_options=ProcessingOptionsWithDelayedCapturePayment(
            run_billing=False,
            billing_options={'target_date': date.today().strftime('%Y-%m-%d')}
        )
    ))
print(order.to_json())
```

### Invoices

```python
from zuora_sdk import CreateInvoiceRequest, CreateInvoiceItem

# Create standalone invoice
invoice = client.invoices_api().create_standalone_invoice(
    CreateInvoiceRequest(
        account_number='A00000001',
        auto_pay=False,
        invoice_date='2024-01-01',
        status='Posted',
        invoice_items=[
            CreateInvoiceItem(
                amount=100.0,
                charge_name='Set Up Fee',
                description='One-time setup charge',
                quantity=1.0,
                service_start_date='2024-01-01',
                uom='Each'
            )
        ]
    ))
print(f"Invoice {invoice.invoice_number}: ${invoice.balance:.2f}")
```

```python
# Query invoices
inv = client.object_queries_api().query_invoice_by_key(
    'INV00000315', expand=['invoiceItems'])

invoices = client.object_queries_api().query_invoices(
    filter=['accountId.EQ:account-uuid'])
```

### Payments

```python
import json
from zuora_sdk import CreatePaymentRequest, CreatePaymentInvoiceApplication
from zuora_sdk.rest import ApiException

try:
    payment = client.payments_api().create_payment(
        CreatePaymentRequest(
            account_number='A00000001',
            amount=100.0,
            currency='USD',
            effective_date='2024-11-30',
            type='External',
            payment_method_type='Check',
            invoices=[
                CreatePaymentInvoiceApplication(
                    amount=100.0,
                    invoice_id=invoice_id
                )
            ]
        ))
    print(f"Payment created: {payment.number}")
except ApiException as e:
    error_details = json.loads(e.body)
    error_code = error_details['reasons'][0]['code']
    error_msg = error_details['reasons'][0]['message']
    print(f"Error: {error_code} - {error_msg}")
```

## 6. Object Query API

The Object Query API provides consistent querying across all Zuora objects.

### Filtering Operators

```python
# Equality
accounts = client.object_queries_api().query_accounts(
    filter=['currency.EQ:USD'])

# Comparison
invoices = client.object_queries_api().query_invoices(
    filter=['amount.GT:100', 'status.EQ:Posted'])

# Starts with
products = client.object_queries_api().query_products(
    filter=['name.SW:Gold'])

# In set
subscriptions = client.object_queries_api().query_subscriptions(
    filter=['status.IN:Active,Suspended'])
```

### Sorting & Pagination

```python
# Sort ascending
accounts = client.object_queries_api().query_accounts(
    sort=['accountNumber.ASC'],
    page_size=20)

# Cursor-based pagination
if accounts.next_page:
    next_page = client.object_queries_api().query_accounts(
        page_size=20, cursor=accounts.next_page)
```

### Expansion (Joins)

```python
# Account with contacts and subscriptions
account = client.object_queries_api().query_account_by_key(
    'A00000001',
    expand=['billTo', 'soldTo', 'subscriptions'])

# Catalog hierarchy
rate_plans = client.object_queries_api().query_product_rate_plans(
    filter=['productId.EQ:prod-id'],
    expand=['productrateplancharges',
            'productrateplancharges.productrateplanchargetiers'])
```

## 7. Error Handling

```python
import json
from zuora_sdk.rest import ApiException

try:
    result = client.accounts_api().create_account(request)
except ApiException as e:
    print(f"HTTP {e.status}: {e.reason}")

    if e.body:
        error = json.loads(e.body)
        for reason in error.get('reasons', []):
            print(f"  [{reason['code']}] {reason['message']}")

    if e.status == 401:
        client.initialize()  # Re-authenticate
    elif e.status == 404:
        print("Resource not found")
    elif e.status == 429:
        print("Rate limited — back off and retry")
```

### Common Error Codes

| HTTP Status | Meaning |
|---|---|
| 400 | Bad request — validation error in request body |
| 401 | Unauthorized — invalid or expired token |
| 404 | Not found — resource doesn't exist |
| 429 | Rate limited — too many requests |
| 500 | Server error — retry with backoff |

## 8. Advanced Features

### Debug Mode

```python
client.set_debug(True)  # Logs full request/response details
```

### Response Serialization

All response objects support:

```python
response.to_json()   # JSON string
response.to_dict()   # Python dict
```

### Custom Fields

```python
# Access custom fields via additional_properties
account = CreateAccountRequest(name='Acme Corp', ...)
account.additional_properties = {'salesRegion__c': 'West'}
```

### Thread Safety

The `ZuoraClient` is thread-safe. The background token refresh runs in a daemon thread with proper locking. You can safely share a single client instance across threads.

### Retry Logic

The SDK includes built-in exponential backoff retry:
- 3 retry attempts
- Delays: 1 second, 2 seconds, 4 seconds
- Retries on network errors and 5xx responses

## 9. Production Checklist

- [ ] Switch `ZuoraEnvironment.SBX` to appropriate production environment
- [ ] Use environment variables for credentials (never hardcode)
- [ ] Call `client.initialize()` at application startup
- [ ] Implement `ApiException` handling on all API calls
- [ ] Parse error `reasons` array for user-friendly messages
- [ ] Disable debug mode in production (`set_debug(False)`)
- [ ] Use `Zuora-Track-Id` headers for request tracing
- [ ] Set `Idempotency-Key` for mutating operations
- [ ] Test full order-to-cash flow in Sandbox first
- [ ] Monitor token refresh and API error rates
