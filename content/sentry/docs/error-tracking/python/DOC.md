---
name: error-tracking
description: "Sentry Python SDK for error tracking, performance monitoring, and distributed tracing in Python applications."
metadata:
  languages: "python"
  versions: "2.61.0"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "sentry,monitoring,error-tracking,performance,tracing"
---

# Sentry Python SDK (2.61.0)

## Golden Rule

**ALWAYS use `sentry-sdk` for Python applications.**

The current stable version is **2.61.0**. Do not use deprecated packages like `raven`.

## Installation

```bash
pip install sentry-sdk
```

### With Framework Support

```bash
# Django
pip install sentry-sdk[django]

# Flask
pip install sentry-sdk[flask]

# FastAPI
pip install sentry-sdk[fastapi]

# Celery
pip install sentry-sdk[celery]

# SQLAlchemy
pip install sentry-sdk[sqlalchemy]
```

### Environment Variables Setup

Create a `.env` file:

```env
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=my-project@1.0.0
```

Load environment variables:

```python
import os
from dotenv import load_dotenv

load_dotenv()

SENTRY_DSN = os.getenv("SENTRY_DSN")
SENTRY_ENVIRONMENT = os.getenv("SENTRY_ENVIRONMENT", "development")
SENTRY_RELEASE = os.getenv("SENTRY_RELEASE")
```

## Initialization

### Basic Initialization

Configuration should happen as **early as possible** in your application's lifecycle.

```python
import sentry_sdk

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",

    # Environment and release tracking
    environment="production",
    release="my-project@1.0.0",

    # Performance Monitoring
    traces_sample_rate=1.0,  # Capture 100% of transactions

    # Profiling
    profiles_sample_rate=1.0,  # Profile 100% of transactions

    # Send user IP and cookies
    send_default_pii=True,

    # Enable logging to Sentry
    enable_logs=True,
)
```

### Django Initialization

In `settings.py`:

```python
import sentry_sdk

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",

    # Performance Monitoring
    traces_sample_rate=1.0,

    # Profiling
    profiles_sample_rate=1.0,

    # Send user PII
    send_default_pii=True,
)
```

### Flask Initialization

```python
from flask import Flask
import sentry_sdk

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
    traces_sample_rate=1.0,
    profiles_sample_rate=1.0,
    send_default_pii=True,
)

app = Flask(__name__)
```

### FastAPI Initialization

```python
from fastapi import FastAPI
import sentry_sdk

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
    traces_sample_rate=1.0,
    profiles_sample_rate=1.0,
    send_default_pii=True,
)

app = FastAPI()
```

### Async Application Initialization

For async applications, initialize within an async function:

```python
import asyncio
import sentry_sdk

async def main():
    sentry_sdk.init(
        dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
        traces_sample_rate=1.0,
    )

    # Your async code here
    await run_application()

if __name__ == "__main__":
    asyncio.run(main())
```

## Error Tracking

### Capture Exceptions

**Automatic Error Capture:**

Sentry automatically captures unhandled exceptions.

```python
# This error will be automatically captured
raise Exception("Something went wrong!")
```

**Manual Error Capture:**

```python
import sentry_sdk

try:
    some_failing_function()
except Exception as e:
    sentry_sdk.capture_exception(e)
```

**Capture with Context:**

```python
try:
    process_payment(user_id)
except Exception as e:
    with sentry_sdk.push_scope() as scope:
        scope.set_tag("payment_method", "credit_card")
        scope.set_user({"id": user_id})
        scope.set_level("error")
        sentry_sdk.capture_exception(e)
```

### Capture Messages

```python
import sentry_sdk

# Simple message
sentry_sdk.capture_message("User completed checkout")

# Message with severity level
sentry_sdk.capture_message("Payment processing slow", "warning")

# Available levels: "fatal", "error", "warning", "log", "info", "debug"
sentry_sdk.capture_message("Critical system failure", "fatal")
```

### Message with Context

```python
with sentry_sdk.push_scope() as scope:
    scope.set_tag("section", "checkout")
    scope.set_extra("cart_total", 129.99)
    sentry_sdk.capture_message("Checkout completed", "info")
```

### Capture from Try-Except

```python
import sentry_sdk

def process_data(data):
    try:
        result = risky_operation(data)
        return result
    except ValueError as e:
        sentry_sdk.capture_exception(e)
        return None
    except Exception as e:
        sentry_sdk.capture_exception(e)
        raise
```

## Enriching Error Data

### Set User Information

```python
sentry_sdk.set_user({
    "id": "12345",
    "email": "user@example.com",
    "username": "john_doe",
    "ip_address": "{{auto}}",  # Automatically capture IP
})

# Clear user data
sentry_sdk.set_user(None)
```

### Set Tags

Tags are searchable key-value pairs:

```python
import sentry_sdk

# Set single tag
sentry_sdk.set_tag("page_locale", "en-us")
sentry_sdk.set_tag("environment", "staging")

# Set multiple tags using scope
with sentry_sdk.push_scope() as scope:
    scope.set_tag("user_type", "premium")
    scope.set_tag("platform", "web")
    sentry_sdk.capture_message("User action")
```

### Set Context

Context adds structured data to events:

```python
import sentry_sdk

sentry_sdk.set_context("character", {
    "name": "Mighty Fighter",
    "age": 19,
    "attack_type": "melee",
    "level": 42
})

sentry_sdk.set_context("order", {
    "id": "ORD-12345",
    "total": 249.99,
    "items": 5,
    "shipping_method": "express"
})
```

### Set Extra Data

```python
sentry_sdk.set_extra("debug_data", {
    "last_query": "SELECT * FROM users",
    "response_time": 1234,
})

# Or using scope
with sentry_sdk.push_scope() as scope:
    scope.set_extra("additional_info", {"key": "value"})
    sentry_sdk.capture_exception(Exception("Error with extra data"))
```

### Add Breadcrumbs

Breadcrumbs create a trail of events leading to an error:

```python
import sentry_sdk

# Manual breadcrumb
sentry_sdk.add_breadcrumb(
    category='auth',
    message='User logged in',
    level='info',
)

sentry_sdk.add_breadcrumb(
    category='api',
    message='API request to /users',
    level='info',
    data={
        'url': '/api/users',
        'method': 'GET',
        'status_code': 200,
    }
)

sentry_sdk.add_breadcrumb(
    category='navigation',
    message='User navigated to checkout',
    level='info',
    data={
        'from': '/cart',
        'to': '/checkout',
    }
)
```

**Automatic Breadcrumbs:**

The SDK automatically captures:
- HTTP requests
- Database queries
- Logging calls
- Framework-specific events

**Filter Breadcrumbs:**

```python
import sentry_sdk
from sentry_sdk.types import Breadcrumb, BreadcrumbHint

def before_breadcrumb(crumb: Breadcrumb, hint: BreadcrumbHint):
    # Filter out spammy breadcrumbs
    if crumb.get('category') == 'a.spammy.Logger':
        return None

    # Modify breadcrumb
    if crumb.get('category') == 'console':
        crumb['level'] = 'debug'

    return crumb

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
    before_breadcrumb=before_breadcrumb,
)
```

## Scopes

Scopes contain data that is attached to events.

### Push Scope

```python
import sentry_sdk

# Create temporary scope for specific error
with sentry_sdk.push_scope() as scope:
    scope.set_tag("section", "payment")
    scope.set_level("warning")
    scope.set_user({"id": "12345"})
    sentry_sdk.capture_exception(Exception("Payment failed"))

# This error won't have the above tags
sentry_sdk.capture_exception(Exception("Another error"))
```

### Configure Scope

```python
import sentry_sdk

def process_request(request):
    with sentry_sdk.configure_scope() as scope:
        scope.set_tag("request_id", request.id)
        scope.set_user({
            "id": request.user.id,
            "email": request.user.email,
        })
        scope.set_extra("request_data", request.data)
```

### Global Scope

```python
import sentry_sdk

# Set data on global scope (affects all events)
with sentry_sdk.configure_scope() as scope:
    scope.set_tag("app_version", "1.0.0")
    scope.set_context("app_info", {
        "name": "My App",
        "version": "1.0.0"
    })
```

### Isolation Scope

```python
import sentry_sdk

# Get isolation scope
scope = sentry_sdk.get_isolation_scope()
scope.set_tag("isolation_tag", "value")
```

### Current Scope

```python
import sentry_sdk

# Get current scope
scope = sentry_sdk.get_current_scope()
scope.set_tag("current_tag", "value")
```

## Performance Monitoring

### Basic Transaction

```python
import sentry_sdk

def eat_pizza(pizza):
    with sentry_sdk.start_transaction(op="task", name="Eat Pizza"):
        while pizza.slices > 0:
            eat_slice(pizza.slices.pop())
```

### Transaction with Spans

```python
import sentry_sdk

def eat_pizza(pizza):
    with sentry_sdk.start_transaction(op="task", name="Eat Pizza"):
        while pizza.slices > 0:
            with sentry_sdk.start_span(name="Eat Slice"):
                eat_slice(pizza.slices.pop())
```

### Nested Spans

```python
import sentry_sdk

def chew():
    # Chewing logic
    pass

def eat_slice(slice):
    with sentry_sdk.start_span(name="Eat Slice"):
        with sentry_sdk.start_span(name="Chew"):
            chew()
```

### Using Decorators

```python
import sentry_sdk

@sentry_sdk.trace
def eat_slice(slice):
    # This function is automatically traced
    pass

def eat_pizza(pizza):
    with sentry_sdk.start_transaction(op="task", name="Eat Pizza"):
        while pizza.slices > 0:
            eat_slice(pizza.slices.pop())
```

### Nested Decorators

```python
import sentry_sdk

@sentry_sdk.trace
def chew():
    # Chewing logic
    pass

@sentry_sdk.trace
def eat_slice(slice):
    chew()

@sentry_sdk.trace
def eat_pizza(pizza):
    while pizza.slices > 0:
        eat_slice(pizza.slices.pop())

# Start transaction
with sentry_sdk.start_transaction(op="task", name="Lunch"):
    eat_pizza(pizza)
```

### Manual Span Management

```python
import sentry_sdk

def eat_slice(slice):
    pass

def eat_pizza(pizza):
    with sentry_sdk.start_transaction(op="task", name="Eat Pizza"):
        while pizza.slices > 0:
            span = sentry_sdk.start_span(name="Eat Slice")
            eat_slice(pizza.slices.pop())
            span.finish()
```

### Manual Nested Spans

```python
import sentry_sdk

def chew():
    pass

def eat_slice(slice):
    parent_span = sentry_sdk.start_span(name="Eat Slice")

    child_span = parent_span.start_child(name="Chew")
    chew()
    child_span.finish()

    parent_span.finish()
```

### Decorator with Custom Parameters

```python
import sentry_sdk

@sentry_sdk.trace(op="my_op", name="ProcessItem", attributes={"x": True})
def my_function(i):
    # Function logic
    pass

@sentry_sdk.trace
def root_function():
    for i in range(3):
        my_function(i)

# Start transaction
with sentry_sdk.start_transaction(op="task", name="Root"):
    root_function()
```

### Decorator with Template

```python
import sentry_sdk
from sentry_sdk.consts import SPANTEMPLATE

@sentry_sdk.trace(template=SPANTEMPLATE.AI_AGENT)
def my_ai_function(i):
    # AI logic
    pass

@sentry_sdk.trace
def root_function():
    for i in range(3):
        my_ai_function(i)

# Start transaction
with sentry_sdk.start_transaction(op="task", name="AI Processing"):
    root_function()
```

### Centralized Function Tracing

```python
import sentry_sdk

functions_to_trace = [
    {"qualified_name": "mymodule.eat_slice"},
    {"qualified_name": "mymodule.swallow"},
    {"qualified_name": "mymodule.chew"},
    {"qualified_name": "mymodule.submodule.another.some_function"},
    {"qualified_name": "mymodule.SomePizzaClass.some_method"},
]

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
    traces_sample_rate=1.0,
    functions_to_trace=functions_to_trace,
)
```

### Access Current Transaction

```python
import sentry_sdk

def eat_pizza(pizza):
    transaction = sentry_sdk.get_current_scope().transaction

    if transaction is not None:
        transaction.set_tag("num_of_slices", len(pizza.slices))
        transaction.set_data("pizza_type", pizza.type)

    while pizza.slices > 0:
        eat_slice(pizza.slices.pop())
```

### Access Current Span

```python
import sentry_sdk

@sentry_sdk.trace
def eat_slice(slice):
    span = sentry_sdk.get_current_span()

    if span is not None:
        span.set_tag("slice_id", slice.id)
        span.set_data("slice_size", slice.size)
```

### Add Data to Transactions

```python
import sentry_sdk

with sentry_sdk.start_transaction(name="my-transaction") as transaction:
    transaction.set_data("my-data-attribute-1", "value1")
    transaction.set_data("my-data-attribute-2", 42)
    transaction.set_data("my-data-attribute-3", True)

    transaction.set_data("my-data-attribute-4", ["value1", "value2", "value3"])
    transaction.set_data("my-data-attribute-5", [42, 43, 44])
    transaction.set_data("my-data-attribute-6", [True, False, True])
```

### Add Data to Spans

```python
import sentry_sdk

with sentry_sdk.start_span(name="my-span") as span:
    span.set_data("my-data-attribute-1", "value1")
    span.set_data("my-data-attribute-2", 42)
    span.set_data("my-data-attribute-3", True)

    span.set_data("my-data-attribute-4", ["value1", "value2", "value3"])
    span.set_data("my-data-attribute-5", [42, 43, 44])
    span.set_data("my-data-attribute-6", [True, False, True])
```

### Update Current Span

```python
import sentry_sdk

@sentry_sdk.trace(op="my_op", name="Paul", attributes={"x": True})
def my_function(i):
    sentry_sdk.update_current_span(
        op="myOp",
        name=f"Paul{i}",
        attributes={"y": i},
    )

@sentry_sdk.trace
def root_function():
    for i in range(3):
        my_function(i)

# Start transaction
with sentry_sdk.start_transaction(op="task", name="Root"):
    root_function()
```

### Async Transactions

```python
import asyncio
import sentry_sdk

async def fetch_data():
    # Async data fetching
    await asyncio.sleep(1)
    return {"data": "value"}

async def process_request():
    with sentry_sdk.start_transaction(op="http.server", name="Process Request"):
        with sentry_sdk.start_span(name="Fetch Data"):
            data = await fetch_data()

        with sentry_sdk.start_span(name="Process Data"):
            result = process_data(data)

        return result

# Run async function
asyncio.run(process_request())
```

## Event Filtering

### Before Send Hook

```python
import sentry_sdk
from sentry_sdk.types import Event, Hint

def before_send(event: Event, hint: Hint):
    # Don't send events in development
    if event.get("environment") == "development":
        return None

    # Filter out specific errors
    if "exc_info" in hint:
        exc_type, exc_value, tb = hint["exc_info"]
        if isinstance(exc_value, ConnectionError):
            return None

    # Modify event
    if event.get("user"):
        event["user"].pop("ip_address", None)

    return event

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
    before_send=before_send,
)
```

### Before Send Transaction Hook

```python
import sentry_sdk
from sentry_sdk.types import Event, Hint

def before_send_transaction(event: Event, hint: Hint):
    # Don't send health check transactions
    if event.get("transaction") == "GET /health":
        return None

    # Add custom data to all spans
    for span in event.get("spans", []):
        span["data"] = span.get("data", {})
        span["data"]["foo"] = "bar"

    # Add data to root transaction
    if "contexts" in event and "trace" in event["contexts"]:
        event["contexts"]["trace"]["data"] = event["contexts"]["trace"].get("data", {})
        event["contexts"]["trace"]["data"]["foo"] = "bar"

    return event

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
    traces_sample_rate=1.0,
    before_send_transaction=before_send_transaction,
)
```

### Event Processors

```python
import sentry_sdk

def strip_sensitive_data(event, hint):
    # Remove sensitive data from event
    if "request" in event:
        if "headers" in event["request"]:
            event["request"]["headers"].pop("Authorization", None)
            event["request"]["headers"].pop("Cookie", None)

    return event

# Add globally
sentry_sdk.add_event_processor(strip_sensitive_data)

# Or add to specific scope
with sentry_sdk.push_scope() as scope:
    scope.add_event_processor(strip_sensitive_data)
    sentry_sdk.capture_exception(Exception("Error"))
```

## Sampling

### Error Sampling

```python
sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",

    # Sample 50% of errors
    sample_rate=0.5,
)
```

### Performance Sampling

```python
sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",

    # Sample 25% of transactions
    traces_sample_rate=0.25,
)
```

### Dynamic Performance Sampling

```python
def traces_sampler(sampling_context):
    # Sample critical paths at 100%
    if "/checkout" in sampling_context.get("wsgi_environ", {}).get("PATH_INFO", ""):
        return 1.0

    # Sample health checks at 10%
    if "/health" in sampling_context.get("wsgi_environ", {}).get("PATH_INFO", ""):
        return 0.1

    # Default to 25%
    return 0.25

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
    traces_sampler=traces_sampler,
)
```

### Profile Sampling

```python
sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",

    # Profile 10% of transactions
    profiles_sample_rate=0.1,
)
```

## Releases and Deploys

### Set Release

```python
sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
    release="my-project@1.2.3",
    environment="production",
)
```

### Automatic Release Detection

```python
import sentry_sdk

# Sentry can auto-detect from environment variables:
# SENTRY_RELEASE
# HEROKU_SLUG_COMMIT
# SOURCE_VERSION

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
)
```

## Testing Sentry Setup

### Test Error

```python
import sentry_sdk

# Must be run from a file, not Python shell
def test_sentry():
    sentry_sdk.init(
        dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
    )

    raise Exception("Sentry Test Error - This is intentional!")

if __name__ == "__main__":
    test_sentry()
```

### Test Message

```python
import sentry_sdk

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
)

sentry_sdk.capture_message("Sentry is configured correctly!", "info")
```

### Test Transaction

```python
import sentry_sdk

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
    traces_sample_rate=1.0,
)

with sentry_sdk.start_transaction(op="test", name="Test Transaction"):
    print("Testing Sentry performance monitoring")
```

## Django Integration

### Settings Configuration

```python
import sentry_sdk

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",

    # Performance Monitoring
    traces_sample_rate=1.0,

    # Send user PII
    send_default_pii=True,

    # Environment
    environment="production",
)
```

### Capture User Info

Django integration automatically captures user information from `request.user`.

```python
# User info is automatically captured in Django views
from django.http import JsonResponse

def my_view(request):
    # User from request.user is automatically sent to Sentry
    if request.user.is_authenticated:
        # Sentry will capture user.id, user.email, user.username
        pass

    return JsonResponse({"status": "ok"})
```

### Custom Transaction Names

```python
from django.http import JsonResponse
import sentry_sdk

def my_view(request):
    with sentry_sdk.start_transaction(op="http.server", name="Custom View Name"):
        # View logic
        return JsonResponse({"status": "ok"})
```

## Flask Integration

### Basic Setup

```python
from flask import Flask
import sentry_sdk

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
    traces_sample_rate=1.0,
    send_default_pii=True,
)

app = Flask(__name__)

@app.route("/")
def index():
    return "Hello World!"

@app.route("/error")
def error():
    raise Exception("Test error")

if __name__ == "__main__":
    app.run()
```

### Capture User Info

```python
from flask import Flask, request
import sentry_sdk

app = Flask(__name__)

@app.before_request
def set_user_info():
    user = get_current_user()  # Your user retrieval logic
    if user:
        sentry_sdk.set_user({
            "id": user.id,
            "email": user.email,
            "username": user.username,
        })
```

## FastAPI Integration

### Basic Setup

```python
from fastapi import FastAPI, Request
import sentry_sdk

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
    traces_sample_rate=1.0,
    send_default_pii=True,
)

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/error")
async def error():
    raise Exception("Test error")
```

### Capture User Info

```python
from fastapi import FastAPI, Request, Depends
import sentry_sdk

app = FastAPI()

def get_current_user(request: Request):
    # Your user retrieval logic
    return {"id": "12345", "email": "user@example.com"}

@app.middleware("http")
async def add_user_to_sentry(request: Request, call_next):
    user = get_current_user(request)
    sentry_sdk.set_user(user)
    response = await call_next(request)
    return response
```

## Celery Integration

### Basic Setup

```python
from celery import Celery
import sentry_sdk

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
    traces_sample_rate=1.0,
)

app = Celery("tasks", broker="redis://localhost:6379")

@app.task
def process_data(data):
    # Task logic
    return result
```

### Task Error Handling

```python
from celery import Celery
import sentry_sdk

app = Celery("tasks", broker="redis://localhost:6379")

@app.task(bind=True)
def process_data(self, data):
    try:
        # Task logic
        result = risky_operation(data)
        return result
    except Exception as e:
        sentry_sdk.capture_exception(e)
        raise self.retry(exc=e, countdown=60)
```

## Logging Integration

### Basic Logging Setup

```python
import logging
import sentry_sdk

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
    enable_logs=True,
)

# Configure logging
logging.basicConfig(level=logging.INFO)

# Logs will automatically be sent to Sentry
logging.error("This is an error log")
logging.warning("This is a warning log")
logging.info("This is an info log")
```

### Custom Log Handler

```python
import logging
import sentry_sdk
from sentry_sdk.integrations.logging import LoggingIntegration

# Configure Sentry with logging
sentry_logging = LoggingIntegration(
    level=logging.INFO,       # Capture info and above as breadcrumbs
    event_level=logging.ERROR # Send errors as events
)

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
    integrations=[sentry_logging],
)

logger = logging.getLogger(__name__)
logger.error("This will be sent to Sentry as an event")
logger.info("This will be captured as a breadcrumb")
```

## Advanced Configuration

### Custom Client Options

```python
import sentry_sdk

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",

    # Maximum breadcrumbs
    max_breadcrumbs=50,  # Default is 100

    # Attach stack traces to messages
    attach_stacktrace=True,

    # Server name
    server_name="server-001",

    # Debug mode
    debug=True,

    # Transport options
    transport=sentry_sdk.transports.HttpTransport,

    # Shutdown timeout
    shutdown_timeout=2,
)
```

### Multiple Sentry Instances

```python
import sentry_sdk

# Create client for primary app
primary_client = sentry_sdk.Client(
    dsn="https://primary@sentry.io/0",
)

# Create client for background jobs
jobs_client = sentry_sdk.Client(
    dsn="https://jobs@sentry.io/1",
)

# Use specific client
with sentry_sdk.Hub(primary_client):
    sentry_sdk.capture_exception(Exception("Primary app error"))

with sentry_sdk.Hub(jobs_client):
    sentry_sdk.capture_exception(Exception("Background job error"))
```

### Custom Integrations

```python
import sentry_sdk
from sentry_sdk.integrations.logging import LoggingIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
    integrations=[
        LoggingIntegration(
            level=logging.INFO,
            event_level=logging.ERROR
        ),
        RedisIntegration(),
        SqlalchemyIntegration(),
    ],
)
```

### Disable Default Integrations

```python
import sentry_sdk

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
    default_integrations=False,  # Disable all default integrations
)
```

### Flush and Shutdown

```python
import sentry_sdk

# Flush events (wait up to 2 seconds)
sentry_sdk.flush(timeout=2)

# Close and flush (wait up to 2 seconds)
sentry_sdk.close(timeout=2)
```

## Context Managers

### Hub Context

```python
import sentry_sdk

with sentry_sdk.Hub(sentry_sdk.Hub.current):
    # Operations in isolated hub
    sentry_sdk.capture_message("Isolated message")
```

### Configure Scope Context

```python
import sentry_sdk

with sentry_sdk.configure_scope() as scope:
    scope.set_tag("section", "api")
    scope.set_user({"id": "12345"})
    # All events in this block will have these tags
```

### Push Scope Context

```python
import sentry_sdk

with sentry_sdk.push_scope() as scope:
    scope.set_tag("temporary", "yes")
    sentry_sdk.capture_exception(Exception("Scoped error"))

# Tag is not present in subsequent errors
sentry_sdk.capture_exception(Exception("Unscoped error"))
```
