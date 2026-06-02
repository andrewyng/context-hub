---
name: rest-api
description: "ONDC (Open Network for Digital Commerce) - India's open e-commerce protocol built on Beckn for buyer/seller node integration"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "india,ondc,beckn,e-commerce,digital-commerce,open-protocol,retail,logistics"
---

# ONDC (Open Network for Digital Commerce) REST API

## Golden Rule

ONDC is an **open protocol**, not a traditional API. It is built on top of the **Beckn Protocol** and uses an asynchronous request-callback model over HTTP POST with JSON payloads. Every participant (buyer app or seller app) is a **Network Participant (NP)** that must be registered in the ONDC Registry. All API calls are **digitally signed** using Ed25519 keys. The protocol flow is: your app sends a request (e.g., `/search`), receives an immediate ACK, and then the counterparty calls back to your endpoint (e.g., `/on_search`) with the actual response. You must host publicly accessible callback endpoints. ONDC is **not a SaaS API** you simply call -- you become a node in a decentralized network.

## Installation

```bash
pip install httpx cryptography PyNaCl
```

- `httpx` for async HTTP
- `cryptography` for X25519 key exchange
- `PyNaCl` for Ed25519 digital signatures

## Base URL

ONDC operates across three environments. Your app communicates with the **Gateway** (for search broadcast) and directly with other **Network Participants** (for select/init/confirm).

### Gateway URLs

| Environment | Gateway URL |
|-------------|-------------|
| Staging | `https://staging.gateway.proteantech.in` |
| Pre-production | `https://preprod.gateway.ondc.org` |
| Production | `https://prod.gateway.ondc.org` |

### Registry URLs

| Environment | Registry URL |
|-------------|--------------|
| Staging | `https://staging.registry.ondc.org` |
| Pre-production | `https://preprod.registry.ondc.org` |
| Production | `https://prod.registry.ondc.org` |

### Reference Apps (White-label)

| App | Staging URL |
|-----|-------------|
| Buyer App | `https://ref-app-buyer-staging-v2.ondc.org` |
| Seller App | `https://ref-app-seller-staging-v2.ondc.org` |
| Logistics App | `https://ref-logistics-app-stage.ondc.org` |

### Your App's Base URL

You must host your own endpoints (e.g., `https://your-buyer-app.com`) and register them with the ONDC Registry. The registry tells other NPs where to send callbacks.

## Authentication

ONDC uses **Ed25519 digital signatures** for authentication. Every request and callback must be signed.

### Signature Format

The `Authorization` header follows this format:

```
Signature keyId="{subscriber_id}|{unique_key_id}|ed25519",algorithm="ed25519",created="1606970629",expires="1607030629",headers="(created) (expires) digest",signature="Base64(signed_string)"
```

### Generating Signatures

```python
import base64
import hashlib
import time
import json
from nacl.signing import SigningKey


def create_signing_string(
    body: dict, created: int, expires: int,
) -> str:
    """Create the string to be signed per Beckn auth spec."""
    body_bytes = json.dumps(body, separators=(",", ":")).encode()
    digest = f"BLAKE-512={base64.b64encode(hashlib.blake2b(body_bytes).digest()).decode()}"
    signing_string = f"(created): {created}\n(expires): {expires}\ndigest: {digest}"
    return signing_string


def sign_request(
    body: dict,
    private_key_b64: str,
    subscriber_id: str,
    unique_key_id: str,
) -> str:
    """Sign a request body and return the Authorization header value."""
    created = int(time.time())
    expires = created + 3600  # 1 hour validity

    signing_string = create_signing_string(body, created, expires)

    # Ed25519 sign
    private_key_bytes = base64.b64decode(private_key_b64)
    signing_key = SigningKey(private_key_bytes)
    signed = signing_key.sign(signing_string.encode())
    signature = base64.b64encode(signed.signature).decode()

    auth_header = (
        f'Signature keyId="{subscriber_id}|{unique_key_id}|ed25519",'
        f'algorithm="ed25519",'
        f'created="{created}",'
        f'expires="{expires}",'
        f'headers="(created) (expires) digest",'
        f'signature="{signature}"'
    )
    return auth_header
```

### Verifying Incoming Signatures

```python
from nacl.signing import VerifyKey


async def verify_signature(
    body: dict,
    auth_header: str,
    sender_public_key_b64: str,
) -> bool:
    """Verify an incoming request's digital signature."""
    # Parse auth_header to extract created, expires, signature
    # (parsing logic omitted for brevity -- extract from header string)
    parts = dict(
        item.split("=", 1) for item in auth_header.replace("Signature ", "").split(",")
    )
    created = int(parts["created"].strip('"'))
    expires = int(parts["expires"].strip('"'))
    signature_b64 = parts["signature"].strip('"')

    signing_string = create_signing_string(body, created, expires)

    public_key_bytes = base64.b64decode(sender_public_key_b64)
    verify_key = VerifyKey(public_key_bytes)

    try:
        verify_key.verify(
            signing_string.encode(),
            base64.b64decode(signature_b64),
        )
        return True
    except Exception:
        return False
```

### Gateway Forwarding

When a Gateway forwards a search request, it adds its own signature in the `X-Gateway-Authorization` header using the same format.

## Rate Limiting

ONDC does not publish explicit rate limits. However, the Gateway and individual NPs may impose their own limits. The ONDC network is designed for real commerce traffic. Implement:

- Exponential backoff on NACK responses
- Respect `ttl` (time-to-live) values in context objects
- Do not flood the gateway with repeated identical searches

## Methods

All ONDC API calls use **HTTP POST** with JSON bodies. Every request contains a `context` object and a `message` object.

### Context Object (required in every call)

```python
import uuid
from datetime import datetime


def build_context(
    action: str,
    domain: str = "ONDC:RET10",  # Grocery retail
    city: str = "std:080",        # Bangalore
    bap_id: str = "your-buyer-app.com",
    bap_uri: str = "https://your-buyer-app.com",
    bpp_id: str | None = None,
    bpp_uri: str | None = None,
    transaction_id: str | None = None,
    message_id: str | None = None,
) -> dict:
    """Build the ONDC context object."""
    ctx = {
        "domain": domain,
        "action": action,
        "core_version": "1.2.0",
        "bap_id": bap_id,
        "bap_uri": bap_uri,
        "transaction_id": transaction_id or str(uuid.uuid4()),
        "message_id": message_id or str(uuid.uuid4()),
        "city": city,
        "country": "IND",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "ttl": "PT30S",  # 30-second TTL
    }
    if bpp_id:
        ctx["bpp_id"] = bpp_id
        ctx["bpp_uri"] = bpp_uri
    return ctx
```

### Search (Buyer App -> Gateway)

`POST /search` to the Gateway URL

Broadcasts a search query to all seller apps in the network.

```python
GATEWAY_URL = "https://staging.gateway.proteantech.in"


async def search_products(query: str, category: str = "Grocery") -> dict:
    """Search for products on the ONDC network."""
    body = {
        "context": build_context(action="search"),
        "message": {
            "intent": {
                "item": {
                    "descriptor": {
                        "name": query,
                    }
                },
                "fulfillment": {
                    "type": "Delivery",
                },
                "payment": {
                    "@ondc/org/buyer_app_finder_fee_type": "percent",
                    "@ondc/org/buyer_app_finder_fee_amount": "3",
                },
            }
        },
    }

    auth_header = sign_request(
        body, PRIVATE_KEY_B64, SUBSCRIBER_ID, UNIQUE_KEY_ID,
    )

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{GATEWAY_URL}/search",
            json=body,
            headers={
                "Content-Type": "application/json",
                "Authorization": auth_header,
            },
        )
        resp.raise_for_status()
        return resp.json()
        # Returns: { "message": { "ack": { "status": "ACK" } } }
        # Actual results arrive via callback to your /on_search endpoint
```

### Select (Buyer App -> Seller App)

`POST /select` directly to the seller's `bpp_uri`

After receiving search results, select specific items from a seller.

```python
async def select_items(
    bpp_uri: str, bpp_id: str, provider_id: str, items: list[dict],
    transaction_id: str,
) -> dict:
    """Select items from a specific seller."""
    body = {
        "context": build_context(
            action="select",
            bpp_id=bpp_id,
            bpp_uri=bpp_uri,
            transaction_id=transaction_id,
        ),
        "message": {
            "order": {
                "provider": {"id": provider_id},
                "items": items,  # [{"id": "item-1", "quantity": {"count": 2}}]
            }
        },
    }

    auth_header = sign_request(
        body, PRIVATE_KEY_B64, SUBSCRIBER_ID, UNIQUE_KEY_ID,
    )

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{bpp_uri}/select",
            json=body,
            headers={
                "Content-Type": "application/json",
                "Authorization": auth_header,
            },
        )
        resp.raise_for_status()
        return resp.json()
        # ACK response; actual quote arrives at /on_select
```

### Init / Confirm (and other actions)

`POST /init` and `POST /confirm` to the seller's `bpp_uri` follow the same pattern as `/select` -- build context with the appropriate `action`, wrap the `order` object in `message`, sign, and POST directly to `bpp_uri`. Init returns payment details via `/on_init`; confirm returns order confirmation via `/on_confirm`.

Additional actions (`status`, `track`, `cancel`, `update`, `rating`, `support`) all follow the same signed POST pattern. Each has a corresponding `on_{action}` callback endpoint.

### Registry Lookup

`POST /lookup` to the Registry URL

Look up a Network Participant's details (public key, endpoints).

```python
REGISTRY_URL = "https://staging.registry.ondc.org"


async def registry_lookup(subscriber_id: str, domain: str = "ONDC:RET10") -> dict:
    """Look up a subscriber in the ONDC registry."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{REGISTRY_URL}/lookup",
            json={
                "subscriber_id": subscriber_id,
                "domain": domain,
                "type": "sellerApp",  # or "buyerApp", "gateway"
            },
        )
        resp.raise_for_status()
        return resp.json()
        # Returns: signing_public_key, subscriber_url, valid_from, valid_until, etc.
```

### Hosting Callback Endpoints

As a buyer app, you must host POST endpoints at: `/on_search`, `/on_select`, `/on_init`, `/on_confirm`, `/on_status`, `/on_track`, `/on_cancel`, `/on_update`, `/on_rating`, `/on_support`. Each must: (1) verify the Authorization header signature, (2) process the response data, (3) return `{"message": {"ack": {"status": "ACK"}}}`.

## Error Handling

```python
async def safe_ondc_call(url: str, body: dict) -> dict:
    auth_header = sign_request(
        body, PRIVATE_KEY_B64, SUBSCRIBER_ID, UNIQUE_KEY_ID,
    )

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(
                url,
                json=body,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": auth_header,
                },
            )
            resp.raise_for_status()
            data = resp.json()

            # Check for NACK (negative acknowledgment)
            ack_status = data.get("message", {}).get("ack", {}).get("status")
            if ack_status == "NACK":
                error = data.get("error", {})
                raise ValueError(
                    f"ONDC NACK: {error.get('code')} - {error.get('message')}"
                )

            return data

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                print("Signature verification failed")
            elif e.response.status_code == 422:
                print("Schema validation error")
            raise
```

### ONDC Error Codes

| Code | Type | Description |
|------|------|-------------|
| 20000 | Invalid request | Schema validation failure |
| 20001 | Invalid request | Invalid signature |
| 20002 | Invalid request | Subscriber not found in registry |
| 20006 | Invalid request | Stale request (TTL expired) |
| 30000 | Provider error | Provider not found |
| 30001 | Provider error | Item not found |
| 40000 | Business error | Item out of stock |
| 40001 | Business error | Order not found |
| 40002 | Business error | Cancellation not possible |
| 50000 | Policy error | Action not applicable |

## Common Pitfalls

1. **This is a protocol, not a typical API** - You do not get synchronous responses. You send a request, get an ACK, and then the counterparty calls YOUR endpoint with the response. You must host publicly accessible callback endpoints.

2. **Every request must be signed** - All HTTP requests require Ed25519 digital signatures in the `Authorization` header. Unsigned or incorrectly signed requests are rejected.

3. **Registry onboarding is required** - Before you can transact, you must register your subscriber ID, public key, and callback URLs in the ONDC Registry. Staging allows self-registration; production requires ONDC approval.

4. **Transaction ID is the session** - A single transaction (from search to order completion) uses the same `transaction_id` across all calls. Each individual API call gets a unique `message_id`.

5. **Search goes through the Gateway** - The `/search` call is the ONLY one that goes through the ONDC Gateway (which broadcasts it to all seller apps). All subsequent calls (`/select`, `/init`, `/confirm`) go directly to the seller's `bpp_uri`.

6. **TTL matters** - The `ttl` field in the context defines how long the counterparty has to respond. If they miss the window, the request expires. Common values: `PT30S` (30 seconds) for search, `PT30S` for select.

7. **Specification version alignment** - ONDC specification version 1.2 is the current standard. Ensure your implementation matches the version expected by the network. Mismatches cause schema validation failures.

8. **City codes use STD format** - Cities are identified by STD codes (e.g., `std:080` for Bangalore, `std:011` for Delhi), not city names or PIN codes.

9. **Domain codes are specific** - Use the correct domain code: `ONDC:RET10` (grocery), `ONDC:RET11` (F&B), `ONDC:RET12` (fashion), `ONDC:RET13` (BPC), `ONDC:RET14` (electronics), `ONDC:RET15` (appliances), etc.

10. **Use the reference apps for testing** - ONDC provides white-label buyer and seller reference apps with staging environments. Start by running these before building custom implementations. GitHub: `github.com/ONDC-Official`.
