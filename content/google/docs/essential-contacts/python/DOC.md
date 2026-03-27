---
name: essential-contacts
description: "Google Cloud Essential Contacts Python client for managing billing, security, legal, and technical notification contacts on organizations, folders, and projects"
metadata:
  languages: "python"
  versions: "1.12.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,gcp,essential-contacts,contacts,notifications,python"
---

# Google Cloud Essential Contacts Python Package Guide

## Golden Rule

Use `google-cloud-essential-contacts` with `from google.cloud import essential_contacts_v1`, authenticate with Application Default Credentials (ADC), and pass full Google Cloud resource names such as `projects/my-project-id`, `folders/123456789012`, or `organizations/123456789012`.

This library manages the contact records Google Cloud services use for billing, legal, product update, security, suspension, and technical notifications. It does not replace service-specific alerting systems such as Cloud Monitoring notification channels.

## Install

Pin the package version if you want your environment to match this guide exactly:

```bash
python -m pip install "google-cloud-essential-contacts==1.12.0"
```

Common alternatives:

```bash
uv add "google-cloud-essential-contacts==1.12.0"
poetry add "google-cloud-essential-contacts==1.12.0"
```

PyPI lists Python `>=3.7` for `1.12.0`.

## Authentication And Setup

Recommended local setup:

```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
export GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
```

If you must provide a service account key explicitly:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/abs/path/service-account.json
export GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
```

The caller also needs IAM permissions to read or manage Essential Contacts on the target organization, folder, or project.

## Initialize The Client

Use a project, folder, or organization resource name as the parent:

```python
import os

from google.cloud import essential_contacts_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
parent = f"projects/{project_id}"

client = essential_contacts_v1.EssentialContactsServiceClient()
```

Explicit credentials:

```python
import os

from google.cloud import essential_contacts_v1
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"]
)

client = essential_contacts_v1.EssentialContactsServiceClient(
    credentials=credentials,
)
```

If your application is already async, the package also exposes `EssentialContactsServiceAsyncClient`.

## Core Usage

### Create A Contact

`language_tag` is required. Notification subscriptions use the `NotificationCategory` enum.

```python
from google.cloud import essential_contacts_v1

client = essential_contacts_v1.EssentialContactsServiceClient()
parent = "projects/my-project-id"

created = client.create_contact(
    request=essential_contacts_v1.CreateContactRequest(
        parent=parent,
        contact=essential_contacts_v1.Contact(
            email="sre@example.com",
            language_tag="en-US",
            notification_category_subscriptions=[
                essential_contacts_v1.NotificationCategory.SECURITY,
                essential_contacts_v1.NotificationCategory.TECHNICAL,
                essential_contacts_v1.NotificationCategory.TECHNICAL_INCIDENTS,
            ],
        ),
    )
)

print(created.name)
```

Common categories include `BILLING`, `LEGAL`, `PRODUCT_UPDATES`, `SECURITY`, `SUSPENSION`, `TECHNICAL`, and `TECHNICAL_INCIDENTS`.

### List Contacts Defined Directly On One Resource

`list_contacts()` only returns contacts attached to that exact project, folder, or organization.

```python
from google.cloud import essential_contacts_v1

client = essential_contacts_v1.EssentialContactsServiceClient()

for contact in client.list_contacts(parent="projects/my-project-id"):
    print(contact.name)
    print(contact.email)
    print(list(contact.notification_category_subscriptions))
```

### Compute Effective Contacts For A Category

`compute_contacts()` includes inherited contacts from parent folders and organizations. Use it when you need to know who will actually receive a notification.

```python
from google.cloud import essential_contacts_v1

client = essential_contacts_v1.EssentialContactsServiceClient()

pager = client.compute_contacts(
    request=essential_contacts_v1.ComputeContactsRequest(
        parent="projects/my-project-id",
        notification_categories=[
            essential_contacts_v1.NotificationCategory.SECURITY,
            essential_contacts_v1.NotificationCategory.TECHNICAL_INCIDENTS,
        ],
    )
)

for contact in pager:
    print(contact.name, contact.email)
```

### Read One Contact

Use the contact resource name returned from `create_contact()` or `list_contacts()`:

```python
from google.cloud import essential_contacts_v1

client = essential_contacts_v1.EssentialContactsServiceClient()

contact = client.get_contact(
    request=essential_contacts_v1.GetContactRequest(
        name="projects/my-project-id/contacts/CONTACT_ID"
    )
)

print(contact.email)
print(contact.language_tag)
```

### Update Notification Categories Or Language

Use a protobuf `FieldMask`. The email address is immutable and cannot be updated.

```python
from google.cloud import essential_contacts_v1
from google.protobuf.field_mask_pb2 import FieldMask

client = essential_contacts_v1.EssentialContactsServiceClient()

updated = client.update_contact(
    request=essential_contacts_v1.UpdateContactRequest(
        contact=essential_contacts_v1.Contact(
            name="projects/my-project-id/contacts/CONTACT_ID",
            email="sre@example.com",
            language_tag="ja",
            notification_category_subscriptions=[
                essential_contacts_v1.NotificationCategory.SECURITY,
                essential_contacts_v1.NotificationCategory.PRODUCT_UPDATES,
            ],
        ),
        update_mask=FieldMask(
            paths=[
                "language_tag",
                "notification_category_subscriptions",
            ]
        ),
    )
)

print(updated.language_tag)
```

### Send A Test Message

Use this to verify that the selected contacts for one category can receive an Essential Contacts message.

```python
from google.cloud import essential_contacts_v1

client = essential_contacts_v1.EssentialContactsServiceClient()

client.send_test_message(
    request=essential_contacts_v1.SendTestMessageRequest(
        contacts=[
            "projects/my-project-id/contacts/CONTACT_ID",
        ],
        resource="projects/my-project-id",
        notification_category=essential_contacts_v1.NotificationCategory.SECURITY,
    )
)
```

### Delete A Contact

```python
from google.cloud import essential_contacts_v1

client = essential_contacts_v1.EssentialContactsServiceClient()

client.delete_contact(
    request=essential_contacts_v1.DeleteContactRequest(
        name="projects/my-project-id/contacts/CONTACT_ID"
    )
)
```

## Important Pitfalls

- Use full resource names everywhere. `my-project-id` is not enough when the API expects `projects/my-project-id`.
- `list_contacts()` and `compute_contacts()` answer different questions. `list_contacts()` is direct attachments only; `compute_contacts()` includes inherited contacts from parent folders and organizations.
- `email` cannot be changed after a contact is created. Create a new contact and delete the old one if the mailbox changes.
- `update_contact()` does not infer changed fields. Pass an explicit `FieldMask` or your update can silently omit fields you expected to change.
- `language_tag` must be one of the supported contact languages. If a notification is not available in that language, Google sends the message in English.
- `TECHNICAL_INCIDENTS` is more specific than `TECHNICAL`. If you subscribe contacts to both, incident notifications are sent to the `TECHNICAL_INCIDENTS` contacts instead of the general technical contacts.
- Use group addresses or team aliases where possible. The product docs recommend stable team-owned addresses so personnel changes do not break notification routing.

## Official Sources

- Maintainer package docs: https://github.com/googleapis/google-cloud-python/tree/main/packages/google-cloud-essential-contacts
- Package README: https://raw.githubusercontent.com/googleapis/google-cloud-python/main/packages/google-cloud-essential-contacts/README.rst
- Python reference: https://cloud.google.com/python/docs/reference/essentialcontacts/latest/google.cloud.essential_contacts_v1.services.essential_contacts_service.EssentialContactsServiceClient
- Product guide: https://cloud.google.com/resource-manager/docs/managing-notification-contacts
- ADC overview: https://cloud.google.com/docs/authentication/application-default-credentials
- PyPI package page: https://pypi.org/project/google-cloud-essential-contacts/
