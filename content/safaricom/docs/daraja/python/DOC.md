---
name: daraja
description: "Safaricom M-Pesa Daraja API for STK Push (Lipa na M-Pesa), C2B payments, B2C disbursements, and transaction status queries in Kenya"
metadata:
  languages: "python"
  versions: "1.2.4"
  revision: 1
  updated-on: "2026-03-10"
  source: community
  tags: "mpesa,safaricom,daraja,kenya,payments,stk-push,c2b,b2c,mobile-money,fintech"
---
# Safaricom M-Pesa Daraja API — Python

You are a Safaricom M-Pesa Daraja API expert. Help me write code using the `python-daraja` library (or raw `requests`) to integrate M-Pesa payments into Python applications.

- **PyPI package:** `python-daraja`
- **Current version:** 1.2.4
- **Daraja portal:** https://developer.safaricom.co.ke
- **Sandbox:** https://sandbox.safaricom.co.ke
- **Production:** https://api.safaricom.co.ke

## Installation

```bash
pip install python-daraja
```

For raw `requests` approach (zero dependency):
```bash
pip install requests
```

## Daraja API credentials

You need four values from https://developer.safaricom.co.ke/MyApps:

| Credential | Description |
|---|---|
| `CONSUMER_KEY` | OAuth client ID |
| `CONSUMER_SECRET` | OAuth client secret |
| `SHORTCODE` | Your paybill or till number |
| `PASSKEY` | Lipa Na M-Pesa passkey (STK Push only) |

Store all in environment variables. Never hardcode.

## Authentication — OAuth token

M-Pesa uses short-lived Bearer tokens (expires in 3,599 seconds). Fetch and cache.

```python
import os
import base64
import time
import requests

_token_cache = {"token": None, "expires_at": 0}

def get_mpesa_token() -> str:
    """Return a valid M-Pesa OAuth token, refreshing if expired."""
    if time.time() < _token_cache["expires_at"] - 30:
        return _token_cache["token"]

    consumer_key    = os.environ["MPESA_CONSUMER_KEY"]
    consumer_secret = os.environ["MPESA_CONSUMER_SECRET"]
    sandbox         = os.environ.get("MPESA_SANDBOX", "true").lower() == "true"

    base_url = "https://sandbox.safaricom.co.ke" if sandbox else "https://api.safaricom.co.ke"
    url = f"{base_url}/oauth/v1/generate?grant_type=client_credentials"

    credentials = base64.b64encode(f"{consumer_key}:{consumer_secret}".encode()).decode()
    resp = requests.get(url, headers={"Authorization": f"Basic {credentials}"}, timeout=10)
    resp.raise_for_status()

    data = resp.json()
    _token_cache["token"] = data["access_token"]
    _token_cache["expires_at"] = time.time() + int(data["expires_in"])
    return _token_cache["token"]
```

## STK Push (Lipa Na M-Pesa Online)

Triggers a payment prompt on the customer's phone. This is the primary consumer-facing payment method.

```python
import base64
import datetime
import os
import requests

def stk_push(phone: str, amount: int, account_ref: str, description: str) -> dict:
    """
    Trigger STK Push payment prompt.

    phone: E.164 format, Kenya only e.g. "+254712345678" or "254712345678"
    amount: integer KES, minimum 1
    account_ref: shown to customer on their phone (max 12 chars)
    description: transaction description (max 13 chars)
    """
    sandbox   = os.environ.get("MPESA_SANDBOX", "true").lower() == "true"
    base_url  = "https://sandbox.safaricom.co.ke" if sandbox else "https://api.safaricom.co.ke"
    shortcode = os.environ["MPESA_SHORTCODE"]
    passkey   = os.environ["MPESA_PASSKEY"]

    # Timestamp: YYYYMMDDHHmmss
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")

    # Password = base64(shortcode + passkey + timestamp)
    password  = base64.b64encode(f"{shortcode}{passkey}{timestamp}".encode()).decode()

    # Normalize phone: strip leading + or 0, ensure 254 prefix
    phone = phone.lstrip("+").lstrip("0")
    if not phone.startswith("254"):
        phone = "254" + phone

    payload = {
        "BusinessShortCode": shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",  # or "CustomerBuyGoodsOnline" for till
        "Amount": amount,
        "PartyA": phone,               # customer phone
        "PartyB": shortcode,           # your paybill
        "PhoneNumber": phone,
        "CallBackURL": os.environ["MPESA_CALLBACK_URL"],
        "AccountReference": account_ref[:12],
        "TransactionDesc": description[:13],
    }

    token = get_mpesa_token()
    resp  = requests.post(
        f"{base_url}/mpesa/stkpush/v1/processrequest",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()
    # Success response contains:
    # { "MerchantRequestID": "...", "CheckoutRequestID": "...",
    #   "ResponseCode": "0", "ResponseDescription": "Success",
    #   "CustomerMessage": "Success. Request accepted for processing" }
```

## STK Push callback webhook (Flask)

M-Pesa POSTs the result to your `CallBackURL` after the customer completes or cancels.

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/mpesa/callback", methods=["POST"])
def mpesa_callback():
    data = request.json
    stk = data.get("Body", {}).get("stkCallback", {})

    merchant_request_id  = stk.get("MerchantRequestID")
    checkout_request_id  = stk.get("CheckoutRequestID")
    result_code          = stk.get("ResultCode")     # 0 = success
    result_desc          = stk.get("ResultDesc")

    if result_code == 0:
        # Payment successful — extract metadata
        items = stk.get("CallbackMetadata", {}).get("Item", [])
        meta  = {item["Name"]: item.get("Value") for item in items}

        amount       = meta.get("Amount")
        mpesa_code   = meta.get("MpesaReceiptNumber")  # e.g. "QKL8XXXXXX"
        phone        = meta.get("PhoneNumber")
        txn_date     = meta.get("TransactionDate")

        print(f"Payment: KES {amount} from {phone}, receipt {mpesa_code}")
        # → update your database, send confirmation SMS, etc.

    else:
        # Customer cancelled or timeout
        print(f"STK failed: {result_desc} (code {result_code})")

    # M-Pesa does not process your response body — always return 200
    return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"}), 200
```

## STK Push query (check status)

Poll if you did not receive the callback within 30 seconds.

```python
def stk_query(checkout_request_id: str) -> dict:
    sandbox   = os.environ.get("MPESA_SANDBOX", "true").lower() == "true"
    base_url  = "https://sandbox.safaricom.co.ke" if sandbox else "https://api.safaricom.co.ke"
    shortcode = os.environ["MPESA_SHORTCODE"]
    passkey   = os.environ["MPESA_PASSKEY"]

    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    password  = base64.b64encode(f"{shortcode}{passkey}{timestamp}".encode()).decode()

    payload = {
        "BusinessShortCode": shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "CheckoutRequestID": checkout_request_id,
    }
    token = get_mpesa_token()
    resp  = requests.post(
        f"{base_url}/mpesa/stkpushquery/v1/query",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()
    # ResultCode 0 = completed, 1032 = cancelled, 1037 = timeout
```

## C2B (Customer to Business) paybill payments

Register URLs to receive payment notifications when customers pay to your paybill manually.

```python
def c2b_register_urls() -> dict:
    """Register validation and confirmation URLs. Run once per environment."""
    sandbox  = os.environ.get("MPESA_SANDBOX", "true").lower() == "true"
    base_url = "https://sandbox.safaricom.co.ke" if sandbox else "https://api.safaricom.co.ke"

    payload = {
        "ShortCode":        os.environ["MPESA_SHORTCODE"],
        "ResponseType":     "Completed",   # or "Cancelled"
        "ConfirmationURL":  os.environ["MPESA_CONFIRM_URL"],
        "ValidationURL":    os.environ["MPESA_VALIDATE_URL"],
    }
    token = get_mpesa_token()
    resp  = requests.post(
        f"{base_url}/mpesa/c2b/v1/registerurl",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()
```

C2B confirmation webhook:

```python
@app.route("/mpesa/confirm", methods=["POST"])
def c2b_confirm():
    data = request.json
    txn_type      = data.get("TransactionType")   # "Pay Bill"
    txn_id        = data.get("TransID")           # receipt e.g. "QKL8XXXXXX"
    amount        = data.get("TransAmount")
    business_code = data.get("BusinessShortCode")
    bill_ref      = data.get("BillRefNumber")     # account number customer entered
    phone         = data.get("MSISDN")

    print(f"C2B: KES {amount} from {phone}, ref '{bill_ref}', id {txn_id}")
    return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"}), 200
```

## B2C (Business to Customer) — disbursements

Send money to a customer's M-Pesa wallet (payroll, refunds, prizes).

```python
def b2c_payment(phone: str, amount: int, occasion: str, remarks: str) -> dict:
    sandbox  = os.environ.get("MPESA_SANDBOX", "true").lower() == "true"
    base_url = "https://sandbox.safaricom.co.ke" if sandbox else "https://api.safaricom.co.ke"

    phone = phone.lstrip("+").lstrip("0")
    if not phone.startswith("254"):
        phone = "254" + phone

    payload = {
        "InitiatorName":      os.environ["MPESA_INITIATOR_NAME"],
        "SecurityCredential": os.environ["MPESA_SECURITY_CREDENTIAL"],  # encrypted
        "CommandID":          "BusinessPayment",   # or "SalaryPayment", "PromotionPayment"
        "Amount":             amount,
        "PartyA":             os.environ["MPESA_SHORTCODE"],
        "PartyB":             phone,
        "Remarks":            remarks[:100],
        "QueueTimeOutURL":    os.environ["MPESA_TIMEOUT_URL"],
        "ResultURL":          os.environ["MPESA_RESULT_URL"],
        "Occasion":           occasion[:100],
    }
    token = get_mpesa_token()
    resp  = requests.post(
        f"{base_url}/mpesa/b2c/v1/paymentrequest",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()
```

## Transaction status query

```python
def transaction_status(transaction_id: str) -> dict:
    sandbox  = os.environ.get("MPESA_SANDBOX", "true").lower() == "true"
    base_url = "https://sandbox.safaricom.co.ke" if sandbox else "https://api.safaricom.co.ke"

    payload = {
        "Initiator":          os.environ["MPESA_INITIATOR_NAME"],
        "SecurityCredential": os.environ["MPESA_SECURITY_CREDENTIAL"],
        "CommandID":          "TransactionStatusQuery",
        "TransactionID":      transaction_id,
        "PartyA":             os.environ["MPESA_SHORTCODE"],
        "IdentifierType":     "4",   # 1=MSISDN, 2=TillNumber, 4=Organization
        "ResultURL":          os.environ["MPESA_RESULT_URL"],
        "QueueTimeOutURL":    os.environ["MPESA_TIMEOUT_URL"],
        "Remarks":            "Status query",
        "Occasion":           "",
    }
    token = get_mpesa_token()
    resp  = requests.post(
        f"{base_url}/mpesa/transactionstatus/v1/query",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()
```

## Environment variables

```bash
# Required for all flows
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=174379            # sandbox test shortcode
MPESA_SANDBOX=true                # set false for production

# STK Push
MPESA_PASSKEY=...
MPESA_CALLBACK_URL=https://yourdomain.com/mpesa/callback

# C2B
MPESA_CONFIRM_URL=https://yourdomain.com/mpesa/confirm
MPESA_VALIDATE_URL=https://yourdomain.com/mpesa/validate

# B2C / Transaction Status
MPESA_INITIATOR_NAME=...
MPESA_SECURITY_CREDENTIAL=...    # base64-encoded encrypted password
MPESA_RESULT_URL=https://yourdomain.com/mpesa/result
MPESA_TIMEOUT_URL=https://yourdomain.com/mpesa/timeout
```

## Sandbox test credentials

The Daraja sandbox provides shared test credentials. Log in at https://developer.safaricom.co.ke/MyApps and create a sandbox app to get a dedicated test `CONSUMER_KEY` and `CONSUMER_SECRET`.

- **Test shortcode:** `174379`
- **Test passkey:** `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919`
- **Test phone (STK):** any Safaricom number format, e.g. `254708374149`

## Useful links

- Daraja portal: https://developer.safaricom.co.ke
- API reference: https://developer.safaricom.co.ke/APIs
- python-daraja: https://github.com/WilliamOtieno/python-daraja
- M-Pesa sandbox simulator: https://developer.safaricom.co.ke/test_credentials
