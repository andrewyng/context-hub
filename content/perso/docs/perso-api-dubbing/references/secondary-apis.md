# Perso API — Secondary Endpoints

## Feedback API

### Submit Feedback

**Python:**
```python
requests.post(
    f"{API_BASE}/video-translator/api/v1/projects/feedbacks",
    headers=HEADERS,
    json={"projectSeq": 101, "rating": 4}
)
```

**JavaScript:**
```javascript
await fetch(`${API_BASE}/video-translator/api/v1/projects/feedbacks`, {
  method: "POST", headers, body: JSON.stringify({ projectSeq: 101, rating: 4 })
});
```

### Get Feedback

**Python:**
```python
feedback = requests.get(
    f"{API_BASE}/video-translator/api/v1/projects/feedbacks",
    headers=HEADERS,
    params={"projectSeq": 101}
).json()
```

**JavaScript:**
```javascript
const feedback = await fetch(
  `${API_BASE}/video-translator/api/v1/projects/feedbacks?projectSeq=101`,
  { headers }
).then(r => r.json());
```

---

## Community Spotlight API

### List Featured Projects

**Python:**
```python
featured = requests.get(
    f"{API_BASE}/video-translator/api/v1/projects/recommended",
    headers=HEADERS,
    params={"page": 0, "size": 10, "languageCode": "ko"}
).json()
```

**JavaScript:**
```javascript
const featured = await fetch(
  `${API_BASE}/video-translator/api/v1/projects/recommended?page=0&size=10&languageCode=ko`,
  { headers }
).then(r => r.json());
```

### Get Featured / Shared Project

**Python:**
```python
project = requests.get(
    f"{API_BASE}/video-translator/api/v1/projects/recommended/{project_seq}",
    headers=HEADERS
).json()

shared = requests.get(
    f"{API_BASE}/video-translator/api/v1/projects/shared/{shared_query}",
    headers=HEADERS
).json()
```

**JavaScript:**
```javascript
const project = await fetch(
  `${API_BASE}/video-translator/api/v1/projects/recommended/${projectSeq}`,
  { headers }
).then(r => r.json());

const shared = await fetch(
  `${API_BASE}/video-translator/api/v1/projects/shared/${sharedQuery}`,
  { headers }
).then(r => r.json());
```

---

## Browser: Upload from File Input

```javascript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

// 1. Get SAS token
const sas = await fetch(
  `${API_BASE}/file/api/upload/sas-token?fileName=${encodeURIComponent(file.name)}`,
  { headers }
).then(r => r.json());

// 2. Upload directly to Azure Blob Storage from browser
await fetch(sas.blobSasUrl, {
  method: "PUT",
  body: file,
  headers: {
    "x-ms-blob-type": "BlockBlob",
    "Content-Type": "application/octet-stream"
  }
});

// 3. Register with File API
const upload = await fetch(`${API_BASE}/file/api/upload/video`, {
  method: "PUT",
  headers,
  body: JSON.stringify({
    spaceSeq,
    fileUrl: sas.blobSasUrl.split("?")[0],
    fileName: file.name
  })
}).then(r => r.json());
```
