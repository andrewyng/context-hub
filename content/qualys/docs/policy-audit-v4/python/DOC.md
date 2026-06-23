---
name: policy-audit-v4
description: "Qualys Policy Audit API for compliance scanning, SCAP assessments, and policy evaluation against security standards"
metadata:
  languages: "python"
  versions: "4.0"
  updated-on: "2026-04-03"
  source: maintainer
  tags: "qualys,compliance,security,policy-audit,scap,scanning"
---

# Qualys Policy Audit API Coding Guidelines

You are a Qualys Policy Audit API expert. Help me write code using the Qualys Policy Audit API for compliance scanning and policy evaluation.

Official API documentation: https://qualysapi.qualys.com/

## Golden Rule: Authentication and Base URL

Always use HTTP Basic Authentication with Qualys API credentials.

**Base URL:** `https://qualysapi.qualys.com/`
**Authentication:** HTTP Basic Auth (username:password)

**Installation:**
```bash
pip install requests
```

**Basic Setup:**
```python
import requests
from requests.auth import HTTPBasicAuth

# Credentials - use environment variables in production
username = 'YOUR_USERNAME'
password = 'YOUR_PASSWORD'

# Base URL
base_url = 'https://qualysapi.qualys.com/'

# Required header
headers = {
    'X-Requested-With': 'Curl'
}
```

## Core Concepts

**Policy Compliance** in Qualys evaluates IT assets against internal and external policies, standards, and regulations (CIS benchmarks, NIST, HIPAA, PCI-DSS, etc.).

**Key Features:**
- Compliance scanning for configuration assessment
- SCAP (Security Content Automation Protocol) scanning
- Scanner appliance management
- Scan result retrieval and analysis

## Compliance Scans

### List Compliance Scans

Retrieve compliance scans from your account (default: past 30 days).

```python
import requests
from requests.auth import HTTPBasicAuth

username = 'YOUR_USERNAME'
password = 'YOUR_PASSWORD'

url = 'https://qualysapi.qualys.com/api/2.0/fo/scan/compliance/'
payload = {
    'action': 'list',
    'state': 'Finished'
}

headers = {
    'X-Requested-With': 'Curl'
}

response = requests.post(
    url, 
    auth=HTTPBasicAuth(username, password), 
    headers=headers, 
    data=payload
)

print(f"Status Code: {response.status_code}")
print(response.text)
```

### Filter Scans by Reference

```python
payload = {
    'action': 'list',
    'state': 'Finished',
    'scan_ref': 'compliance/1344842952.1340'
}

response = requests.post(
    url, 
    auth=HTTPBasicAuth(username, password), 
    headers=headers, 
    data=payload
)
```

### Filter by User and Date Range

```python
from datetime import datetime, timedelta

# Filter scans launched by specific user in last 7 days
seven_days_ago = (datetime.now() - timedelta(days=7)).isoformat() + 'Z'

payload = {
    'action': 'list',
    'user_login': 'john.doe',
    'launched_after_datetime': seven_days_ago,
    'show_last': '1'  # Include last scan details (v4 feature)
}

response = requests.post(
    url, 
    auth=HTTPBasicAuth(username, password), 
    headers=headers, 
    data=payload
)
```

### Launch a Compliance Scan

```python
url = 'https://qualysapi.qualys.com/api/2.0/fo/scan/compliance/'

payload = {
    'action': 'launch',
    'scan_title': 'API Compliance Scan',
    'ip': '10.10.25.52',
    'iscanner_name': 'scanner1',
    'option_title': 'Initial PC Options',
    'echo_request': '1'
}

response = requests.post(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    data=payload
)

print(f"Status Code: {response.status_code}")
print(response.text)
```

### Launch Scan with Asset Groups

```python
payload = {
    'action': 'launch',
    'scan_title': 'Asset Group Compliance Scan',
    'asset_group_ids': '12345,67890',  # Comma-separated IDs
    'option_id': '3262',
    'iscanner_id': '777'
}

response = requests.post(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    data=payload
)
```

### Manage Compliance Scans

**Cancel a Running Scan:**
```python
url = 'https://qualysapi.qualys.com/api/2.0/fo/scan/compliance/'

params = {
    'action': 'cancel',
    'scan_ref': 'compliance/1347709693.37303'
}

response = requests.get(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    params=params
)
```

**Pause a Scan:**
```python
params = {
    'action': 'pause',
    'scan_ref': 'compliance/1347709693.37303'
}

response = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers, params=params)
```

**Resume a Paused Scan:**
```python
params = {
    'action': 'resume',
    'scan_ref': 'compliance/1347709693.37303'
}

response = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers, params=params)
```

**Delete a Scan:**
```python
params = {
    'action': 'delete',
    'scan_ref': 'compliance/1347709693.37303'
}

response = requests.get(url, auth=HTTPBasicAuth(username, password), headers=headers, params=params)
```

### Fetch Scan Results

```python
url = 'https://qualysapi.qualys.com/api/2.0/fo/scan/compliance/'

params = {
    'action': 'fetch',
    'scan_ref': 'compliance/1347709693.37303'
}

response = requests.get(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    params=params
)

# Save results to file
with open('compliance_results.xml', 'w') as f:
    f.write(response.text)

print("Scan results saved to compliance_results.xml")
```

## SCAP Scans

### List SCAP Scans

```python
url = 'https://qualysapi.qualys.com/api/2.0/fo/scan/scap/'

payload = {
    'action': 'list'
}

response = requests.post(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    data=payload
)

print(response.text)
```

### Filter SCAP Scans

```python
# Filter by scan reference
payload = {
    'action': 'list',
    'scan_ref': 'qscap/1402642816.80342'
}

response = requests.post(url, auth=HTTPBasicAuth(username, password), headers=headers, data=payload)
```

```python
# Filter by type
payload = {
    'action': 'list',
    'type': 'On-Demand'
}

response = requests.post(url, auth=HTTPBasicAuth(username, password), headers=headers, data=payload)
```

## Scanner Appliance Management

### List Scanner Appliances

```python
url = 'https://qualysapi.qualys.com/api/2.0/fo/appliance/'

payload = {
    'action': 'list',
    'output_mode': 'full'
}

response = requests.post(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    data=payload
)

print(response.text)
```

### List Specific Appliances with License Info

```python
payload = {
    'action': 'list',
    'ids': '777,1127,1131',
    'include_license_info': '1',
    'echo_request': '1'
}

response = requests.post(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    data=payload
)
```

### List Virtual Appliances with Cloud Info

```python
payload = {
    'action': 'list',
    'type': 'virtual',
    'platform_provider': 'ec2',
    'include_cloud_info': '1',
    'output_mode': 'full'
}

response = requests.post(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    data=payload
)
```

### Filter Appliances by Status

```python
# List only idle appliances
payload = {
    'action': 'list',
    'busy': '0',
    'output_mode': 'brief'
}

response = requests.post(url, auth=HTTPBasicAuth(username, password), headers=headers, data=payload)
```

### Create Virtual Scanner Appliance

```python
url = 'https://qualysapi.qualys.com/api/2.0/fo/appliance/'

params = {
    'action': 'create',
    'name': 'MyVirtualScanner',  # Max 15 chars, no spaces
    'polling_interval': '180'     # Seconds (60-3600)
}

response = requests.post(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    params=params
)

print(response.text)
```

## Error Handling

```python
import requests
from requests.auth import HTTPBasicAuth
import xml.etree.ElementTree as ET

def make_qualys_request(url, payload, username, password):
    """Make a Qualys API request with error handling"""
    headers = {'X-Requested-With': 'Curl'}
    
    try:
        response = requests.post(
            url,
            auth=HTTPBasicAuth(username, password),
            headers=headers,
            data=payload,
            timeout=30
        )
        
        # Check HTTP status
        if response.status_code == 401:
            print("Authentication failed. Check credentials.")
            return None
        elif response.status_code == 400:
            print("Bad request. Check parameters.")
            print(response.text)
            return None
        elif response.status_code != 200:
            print(f"Request failed with status {response.status_code}")
            return None
        
        # Parse XML response for errors
        try:
            root = ET.fromstring(response.text)
            error = root.find('.//ERROR')
            if error is not None:
                code = error.find('CODE')
                message = error.find('MESSAGE')
                print(f"API Error {code.text if code is not None else 'Unknown'}: {message.text if message is not None else 'Unknown error'}")
                return None
        except ET.ParseError:
            pass  # Not XML or different format
        
        return response
        
    except requests.exceptions.Timeout:
        print("Request timed out")
        return None
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

# Usage
response = make_qualys_request(
    'https://qualysapi.qualys.com/api/2.0/fo/scan/compliance/',
    {'action': 'list', 'state': 'Finished'},
    username,
    password
)

if response:
    print("Success!")
    print(response.text)
```

## Parsing XML Responses

```python
import xml.etree.ElementTree as ET

def parse_scan_list(xml_response):
    """Parse compliance scan list XML response"""
    root = ET.fromstring(xml_response)
    scans = []
    
    for scan in root.findall('.//SCAN'):
        scan_data = {
            'id': scan.find('ID').text if scan.find('ID') is not None else None,
            'ref': scan.find('REF').text if scan.find('REF') is not None else None,
            'type': scan.find('TYPE').text if scan.find('TYPE') is not None else None,
            'title': scan.find('TITLE').text if scan.find('TITLE') is not None else None,
            'user_login': scan.find('USER_LOGIN').text if scan.find('USER_LOGIN') is not None else None,
            'launch_datetime': scan.find('LAUNCH_DATETIME').text if scan.find('LAUNCH_DATETIME') is not None else None,
            'duration': scan.find('DURATION').text if scan.find('DURATION') is not None else None,
            'state': scan.find('.//STATE').text if scan.find('.//STATE') is not None else None,
            'target': scan.find('TARGET').text if scan.find('TARGET') is not None else None
        }
        scans.append(scan_data)
    
    return scans

# Usage
response = requests.post(url, auth=HTTPBasicAuth(username, password), headers=headers, data=payload)
if response.status_code == 200:
    scans = parse_scan_list(response.text)
    for scan in scans:
        print(f"Scan {scan['id']}: {scan['title']} - {scan['state']}")
```

## Best Practices

1. **Always use environment variables for credentials:**
```python
import os
username = os.environ.get('QUALYS_USERNAME')
password = os.environ.get('QUALYS_PASSWORD')
```

2. **Include the required header:**
```python
headers = {'X-Requested-With': 'Curl'}
```

3. **Handle timeouts for long-running operations:**
```python
response = requests.post(url, auth=auth, headers=headers, data=payload, timeout=60)
```

4. **Use POST method for most API calls** (even for list operations)

5. **Parse XML responses carefully** - Qualys APIs return XML format

6. **Check for both HTTP errors and API-level errors** in the XML response

7. **Use `echo_request=1`** during development to debug request parameters

8. **Save scan results to files** for later analysis:
```python
with open(f'scan_{scan_ref.replace("/", "_")}.xml', 'w') as f:
    f.write(response.text)
```

## Common Parameters

- **action**: Required for most endpoints (list, launch, fetch, cancel, pause, resume, delete)
- **echo_request**: Set to `1` to echo request parameters in response
- **scan_ref**: Scan reference in format `compliance/1234567890.12345`
- **state**: Filter by scan state (Finished, Running, Paused, etc.)
- **user_login**: Filter by user who launched the scan
- **launched_after_datetime**: ISO 8601 datetime filter
- **launched_before_datetime**: ISO 8601 datetime filter

## Response Formats

All Qualys Policy Audit API responses are in **XML format**.

**Successful Response Example:**
```xml
<SCAN_LIST_OUTPUT>
  <RESPONSE>
    <DATETIME>2018-06-12T07:28:46Z</DATETIME>
    <SCAN_LIST>
      <SCAN>
        <ID>3332486</ID>
        <REF>compliance/1344842952.1340</REF>
        <TYPE>Scheduled</TYPE>
        <TITLE><![CDATA[MY PC Scan]]></TITLE>
        <USER_LOGIN>USERNAME</USER_LOGIN>
        <LAUNCH_DATETIME>2018-05-13T07:30:09Z</LAUNCH_DATETIME>
        <STATUS>
          <STATE>Finished</STATE>
        </STATUS>
      </SCAN>
    </SCAN_LIST>
  </RESPONSE>
</SCAN_LIST_OUTPUT>
```

**Error Response Example:**
```xml
<ERROR>
  <CODE>401</CODE>
  <MESSAGE>Authentication failed</MESSAGE>
</ERROR>
```

## Notes

- **API Version**: This documentation covers Policy Audit API v4.0
- **Deprecation Notices**: Some endpoints have End of Support (EOS) and End of Life (EOL) dates
- **Rate Limiting**: Qualys APIs have rate limits - implement retry logic with exponential backoff
- **Regional Endpoints**: Use the appropriate regional endpoint for your Qualys platform
- **XML Parsing**: Use `xml.etree.ElementTree` or `lxml` for parsing responses
- **Security**: Never hardcode credentials - use environment variables or secret management
