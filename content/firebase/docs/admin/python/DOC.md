---
name: package
description: "Firebase Admin Python SDK guide for server-side authentication, messaging, database, Firestore, storage, and admin workflows"
metadata:
  languages: "python"
  versions: "7.4.0"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "firebase,firebase-admin,python,authentication,messaging,firestore,realtime-database,storage"
---

# Firebase Admin Python SDK

## Golden Rule

Use `firebase-admin` only in trusted server environments, initialize it once per process, and prefer Application Default Credentials (ADC) on Google-managed runtimes. If you are running outside Google Cloud, use a service account JSON file or `GOOGLE_APPLICATION_CREDENTIALS`, and pass `projectId`, `databaseURL`, and `storageBucket` explicitly when the runtime cannot infer them.

## Install

Pin the package version your project expects:

```bash
python -m pip install "firebase-admin==7.4.0"
```

Common alternatives:

```bash
uv add "firebase-admin==7.4.0"
poetry add "firebase-admin==7.4.0"
```

The current PyPI latest release is `7.4.0`, published on April 9, 2026.

## Authentication And Initialization

The SDK entry point is `firebase_admin.initialize_app()`. If you call it twice with the same app name, the SDK raises `ValueError`.

### Preferred setup on Google Cloud runtimes

On Cloud Run, GKE, App Engine, or other Google-managed environments, rely on ADC:

```python
import firebase_admin

app = firebase_admin.initialize_app(
    options={
        "projectId": "my-firebase-project",
        "databaseURL": "https://my-firebase-project-default-rtdb.firebaseio.com",
        "storageBucket": "my-firebase-project.firebasestorage.app",
    }
)
```

If you omit the credential, the SDK uses Google Application Default Credentials.

### Service account setup outside Google Cloud

```python
import firebase_admin
from firebase_admin import credentials

cred = credentials.Certificate("service-account.json")

app = firebase_admin.initialize_app(
    cred,
    {
        "projectId": "my-firebase-project",
        "databaseURL": "https://my-firebase-project-default-rtdb.firebaseio.com",
        "storageBucket": "my-firebase-project.firebasestorage.app",
    },
)
```

### `GOOGLE_APPLICATION_CREDENTIALS` setup

If you want ADC behavior outside Google Cloud, point `GOOGLE_APPLICATION_CREDENTIALS` at a service account file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Then initialize normally:

```python
import firebase_admin

app = firebase_admin.initialize_app(
    options={"projectId": "my-firebase-project"}
)
```

### Configuration options the SDK understands

`initialize_app()` supports these common options:

- `projectId`
- `databaseURL`
- `storageBucket`
- `databaseAuthVariableOverride`
- `serviceAccountId`
- `httpTimeout`

If `httpTimeout` is not set, the SDK default is 120 seconds.

### `FIREBASE_CONFIG`

If you do not pass `options`, the SDK also checks `FIREBASE_CONFIG`. If the value starts with `{`, it is parsed as inline JSON. Otherwise the SDK treats it as a filename and reads JSON from that file.

### Multiple app instances

Use named apps when one process needs to talk to multiple Firebase projects:

```python
import firebase_admin
from firebase_admin import credentials

default_app = firebase_admin.initialize_app(
    credentials.Certificate("project-a.json"),
    {"projectId": "project-a"},
)

other_app = firebase_admin.initialize_app(
    credentials.Certificate("project-b.json"),
    {"projectId": "project-b"},
    name="project-b",
)
```

In tests or short-lived scripts, clean up with `firebase_admin.delete_app(app)`.

## Core Usage

### Authentication

Create users, attach custom claims, and verify client-issued ID tokens:

```python
from firebase_admin import auth

user = auth.create_user(
    email="user@example.com",
    password="correct horse battery staple",
    display_name="Example User",
)

auth.set_custom_user_claims(user.uid, {"admin": True})

decoded = auth.verify_id_token(id_token, check_revoked=True)
uid = decoded["uid"]
```

Useful auth APIs agents commonly need:

- `auth.create_user(...)`
- `auth.update_user(...)`
- `auth.delete_user(uid)`
- `auth.get_user(uid)`
- `auth.create_custom_token(uid, developer_claims=...)`
- `auth.verify_id_token(id_token, check_revoked=False, clock_skew_seconds=0)`

`verify_id_token()` accepts only Firebase ID tokens. Do not pass custom tokens into it; custom tokens are meant to be exchanged by the client SDK for an ID token first.

### Realtime Database

`db.reference()` reads and writes JSON-like tree data. By default it uses the `databaseURL` configured at app initialization, but you can override the URL per call.

```python
from firebase_admin import db

users_ref = db.reference("users")
users_ref.child("alice").set(
    {
        "name": "Alice",
        "active": True,
    }
)

snapshot = users_ref.child("alice").get()
print(snapshot)
```

Connect to a different database instance in the same project:

```python
from firebase_admin import db

other_ref = db.reference(
    "users",
    url="https://my-firebase-project-eu-default-rtdb.europe-west1.firebasedatabase.app",
)
```

### Cloud Firestore

`firebase_admin.firestore.client()` returns a Firestore client bound to the initialized app and project:

```python
from firebase_admin import firestore

client = firestore.client()

doc_ref = client.collection("users").document("alice")
doc_ref.set({"email": "alice@example.com", "role": "admin"})

doc = doc_ref.get()
if doc.exists:
    print(doc.to_dict())
```

If you use named Firestore databases, pass `database_id`:

```python
from firebase_admin import firestore

client = firestore.client(database_id="analytics")
```

If you need async Firestore access, use `firebase_admin.firestore_async.client()`.

### Cloud Messaging

Use `messaging.send()` for one message and `messaging.send_each()` or `messaging.send_each_for_multicast()` for batch sends:

```python
from firebase_admin import messaging

message = messaging.Message(
    token=device_token,
    notification=messaging.Notification(
        title="Build complete",
        body="Your report is ready.",
    ),
    data={"report_id": "rpt_123"},
)

message_id = messaging.send(message, dry_run=False)
print(message_id)
```

Multicast example:

```python
from firebase_admin import messaging

batch = messaging.MulticastMessage(
    tokens=[token_a, token_b],
    notification=messaging.Notification(
        title="Maintenance window",
        body="Service will restart in 10 minutes.",
    ),
)

response = messaging.send_each_for_multicast(batch)
print(response.success_count, response.failure_count)
```

### Cloud Storage

`storage.bucket()` returns a `google.cloud.storage.Bucket`. If you do not pass a bucket name, the SDK uses the app's `storageBucket` option.

```python
from firebase_admin import storage

bucket = storage.bucket()
blob = bucket.blob("exports/report.json")
blob.upload_from_filename("report.json", content_type="application/json")

signed_url = blob.generate_signed_url(version="v4", expiration=900)
print(signed_url)
```

### Remote Config For Server Apps

Server-side Remote Config support exists in the admin SDK. Fetch and evaluate a server template when you want config-driven behavior on the backend:

```python
import asyncio
from firebase_admin import remote_config

async def load_config():
    template = await remote_config.get_server_template(
        default_config={"feature_enabled": "false"}
    )
    config = template.evaluate({"app_version": "7.4.0"})
    return config.get_boolean("feature_enabled")

enabled = asyncio.run(load_config())
```

### Cloud Functions Task Queue Integration

The SDK can enqueue Cloud Tasks for task-queue functions:

```python
from firebase_admin import functions

queue = functions.task_queue("locations/us-central1/functions/processReport")
task = queue.enqueue({"reportId": "rpt_123"})
print(task.name)
```

In `7.2.0`, task queue support gained Cloud Tasks emulator support through `CLOUD_TASKS_EMULATOR_HOST`.

## Configuration And Permissions

- Firebase Admin SDK calls run with admin privileges from the service account or runtime identity.
- The Firebase project must exist and the relevant APIs must be enabled.
- Firestore access still depends on Google Cloud Firestore being provisioned for the project.
- Realtime Database access needs the correct `databaseURL`; the SDK cannot infer alternate database instances from the path alone.
- Storage access needs a valid bucket and IAM permissions on that bucket.
- Messaging requires valid FCM registration tokens from client apps.
- Auth flows that generate email links or session cookies depend on project Auth settings being configured correctly.

## Common Pitfalls

- Initializing the default app twice raises `ValueError`. Reuse `firebase_admin.get_app()` or give the second app a name.
- Agents often forget `projectId`, `databaseURL`, or `storageBucket`; this causes failures later when database, storage, or token verification APIs try to infer missing config.
- `auth.verify_id_token()` verifies client ID tokens, not custom tokens.
- `clock_skew_seconds` for token verification must be between `0` and `60`.
- Realtime Database `listen()` starts a background thread and is documented as experimental. It also does not honor auth overrides or timeout settings.
- Firestore and Storage admin helpers rely on the underlying Google Cloud client libraries. If your environment strips dependencies or vendors packages aggressively, missing-module issues usually come from `google-cloud-firestore` or `google-cloud-storage`.
- `storage.bucket()` fails if neither the call nor app options provide a bucket name.
- For multiple Firebase projects in one process, pass `app=` explicitly to module APIs instead of assuming the default app.

## Version-Sensitive Notes

- `7.4.0` was released on April 9, 2026, and is the current latest release on PyPI.
- `7.3.0` was released on March 19, 2026.
- `7.2.0` was released on February 25, 2026. It added Cloud Tasks emulator support for task-queue functions via `CLOUD_TASKS_EMULATOR_HOST`, fixed a cold-start credential-loading issue for enqueued tasks, and fixed auth error-code parsing when responses contained extra whitespace.
- `7.1.0` added `ActionCodeSettings.link_domain` and deprecated `dynamic_link_domain` for email action flows.
- `7.0.0` dropped Python `3.7` and `3.8`, and the release notes explicitly deprecated Python `3.9` for deployed admin SDK usage even though PyPI still allows installation on `>=3.9`.
- `7.0.0` removed the old messaging batch APIs `send_all()` and `send_multicast()`. Use `send_each()` and `send_each_for_multicast()` or their async variants instead.
- `6.9.0` added `send_each_async()` and `send_each_for_multicast_async()` for async HTTP/2 FCM sends.
- `6.7.0` added server-side Remote Config support.
- `6.6.0` added support for multiple named Firestore databases via `database_id`.

## Official Sources

- Firebase Admin Python setup guide: `https://firebase.google.com/docs/admin/setup`
- Firebase Admin Python reference root: `https://firebase.google.com/docs/reference/admin/python`
- `firebase_admin` module reference: `https://firebase.google.com/docs/reference/admin/python/firebase_admin`
- Auth reference: `https://firebase.google.com/docs/reference/admin/python/firebase_admin.auth`
- Realtime Database reference: `https://firebase.google.com/docs/reference/admin/python/firebase_admin.db`
- Firestore reference: `https://firebase.google.com/docs/reference/admin/python/firebase_admin.firestore`
- Firestore async reference: `https://firebase.google.com/docs/reference/admin/python/firebase_admin.firestore_async`
- Messaging reference: `https://firebase.google.com/docs/reference/admin/python/firebase_admin.messaging`
- Storage reference: `https://firebase.google.com/docs/reference/admin/python/firebase_admin.storage`
- Functions reference: `https://firebase.google.com/docs/reference/admin/python/firebase_admin.functions`
- Remote Config reference: `https://firebase.google.com/docs/reference/admin/python/firebase_admin.remote_config`
- Firebase Admin Python release notes: `https://firebase.google.com/support/release-notes/admin/python`
- PyPI package page: `https://pypi.org/project/firebase-admin/`
