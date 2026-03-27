---
name: iap
description: "Google Cloud Identity-Aware Proxy Python client for managing IAP settings, programmatic access allowlists, and tunnel destination groups"
metadata:
  languages: "python"
  versions: "1.19.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,cloud,iap,identity-aware-proxy,python,auth"
---

# Google Cloud IAP Python Client

## Golden Rule

Use `google-cloud-iap` to manage IAP configuration from Python: `IapSettings`, programmatic access allowlists, and IAP TCP forwarding tunnel destination groups.

Do not build new automation around `IdentityAwareProxyOAuthServiceClient` for custom OAuth brand or client creation. Google documents the IAP OAuth 2.0 Admin APIs as deprecated as of January 22, 2025. For requests to an IAP-protected application, mint an ID token with `google-auth`; this package is the admin client, not the runtime caller for protected apps.

## Install

```bash
python -m pip install "google-cloud-iap==1.19.0" requests
```

Common alternatives:

```bash
uv add "google-cloud-iap==1.19.0" requests
poetry add "google-cloud-iap==1.19.0" requests
```

The maintained package docs list Python 3.7+ support for this client version.

## Authentication And Setup

Google Cloud client libraries use Application Default Credentials (ADC). For local development:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

For service-account-based automation:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

Useful environment variables for examples in this guide:

```bash
export IAP_RESOURCE="projects/123456789/iap_web/compute/services/my-backend-service"
export IAP_PROGRAMMATIC_CLIENT_ID="1234567890-abc123def456.apps.googleusercontent.com"
export IAP_PROTECTED_URL="https://my-service-uc.a.run.app"
```

Resource name patterns you will actually need:

- App Engine app: `projects/PROJECT_ID/iap_web/appengine-PROJECT_ID`
- App Engine service version: `projects/PROJECT_ID/iap_web/appengine-PROJECT_ID/services/SERVICE_ID/versions/VERSION_ID`
- Global external Application Load Balancer or backend service: `projects/PROJECT_NUMBER/iap_web/compute/services/BACKEND_SERVICE_NAME`
- Regional Cloud Run behind IAP: `projects/PROJECT_NUMBER/iap_web/cloud_run-REGION/services/SERVICE_NAME`
- IAP TCP forwarding tunnel groups parent: `projects/PROJECT_NUMBER/iap_tunnel/locations/-`

## Client Initialization

```python
from google.cloud import iap_v1

admin_client = iap_v1.IdentityAwareProxyAdminServiceClient()
```

If you need an explicit credential file instead of ADC:

```python
from google.cloud import iap_v1

admin_client = iap_v1.IdentityAwareProxyAdminServiceClient.from_service_account_json(
    "/path/to/service-account.json"
)
```

## Common Workflows

### Read the current IAP settings

```python
import os

from google.cloud import iap_v1

resource_name = os.environ["IAP_RESOURCE"]
client = iap_v1.IdentityAwareProxyAdminServiceClient()

settings = client.get_iap_settings(name=resource_name)

print(settings.name)
print(settings.access_settings.oauth_settings.programmatic_clients)
print(settings.access_settings.allowed_domains_settings.enable)
```

Use `get_iap_settings` first and inspect the returned document before patching anything. The admin API is resource-specific, so the `name` string must match the exact IAP-protected resource you are managing.

### Allowlist an OAuth client for programmatic access

When an IAP-protected app uses the Google-managed OAuth client, programmatic access requires allowlisting another OAuth 2.0 client ID in IAP settings.

```python
import os

from google.cloud import iap_v1

resource_name = os.environ["IAP_RESOURCE"]
client_id = os.environ["IAP_PROGRAMMATIC_CLIENT_ID"]

client = iap_v1.IdentityAwareProxyAdminServiceClient()
settings = client.get_iap_settings(name=resource_name)

programmatic_clients = settings.access_settings.oauth_settings.programmatic_clients
if client_id not in programmatic_clients:
    programmatic_clients.append(client_id)

updated = client.update_iap_settings(
    request=iap_v1.UpdateIapSettingsRequest(iap_settings=settings)
)

print(updated.access_settings.oauth_settings.programmatic_clients)
```

Important behavior: `update_iap_settings` replaces the settings document unless you send an `update_mask`. If multiple automation paths touch IAP settings, do a read-modify-write against the latest state and use a narrow update mask when you need partial updates.

### Call an IAP-protected application from Python

For runtime requests to an IAP-protected endpoint, send an ID token in the `Authorization` header. The audience is the OAuth client ID that protects the app.

```python
import os

import requests
from google.auth.transport.requests import Request
from google.oauth2 import id_token

audience = os.environ["IAP_PROGRAMMATIC_CLIENT_ID"]
url = os.environ["IAP_PROTECTED_URL"]

token = id_token.fetch_id_token(Request(), audience)

response = requests.get(
    url,
    headers={"Authorization": f"Bearer {token}"},
    timeout=30,
)
response.raise_for_status()

print(response.text)
```

If the app is configured to accept a service-account-signed JWT instead, Google documents `Proxy-Authorization: Bearer SIGNED_JWT` as the alternate header. The common Cloud Run and HTTPS load balancer case is an ID token in `Authorization`.

### List or create IAP TCP forwarding tunnel destination groups

Use tunnel destination groups when you manage IAP TCP forwarding destinations through the API.

```python
import os

from google.cloud import iap_v1

project_number = os.environ["GOOGLE_CLOUD_PROJECT_NUMBER"]
parent = f"projects/{project_number}/iap_tunnel/locations/-"

client = iap_v1.IdentityAwareProxyAdminServiceClient()

group = client.create_tunnel_dest_group(
    parent=parent,
    tunnel_dest_group_id="corp-egress",
    tunnel_dest_group=iap_v1.TunnelDestGroup(
        cidrs=["10.10.0.0/16"],
        fqdns=["db.internal.example.com"],
    ),
)

print(group.name)

for existing in client.list_tunnel_dest_groups(parent=parent):
    print(existing.name, list(existing.cidrs), list(existing.fqdns))
```

Tunnel destination groups are part of the admin service, but they are separate from `IapSettings`. Product docs also note that you cannot use the `IapSettings` API to configure resources accessed with IAP TCP forwarding.

## Common Pitfalls

- Do not confuse project ID and project number. IAP resource names for Compute Engine and Cloud Run commonly use project number, while App Engine paths use project ID.
- Do not send an OAuth access token to an IAP-protected app. Programmatic access expects an ID token or, in some configurations, a signed JWT.
- Do not assume the package is the right tool for end-user login flows. Browser sign-in and OAuth consent are separate from this admin client.
- Do not overwrite IAP settings blindly. `update_iap_settings` can replace fields you did not intend to change.
- Do not start new code on the deprecated IAP OAuth Admin API. The generated Python surface still exists, but Google documents the API as deprecated for custom OAuth client management.

## Version-Sensitive Notes

- PyPI currently lists `google-cloud-iap 1.19.0`, and the maintained Python reference pages are available under the `latest` IAP client docs.
- Inference from the official sources: the `IdentityAwareProxyOAuthServiceClient` classes remain in the generated library, but new production workflows should treat them as legacy because the IAP OAuth 2.0 Admin APIs are deprecated.
- If you only need browser access to an IAP-protected app, prefer the default Google-managed OAuth client. You only need programmatic client allowlisting when non-browser callers must reach the protected endpoint.

## Official Sources

- Python package reference root: https://cloud.google.com/python/docs/reference/iap/latest
- `google.cloud.iap_v1.services.identity_aware_proxy_admin_service.IdentityAwareProxyAdminServiceClient`: https://cloud.google.com/python/docs/reference/iap/latest/google.cloud.iap_v1.services.identity_aware_proxy_admin_service.IdentityAwareProxyAdminServiceClient
- `google.cloud.iap_v1.services.identity_aware_proxy_o_auth_service.IdentityAwareProxyOAuthServiceClient`: https://cloud.google.com/python/docs/reference/iap/latest/google.cloud.iap_v1.services.identity_aware_proxy_o_auth_service.IdentityAwareProxyOAuthServiceClient
- Programmatic access for IAP-secured resources: https://cloud.google.com/iap/docs/authentication-howto
- IAP custom OAuth configuration and deprecation notice: https://cloud.google.com/iap/docs/custom-oauth-configuration
- PyPI package page: https://pypi.org/project/google-cloud-iap/
