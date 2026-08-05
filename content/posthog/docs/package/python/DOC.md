---
name: package
description: "PostHog Python SDK for product analytics, feature flags, experiments, and error tracking"
metadata:
  languages: "python"
  versions: "7.16.2"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "posthog,analytics,feature-flags,experiments,error-tracking,python"
---

# PostHog Python SDK

## Golden Rule

Use the official `posthog` package, initialize it with your project token and PostHog host before capturing events, and treat feature flag local evaluation as a separate capability that needs a secure server-side key. If you are upgrading older code, read the `5.x -> 6.x` migration guidance first because `6.x` introduced the contexts API and breaking changes.

## Install

Pin the package version your project expects:

```bash
python -m pip install "posthog==7.16.2"
```

Common alternatives:

```bash
uv add "posthog==7.16.2"
poetry add "posthog==7.16.2"
```

Optional extra for LangChain integration:

```bash
python -m pip install "posthog[langchain]==7.16.2"
```

## Authentication And Setup

The Python SDK needs:

- A PostHog project token for event capture and normal feature flag requests
- Your PostHog instance host, for example `https://us.i.posthog.com`
- A separate secret key for local feature flag evaluation when you want low-latency flag checks without a per-request round trip

Basic setup:

```python
import os
from posthog import Posthog

posthog = Posthog(
    os.environ["POSTHOG_PROJECT_API_KEY"],
    host=os.getenv("POSTHOG_HOST", "https://us.i.posthog.com"),
)
```

Notes:

- The docs examples use `https://us.i.posthog.com`, but you should use the host for your own PostHog region or self-hosted deployment.
- PostHog does not require specific environment variable names; the names above are just a sane convention.
- The local evaluation guide says to use your project's "Feature Flags Secure API Key". In the Python constructor, this is still passed as `personal_api_key=...`.

## Core Usage

### Capture backend events

```python
from posthog import Posthog

posthog = Posthog("<ph_project_token>", host="https://us.i.posthog.com")

posthog.capture(
    distinct_id="user-123",
    event="order_completed",
    properties={
        "order_id": "ord_123",
        "amount": 4999,
        "$set": {"email": "user@example.com"},
        "$set_once": {"initial_referrer": "pricing-page"},
    },
)
```

Use a stable `distinct_id` that matches the user identity you use elsewhere in PostHog.

### Use contexts for request-scoped state

`6.x+` added a contexts API that is the cleanest way to attach the active user, session, and tags across multiple backend events:

```python
from posthog import Posthog, identify_context, new_context, set_context_session, tag

posthog = Posthog("<ph_project_token>", host="https://us.i.posthog.com")

with new_context():
    identify_context("user-123")
    set_context_session("01957b8e-91a0-7d9e-8f2c-8df1904f1848")
    tag("transaction_id", "txn-42")

    posthog.capture("checkout_started")
    posthog.capture("checkout_completed", properties={"amount": 4999})
```

Important context behavior:

- Nested contexts inherit parent tags, distinct IDs, and session IDs
- `new_context(fresh=True)` starts clean instead of inheriting parent state
- Direct arguments passed to `capture()` override context state for that event

If you use PostHog on the frontend too, forward the current `distinct_id` and session ID to your backend rather than inventing new values. The docs explicitly recommend passing the frontend distinct ID via `X-POSTHOG-DISTINCT-ID`, and the Django middleware can do this automatically.

### Decorate a function with a fresh context

```python
from posthog import Posthog, identify_context, scoped

posthog = Posthog("<ph_project_token>", host="https://us.i.posthog.com")

@scoped(fresh=True)
def process_order(user_id: str, order_id: str) -> None:
    identify_context(user_id)
    posthog.capture("order_processed", properties={"order_id": order_id})
```

### Group analytics

```python
posthog.group_identify(
    "company",
    "acme",
    {
        "name": "Acme Inc.",
        "tier": "enterprise",
        "employees": 250,
    },
)
```

Use the `"name"` property if you want a readable label in the PostHog UI.

## Feature Flags And Experiments

### Remote evaluation

```python
variant = posthog.get_feature_flag("new-checkout", "user-123")

if variant == "treatment":
    payload = posthog.get_feature_flag_payload("new-checkout", "user-123")
    print(payload)

is_enabled = posthog.feature_enabled("beta-dashboard", "user-123")
```

By default, calling `get_feature_flag()` or `feature_enabled()` may also emit `$feature_flag_called` events. If you do not want that analytics event, pass `send_feature_flag_events=False`.

### Include feature flags on a captured event

```python
posthog.capture(
    distinct_id="user-123",
    event="checkout_completed",
    send_feature_flags=True,
)
```

From `6.3.0+`, `send_feature_flags` can also be a dict so you can force local-only evaluation or provide properties used by rollout rules:

```python
posthog.capture(
    distinct_id="user-123",
    event="checkout_completed",
    send_feature_flags={
        "only_evaluate_locally": True,
        "person_properties": {"plan": "premium"},
        "group_properties": {"org": {"tier": "enterprise"}},
    },
)
```

### Local evaluation for lower latency

Use local evaluation when your backend checks feature flags frequently and you want to avoid a network request on every flag read:

```python
from posthog import Posthog

posthog = Posthog(
    "<ph_project_token>",
    host="https://us.i.posthog.com",
    personal_api_key="<feature-flags-secure-api-key>",
    poll_interval=30,
)

enabled = posthog.feature_enabled(
    "beta-dashboard",
    "user-123",
    person_properties={"plan": "premium"},
)
```

What matters here:

- Upstream now recommends the "Feature Flags Secure API Key" for local evaluation
- Existing personal API keys still work, but the docs say that path will be deprecated for local evaluation
- Polling defaults to `30` seconds in Python
- In edge, Lambda, or other stateless multi-worker environments, the local evaluation docs recommend an external cache provider instead of per-request in-memory initialization

Experiments use the same flag APIs. Treat experiment variants as feature flag variants and branch on the returned value.

## Error Tracking

Enable exception autocapture when PostHog should record backend exceptions automatically:

```python
from posthog import Posthog

posthog = Posthog(
    "<ph_project_token>",
    host="https://us.i.posthog.com",
    enable_exception_autocapture=True,
    capture_exception_code_variables=True,
)
```

You can also capture manually:

```python
try:
    do_work()
except Exception as exc:
    posthog.capture_exception(
        exc,
        "user-123",
        properties={"job_name": "nightly-sync"},
    )
    raise
```

Within a context, exceptions are captured automatically unless you create the context with `capture_exceptions=False`.

## Operational Configuration

### Serverless and short-lived processes

The SDK buffers events by default. In serverless runtimes this can lose events if the process exits before the buffer flushes.

Use one of these patterns:

```python
posthog = Posthog("<ph_project_token>", host="https://us.i.posthog.com", sync_mode=True)
```

Or explicitly shut the client down at the end of request handling:

```python
try:
    posthog.capture("job_finished", distinct_id="worker-1")
finally:
    posthog.shutdown()
```

`shutdown()` is blocking, which is why PostHog recommends it as middleware or request-finalization logic instead of calling it randomly mid-request.

### Connection reuse and networking

The SDK uses HTTP connection pooling. If your runtime sits behind infrastructure that drops idle pooled connections, the docs recommend one of these before making requests:

```python
import posthog

posthog.enable_keep_alive()
```

```python
import posthog

posthog.disable_connection_reuse()
```

You can also set custom socket options with `posthog.set_socket_options(...)`.

### Tests and debugging

```python
posthog.debug = True
posthog.disabled = True
```

- `debug = True` enables verbose SDK logging
- `disabled = True` suppresses capture and network requests during tests

## Common Pitfalls

- Do not confuse the project token with the secure key used for local flag evaluation. Event capture uses the project token; local evaluation needs the feature flags secure API key.
- Do not let backend code invent a new `distinct_id` if the frontend already has one. Forward the frontend identity and session headers to keep person, session replay, and error tracking views coherent.
- Do not rely on buffered async capture in Lambda-like environments unless you also call `posthog.shutdown()` or enable `sync_mode=True`.
- `send_feature_flags=True` can add an extra network request when local evaluation is not configured.
- Contexts are inherited by nested contexts unless you pass `fresh=True`. That is convenient, but it can also leak tags or session IDs further than intended.
- GeoIP defaults changed long ago. Since `v3.0`, PostHog no longer enriches events from the server IP by default. If you need GeoIP-based flag evaluation from backend calls, pass the relevant person properties explicitly.
- The docs mention a special `posthoganalytics` package only for module-name collision scenarios. Use normal `posthog` unless you have that exact problem.

## Version-Sensitive Notes

- `6.x` introduced the contexts API and breaking changes from `5.x`; do not copy `5.x` patterns blindly into `7.x` projects.
- `6.3.0+` changed feature-flag capture behavior: `send_feature_flags` is explicit, and dict-based advanced control became available.
- This guide is pinned to `7.16.2`, the latest release as of May 29, 2026. Check release drift before pinning examples for a fresh project.
- The package metadata on PyPI for `7.16.2` says `Requires: Python >=3.10`. The PostHog docs page separately confirms Python `3.9` is no longer supported. Treat current `7.16.x` work as Python `3.10+` unless your exact pinned artifact proves otherwise.

## Official Sources

- Python SDK docs: `https://posthog.com/docs/libraries/python`
- Local evaluation guide: `https://posthog.com/docs/feature-flags/local-evaluation`
- Distributed local evaluation guide: `https://posthog.com/docs/feature-flags/local-evaluation/distributed`
- PyPI package page: `https://pypi.org/project/posthog/`
- Source repository: `https://github.com/PostHog/posthog-python`
- Changelog: `https://raw.githubusercontent.com/PostHog/posthog-python/master/CHANGELOG.md`
