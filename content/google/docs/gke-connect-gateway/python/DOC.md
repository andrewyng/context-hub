---
name: gke-connect-gateway
description: "Google Cloud GKE Connect Gateway Python client for generating kubeconfig access to registered fleet memberships"
metadata:
  languages: "python"
  versions: "0.12.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,gke,fleet,connect-gateway,kubernetes,adc"
---

# google-cloud-gke-connect-gateway Python Package Guide

## What This Package Does

`google-cloud-gke-connect-gateway` is the Python client for the GKE Connect Gateway control API.

Use it when Python code needs to generate a Connect Gateway `kubeconfig` for an existing fleet membership so your app, job runner, or automation can call `kubectl` or other Kubernetes clients against a registered cluster.

This package does not create clusters, register memberships, or manage Kubernetes resources directly. Its core job is to call `GatewayControlClient.generate_credentials(...)` for a membership you already have access to.

## Version Note

This guide covers package version `0.12.0`, which PyPI lists as the current release uploaded on `2026-01-15`.

The rolling Google Cloud Python reference site currently lags behind PyPI for this package:

- PyPI shows `0.12.0`
- the `latest` Python client reference currently renders `GatewayControlClient` as `0.11.0`
- the `latest` changelog page currently goes through `0.11.0`

The current documented surface is still the same practical one for new code:

- use `google.cloud.gkeconnect.gateway_v1`
- use `GatewayControlClient`
- call `generate_credentials`
- expect REST transport, not gRPC

Google's changelog also records two important recent breaking changes that still affect current usage:

- `0.9.0` removed the nonfunctional `GatewayService` surface and replaced it with `GatewayControl`
- `0.10.0` removed gRPC-based async support and switched the default transport to `rest`

## Install

```bash
python -m pip install "google-cloud-gke-connect-gateway==0.12.0"
```

PyPI currently lists support for Python `>=3.7`, including Python `3.14`.

## Required Setup

Before using the client, the target cluster must already be registered to a fleet membership and Connect Gateway must be enabled for the project.

Enable the required APIs:

```bash
export PROJECT_ID="your-project-id"

gcloud services enable --project="${PROJECT_ID}" \
  connectgateway.googleapis.com \
  gkeconnect.googleapis.com \
  gkehub.googleapis.com \
  cloudresourcemanager.googleapis.com
```

Authenticate with Application Default Credentials for local development:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="${PROJECT_ID}"
```

Service account key fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="${PROJECT_ID}"
```

The calling principal needs both:

- `roles/gkehub.viewer` so it can retrieve membership kubeconfigs
- one of `roles/gkehub.gatewayReader`, `roles/gkehub.gatewayEditor`, or `roles/gkehub.gatewayAdmin` to use Connect Gateway

If your workflow needs `kubectl exec`, `kubectl attach`, `kubectl cp`, or `kubectl port-forward`, Google’s product docs call out an extra requirement:

- the IAM permission `gkehub.gateway.stream`, which is included in `roles/gkehub.gatewayAdmin`
- matching Kubernetes RBAC permissions on the target cluster

## Membership Names

`generate_credentials` requires the full fleet membership resource name, not just the cluster name.

Use this format:

```text
projects/{project_id}/locations/global/memberships/{membership_id}
```

If you do not already know the membership ID, Google’s product docs recommend discovering it with:

```bash
gcloud container fleet memberships list
```

## Initialize The Client

Default client with ADC:

```python
from google.cloud.gkeconnect import gateway_v1

client = gateway_v1.GatewayControlClient()
```

Explicit service account file:

```python
from google.cloud.gkeconnect import gateway_v1

client = gateway_v1.GatewayControlClient.from_service_account_file(
    "/absolute/path/service-account.json"
)
```

Be explicit about REST if you want the transport choice in code:

```python
from google.cloud.gkeconnect import gateway_v1

client = gateway_v1.GatewayControlClient(transport="rest")
```

## Core Workflow

### Generate A Kubeconfig For A Fleet Membership

```python
from pathlib import Path

from google.cloud.gkeconnect import gateway_v1

PROJECT_ID = "your-project-id"
MEMBERSHIP_ID = "your-membership"
MEMBERSHIP_NAME = (
    f"projects/{PROJECT_ID}/locations/global/memberships/{MEMBERSHIP_ID}"
)

client = gateway_v1.GatewayControlClient()

request = gateway_v1.GenerateCredentialsRequest(
    name=MEMBERSHIP_NAME,
)

response = client.generate_credentials(request=request)

kubeconfig_path = Path("connect-gateway-kubeconfig.yaml")
kubeconfig_path.write_bytes(response.kubeconfig)

print(f"Gateway endpoint: {response.endpoint}")
print(f"Wrote kubeconfig to {kubeconfig_path.resolve()}")
```

`GenerateCredentialsResponse` contains:

- `kubeconfig`: a full serialized YAML kubeconfig as bytes
- `endpoint`: the generated cluster URI exposed through Connect Gateway

### Use The Returned Kubeconfig With kubectl

```bash
KUBECONFIG=./connect-gateway-kubeconfig.yaml kubectl get namespaces
```

Or from Python:

```python
import subprocess
from pathlib import Path

kubeconfig_path = Path("connect-gateway-kubeconfig.yaml")

subprocess.run(
    ["kubectl", "--kubeconfig", str(kubeconfig_path), "get", "namespaces"],
    check=True,
)
```

### Set A Default Namespace In The Generated Context

If you want the generated kubeconfig context to default to a namespace, set `kubernetes_namespace` on the request:

```python
from pathlib import Path

from google.cloud.gkeconnect import gateway_v1

membership_name = "projects/your-project-id/locations/global/memberships/your-membership"

client = gateway_v1.GatewayControlClient()

request = gateway_v1.GenerateCredentialsRequest(
    name=membership_name,
    kubernetes_namespace="production",
)

response = client.generate_credentials(request=request)
Path("connect-gateway-prod.yaml").write_bytes(response.kubeconfig)
```

### Generate A Windows-Specific Kubeconfig

The request type exposes an `operating_system` field for kubeconfigs that need Windows-specific behavior:

```python
from pathlib import Path

from google.cloud.gkeconnect import gateway_v1

membership_name = "projects/your-project-id/locations/global/memberships/your-membership"

client = gateway_v1.GatewayControlClient()

request = gateway_v1.GenerateCredentialsRequest(
    name=membership_name,
    operating_system=(
        gateway_v1.GenerateCredentialsRequest.OperatingSystem.OPERATING_SYSTEM_WINDOWS
    ),
)

response = client.generate_credentials(request=request)
Path("connect-gateway-windows.yaml").write_bytes(response.kubeconfig)
```

### Force Connect Agent-Based Transport

For cluster types that can use more than one underlying transport, the request also supports `force_use_agent=True`:

```python
from pathlib import Path

from google.cloud.gkeconnect import gateway_v1

membership_name = "projects/your-project-id/locations/global/memberships/your-membership"

client = gateway_v1.GatewayControlClient()

request = gateway_v1.GenerateCredentialsRequest(
    name=membership_name,
    force_use_agent=True,
)

response = client.generate_credentials(request=request)
Path("connect-gateway-agent.yaml").write_bytes(response.kubeconfig)
```

Use this only when you intentionally want Connect Agent transport and the agent is installed on the cluster. The request reference says leaving it unset is equivalent to `False`.

## Important Pitfalls

- This library is for generating access credentials, not for listing or registering memberships. Membership discovery and fleet administration are separate APIs and tools.
- Pass the full membership resource name. A bare cluster name is not enough.
- Write `response.kubeconfig` as bytes. It is already a complete serialized kubeconfig payload.
- New code should use `gateway_v1.GatewayControlClient`. The old `GatewayService` surface was removed.
- Do not plan around an async client in the current line. Google’s `0.10.0` changelog explicitly says the async client was removed when gRPC support was dropped.
- `kubectl exec`, `attach`, `cp`, and `port-forward` need more than basic gateway access. Google’s product docs require `gkehub.gateway.stream` and matching Kubernetes RBAC.
- If access fails even though the Google Cloud IAM roles look correct, check cluster-side RBAC next. Connect Gateway authorization is layered on top of Kubernetes authorization.

## When To Use This Package Instead Of gcloud

If you only need an interactive one-off kubeconfig, `gcloud container fleet memberships get-credentials` is usually simpler.

Use `google-cloud-gke-connect-gateway` when you need the same workflow inside Python code, such as:

- CI/CD jobs that generate short-lived kubeconfig files on demand
- internal automation that targets fleet memberships by name
- services that need to hand a generated kubeconfig to `kubectl` or another Kubernetes client process

## Official Sources

- PyPI package: https://pypi.org/project/google-cloud-gke-connect-gateway/
- Python client reference root: https://docs.cloud.google.com/python/docs/reference/connectgateway/latest
- `GatewayControlClient` reference: https://docs.cloud.google.com/python/docs/reference/connectgateway/latest/google.cloud.gkeconnect.gateway_v1.services.gateway_control.GatewayControlClient
- Changelog: https://docs.cloud.google.com/python/docs/reference/connectgateway/latest/changelog
- Connect Gateway setup guide: https://cloud.google.com/kubernetes-engine/enterprise/multicluster-management/gateway/setup
- Connect Gateway usage guide: https://cloud.google.com/kubernetes-engine/enterprise/multicluster-management/gateway/using
- GKE Hub IAM roles: https://cloud.google.com/iam/docs/roles-permissions/gkehub
- Application Default Credentials: https://cloud.google.com/docs/authentication/provide-credentials-adc
