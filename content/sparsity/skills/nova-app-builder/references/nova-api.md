# Nova Platform — API Reference

> **Authoritative sources**:
> - API Docs (Swagger): https://sparsity.cloud/api/docs
> - Create-App Guide: https://sparsity.cloud/resources/nova-api/create-app-guide
> - OpenAPI spec: `GET https://sparsity.cloud/api/openapi.json`

## API Base URL

```
https://sparsity.cloud/api
```

## Authentication

`Authorization: Bearer <token>` — API key or JWT.

```bash
curl -sX POST https://sparsity.cloud/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"..."}'
# → {"access_token":"...","refresh_token":"..."}
```

---

## Full Deployment Pipeline

The complete lifecycle has **two phases**: off-chain setup and on-chain registration.

```
CREATE APP ──► NEW VERSION (BUILD) ──► DEPLOY THIS VERSION
                    │
                    ▼
             [on-chain flow]
         CREATE APP ON-CHAIN
                    │
                    ▼
         ENROLL BUILD VERSION ON-CHAIN
                    │
                    ▼
              DEPLOY INSTANCE
                    │
                    ▼
          GENERATE ZK PROOF
                    │
                    ▼
        REGISTER INSTANCE ON-CHAIN
```

> Your repo only needs `Dockerfile` + app code. The platform handles the build pipeline automatically.

---

## Phase 1: App + Build + Deployment

### 1. Create App

```
POST /api/apps
Authorization: Bearer <token>
```

Pass only **`advanced`** — the `enclaver` field has been removed from the API.
The platform uses `advanced` to configure the build pipeline automatically.

#### `advanced` field

| Field | Type | Required | Description |
|---|---|---|---|
| `directory` | string | Recommended | Build context dir in repo (default `"/"`) |
| `app_listening_port` | int | Recommended | App listen port — **locked at creation** |
| `dockerfile` | string | Optional | Dockerfile path relative to directory (default `"Dockerfile"`) |
| `egress_allow` | string[] | Recommended | Egress allowlist — see rules below |
| `egress_deny` | string[] | Optional | Egress denylist |
| `enable_decentralized_kms` | bool | Optional | Enable Nova KMS |
| `enable_persistent_storage` | bool | Recommended | Must be `true` when S3 enabled |
| `enable_s3_storage` | bool | Optional | Enable S3 storage |
| `enable_s3_kms_encryption` | bool | Optional | KMS-encrypt S3 data |
| `enable_ipfs_storage` | bool | Optional | Enable IPFS storage |
| `enable_walrus_storage` | bool | Optional | Enable Walrus storage |
| `enable_app_wallet` | bool | Optional | Enable TEE App Wallet |
| `enable_helios_rpc` | bool | Optional | Enable Helios light-client RPC |
| `storage_region` | string | Optional | S3 region (default `"us-west-1"`) |
| `s3_kms_key_scope` | string | Optional | KMS scope (`"object"`) |
| `s3_kms_aad_mode` | string | Optional | AAD mode (`"key"`) |
| `s3_kms_key_version` | string | Optional | Key version (`"v1"`) |
| `s3_accept_plaintext` | bool | Optional | Accept plaintext S3 fallback |
| `kms_app_id` | int | **Required if KMS** | On-chain KMS app ID |
| `nova_app_registry` | string | **Required if KMS** | Registry contract: `0x0f68E6e699f2E972998a1EcC000c7ce103E64cc8` |
| `helios_chains` | array | **Required if Helios** | Chain configs — locked at creation |

#### Egress allow/deny rules

> ⚠️ **`**` matches domain names only — it does NOT match IP addresses.**
> Direct IP connections will be blocked unless you explicitly add the IP or CIDR.

Pattern syntax:
| Pattern | Matches |
|---|---|
| `"**"` | All domain names (does NOT match IPs) |
| `"**.amazonaws.com"` | Any subdomain of amazonaws.com |
| `"news.ycombinator.com"` | Exact domain |
| `"0.0.0.0/0"` | All IPv4 addresses |
| `"::/0"` | All IPv6 addresses |
| `"169.254.169.254"` | Exact IP (IMDS — required for S3/KMS) |
| `"66.254.33.0/24"` | IPv4 CIDR |

**To allow everything** (domains + IPs):
```json
"egress_allow": ["**", "0.0.0.0/0", "::/0"]
```

**For AWS S3/KMS** (IMDS required):
```json
"egress_allow": ["**", "169.254.169.254"]
```

A request is allowed if it matches **at least one** allow pattern AND **no** deny pattern.
If `egress_allow` is empty, all egress is disabled.

Full reference: https://sparsity.cloud/resources/nova-api/create-app-guide

#### Feature dependency rules

```
kms_enabled = enable_decentralized_kms || enable_s3_kms_encryption || enable_app_wallet

enable_s3_storage=true   → enable_persistent_storage must be true
enable_s3_kms_encryption → enable_s3_storage + enable_decentralized_kms + enable_persistent_storage
enable_app_wallet        → enable_decentralized_kms

kms_enabled → enable_helios_rpc=true + kms_app_id + nova_app_registry
              + helios_chains must include base-sepolia (chain_id=84532, port=18545)

enable_helios_rpc + !kms_enabled → helios_chains must have ≥1 business chain
```

#### Helios chain port mapping (fixed, locked at creation)

| Chain | chain_id | kind | network | execution_rpc | local_rpc_port |
|---|---|---|---|---|---|
| Base Sepolia (Auth) | 84532 | opstack | base-sepolia | https://sepolia.base.org | **18545** |
| Ethereum Mainnet | 1 | ethereum | mainnet | https://ethereum-rpc.publicnode.com | **18546** |
| Ethereum Sepolia | 11155111 | ethereum | sepolia | https://rpc.sepolia.org | **18547** |
| Ethereum Holesky | 17000 | ethereum | holesky | https://ethereum-holesky-rpc.publicnode.com | **18548** |
| Base | 8453 | opstack | base | https://mainnet.base.org | **18549** |
| OP Mainnet | 10 | opstack | op-mainnet | https://mainnet.optimism.io | **18551** |
| Worldchain | 480 | opstack | worldchain | https://worldchain-mainnet.g.alchemy.com/public | **18552** |
| Zora | 7777777 | opstack | zora | https://rpc.zora.energy | **18553** |
| Unichain | 130 | opstack | unichain | https://mainnet.unichain.org | **18554** |

> ⚠️ These port numbers are canonical. Always use the mapping above — do not invent ports.

#### Full example (all features enabled)

```json
{
  "name": "my-app",
  "description": "My Nova app",
  "repo_url": "https://github.com/your-org/your-repo",
  "metadata_uri": "",
  "app_contract_addr": "",
  "advanced": {
    "directory": "/",
    "app_listening_port": 8080,
    "dockerfile": "Dockerfile",
    "egress_allow": ["**", "0.0.0.0/0", "::/0"],
    "egress_deny": [],
    "enable_decentralized_kms": true,
    "enable_persistent_storage": true,
    "enable_s3_storage": true,
    "enable_s3_kms_encryption": true,
    "enable_ipfs_storage": false,
    "enable_walrus_storage": false,
    "enable_app_wallet": true,
    "enable_helios_rpc": true,
    "storage_region": "us-west-1",
    "s3_kms_key_scope": "object",
    "s3_kms_aad_mode": "key",
    "s3_kms_key_version": "v1",
    "s3_accept_plaintext": false,
    "kms_app_id": 49,
    "nova_app_registry": "0x0f68E6e699f2E972998a1EcC000c7ce103E64cc8",
    "helios_chains": [
      {"chain_id":"84532","kind":"opstack","network":"base-sepolia","execution_rpc":"https://sepolia.base.org","local_rpc_port":18545},
      {"chain_id":"1","kind":"ethereum","network":"mainnet","execution_rpc":"https://ethereum-rpc.publicnode.com","local_rpc_port":18546},
      {"chain_id":"10","kind":"opstack","network":"op-mainnet","execution_rpc":"https://mainnet.optimism.io","local_rpc_port":18551}
    ]
  }
}
```

Response: `{ "id": 42, "sqid": "abc123", ... }` — use `sqid` in all subsequent calls.

---

### 2. New Version (Build)

> In portal: **Versions → + New Version**. Repo URL comes from the app record (set at creation) — not repeated here.

```
POST /api/apps/{app_sqid}/builds
```

```json
{ "git_ref": "main", "version": "1.0.0" }
```

Poll: `GET /api/builds/{build_id}/status`
Status: `pending → building → success | failed`

Response includes `id` (build_id), `pcr0/pcr1/pcr2` (after success).

---

### 3. Deploy this Version

> In portal: **Versions → [select successful version] → Deploy this version**. Choose region and tier in the modal. No environment-variable input section in the deploy UI.

```
POST /api/apps/{app_sqid}/deployments
```

```json
{
  "build_id": 123,
  "region": "ap-south-1",
  "tier": "standard",
  "app_contract_addr": "",
  "advanced": {}
}
```

**`region`** — valid values (default: `ap-south-1`):
| Value | Location |
|---|---|
| `ap-south-1` | Asia Pacific (default) |
| `us-east-1` | US East |
| `us-west-1` | US West |
| `eu-west-1` | Europe |

**`tier`** — `"standard"` (2 vCPU, 5 GiB) or `"performance"` (6 vCPU, 13 GiB). Default: `standard`.

`app_contract_addr` and `advanced` are optional.

Poll: `GET /api/deployments/{deployment_id}/status`

---

### 4. Status Polling Endpoints

Use these dedicated endpoints to poll each stage — no need to parse nested objects.

#### Build status (includes enrollment state)
```
GET /api/builds/{build_id}/status
```
| Field | Description |
|---|---|
| `status` | `pending` / `building` / `success` / `failed` |
| `github_run_id` | GitHub Actions run link |
| `error_message` | Error detail if failed |
| `is_enrolled` | `true` once enrolled on-chain |
| `onchain_version_id` | Set after enrollment |
| `onchain_version_status` | On-chain version status |
| `image_uri` | Built Docker image URI |
| `completed_at` | Build completion timestamp |

#### Deployment status (includes proof + on-chain instance state)
```
GET /api/deployments/{deployment_id}/status
```
| Field | Description |
|---|---|
| `deployment_state` | Deployment lifecycle state |
| `deployment_message` | Human-readable status |
| `remaining_seconds` | Billing time remaining |
| `build_is_enrolled` | Whether build version is enrolled on-chain |
| `onchain_version_id` | Enrolled version ID |
| `proof_status` | ZK proof status (`pending`/`proving`/`proved`/`failed`) |
| `proof_succinct_uri` | Proof URI once proved |
| `onchain_instance_id` | Set after on-chain registration |
| `onchain_instance_status` | On-chain instance status |
| `ec2_enclave_state` | Raw AWS Nitro Enclave state |

#### ZK proof status
```
GET /api/zkproof/status/{deployment_id}
GET /api/zkproof/deployments/{deployment_id}/status   ← alias, same response
```
| Field | Description |
|---|---|
| `proof_status` | `pending` / `proving` / `proved` / `failed` |
| `proof_succinct_uri` | Proof URI |
| `proof_s3_uri` | S3 proof URI |
| `registry_tx_hash` | On-chain registration tx hash |

#### Unified app status (single endpoint for entire lifecycle)
```
GET /api/apps/{app_sqid}/status
```
Returns everything in one call:

| Field | Description |
|---|---|
| `latest_build_id` | Latest build ID |
| `latest_build_status` | Current build status |
| `latest_build_version` | Build semantic version |
| `latest_build_github_run_id` | GitHub Actions run link |
| `latest_build_error_message` | Build error if any |
| `latest_onchain_version_id` | Enrolled version ID |
| `latest_onchain_version_status` | On-chain version status |
| `latest_deployment_id` | Latest deployment ID |
| `latest_deployment_state` | Deployment state |
| `latest_deployment_message` | Deployment message |
| `latest_proof_status` | ZK proof status |
| `latest_proof_succinct_uri` | Proof URI (after proved) |
| `latest_proof_s3_uri` | Proof S3 URI |
| `latest_onchain_instance_id` | Instance ID after registration |
| `latest_onchain_instance_status` | On-chain instance status |
| `onchain_app_id` | App on-chain ID |
| `onchain_app_status` | App on-chain status |

---

## Phase 2: On-Chain Registration

### 5. Create App On-Chain

Registers the app in the Nova App Registry contract on Base Sepolia.

```
POST /api/apps/{app_sqid}/create-onchain
```

No body. Response: `{ "tx_hash": "0x...", "onchain_app_id": 1 }`

Poll result: `GET /api/apps/{app_sqid}/status` → check `onchain_app_id` is set.

---

### 6. Enroll Build Version On-Chain

Enrolls the EIF's PCR measurements into the on-chain registry — the trusted code fingerprint.

```
POST /api/apps/{app_sqid}/builds/{build_id}/enroll
```

No body. Response: `{ "tx_hash": "0x...", "version_id": 1 }`

Poll result: `GET /api/builds/{build_id}/status` → check `is_enrolled = true` and `onchain_version_id` is set.

List enrolled versions: `GET /api/apps/{app_sqid}/versions`

---

### 7. Generate ZK Proof

Requests ZK proof for a running deployment. The zkp-registration-service picks it up asynchronously.

```
POST /api/zkproof/generate
{ "deployment_id": 456 }
```

Poll: `GET /api/zkproof/status/{deployment_id}` (or alias `GET /api/zkproof/deployments/{deployment_id}/status`)

Alternatively poll via deployment: `GET /api/deployments/{deployment_id}/status` → `proof_status` field.

`proof_status`: `pending → proving → proved | failed`

---

### 8. Register Instance On-Chain

After `proof_status = "proved"`, manually register the instance on-chain.

> ⚠️ **Auto-registration has been removed.** You must call this endpoint explicitly.

```
POST /api/apps/{app_sqid}/instance/register
```

No body required (deployment_id resolved from app's latest deployment).

Poll result: `GET /api/deployments/{deployment_id}/status` → check `onchain_instance_id` is set and `onchain_instance_status` is active.

Or use unified view: `GET /api/apps/{app_sqid}/status` → `latest_onchain_instance_id`.

> Legacy alias (still available): `POST /api/zkproof/onchain/register` with `{ "deployment_id": 456 }`

---

## Deployment Actions

```
POST /api/deployments/{deployment_id}/action
{ "action": "start" | "stop" | "delete" }
```

---

## Instance Management

```
POST /api/apps/{app_sqid}/instance/register     # Manual on-chain registration (auto removed)
POST /api/apps/{app_sqid}/instance/deactivate   # Deactivate instance on-chain
GET  /api/apps/{app_sqid}/instance/sync-status  # Sync instance status from chain
POST /api/apps/{app_sqid}/sync-onchain          # Sync entire app state from on-chain registry
POST /api/apps/{app_sqid}/onchain-status        # Activate/Deactivate app on-chain
```

---

## Portal Helper Endpoints

These are used by the portal UI to pre-fill app creation form from the repo's `enclaver.yaml`. Not needed for direct API usage.

```
POST /api/apps/clone-repo
{ "repo_url": "https://github.com/...", "depth": 2 }
→ { "directories": [...], "repo_path": "..." }

POST /api/apps/get-enclaver-config
{ "repo_url": "https://github.com/...", "directory": "/" }
→ { "app_listening_port": 8000, "directory": "/" }
```

> The `get-enclaver-config` endpoint only extracts `app_listening_port` from `enclaver.yaml` — this is how the portal auto-fills the port field when you provide a repo URL. Everything else is configured via `advanced`.

---

## Build Management

```
DELETE /api/apps/{app_sqid}/builds/{build_id}               # Delete a build
POST   /api/apps/{app_sqid}/builds/{build_id}/enroll        # Enroll version on-chain
POST   /api/apps/{app_sqid}/builds/{build_id}/sync          # Sync build status
POST   /api/apps/{app_sqid}/builds/{build_id}/retry         # Retry a failed build
GET    /api/apps/{app_sqid}/builds                          # List all builds
GET    /api/apps/{app_sqid}/builds/{build_id}               # Get single build
PATCH  /api/apps/{app_sqid}                                 # Update app metadata
```

---

## App Detail & Logs

```
GET /api/apps/{app_sqid}/detail
```
Returns `app`, `deployments[]`, `logs[]`. The `app.hostname` field has the live URL.

---

## Paid Deployment

Create a paid deployment — requires a `Payment-Signature` header in addition to `Authorization: Bearer`.

```
POST /api/apps/{app_sqid}/deployments/paid
Payment-Signature: <signature>
```

Body is identical to the standard `POST /api/apps/{app_sqid}/deployments` request.

---

## Public App Explorer (No Auth Required)

These endpoints are public — no `Authorization` header needed. Used by the App Explorer UI and for on-chain verifier integrations.

```
GET /api/apps/public/by-tee-wallet/{tee_wallet_address}
```
Look up an app by its TEE wallet address (the enclave's Ethereum address returned by Odyn `/v1/eth/address`). Returns the app's public info.

```
GET /api/apps/public/id/{onchain_app_id}
```
Look up an app by its on-chain app ID. Returns app info regardless of enclave state (running, stopped, or deleted). If multiple enclaves exist for the same ID, returns the latest one.

```
GET /api/apps/public/batch?onchain_app_ids=1,2,3
```
Batch fetch by a comma-separated list of on-chain app IDs. Returns `PublicAppBatchResponse`.

---

## Auth Management

### Wallet Login (SIWE)

```
POST /api/auth/wallet-login/nonce
```
Request a nonce for Sign-In with Ethereum (SIWE). Body: `{ "address": "0x..." }` (optional). Returns `{ "nonce": "..." }`.

```
POST /api/auth/wallet-login
```
Authenticate via SIWE signature. Body: `{ "message": "...", "signature": "0x..." }`. Returns JWT tokens.

### API Key Management

```
GET  /api/auth/api-keys                # List API keys (last_used_at is best-effort)
POST /api/auth/api-keys                # Create a new API key
DELETE /api/auth/api-keys/{api_key_id} # Revoke an API key (204 No Content)
```

### Profile

```
GET /api/auth/profile   # Get current user's profile
PUT /api/auth/profile   # Update editable profile fields
```

### Password & Email Verification

```
POST /api/auth/change-password        # Change password (requires old password)
POST /api/auth/send-verification      # Send verification code to email (code NOT in response)
POST /api/auth/confirm-verification   # Confirm code: { "code": "123456" }
```

### Token Refresh

```
POST /api/auth/refresh
{ "refresh_token": "..." }
```
Returns new `access_token` AND new `refresh_token` (sliding-window rotation).

---

## Blockchain Utilities

```
GET /api/blockchain/registry-contract      # Nova App Registry contract address
GET /api/blockchain/address/{address}      # On-chain address info + explorer URL
GET /api/blockchain/transaction/{tx_hash}  # Tx info + explorer URL
```

---

## Standard App Endpoints (your enclave serves these)

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Health check |
| `/.well-known/attestation` | **POST** | Raw CBOR binary attestation (Nitro attestation document) |
| Any `/api/*` | any | Your business logic |

> See https://sparsity.cloud/explore/52 for attestation verification examples.
