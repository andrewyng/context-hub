# M-Pesa Daraja — Error Codes & Webhook Patterns

## STK Push result codes

| ResultCode | Meaning | Action |
|---|---|---|
| 0 | Success | Process payment |
| 1 | Insufficient funds | Notify customer |
| 1001 | Unable to lock subscriber | Retry after 30s |
| 1019 | Transaction expired | Re-initiate STK |
| 1032 | Request cancelled by user | No retry |
| 1037 | DS timeout — customer unreachable | Retry or notify |
| 2001 | Wrong PIN entered | Notify customer |

## OAuth errors

**`400 Bad Request` — "Invalid Credentials"`**
- Consumer key/secret mismatch or copied with extra whitespace
- Fix: re-copy from Daraja portal, strip whitespace

**`403 Forbidden`**
- Requesting production endpoint with sandbox credentials or vice versa
- Fix: check `MPESA_SANDBOX` env var matches your credentials

## STK Push common issues

**Callback not received**
- Your `CallBackURL` must be publicly reachable (no localhost)
- Use ngrok for local dev: `ngrok http 5000`
- M-Pesa only calls HTTPS URLs in production
- Retry with `stk_query()` after 30 seconds

**`The initiator information is invalid`**
- Wrong shortcode/passkey combination
- In sandbox, use exactly `174379` and the test passkey

**Phone number format**
```python
# M-Pesa requires 12-digit format without + prefix
def normalize_phone(phone: str) -> str:
    phone = phone.strip().lstrip("+")
    if phone.startswith("0"):
        phone = "254" + phone[1:]
    elif not phone.startswith("254"):
        phone = "254" + phone
    return phone

# Test
assert normalize_phone("+254712345678") == "254712345678"
assert normalize_phone("0712345678")    == "254712345678"
assert normalize_phone("254712345678")  == "254712345678"
```

## Webhook idempotency

M-Pesa may deliver the same callback multiple times. Always implement idempotency:

```python
# Store processed transaction IDs
processed_receipts = set()  # use Redis or DB in production

@app.route("/mpesa/callback", methods=["POST"])
def mpesa_callback():
    data    = request.json
    stk     = data["Body"]["stkCallback"]
    rc      = stk["ResultCode"]

    if rc == 0:
        items   = {i["Name"]: i.get("Value") for i in stk["CallbackMetadata"]["Item"]}
        receipt = items["MpesaReceiptNumber"]

        if receipt in processed_receipts:
            return jsonify({"ResultCode": 0, "ResultDesc": "Duplicate"}), 200

        processed_receipts.add(receipt)
        # ... process payment

    return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"}), 200
```

## Rate limits

- OAuth token: 1 request per second
- STK Push: ~10 requests/second per shortcode
- B2C: queue-based, no strict limit but Safaricom reviews high-volume usage

## Testing flows without real money

In sandbox, all STK Push requests return success immediately. To simulate failure:
- Use amount `0` — returns an error
- Use a non-Safaricom number format — returns routing error

For load testing, the sandbox is shared infrastructure — don't hammer it.

## Production checklist

- [ ] Switch `MPESA_SANDBOX=false`
- [ ] Replace sandbox shortcode with live paybill/till
- [ ] Replace test passkey with live passkey from Daraja portal
- [ ] Callback URLs are HTTPS with valid SSL cert
- [ ] Webhook endpoints return 200 within 5 seconds
- [ ] Implement idempotency on all webhook handlers
- [ ] Store `MpesaReceiptNumber` as primary transaction identifier
- [ ] Log all raw callback payloads for reconciliation
