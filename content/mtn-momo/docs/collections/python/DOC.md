---
name: collections
description: "MTN Mobile Money (MoMo) Collections API for requesting payments from MTN subscribers across 17 African countries including Ghana, Uganda, Rwanda, Côte d'Ivoire, and Cameroon"
metadata:
  languages: "python"
  versions: "3.0.1"
  revision: 1
  updated-on: "2026-03-10"
  source: community
  tags: "mtn,momo,mobile-money,ghana,uganda,rwanda,africa,payments,collections,fintech"
---
# MTN MoMo Collections API — Python

You are an MTN MoMo API expert. Help me integrate MTN Mobile Money payment collections using the `mtnmomo` Python library.

- **PyPI:** `mtnmomo` (v3.0.1)
- **Docs:** https://momodeveloper.mtn.com
- **Coverage:** Ghana, Uganda, Rwanda, Côte d'Ivoire, Cameroon, Benin, and 11 more MTN markets
- **Sandbox portal:** https://momodeveloper.mtn.com/api-documentation/api-description/

## Installation

```bash
pip install mtnmomo
```

## Credentials required

From the MTN MoMo developer portal (https://momodeveloper.mtn.com):

| Credential | Description |
|---|---|
| `SUBSCRIPTION_KEY` | Primary subscription key (Ocp-Apim-Subscription-Key) |
| `API_USER` | UUID you generate and register via API |
| `API_KEY` | Generated from your API_USER |

## Sandbox setup (one-time)

In sandbox, you provision your own API_USER and API_KEY:

```python
import uuid
import requests
import os

SUBSCRIPTION_KEY = os.environ["MTN_SUBSCRIPTION_KEY"]
BASE_URL = "https://sandbox.momodeveloper.mtn.com"

def provision_sandbox_credentials():
    """Run once to get your sandbox API_USER and API_KEY."""

    # 1. Create API User
    api_user = str(uuid.uuid4())
    resp = requests.post(
        f"{BASE_URL}/v1_0/apiuser",
        headers={
            "X-Reference-Id": api_user,
            "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
            "Content-Type": "application/json",
        },
        json={"providerCallbackHost": "https://yourdomain.com"},
    )
    assert resp.status_code == 201, f"Create user failed: {resp.text}"

    # 2. Create API Key
    resp = requests.post(
        f"{BASE_URL}/v1_0/apiuser/{api_user}/apikey",
        headers={"Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY},
    )
    assert resp.status_code == 201
    api_key = resp.json()["apiKey"]

    print(f"MTN_API_USER={api_user}")
    print(f"MTN_API_KEY={api_key}")
    return api_user, api_key
```

## Initialize Collections client

```python
from mtnmomo.collection import Collection
import os

collection = Collection(
    api_user=os.environ["MTN_API_USER"],
    api_key=os.environ["MTN_API_KEY"],
    environment="sandbox",              # "sandbox" or "production"
    subscription_key=os.environ["MTN_SUBSCRIPTION_KEY"],
)
```

## Request to Pay (prompt user for payment)

```python
import uuid

def request_payment(phone: str, amount: str, currency: str, note: str) -> str:
    """
    Sends a payment prompt to the MTN subscriber's phone.
    phone: MSISDN without + e.g. "256712345678" (Uganda)
    amount: string e.g. "1000"
    currency: "UGX", "GHS", "RWF", "XOF" (WAEMU), "XAF" (CEMAC)
    Returns: reference_id (UUID) — use to check status
    """
    reference_id = str(uuid.uuid4())

    response = collection.requestToPay(
        mobile=phone,
        amount=amount,
        external_id=str(uuid.uuid4()),   # your internal reference
        payee_note=note,
        payer_message=note,
        currency=currency,
        reference_id=reference_id,
    )

    # Returns HTTP 202 Accepted — payment is async
    # Poll get_transaction_status() to check completion
    return reference_id
```

## Check transaction status

```python
import time

def wait_for_payment(reference_id: str, max_wait: int = 120) -> dict:
    """
    Poll until payment completes or times out.
    Returns the transaction status dict.
    """
    start = time.time()
    while time.time() - start < max_wait:
        status = collection.getTransactionStatus(reference_id)
        if status["status"] in ("SUCCESSFUL", "FAILED"):
            return status
        time.sleep(5)

    return {"status": "TIMEOUT", "reference_id": reference_id}


# Full payment flow
def collect_payment(phone: str, amount: str, currency: str) -> bool:
    ref = request_payment(phone, amount, currency, note="Payment")
    result = wait_for_payment(ref)

    if result["status"] == "SUCCESSFUL":
        print(f"Paid: {amount} {currency} from {phone}")
        return True
    else:
        print(f"Payment {result['status']}: {result.get('reason', '')}")
        return False
```

## Get account balance

```python
balance = collection.getBalance()
# {"availableBalance": "1000.00", "currency": "EUR"}  (sandbox uses EUR)
print(f"Balance: {balance['availableBalance']} {balance['currency']}")
```

## Currency by country

| Country | Currency | Network |
|---|---|---|
| Ghana | GHS | MTN Ghana |
| Uganda | UGX | MTN Uganda |
| Rwanda | RWF | MTN Rwanda |
| Côte d'Ivoire | XOF | MTN CI |
| Cameroon | XAF | MTN Cameroon |
| Benin | XOF | MTN Benin |
| Zambia | ZMW | MTN Zambia |

**Sandbox always uses EUR** regardless of the currency you pass. Set correct currency for production.

## Phone number format

MTN MoMo requires MSISDN format — the full number **without** the `+` prefix:

```python
def normalize_momo_phone(phone: str, country_code: str = "256") -> str:
    """
    Uganda default (256). Adjust country_code per market.
    "+256712345678" → "256712345678"
    "0712345678"    → "256712345678"
    """
    phone = phone.strip().lstrip("+")
    if phone.startswith("0"):
        phone = country_code + phone[1:]
    elif not phone.startswith(country_code):
        phone = country_code + phone
    return phone

# Country codes
COUNTRY_CODES = {
    "GH": "233",   # Ghana
    "UG": "256",   # Uganda
    "RW": "250",   # Rwanda
    "CI": "225",   # Côte d'Ivoire
    "CM": "237",   # Cameroon
}
```

## Webhook callback pattern

MTN MoMo POSTs to your `providerCallbackHost` when a transaction completes:

```python
from flask import Flask, request

app = Flask(__name__)

@app.route("/momo/callback", methods=["PUT"])
def momo_callback():
    # MTN sends PUT, not POST
    data         = request.json
    reference_id = request.headers.get("X-Reference-Id")
    status       = data.get("status")          # "SUCCESSFUL" | "FAILED"
    amount       = data.get("amount")
    payer        = data.get("payer", {}).get("partyId")

    if status == "SUCCESSFUL":
        fulfill_order(reference_id, amount, payer)

    return "", 200
```

## Environment variables

```bash
MTN_SUBSCRIPTION_KEY=...
MTN_API_USER=<uuid4>
MTN_API_KEY=...
MTN_ENVIRONMENT=sandbox    # "production" for live
```

## Useful links

- Developer portal: https://momodeveloper.mtn.com
- API reference: https://momodeveloper.mtn.com/api-documentation/api-description
- Sandbox testing: https://momodeveloper.mtn.com/testing
- Country-specific docs: https://momodeveloper.mtn.com/products
