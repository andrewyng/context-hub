---
name: policy-audit-v2
description: "Qualys Compliance Policy API v2.0 for policy management, compliance controls, and scanning operations"
metadata:
  languages: "javascript"
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
npm install axios form-data
```

**Basic Setup:**
```javascript
const axios = require('axios');

const username = process.env.QUALYS_USERNAME || 'YOUR_USERNAME';
const password = process.env.QUALYS_PASSWORD || 'YOUR_PASSWORD';

const baseURL = 'https://qualysapi.qualys.com/api/2.0/fo/';

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

## Compliance Policy Management

### Export Compliance Policy

```javascript
const axios = require('axios');
const fs = require('fs').promises;

const username = process.env.QUALYS_USERNAME;
const password = process.env.QUALYS_PASSWORD;

async function exportPolicy(policyId, includeUserControls = true) {
  try {
    const response = await axios.get(
      'https://qualysapi.qualys.com/api/2.0/fo/compliance/policy/',
      {
        auth: { username, password },
        headers: { 'X-Requested-With': 'Curl' },
        params: {
          action: 'export',
          ids: policyId,
          show_user_controls: includeUserControls ? '1' : '0'
        }
      }
    );

    // Save to file
    await fs.writeFile('policy_export.xml', response.data);
    console.log('Policy exported successfully');
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.status, error.message);
    throw error;
  }
}

// Usage
exportPolicy('991742279', true);
```

### Import Compliance Policy

```javascript
const FormData = require('form-data');
const fs = require('fs');

async function importPolicy(policyFilePath) {
  const form = new FormData();
  form.append('action', 'import');
  form.append('file', fs.createReadStream(policyFilePath));

  try {
    const response = await axios.post(
      'https://qualysapi.qualys.com/api/2.0/fo/compliance/policy/',
      form,
      {
        auth: { username, password },
        headers: {
          'X-Requested-With': 'Curl',
          ...form.getHeaders()
        }
      }
    );

    console.log('Policy imported:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.status, error.message);
    throw error;
  }
}

// Usage
importPolicy('./policy.xml');
```

### Merge Compliance Policies

```javascript
async function mergePolicies(policyIds) {
  const ids = Array.isArray(policyIds) ? policyIds.join(',') : policyIds;

  try {
    const response = await axios.post(
      'https://qualysapi.qualys.com/api/2.0/fo/compliance/policy/',
      null,
      {
        auth: { username, password },
        headers: { 'X-Requested-With': 'Curl' },
        params: {
          action: 'merge',
          ids: ids
        }
      }
    );

    console.log('Policies merged:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.status, error.message);
    throw error;
  }
}

// Usage
mergePolicies(['111', '222', '333']);
```

### List Compliance Policies

```javascript
async function listPolicies(details = 'All') {
  try {
    const response = await axios.get(
      'https://qualysapi.qualys.com/api/2.0/fo/compliance/policy/',
      {
        auth: { username, password },
        headers: { 'X-Requested-With': 'Curl' },
        params: {
          action: 'list',
          details: details
        }
      }
    );

    console.log('Policies:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.status, error.message);
    throw error;
  }
}

// Usage
listPolicies('All');
```

### Manage Asset Groups for Policy

```javascript
async function addAssetGroups(policyId, assetGroupIds) {
  const ids = Array.isArray(assetGroupIds) ? assetGroupIds.join(',') : assetGroupIds;

  try {
    const response = await axios.post(
      'https://qualysapi.qualys.com/api/2.0/fo/compliance/policy/',
      new URLSearchParams({
        action: 'add_asset_group',
        policy_id: policyId,
        asset_group_ids: ids
      }),
      {
        auth: { username, password },
        headers: { 'X-Requested-With': 'Curl' }
      }
    );

    console.log('Asset groups added:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.status, error.message);
    throw error;
  }
}

async function removeAssetGroups(policyId, assetGroupIds) {
  const ids = Array.isArray(assetGroupIds) ? assetGroupIds.join(',') : assetGroupIds;

  try {
    const response = await axios.post(
      'https://qualysapi.qualys.com/api/2.0/fo/compliance/policy/',
      new URLSearchParams({
        action: 'remove_asset_group',
        policy_id: policyId,
        asset_group_ids: ids
      }),
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

// Usage
addAssetGroups('991742279', ['123', '456']);
removeAssetGroups('991742279', ['123']);
```

## Compliance Controls

### List Compliance Controls

```javascript
async function listControls(options = {}) {
  const {
    details = 'All',
    idMin = null,
    idMax = null,
    ids = null
  } = options;

  const params = {
    action: 'list',
    details: details
  };

  if (idMin) params.id_min = idMin;
  if (idMax) params.id_max = idMax;
  if (ids) params.ids = Array.isArray(ids) ? ids.join(',') : ids;

  try {
    const response = await axios.post(
      'https://qualysapi.qualys.com/api/2.0/fo/compliance/control/',
      new URLSearchParams(params),
      {
        auth: { username, password },
        headers: { 'X-Requested-With': 'Curl' }
      }
    );

    console.log('Controls:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.status, error.message);
    throw error;
  }
}

// Usage
listControls({ details: 'All', idMin: 100000, idMax: 200000 });
```

### Filter Controls by Date

```javascript
async function getRecentControls(daysAgo = 30) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const dateStr = date.toISOString();

  try {
    const response = await axios.post(
      'https://qualysapi.qualys.com/api/2.0/fo/compliance/control/',
      new URLSearchParams({
        action: 'list',
        details: 'Basic',
        updated_after_datetime: dateStr
      }),
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

// Usage
getRecentControls(30);
```

### Get Specific Controls

```javascript
async function getSpecificControls(controlIds) {
  const ids = Array.isArray(controlIds) ? controlIds.join(',') : controlIds;

  try {
    const response = await axios.post(
      'https://qualysapi.qualys.com/api/2.0/fo/compliance/control/',
      new URLSearchParams({
        action: 'list',
        details: 'All',
        ids: ids
      }),
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

// Usage
getSpecificControls(['100947', '100948', '100949']);
```

## Scanning Operations

### Launch Compliance Scan

```javascript
async function launchComplianceScan(config) {
  const {
    ip,
    scannerName,
    optionTitle,
    echoRequest = true
  } = config;

  try {
    const response = await axios.post(
      'https://qualysapi.qualys.com/api/2.0/fo/scan/compliance/',
      new URLSearchParams({
        action: 'launch',
        ip: ip,
        iscanner_name: scannerName,
        option_title: optionTitle,
        echo_request: echoRequest ? '1' : '0'
      }),
      {
        auth: { username, password },
        headers: { 'X-Requested-With': 'Curl' }
      }
    );

    console.log('Scan launched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.status, error.message);
    throw error;
  }
}

// Usage
launchComplianceScan({
  ip: '10.10.25.52',
  scannerName: 'scanner1',
  optionTitle: 'Initial PC Options'
});
```

### Launch VM Scan

```javascript
async function launchVMScan(config) {
  const {
    scanTitle,
    optionId,
    scannerName,
    ipAddresses
  } = config;

  const ips = Array.isArray(ipAddresses) ? ipAddresses.join(',') : ipAddresses;

  try {
    const response = await axios.post(
      'https://qualysapi.qualys.com/api/2.0/fo/scan/',
      new URLSearchParams({
        action: 'launch',
        scan_title: scanTitle,
        option_id: optionId,
        iscanner_name: scannerName,
        ip: ips
      }),
      {
        auth: { username, password },
        headers: { 'X-Requested-With': 'Curl' }
      }
    );

    console.log('VM Scan launched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.status, error.message);
    throw error;
  }
}

// Usage
launchVMScan({
  scanTitle: 'API VM Scan',
  optionId: '12345',
  scannerName: 'scanner1',
  ipAddresses: ['10.10.10.10', '10.10.10.11']
});
```

### List VM Scans

```javascript
async function listVMScans(showAssetGroups = true) {
  try {
    const response = await axios.get(
      'https://qualysapi.qualys.com/api/2.0/fo/scan/',
      {
        auth: { username, password },
        headers: { 'X-Requested-With': 'Curl' },
        params: {
          action: 'list',
          show_ags: showAssetGroups ? '1' : '0'
        }
      }
    );

    console.log('VM Scans:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.status, error.message);
    throw error;
  }
}

// Usage
listVMScans(true);
```

### Manage Scans

```javascript
async function manageScan(action, scanRef) {
  // action: 'cancel', 'pause', 'resume', 'delete', 'fetch'
  try {
    const response = await axios.post(
      'https://qualysapi.qualys.com/api/2.0/fo/scan/',
      null,
      {
        auth: { username, password },
        headers: { 'X-Requested-With': 'Curl' },
        params: {
          action: action,
          scan_ref: scanRef
        }
      }
    );

    console.log(`Scan ${action}:`, response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.status, error.message);
    throw error;
  }
}

// Usage examples
await manageScan('cancel', 'scan/1344842952.1340');
await manageScan('pause', 'scan/1344842952.1340');
await manageScan('resume', 'scan/1344842952.1340');
await manageScan('delete', 'scan/1344842952.1340');
```

### Fetch Scan Results

```javascript
const fs = require('fs').promises;

async function fetchScanResults(scanRef, outputFile) {
  try {
    const response = await axios.get(
      'https://qualysapi.qualys.com/api/2.0/fo/scan/',
      {
        auth: { username, password },
        headers: { 'X-Requested-With': 'Curl' },
        params: {
          action: 'fetch',
          scan_ref: scanRef
        }
      }
    );

    // Save to file
    await fs.writeFile(outputFile, response.data);
    console.log(`Scan results saved to ${outputFile}`);
    
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.status, error.message);
    throw error;
  }
}

// Usage
fetchScanResults('scan/1344842952.1340', 'scan_results.xml');
```

## Posture APIs v2.0

### Resolve Host IDs (v2.0)

```javascript
async function getHostIds(policyIds) {
  const ids = Array.isArray(policyIds) ? policyIds.join(',') : policyIds;

  try {
    const response = await axios.get(
      'https://qualysapi.qualys.com/pcrs/2.0/posture/hostids',
      {
        headers: {
          'Authorization': `Bearer ${process.env.QUALYS_AUTH_TOKEN}`
        },
        params: {
          policyId: ids
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.status, error.message);
    throw error;
  }
}

// Usage
getHostIds(['policy123', 'policy456']);
```

### Get Posture Info (v2.0)

```javascript
async function getPostureInfo(policyHostData, options = {}) {
  const {
    evidenceRequired = 0,
    compressionRequired = 1
  } = options;

  try {
    const response = await axios.post(
      'https://qualysapi.qualys.com/pcrs/2.0/posture/postureInfo',
      policyHostData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.QUALYS_AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        },
        params: {
          evidenceRequired,
          compressionRequired
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.status, error.message);
    throw error;
  }
}

// Usage
const policyHostData = [
  {
    policyId: 'policy123',
    subscriptionId: 'sub-abc-123',
    hostIds: ['host-001', 'host-002']
  }
];

getPostureInfo(policyHostData, { evidenceRequired: 0 });
```

### List Policies (v2.0)

```javascript
async function listPosturePolicies(lastEvaluationDate = null) {
  const params = {};
  if (lastEvaluationDate) {
    params.lastEvaluationDate = lastEvaluationDate;
  }

  try {
    const response = await axios.get(
      'https://qualysapi.qualys.com/pcrs/2.0/posture/policy/list',
      {
        headers: {
          'Authorization': `Bearer ${process.env.QUALYS_AUTH_TOKEN}`
        },
        params
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.status, error.message);
    throw error;
  }
}

// Usage
listPosturePolicies('2024-01-01');
```

## Complete Workflow Example

```javascript
const axios = require('axios');
const fs = require('fs').promises;

class QualysComplianceAPI {
  constructor(username, password) {
    this.username = username;
    this.password = password;
    this.baseURL = 'https://qualysapi.qualys.com/api/2.0/fo/';
    this.headers = { 'X-Requested-With': 'Curl' };
  }

  async listPolicies(details = 'All') {
    const response = await axios.get(
      `${this.baseURL}compliance/policy/`,
      {
        auth: { username: this.username, password: this.password },
        headers: this.headers,
        params: { action: 'list', details }
      }
    );
    return response.data;
  }

  async exportPolicy(policyId, includeUDC = true) {
    const response = await axios.get(
      `${this.baseURL}compliance/policy/`,
      {
        auth: { username: this.username, password: this.password },
        headers: this.headers,
        params: {
          action: 'export',
          ids: policyId,
          show_user_controls: includeUDC ? '1' : '0'
        }
      }
    );
    return response.data;
  }

  async listControls(details = 'Basic', idMin = null, idMax = null) {
    const params = { action: 'list', details };
    if (idMin) params.id_min = idMin;
    if (idMax) params.id_max = idMax;

    const response = await axios.post(
      `${this.baseURL}compliance/control/`,
      new URLSearchParams(params),
      {
        auth: { username: this.username, password: this.password },
        headers: this.headers
      }
    );
    return response.data;
  }

  async launchComplianceScan(ip, scannerName, optionTitle) {
    const response = await axios.post(
      `${this.baseURL}scan/compliance/`,
      new URLSearchParams({
        action: 'launch',
        ip,
        iscanner_name: scannerName,
        option_title: optionTitle
      }),
      {
        auth: { username: this.username, password: this.password },
        headers: this.headers
      }
    );
    return response.data;
  }
}

// Usage
async function main() {
  const api = new QualysComplianceAPI(
    process.env.QUALYS_USERNAME,
    process.env.QUALYS_PASSWORD
  );

  try {
    // List all policies
    const policies = await api.listPolicies();
    console.log('Policies:', policies);

    // Export a specific policy
    const policyXML = await api.exportPolicy('991742279', true);
    await fs.writeFile('exported_policy.xml', policyXML);
    console.log('Policy exported');

    // List controls
    const controls = await api.listControls('All', 100000, 200000);
    console.log('Controls:', controls);

    // Launch scan
    const scanResult = await api.launchComplianceScan(
      '10.10.25.52',
      'scanner1',
      'Initial PC Options'
    );
    console.log('Scan launched:', scanResult);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

## TypeScript Support

```typescript
import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';

interface PolicyConfig {
  details?: string;
}

interface ControlConfig {
  details?: string;
  idMin?: number;
  idMax?: number;
  ids?: string[];
}

interface ScanConfig {
  ip: string;
  scannerName: string;
  optionTitle: string;
  echoRequest?: boolean;
}

class QualysComplianceAPI {
  private username: string;
  private password: string;
  private baseURL: string;
  private headers: Record<string, string>;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
    this.baseURL = 'https://qualysapi.qualys.com/api/2.0/fo/';
    this.headers = { 'X-Requested-With': 'Curl' };
  }

  async listPolicies(details: string = 'All'): Promise<string> {
    const response = await axios.get(
      `${this.baseURL}compliance/policy/`,
      {
        auth: { username: this.username, password: this.password },
        headers: this.headers,
        params: { action: 'list', details }
      }
    );
    return response.data;
  }

  async exportPolicy(policyId: string, includeUDC: boolean = true): Promise<string> {
    const response = await axios.get(
      `${this.baseURL}compliance/policy/`,
      {
        auth: { username: this.username, password: this.password },
        headers: this.headers,
        params: {
          action: 'export',
          ids: policyId,
          show_user_controls: includeUDC ? '1' : '0'
        }
      }
    );
    return response.data;
  }

  async launchComplianceScan(config: ScanConfig): Promise<string> {
    const response = await axios.post(
      `${this.baseURL}scan/compliance/`,
      new URLSearchParams({
        action: 'launch',
        ip: config.ip,
        iscanner_name: config.scannerName,
        option_title: config.optionTitle,
        echo_request: config.echoRequest ? '1' : '0'
      }),
      {
        auth: { username: this.username, password: this.password },
        headers: this.headers
      }
    );
    return response.data;
  }
}

// Usage
const api = new QualysComplianceAPI(
  process.env.QUALYS_USERNAME!,
  process.env.QUALYS_PASSWORD!
);

const policies = await api.listPolicies('All');
const policyXML = await api.exportPolicy('991742279');
```

## Error Handling

```javascript
async function makeQualysRequest(url, options = {}) {
  try {
    const response = await axios({
      url,
      timeout: 30000,
      ...options
    });

    return response.data;

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
```

## Best Practices

1. **Use environment variables:**
```javascript
const username = process.env.QUALYS_USERNAME;
const password = process.env.QUALYS_PASSWORD;
```

2. **Parse XML responses with xml2js:**
```javascript
const { parseString } = require('xml2js');
const util = require('util');
const parseXML = util.promisify(parseString);

const parsed = await parseXML(response.data);
```

3. **Save exported policies:**
```javascript
await fs.writeFile(`policy_${policyId}.xml`, response.data);
```

4. **Handle file uploads with FormData:**
```javascript
const form = new FormData();
form.append('file', fs.createReadStream('policy.xml'));
```

5. **Use URLSearchParams for form data:**
```javascript
const params = new URLSearchParams({
  action: 'list',
  details: 'All'
});
```

## Key Features

- **Policy Management**: Export, import, merge policies
- **Control Management**: List and filter compliance controls
- **Scanning**: Launch VM and compliance scans
- **Posture APIs**: v2.0 posture monitoring
- **Asset Management**: Add/remove asset groups and tags

## Notes

- **API Version**: v2.0
- **Authentication**: HTTP Basic Auth (policies/scans), Bearer Token (posture)
- **Response Format**: XML (policies/scans), JSON (posture)
- **Use Case**: Policy management and scanning operations
