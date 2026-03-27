---
name: mgmt-communication
description: "Azure Communication Services management-plane SDK for Python for Communication Services, Email Services, domains, sender usernames, and related ARM resources"
metadata:
  languages: "python"
  versions: "2.2.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,communication,arm,management,email,python,pypi"
---

# Azure Communication Services Management SDK for Python

## Golden Rule

Use `azure-mgmt-communication` for Azure Resource Manager control-plane work only: creating and managing Communication Services resources, Email Services resources, email domains, and sender usernames.

Do not use it to send email, SMS, or chat traffic. For data-plane work, switch to the service SDKs such as `azure-communication-email` or `azure-communication-sms`.

## Install

Pin the package version your project expects and install `azure-identity` with it:

```bash
python -m pip install "azure-mgmt-communication==2.2.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-communication==2.2.0" azure-identity
poetry add "azure-mgmt-communication==2.2.0" azure-identity
```

PyPI currently lists Python `>=3.9` for `2.2.0`.

## Authentication And Setup

Required environment:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
```

If you authenticate with a service principal directly, also set:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Local scripts can use Azure CLI credentials after:

```bash
az login
az account set --subscription "$AZURE_SUBSCRIPTION_ID"
```

Basic client setup:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.communication import CommunicationServiceManagementClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

client = CommunicationServiceManagementClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

For local one-off scripts, `AzureCliCredential()` is also a reasonable choice:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.communication import CommunicationServiceManagementClient

client = CommunicationServiceManagementClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

## Current Package Surface

The current Learn API reference exposes these main operation groups:

- `communication_services`
- `email_services`
- `domains`
- `sender_usernames`

PyPI release notes for `2.2.0` also call out newer preview additions:

- `smtp_usernames`
- `suppression_lists`
- `suppression_list_addresses`

Treat those newer groups as version-sensitive. The package release notes mention them, but the Learn package index may lag behind the latest generated surface.

## Core Usage

### List existing Communication Services resources

Use this first when you need to discover the current ARM state before creating or updating anything:

```python
for resource in client.communication_services.list_by_subscription():
    print(resource.name, resource.location, resource.data_location)
```

To scope to one resource group:

```python
for resource in client.communication_services.list_by_resource_group("example-rg"):
    print(resource.name, resource.host_name)
```

### Create or update an Email Service resource

Email Services are separate ARM resources used for managed email domains and sender configuration.

```python
email_service = client.email_services.create_or_update(
    resource_group_name="example-rg",
    email_service_name="example-email-service",
    parameters={
        "location": "global",
        "data_location": "United States",
    },
)

print(email_service.id)
```

Use a supported `data_location` value for your region and compliance needs. The Email Services ARM resource is global even though the data residency setting is still required.

### Create a customer-managed email domain

Create the domain under the Email Service, then configure the DNS records Azure returns for verification.

```python
domain = client.domains.create_or_update(
    resource_group_name="example-rg",
    email_service_name="example-email-service",
    domain_name="example.com",
    parameters={
        "location": "global",
        "domain_management": "CustomerManaged",
        "user_engagement_tracking": "Enabled",
    },
)

print(domain.id)
```

Fetch the domain again after creation to inspect its current verification state and any returned DNS data:

```python
domain = client.domains.get(
    resource_group_name="example-rg",
    email_service_name="example-email-service",
    domain_name="example.com",
)

print(domain.domain_management)
print(domain.provisioning_state)
```

List all domains for an Email Service:

```python
for domain in client.domains.list_by_email_service_resource(
    resource_group_name="example-rg",
    email_service_name="example-email-service",
):
    print(domain.name, domain.domain_management, domain.provisioning_state)
```

### Manage sender usernames under a domain

Sender usernames are the identities you use when sending email from a managed domain.

Fetch one directly:

```python
sender = client.sender_usernames.get(
    resource_group_name="example-rg",
    email_service_name="example-email-service",
    domain_name="example.com",
    sender_username="no-reply",
)

print(sender.name)
```

List sender usernames for a domain:

```python
for sender in client.sender_usernames.list_by_domains(
    resource_group_name="example-rg",
    email_service_name="example-email-service",
    domain_name="example.com",
):
    print(sender.name)
```

Delete a sender username you no longer need:

```python
client.sender_usernames.delete(
    resource_group_name="example-rg",
    email_service_name="example-email-service",
    domain_name="example.com",
    sender_username="no-reply",
)
```

For sender-username creation flows, verify the exact `SenderUsernameResource` request shape in your installed `2.2.0` SDK before copying older examples. The operation group is documented, but current task-oriented Learn examples are sparse.

### Delete a domain or Email Service

Use explicit cleanup in development environments so you do not leave unused ARM resources behind:

```python
client.domains.delete(
    resource_group_name="example-rg",
    email_service_name="example-email-service",
    domain_name="example.com",
)

client.email_services.delete(
    resource_group_name="example-rg",
    email_service_name="example-email-service",
)
```

## Configuration Notes

- `subscription_id` is required. The client does not infer it from the credential.
- `DefaultAzureCredential` tries several credential sources in order. If auth behaves differently than expected, check which credential source actually won.
- The client constructor in current docs accepts `base_url`, `credential_scopes`, `polling_interval`, and `api_version`. The `2.2.0` release notes also mention a `cloud_setting` parameter for cloud environment selection.
- Azure management operations still depend on RBAC at the subscription, resource-group, or resource scope. Authentication success does not imply authorization success.

## Common Pitfalls

- This package is management plane only. Creating an Email Service here does not give you a data-plane email client.
- Communication Services resources and Email Services resources are separate ARM resources. Do not assume creating one automatically provisions or links the other.
- Domain setup is not finished when `create_or_update()` returns. Customer-managed domains still need the Azure-provided DNS records to be added and verified before they are usable for sending.
- Use `global` for the ARM resource location shown in official examples for Email Services and domain resources; the residency choice belongs in `data_location`.
- `DefaultAzureCredential` can silently authenticate with Azure CLI, managed identity, or environment credentials depending on where the code runs. Be explicit when debugging permission issues.
- The Learn API reference currently lags some `2.2.0` surface added in PyPI release notes. Be careful when copying older examples or relying on incomplete package index pages for preview features.

## Version-Sensitive Notes For `2.2.0`

- PyPI release notes for `2.2.0` call out new preview operation groups for SMTP usernames, suppression lists, and suppression list addresses.
- The same release notes add `public_network_access` and `disable_local_auth` properties on `CommunicationServiceResource`.
- The `2.2.0` release also mentions `cloud_setting` support on `CommunicationServiceManagementClient`.
- If you need those newer features, verify against the installed `2.2.0` SDK surface before copying older `2.1.x` examples. Current Learn package pages are useful for the stable operation groups but may lag on the newest generated objects.

## Official Sources Used

- https://learn.microsoft.com/en-us/python/api/azure-mgmt-communication/?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-communication/azure.mgmt.communication.communicationservicemanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-communication/azure.mgmt.communication.operations.emailservicesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-communication/azure.mgmt.communication.operations.domainsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-communication/azure.mgmt.communication.operations.senderusernamesoperations?view=azure-python
- https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/email/connect-azure-communication-services-verified-email-domain
- https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/email/manage-suppression-lists
- https://pypi.org/project/azure-mgmt-communication/
