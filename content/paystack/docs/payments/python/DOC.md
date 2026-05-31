---
name: payments
description: "Paystack API for accepting card, bank transfer, USSD, and mobile money payments across Nigeria, Ghana, Kenya, and South Africa"
metadata:
  languages: "python"
  versions: "2.1.3"
  revision: 1
  updated-on: "2026-03-10"
  source: community
  tags: "paystack,nigeria,ghana,kenya,africa,payments,card,bank-transfer,fintech"
---
# Paystack API — Python

You are a Paystack API expert. Help me integrate Paystack payments using the `paystackapi` Python library or raw `requests`.

- **PyPI:** `paystackapi` (v2.1.3)
- **Docs:** https://paystack.com/docs/api
- **Coverage:** Nigeria (NGN), Ghana (GHS), Kenya (KES), South Africa (ZAR)
- **Dashboard:** https://dashboard.paystack.com

## Installation

```bash
pip install paystackapi
```

Or raw requests (zero dependency):
```bash
pip install requests
```

## Authentication

```python
import os
from paystackapi.paystack import Paystack

paystack = Paystack(secret_key=os.environ["PAYSTACK_SECRET_KEY"])
```

For raw requests, all calls use `Authorization: Bearer sk_live_...` or `sk_test_...` for sandbox.

```python
import requests, os

HEADERS = {
    "Authorization": f"Bearer {os.environ['PAYSTACK_SECRET_KEY']}",
    "Content-Type": "application/json",
}
BASE = "https://api.paystack.co"
```

**Secret key prefix:** `sk_test_` for sandbox, `sk_live_` for production.  
**Public key prefix:** `pk_test_` / `pk_live_` — used only in frontend.

## Initialize transaction (start payment)

```python
from paystackapi.transaction import Transaction

response = Transaction.initialize(
    email="customer@example.com",
    amount=5000,              # Amount in KOBO (NGN) or PESEWAS (GHS) or CENTS (KES/ZAR)
    currency="NGN",           # NGN, GHS, KES, ZAR
    callback_url="https://yourdomain.com/paystack/callback",
    reference="ORDER_12345",  # your unique reference
    metadata={
        "order_id": "12345",
        "customer_name": "Jane Doe",
    }
)

# response["data"]["authorization_url"] — redirect customer here
# response["data"]["reference"]          — store for verification
authorization_url = response["data"]["authorization_url"]
reference         = response["data"]["reference"]
```

**Amount is always in the smallest currency unit:**
- NGN: kobo (100 kobo = ₦1)
- GHS: pesewas (100 pesewas = GH₵1)
- KES: cents (100 cents = KES 1) — note: M-Pesa channel only for KES
- ZAR: cents (100 cents = R1)

## Verify transaction

Always verify on your server — never trust the frontend callback alone.

```python
def verify_payment(reference: str) -> dict:
    response = Transaction.verify(reference=reference)

    if not response["status"]:
        raise ValueError(f"Paystack API error: {response['message']}")

    data   = response["data"]
    status = data["status"]           # "success", "failed", "abandoned"
    amount = data["amount"]           # in smallest unit
    paid_at = data["paid_at"]

    if status != "success":
        raise ValueError(f"Payment not successful: {status}")

    return {
        "reference":   data["reference"],
        "amount":      amount / 100,   # convert to main unit
        "currency":    data["currency"],
        "channel":     data["channel"],   # "card", "bank", "ussd", "mobile_money"
        "customer":    data["customer"]["email"],
        "paid_at":     paid_at,
    }
```

## Webhook handler (Flask)

Paystack POSTs events to your webhook URL. Always verify the signature.

```python
import hashlib
import hmac
import json
import os
from flask import Flask, request, abort

app = Flask(__name__)

@app.route("/paystack/webhook", methods=["POST"])
def paystack_webhook():
    # Verify signature
    signature = request.headers.get("X-Paystack-Signature", "")
    secret    = os.environ["PAYSTACK_SECRET_KEY"].encode()
    body      = request.get_data()

    expected = hmac.new(secret, body, hashlib.sha512).hexdigest()
    if not hmac.compare_digest(expected, signature):
        abort(400)

    event = request.json
    event_type = event.get("event")

    if event_type == "charge.success":
        data      = event["data"]
        reference = data["reference"]
        amount    = data["amount"] / 100
        email     = data["customer"]["email"]
        channel   = data["channel"]   # "card", "bank_transfer", "ussd", "mobile_money"

        # Idempotency: check if already processed
        if not is_processed(reference):
            fulfill_order(reference, amount, email)
            mark_processed(reference)

    elif event_type == "transfer.success":
        # Payout completed
        pass

    elif event_type == "charge.failed":
        data = event["data"]
        handle_failed_payment(data["reference"])

    return "", 200
```

## List transactions

```python
from paystackapi.transaction import Transaction

# With filters
transactions = Transaction.list(
    perPage=50,
    page=1,
    status="success",         # "success", "failed", "abandoned"
    from_date="2026-01-01",
    to_date="2026-03-31",
    currency="NGN",
)

for txn in transactions["data"]:
    print(f"{txn['reference']}: {txn['amount']/100} {txn['currency']} — {txn['status']}")
```

## Transfers (payouts to bank accounts)

```python
from paystackapi.transfer import Transfer
from paystackapi.transferrecipient import TransferRecipient

# 1. Create recipient
recipient = TransferRecipient.create(
    type="nuban",              # "nuban" for Nigerian bank, "mobile_money" for GH/KE
    name="John Doe",
    account_number="0123456789",
    bank_code="057",           # get list from /bank endpoint
    currency="NGN",
)
recipient_code = recipient["data"]["recipient_code"]

# 2. Initiate transfer
transfer = Transfer.initiate(
    source="balance",
    amount=10000,             # in kobo
    recipient=recipient_code,
    reason="Vendor payment",
    reference="TRF_12345",
)
# transfer["data"]["status"] — "pending" initially
# Webhook "transfer.success" fires when complete
```

## Mobile money (Kenya KES / Ghana GHS)

```python
# Kenya M-Pesa via Paystack (available on KES accounts)
response = Transaction.initialize(
    email="customer@example.com",
    amount=100000,             # KES 1,000 in cents
    currency="KES",
    channels=["mobile_money"],  # restrict to M-Pesa
    mobile_money={
        "phone": "0712345678",
        "provider": "mpesa",   # "mpesa" | "airtel_money" | "mtn" | "vodafone"
    },
    callback_url="https://yourdomain.com/paystack/callback",
)
```

## Subaccounts (split payments / marketplace)

```python
from paystackapi.subaccount import SubAccount

# Create a subaccount for a vendor
sub = SubAccount.create(
    business_name="Vendor Name",
    settlement_bank="057",
    account_number="0123456789",
    percentage_charge=2.5,      # Paystack takes 2.5% of every charge to this subaccount
)
subaccount_code = sub["data"]["subaccount_code"]

# Charge and split
Transaction.initialize(
    email="buyer@example.com",
    amount=50000,
    subaccount=subaccount_code,
    transaction_charge=1000,   # flat fee to main account in kobo
    bearer="subaccount",       # who bears Paystack fees
)
```

## Environment variables

```bash
PAYSTACK_SECRET_KEY=sk_test_...    # sk_live_... for production
PAYSTACK_PUBLIC_KEY=pk_test_...    # used in frontend only
PAYSTACK_WEBHOOK_SECRET=$PAYSTACK_SECRET_KEY  # same key used for HMAC
```

## Useful links

- Dashboard: https://dashboard.paystack.com
- API reference: https://paystack.com/docs/api
- Test cards: https://paystack.com/docs/payments/test-payments
- Bank codes: `GET https://api.paystack.co/bank?currency=NGN`
- Webhook events: https://paystack.com/docs/payments/webhooks
