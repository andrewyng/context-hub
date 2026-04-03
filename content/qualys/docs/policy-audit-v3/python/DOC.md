---
name: policy-audit-v3
description: "Qualys Cloud Perimeter Scan API v3.0 for scanning cloud infrastructure across AWS, Azure, and GCP"
metadata:
  languages: "python"
  versions: "3.0"
  updated-on: "2026-04-03"
  source: maintainer
  tags: "qualys,cloud,perimeter,scanning,aws,azure,gcp"
---

# Qualys Cloud Perimeter Scan API v3.0 Coding Guidelines

You are a Qualys Cloud Perimeter Scan API expert. Help me write code using the Qualys API v3.0 for cloud infrastructure perimeter scanning.

Official API documentation: https://qualysapi.qualys.com/

## Golden Rule: Authentication and Base URL

**Base URL:** `https://qualysapi.qualys.com/api/3.0/fo/scan/cloud/perimeter/`
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

base_url = 'https://qualysapi.qualys.com/api/3.0/fo/scan/cloud/perimeter/'

headers = {
    'X-Requested-With': 'Curl'
}
```

## Core Concepts

**Cloud Perimeter Scanning** enables you to scan the external attack surface of your cloud infrastructure across multiple cloud providers (AWS, Azure, GCP). It automatically discovers and scans:
- Public-facing cloud resources
- Load balancers
- Application gateways
- Virtual machines with public IPs

## Create Cloud Perimeter Scan Job

```python
import requests
from requests.auth import HTTPBasicAuth

username = 'YOUR_USERNAME'
password = 'YOUR_PASSWORD'

url = 'https://qualysapi.qualys.com/api/3.0/fo/scan/cloud/perimeter/job/'

data = {
    'action': 'create',
    'scan_title': 'Azure VM Perimeter Scan',
    'configured_from_source': 'connector_module',
    'source_scan_type': 'custom',
    'module': 'vm',
    'active': '1',
    'schedule': 'now',
    'option_title': 'Initial Options',
    'priority': '5',
    'cloud_provider': 'azure',
    'cloud_service': 'vm',
    'connector_uuid': 'your-connector-uuid',
    'include_lb_from_connector': '1',
    'include_app_gateway_lb_from_connector': '1'
}

headers = {'X-Requested-With': 'Curl'}

response = requests.post(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    data=data
)

print(f"Status Code: {response.status_code}")
print(response.text)
```

### Create AWS Cloud Perimeter Scan

```python
data = {
    'action': 'create',
    'scan_title': 'AWS EC2 Perimeter Scan',
    'configured_from_source': 'connector_module',
    'source_scan_type': 'custom',
    'module': 'vm',
    'active': '1',
    'schedule': 'now',
    'option_title': 'AWS Scan Options',
    'priority': '3',
    'cloud_provider': 'aws',
    'cloud_service': 'ec2',
    'connector_uuid': 'aws-connector-uuid',
    'include_lb_from_connector': '1'
}

response = requests.post(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    data=data
)
```

### Create GCP Cloud Perimeter Scan

```python
data = {
    'action': 'create',
    'scan_title': 'GCP Compute Perimeter Scan',
    'configured_from_source': 'connector_module',
    'source_scan_type': 'custom',
    'module': 'vm',
    'active': '1',
    'schedule': 'now',
    'option_title': 'GCP Scan Options',
    'priority': '4',
    'cloud_provider': 'gcp',
    'cloud_service': 'compute',
    'connector_uuid': 'gcp-connector-uuid'
}

response = requests.post(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    data=data
)
```

## Update Cloud Perimeter Scan Job

```python
url = 'https://qualysapi.qualys.com/api/3.0/fo/scan/cloud/perimeter/job/'

data = {
    'action': 'update',
    'id': '1431330',  # Job ID from create response
    'scan_title': 'Updated Azure VM Scan',
    'active': '1',
    'priority': '2',
    'option_title': 'Updated Options'
}

response = requests.post(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    data=data
)

print("Job updated:", response.text)
```

## Schedule Cloud Perimeter Scan

```python
# Schedule for later
data = {
    'action': 'create',
    'scan_title': 'Scheduled Cloud Scan',
    'configured_from_source': 'connector_module',
    'source_scan_type': 'custom',
    'module': 'vm',
    'active': '1',
    'schedule': 'scheduled',  # Instead of 'now'
    'start_date': '2024-12-31',
    'start_hour': '23',
    'start_minute': '00',
    'time_zone_code': 'UTC',
    'option_title': 'Scan Options',
    'cloud_provider': 'azure',
    'cloud_service': 'vm',
    'connector_uuid': 'connector-uuid'
}

response = requests.post(
    url,
    auth=HTTPBasicAuth(username, password),
    headers=headers,
    data=data
)
```

## Complete Workflow Example

```python
import requests
from requests.auth import HTTPBasicAuth
import xml.etree.ElementTree as ET

class QualysCloudPerimeterAPI:
    def __init__(self, username, password):
        self.username = username
        self.password = password
        self.base_url = 'https://qualysapi.qualys.com/api/3.0/fo/scan/cloud/perimeter/'
        self.headers = {'X-Requested-With': 'Curl'}
    
    def create_scan_job(self, config):
        """
        Create a cloud perimeter scan job
        
        Args:
            config (dict): Scan configuration with required fields:
                - scan_title
                - cloud_provider (aws, azure, gcp)
                - cloud_service (ec2, vm, compute)
                - connector_uuid
                - option_title
        """
        data = {
            'action': 'create',
            'scan_title': config['scan_title'],
            'configured_from_source': 'connector_module',
            'source_scan_type': 'custom',
            'module': 'vm',
            'active': '1',
            'schedule': config.get('schedule', 'now'),
            'option_title': config['option_title'],
            'priority': config.get('priority', '5'),
            'cloud_provider': config['cloud_provider'],
            'cloud_service': config['cloud_service'],
            'connector_uuid': config['connector_uuid']
        }
        
        # Add optional parameters
        if config.get('include_lb'):
            data['include_lb_from_connector'] = '1'
        if config.get('include_app_gateway'):
            data['include_app_gateway_lb_from_connector'] = '1'
        
        response = requests.post(
            f'{self.base_url}job/',
            auth=HTTPBasicAuth(self.username, self.password),
            headers=self.headers,
            data=data
        )
        
        return self._parse_response(response)
    
    def update_scan_job(self, job_id, updates):
        """Update an existing scan job"""
        data = {
            'action': 'update',
            'id': job_id,
            **updates
        }
        
        response = requests.post(
            f'{self.base_url}job/',
            auth=HTTPBasicAuth(self.username, self.password),
            headers=self.headers,
            data=data
        )
        
        return self._parse_response(response)
    
    def _parse_response(self, response):
        """Parse XML response and extract job ID"""
        if response.status_code != 200:
            raise Exception(f"Request failed with status {response.status_code}")
        
        try:
            root = ET.fromstring(response.text)
            
            # Check for errors
            error = root.find('.//ERROR')
            if error is not None:
                code = error.find('CODE')
                message = error.find('MESSAGE')
                raise Exception(f"API Error {code.text if code is not None else 'Unknown'}: {message.text if message is not None else 'Unknown'}")
            
            # Extract job ID
            job_id_elem = root.find('.//ITEM[KEY="ID"]/VALUE')
            if job_id_elem is not None:
                return {
                    'success': True,
                    'job_id': job_id_elem.text,
                    'response': response.text
                }
            
            return {
                'success': True,
                'response': response.text
            }
            
        except ET.ParseError:
            return {
                'success': True,
                'response': response.text
            }

# Usage
api = QualysCloudPerimeterAPI('username', 'password')

# Create Azure scan
azure_config = {
    'scan_title': 'Production Azure VMs',
    'cloud_provider': 'azure',
    'cloud_service': 'vm',
    'connector_uuid': 'azure-connector-123',
    'option_title': 'Azure Scan Options',
    'priority': '3',
    'include_lb': True,
    'include_app_gateway': True
}

result = api.create_scan_job(azure_config)
print(f"Scan created with ID: {result.get('job_id')}")

# Update the scan
if result.get('job_id'):
    api.update_scan_job(
        result['job_id'],
        {
            'scan_title': 'Updated Production Azure VMs',
            'priority': '1'
        }
    )
```

## Multi-Cloud Scanning

```python
def create_multi_cloud_scans(api, connector_configs):
    """Create scans across multiple cloud providers"""
    results = []
    
    for provider, config in connector_configs.items():
        scan_config = {
            'scan_title': f'{provider.upper()} Perimeter Scan',
            'cloud_provider': provider,
            'cloud_service': config['service'],
            'connector_uuid': config['connector_uuid'],
            'option_title': config['option_title'],
            'priority': config.get('priority', '5')
        }
        
        try:
            result = api.create_scan_job(scan_config)
            results.append({
                'provider': provider,
                'success': True,
                'job_id': result.get('job_id')
            })
            print(f"{provider.upper()} scan created: {result.get('job_id')}")
        except Exception as e:
            results.append({
                'provider': provider,
                'success': False,
                'error': str(e)
            })
            print(f"{provider.upper()} scan failed: {e}")
    
    return results

# Usage
connector_configs = {
    'aws': {
        'service': 'ec2',
        'connector_uuid': 'aws-connector-uuid',
        'option_title': 'AWS Options',
        'priority': '3'
    },
    'azure': {
        'service': 'vm',
        'connector_uuid': 'azure-connector-uuid',
        'option_title': 'Azure Options',
        'priority': '3'
    },
    'gcp': {
        'service': 'compute',
        'connector_uuid': 'gcp-connector-uuid',
        'option_title': 'GCP Options',
        'priority': '4'
    }
}

results = create_multi_cloud_scans(api, connector_configs)
```

## Error Handling

```python
import requests
from requests.auth import HTTPBasicAuth
import xml.etree.ElementTree as ET

def make_cloud_scan_request(url, auth, headers, data):
    """Make cloud perimeter scan request with error handling"""
    try:
        response = requests.post(
            url,
            auth=auth,
            headers=headers,
            data=data,
            timeout=30
        )
        
        if response.status_code == 401:
            raise Exception("Authentication failed")
        elif response.status_code == 400:
            raise Exception(f"Bad request: {response.text}")
        elif response.status_code != 200:
            raise Exception(f"Request failed with status {response.status_code}")
        
        # Parse XML for API errors
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
    response = make_cloud_scan_request(
        url,
        HTTPBasicAuth(username, password),
        headers,
        data
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

2. **Validate connector UUIDs before creating scans:**
```python
def validate_connector(connector_uuid):
    # Check if connector exists and is active
    pass
```

3. **Set appropriate scan priorities:**
```python
# Priority 1-10, where 1 is highest
data['priority'] = '1'  # Critical production scans
data['priority'] = '5'  # Normal scans
data['priority'] = '10'  # Low priority scans
```

4. **Include load balancers for comprehensive coverage:**
```python
data['include_lb_from_connector'] = '1'
data['include_app_gateway_lb_from_connector'] = '1'
```

5. **Schedule scans during off-peak hours:**
```python
data['schedule'] = 'scheduled'
data['start_hour'] = '02'  # 2 AM
data['start_minute'] = '00'
```

## Cloud Provider Specifics

### AWS
- **Cloud Provider**: `aws`
- **Cloud Service**: `ec2`
- **Supports**: EC2 instances, ELB load balancers

### Azure
- **Cloud Provider**: `azure`
- **Cloud Service**: `vm`
- **Supports**: Virtual machines, load balancers, application gateways

### GCP
- **Cloud Provider**: `gcp`
- **Cloud Service**: `compute`
- **Supports**: Compute Engine instances, load balancers

## Notes

- **API Version**: v3.0
- **Authentication**: HTTP Basic Auth
- **Response Format**: XML
- **Use Case**: Cloud infrastructure perimeter scanning
- **Connector Required**: Must have cloud connectors configured
- **Automatic Discovery**: Scans automatically discover public-facing resources
