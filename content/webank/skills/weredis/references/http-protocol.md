# WeRedis HTTP Protocol Access

WeRedis Proxy supports HTTP protocol access, allowing clients to access WeRedis without any SDK - a truly **ClientLess** approach.

## Overview

HTTP protocol access is useful when:
- Multi-language SDK maintenance is challenging
- Using languages without official WeRedis SDK support
- Wanting to avoid SDK dependencies

## Request Format

Convert Redis commands to HTTP requests:

| Redis Protocol | HTTP Protocol |
|----------------|---------------|
| Command parts separated by space | Path parts separated by `/` |
| `SET key value` | `GET /cmd/set/key/value` |

**Rules:**
- Path prefix: `/cmd`
- Replace spaces with `/`
- Special characters (!, #, $, %, @, :, =, ?) need URL encoding
- **Do NOT URL-encode spaces** - this would cause Redis syntax errors

**Example:**
```
Redis:  SET mykey@ value#
HTTP:   GET /cmd/set/mykey%40/value%23
```

## Response Format

Response is JSON format with `result` or `error` field:

```json
// Success
{"result": "OK"}

// Error
{"error": "ACCESS_DENY: Can't access namespace"}
```

## Authentication

### Token Mechanism

Unlike SDK (where auth is per-connection), HTTP uses token-based auth:

1. **Get Token**: Call AUTH command, returns token instead of "OK"
2. **Use Token**: Include in `X-REDIS-TOKEN` header for subsequent requests

**Token validity**: 2 hours. Must re-auth before expiration.

### Auth Info Format

SDK auto-includes version info. For HTTP, manually construct:

```
Redis-Cluster:<systemId>:|||{RSA}encrypted_password@@@http
```

**Example:**
```
Redis-Cluster:5036:|||{RSA}xxxxx@@@http
```

## Domain Entry Point

Each cluster has an associated domain via TGW gateway:

**Format:** `http://<cluster_domain>.weredis.webank.cn:30300/cmd/<command>`

**Example:**
```
Cluster: SIT_MIG03_REDIS_CLUSTER_CACHE
Domain:  sit_mig03.weredis.webank.cn:30300
URL:     http://sit_mig03.weredis.webank.cn:30300/cmd/set/mykey/myvalue
```

Contact @WeRedis助手 for your cluster's domain.

## Required Headers

| Header | Description | Example |
|--------|-------------|---------|
| `X-REDIS-TOKEN` | Auth token from AUTH command | `abc123...` |
| `X-STORAGE-TYPE` | Storage type (redis/tikv) | `redis` |
| `Connection` | Connection behavior | `keep-alive` |

## Command Compatibility

### Supported Commands

Most Redis commands are supported via HTTP.

### Not Supported Commands

**Message Subscription** (HTTP is Request/Response, no server push):
- `SUBSCRIBE`, `UNSUBSCRIBE`, `PSUBSCRIBE`, `PUNSUBSCRIBE`
- Error: `HTTP_NOT_SUPPORT Not support command on http.`
- `PUBLISH` is supported

### Special Handling

**BloomFilter Commands**: Replace prefix `bf` with `bf_`:

| Redis Command | HTTP Path |
|---------------|-----------|
| `BF.EXISTS k` | `/cmd/bf_exists/k` |
| `BF.ADD k v` | `/cmd/bf_add/k/v` |
| `BF.RESERVE k 0.01 100` | `/cmd/bf_reserve/k/0.01/100` |

## Code Examples

### cURL

```bash
# 1. Authenticate
curl -X GET "http://sit_mig03.weredis.webank.cn:30300/cmd/auth/Redis-Cluster:5036:|||%7BRSA%7Dxxxxx@@@http"

# Response: {"result": "your-token-here"}

# 2. Use token for operations
curl -X GET \
  -H "X-REDIS-TOKEN: your-token-here" \
  "http://sit_mig03.weredis.webank.cn:30300/cmd/set/mykey/myvalue"

# Response: {"result": "OK"}

# 3. Get value
curl -X GET \
  -H "X-REDIS-TOKEN: your-token-here" \
  "http://sit_mig03.weredis.webank.cn:30300/cmd/get/mykey"

# Response: {"result": "myvalue"}
```

### Python

```python
import requests
import urllib.parse

class WeRedisHTTPClient:
    def __init__(self, domain, auth_info):
        self.base_url = f"http://{domain}:30300"
        self.token = None
        self.auth_info = auth_info

    def authenticate(self):
        """Get token from AUTH command"""
        encoded_auth = urllib.parse.quote(self.auth_info, safe='')
        url = f"{self.base_url}/cmd/auth/{encoded_auth}"
        resp = requests.get(url)
        result = resp.json()
        self.token = result.get('result')
        return self.token

    def _headers(self):
        return {'X-REDIS-TOKEN': self.token}

    def set(self, key, value):
        url = f"{self.base_url}/cmd/set/{key}/{value}"
        resp = requests.get(url, headers=self._headers())
        return resp.json()

    def get(self, key):
        url = f"{self.base_url}/cmd/get/{key}"
        resp = requests.get(url, headers=self._headers())
        return resp.json()

# Usage
auth_info = "Redis-Cluster:5036:|||{RSA}xxxxx@@@http"
client = WeRedisHTTPClient("sit_mig03.weredis.webank.cn", auth_info)
client.authenticate()
client.set("ORDER-SVC:user:123", "Alice")
print(client.get("ORDER-SVC:user:123"))  # {"result": "Alice"}
```

### JavaScript / Node.js

```javascript
const axios = require('axios');

class WeRedisHTTPClient {
    constructor(domain, authInfo) {
        this.baseUrl = `http://${domain}:30300`;
        this.authInfo = authInfo;
        this.token = null;
    }

    async authenticate() {
        const encodedAuth = encodeURIComponent(this.authInfo);
        const response = await axios.get(`${this.baseUrl}/cmd/auth/${encodedAuth}`);
        this.token = response.data.result;
        return this.token;
    }

    async set(key, value) {
        const response = await axios.get(`${this.baseUrl}/cmd/set/${key}/${value}`, {
            headers: { 'X-REDIS-TOKEN': this.token }
        });
        return response.data;
    }

    async get(key) {
        const response = await axios.get(`${this.baseUrl}/cmd/get/${key}`, {
            headers: { 'X-REDIS-TOKEN': this.token }
        });
        return response.data;
    }
}

// Usage
const client = new WeRedisHTTPClient(
    'sit_mig03.weredis.webank.cn',
    'Redis-Cluster:5036:|||{RSA}xxxxx@@@http'
);

(async () => {
    await client.authenticate();
    await client.set('ORDER-SVC:user:123', 'Alice');
    console.log(await client.get('ORDER-SVC:user:123')); // { result: 'Alice' }
})();
```

## Best Practices

1. **Token Renewal**: Implement token renewal before 2-hour expiration
2. **Connection Reuse**: Use `Connection: keep-alive` for better performance
3. **Error Handling**: Parse JSON response for `error` field
4. **URL Encoding**: Properly encode special characters in keys/values
5. **Key Format**: Still follow `<systemId>:<realKey>` format
