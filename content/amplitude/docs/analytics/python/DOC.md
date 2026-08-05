---
name: analytics
description: "Amplitude Analytics Python SDK for server-side event tracking and product analytics"
metadata:
  languages: "python"
  versions: "1.2.3"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "amplitude,analytics,events,tracking,product"
---

# Amplitude Analytics - Python SDK

## Golden Rule

**ALWAYS** use `amplitude-analytics` version 1.2.3 or newer for Python server-side instrumentation.

This is the official Amplitude backend Python SDK maintained by Amplitude Inc.

**DO NOT** use unofficial community packages like `pyamplitude` or `amplitude-python`.

---

## Installation

```bash
pip install amplitude-analytics
```
```bash
pip install amplitude-analytics==1.2.3
```

---

## Environment Variables Setup

Store your API key securely:

```bash
# .env file
AMPLITUDE_API_KEY=your_api_key_here
```

```python
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv('AMPLITUDE_API_KEY')
```

---

## Initialization

### Basic Initialization

```python
from amplitude import Amplitude

client = Amplitude('YOUR_API_KEY')
```

### Initialize with Configuration

```python
from amplitude import Amplitude

client = Amplitude(
    api_key='YOUR_API_KEY',
    configuration={
        'flush_queue_size': 200,
        'flush_interval_millis': 10000,
        'flush_max_retries': 12,
        'min_id_length': 5,
        'server_zone': 'US',
        'use_batch': False,
        'opt_out': False
    }
)
```

---

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `flush_queue_size` | int | 200 | Maximum events before triggering flush |
| `flush_interval_millis` | int | 10000 | Time between automatic flushes (ms) |
| `flush_max_retries` | int | 12 | Maximum retry attempts on failure |
| `min_id_length` | int | 5 | Minimum length for user_id/device_id |
| `server_zone` | str | 'US' | Data residency: 'US' or 'EU' |
| `use_batch` | bool | False | Enable batch API endpoint |
| `opt_out` | bool | False | Disable event processing |
| `server_url` | str | None | Custom API endpoint URL |
| `callback` | callable | None | Callback function for responses |

---

## Core API Surfaces

### Event Tracking

#### Basic Event

```python
from amplitude import BaseEvent

event = BaseEvent(
    event_type="Button Clicked",
    user_id="user@example.com"
)

client.track(event)
```

#### Event with Device ID

```python
event = BaseEvent(
    event_type="Page Viewed",
    device_id="device-123"
)

client.track(event)
```

#### Event with Properties

```python
event = BaseEvent(
    event_type="Product Purchased",
    user_id="user@example.com",
    event_properties={
        "product_id": "SKU-123",
        "price": 29.99,
        "quantity": 2,
        "category": "Electronics"
    }
)

client.track(event)
```

#### Advanced Event with All Options

```python
import time

event = BaseEvent(
    event_type="Feature Used",
    user_id="user@example.com",
    device_id="device-123",
    time=int(time.time() * 1000),  # Milliseconds
    event_properties={
        "feature_name": "export",
        "feature_category": "data"
    },
    user_properties={
        "plan": "premium",
        "credits": 100
    },
    groups={
        "organization": "acme-corp",
        "team": "engineering"
    },
    group_properties={
        "org_plan": "enterprise",
        "team_size": 50
    },
    app_version="1.2.3",
    platform="Web",
    os_name="MacOS",
    os_version="14.2",
    device_brand="Apple",
    device_manufacturer="Apple",
    device_model="MacBook Pro",
    carrier="N/A",
    country="US",
    region="California",
    city="San Francisco",
    dma="SF-OAK-SJ",
    language="en-US",
    price=9.99,
    quantity=1,
    revenue=9.99,
    product_id="product-123",
    revenue_type="purchase",
    location_lat=37.7749,
    location_lng=-122.4194,
    ip="203.0.113.42",
    idfa="AEBE52E7-03EE-455A-B3C4-E57283966239",
    idfv="BCDEF123-03EE-455A-B3C4-E57283966239",
    adid="CDDEF123-03EE-455A-B3C4-E57283966239",
    android_id="android-123",
    event_id=123456,
    session_id=1234567890,
    insert_id="unique-insert-id-123"
)

client.track(event)
```

---

### User Properties

#### Create Identify Object

```python
from amplitude import Identify

identify_obj = Identify()
```

#### Set Properties

```python
from amplitude import Identify, EventOptions

identify_obj = Identify()
identify_obj.set("name", "John Doe")
identify_obj.set("email", "john@example.com")
identify_obj.set("age", 30)
identify_obj.set("premium", True)

client.identify(identify_obj, EventOptions(user_id="user@example.com"))
```

#### Set Once (Only if Not Set)

```python
identify_obj = Identify()
identify_obj.set_once("signup_date", "2025-01-01")
identify_obj.set_once("first_source", "google")

client.identify(identify_obj, EventOptions(user_id="user@example.com"))
```

#### Add (Increment Numeric Values)

```python
identify_obj = Identify()
identify_obj.add("login_count", 1)
identify_obj.add("credits", 100)
identify_obj.add("points", -50)  # Decrement

client.identify(identify_obj, EventOptions(user_id="user@example.com"))
```

#### Append to Array

```python
identify_obj = Identify()
identify_obj.append("visited_pages", "/dashboard")
identify_obj.append("purchased_products", "SKU-123")

client.identify(identify_obj, EventOptions(user_id="user@example.com"))
```

#### Prepend to Array

```python
identify_obj = Identify()
identify_obj.prepend("recent_searches", "laptop")

client.identify(identify_obj, EventOptions(user_id="user@example.com"))
```

#### Pre Insert (Add to Beginning if Not Present)

```python
identify_obj = Identify()
identify_obj.pre_insert("badges", "early_adopter")

client.identify(identify_obj, EventOptions(user_id="user@example.com"))
```

#### Post Insert (Add to End if Not Present)

```python
identify_obj = Identify()
identify_obj.post_insert("tags", "premium")

client.identify(identify_obj, EventOptions(user_id="user@example.com"))
```

#### Remove from Array

```python
identify_obj = Identify()
identify_obj.remove("blocked_users", "user123")

client.identify(identify_obj, EventOptions(user_id="user@example.com"))
```

#### Unset Property

```python
identify_obj = Identify()
identify_obj.unset("temporary_token")

client.identify(identify_obj, EventOptions(user_id="user@example.com"))
```

#### Clear All Properties

```python
identify_obj = Identify()
identify_obj.clear_all()

client.identify(identify_obj, EventOptions(user_id="user@example.com"))
```

#### Chain Multiple Operations

```python
identify_obj = (Identify()
    .set("plan", "premium")
    .add("login_count", 1)
    .append("visited_pages", "/checkout")
    .set_once("signup_date", "2025-01-01")
)

client.identify(identify_obj, EventOptions(user_id="user@example.com"))
```

---

### Group Analytics

#### Set Single Group

```python
from amplitude import EventOptions

client.set_group(
    group_type="organization",
    group_name="acme-corp",
    event_options=EventOptions(user_id="user@example.com")
)
```

#### Set Multiple Groups

```python
client.set_group(
    group_type="teams",
    group_name=["engineering", "product", "design"],
    event_options=EventOptions(user_id="user@example.com")
)
```

#### Set Group Properties

```python
from amplitude import Identify

identify_obj = Identify()
identify_obj.set("plan", "enterprise")
identify_obj.set("seats", 100)
identify_obj.set("industry", "technology")

client.group_identify(
    group_type="organization",
    group_name="acme-corp",
    identify_obj=identify_obj,
    event_options=EventOptions(user_id="user@example.com")
)
```

#### Event-Level Groups

```python
event = BaseEvent(
    event_type="Feature Used",
    user_id="user@example.com",
    groups={
        "organization": "acme-corp",
        "department": "sales"
    }
)

client.track(event)
```

---

### Revenue Tracking

#### Basic Revenue

```python
from amplitude import Revenue, EventOptions

revenue = Revenue(
    price=9.99,
    quantity=1,
    product_id="com.company.product"
)

client.revenue(revenue, EventOptions(user_id="user@example.com"))
```

#### Advanced Revenue Tracking

```python
revenue = Revenue(
    price=29.99,
    quantity=2,
    product_id="SKU-123",
    revenue_type="purchase",
    receipt="receipt-id-12345",
    receipt_sig="signature-abc",
    properties={
        "region": "US",
        "currency": "USD",
        "payment_method": "credit_card",
        "discount_applied": True
    }
)

client.revenue(revenue, EventOptions(user_id="user@example.com"))
```

---

### Plugin System

#### Enrichment Plugin

```python
from amplitude import EventPlugin, PluginType
import platform

class SystemInfoPlugin(EventPlugin):
    def __init__(self):
        self.plugin_type = PluginType.ENRICHMENT
        self.configuration = None

    def setup(self, client):
        self.configuration = client.configuration
        print("System Info Plugin initialized")

    def execute(self, event):
        if event.event_properties is None:
            event.event_properties = {}

        event.event_properties.update({
            'plugin_system': platform.system(),
            'plugin_python_version': platform.python_version(),
            'plugin_timestamp': int(time.time() * 1000)
        })

        return event

client.add(SystemInfoPlugin())
```

#### Destination Plugin

```python
import requests

class CustomAnalyticsPlugin(EventPlugin):
    def __init__(self, api_url, api_token):
        self.plugin_type = PluginType.DESTINATION
        self.api_url = api_url
        self.api_token = api_token
        self.configuration = None

    def setup(self, client):
        self.configuration = client.configuration
        print("Custom Analytics Plugin initialized")

    def execute(self, event):
        try:
            response = requests.post(
                self.api_url,
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {self.api_token}'
                },
                json={
                    'event_type': event.event_type,
                    'user_id': event.user_id,
                    'properties': event.event_properties
                }
            )

            return event
        except Exception as e:
            print(f"Error sending to custom analytics: {e}")
            return event

client.add(CustomAnalyticsPlugin(
    api_url='https://api.custom-analytics.com/events',
    api_token='your_token_here'
))
```

#### Remove Plugin

```python
client.remove("plugin-name")
```

---

### Buffer Management

#### Flush Events Immediately

```python
client.flush()
```

#### Async Flush with Callback

```python
def flush_callback(code, message):
    if code == 200:
        print("Flush successful")
    else:
        print(f"Flush failed: {message}")

client.flush(callback=flush_callback)
```

---

### Shutdown

```python
# Flush remaining events and close client
client.shutdown()
```

---

### Opt-Out Control

```python
# Disable tracking
client.configuration.opt_out = True

# Enable tracking
client.configuration.opt_out = False
```

---

## Event Options

```python
from amplitude import EventOptions

options = EventOptions(
    user_id="user@example.com",
    device_id="device-123",
    session_id=1234567890,
    app_version="1.2.3",
    platform="Web",
    os_name="MacOS",
    os_version="14.2",
    device_brand="Apple",
    device_manufacturer="Apple",
    device_model="MacBook Pro",
    carrier="N/A",
    country="US",
    region="California",
    city="San Francisco",
    language="en-US",
    ip="203.0.113.42"
)
```

---

## Common Patterns

### Initialize with Environment Variables

```python
import os
from amplitude import Amplitude

API_KEY = os.environ.get('AMPLITUDE_API_KEY')

if not API_KEY:
    raise ValueError("AMPLITUDE_API_KEY environment variable not set")

client = Amplitude(API_KEY)
```

### Track User Signup

```python
from amplitude import BaseEvent, Identify, EventOptions

# Track signup event
event = BaseEvent(
    event_type="User Signed Up",
    user_id="new_user@example.com",
    event_properties={
        "signup_method": "google",
        "referral_source": "friend"
    }
)
client.track(event)

# Set initial user properties
identify = Identify()
identify.set("signup_date", "2025-01-07")
identify.set("plan", "free")
identify.set_once("first_source", "google")

client.identify(identify, EventOptions(user_id="new_user@example.com"))
```

### Track Page Views

```python
event = BaseEvent(
    event_type="Page Viewed",
    user_id="user@example.com",
    event_properties={
        "page_url": "/dashboard",
        "page_title": "Dashboard",
        "referrer": "/home"
    }
)

client.track(event)
```

### Track API Requests

```python
import time

start_time = time.time()

# Make API request
response = requests.get('https://api.example.com/data')

duration_ms = int((time.time() - start_time) * 1000)

event = BaseEvent(
    event_type="API Request",
    user_id="user@example.com",
    event_properties={
        "endpoint": "/data",
        "method": "GET",
        "status_code": response.status_code,
        "duration_ms": duration_ms
    }
)

client.track(event)
```

### Track Errors

```python
try:
    # Some operation
    result = perform_operation()
except Exception as e:
    event = BaseEvent(
        event_type="Error Occurred",
        user_id="user@example.com",
        event_properties={
            "error_type": type(e).__name__,
            "error_message": str(e),
            "function_name": "perform_operation"
        }
    )
    client.track(event)
    raise
```

---

## Flask Integration

```python
from flask import Flask, request, g
from amplitude import Amplitude, BaseEvent

app = Flask(__name__)
amplitude_client = Amplitude(os.environ['AMPLITUDE_API_KEY'])

@app.before_request
def before_request():
    g.user_id = request.headers.get('X-User-ID')

@app.after_request
def after_request(response):
    if g.user_id:
        event = BaseEvent(
            event_type="API Request",
            user_id=g.user_id,
            event_properties={
                "method": request.method,
                "path": request.path,
                "status_code": response.status_code
            }
        )
        amplitude_client.track(event)

    return response

@app.route('/api/action')
def api_action():
    amplitude_client.track(BaseEvent(
        event_type="Action Performed",
        user_id=g.user_id,
        event_properties={
            "action": "api_action"
        }
    ))
    return {"status": "success"}

if __name__ == '__main__':
    try:
        app.run()
    finally:
        amplitude_client.shutdown()
```

---

## Django Integration

```python
# middleware.py
from amplitude import Amplitude, BaseEvent
import os

amplitude_client = Amplitude(os.environ.get('AMPLITUDE_API_KEY'))

class AmplitudeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if hasattr(request, 'user') and request.user.is_authenticated:
            event = BaseEvent(
                event_type="Page Viewed",
                user_id=str(request.user.id),
                event_properties={
                    "path": request.path,
                    "method": request.method,
                    "status_code": response.status_code
                }
            )
            amplitude_client.track(event)

        return response

# settings.py
MIDDLEWARE = [
    # ... other middleware
    'myapp.middleware.AmplitudeMiddleware',
]
```

---

## FastAPI Integration

```python
from fastapi import FastAPI, Request, Depends
from amplitude import Amplitude, BaseEvent
import os

app = FastAPI()
amplitude_client = Amplitude(os.environ['AMPLITUDE_API_KEY'])

@app.middleware("http")
async def amplitude_middleware(request: Request, call_next):
    response = await call_next(request)

    user_id = request.headers.get('X-User-ID')
    if user_id:
        event = BaseEvent(
            event_type="API Request",
            user_id=user_id,
            event_properties={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code
            }
        )
        amplitude_client.track(event)

    return response

@app.on_event("shutdown")
async def shutdown_event():
    amplitude_client.shutdown()

@app.post("/action")
async def perform_action(user_id: str):
    amplitude_client.track(BaseEvent(
        event_type="Action Performed",
        user_id=user_id,
        event_properties={
            "action": "perform_action"
        }
    ))
    return {"status": "success"}
```

---

## Celery Integration

```python
from celery import Celery
from amplitude import Amplitude, BaseEvent
import os

app = Celery('tasks', broker='redis://localhost:6379/0')
amplitude_client = Amplitude(os.environ['AMPLITUDE_API_KEY'])

@app.task
def process_order(order_id, user_id):
    # Process order
    result = process_order_logic(order_id)

    # Track event
    event = BaseEvent(
        event_type="Order Processed",
        user_id=user_id,
        event_properties={
            "order_id": order_id,
            "status": result.status,
            "processing_time_ms": result.duration
        }
    )
    amplitude_client.track(event)

    return result

@app.on_after_finalize.connect
def shutdown_amplitude(sender, **kwargs):
    amplitude_client.shutdown()
```

---

## Batch Event Tracking

```python
from amplitude import BaseEvent

events = [
    BaseEvent(
        event_type="Event 1",
        user_id="user@example.com",
        event_properties={"property": "value1"}
    ),
    BaseEvent(
        event_type="Event 2",
        user_id="user@example.com",
        event_properties={"property": "value2"}
    ),
    BaseEvent(
        event_type="Event 3",
        user_id="user@example.com",
        event_properties={"property": "value3"}
    )
]

for event in events:
    client.track(event)

# Flush all events
client.flush()
```

---

## EU Data Residency

```python
client = Amplitude(
    api_key='YOUR_API_KEY',
    configuration={
        'server_zone': 'EU'
    }
)
```

---

## Custom Server URL

```python
client = Amplitude(
    api_key='YOUR_API_KEY',
    configuration={
        'server_url': 'https://proxy.example.com/amplitude'
    }
)
```

---

## Use Batch API Endpoint

```python
client = Amplitude(
    api_key='YOUR_API_KEY',
    configuration={
        'use_batch': True
    }
)
```

---

## Event Callback

```python
def event_callback(event, code, message):
    if code == 200:
        print(f"Event '{event.event_type}' sent successfully")
    else:
        print(f"Failed to send event: {message}")

client = Amplitude(
    api_key='YOUR_API_KEY',
    configuration={
        'callback': event_callback
    }
)
```

---

## HTTP API Direct Usage

### Basic Request

```python
import requests
import time

payload = {
    "api_key": "YOUR_API_KEY",
    "events": [
        {
            "user_id": "user@example.com",
            "device_id": "device-123",
            "event_type": "Page Viewed",
            "time": int(time.time() * 1000),
            "event_properties": {
                "page": "homepage"
            }
        }
    ]
}

response = requests.post(
    'https://api2.amplitude.com/2/httpapi',
    json=payload
)

print(response.json())
```

### Batch Request

```python
payload = {
    "api_key": "YOUR_API_KEY",
    "events": [
        {
            "user_id": "user1@example.com",
            "event_type": "Event 1",
            "time": int(time.time() * 1000)
        },
        {
            "user_id": "user2@example.com",
            "event_type": "Event 2",
            "time": int(time.time() * 1000)
        }
    ]
}

response = requests.post(
    'https://api2.amplitude.com/2/httpapi',
    json=payload
)
```

### EU Endpoint

```python
response = requests.post(
    'https://api.eu.amplitude.com/2/httpapi',
    json=payload
)
```

---

## Threading Considerations

The SDK is thread-safe and automatically manages background threads for event flushing.

```python
import threading
from amplitude import Amplitude, BaseEvent

client = Amplitude('YOUR_API_KEY')

def worker(user_id):
    for i in range(10):
        event = BaseEvent(
            event_type="Worker Event",
            user_id=user_id,
            event_properties={
                "iteration": i
            }
        )
        client.track(event)

threads = []
for i in range(5):
    thread = threading.Thread(target=worker, args=(f"user{i}@example.com",))
    threads.append(thread)
    thread.start()

for thread in threads:
    thread.join()

client.shutdown()
```

---

## Logging Configuration

```python
import logging

# Enable debug logging
logging.basicConfig(level=logging.DEBUG)

client = Amplitude('YOUR_API_KEY')
```

---

## Testing

### Mock Amplitude for Tests

```python
from unittest.mock import Mock, patch
import pytest

@pytest.fixture
def mock_amplitude():
    with patch('amplitude.Amplitude') as mock:
        yield mock

def test_event_tracking(mock_amplitude):
    client = mock_amplitude.return_value

    event = BaseEvent(
        event_type="Test Event",
        user_id="test_user"
    )

    client.track(event)
    client.track.assert_called_once()
```

---

## Error Handling

```python
from amplitude import Amplitude, BaseEvent

try:
    client = Amplitude('YOUR_API_KEY')

    event = BaseEvent(
        event_type="Test Event",
        user_id="user@example.com"
    )

    client.track(event)
    client.flush()

except Exception as e:
    print(f"Error tracking event: {e}")

finally:
    client.shutdown()
```

---

## Constraints & Limits

- **Minimum ID length:** 5 characters (configurable via `min_id_length`)
- **Event batch size:** 200 events by default (`flush_queue_size`)
- **Flush interval:** 10 seconds by default (`flush_interval_millis`)
- **User ID or Device ID required:** At least one must be provided
- **Python version:** Requires Python >= 3.6 and < 4

---

## Complete Example

```python
import os
from amplitude import Amplitude, BaseEvent, Identify, Revenue, EventOptions
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize client
client = Amplitude(
    api_key=os.environ['AMPLITUDE_API_KEY'],
    configuration={
        'flush_queue_size': 100,
        'flush_interval_millis': 5000,
        'server_zone': 'US'
    }
)

try:
    # Track user signup
    signup_event = BaseEvent(
        event_type="User Signed Up",
        user_id="user@example.com",
        event_properties={
            "signup_method": "email",
            "referral_source": "organic"
        }
    )
    client.track(signup_event)

    # Set user properties
    identify = Identify()
    identify.set("name", "John Doe")
    identify.set("email", "user@example.com")
    identify.set("plan", "free")
    identify.set_once("signup_date", "2025-01-07")

    client.identify(identify, EventOptions(user_id="user@example.com"))

    # Set group
    client.set_group(
        group_type="organization",
        group_name="acme-corp",
        event_options=EventOptions(user_id="user@example.com")
    )

    # Track purchase
    purchase_event = BaseEvent(
        event_type="Product Purchased",
        user_id="user@example.com",
        event_properties={
            "product_id": "SKU-123",
            "product_name": "Premium Plan",
            "category": "subscription"
        }
    )
    client.track(purchase_event)

    # Track revenue
    revenue = Revenue(
        price=29.99,
        quantity=1,
        product_id="SKU-123",
        revenue_type="purchase"
    )
    client.revenue(revenue, EventOptions(user_id="user@example.com"))

    # Flush all events
    client.flush()

finally:
    # Clean shutdown
    client.shutdown()
```
