---
name: pwsh-api-web
description: "PowerShell 7.5 web and API operations — Invoke-RestMethod, Invoke-WebRequest, authentication, headers, pagination, and certificate handling"
metadata:
  languages: "powershell"
  versions: "7.5"
  revision: 1
  updated-on: "2026-03-30"
  source: community
  tags: "powershell,pwsh,rest-api,invoke-restmethod,invoke-webrequest,http,authentication"
---

# PowerShell 7.5 Web and API Operations

## Golden Rule

PowerShell has TWO web cmdlets with different return types:

| Cmdlet | Returns | Use When |
|--------|---------|----------|
| `Invoke-RestMethod` | Auto-parsed objects (JSON->PSObject, XML->XmlDocument) | You only need the body |
| `Invoke-WebRequest` | `BasicHtmlWebResponseObject` with `.StatusCode`, `.Headers`, `.Content` | You need status codes, headers, or raw content |

`Invoke-RestMethod` does NOT have a `.StatusCode` property. `Invoke-WebRequest` does NOT auto-parse JSON.

```powershell
$users = Invoke-RestMethod -Uri 'https://api.example.com/users'
$users[0].name   # Direct property access on parsed JSON

$response = Invoke-WebRequest -Uri 'https://api.example.com/users'
$response.StatusCode        # 200
$response.Content | ConvertFrom-Json   # Manual parse needed
```

## Invoke-RestMethod

### GET, POST, PUT, PATCH, DELETE

```powershell
# GET — result is already a parsed object; put params in the URI
$data = Invoke-RestMethod -Uri 'https://api.example.com/search?q=test&limit=10'

# POST JSON — MUST ConvertTo-Json and set ContentType
$body = @{ name = 'Widget'; price = 9.99 } | ConvertTo-Json
$result = Invoke-RestMethod -Uri 'https://api.example.com/items' `
    -Method Post -Body $body -ContentType 'application/json'

# CRITICAL: -Body with a hashtable sends form-encoded, NOT JSON
Invoke-RestMethod -Uri $uri -Method Post -Body @{ name = 'Widget' }
# Sends: name=Widget (application/x-www-form-urlencoded) — NOT JSON!

# PUT — full resource replacement
$body = @{ name = 'Updated'; price = 12.99 } | ConvertTo-Json
Invoke-RestMethod -Uri "$uri/42" -Method Put -Body $body -ContentType 'application/json'

# PATCH — partial update
Invoke-RestMethod -Uri "$uri/42" -Method Patch `
    -Body (@{ price = 14.99 } | ConvertTo-Json) -ContentType 'application/json'

# DELETE
Invoke-RestMethod -Uri "$uri/42" -Method Delete
```

### ConvertTo-Json Depth

```powershell
# Defaults to depth 2 — nested objects silently truncated to type name
@{ a = @{ b = @{ c = 'deep' } } } | ConvertTo-Json
# "c" becomes "System.Collections.Hashtable" — WRONG, no error

# CORRECT: always specify -Depth for nested structures
@{ a = @{ b = @{ c = 'deep' } } } | ConvertTo-Json -Depth 10
```

## Invoke-WebRequest

```powershell
$response = Invoke-WebRequest -Uri 'https://api.example.com/items'
$response.StatusCode          # 200
$response.Headers             # Dictionary (case-insensitive keys in PS7)
$response.Content             # Raw response body string
$response.Links               # Parsed <a>/<link> tags from HTML

# 4xx/5xx throw by default. Use -SkipHttpErrorCheck to get the status instead:
$response = Invoke-WebRequest -Uri $uri -SkipHttpErrorCheck
$response.StatusCode  # 404 — no exception thrown

# Catching errors without -SkipHttpErrorCheck:
try { $r = Invoke-WebRequest -Uri $uri }
catch {
    $statusInt = [int]$_.Exception.Response.StatusCode  # 404
}
```

## Authentication

### Built-in -Authentication (PS 7+)

```powershell
# Bearer token — -Token requires SecureString
$token = ConvertTo-SecureString 'your-api-token' -AsPlainText -Force
Invoke-RestMethod -Uri $uri -Authentication Bearer -Token $token

# Basic — needs -Credential AND -Authentication Basic
$secPass = ConvertTo-SecureString 'MyPassword' -AsPlainText -Force
$cred = [PSCredential]::new('username', $secPass)
Invoke-RestMethod -Uri $uri -Authentication Basic -Credential $cred

# OAuth (sends Authorization: Bearer, same as Bearer)
Invoke-RestMethod -Uri $uri -Authentication OAuth -Token $token
```

### CRITICAL: -Credential Alone vs -Authentication Basic

```powershell
# -Credential WITHOUT -Authentication: waits for 401 challenge first
# Many APIs never send 401 — they just reject with 403
Invoke-RestMethod -Uri $uri -Credential $cred  # May fail!

# -Authentication Basic: sends Authorization header on FIRST request
Invoke-RestMethod -Uri $uri -Authentication Basic -Credential $cred  # Correct
```

### Manual Authorization Header

```powershell
$headers = @{ Authorization = 'Bearer your-api-token-here' }
Invoke-RestMethod -Uri $uri -Headers $headers

# Manual Basic auth
$base64 = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes('user:pass'))
Invoke-RestMethod -Uri $uri -Headers @{ Authorization = "Basic $base64" }

# API Key in header
Invoke-RestMethod -Uri $uri -Headers @{ 'X-API-Key' = 'your-key' }
```

## Headers

```powershell
$headers = @{
    'Accept'       = 'application/json'
    'X-Request-Id' = [guid]::NewGuid().ToString()
}
# NOTE: Content-Type in -Headers is overridden by -ContentType parameter
# Always use -ContentType for Content-Type
Invoke-RestMethod -Uri $uri -Method Post -Headers $headers `
    -ContentType 'application/json' -Body $json
```

## Pagination

### -FollowRelLink (Automatic)

```powershell
# Follows RFC 5988 Link rel="next" headers automatically
$pages = Invoke-RestMethod -Uri "$uri?page=1" -FollowRelLink -MaximumFollowRelLink 10

# IMPORTANT: returns array of arrays — one element per page
$allItems = $pages | ForEach-Object { $_ }   # Flatten to single list
```

### Manual Cursor-Based

```powershell
$allItems = [System.Collections.Generic.List[object]]::new()
$cursor = $null
do {
    $uri = 'https://api.example.com/items?limit=100'
    if ($cursor) { $uri += "&cursor=$cursor" }
    $response = Invoke-RestMethod -Uri $uri
    $allItems.AddRange($response.data)
    $cursor = $response.next_cursor
} while ($cursor)
```

### Manual Offset-Based

```powershell
$allItems = [System.Collections.Generic.List[object]]::new()
$offset = 0; $limit = 100
do {
    $response = Invoke-RestMethod -Uri "$uri?offset=$offset&limit=$limit"
    $allItems.AddRange($response.items)
    $offset += $limit
} while ($response.items.Count -eq $limit)
```

## Certificate Handling

```powershell
# Skip TLS validation (self-signed certs) — PS7+ parameter
Invoke-RestMethod -Uri 'https://self-signed.local/api' -SkipCertificateCheck

# WRONG: .NET Framework hack does NOT work in PS7
# [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

# Client certificate authentication
$cert = Get-PfxCertificate -FilePath './client.pfx'
Invoke-RestMethod -Uri $uri -Certificate $cert
```

## Multipart Form Uploads (-Form)

```powershell
$form = @{
    file        = Get-Item './document.pdf'    # FileInfo = file upload
    description = 'Quarterly report'           # String = form field
}
Invoke-RestMethod -Uri "$uri/upload" -Method Post -Form $form
# CRITICAL: do NOT set -ContentType with -Form — it breaks the multipart boundary
```

## Error Handling

```powershell
try {
    $result = Invoke-RestMethod -Uri $uri -Method Post `
        -Body $json -ContentType 'application/json'
}
catch [Microsoft.PowerShell.Commands.HttpResponseException] {
    # ErrorDetails.Message often contains the JSON error body
    $apiError = $_.ErrorDetails.Message | ConvertFrom-Json
    $statusCode = [int]$_.Exception.Response.StatusCode
    Write-Error "HTTP $statusCode : $($apiError.message)"
}
catch {
    Write-Error "Request failed: $($_.Exception.Message)"  # Network/DNS/timeout
}
```

## Timeout and Retry

```powershell
Invoke-RestMethod -Uri $uri -TimeoutSec 30

# Retry with exponential backoff
function Invoke-RestMethodWithRetry {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)] [string]$Uri,
        [string]$Method = 'Get',
        [int]$MaxRetries = 3,
        [int]$BaseDelaySec = 2
    )
    for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {
        try { return Invoke-RestMethod -Uri $Uri -Method $Method }
        catch {
            $code = [int]$_.Exception.Response.StatusCode
            if ($code -notin @(429, 500, 502, 503, 504) -or $attempt -eq $MaxRetries) { throw }
            $delay = $BaseDelaySec * [math]::Pow(2, $attempt - 1)
            Write-Verbose "Attempt $attempt failed (HTTP $code). Retrying in ${delay}s..."
            Start-Sleep -Seconds $delay
        }
    }
}
```

## Session Persistence

```powershell
# -SessionVariable takes a variable NAME as a STRING (no $)
Invoke-RestMethod -Uri "$uri/login" -Method Post `
    -Body $loginJson -ContentType 'application/json' `
    -SessionVariable 'session'   # Creates $session in current scope

# Subsequent requests use -WebSession with the variable
Invoke-RestMethod -Uri "$uri/data" -WebSession $session
```

## Common Mistakes

### 1: Hashtable -Body sends form-encoded, not JSON
```powershell
# WRONG                                          # CORRECT
Invoke-RestMethod -Uri $uri -Method Post `        Invoke-RestMethod -Uri $uri -Method Post `
    -Body @{ name = 'test' }                          -Body (@{ name = 'test' } | ConvertTo-Json) `
                                                      -ContentType 'application/json'
```

### 2: Expecting StatusCode from Invoke-RestMethod
`Invoke-RestMethod` returns parsed data only. Use `Invoke-WebRequest` for status codes.

### 3: .NET Framework certificate hack in PS7
`[ServicePointManager]::ServerCertificateValidationCallback` is ignored. Use `-SkipCertificateCheck`.

### 4: ConvertTo-Json depth truncation
Default depth 2 silently converts nested hashtables to type name strings. Always use `-Depth`.

### 5: -Credential without -Authentication
Waits for 401 challenge. Use `-Authentication Basic -Credential $cred` to send on first request.

### 6: Setting -ContentType with -Form
Overrides the multipart boundary. Let `-Form` set Content-Type automatically.

### 7: -SessionVariable takes a string name
`-SessionVariable $session` is wrong. Use `-SessionVariable 'session'` then `-WebSession $session`.

### 8: -FollowRelLink returns array of arrays
Each element is one page. Flatten with `$pages | ForEach-Object { $_ }`.

### 9: -Body with GET requests
Some servers reject GET with a body. Put query parameters in the URI instead:
```powershell
$qs = [System.Web.HttpUtility]::ParseQueryString('')
$qs.Add('q', 'test with spaces'); $qs.Add('limit', '10')
Invoke-RestMethod -Uri "https://api.example.com/search?$($qs.ToString())"
```

### 10: Ignoring character encoding
`Invoke-RestMethod` uses Content-Type charset for decoding. For raw bytes control, use `Invoke-WebRequest` and read `$response.RawContentStream`.
