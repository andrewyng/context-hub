---
name: policy-audit-v3
description: "Qualys Cloud Perimeter Scan API v3.0 for scanning cloud infrastructure across AWS, Azure, and GCP"
metadata:
  languages: "javascript"
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
npm install axios xml2js
```

**Basic Setup:**
```javascript
const axios = require('axios');

const username = process.env.QUALYS_USERNAME || 'YOUR_USERNAME';
const password = process.env.QUALYS_PASSWORD || 'YOUR_PASSWORD';

const baseURL = 'https://qualysapi.qualys.com/api/3.0/fo/scan/cloud/perimeter/';

const qualysAPI = axios.create({
  baseURL: baseURL,
  auth: {
    username: username,
    password: password
  },
  headers: {
    'X-Requested-With': 'Curl'
  }
});
```

## Core Concepts

**Cloud Perimeter Scanning** enables you to scan the external attack surface of your cloud infrastructure across multiple cloud providers (AWS, Azure, GCP). It automatically discovers and scans:
- Public-facing cloud resources
- Load balancers
- Application gateways
- Virtual machines with public IPs

## Create Cloud Perimeter Scan Job

```javascript
const axios = require('axios');

const username = process.env.QUALYS_USERNAME;
const password = process.env.QUALYS_PASSWORD;

async function createCloudScanJob(config) {
  const {
    scanTitle,
    cloudProvider,
    cloudService,
    connectorUuid,
    optionTitle,
    priority = '5',
    includeLB = false,
    includeAppGateway = false
  } = config;

  const data = new URLSearchParams({
    action: 'create',
    scan_title: scanTitle,
    configured_from_source: 'connector_module',
    source_scan_type: 'custom',
    module: 'vm',
    active: '1',
    schedule: 'now',
    option_title: optionTitle,
    priority: priority,
    cloud_provider: cloudProvider,
    cloud_service: cloudService,
    connector_uuid: connectorUuid
  });

  if (includeLB) {
    data.append('include_lb_from_connector', '1');
  }
  if (includeAppGateway) {
    data.append('include_app_gateway_lb_from_connector', '1');
  }

  try {
    const response = await axios.post(
      'https://qualysapi.qualys.com/api/3.0/fo/scan/cloud/perimeter/job/',
      data,
      {
        auth: { username, password },
        headers: { 'X-Requested-With': 'Curl' }
      }
    );

    console.log('Status:', response.status);
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.status, error.message);
    throw error;
  }
}

// Usage - Azure
createCloudScanJob({
  scanTitle: 'Azure VM Perimeter Scan',
  cloudProvider: 'azure',
  cloudService: 'vm',
  connectorUuid: 'your-connector-uuid',
  optionTitle: 'Initial Options',
  priority: '5',
  includeLB: true,
  includeAppGateway: true
});
```

### Create AWS Cloud Perimeter Scan

```javascript
async function createAWSScan() {
  return await createCloudScanJob({
    scanTitle: 'AWS EC2 Perimeter Scan',
    cloudProvider: 'aws',
    cloudService: 'ec2',
    connectorUuid: 'aws-connector-uuid',
    optionTitle: 'AWS Scan Options',
    priority: '3',
    includeLB: true
  });
}

createAWSScan();
```

### Create GCP Cloud Perimeter Scan

```javascript
async function createGCPScan() {
  return await createCloudScanJob({
    scanTitle: 'GCP Compute Perimeter Scan',
    cloudProvider: 'gcp',
    cloudService: 'compute',
    connectorUuid: 'gcp-connector-uuid',
    optionTitle: 'GCP Scan Options',
    priority: '4'
  });
}

createGCPScan();
```

## Update Cloud Perimeter Scan Job

```javascript
async function updateCloudScanJob(jobId, updates) {
  const data = new URLSearchParams({
    action: 'update',
    id: jobId,
    ...updates
  });

  try {
    const response = await axios.post(
      'https://qualysapi.qualys.com/api/3.0/fo/scan/cloud/perimeter/job/',
      data,
      {
        auth: { username, password },
        headers: { 'X-Requested-With': 'Curl' }
      }
    );

    console.log('Job updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.status, error.message);
    throw error;
  }
}

// Usage
updateCloudScanJob('1431330', {
  scan_title: 'Updated Azure VM Scan',
  active: '1',
  priority: '2',
  option_title: 'Updated Options'
});
```

## Schedule Cloud Perimeter Scan

```javascript
async function scheduleCloudScan(config) {
  const {
    scanTitle,
    cloudProvider,
    cloudService,
    connectorUuid,
    optionTitle,
    startDate,
    startHour,
    startMinute,
    timeZone = 'UTC'
  } = config;

  const data = new URLSearchParams({
    action: 'create',
    scan_title: scanTitle,
    configured_from_source: 'connector_module',
    source_scan_type: 'custom',
    module: 'vm',
    active: '1',
    schedule: 'scheduled',
    start_date: startDate,
    start_hour: startHour,
    start_minute: startMinute,
    time_zone_code: timeZone,
    option_title: optionTitle,
    cloud_provider: cloudProvider,
    cloud_service: cloudService,
    connector_uuid: connectorUuid
  });

  try {
    const response = await axios.post(
      'https://qualysapi.qualys.com/api/3.0/fo/scan/cloud/perimeter/job/',
      data,
      {
        auth: { username, password },
        headers: { 'X-Requested-With': 'Curl' }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.status, error.message);
    throw error;
  }
}

// Usage - Schedule for midnight UTC
scheduleCloudScan({
  scanTitle: 'Scheduled Cloud Scan',
  cloudProvider: 'azure',
  cloudService: 'vm',
  connectorUuid: 'connector-uuid',
  optionTitle: 'Scan Options',
  startDate: '2024-12-31',
  startHour: '00',
  startMinute: '00',
  timeZone: 'UTC'
});
```

## Complete Workflow Example

```javascript
const axios = require('axios');
const { parseString } = require('xml2js');
const util = require('util');

const parseXML = util.promisify(parseString);

class QualysCloudPerimeterAPI {
  constructor(username, password) {
    this.username = username;
    this.password = password;
    this.baseURL = 'https://qualysapi.qualys.com/api/3.0/fo/scan/cloud/perimeter/';
    this.headers = { 'X-Requested-With': 'Curl' };
  }

  async createScanJob(config) {
    const data = new URLSearchParams({
      action: 'create',
      scan_title: config.scanTitle,
      configured_from_source: 'connector_module',
      source_scan_type: 'custom',
      module: 'vm',
      active: '1',
      schedule: config.schedule || 'now',
      option_title: config.optionTitle,
      priority: config.priority || '5',
      cloud_provider: config.cloudProvider,
      cloud_service: config.cloudService,
      connector_uuid: config.connectorUuid
    });

    if (config.includeLB) {
      data.append('include_lb_from_connector', '1');
    }
    if (config.includeAppGateway) {
      data.append('include_app_gateway_lb_from_connector', '1');
    }

    const response = await axios.post(
      `${this.baseURL}job/`,
      data,
      {
        auth: { username: this.username, password: this.password },
        headers: this.headers
      }
    );

    return await this._parseResponse(response);
  }

  async updateScanJob(jobId, updates) {
    const data = new URLSearchParams({
      action: 'update',
      id: jobId,
      ...updates
    });

    const response = await axios.post(
      `${this.baseURL}job/`,
      data,
      {
        auth: { username: this.username, password: this.password },
        headers: this.headers
      }
    );

    return await this._parseResponse(response);
  }

  async _parseResponse(response) {
    if (response.status !== 200) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    try {
      const parsed = await parseXML(response.data);

      // Check for errors
      if (parsed.ERROR) {
        const code = parsed.ERROR.CODE?.[0];
        const message = parsed.ERROR.MESSAGE?.[0];
        throw new Error(`API Error ${code}: ${message}`);
      }

      // Extract job ID
      const simpleReturn = parsed.SIMPLE_RETURN;
      if (simpleReturn?.RESPONSE?.[0]?.ITEM_LIST?.[0]?.ITEM) {
        const items = simpleReturn.RESPONSE[0].ITEM_LIST[0].ITEM;
        const jobIdItem = items.find(item => item.KEY?.[0] === 'ID');
        
        return {
          success: true,
          jobId: jobIdItem?.VALUE?.[0],
          response: response.data
        };
      }

      return {
        success: true,
        response: response.data
      };

    } catch (e) {
      if (e.message.startsWith('API Error')) {
        throw e;
      }
      return {
        success: true,
        response: response.data
      };
    }
  }
}

// Usage
async function main() {
  const api = new QualysCloudPerimeterAPI(
    process.env.QUALYS_USERNAME,
    process.env.QUALYS_PASSWORD
  );

  try {
    // Create Azure scan
    const azureConfig = {
      scanTitle: 'Production Azure VMs',
      cloudProvider: 'azure',
      cloudService: 'vm',
      connectorUuid: 'azure-connector-123',
      optionTitle: 'Azure Scan Options',
      priority: '3',
      includeLB: true,
      includeAppGateway: true
    };

    const result = await api.createScanJob(azureConfig);
    console.log(`Scan created with ID: ${result.jobId}`);

    // Update the scan
    if (result.jobId) {
      await api.updateScanJob(result.jobId, {
        scan_title: 'Updated Production Azure VMs',
        priority: '1'
      });
      console.log('Scan updated successfully');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

## Multi-Cloud Scanning

```javascript
async function createMultiCloudScans(api, connectorConfigs) {
  const results = [];

  for (const [provider, config] of Object.entries(connectorConfigs)) {
    const scanConfig = {
      scanTitle: `${provider.toUpperCase()} Perimeter Scan`,
      cloudProvider: provider,
      cloudService: config.service,
      connectorUuid: config.connectorUuid,
      optionTitle: config.optionTitle,
      priority: config.priority || '5'
    };

    try {
      const result = await api.createScanJob(scanConfig);
      results.push({
        provider,
        success: true,
        jobId: result.jobId
      });
      console.log(`${provider.toUpperCase()} scan created: ${result.jobId}`);
    } catch (error) {
      results.push({
        provider,
        success: false,
        error: error.message
      });
      console.error(`${provider.toUpperCase()} scan failed:`, error.message);
    }
  }

  return results;
}

// Usage
const connectorConfigs = {
  aws: {
    service: 'ec2',
    connectorUuid: 'aws-connector-uuid',
    optionTitle: 'AWS Options',
    priority: '3'
  },
  azure: {
    service: 'vm',
    connectorUuid: 'azure-connector-uuid',
    optionTitle: 'Azure Options',
    priority: '3'
  },
  gcp: {
    service: 'compute',
    connectorUuid: 'gcp-connector-uuid',
    optionTitle: 'GCP Options',
    priority: '4'
  }
};

const api = new QualysCloudPerimeterAPI(
  process.env.QUALYS_USERNAME,
  process.env.QUALYS_PASSWORD
);

createMultiCloudScans(api, connectorConfigs);
```

## TypeScript Support

```typescript
import axios, { AxiosInstance } from 'axios';
import { parseString } from 'xml2js';
import { promisify } from 'util';

const parseXML = promisify(parseString);

interface ScanConfig {
  scanTitle: string;
  cloudProvider: 'aws' | 'azure' | 'gcp';
  cloudService: string;
  connectorUuid: string;
  optionTitle: string;
  priority?: string;
  schedule?: string;
  includeLB?: boolean;
  includeAppGateway?: boolean;
}

interface ScanResult {
  success: boolean;
  jobId?: string;
  response: string;
}

class QualysCloudPerimeterAPI {
  private username: string;
  private password: string;
  private baseURL: string;
  private headers: Record<string, string>;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
    this.baseURL = 'https://qualysapi.qualys.com/api/3.0/fo/scan/cloud/perimeter/';
    this.headers = { 'X-Requested-With': 'Curl' };
  }

  async createScanJob(config: ScanConfig): Promise<ScanResult> {
    const data = new URLSearchParams({
      action: 'create',
      scan_title: config.scanTitle,
      configured_from_source: 'connector_module',
      source_scan_type: 'custom',
      module: 'vm',
      active: '1',
      schedule: config.schedule || 'now',
      option_title: config.optionTitle,
      priority: config.priority || '5',
      cloud_provider: config.cloudProvider,
      cloud_service: config.cloudService,
      connector_uuid: config.connectorUuid
    });

    if (config.includeLB) {
      data.append('include_lb_from_connector', '1');
    }
    if (config.includeAppGateway) {
      data.append('include_app_gateway_lb_from_connector', '1');
    }

    const response = await axios.post(
      `${this.baseURL}job/`,
      data,
      {
        auth: { username: this.username, password: this.password },
        headers: this.headers
      }
    );

    return await this._parseResponse(response);
  }

  async updateScanJob(jobId: string, updates: Record<string, string>): Promise<ScanResult> {
    const data = new URLSearchParams({
      action: 'update',
      id: jobId,
      ...updates
    });

    const response = await axios.post(
      `${this.baseURL}job/`,
      data,
      {
        auth: { username: this.username, password: this.password },
        headers: this.headers
      }
    );

    return await this._parseResponse(response);
  }

  private async _parseResponse(response: any): Promise<ScanResult> {
    if (response.status !== 200) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    try {
      const parsed = await parseXML(response.data);

      if (parsed.ERROR) {
        const code = parsed.ERROR.CODE?.[0];
        const message = parsed.ERROR.MESSAGE?.[0];
        throw new Error(`API Error ${code}: ${message}`);
      }

      const simpleReturn = parsed.SIMPLE_RETURN;
      if (simpleReturn?.RESPONSE?.[0]?.ITEM_LIST?.[0]?.ITEM) {
        const items = simpleReturn.RESPONSE[0].ITEM_LIST[0].ITEM;
        const jobIdItem = items.find((item: any) => item.KEY?.[0] === 'ID');
        
        return {
          success: true,
          jobId: jobIdItem?.VALUE?.[0],
          response: response.data
        };
      }

      return {
        success: true,
        response: response.data
      };

    } catch (e: any) {
      if (e.message.startsWith('API Error')) {
        throw e;
      }
      return {
        success: true,
        response: response.data
      };
    }
  }
}

// Usage
const api = new QualysCloudPerimeterAPI(
  process.env.QUALYS_USERNAME!,
  process.env.QUALYS_PASSWORD!
);

const config: ScanConfig = {
  scanTitle: 'Azure Production Scan',
  cloudProvider: 'azure',
  cloudService: 'vm',
  connectorUuid: 'azure-connector-123',
  optionTitle: 'Azure Options',
  priority: '3',
  includeLB: true
};

const result = await api.createScanJob(config);
```

## Error Handling

```javascript
async function makeCloudScanRequest(url, data, auth, headers) {
  try {
    const response = await axios.post(url, data, {
      auth,
      headers,
      timeout: 30000
    });

    if (response.status !== 200) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    // Parse XML for API errors
    try {
      const parsed = await parseXML(response.data);
      if (parsed.ERROR) {
        const code = parsed.ERROR.CODE?.[0];
        const message = parsed.ERROR.MESSAGE?.[0];
        throw new Error(`API Error ${code}: ${message}`);
      }
    } catch (e) {
      if (e.message.startsWith('API Error')) {
        throw e;
      }
    }

    return response;

  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Authentication failed. Check credentials.');
      } else if (error.response.status === 400) {
        throw new Error(`Bad request: ${error.response.data}`);
      } else {
        throw new Error(`Request failed with status ${error.response.status}`);
      }
    } else if (error.request) {
      throw new Error('No response received from server');
    } else {
      throw error;
    }
  }
}

// Usage
try {
  const response = await makeCloudScanRequest(url, data, auth, headers);
  console.log('Success!', response.data);
} catch (error) {
  console.error('Error:', error.message);
}
```

## Best Practices

1. **Use environment variables:**
```javascript
const username = process.env.QUALYS_USERNAME;
const password = process.env.QUALYS_PASSWORD;
```

2. **Validate connector UUIDs:**
```javascript
function validateConnector(connectorUuid) {
  if (!connectorUuid || connectorUuid.length === 0) {
    throw new Error('Connector UUID is required');
  }
}
```

3. **Set appropriate scan priorities:**
```javascript
// Priority 1-10, where 1 is highest
const priority = '1';  // Critical production scans
const priority = '5';  // Normal scans
const priority = '10'; // Low priority scans
```

4. **Include load balancers for comprehensive coverage:**
```javascript
const config = {
  includeLB: true,
  includeAppGateway: true
};
```

5. **Schedule scans during off-peak hours:**
```javascript
const config = {
  schedule: 'scheduled',
  startHour: '02',  // 2 AM
  startMinute: '00',
  timeZone: 'UTC'
};
```

6. **Parse XML responses with xml2js:**
```javascript
const { parseString } = require('xml2js');
const util = require('util');
const parseXML = util.promisify(parseString);

const parsed = await parseXML(response.data);
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
