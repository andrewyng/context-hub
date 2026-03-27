---
name: managed-identities
description: "Google Cloud Managed Identities Python client for Managed Microsoft AD domains, authorized networks, delegated admin passwords, and trust management"
metadata:
  languages: "python"
  versions: "1.14.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,managed-identities,active-directory,microsoft-ad,python,trusts"
---

# Google Cloud Managed Identities Python Client

## Golden Rule

Use `google-cloud-managed-identities` with `from google.cloud import managedidentities_v1`, and treat it as a control-plane client for Managed Service for Microsoft Active Directory. The package handles domain lifecycle, delegated admin password reset, and trust operations. Network connectivity, DNS forwarding, firewall rules, and domain join steps still come from the product setup docs.

Prefer Application Default Credentials (ADC) for authentication. For local development, use `gcloud auth application-default login`. On Google Cloud, prefer an attached service account over key files.

## Install

Pin the version your project expects:

```bash
python -m pip install "google-cloud-managed-identities==1.14.0"
```

Common alternatives:

```bash
uv add "google-cloud-managed-identities==1.14.0"
poetry add "google-cloud-managed-identities==1.14.0"
```

PyPI metadata for `1.14.0` currently declares `Requires: Python >=3.7`.

## Authentication And Prerequisites

Before the client code works, Google Cloud product setup still matters:

- Enable the Managed Microsoft AD, Cloud DNS, and Compute Engine APIs.
- For domain creation, the quickstart calls out `roles/managedidentities.admin` and `roles/compute.networkUser`.
- Use a VPC network resource name in the form `projects/PROJECT_ID/global/networks/VPC_NETWORK_NAME`.
- Pick a reserved CIDR range that does not overlap with existing subnets in the authorized networks.

Local ADC setup:

```bash
gcloud auth application-default login

export GOOGLE_CLOUD_PROJECT="your-project-id"
export MANAGED_IDENTITIES_DOMAIN_FQDN="ad.example.com"
export MANAGED_IDENTITIES_AUTHORIZED_NETWORK="projects/your-project-id/global/networks/shared-vpc"
export MANAGED_IDENTITIES_RESERVED_IP_RANGE="172.16.0.0/24"
export MANAGED_IDENTITIES_REGION="us-central1"
export MANAGED_IDENTITIES_ADMIN="setupadmin"
```

Key-file based ADC only when you need it:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

## Client Initialization

Managed Identities resources are global. The parent is always `projects/{project_id}/locations/global`, while the deployment region goes inside the domain resource's `locations` field.

```python
import os

from google.cloud import managedidentities_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
domain_fqdn = os.environ["MANAGED_IDENTITIES_DOMAIN_FQDN"]

client = managedidentities_v1.ManagedIdentitiesServiceClient()

parent = f"projects/{project_id}/locations/global"
domain_name = f"{parent}/domains/{domain_fqdn}"
```

## Core Workflows

### Create a domain

```python
import os

from google.cloud import managedidentities_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
domain_fqdn = os.environ["MANAGED_IDENTITIES_DOMAIN_FQDN"]
authorized_network = os.environ["MANAGED_IDENTITIES_AUTHORIZED_NETWORK"]
reserved_ip_range = os.environ["MANAGED_IDENTITIES_RESERVED_IP_RANGE"]
region = os.environ["MANAGED_IDENTITIES_REGION"]
admin = os.getenv("MANAGED_IDENTITIES_ADMIN", "setupadmin")

client = managedidentities_v1.ManagedIdentitiesServiceClient()
parent = f"projects/{project_id}/locations/global"

request = managedidentities_v1.CreateMicrosoftAdDomainRequest(
    parent=parent,
    domain_name=domain_fqdn,
    domain=managedidentities_v1.Domain(
        reserved_ip_range=reserved_ip_range,
        locations=[region],
        authorized_networks=[authorized_network],
        admin=admin,
    ),
)

operation = client.create_microsoft_ad_domain(request=request)
domain = operation.result(timeout=3600)

print(domain.name)
print(domain.fqdn)
print(domain.state)
```

Use one region at initial creation time. The product quickstart says a new domain is created in only one region, and the operation can take up to 60 minutes.

### Get one domain or list domains

```python
from google.cloud import managedidentities_v1

project_id = "your-project-id"
domain_fqdn = "ad.example.com"

client = managedidentities_v1.ManagedIdentitiesServiceClient()
parent = f"projects/{project_id}/locations/global"
domain_name = f"{parent}/domains/{domain_fqdn}"

domain = client.get_domain(name=domain_name)
print(domain.fqdn, domain.state)

pager = client.list_domains(
    request=managedidentities_v1.ListDomainsRequest(
        parent=parent,
        filter=f'Domain.fqdn="{domain_fqdn}"',
    )
)

for item in pager:
    print(item.name, item.fqdn, item.state)
```

### Update authorized networks

`update_domain` only supports `labels`, `locations`, and `authorized_networks`. Use a field mask so the client updates exactly the field you intend.

```python
from google.cloud import managedidentities_v1
from google.protobuf.field_mask_pb2 import FieldMask

project_id = "your-project-id"
domain_fqdn = "ad.example.com"
authorized_networks = [
    "projects/your-project-id/global/networks/shared-vpc",
    "projects/your-project-id/global/networks/secondary-vpc",
]

client = managedidentities_v1.ManagedIdentitiesServiceClient()
domain_name = f"projects/{project_id}/locations/global/domains/{domain_fqdn}"

operation = client.update_domain(
    domain=managedidentities_v1.Domain(
        name=domain_name,
        authorized_networks=authorized_networks,
    ),
    update_mask=FieldMask(paths=["authorized_networks"]),
)

updated_domain = operation.result(timeout=1800)
print(updated_domain.authorized_networks)
```

### Reset the delegated administrator password

Managed Microsoft AD creates a delegated administrator account when you create a domain. By default the username is `setupadmin`, unless you provide a custom `admin` field during creation.

```python
from google.cloud import managedidentities_v1

project_id = "your-project-id"
domain_fqdn = "ad.example.com"

client = managedidentities_v1.ManagedIdentitiesServiceClient()
domain_name = f"projects/{project_id}/locations/global/domains/{domain_fqdn}"

response = client.reset_admin_password(name=domain_name)

print(response.password)
```

This returns a newly generated random password. The existing password cannot be retrieved, only reset, so store the new value immediately in your secret manager.

### Create and validate a forest trust

For on-premises trusts, the product documentation says Managed Microsoft AD supports forest trusts and does not support external, realm, or shortcut trusts. Some generated client snippets still show `EXTERNAL` placeholders; replace those with `FOREST`.

```python
import os

from google.cloud import managedidentities_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
domain_fqdn = os.environ["MANAGED_IDENTITIES_DOMAIN_FQDN"]

client = managedidentities_v1.ManagedIdentitiesServiceClient()
domain_name = f"projects/{project_id}/locations/global/domains/{domain_fqdn}"

trust = managedidentities_v1.Trust(
    target_domain_name="corp.example.com",
    trust_type=managedidentities_v1.Trust.TrustType.FOREST,
    trust_direction=managedidentities_v1.Trust.TrustDirection.BIDIRECTIONAL,
    target_dns_ip_addresses=["10.10.0.10", "10.10.0.11"],
    trust_handshake_secret=os.environ["MANAGED_IDENTITIES_TRUST_SECRET"],
)

operation = client.attach_trust(
    request=managedidentities_v1.AttachTrustRequest(
        name=domain_name,
        trust=trust,
    )
)
domain = operation.result(timeout=900)

validation = client.validate_trust(
    request=managedidentities_v1.ValidateTrustRequest(
        name=domain_name,
        trust=trust,
    )
)
validated_domain = validation.result(timeout=600)

for item in validated_domain.trusts:
    print(item.target_domain_name, item.state, item.state_description)
```

`validate_trust` checks that the target domain is reachable and can accept the trust. It does not replace the product prerequisites around Cloud VPN or Interconnect, DNS forwarding, and firewall ports.

### Reconfigure trust DNS servers

If the remote domain's DNS IPs change, use `reconfigure_trust`:

```python
from google.cloud import managedidentities_v1

project_id = "your-project-id"
domain_fqdn = "ad.example.com"

client = managedidentities_v1.ManagedIdentitiesServiceClient()
domain_name = f"projects/{project_id}/locations/global/domains/{domain_fqdn}"

operation = client.reconfigure_trust(
    request=managedidentities_v1.ReconfigureTrustRequest(
        name=domain_name,
        target_domain_name="corp.example.com",
        target_dns_ip_addresses=["10.20.0.10", "10.20.0.11"],
    )
)

domain = operation.result(timeout=900)
print(domain.name)
```

## Pitfalls

- `parent` is always `projects/{project_id}/locations/global`. Do not put `us-central1` or another region in the resource name.
- `domain_name` on create is the FQDN, while later read and update calls use the full resource name `projects/{project_id}/locations/global/domains/{domain_fqdn}`.
- `reserved_ip_range` must be `/24` or larger, unique, and non-overlapping with existing subnets in the authorized networks.
- Authorized networks must be full VPC resource names, not plain network names. The product docs say a domain supports up to 5 authorized networks.
- Domain creation is a long-running operation that can take up to 60 minutes. Trust creation can take up to 10 minutes before the trust reaches `CONNECTED`.
- The trust handshake secret is required when creating the trust and is not stored by the service. Keep your own copy.
- `update_domain` is not a generic patch endpoint. Only `labels`, `locations`, and `authorized_networks` are supported in the update mask.
- Resetting the delegated administrator password replaces the old password. You cannot read the old one back later.

## Version Notes

- PyPI lists `google-cloud-managed-identities 1.14.0` released on January 15, 2026.
- As of March 13, 2026, Google's hosted Python reference pages for this package still label `latest` as `1.13.0`. The request and resource shapes above are taken from those latest reference pages plus the current product docs. If you depend on `1.14.0`-specific behavior, check the release history before assuming the hosted reference has caught up.

## Official Sources

- PyPI package: https://pypi.org/project/google-cloud-managed-identities/
- Maintainer package source: https://github.com/googleapis/google-cloud-python/tree/main/packages/google-cloud-managed-identities
- Python client reference root: https://docs.cloud.google.com/python/docs/reference/managedidentities/latest
- Package class summary: https://docs.cloud.google.com/python/docs/reference/managedidentities/latest/summary_class
- CreateMicrosoftAdDomainRequest: https://docs.cloud.google.com/python/docs/reference/managedidentities/latest/google.cloud.managedidentities_v1.types.CreateMicrosoftAdDomainRequest
- ListDomainsRequest: https://docs.cloud.google.com/python/docs/reference/managedidentities/latest/google.cloud.managedidentities_v1.types.ListDomainsRequest
- UpdateDomainRequest: https://docs.cloud.google.com/python/docs/reference/managedidentities/latest/google.cloud.managedidentities_v1.types.UpdateDomainRequest
- ResetAdminPasswordRequest: https://docs.cloud.google.com/python/docs/reference/managedidentities/latest/google.cloud.managedidentities_v1.types.ResetAdminPasswordRequest
- ReconfigureTrustRequest: https://docs.cloud.google.com/python/docs/reference/managedidentities/latest/google.cloud.managedidentities_v1.types.ReconfigureTrustRequest
- ValidateTrustRequest: https://docs.cloud.google.com/python/docs/reference/managedidentities/latest/google.cloud.managedidentities_v1.types.ValidateTrustRequest
- Managed Microsoft AD create domain quickstart: https://cloud.google.com/managed-microsoft-ad/docs/create-domain
- Managed Microsoft AD authorized networks: https://cloud.google.com/managed-microsoft-ad/docs/managing-authorized-networks
- Managed Microsoft AD delegated administrator account: https://docs.cloud.google.com/managed-microsoft-ad/docs/how-to-use-delegated-admin
- Managed Microsoft AD create trust: https://cloud.google.com/managed-microsoft-ad/docs/create-trust
- Managed Microsoft AD manage trusts: https://docs.cloud.google.com/managed-microsoft-ad/docs/manage-trusts
- ADC setup: https://cloud.google.com/docs/authentication/provide-credentials-adc
- `gcloud auth application-default login`: https://cloud.google.com/sdk/gcloud/reference/auth/application-default/login
