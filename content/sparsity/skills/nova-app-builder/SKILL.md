---
name: nova-app-builder
description: "Build and deploy Nova Platform apps (TEE apps on Sparsity Nova / sparsity.cloud). Covers the full lifecycle: scaffold, code, push to Git, create app, build, deploy, and verify running. Use when a user wants to create a Nova app, write enclave application code, build a Docker image, and deploy it to the Nova Platform to get a live running URL."
metadata:
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "nova,tee,enclave,nitro,sparsity,cloud,deployment,docker"
---

# Nova App Builder

Build and deploy Trusted Execution Environment (TEE) apps on [sparsity.cloud](https://sparsity.cloud). Apps run inside AWS Nitro Enclaves — cryptographically attested, tamper-proof execution environments.

## Prerequisites

Collect from user before starting:
- **Nova API key**: Sign up at sparsity.cloud → Account → API Keys
- **GitHub repo + PAT** (Contents read/write + Metadata read): Nova Platform builds from Git

## Quick Start — 4 Steps

### 1. Scaffold the project

```bash
python3 scripts/scaffold.py \
  --name <app-name> \
  --desc "<description>" \
  --port 8080 \
  --out ./
```

Generates `<app-name>/Dockerfile` + `enclave/main.py`. Or fork [nova-app-template](https://github.com/sparsity-xyz/nova-app-template) for full KMS/wallet/S3/frontend features.

### 2. Write app logic

Edit `enclave/main.py`. Call the Odyn Internal API (localhost:18000) for identity, signing, attestation, storage:

```python
import os, httpx
from fastapi import FastAPI

app = FastAPI()
IN_ENCLAVE = os.getenv("IN_ENCLAVE", "false").lower() == "true"
ODYN_BASE = "http://localhost:18000" if IN_ENCLAVE else "http://odyn.sparsity.cloud:18000"

@app.get("/api/hello")
def hello():
    r = httpx.get(f"{ODYN_BASE}/v1/eth/address", timeout=10)
    return {"message": "Hello from TEE!", "address": r.json()["address"]}

@app.post("/api/sign")
def sign(body: dict):
    r = httpx.post(f"{ODYN_BASE}/v1/eth/sign",
                   json={"message": body["message"]}, timeout=10)
    return r.json()
```

> Use `httpx` (not `requests`) for all **external** HTTP calls — it respects the egress proxy inside the enclave.
> `requests` is fine for Odyn calls (localhost).

### 3. Push to GitHub

```bash
git remote set-url origin https://oauth2:${GH_TOKEN}@github.com/<user>/<repo>.git
git add . && git commit -m "Initial Nova app" && git push origin main
```

### 4. Deploy via Nova Platform API

```bash
BASE="https://sparsity.cloud/api"
TOKEN="<your-nova-api-key>"
REPO="https://github.com/<user>/<repo>"
PORT=8080

# Step A: Create app
SQID=$(curl -sX POST "$BASE/apps" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\":\"my-app\",
    \"repo_url\":\"$REPO\",
    \"advanced\":{
      \"app_listening_port\":$PORT,
      \"egress_allow\":[\"**\"],
      \"enable_decentralized_kms\":false,
      \"enable_persistent_storage\":false,
      \"enable_s3_storage\":false,
      \"enable_app_wallet\":false,
      \"enable_helios_rpc\":false
    }
  }" | python3 -c "import sys,json; print(json.load(sys.stdin)['sqid'])")
echo "App sqid: $SQID"

# Step B: Trigger build
BUILD_ID=$(curl -sX POST "$BASE/apps/$SQID/builds" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"git_ref":"main","version":"1.0.0"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

# Step C: Poll build
while true; do
  STATUS=$(curl -s "$BASE/builds/$BUILD_ID/status" -H "Authorization: Bearer $TOKEN" \
    | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))")
  echo "Build: $STATUS"; [ "$STATUS" = "success" ] && break
  [ "$STATUS" = "failed" ] && echo "Build failed!" && exit 1; sleep 15
done

# Step D: Deploy
DEPLOY_ID=$(curl -sX POST "$BASE/apps/$SQID/deployments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"build_id\":$BUILD_ID,\"region\":\"ap-south-1\",\"tier\":\"standard\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

# Step E: Poll deployment
while true; do
  STATE=$(curl -s "$BASE/deployments/$DEPLOY_ID/status" -H "Authorization: Bearer $TOKEN" \
    | python3 -c "import sys,json; print(json.load(sys.stdin).get('deployment_state',''))")
  echo "State: $STATE"; [ "$STATE" = "running" ] && break
  [ "$STATE" = "failed" ] && echo "Deploy failed!" && exit 1; sleep 15
done

# Step F: Get URL
curl -s "$BASE/apps/$SQID/detail" -H "Authorization: Bearer $TOKEN" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('https://' + d['app']['hostname'])"
```

### 5. Verify

```bash
curl https://<hostname>/api/hello
# → {"message": "Hello from TEE!", "address": "0x..."}
```

## Key Facts

| Thing | Value |
|---|---|
| Platform API base | `https://sparsity.cloud/api` |
| Odyn Internal API | `http://localhost:18000` (inside enclave only) |
| Odyn mock (local dev) | `http://odyn.sparsity.cloud:18000` |
| Regions | `ap-south-1` (default), `us-east-1`, `us-west-1`, `eu-west-1` |
| Tiers | `standard` (2vCPU/5GiB), `performance` (6vCPU/13GiB) |
| App ID format | `sqid` (string like `abc123`) — use in all URL paths |

- **`advanced` is REQUIRED** at app creation — omitting it causes build failure.
- **No Docker push needed** — platform builds from Git.
- **`IN_ENCLAVE` is NOT auto-injected** — set `ENV IN_ENCLAVE=false` in Dockerfile for local dev; production sets it `true`.
- **Persistent state** → use `/v1/s3/*` (set `enable_s3_storage: true`); enclave filesystem is ephemeral.
- **Secrets** → derive via KMS (`/v1/kms/derive`); never from env vars.

## Common Issues

| Symptom | Fix |
|---|---|
| Build fails immediately | Missing `advanced` field in app creation payload |
| `httpx` external request blocked | Add domain to `advanced.egress_allow`; for IPs also add `"0.0.0.0/0"` |
| Deploy returns 401 | Regenerate API key at sparsity.cloud |
| App stuck `provisioning` >10 min | Check `GET /api/apps/{sqid}/detail` for error details |
| `from odyn import Odyn` fails | Update import: `from nova_python_sdk.odyn import Odyn` |

## Advanced Features

Enable in `advanced` at app creation (cannot change after):

```json
{
  "enable_decentralized_kms": true,    // deterministic key derivation
  "enable_app_wallet": true,           // dedicated Ethereum wallet per app
  "enable_s3_storage": true,           // persistent S3 storage
  "enable_s3_kms_encryption": true,    // KMS-encrypted S3
  "enable_helios_rpc": true,           // Helios light-client RPC
  "enable_persistent_storage": true    // ephemeral disk persistence
}
```

> Enabling `enable_app_wallet` or `enable_s3_kms_encryption` requires `enable_decentralized_kms: true` and `enable_helios_rpc: true`.

For on-chain registration (verifiable trust), KMS/App Wallet usage, S3 patterns, and the full Nova Python SDK, see the reference files.

## Reference Files

- **`references/odyn-api.md`** — Full Odyn Internal API (signing, encryption, S3, KMS, App Wallet, attestation)
- **`references/nova-api.md`** — Nova Platform REST API (full endpoint reference, on-chain registration)

## Key Links

- Nova Platform: https://sparsity.cloud
- API Docs: https://sparsity.cloud/api/docs
- App Template (full): https://github.com/sparsity-xyz/nova-app-template
- Examples: https://github.com/sparsity-xyz/sparsity-nova-examples
