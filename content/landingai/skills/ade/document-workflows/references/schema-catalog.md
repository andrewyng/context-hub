# Schema Catalog — Ready-to-Use Pydantic Models

Ready-to-use extraction schemas for common document types.
Each schema is a Pydantic `BaseModel` that can be converted to JSON Schema
via `pydantic_to_json_schema` and passed to `client.extract()`.

> **Tip:** ADE supports **one level of nesting**. Use nested `BaseModel`
> sub-classes for logical grouping, and `List[SubModel]` for repeating items
> like line items or transactions.

---

## Usage Pattern (all schemas)

```python
from landingai_ade import LandingAIADE
from landingai_ade.lib import pydantic_to_json_schema

client = LandingAIADE()
parse_result = client.parse(document=path)
extract_result = client.extract(
    schema=pydantic_to_json_schema(MySchema),
    markdown=parse_result.markdown,
)
data: dict = extract_result.extraction
```

---

## 1. Invoice Schema

6 nested groups, 30+ fields. Covers invoices from any vendor/country.

```python
from typing import Optional, List
from datetime import date
from pydantic import BaseModel, Field


class DocumentInfo(BaseModel):
    invoice_date_raw: str = Field(
        ...,
        description=(
            "Invoice date as found in the document."
            " Do not reformat."
        ),
    )
    invoice_date: Optional[date] = Field(
        ..., description="Invoice date in YYYY-MM-DD."
    )
    invoice_number: str = Field(
        ..., description="Invoice number."
    )
    order_date: Optional[str] = Field(
        None, description="Order or purchase date."
    )
    po_number: Optional[str] = Field(
        None, description="Customer purchase order (PO) number."
    )
    status: Optional[str] = Field(
        None,
        description="Payment status (e.g., PAID, UNPAID).",
    )


class CustomerInfo(BaseModel):
    sold_to_name: str = Field(
        ...,
        description=(
            "Name of the customer billed."
            " Can be a person or an organization."
        ),
    )
    sold_to_address: Optional[str] = Field(
        None, description="Address of the customer billed."
    )
    customer_email: Optional[str] = Field(
        None, description="Email address for the customer."
    )


class SupplierInfo(BaseModel):
    supplier_name: str = Field(
        ..., description="Name of the supplier company."
    )
    supplier_address: Optional[str] = Field(
        None, description="Address of the supplier."
    )
    representative: Optional[str] = Field(
        None, description="Sales representative(s)."
    )
    email: Optional[str] = Field(
        None, description="Email address of the supplier."
    )
    phone: Optional[str] = Field(
        None, description="Phone number of the supplier."
    )
    gstin: Optional[str] = Field(
        None, description="GSTIN of the supplier (India)."
    )
    pan: Optional[str] = Field(
        None, description="Permanent Account Number (India)."
    )


class TermsAndShipping(BaseModel):
    payment_terms: Optional[str] = Field(
        None, description="Payment terms (e.g., Net 30)."
    )
    ship_via: Optional[str] = Field(
        None, description="Carrier/service (e.g., UPS Ground)."
    )
    ship_date: Optional[str] = Field(
        None, description="Date shipped."
    )
    tracking_number: Optional[str] = Field(
        None, description="Tracking number."
    )


class TotalsSummary(BaseModel):
    currency: Optional[str] = Field(
        None, description="ISO currency code."
    )
    total_due_raw: Optional[str] = Field(
        None, description="Total due as shown in the doc."
    )
    total_due: float = Field(
        ..., description="Total amount due (numeric, no symbols)."
    )
    subtotal: Optional[float] = Field(
        None, description="Subtotal (numeric)."
    )
    tax: Optional[float] = Field(
        None, description="Tax (numeric)."
    )
    shipping: Optional[float] = Field(
        None, description="Shipping (numeric)."
    )
    handling_fee: Optional[float] = Field(
        None, description="Handling fee (numeric)."
    )


class LineItem(BaseModel):
    line_number: Optional[str] = Field(
        None, description="Printed line number."
    )
    sku: Optional[str] = Field(
        None, description="SKU / Item code / Part number."
    )
    description: str = Field(
        ..., description="Item or service description."
    )
    quantity: Optional[float] = Field(
        None, description="Quantity purchased."
    )
    unit_price: Optional[float] = Field(
        None, description="Unit price (numeric)."
    )
    amount: Optional[float] = Field(
        None, description="Extended line amount (numeric)."
    )


class InvoiceSchema(BaseModel):
    invoice_info: DocumentInfo = Field(
        description="Key identifiers and dates."
    )
    customer_info: CustomerInfo = Field(
        description="Details about the customer billed."
    )
    company_info: SupplierInfo = Field(
        description="Details about the issuing company."
    )
    order_details: TermsAndShipping = Field(
        description="Payment and shipping information."
    )
    totals_summary: TotalsSummary = Field(
        description="Financial totals by category."
    )
    line_items: List[LineItem] = Field(
        default_factory=list,
        description="List of items included in the invoice.",
    )
```

---

## 2. Utility Bill Schema

Provider, account, billing summary, electric and gas charges.

```python
from typing import Optional
from pydantic import BaseModel, Field


class ProviderInfo(BaseModel):
    provider: str = Field(
        ..., description="Name of the utility provider."
    )
    phone_number: Optional[str] = Field(
        None,
        description="Customer service phone (XXX-XXX-XXXX).",
    )
    website: Optional[str] = Field(
        None, description="Official website URL."
    )
    usage_bar_chart: bool = Field(
        False,
        description="Does the bill include a usage trend chart?",
    )


class AccountInfo(BaseModel):
    account_holder: str = Field(
        ...,
        description=(
            "Full name of the account holder."
            " May be a person or organization."
        ),
    )
    account_number: str = Field(
        ..., description="Unique customer account identifier."
    )
    service_address: str = Field(
        ...,
        description=(
            "Full service address on one line"
            " (remove newlines, replace with space)."
        ),
    )
    service_address_city: Optional[str] = Field(
        None, description="City of service address."
    )
    service_address_state: Optional[str] = Field(
        None, description="2-letter state abbreviation."
    )
    service_address_zip: Optional[str] = Field(
        None, description="5-digit ZIP code."
    )


class BillingSummary(BaseModel):
    due_date: str = Field(
        ..., description="Payment due date (YYYY-MM-DD)."
    )
    bill_date: str = Field(
        ..., description="Bill issue date (YYYY-MM-DD)."
    )
    service_start_date: Optional[str] = Field(
        None, description="Service period start (MM-DD-YYYY)."
    )
    service_end_date: Optional[str] = Field(
        None, description="Service period end (MM-DD-YYYY)."
    )
    total_amount_due: str = Field(
        ...,
        description="Total amount due including currency symbol.",
    )


class ElectricCharges(BaseModel):
    meter_number: Optional[str] = Field(
        None,
        description=(
            "Electric meter identifier."
            " Blank if no electric service."
        ),
    )
    usage_kwh: Optional[str] = Field(
        None, description="Total kWh for billing period."
    )
    total_electric_charges: Optional[str] = Field(
        None,
        description="Total electric charges with currency symbol.",
    )


class GasCharges(BaseModel):
    meter_number: Optional[str] = Field(
        None,
        description=(
            "Gas meter identifier."
            " Blank if no gas service."
        ),
    )
    usage_therms: Optional[str] = Field(
        None, description="Total therms for billing period."
    )
    total_gas_charges: Optional[str] = Field(
        None,
        description="Total gas charges with currency symbol.",
    )


class UtilityBillSchema(BaseModel):
    provider_info: ProviderInfo = Field(
        description="Energy provider details."
    )
    account_info: AccountInfo = Field(
        description="Account and customer identifiers."
    )
    billing_summary: BillingSummary = Field(
        description="Charges and due dates."
    )
    electric_charges: ElectricCharges = Field(
        description="Electric usage and charges."
    )
    gas_charges: GasCharges = Field(
        description="Gas usage and charges."
    )
```

---

## 3. Bank Statement Schema

```python
from typing import Optional, List
from pydantic import BaseModel, Field


class BankTransaction(BaseModel):
    date: str = Field(
        ..., description="Transaction date (YYYY-MM-DD)."
    )
    description: str = Field(
        ..., description="Transaction description."
    )
    amount: float = Field(
        ..., description="Transaction amount (numeric)."
    )
    type: Optional[str] = Field(
        None,
        description="Transaction type: debit or credit.",
    )


class BankStatementSchema(BaseModel):
    bank_name: str = Field(
        ..., description="Name of the bank."
    )
    account_number: str = Field(
        ..., description="Bank account number."
    )
    statement_period: Optional[str] = Field(
        None,
        description="Statement period (e.g., Jan 1 - Jan 31, 2025).",
    )
    opening_balance: Optional[float] = Field(
        None, description="Opening balance (numeric)."
    )
    closing_balance: float = Field(
        ..., description="Closing / current balance (numeric)."
    )
    total_deposits: Optional[float] = Field(
        None, description="Total deposits (numeric)."
    )
    total_withdrawals: Optional[float] = Field(
        None, description="Total withdrawals (numeric)."
    )
    transactions: List[BankTransaction] = Field(
        default_factory=list,
        description="List of transactions in the statement.",
    )
```

---

## 3b. Multi-Page Table Schema (for Table Stitching)

Use this pattern when a table spans multiple pages and you want the LLM
to stitch all rows into a single list via `client.extract()`.

```python
from typing import List, Optional
from pydantic import BaseModel, Field


class TableRow(BaseModel):
    """Generic row — customize fields for your table."""
    key_column: str = Field(
        description=(
            "Primary identifier (e.g., date, ID). "
            "Use empty string for continuation rows."
        )
    )
    description: str = Field(
        description="Description or label column."
    )
    amount_a: Optional[str] = Field(
        default=None,
        description=(
            "First amount column (digits and commas only, "
            "no currency symbol). "
            "Null if not applicable for this row."
        ),
    )
    amount_b: Optional[str] = Field(
        default=None,
        description=(
            "Second amount column. "
            "Null if not applicable."
        ),
    )
    running_total: str = Field(
        description=(
            "Running total or balance after this row."
        )
    )


class MultiPageTable(BaseModel):
    rows: List[TableRow] = Field(
        description=(
            "All data rows in order across ALL pages of "
            "the document. Include rows from every page, "
            "even if some pages render as plain text "
            "rather than tables. "
            "Skip column-header rows and section-header "
            "rows."
        )
    )
```

**Schema design tips for multi-page tables:**
- Say **"across ALL pages"** in the `List` field description
- Mention **"even if some pages render as plain text"**
- Say **"Skip column-header rows"** to avoid duplicated headers
- Use `Optional[str]` for mutually exclusive amount columns
- Use `str` (not `float`) for amounts to preserve original formatting
- Add domain-specific hints in descriptions (e.g., "running balance
  after this transaction") to help the LLM resolve ambiguities

> **Full patterns** for three table stitching approaches (parse+extract,
> HTML parsing, pandas): see
> [table-stitching.md](table-stitching.md).

---

## 4. Pay Stub Schema

```python
from typing import Optional, List
from pydantic import BaseModel, Field


class Deduction(BaseModel):
    name: str = Field(
        ..., description="Deduction name (e.g., Federal Tax)."
    )
    amount: float = Field(
        ..., description="Deduction amount (numeric)."
    )


class PayStubSchema(BaseModel):
    employee_name: str = Field(
        ..., description="Full name of the employee."
    )
    employer_name: Optional[str] = Field(
        None, description="Name of the employer."
    )
    pay_period: str = Field(
        ..., description="Pay period covered by this stub."
    )
    pay_date: Optional[str] = Field(
        None, description="Payment date (YYYY-MM-DD)."
    )
    gross_pay: float = Field(
        ..., description="Gross pay amount (numeric)."
    )
    net_pay: float = Field(
        ..., description="Net pay after deductions (numeric)."
    )
    total_deductions: Optional[float] = Field(
        None, description="Total deductions (numeric)."
    )
    deductions: List[Deduction] = Field(
        default_factory=list,
        description="Itemized deductions.",
    )
```

---

## 5. Food / Product Label Schema

27 fields covering identification, weight, certifications, and dietary claims.

```python
from pydantic import BaseModel, Field


class ProductLabelSchema(BaseModel):
    # Identification
    product_name: str = Field(
        ...,
        description=(
            "Full product name excluding brand"
            " as it appears on packaging."
        ),
    )
    brand: str = Field(
        ..., description="Brand or company name."
    )
    product_type: str = Field(
        ...,
        description=(
            "General category (e.g., yogurt, hot dogs,"
            " supplement, beef sticks)."
        ),
    )
    flavor: str = Field(
        ...,
        description=(
            "Flavor if applicable. Empty if not found."
        ),
    )
    # Weight / Serving
    net_weight_oz: float = Field(
        ..., description="Net weight in ounces."
    )
    net_weight_g: float = Field(
        ..., description="Net weight in grams."
    )
    servings_per_container: int = Field(
        ..., description="Total servings per container."
    )
    serving_size: str = Field(
        ...,
        description="Serving size as printed (e.g., '1 stick (45g)').",
    )
    # Certifications (bool flags)
    is_organic: bool = Field(
        ..., description="True if labeled Organic / USDA Organic."
    )
    is_non_gmo: bool = Field(
        ..., description="True if Non-GMO Project Verified."
    )
    is_grass_fed: bool = Field(
        ..., description="True if labeled Grass-Fed."
    )
    is_kosher: bool = Field(
        ..., description="True if Kosher certified."
    )
    is_gluten_free: bool = Field(
        ..., description="True if labeled Gluten-Free."
    )
    # Dietary claims
    is_keto_friendly: bool = Field(
        ..., description="True if labeled Keto."
    )
    is_dairy_free: bool = Field(
        ..., description="True if labeled Dairy-Free."
    )
    has_no_added_sugar: bool = Field(
        ...,
        description="True if No Added Sugar / Zero Sugar.",
    )
```

> **Note:** The full food label schema has 27 fields including
> `is_pasture_raised`, `is_certified_humane`, `no_antibiotics`,
> `no_hormones`, `is_regenerative`, `is_paleo_friendly`,
> `is_whole30_approved`, `is_lactose_free`, `usda_inspected`, etc.
> Add fields as needed for your use case.

---

## 6. CME / Continuing Education Certificate

```python
from typing import Optional
from pydantic import BaseModel, Field


class CMECertificateSchema(BaseModel):
    recipient_name: str = Field(
        ..., description="Full name of the certificate recipient."
    )
    issuing_organization: str = Field(
        ...,
        description="Organization that issued the certificate.",
    )
    activity_title: str = Field(
        ...,
        description="Title of the educational activity or course.",
    )
    completion_date: Optional[str] = Field(
        None, description="Completion date (YYYY-MM-DD)."
    )
    credits_earned: float = Field(
        ..., description="Number of credits earned (numeric)."
    )
    credit_type: Optional[str] = Field(
        None,
        description=(
            "Type of credit (e.g., CME, CE, CPE, CLE)."
        ),
    )
    certificate_id: Optional[str] = Field(
        None, description="Certificate or confirmation number."
    )
    accreditation_statement: Optional[str] = Field(
        None,
        description="Accreditation or approval statement text.",
    )
```

---

## 7. Document Classification Schema

Generic classifier using `Literal` enum. Adapt the type list to your
document mix.

```python
from typing import Literal
from pydantic import BaseModel, Field


class DocTypeClassification(BaseModel):
    type: Literal[
        "invoice",
        "bank_statement",
        "pay_stub",
        "utility_bill",
        "receipt",
        "contract",
    ] = Field(
        description="The type of the document.",
        title="Document Type",
    )
```

### Classify-then-Extract Pattern

```python
from landingai_ade import LandingAIADE
from landingai_ade.lib import pydantic_to_json_schema

schema_map = {
    "invoice": InvoiceSchema,
    "bank_statement": BankStatementSchema,
    "pay_stub": PayStubSchema,
    "utility_bill": UtilityBillSchema,
}

client = LandingAIADE()
parse_result = client.parse(document=path)

# Step 1: Classify
cls_result = client.extract(
    schema=pydantic_to_json_schema(DocTypeClassification),
    markdown=parse_result.markdown,
)
doc_type: str = cls_result.extraction["type"]

# Step 2: Extract with type-specific schema
schema_cls = schema_map[doc_type]
extract_result = client.extract(
    schema=pydantic_to_json_schema(schema_cls),
    markdown=parse_result.markdown,
)
```

---

## Tips for Custom Schemas

1. **Use descriptive `description` fields** — ADE uses them as extraction
   instructions. Be specific about format expectations.
2. **Mark optional fields** with `Optional[T]` and `default=None` to avoid
   extraction failures when a field is absent.
3. **Use `default_factory=list`** for array fields (line items,
   transactions) to avoid null results.
4. **Keep nesting to one level** — ADE supports `TopLevel.nested_object`
   but not `TopLevel.nested.deeper`.
5. **Use `Literal` for enums** — constrains extraction to known values.
6. **Prefer `float` over `str` for monetary amounts** — easier downstream
   processing. Keep a `_raw` string variant if you need the original format.
