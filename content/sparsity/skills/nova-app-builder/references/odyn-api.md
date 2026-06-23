# Odyn Internal API — Quick Reference

Odyn is the enclave supervisor (PID 1) inside every AWS Nitro Enclave built by Enclaver.
It provides signing, attestation, encryption, storage, and KMS via an internal HTTP server.

## API Ports

Ports are fixed by the platform (configured via `advanced` at app creation):

```
Primary API:   http://localhost:18000   (full access)
Auxiliary API: http://localhost:18001   (restricted subset)
```

**Inside the enclave**: `http://localhost:18000`
**Local dev mock**: `http://odyn.sparsity.cloud:18000` (set `IN_ENCLAVE=false`)

```python
import os
IN_ENCLAVE = os.getenv("IN_ENCLAVE", "false").lower() == "true"
ODYN_BASE = "http://localhost:18000" if IN_ENCLAVE else "http://odyn.sparsity.cloud:18000"
```

> **Odyn SDK**: Use the `Odyn` class from [echo-vault/enclave/odyn.py](https://github.com/sparsity-xyz/sparsity-nova-examples/blob/main/echo-vault/enclave/odyn.py) instead of raw HTTP calls. Copy it into your project as-is. Note: the SDK uses `requests` (not `httpx`) for Odyn calls — this is fine since Odyn is localhost. Use `httpx` only for external outbound calls.

---

## Identity

**`GET /v1/eth/address`**
```json
{ "address": "0x742d35...", "public_key": "0x04..." }
```

---

## Signing

**`POST /v1/eth/sign`** — EIP-191 personal_sign
```json
// Request
{ "message": "hello world", "include_attestation": false }

// Response
{ "signature": "0x...", "address": "0x...", "attestation": null }
```

**`POST /v1/eth/sign-tx`** — Sign Ethereum transaction

Option 1: Structured EIP-1559:
```json
{
  "include_attestation": false,
  "payload": {
    "kind": "structured",
    "chain_id": "0x1",
    "nonce": "0x0",
    "max_priority_fee_per_gas": "0x3b9aca00",
    "max_fee_per_gas": "0x77359400",
    "gas_limit": "0x5208",
    "to": "0x742d35...",
    "value": "0xde0b6b3a7640000",
    "data": "0x",
    "access_list": []
  }
}
```

Option 2: Raw RLP:
```json
{ "include_attestation": false, "payload": { "kind": "raw_rlp", "raw_payload": "0x..." } }
```

Response:
```json
{ "raw_transaction": "0x02...", "transaction_hash": "0x...", "signature": "0x...", "address": "0x...", "attestation": null }
```

---

## Randomness

**`GET /v1/random`** — NSM-seeded entropy (32 bytes)
```json
{ "random_bytes": "0x..." }   // hex-encoded (no base64)
```

Use instead of `os.urandom()` inside the enclave.

---

## Attestation

**`POST /v1/attestation`** — Returns binary CBOR (Content-Type: application/cbor)
```json
{
  "nonce": "base64_encoded_nonce",        // optional
  "public_key": "PEM_encoded_public_key", // optional (Primary API only)
  "user_data": "base64_encoded_data"      // optional
}
```

---

## Encryption (ECDH P-384 + AES-256-GCM)

**`GET /v1/encryption/public_key`**
```json
{
  "public_key_der": "0x3076...",   // hex-encoded DER/SPKI
  "public_key_pem": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
}
```

**`POST /v1/encryption/encrypt`** — Encrypt data for a client
```json
// Request
{ "plaintext": "string to encrypt", "client_public_key": "0x..." }  // hex-encoded DER

// Response (note: NO 0x prefix on hex values)
{ "encrypted_data": "a1b2c3...", "enclave_public_key": "3076...", "nonce": "d4e5f6..." }
```

**`POST /v1/encryption/decrypt`** — Decrypt data from a client
```json
// Request (all hex-encoded)
{
  "nonce": "0x...",               // exactly 12 bytes hex
  "client_public_key": "0x...",   // hex-encoded DER public key
  "encrypted_data": "0x..."       // hex-encoded ciphertext with auth tag
}

// Response
{ "plaintext": "decrypted string" }
```

---

## S3 Storage (persistent, app-isolated)

Requires `enable_s3_storage: true` in `advanced` when creating the app. Uses POST for all operations.

**`POST /v1/s3/get`**
```json
// Request
{ "key": "relative/path/to/object" }
// Response
{ "value": "base64_encoded_data", "content_type": "text/plain" }
```

**`POST /v1/s3/put`**
```json
// Request
{ "key": "relative/path/to/object", "value": "base64_encoded_data", "content_type": "text/plain" }
// Response
{ "success": true }
```

**`POST /v1/s3/list`**
```json
// Request
{ "prefix": "my/folder/" }
// Response
{ "keys": ["my/folder/file1.json", ...] }
```

**`POST /v1/s3/delete`**
```json
// Request
{ "key": "relative/path/to/object" }
// Response
{ "success": true }
```

**Required `advanced` fields for S3** (set at app creation):
```json
{
  "enable_s3_storage": true,
  "enable_s3_kms_encryption": false,
  "egress_allow": ["169.254.169.254", "s3.us-east-1.amazonaws.com"]
}
```

State hash pattern (anchor S3 state on-chain):
```python
from eth_utils import keccak
import json, base64
state = base64.b64decode(odyn_s3_get_response["value"])
state_hash = keccak(state)
# call updateStateHash(state_hash) on your contract
```

---

## KMS Integration (`/v1/kms/*`)

Requires `kms_integration.enabled=true` and (`kms_app_id` + `nova_app_registry` + `helios_rpc.enabled=true`) for registry-backed mode.

**`POST /v1/kms/derive`** — Derive key material
```json
// Request
{ "path": "app/session/alpha", "context": "optional-context", "length": 32 }
// Response
{ "key": "base64_encoded_key_bytes" }
```

**`POST /v1/kms/kv/get`**
```json
// Request
{ "key": "config/service_token" }
// Response (value is base64-encoded)
{ "found": true, "value": "base64_encoded_value" }
// or: { "found": false, "value": null }
```

**`POST /v1/kms/kv/put`**
```json
// Request (value must be base64-encoded)
{ "key": "config/service_token", "value": "base64_encoded_value", "ttl_ms": 60000 }
// Response
{ "success": true }
```

**`POST /v1/kms/kv/delete`**
```json
{ "key": "config/service_token" }
// Response: { "success": true }
```

---

## App Wallet (`/v1/app-wallet/*`)

Also requires `kms_integration.enabled=true` and `use_app_wallet: true`.
Local mode: `kms_app_id` / `nova_app_registry` can be omitted.
Instances sharing the same KMS app namespace share one app-wallet.

**`GET /v1/app-wallet/address`**
```json
{ "address": "0x...", "app_id": 0, "instance_wallet": "0x..." }
```

**`POST /v1/app-wallet/sign`** — EIP-191 message sign
```json
// Request
{ "message": "hello app wallet" }
// Response
{ "signature": "0x...", "address": "0x...", "app_id": 0 }
```

**`POST /v1/app-wallet/sign-tx`** — Same body as `/v1/eth/sign-tx`
```json
// Response
{ "raw_transaction": "0x02...", "transaction_hash": "0x...", "signature": "0x...", "address": "0x...", "app_id": 0 }
```

> Note: `include_attestation` is accepted but silently ignored for app-wallet sign-tx.

---

## Auxiliary API (restricted, for sidecars)

Port defaults to `api.listen_port + 1`. Only exposes:
- `GET /v1/eth/address`
- `POST /v1/attestation` (strips `public_key`; forwards `user_data`)
- `GET /v1/encryption/public_key`

All other endpoints return 404 on the Aux API.

---

## HTTP Egress (inside the enclave)

Odyn auto-sets `HTTP_PROXY` / `HTTPS_PROXY` environment variables. Use `httpx` (proxy-aware):

```python
import httpx
resp = httpx.get("https://api.example.com/data", timeout=15)
```

⚠️ **Do NOT use `requests` or `urllib`** for outbound calls in production — they may bypass the egress proxy.
Add allowed hosts to `egress_allow` in `advanced` when creating the app.

---

## Python Wrapper Reference (from nova-app-template)

See `enclave/kms_client.py` in [nova-app-template](https://github.com/sparsity-xyz/nova-app-template) for a ready-made `NovaKmsClient` class wrapping all `/v1/kms/*` and `/v1/app-wallet/*` endpoints.

```python
from kms_client import NovaKmsClient

kms = NovaKmsClient(endpoint="http://127.0.0.1:18000")

# KMS
key = kms.derive("app/session/alpha")["key"]         # base64
kms.kv_put("mykey", base64.b64encode(b"secret").decode())
val = base64.b64decode(kms.kv_get("mykey")["value"])

# App Wallet
addr = kms.app_wallet_address()["address"]
sig  = kms.app_wallet_sign("hello")["signature"]
```
