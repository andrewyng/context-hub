---
name: os-login
description: "Google Cloud OS Login Python client library for login profiles, POSIX accounts, and SSH public key management"
metadata:
  languages: "python"
  versions: "2.19.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,gcp,os-login,ssh,compute-engine,iam,linux"
---

# Google Cloud OS Login Python Client

## Golden Rule

Use `google-cloud-os-login` with `from google.cloud import oslogin_v1`, authenticate with Application Default Credentials (ADC), and treat this library as the control plane for OS Login profile data and SSH keys. It does not enable OS Login on Compute Engine VMs by itself.

Before these API calls matter, you still need:

- the OS Login API enabled in the target Google Cloud project
- OS Login enabled for the VM or project metadata
- IAM roles that let the caller use OS Login, typically `roles/compute.osLogin` or `roles/compute.osAdminLogin`

## Install

Pin the version your project expects:

```bash
python -m pip install "google-cloud-os-login==2.19.0"
```

Common alternatives:

```bash
uv add "google-cloud-os-login==2.19.0"
poetry add "google-cloud-os-login==2.19.0"
```

PyPI currently lists Python `>=3.7`.

## Authentication And Setup

Google Cloud client libraries use ADC. For local development:

```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
export OSLOGIN_USER="users/USER_ID"
```

If you need a key-based flow, point ADC at a service account file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Basic imports and client setup:

```python
import os

from google.cloud import oslogin_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
user_name = os.environ["OSLOGIN_USER"]  # format: users/{user}

client = oslogin_v1.OsLoginServiceClient()
```

If you need to pin credentials explicitly:

```python
from google.cloud import oslogin_v1

client = oslogin_v1.OsLoginServiceClient.from_service_account_json(
    "service-account.json"
)
```

## Core Workflow

### Read a login profile

`get_login_profile` returns the caller's or target user's POSIX accounts and SSH public keys. Pass the project ID when you want the profile resolved in a specific project context.

```python
import os

from google.cloud import oslogin_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
user_name = os.environ["OSLOGIN_USER"]

client = oslogin_v1.OsLoginServiceClient()
profile = client.get_login_profile(
    request=oslogin_v1.GetLoginProfileRequest(
        name=user_name,
        project_id=project_id,
    )
)

print("profile:", profile.name)

for account in profile.posix_accounts:
    print(
        account.username,
        account.uid,
        account.home_directory,
        account.primary,
    )

for ssh_key in profile.ssh_public_keys.values():
    print(ssh_key.fingerprint, ssh_key.expiration_time_usec)
```

Use this first when your code needs the current Linux username, UID, or existing key fingerprints before making changes.

### Import an SSH public key and let OS Login create default POSIX account info if needed

`import_ssh_public_key` is the practical entry point for first-time setup. The reference docs note that default POSIX account information is set when no username and UID already exist in the login profile.

```python
import os
from pathlib import Path

from google.cloud import oslogin_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
user_name = os.environ["OSLOGIN_USER"]
public_key_text = Path.home().joinpath(".ssh", "id_ed25519.pub").read_text().strip()

client = oslogin_v1.OsLoginServiceClient()
client.import_ssh_public_key(
    request=oslogin_v1.ImportSshPublicKeyRequest(
        parent=user_name,
        project_id=project_id,
        ssh_public_key=oslogin_v1.SshPublicKey(
            key=public_key_text,
        ),
    )
)

profile = client.get_login_profile(
    request=oslogin_v1.GetLoginProfileRequest(
        name=user_name,
        project_id=project_id,
    )
)

print("imported fingerprints:")
for ssh_key in profile.ssh_public_keys.values():
    print(ssh_key.fingerprint)
```

### Create an SSH public key with an explicit expiration

Use `create_ssh_public_key` when you want to set the key metadata directly.

```python
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

from google.cloud import oslogin_v1

user_name = os.environ["OSLOGIN_USER"]
public_key_text = Path.home().joinpath(".ssh", "id_ed25519.pub").read_text().strip()
expires_at = datetime.now(timezone.utc) + timedelta(days=7)

client = oslogin_v1.OsLoginServiceClient()
created_key = client.create_ssh_public_key(
    request=oslogin_v1.CreateSshPublicKeyRequest(
        parent=user_name,
        ssh_public_key=oslogin_v1.SshPublicKey(
            key=public_key_text,
            expiration_time_usec=int(expires_at.timestamp() * 1_000_000),
        ),
    )
)

print(created_key.name)
print(created_key.fingerprint)
```

### Fetch one SSH public key by resource name

The key resource name comes back from `create_ssh_public_key`, or you can read it from the `ssh_public_keys` map in a login profile.

```python
import os

from google.cloud import oslogin_v1

key_name = os.environ["OSLOGIN_SSH_KEY_NAME"]

client = oslogin_v1.OsLoginServiceClient()
ssh_key = client.get_ssh_public_key(
    request=oslogin_v1.GetSshPublicKeyRequest(name=key_name)
)

print(ssh_key.name)
print(ssh_key.fingerprint)
print(ssh_key.key)
```

### Extend or change SSH key metadata

`update_ssh_public_key` uses patch semantics, so pass an update mask for the fields you are changing.

```python
import os
from datetime import datetime, timedelta, timezone

from google.cloud import oslogin_v1
from google.protobuf import field_mask_pb2

key_name = os.environ["OSLOGIN_SSH_KEY_NAME"]
expires_at = datetime.now(timezone.utc) + timedelta(days=30)

client = oslogin_v1.OsLoginServiceClient()
updated_key = client.update_ssh_public_key(
    request=oslogin_v1.UpdateSshPublicKeyRequest(
        ssh_public_key=oslogin_v1.SshPublicKey(
            name=key_name,
            expiration_time_usec=int(expires_at.timestamp() * 1_000_000),
        ),
        update_mask=field_mask_pb2.FieldMask(paths=["expiration_time_usec"]),
    )
)

print(updated_key.name)
print(updated_key.expiration_time_usec)
```

### Delete an SSH public key

```python
import os

from google.cloud import oslogin_v1

key_name = os.environ["OSLOGIN_SSH_KEY_NAME"]

client = oslogin_v1.OsLoginServiceClient()
client.delete_ssh_public_key(
    request=oslogin_v1.DeleteSshPublicKeyRequest(name=key_name)
)
```

### Delete a POSIX account

This removes the POSIX account resource for a specific user.

```python
import os

from google.cloud import oslogin_v1

posix_account_name = os.environ["OSLOGIN_POSIX_ACCOUNT_NAME"]

client = oslogin_v1.OsLoginServiceClient()
client.delete_posix_account(
    request=oslogin_v1.DeletePosixAccountRequest(name=posix_account_name)
)
```

## Configuration Notes

- Use the package name `google-cloud-os-login`, but import from `google.cloud.oslogin_v1`.
- The generated clients accept either flattened parameters or a `request=` object. Use `request=` consistently once the call has more than one field.
- The `project_id` parameter on `get_login_profile` and `import_ssh_public_key` is optional in the client surface, but it matters when your app works across projects and needs OS Login state evaluated in a specific project.
- `expiration_time_usec` is expressed in microseconds since the Unix epoch, not seconds.
- Create client instances after `os.fork()` if your application uses multiprocessing. Google Cloud generated clients are not intended to be shared across fork boundaries.

## Common Pitfalls

- Enabling the API is not enough. OS Login also has to be enabled on the Compute Engine project or instance metadata, or the VM still uses metadata-based SSH keys.
- This package manages OS Login data; it does not open SSH connections or configure guest OS settings for you.
- The most common import mistake is installing `google-cloud-os-login` and then trying to import `google.cloud.os_login`. The correct import is `from google.cloud import oslogin_v1`.
- `update_ssh_public_key` is patch-based. If you omit `update_mask`, your code is not expressing which field should change.
- Key deletion uses the SSH key resource name, not the raw public key text or fingerprint by itself.
- Some OS Login methods documented in the Compute Engine REST API are v1beta-only. The stable Python client surface here is `oslogin_v1`, so do not assume every REST method has a matching stable Python wrapper.

## Version-Sensitive Notes

- PyPI lists `google-cloud-os-login 2.19.0`.
- The current Google Cloud Python reference pages for `oslogin_v1` also show `2.19.0`.
- If you are copying older snippets, prefer request-object examples like the ones above. That matches the current generated client docs and avoids ambiguity when optional fields are added.

## Official Sources

- PyPI package: https://pypi.org/project/google-cloud-os-login/
- Python client reference root: https://cloud.google.com/python/docs/reference/oslogin/latest
- `OsLoginServiceClient` reference: https://cloud.google.com/python/docs/reference/oslogin/latest/google.cloud.oslogin_v1.services.os_login_service.OsLoginServiceClient
- Library overview and auth notes: https://cloud.google.com/python/docs/reference/oslogin/latest
- Set up OS Login on Compute Engine: https://cloud.google.com/compute/docs/oslogin/set-up-oslogin
- Manage OS Login in an organization: https://cloud.google.com/compute/docs/oslogin/manage-oslogin-in-an-org
