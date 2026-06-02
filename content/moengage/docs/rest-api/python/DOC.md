---
name: rest-api
description: "MoEngage - Customer Engagement & Analytics REST API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "moengage,engagement,analytics,push-notifications,campaigns,segmentation,api"
---

# MoEngage REST API - Python Guide

## Overview

MoEngage is a customer engagement platform providing APIs for user tracking, push notifications, campaign management, event tracking, and analytics. All APIs are REST-based using JSON over HTTPS.

- **Authentication**: HTTP Basic Auth (Workspace ID as username, API Key as password)
- **Format**: JSON request/response bodies
- **Base URL pattern**: `https://api-0X.moengage.com` where `X` is your data center number
- **Official docs**: https://developers.moengage.com/hc/en-us/categories/4404541620756-API

## Data Centers

MoEngage hosts customers in different data centers. Replace `0X` in all endpoint URLs with your DC number.

| Data Center | API Base URL |
|-------------|-------------|
| DC-01 | `https://api-01.moengage.com` |
| DC-02 | `https://api-02.moengage.com` |
| DC-03 | `https://api-03.moengage.com` |
| DC-04 | `https://api-04.moengage.com` |
| DC-05 | `https://api-05.moengage.com` |

Find your DC number in the MoEngage Dashboard under **Settings > Account > APIs**.

## Authentication

All requests use HTTP Basic Authentication:
- **Username**: Workspace ID (formerly App ID)
- **Password**: API Key (from the Data tile)

Both values are found in **Settings > Account > APIs** in the MoEngage Dashboard.

```python
import base64

WORKSPACE_ID = "YOUR_WORKSPACE_ID"
API_KEY = "YOUR_API_KEY"

credentials = base64.b64encode(f"{WORKSPACE_ID}:{API_KEY}".encode()).decode()
auth_header = f"Basic {credentials}"
```

## Installation

```bash
pip install httpx
```

## Python Client

```python
import httpx
import base64
from typing import Any


class MoEngageClient:
    """Async client for MoEngage REST API."""

    def __init__(
        self,
        workspace_id: str,
        api_key: str,
        data_center: int = 1,
    ):
        self.workspace_id = workspace_id
        self.data_center = f"{data_center:02d}"
        self.base_url = f"https://api-{self.data_center}.moengage.com"
        credentials = base64.b64encode(
            f"{workspace_id}:{api_key}".encode()
        ).decode()
        self.headers = {
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/json",
            "MOE-APPKEY": workspace_id,
        }

    async def _request(
        self,
        method: str,
        url: str,
        json_body: dict | None = None,
    ) -> dict:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.request(
                method,
                url,
                headers=self.headers,
                json=json_body,
            )
            response.raise_for_status()
            return response.json()

    # --- Track User ---

    async def track_user(
        self,
        customer_id: str,
        attributes: dict[str, Any],
        platform: str = "web",
    ) -> dict:
        """Create or update a user profile with attributes."""
        url = f"{self.base_url}/v1/customer/{self.workspace_id}"
        payload = {
            "type": "customer",
            "customer_id": customer_id,
            "attributes": attributes,
            "platforms": [{"platform": platform}],
        }
        return await self._request("POST", url, payload)

    # --- Create Event ---

    async def create_event(
        self,
        customer_id: str,
        event_name: str,
        event_attributes: dict[str, Any] | None = None,
    ) -> dict:
        """Track a custom event for a user."""
        url = f"{self.base_url}/v1/event/{self.workspace_id}"
        payload = {
            "type": "event",
            "customer_id": customer_id,
            "actions": [
                {
                    "action": event_name,
                    "attributes": event_attributes or {},
                }
            ],
        }
        return await self._request("POST", url, payload)

    # --- Send Transactional Push ---

    async def send_push(
        self,
        target_user_id: str,
        title: str,
        message: str,
        payload_data: dict | None = None,
        platform: str = "android",
    ) -> dict:
        """Send a transactional push notification to a single user."""
        push_url = (
            f"https://pushapi-{self.data_center}.moengage.com"
            f"/v2/transaction/sendpush"
        )
        payload = {
            "appId": self.workspace_id,
            "target_user_id": target_user_id,
            "title": title,
            "message": message,
            "platform": platform,
        }
        if payload_data:
            payload["payload"] = payload_data
        return await self._request("POST", push_url, payload)

    # --- Inform API (Multi-Channel Notifications) ---

    async def send_inform(
        self,
        template_id: str,
        recipient_id: str,
        personalization: dict[str, str] | None = None,
    ) -> dict:
        """Send a notification via the Inform API (supports push, email, SMS)."""
        inform_url = (
            f"https://inform-api-{self.data_center}.moengage.com"
            f"/v1/send"
        )
        payload = {
            "template_id": template_id,
            "recipients": [
                {
                    "customer_id": recipient_id,
                    "personalization": personalization or {},
                }
            ],
        }
        return await self._request("POST", inform_url, payload)

    # --- Campaign Reports ---

    async def get_campaign_report(
        self,
        campaign_id: str,
        start_date: str,
        end_date: str,
    ) -> dict:
        """Get campaign delivery and engagement stats.

        Date format: YYYY-MM-DD
        """
        url = (
            f"{self.base_url}/v2/report/campaign"
            f"?campaign_id={campaign_id}"
        )
        payload = {
            "start_date": start_date,
            "end_date": end_date,
        }
        return await self._request("POST", url, payload)
```

## Usage Examples

### Track a User

```python
import asyncio


async def main():
    moe = MoEngageClient(
        workspace_id="YOUR_WORKSPACE_ID",
        api_key="YOUR_API_KEY",
        data_center=1,
    )

    result = await moe.track_user(
        customer_id="user_12345",
        attributes={
            "name": "Priya Sharma",
            "email": "priya@example.com",
            "phone": "+919876543210",
            "city": "Mumbai",
            "signup_date": "2026-03-17",
            "plan": "premium",
        },
    )
    print(f"Track user response: {result}")


asyncio.run(main())
```

### Track Custom Events

```python
async def track_purchase():
    moe = MoEngageClient(
        workspace_id="YOUR_WORKSPACE_ID",
        api_key="YOUR_API_KEY",
        data_center=1,
    )

    result = await moe.create_event(
        customer_id="user_12345",
        event_name="purchase_completed",
        event_attributes={
            "product_name": "Premium Plan",
            "amount": 999.00,
            "currency": "INR",
            "payment_method": "UPI",
            "order_id": "ORD-2026-001",
        },
    )
    print(f"Event tracked: {result}")


asyncio.run(track_purchase())
```

### Send a Push Notification

```python
async def send_notification():
    moe = MoEngageClient(
        workspace_id="YOUR_WORKSPACE_ID",
        api_key="YOUR_API_KEY",
        data_center=1,
    )

    result = await moe.send_push(
        target_user_id="user_12345",
        title="Order Shipped!",
        message="Your order ORD-2026-001 has been dispatched.",
        payload_data={"order_id": "ORD-2026-001", "deep_link": "/orders"},
        platform="android",
    )
    print(f"Push sent: {result}")


asyncio.run(send_notification())
```

### Send Multi-Channel Notification via Inform API

```python
async def send_inform_notification():
    moe = MoEngageClient(
        workspace_id="YOUR_WORKSPACE_ID",
        api_key="YOUR_API_KEY",
        data_center=1,
    )

    result = await moe.send_inform(
        template_id="your_template_id",
        recipient_id="user_12345",
        personalization={
            "name": "Priya",
            "order_id": "ORD-2026-001",
        },
    )
    print(f"Inform sent: {result}")


asyncio.run(send_inform_notification())
```

### Batch User Tracking

```python
async def track_users_batch(users: list[dict]):
    """Track multiple users concurrently."""
    moe = MoEngageClient(
        workspace_id="YOUR_WORKSPACE_ID",
        api_key="YOUR_API_KEY",
        data_center=1,
    )

    async with httpx.AsyncClient(timeout=30.0) as client:
        tasks = []
        for user in users:
            tasks.append(
                moe.track_user(
                    customer_id=user["id"],
                    attributes=user["attributes"],
                )
            )
        results = await asyncio.gather(*tasks, return_exceptions=True)

    for i, result in enumerate(results):
        if isinstance(result, Exception):
            print(f"Failed for user {users[i]['id']}: {result}")
        else:
            print(f"Tracked user {users[i]['id']}")

    return results


users = [
    {
        "id": "u001",
        "attributes": {"name": "Amit", "email": "amit@example.com"},
    },
    {
        "id": "u002",
        "attributes": {"name": "Neha", "email": "neha@example.com"},
    },
]
asyncio.run(track_users_batch(users))
```

## Key API Endpoints Summary

| API | Method | Endpoint Pattern |
|-----|--------|-----------------|
| Track User | POST | `https://api-0X.moengage.com/v1/customer/{appId}` |
| Create Event | POST | `https://api-0X.moengage.com/v1/event/{appId}` |
| Get User | GET | `https://api-0X.moengage.com/v1/customer/{appId}?customer_id=...` |
| Push API | POST | `https://pushapi-0X.moengage.com/v2/transaction/sendpush` |
| Inform API | POST | `https://inform-api-0X.moengage.com/v1/send` |
| Campaign Report | POST | `https://api-0X.moengage.com/v2/report/campaign` |
| Personalize | GET | `https://sdk-0X.moengage.com/v1/experiences/...` |

## Error Handling

```python
import httpx


async def safe_moengage_request(moe: MoEngageClient):
    try:
        result = await moe.track_user("test_user", {"name": "Test"})
        return result
    except httpx.HTTPStatusError as e:
        status = e.response.status_code
        if status == 401:
            print("Authentication failed. Check Workspace ID and API Key.")
        elif status == 400:
            print(f"Bad request: {e.response.text}")
        elif status == 429:
            print("Rate limited. Back off and retry.")
        else:
            print(f"HTTP error {status}: {e.response.text}")
        return None
    except httpx.ConnectError:
        print("Cannot connect. Check data center number and network.")
        return None
    except httpx.TimeoutException:
        print("Request timed out.")
        return None
```

## References

- Developer Guide: https://developers.moengage.com/hc/en-us
- API Overview: https://developers.moengage.com/hc/en-us/articles/4404674776724-Overview
- Track User API: https://developers.moengage.com/hc/en-us/articles/4413167462804-Track-User
- Create Event API: https://developers.moengage.com/hc/en-us/articles/4413174104852-Create-Event
- Push API: https://developers.moengage.com/hc/en-us/articles/4404548252820-Push-API
- Inform API: https://developers.moengage.com/hc/en-us/articles/10699624590868-Inform-API
- Data Centers: https://help.moengage.com/hc/en-us/articles/360057030512-Data-Centers-in-MoEngage
