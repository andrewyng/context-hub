---
name: policy-audit-v4
description: "Qualys Policy Audit API for compliance scanning, SCAP assessments, and policy evaluation against security standards"
metadata:
  languages: "javascript"
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
npm install axios
# or
npm install node-fetch
```

**Basic Setup with Axios:**
```javascript
const axios = require('axios');

// Credentials - use environment variables in production
const username = process.env.QUALYS_USERNAME || 'YOUR_USERNAME';
const password = process.env.QUALYS_PASSWORD || 'YOUR_PASSWORD';

// Base URL
const baseURL = 'https://qualysapi.qualys.com/';

// Create axios instance with auth
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

**Policy Compliance** in Qualys evaluates IT assets against internal and external policies, standards, and regulations (CIS benchmarks, NIST, HIPAA, PCI-DSS, etc.).

**Key Features:**
- Compliance scanning for configuration assessment
- SCAP (Security Content Automation Protocol) scanning
- Scanner appliance management
- Scan result retrieval and analysis

## Compliance Scans

### List Compliance Scans

Retrieve compliance scans from your account (default: past 30 days).

```javascript
const axios = require('axios');

const username = process.env.QUALYS_USERNAME;
const password = process.env.QUALYS_PASSWORD;

async function listComplianceScans() {
  try {
    const response = await axios.post(
      'https://qualysapi.qualys.com/api/2.0/fo/scan/compliance/',
      new URLSearchParams({
        action: 'list',
        state: 'Finished'
      }),
      {
        auth: {
          username: username,
          password: password
        },
        headers: {
          'X-Requested-With': 'Curl',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('Status:', response.status);
    console.log('Data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.status, error.message);
    throw error;
  }
}

listComplianceScans();
```

### Filter Scans by Reference

```javascript
async function getScanByReference(scanRef) {
  const response = await axios.post(
    'https://qualysapi.qualys.com/api/2.0/fo/scan/compliance/',
    new URLSearchParams({
      action: 'list',
      state: 'Finished',
      scan_ref: scanRef
    }),
    {
      auth: { username, password },
      headers: { 'X-Requested-With': 'Curl' }
    }
  );

  return response.data;
}

// Usage
getScanByReference('compliance/1344842952.1340');
```

### Filter by User and Date Range

```javascript
async function getScansByUserAndDate(userLogin, daysAgo = 7) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const launchedAfter = date.toISOString();

  const response = await axios.post(
    'https://qualysapi.qualys.com/api/2.0/fo/scan/compliance/',
    new URLSearchParams({
      action: 'list',
      user_login: userLogin,
      launched_after_datetime: launchedAfter,
      show_last: '1'  // v4 feature
    }),
    {
      auth: { username, password },
      headers: { 'X-Requested-With': 'Curl' }
    }
  );

  return response.data;
}

// Usage
getScansByUserAndDate('john.doe', 7);
```

### Launch a Compliance Scan

```javascript
async function launchComplianceScan(scanConfig) {
  const response = await axios.post(
    'https://qualysapi.qualys.com/api/2.0/fo/scan/compliance/',
    new URLSearchParams({
      action: 'launch',
      scan_title: scanConfig.title,
      ip: scanConfig.targetIP,
      iscanner_name: scanConfig.scannerName,
      option_title: scanConfig.optionTitle,
      echo_request: '1'
    }),
    {
      auth: { username, password },
      headers: { 'X-Requested-With': 'Curl' }
    }
  );

  console.log('Scan launched:', response.data);
  return response.data;
}

// Usage
launchComplianceScan({
  title: 'API Compliance Scan',
  targetIP: '10.10.25.52',
  scannerName: 'scanner1',
  optionTitle: 'Initial PC Options'
});
```

### Launch Scan with Asset Groups

```javascript
async function launchScanWithAssetGroups(assetGroupIds, optionId, scannerId) {
  const response = await axios.post(
    'https://qualysapi.qualys.com/api/2.0/fo/scan/compliance/',
    new URLSearchParams({
      action: 'launch',
      scan_title: 'Asset Group Compliance Scan',
      asset_group_ids: assetGroupIds.join(','),
      option_id: optionId.toString(),
      iscanner_id: scannerId.toString()
    }),
    {
      auth: { username, password },
      headers: { 'X-Requested-With': 'Curl' }
    }
  );

  return response.data;
}

// Usage
launchScanWithAssetGroups([12345, 67890], 3262, 777);
```

### Manage Compliance Scans

```javascript
async function manageScan(action, scanRef) {
  // action: 'cancel', 'pause', 'resume', 'delete', 'fetch'
  const response = await axios.get(
    'https://qualysapi.qualys.com/api/2.0/fo/scan/compliance/',
    {
      params: {
        action: action,
        scan_ref: scanRef
      },
      auth: { username, password },
      headers: { 'X-Requested-With': 'Curl' }
    }
  );

  return response.data;
}

// Cancel a scan
await manageScan('cancel', 'compliance/1347709693.37303');

// Pause a scan
await manageScan('pause', 'compliance/1347709693.37303');

// Resume a scan
await manageScan('resume', 'compliance/1347709693.37303');

// Delete a scan
await manageScan('delete', 'compliance/1347709693.37303');
```

### Fetch Scan Results

```javascript
const fs = require('fs').promises;

async function fetchScanResults(scanRef, outputFile) {
  const response = await axios.get(
    'https://qualysapi.qualys.com/api/2.0/fo/scan/compliance/',
    {
      params: {
        action: 'fetch',
        scan_ref: scanRef
      },
      auth: { username, password },
      headers: { 'X-Requested-With': 'Curl' }
    }
  );

  // Save to file
  await fs.writeFile(outputFile, response.data);
  console.log(`Scan results saved to ${outputFile}`);
  
  return response.data;
}

// Usage
fetchScanResults('compliance/1347709693.37303', 'compliance_results.xml');
```

## SCAP Scans

### List SCAP Scans

```javascript
async function listScapScans() {
  const response = await axios.post(
    'https://qualysapi.qualys.com/api/2.0/fo/scan/scap/',
    new URLSearchParams({
      action: 'list'
    }),
    {
      auth: { username, password },
      headers: { 'X-Requested-With': 'Curl' }
    }
  );

  return response.data;
}
```

### Filter SCAP Scans

```javascript
// By scan reference
async function getScapScanByRef(scanRef) {
  const response = await axios.post(
    'https://qualysapi.qualys.com/api/2.0/fo/scan/scap/',
    new URLSearchParams({
      action: 'list',
      scan_ref: scanRef
    }),
    {
      auth: { username, password },
      headers: { 'X-Requested-With': 'Curl' }
    }
  );

  return response.data;
}

// By type
async function getScapScansByType(type) {
  const response = await axios.post(
    'https://qualysapi.qualys.com/api/2.0/fo/scan/scap/',
    new URLSearchParams({
      action: 'list',
      type: type  // 'On-Demand' or 'Scheduled'
    }),
    {
      auth: { username, password },
      headers: { 'X-Requested-With': 'Curl' }
    }
  );

  return response.data;
}
```

## Scanner Appliance Management

### List Scanner Appliances

```javascript
async function listScannerAppliances(outputMode = 'full') {
  const response = await axios.post(
    'https://qualysapi.qualys.com/api/2.0/fo/appliance/',
    new URLSearchParams({
      action: 'list',
      output_mode: outputMode
    }),
    {
      auth: { username, password },
      headers: { 'X-Requested-With': 'Curl' }
    }
  );

  return response.data;
}
```

### List Specific Appliances with License Info

```javascript
async function getAppliancesWithLicense(applianceIds) {
  const response = await axios.post(
    'https://qualysapi.qualys.com/api/2.0/fo/appliance/',
    new URLSearchParams({
      action: 'list',
      ids: applianceIds.join(','),
      include_license_info: '1',
      echo_request: '1'
    }),
    {
      auth: { username, password },
      headers: { 'X-Requested-With': 'Curl' }
    }
  );

  return response.data;
}

// Usage
getAppliancesWithLicense([777, 1127, 1131]);
```

### List Virtual Appliances with Cloud Info

```javascript
async function listCloudAppliances(platformProvider = 'ec2') {
  const response = await axios.post(
    'https://qualysapi.qualys.com/api/2.0/fo/appliance/',
    new URLSearchParams({
      action: 'list',
      type: 'virtual',
      platform_provider: platformProvider,
      include_cloud_info: '1',
      output_mode: 'full'
    }),
    {
      auth: { username, password },
      headers: { 'X-Requested-With': 'Curl' }
    }
  );

  return response.data;
}
```

### Create Virtual Scanner Appliance

```javascript
async function createVirtualScanner(name, pollingInterval = 180) {
  const response = await axios.post(
    'https://qualysapi.qualys.com/api/2.0/fo/appliance/',
    null,
    {
      params: {
        action: 'create',
        name: name,  // Max 15 chars, no spaces
        polling_interval: pollingInterval  // 60-3600 seconds
      },
      auth: { username, password },
      headers: { 'X-Requested-With': 'Curl' }
    }
  );

  return response.data;
}

// Usage
createVirtualScanner('MyScanner', 180);
```

## Error Handling

```javascript
const axios = require('axios');
const { parseString } = require('xml2js');
const util = require('util');

const parseXML = util.promisify(parseString);

async function makeQualysRequest(url, data, method = 'post') {
  try {
    const config = {
      auth: { username, password },
      headers: { 'X-Requested-With': 'Curl' },
      timeout: 30000
    };

    let response;
    if (method === 'post') {
      response = await axios.post(url, new URLSearchParams(data), config);
    } else {
      response = await axios.get(url, { ...config, params: data });
    }

    // Check for API errors in XML
    try {
      const parsed = await parseXML(response.data);
      if (parsed.ERROR) {
        const code = parsed.ERROR.CODE?.[0];
        const message = parsed.ERROR.MESSAGE?.[0];
        throw new Error(`API Error ${code}: ${message}`);
      }
    } catch (e) {
      // Not XML or different format, continue
    }

    return response;

  } catch (error) {
    if (error.response) {
      // HTTP error
      if (error.response.status === 401) {
        throw new Error('Authentication failed. Check credentials.');
      } else if (error.response.status === 400) {
        throw new Error('Bad request. Check parameters.');
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
  const response = await makeQualysRequest(
    'https://qualysapi.qualys.com/api/2.0/fo/scan/compliance/',
    { action: 'list', state: 'Finished' }
  );
  console.log('Success!', response.data);
} catch (error) {
  console.error('Error:', error.message);
}
```

## Parsing XML Responses

```javascript
const { parseString } = require('xml2js');
const util = require('util');

const parseXML = util.promisify(parseString);

async function parseScanList(xmlResponse) {
  const result = await parseXML(xmlResponse);
  const scans = [];

  const scanList = result.SCAN_LIST_OUTPUT?.RESPONSE?.[0]?.SCAN_LIST?.[0]?.SCAN || [];
  
  for (const scan of scanList) {
    scans.push({
      id: scan.ID?.[0],
      ref: scan.REF?.[0],
      type: scan.TYPE?.[0],
      title: scan.TITLE?.[0],
      userLogin: scan.USER_LOGIN?.[0],
      launchDatetime: scan.LAUNCH_DATETIME?.[0],
      duration: scan.DURATION?.[0],
      state: scan.STATUS?.[0]?.STATE?.[0],
      target: scan.TARGET?.[0]
    });
  }

  return scans;
}

// Usage
const response = await axios.post(url, data, config);
const scans = await parseScanList(response.data);
scans.forEach(scan => {
  console.log(`Scan ${scan.id}: ${scan.title} - ${scan.state}`);
});
```

## Using with TypeScript

```typescript
import axios, { AxiosInstance } from 'axios';

interface QualysConfig {
  username: string;
  password: string;
  baseURL?: string;
}

interface ScanConfig {
  title: string;
  targetIP: string;
  scannerName: string;
  optionTitle: string;
}

class QualysPolicyAuditAPI {
  private client: AxiosInstance;

  constructor(config: QualysConfig) {
    this.client = axios.create({
      baseURL: config.baseURL || 'https://qualysapi.qualys.com/',
      auth: {
        username: config.username,
        password: config.password
      },
      headers: {
        'X-Requested-With': 'Curl'
      }
    });
  }

  async listComplianceScans(state?: string): Promise<string> {
    const params = new URLSearchParams({ action: 'list' });
    if (state) params.append('state', state);

    const response = await this.client.post(
      '/api/2.0/fo/scan/compliance/',
      params
    );
    return response.data;
  }

  async launchScan(config: ScanConfig): Promise<string> {
    const params = new URLSearchParams({
      action: 'launch',
      scan_title: config.title,
      ip: config.targetIP,
      iscanner_name: config.scannerName,
      option_title: config.optionTitle
    });

    const response = await this.client.post(
      '/api/2.0/fo/scan/compliance/',
      params
    );
    return response.data;
  }

  async fetchScanResults(scanRef: string): Promise<string> {
    const response = await this.client.get(
      '/api/2.0/fo/scan/compliance/',
      {
        params: {
          action: 'fetch',
          scan_ref: scanRef
        }
      }
    );
    return response.data;
  }
}

// Usage
const api = new QualysPolicyAuditAPI({
  username: process.env.QUALYS_USERNAME!,
  password: process.env.QUALYS_PASSWORD!
});

const scans = await api.listComplianceScans('Finished');
```

## Best Practices

1. **Use environment variables for credentials:**
```javascript
const username = process.env.QUALYS_USERNAME;
const password = process.env.QUALYS_PASSWORD;
```

2. **Include the required header:**
```javascript
headers: { 'X-Requested-With': 'Curl' }
```

3. **Handle timeouts:**
```javascript
const response = await axios.post(url, data, {
  auth: { username, password },
  timeout: 60000  // 60 seconds
});
```

4. **Use URLSearchParams for form data:**
```javascript
const params = new URLSearchParams({
  action: 'list',
  state: 'Finished'
});
```

5. **Parse XML responses with xml2js:**
```javascript
npm install xml2js
const { parseString } = require('xml2js');
```

6. **Save scan results to files:**
```javascript
const fs = require('fs').promises;
await fs.writeFile('scan_results.xml', response.data);
```

7. **Use async/await for cleaner code**

8. **Implement proper error handling** for both HTTP and API-level errors

## Common Parameters

- **action**: Required (list, launch, fetch, cancel, pause, resume, delete)
- **echo_request**: Set to `'1'` to echo request parameters
- **scan_ref**: Scan reference format `compliance/1234567890.12345`
- **state**: Filter by scan state (Finished, Running, Paused)
- **user_login**: Filter by user
- **launched_after_datetime**: ISO 8601 datetime filter
- **launched_before_datetime**: ISO 8601 datetime filter

## Response Format

All responses are in **XML format**. Use `xml2js` or similar libraries to parse.

**Success Response:**
```xml
<SCAN_LIST_OUTPUT>
  <RESPONSE>
    <DATETIME>2018-06-12T07:28:46Z</DATETIME>
    <SCAN_LIST>
      <SCAN>
        <ID>3332486</ID>
        <REF>compliance/1344842952.1340</REF>
        <STATE>Finished</STATE>
      </SCAN>
    </SCAN_LIST>
  </RESPONSE>
</SCAN_LIST_OUTPUT>
```

**Error Response:**
```xml
<ERROR>
  <CODE>401</CODE>
  <MESSAGE>Authentication failed</MESSAGE>
</ERROR>
```

## Notes

- **API Version**: Policy Audit API v4.0
- **Authentication**: HTTP Basic Auth required
- **Response Format**: XML only
- **Rate Limiting**: Implement exponential backoff for retries
- **Regional Endpoints**: Use appropriate endpoint for your region
- **Security**: Never commit credentials to version control
