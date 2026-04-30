---
name: policy-audit-v2
description: "Qualys Compliance Policy API v2.0 for policy management, compliance controls, and scanning operations"
metadata:
  languages: "python"
  versions: "2.0"
  updated-on: "2026-04-03"
  source: maintainer
  tags: "qualys,compliance,policy,controls,scanning"
---

# Qualys Compliance Policy API v2.0 Coding Guidelines

You are a Qualys Compliance Policy API expert. Help me write code using the Qualys API v2.0 for policy management, compliance controls, and scanning.

Official API documentation: https://qualysapi.qualys.com/

## Golden Rule: Authentication and Base URL

**Base URL:** `https://qualysapi.qualys.com/api/2.0/fo/`
**Authentication:** HTTP Basic Auth
**Response Format:** XML

**Installation:**
```bash
pip install requests
```

**Basic Setup:**
```python
import requests
from requests.auth import HTTPBasicAuth

username = 'YOUR_USERNAME'
password = 'YOUR_PASSWORD'

base_url = 'https://qualysapi.qualys.com/api/2.0/fo/'

headers = {
    'X-Requested-With': 'Curl'
}
```

## Compliance Policy Management

### Export Compliance Policy

```python
import requests
from requests.auth import HTTPBasicAuth

username = 'YOUR_USERNAME'
password = 'YOUR_PASSWORD'

url = 'https://qualysapi.qualys.com/api/2.0/fo/compliance/policy/'

params = {
    'action': 'export',
    'ids': '991742279',
    'show_user_controls': '1'  # Include user-defined controls
}

headers = {'X-Requested-With': 'Curl'}

response = requests.get(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    params=params
)

# Save to file
with open('policy_export.xml', 'w') as f:
    f.write(response.text)

print("Policy exported successfully")
```

### Import Compliance Policy

```python
url = 'https://qualysapi.qualys.com/api/2.0/fo/compliance/policy/'

files = {
    'file': open('policy.xml', 'rb')
}

data = {
    'action': 'import'
}

response = requests.post(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    data=data,
    files=files
)

print(response.text)
```

### Merge Compliance Policies

```python
url = 'https://qualysapi.qualys.com/api/2.0/fo/compliance/policy/'

params = {
    'action': 'merge',
    'ids': '111,222,333'  # Comma-separated policy IDs
}

response = requests.post(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    params=params
)

print(response.text)
```

### List Compliance Policies

```python
url = 'https://qualysapi.qualys.com/api/2.0/fo/compliance/policy/'

params = {
    'action': 'list',
    'details': 'All'  # Get detailed information
}

response = requests.get(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    params=params
)

print(response.text)
```

### Manage Asset Groups for Policy

```python
# Add asset groups to policy
url = 'https://qualysapi.qualys.com/api/2.0/fo/compliance/policy/'

data = {
    'action': 'add_asset_group',
    'policy_id': '991742279',
    'asset_group_ids': '123,456'
}

response = requests.post(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    data=data
)

print(response.text)
```

```python
# Remove asset groups from policy
data = {
    'action': 'remove_asset_group',
    'policy_id': '991742279',
    'asset_group_ids': '123'
}

response = requests.post(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    data=data
)
```

## Compliance Controls

### List Compliance Controls

```python
url = 'https://qualysapi.qualys.com/api/2.0/fo/compliance/control/'

params = {
    'action': 'list',
    'details': 'All',  # Basic, All, or None
    'id_min': '100000',
    'id_max': '200000'
}

response = requests.post(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    data=params
)

print(response.text)
```

### Filter Controls by Date

```python
from datetime import datetime, timedelta

# Get controls updated in last 30 days
thirty_days_ago = (datetime.now() - timedelta(days=30)).isoformat() + 'Z'

params = {
    'action': 'list',
    'details': 'Basic',
    'updated_after_datetime': thirty_days_ago
}

response = requests.post(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    data=params
)
```

### Get Specific Controls

```python
params = {
    'action': 'list',
    'details': 'All',
    'ids': '100947,100948,100949'  # Specific control IDs
}

response = requests.post(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    data=params
)
```

## Scanning Operations

### Launch Compliance Scan

```python
url = 'https://qualysapi.qualys.com/api/2.0/fo/scan/compliance/'

data = {
    'action': 'launch',
    'ip': '10.10.25.52',
    'iscanner_name': 'scanner1',
    'option_title': 'Initial PC Options',
    'echo_request': '1'
}

response = requests.post(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    data=data
)

print(response.text)
```

### Launch VM Scan

```python
url = 'https://qualysapi.qualys.com/api/2.0/fo/scan/'

data = {
    'action': 'launch',
    'scan_title': 'API VM Scan',
    'option_id': '12345',
    'iscanner_name': 'scanner1',
    'ip': '10.10.10.10,10.10.10.11'
}

response = requests.post(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    data=data
)

print(response.text)
```

### List VM Scans

```python
url = 'https://qualysapi.qualys.com/api/2.0/fo/scan/'

params = {
    'action': 'list',
    'show_ags': '1'  # Show asset groups
}

response = requests.get(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    params=params
)

print(response.text)
```

### Manage Scans (Cancel, Pause, Resume, Delete)

```python
url = 'https://qualysapi.qualys.com/api/2.0/fo/scan/'

# Cancel scan
params = {
    'action': 'cancel',
    'scan_ref': 'scan/1344842952.1340'
}

response = requests.post(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    params=params
)
```

```python
# Pause scan
params = {
    'action': 'pause',
    'scan_ref': 'scan/1344842952.1340'
}

response = requests.post(url, auth=HTTPBasicAuth(username, password), headers=headers, params=params)
```

```python
# Resume scan
params = {
    'action': 'resume',
    'scan_ref': 'scan/1344842952.1340'
}

response = requests.post(url, auth=HTTPBasicAuth(username, password), headers=headers, params=params)
```

```python
# Delete scan
params = {
    'action': 'delete',
    'scan_ref': 'scan/1344842952.1340'
}

response = requests.post(url, auth=HTTPBasicAuth(username, password), headers=headers, params=params)
```

### Fetch Scan Results

```python
params = {
    'action': 'fetch',
    'scan_ref': 'scan/1344842952.1340'
}

response = requests.get(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    params=params
)

# Save results
with open('scan_results.xml', 'w') as f:
    f.write(response.text)
```

## Posture APIs v2.0

### Resolve Host IDs (v2.0)

```python
url = 'https://qualysapi.qualys.com/pcrs/2.0/posture/hostids'

headers = {
    'Authorization': 'Bearer YOUR_TOKEN'
}

params = {
    'policyId': 'policy123,policy456'
}

response = requests.get(url, headers=headers, params=params)
print(response.json())
```

### Get Posture Info (v2.0)

```python
url = 'https://qualysapi.qualys.com/pcrs/2.0/posture/postureInfo'

headers = {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
}

payload = [
    {
        "policyId": "policy123",
        "subscriptionId": "sub-abc-123",
        "hostIds": ["host-001", "host-002"]
    }
]

params = {
    'evidenceRequired': 0,
    'compressionRequired': 1
}

response = requests.post(url, headers=headers, params=params, json=payload)
print(response.json())
```

### List Policies (v2.0)

```python
url = 'https://qualysapi.qualys.com/pcrs/2.0/posture/policy/list'

headers = {
    'Authorization': 'Bearer YOUR_TOKEN'
}

params = {
    'lastEvaluationDate': '2024-01-01'
}

response = requests.get(url, headers=headers, params=params)
print(response.json())
```

## Complete Workflow Example

```python
import requests
from requests.auth import HTTPBasicAuth
import xml.etree.ElementTree as ET

class QualysComplianceAPI:
    def __init__(self, username, password):
        self.username = username
        self.password = password
        self.base_url = 'https://qualysapi.qualys.com/api/2.0/fo/'
        self.headers = {'X-Requested-With': 'Curl'}
    
    def list_policies(self, details='All'):
        url = f'{self.base_url}compliance/policy/'
        params = {'action': 'list', 'details': details}
        
        response = requests.get(
            url,
            auth=HTTPBasicAuth(self.username, self.password),
            headers=self.headers,
            params=params
        )
        return response.text
    
    def export_policy(self, policy_id, include_udc=True):
        url = f'{self.base_url}compliance/policy/'
        params = {
            'action': 'export',
            'ids': policy_id,
            'show_user_controls': '1' if include_udc else '0'
        }
        
        response = requests.get(
            url,
            auth=HTTPBasicAuth(self.username, self.password),
            headers=self.headers,
            params=params
        )
        return response.text
    
    def list_controls(self, details='Basic', id_min=None, id_max=None):
        url = f'{self.base_url}compliance/control/'
        params = {'action': 'list', 'details': details}
        
        if id_min:
            params['id_min'] = id_min
        if id_max:
            params['id_max'] = id_max
        
        response = requests.post(
            url,
            auth=HTTPBasicAuth(self.username, self.password),
            headers=self.headers,
            data=params
        )
        return response.text
    
    def launch_compliance_scan(self, ip, scanner_name, option_title):
        url = f'{self.base_url}scan/compliance/'
        data = {
            'action': 'launch',
            'ip': ip,
            'iscanner_name': scanner_name,
            'option_title': option_title
        }
        
        response = requests.post(
            url,
            auth=HTTPBasicAuth(self.username, self.password),
            headers=self.headers,
            data=data
        )
        return response.text

# Usage
api = QualysComplianceAPI('username', 'password')

# List all policies
policies = api.list_policies()
print("Policies:", policies)

# Export a specific policy
policy_xml = api.export_policy('991742279', include_udc=True)
with open('exported_policy.xml', 'w') as f:
    f.write(policy_xml)

# List controls
controls = api.list_controls(details='All', id_min=100000, id_max=200000)
print("Controls:", controls)

# Launch scan
scan_result = api.launch_compliance_scan(
    ip='10.10.25.52',
    scanner_name='scanner1',
    option_title='Initial PC Options'
)
print("Scan launched:", scan_result)
```

## Error Handling

```python
import requests
from requests.auth import HTTPBasicAuth
import xml.etree.ElementTree as ET

def make_qualys_request(url, auth, headers, method='post', **kwargs):
    try:
        if method.lower() == 'post':
            response = requests.post(url, auth=auth, headers=headers, timeout=30, **kwargs)
        else:
            response = requests.get(url, auth=auth, headers=headers, timeout=30, **kwargs)
        
        if response.status_code == 401:
            raise Exception("Authentication failed")
        elif response.status_code == 400:
            raise Exception(f"Bad request: {response.text}")
        elif response.status_code != 200:
            raise Exception(f"Request failed with status {response.status_code}")
        
        # Check for API errors in XML
        try:
            root = ET.fromstring(response.text)
            error = root.find('.//ERROR')
            if error is not None:
                code = error.find('CODE')
                message = error.find('MESSAGE')
                raise Exception(f"API Error {code.text if code is not None else 'Unknown'}: {message.text if message is not None else 'Unknown'}")
        except ET.ParseError:
            pass
        
        return response
        
    except requests.exceptions.Timeout:
        raise Exception("Request timed out")
    except requests.exceptions.RequestException as e:
        raise Exception(f"Request failed: {e}")

# Usage
try:
    response = make_qualys_request(
        'https://qualysapi.qualys.com/api/2.0/fo/compliance/policy/',
        HTTPBasicAuth(username, password),
        headers,
        method='get',
        params={'action': 'list'}
    )
    print("Success!", response.text)
except Exception as e:
    print(f"Error: {e}")
```

## Best Practices

1. **Use environment variables:**
```python
import os
username = os.environ.get('QUALYS_USERNAME')
password = os.environ.get('QUALYS_PASSWORD')
```

2. **Parse XML responses:**
```python
import xml.etree.ElementTree as ET
root = ET.fromstring(response.text)
policies = root.findall('.//POLICY')
```

3. **Save exported policies:**
```python
with open(f'policy_{policy_id}.xml', 'w') as f:
    f.write(response.text)
```

4. **Handle file uploads properly:**
```python
files = {'file': ('policy.xml', open('policy.xml', 'rb'), 'application/xml')}
```

5. **Use pagination for large datasets:**
```python
params = {'truncation_limit': 100}
```

## Key Features

- **Policy Management**: Export, import, merge policies
- **Control Management**: List and filter compliance controls
- **Scanning**: Launch VM and compliance scans
- **Posture APIs**: v2.0 posture monitoring (similar to v1.0)
- **Asset Management**: Add/remove asset groups and tags

## Notes

- **API Version**: v2.0
- **Authentication**: HTTP Basic Auth (policies/scans), Bearer Token (posture)
- **Response Format**: XML (policies/scans), JSON (posture)
- **Use Case**: Policy management and scanning operations
