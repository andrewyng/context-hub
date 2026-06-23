---
name: policy-audit-v1
description: "Qualys Posture API v1.0 for continuous compliance posture monitoring and host policy evaluation"
metadata:
  languages: "javascript"
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
npm install axios
```

**Basic Setup:**
```javascript
const axios = require('axios');

// Authentication token - use environment variables in production
const authToken = process.env.QUALYS_AUTH_TOKEN || 'YOUR_AUTH_TOKEN';

// Base URL - replace <assigned-url> with your Qualys gateway URL
const baseURL = 'https://gateway.<assigned-url>/pcrs/1.0/posture/';

// Create axios instance with auth
const qualysAPI = axios.create({
  baseURL: baseURL,
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  }
});
```

## Core Concepts

**Posture API** provides continuous compliance posture information for hosts evaluated against policies. It tracks:
- Host compliance status (Passed/Failed)
- First and last pass/fail dates
- Posture modification timestamps
- Policy evaluation history

## Resolve Host IDs

List all Host IDs for specified policies.

```javascript
const axios = require('axios');

const authToken = process.env.QUALYS_AUTH_TOKEN;
const baseURL = 'https://gateway.<assigned-url>/pcrs/1.0/posture/';

async function getHostIds(policyIds) {
  try {
    const response = await axios.get(`${baseURL}hostids`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      params: {
        policyId: Array.isArray(policyIds) ? policyIds.join(',') : policyIds
      }
    });

    console.log('Status:', response.status);
    console.log('Host IDs:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.status, error.message);
    throw error;
  }
}

// Usage
getHostIds(['policy123', 'policy456']);
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

```javascript
const axios = require('axios');

const authToken = process.env.QUALYS_AUTH_TOKEN;
const baseURL = 'https://gateway.<assigned-url>/pcrs/1.0/posture/';

async function getPostureInfo(policyHostData, options = {}) {
  const {
    evidenceRequired = 0,
    compressionRequired = 1
  } = options;

  try {
    const response = await axios.post(
      `${baseURL}postureInfo`,
      policyHostData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          evidenceRequired,
          compressionRequired
        }
      }
    );

    console.log('Status:', response.status);
    console.log('Posture Data:', JSON.stringify(response.data, null, 2));
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
  },
  {
    policyId: 'policy456',
    subscriptionId: 'sub-abc-123',
    hostIds: ['host-003']
  }
];

getPostureInfo(policyHostData, { evidenceRequired: 0 });
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

```javascript
// Include evidence data in the response
const postureWithEvidence = await getPostureInfo(policyHostData, {
  evidenceRequired: 1,
  compressionRequired: 0  // Uncompressed for readability
});
```

## List Policies

Get all policy IDs based on last evaluation date.

```javascript
const axios = require('axios');

const authToken = process.env.QUALYS_AUTH_TOKEN;
const baseURL = 'https://gateway.<assigned-url>/pcrs/1.0/posture/';

async function listPolicies(lastEvaluationDate = null) {
  try {
    const params = {};
    if (lastEvaluationDate) {
      params.lastEvaluationDate = lastEvaluationDate;
    }

    const response = await axios.get(`${baseURL}policy/list`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      params
    });

    console.log('Status:', response.status);
    console.log('Policies:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.status, error.message);
    throw error;
  }
}

// Get policies evaluated in the last 7 days
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
const dateStr = sevenDaysAgo.toISOString().split('T')[0];

listPolicies(dateStr);
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

```javascript
// Get all policies (no date filter)
const allPolicies = await listPolicies();
```

## Complete Workflow Example

```javascript
const axios = require('axios');

class QualysPostureAPI {
  constructor(gatewayUrl, authToken) {
    this.baseURL = `https://gateway.${gatewayUrl}/pcrs/1.0/posture/`;
    this.authToken = authToken;
    this.headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };
  }

  async listPolicies(lastEvaluationDate = null) {
    const params = {};
    if (lastEvaluationDate) {
      params.lastEvaluationDate = lastEvaluationDate;
    }

    const response = await axios.get(`${this.baseURL}policy/list`, {
      headers: this.headers,
      params
    });
    return response.data;
  }

  async getHostIds(policyIds) {
    const policyIdStr = Array.isArray(policyIds) 
      ? policyIds.join(',') 
      : policyIds;

    const response = await axios.get(`${this.baseURL}hostids`, {
      headers: this.headers,
      params: { policyId: policyIdStr }
    });
    return response.data;
  }

  async getPostureInfo(policyHostData, includeEvidence = false, compressed = true) {
    const response = await axios.post(
      `${this.baseURL}postureInfo`,
      policyHostData,
      {
        headers: this.headers,
        params: {
          evidenceRequired: includeEvidence ? 1 : 0,
          compressionRequired: compressed ? 1 : 0
        }
      }
    );
    return response.data;
  }
}

// Usage
async function main() {
  const api = new QualysPostureAPI(
    '<assigned-url>',
    process.env.QUALYS_AUTH_TOKEN
  );

  try {
    // 1. List recent policies
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];
    
    const policies = await api.listPolicies(dateStr);
    console.log(`Found ${policies.policyList.length} policies`);

    // 2. Get host IDs for first policy
    if (policies.policyList.length > 0) {
      const policyId = policies.policyList[0].id;
      const hostData = await api.getHostIds([policyId]);
      console.log(`Policy ${policyId} has ${hostData[0].hostIds.length} hosts`);

      // 3. Get posture information
      const postureInfo = await api.getPostureInfo(hostData, false);

      // 4. Analyze results
      const passed = postureInfo.filter(item => item.status === 'Passed').length;
      const failed = postureInfo.filter(item => item.status === 'Failed').length;

      console.log(`Compliance Status: ${passed} passed, ${failed} failed`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

## TypeScript Support

```typescript
import axios, { AxiosInstance } from 'axios';

interface PolicyHostData {
  policyId: string;
  subscriptionId: string;
  hostIds: string[];
}

interface PostureInfo {
  id: number;
  policyId: string;
  hostId: string;
  status: 'Passed' | 'Failed';
  firstFailDate: string;
  lastFailDate: string;
  firstPassDate: string;
  lastPassDate: string;
  postureModifiedDate: string;
}

interface Policy {
  id: string;
  title: string;
  createdBy: string;
  createdDate: string;
}

interface PolicyListResponse {
  subscriptionId: string;
  policyList: Policy[];
}

class QualysPostureAPI {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor(gatewayUrl: string, authToken: string) {
    this.baseURL = `https://gateway.${gatewayUrl}/pcrs/1.0/posture/`;
    this.headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };
  }

  async listPolicies(lastEvaluationDate?: string): Promise<PolicyListResponse> {
    const params: any = {};
    if (lastEvaluationDate) {
      params.lastEvaluationDate = lastEvaluationDate;
    }

    const response = await axios.get<PolicyListResponse>(
      `${this.baseURL}policy/list`,
      { headers: this.headers, params }
    );
    return response.data;
  }

  async getHostIds(policyIds: string[]): Promise<PolicyHostData[]> {
    const response = await axios.get<PolicyHostData[]>(
      `${this.baseURL}hostids`,
      {
        headers: this.headers,
        params: { policyId: policyIds.join(',') }
      }
    );
    return response.data;
  }

  async getPostureInfo(
    policyHostData: PolicyHostData[],
    includeEvidence: boolean = false,
    compressed: boolean = true
  ): Promise<PostureInfo[]> {
    const response = await axios.post<PostureInfo[]>(
      `${this.baseURL}postureInfo`,
      policyHostData,
      {
        headers: this.headers,
        params: {
          evidenceRequired: includeEvidence ? 1 : 0,
          compressionRequired: compressed ? 1 : 0
        }
      }
    );
    return response.data;
  }
}

// Usage
const api = new QualysPostureAPI(
  '<assigned-url>',
  process.env.QUALYS_AUTH_TOKEN!
);

const policies = await api.listPolicies();
const hostData = await api.getHostIds([policies.policyList[0].id]);
const postureInfo = await api.getPostureInfo(hostData);
```

## Error Handling

```javascript
const axios = require('axios');

async function makePostureRequest(url, options = {}) {
  try {
    const response = await axios({
      url,
      timeout: 30000,
      ...options
    });

    return response.data;

  } catch (error) {
    if (error.response) {
      // HTTP error
      if (error.response.status === 401) {
        throw new Error('Authentication failed. Check your token.');
      } else if (error.response.status === 400) {
        throw new Error(`Bad request: ${error.response.data}`);
      } else if (error.response.status === 404) {
        throw new Error('Resource not found.');
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
  const result = await makePostureRequest(
    `${baseURL}policy/list`,
    {
      headers: { 'Authorization': `Bearer ${authToken}` }
    }
  );
  console.log('Success!', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

## Best Practices

1. **Use environment variables for tokens:**
```javascript
const authToken = process.env.QUALYS_AUTH_TOKEN;
const gatewayUrl = process.env.QUALYS_GATEWAY_URL;
```

2. **Handle JSON responses properly:**
```javascript
const response = await axios.get(url, { headers });
const data = response.data;  // Already parsed JSON
```

3. **Batch host queries efficiently:**
```javascript
// Query multiple policies at once
const policyIds = ['policy1', 'policy2', 'policy3'];
const hostData = await api.getHostIds(policyIds);
```

4. **Use compression for large datasets:**
```javascript
const params = { compressionRequired: 1 };  // Reduces bandwidth
```

5. **Filter by date to reduce data volume:**
```javascript
// Only get recent evaluations
const lastWeek = new Date();
lastWeek.setDate(lastWeek.getDate() - 7);
const dateStr = lastWeek.toISOString().split('T')[0];
const policies = await api.listPolicies(dateStr);
```

6. **Implement retry logic with exponential backoff:**
```javascript
async function retryRequest(fn, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`Retry ${attempt + 1}/${maxRetries} after ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}
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
