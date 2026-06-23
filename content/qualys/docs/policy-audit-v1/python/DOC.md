---
name: policy-audit-v1
description: "Qualys Posture API v1.0 for continuous compliance posture monitoring and host policy evaluation"
metadata:
  languages: "python"
  versions: "1.0"
  updated-on: "2026-04-03"
  source: maintainer
  tags: "qualys,compliance,posture,policy-audit,monitoring"
---

# Qualys Posture API v1.0 Coding Guidelines

You are a Qualys Posture API expert. Help me write code using the Qualys Posture API v1.0 for continuous compliance posture monitoring.

Official API documentation: https://qualysapi.qualys.com/

## Golden Rule: Authentication and Base URL

Qualys Posture API v1.0 uses **token-based authentication** (different from v4.0 Basic Auth).

**Base URL:** `https://gateway.<assigned-url>/pcrs/1.0/posture/`
**Authentication:** Bearer token
**Response Format:** JSON (unlike v4.0 which uses XML)

**Installation:**
```bash
pip install requests
```

**Basic Setup:**
```python
import requests
import json

# Authentication token - use environment variables in production
auth_token = 'YOUR_AUTH_TOKEN'

# Base URL - replace <assigned-url> with your Qualys gateway URL
base_url = 'https://gateway.<assigned-url>/pcrs/1.0/posture/'

# Required headers
headers = {
    'Authorization': f'Bearer {auth_token}',
    'Content-Type': 'application/json'
}
```

## Core Concepts

**Posture API** provides continuous compliance posture information for hosts evaluated against policies. It tracks:
- Host compliance status (Passed/Failed)
- First and last pass/fail dates
- Posture modification timestamps
- Policy evaluation history

## Resolve Host IDs

List all Host IDs for specified policies.

```python
import requests

auth_token = 'YOUR_AUTH_TOKEN'
base_url = 'https://gateway.<assigned-url>/pcrs/1.0/posture/'

headers = {
    'Authorization': f'Bearer {auth_token}'
}

# Get host IDs for specific policies
policy_ids = 'policy123,policy456'  # Comma-separated

response = requests.get(
    f'{base_url}hostids',
    headers=headers,
    params={'policyId': policy_ids}
)

print(f"Status Code: {response.status_code}")
print(response.json())
```

**Response Example:**
```json
[
  {
    "policyId": "policy123",
    "subscriptionId": "sub-abc-123",
    "hostIds": ["host-001", "host-002", "host-003"]
  },
  {
    "policyId": "policy456",
    "subscriptionId": "sub-abc-123",
    "hostIds": ["host-004", "host-005"]
  }
]
```

## Get Posture Information

Retrieve continuous posture information for specified hosts and policies.

```python
import requests
import json

auth_token = 'YOUR_AUTH_TOKEN'
base_url = 'https://gateway.<assigned-url>/pcrs/1.0/posture/'

headers = {
    'Authorization': f'Bearer {auth_token}',
    'Content-Type': 'application/json'
}

# Request body with policy and host information
payload = [
    {
        "policyId": "policy123",
        "subscriptionId": "sub-abc-123",
        "hostIds": ["host-001", "host-002"]
    },
    {
        "policyId": "policy456",
        "subscriptionId": "sub-abc-123",
        "hostIds": ["host-003"]
    }
]

# Optional query parameters
params = {
    'evidenceRequired': 0,      # 1 to include evidence data
    'compressionRequired': 1    # 1 for compressed output (default)
}

response = requests.post(
    f'{base_url}postureInfo',
    headers=headers,
    params=params,
    json=payload
)

print(f"Status Code: {response.status_code}")
posture_data = response.json()
print(json.dumps(posture_data, indent=2))
```

**Response Example:**
```json
[
  {
    "id": 1234,
    "policyId": "policy123",
    "hostId": "host-001",
    "status": "Passed",
    "firstFailDate": "",
    "lastFailDate": "",
    "firstPassDate": "2021-10-25T07:21:13Z",
    "lastPassDate": "2021-10-29T07:52:41Z",
    "postureModifiedDate": "2021-10-25T07:21:11Z"
  },
  {
    "id": 1235,
    "policyId": "policy123",
    "hostId": "host-002",
    "status": "Failed",
    "firstFailDate": "2021-10-28T10:15:30Z",
    "lastFailDate": "2021-10-30T09:22:15Z",
    "firstPassDate": "2021-10-20T08:00:00Z",
    "lastPassDate": "2021-10-27T12:30:00Z",
    "postureModifiedDate": "2021-10-30T09:22:15Z"
  }
]
```

### Get Posture Info with Evidence

```python
# Include evidence data in the response
params = {
    'evidenceRequired': 1,
    'compressionRequired': 0  # Uncompressed for readability
}

response = requests.post(
    f'{base_url}postureInfo',
    headers=headers,
    params=params,
    json=payload
)

posture_with_evidence = response.json()
```

## List Policies

Get all policy IDs based on last evaluation date.

```python
import requests
from datetime import datetime, timedelta

auth_token = 'YOUR_AUTH_TOKEN'
base_url = 'https://gateway.<assigned-url>/pcrs/1.0/posture/'

headers = {
    'Authorization': f'Bearer {auth_token}'
}

# Get policies evaluated after a specific date
seven_days_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')

response = requests.get(
    f'{base_url}policy/list',
    headers=headers,
    params={'lastEvaluationDate': seven_days_ago}
)

print(f"Status Code: {response.status_code}")
policies = response.json()
print(json.dumps(policies, indent=2))
```

**Response Example:**
```json
{
  "subscriptionId": "sub-abc-123",
  "policyList": [
    {
      "id": "policy123",
      "title": "Windows Server 2012 Compliance",
      "createdBy": "admin@company.com",
      "createdDate": "2018-02-02T06:22:16Z"
    },
    {
      "id": "policy456",
      "title": "Linux Security Baseline",
      "createdBy": "security@company.com",
      "createdDate": "2020-05-15T10:30:00Z"
    }
  ]
}
```

### List All Policies

```python
# Get all policies (no date filter)
response = requests.get(
    f'{base_url}policy/list',
    headers=headers
)

all_policies = response.json()
```

## Complete Workflow Example

```python
import requests
import json
from datetime import datetime, timedelta

class QualysPostureAPI:
    def __init__(self, gateway_url, auth_token):
        self.base_url = f'https://gateway.{gateway_url}/pcrs/1.0/posture/'
        self.headers = {
            'Authorization': f'Bearer {auth_token}',
            'Content-Type': 'application/json'
        }
    
    def list_policies(self, last_evaluation_date=None):
        """List all policies, optionally filtered by evaluation date"""
        params = {}
        if last_evaluation_date:
            params['lastEvaluationDate'] = last_evaluation_date
        
        response = requests.get(
            f'{self.base_url}policy/list',
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()
    
    def get_host_ids(self, policy_ids):
        """Get host IDs for specified policies"""
        if isinstance(policy_ids, list):
            policy_ids = ','.join(policy_ids)
        
        response = requests.get(
            f'{self.base_url}hostids',
            headers=self.headers,
            params={'policyId': policy_ids}
        )
        response.raise_for_status()
        return response.json()
    
    def get_posture_info(self, policy_host_data, include_evidence=False, compressed=True):
        """Get posture information for hosts"""
        params = {
            'evidenceRequired': 1 if include_evidence else 0,
            'compressionRequired': 1 if compressed else 0
        }
        
        response = requests.post(
            f'{self.base_url}postureInfo',
            headers=self.headers,
            params=params,
            json=policy_host_data
        )
        response.raise_for_status()
        return response.json()

# Usage
api = QualysPostureAPI(
    gateway_url='<assigned-url>',
    auth_token='YOUR_AUTH_TOKEN'
)

# 1. List recent policies
recent_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
policies = api.list_policies(last_evaluation_date=recent_date)
print(f"Found {len(policies['policyList'])} policies")

# 2. Get host IDs for first policy
if policies['policyList']:
    policy_id = policies['policyList'][0]['id']
    host_data = api.get_host_ids([policy_id])
    print(f"Policy {policy_id} has {len(host_data[0]['hostIds'])} hosts")
    
    # 3. Get posture information
    posture_info = api.get_posture_info(host_data, include_evidence=False)
    
    # 4. Analyze results
    passed = sum(1 for item in posture_info if item['status'] == 'Passed')
    failed = sum(1 for item in posture_info if item['status'] == 'Failed')
    
    print(f"Compliance Status: {passed} passed, {failed} failed")
```

## Error Handling

```python
import requests
from requests.exceptions import HTTPError, Timeout, RequestException

def make_posture_request(url, headers, method='get', **kwargs):
    """Make a Qualys Posture API request with error handling"""
    try:
        if method.lower() == 'post':
            response = requests.post(url, headers=headers, timeout=30, **kwargs)
        else:
            response = requests.get(url, headers=headers, timeout=30, **kwargs)
        
        # Raise exception for HTTP errors
        response.raise_for_status()
        
        return response.json()
        
    except HTTPError as e:
        if e.response.status_code == 401:
            print("Authentication failed. Check your token.")
        elif e.response.status_code == 400:
            print("Bad request. Check parameters.")
            print(e.response.text)
        elif e.response.status_code == 404:
            print("Resource not found.")
        else:
            print(f"HTTP error occurred: {e}")
        raise
        
    except Timeout:
        print("Request timed out")
        raise
        
    except RequestException as e:
        print(f"Request failed: {e}")
        raise

# Usage
try:
    result = make_posture_request(
        f'{base_url}policy/list',
        headers,
        method='get'
    )
    print("Success!", result)
except Exception as e:
    print(f"Failed to retrieve policies: {e}")
```

## Best Practices

1. **Use environment variables for tokens:**
```python
import os
auth_token = os.environ.get('QUALYS_AUTH_TOKEN')
gateway_url = os.environ.get('QUALYS_GATEWAY_URL')
```

2. **Handle JSON responses properly:**
```python
response = requests.get(url, headers=headers)
if response.status_code == 200:
    data = response.json()
else:
    print(f"Error: {response.status_code}")
```

3. **Batch host queries efficiently:**
```python
# Query multiple policies at once
policy_ids = ['policy1', 'policy2', 'policy3']
host_data = api.get_host_ids(policy_ids)
```

4. **Use compression for large datasets:**
```python
params = {'compressionRequired': 1}  # Reduces bandwidth
```

5. **Filter by date to reduce data volume:**
```python
# Only get recent evaluations
last_week = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
policies = api.list_policies(last_evaluation_date=last_week)
```

6. **Implement retry logic with exponential backoff:**
```python
import time

def retry_request(func, max_retries=3):
    for attempt in range(max_retries):
        try:
            return func()
        except requests.exceptions.RequestException as e:
            if attempt == max_retries - 1:
                raise
            wait_time = 2 ** attempt
            print(f"Retry {attempt + 1}/{max_retries} after {wait_time}s")
            time.sleep(wait_time)
```

## Key Differences from v4.0

| Feature | v1.0 Posture API | v4.0 Compliance Scan API |
|---------|------------------|--------------------------|
| **Authentication** | Bearer Token | HTTP Basic Auth |
| **Response Format** | JSON | XML |
| **Base URL** | `gateway.<url>/pcrs/1.0/` | `qualysapi.qualys.com/api/2.0/` |
| **Focus** | Continuous posture monitoring | On-demand compliance scans |
| **Use Case** | Real-time compliance status | Scan execution and results |

## Notes

- **API Version**: Posture API v1.0
- **Authentication**: Token-based (Bearer)
- **Response Format**: JSON (easier to parse than XML)
- **Gateway URL**: Varies by region - check your Qualys account
- **Use Case**: Continuous monitoring vs. on-demand scanning (v4.0)
- **Rate Limiting**: Implement backoff strategies
- **Token Security**: Never commit tokens to version control
