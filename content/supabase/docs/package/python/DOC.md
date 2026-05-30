---
name: package
description: "Supabase Python client for Postgres queries, auth, storage, edge functions, and realtime"
metadata:
  languages: "python"
  versions: "2.30.1"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "supabase,postgres,auth,storage,realtime,edge-functions,python"
---

# Supabase Python Client

## Golden Rule

Use the official `supabase` package, initialize it with your project URL and key, and treat database and storage access as policy-controlled operations. Most "it returned nothing" or "permission denied" problems come from row-level security (RLS), missing filters, or using the wrong key for the job.

## Install

Pin the version your project expects:

```bash
python -m pip install "supabase==2.30.1"
```

Common alternatives:

```bash
uv add "supabase==2.30.1"
poetry add "supabase==2.30.1"
```

Version note:

- The Supabase install page still says Python `>3.8`, but PyPI metadata for `2.30.1` requires Python `>=3.9`. Follow PyPI for the package constraint you actually install.

## Initialize The Client

Set your project URL and key in the environment:

```bash
export SUPABASE_URL="https://your-project-ref.supabase.co"
export SUPABASE_KEY="your-anon-or-service-role-key"
```

Create the client:

```python
import os

from supabase import Client, create_client

url = os.environ["SUPABASE_URL"]
key = os.environ["SUPABASE_KEY"]

supabase: Client = create_client(url, key)
```

Key selection matters:

- Use the `anon` or publishable key for user-scoped access governed by RLS.
- Use the `service_role` key only in trusted backend code for admin workflows.
- Do not ship a `service_role` key in client-visible code, notebooks you do not control, or shared scripts.

## Core Database Usage

All table operations build a query and then execute it with `.execute()`.

### Select rows

```python
response = (
    supabase.table("instruments")
    .select("id, name, section_id")
    .eq("name", "violin")
    .execute()
)

print(response.data)
```

### Insert rows

```python
response = (
    supabase.table("instruments")
    .insert({"id": 1, "name": "violin"})
    .execute()
)
```

### Update rows

```python
response = (
    supabase.table("instruments")
    .update({"name": "piano"})
    .eq("id", 1)
    .execute()
)
```

### Upsert rows

`upsert()` is for insert-or-update behavior. Include primary key columns in the payload.

```python
response = (
    supabase.table("instruments")
    .upsert({"id": 1, "name": "violin"})
    .execute()
)
```

### Delete rows

```python
response = (
    supabase.table("instruments")
    .delete()
    .eq("id", 1)
    .execute()
)
```

### Use filters deliberately

Filters chain onto the builder before `.execute()`:

```python
response = (
    supabase.table("instruments")
    .select("*")
    .eq("section_id", 10)
    .order("name")
    .limit(20)
    .execute()
)
```

### Call a Postgres function

Use `rpc()` for stored procedures and SQL functions exposed through PostgREST:

```python
response = supabase.rpc("hello_world").execute()
print(response.data)
```

## Auth

### Sign up a user

```python
response = supabase.auth.sign_up(
    {
        "email": "alice@example.com",
        "password": "strong-password",
    }
)
```

### Sign in with email and password

```python
response = supabase.auth.sign_in_with_password(
    {
        "email": "alice@example.com",
        "password": "strong-password",
    }
)
```

### Sign out

```python
supabase.auth.sign_out()
```

### Prefer `get_user()` when identity must be trusted

`auth.get_session()` reads the current session from the client-side storage layer. The Supabase docs warn that, in insecure storage contexts such as request cookies, this value should not be treated as authoritative for authorization decisions. Prefer `auth.get_user()` when you need the Auth server to validate the user represented by the access token.

## Storage

Upload to a bucket:

```python
with open("avatar.png", "rb") as file_obj:
    response = supabase.storage.from_("avatars").upload(
        "public/avatar.png",
        file_obj,
    )
```

Get a public URL:

```python
public_url = supabase.storage.from_("avatars").get_public_url("public/avatar.png")
print(public_url)
```

Create a signed URL for a private object:

```python
signed = supabase.storage.from_("avatars").create_signed_url(
    "private/avatar.png",
    60,
)
print(signed)
```

Storage access is also policy-driven. Bucket permissions and object policies can block uploads or reads even when the Python code is correct.

## Edge Functions

Invoke a deployed Supabase Edge Function:

```python
response = supabase.functions.invoke(
    "hello-world",
    invoke_options={"body": {"name": "Supabase"}},
)
```

Use this for backend logic that should not run in the client or that needs privileged server-side behavior.

## Realtime

Subscribe to a channel:

```python
channel = supabase.channel("room1")

channel.subscribe()
```

Clean up channels when they are no longer needed:

```python
await supabase.remove_channel(channel)
await supabase.remove_all_channels()
```

The Realtime docs note that Supabase cleans up disconnected channels automatically after about 30 seconds, but explicit cleanup reduces unnecessary server load and open subscriptions in long-lived processes.

## Server-Only Admin Workflows

Admin Auth APIs require a client initialized with the `service_role` key.

```python
import os

from supabase import create_client

admin = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"],
)

response = admin.auth.admin.create_user(
    {
        "email": "admin-created@example.com",
        "password": "temporary-password",
        "email_confirm": True,
    }
)
```

Use a separate admin client rather than reusing a user-scoped client with mixed credentials.

## Common Pitfalls

- RLS is usually the first thing to check. `select`, `update`, `delete`, storage reads, and uploads can all fail or return no rows when policies do not allow the action.
- The Python builder does nothing until `.execute()` runs. Forgetting `.execute()` leaves you with a query object, not a result.
- Add filters before destructive operations. A bare `.delete()` or `.update()` without the intended `.eq(...)` or other filter is an easy mistake.
- Supabase recommends keeping result sizes small. By default, projects return at most 1,000 rows per request, so use `limit()` and pagination or ranges for larger scans.
- `upsert()` needs conflict keys already present in the payload. If the primary key or unique key is missing, it cannot behave like the insert-or-update you expect.
- Use `auth.get_user()` for trusted identity checks. Do not make authorization decisions from `get_session()` alone when the underlying storage can be tampered with.
- Realtime subscriptions should be removed explicitly in workers, daemons, and async applications instead of relying only on server-side cleanup.
- Keep `service_role` keys strictly on the backend. The admin API bypasses normal end-user constraints and should be treated as a secret.

## Version-Sensitive Notes For 2.30.1

- PyPI lists `2.30.1` as the current release and requires Python `>=3.9`.
- The release history shows several yanked `2.19.0` to `2.23.3` builds because of dependency issues or minor breaking auth changes. If you find examples pinned in that range, prefer `2.24.0` or later unless the project is already locked to an older wheel.
- The `auth.get_user()` reference for `2.30.1` documents additional user fields such as `is_anonymous`, `factors`, `app_metadata`, `user_metadata`, and `identities`. If your code inspects user objects from older examples, re-check the returned shape before relying on it.

## Official Sources

- Python reference root: `https://supabase.com/docs/reference/python`
- Installing: `https://supabase.com/docs/reference/python/installing`
- Initializing: `https://supabase.com/docs/reference/python/initializing`
- Select and filters: `https://supabase.com/docs/reference/python/select`
- Insert: `https://supabase.com/docs/reference/python/insert`
- Upsert: `https://supabase.com/docs/reference/python/upsert`
- Delete: `https://supabase.com/docs/reference/python/delete`
- Auth signup: `https://supabase.com/docs/reference/python/auth-signup`
- Auth sign-in: `https://supabase.com/docs/reference/python/auth-signinwithpassword`
- Auth get user/session: `https://supabase.com/docs/reference/python/auth-getuser`, `https://supabase.com/docs/reference/python/auth-getsession`
- Auth admin create user: `https://supabase.com/docs/reference/python/auth-admin-createuser`
- Storage upload/public URL/signed URL: `https://supabase.com/docs/reference/python/storage-from-upload`, `https://supabase.com/docs/reference/python/storage-from-getpublicurl`, `https://supabase.com/docs/reference/python/storage-from-createsignedurl`
- Functions invoke: `https://supabase.com/docs/reference/python/functions-invoke`
- Realtime subscribe: `https://supabase.com/docs/reference/python/subscribe`
- PyPI package metadata and release history: `https://pypi.org/project/supabase/`
