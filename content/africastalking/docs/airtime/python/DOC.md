---
name: airtime
description: "Africa's Talking Airtime API for programmatic airtime top-up across African mobile networks — used for incentives, agent payouts, and rural connectivity programs"
metadata:
  languages: "python"
  versions: "2.0.2"
  revision: 1
  updated-on: "2026-03-10"
  source: community
  tags: "africastalking,airtime,africa,kenya,nigeria,ghana,topup,incentives,mobile"
---
# Africa's Talking Airtime API — Python

Programmatically send airtime to any mobile number across 20+ African networks. Common use cases: farmer incentives, survey participant rewards, field agent payouts, NGO beneficiary support.

- **PyPI:** `africastalking` (v2.0.2)
- **Docs:** https://developers.africastalking.com/docs/airtime

## Setup

```python
import africastalking
import os

africastalking.initialize(
    username=os.environ["AT_USERNAME"],
    api_key=os.environ["AT_API_KEY"],
)
airtime = africastalking.Airtime
```

## Send airtime

```python
# Single recipient
response = airtime.send(
    phone_number="+254712345678",
    amount="KES 50",          # currency + amount as string
    recipient_is_optin=False, # True if recipient has opted into your service
)

# Response structure:
# {
#   "numSent": 1,
#   "totalAmount": "KES 50",
#   "totalDiscount": "KES 1",
#   "responses": [
#     {
#       "phoneNumber": "+254712345678",
#       "amount": "KES 50",
#       "status": "Success",
#       "requestId": "ATQid_abc123",
#       "errorMessage": "None"
#     }
#   ]
# }

for r in response["responses"]:
    if r["status"] != "Success":
        print(f"Failed: {r['phoneNumber']} — {r['errorMessage']}")
```

## Multi-recipient bulk send

```python
# Up to 1000 recipients per call
recipients = [
    {"phoneNumber": "+254712345678", "amount": "KES 50", "currencyCode": "KES"},
    {"phoneNumber": "+234812345678", "amount": "NGN 200", "currencyCode": "NGN"},
    {"phoneNumber": "+233241234567", "amount": "GHS 5",  "currencyCode": "GHS"},
]

response = airtime.send(recipients=recipients)

sent   = response["numSent"]
failed = [r for r in response["responses"] if r["status"] != "Success"]
print(f"Sent: {sent}, Failed: {len(failed)}")
```

## Currency codes by country

| Country | Code | Notes |
|---|---|---|
| Kenya | KES | Safaricom, Airtel, Telkom |
| Nigeria | NGN | MTN, Airtel, Glo, 9mobile |
| Ghana | GHS | MTN, Vodafone, AirtelTigo |
| Uganda | UGX | MTN, Airtel |
| Tanzania | TZS | Vodacom, Airtel, TIGO |
| Rwanda | RWF | MTN, Airtel |
| Ethiopia | ETB | Ethio Telecom |
| South Africa | ZAR | Vodacom, MTN, Cell C |

## NGO/incentive pattern — bulk field agents

```python
def pay_field_agents(agents: list[dict], amount_kes: int) -> dict:
    """
    agents: [{"phone": "+254...", "name": "...", "id": "..."}]
    Returns: {"success": [...], "failed": [...]}
    """
    recipients = [
        {
            "phoneNumber": a["phone"],
            "amount": str(amount_kes),
            "currencyCode": "KES",
        }
        for a in agents
    ]

    response = airtime.send(recipients=recipients)
    results  = {r["phoneNumber"]: r for r in response["responses"]}

    success, failed = [], []
    for agent in agents:
        r = results.get(agent["phone"], {})
        if r.get("status") == "Success":
            success.append({**agent, "requestId": r["requestId"]})
        else:
            failed.append({**agent, "error": r.get("errorMessage", "Unknown")})

    return {"success": success, "failed": failed}
```

## Error handling

```python
try:
    response = airtime.send(phone_number="+254712345678", amount="KES 10")
except Exception as e:
    # Covers: network errors, auth failures, malformed requests
    print(f"Airtime API error: {e}")
```

Common `errorMessage` values:
- `"None"` — success
- `"Recipient not on network"` — number not active on the specified network
- `"Insufficient balance"` — top up your Africa's Talking wallet
- `"Invalid phone number"` — not E.164 format or invalid country code

## Sandbox

In sandbox, no real airtime is sent. The response always returns `"Success"`.
Minimum amount is KES 10 in production; no minimum in sandbox.

## Useful links

- Pricing: https://africastalking.com/airtime
- Dashboard / top-up wallet: https://account.africastalking.com
- API reference: https://developers.africastalking.com/docs/airtime
