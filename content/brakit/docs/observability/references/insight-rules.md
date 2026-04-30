# Brakit Performance Insight Rules Reference

Brakit automatically analyzes your API traffic and surfaces performance issues. Each rule runs continuously against captured telemetry.

---

## Critical Severity

### N+1 Query Pattern (`n1`)

**Threshold:** Same query pattern executed **5+ times** in a single request.

**What it detects:** Fetching related data in a loop instead of batching.

**Example:**
```
GET /api/posts
  → SELECT * FROM posts                    (1 query)
  → SELECT * FROM users WHERE id = 1       (repeated per post)
  → SELECT * FROM users WHERE id = 2
  → SELECT * FROM users WHERE id = 3
  → SELECT * FROM users WHERE id = 4
  → SELECT * FROM users WHERE id = 5       ← N+1 flagged (5 identical patterns)
```

**How to fix:**
```typescript
// WRONG: query per item
const posts = await db.query('SELECT * FROM posts');
for (const post of posts) {
  post.author = await db.query('SELECT * FROM users WHERE id = $1', [post.author_id]);
}

// CORRECT: batch query
const posts = await db.query('SELECT * FROM posts');
const authorIds = posts.map(p => p.author_id);
const authors = await db.query('SELECT * FROM users WHERE id = ANY($1)', [authorIds]);
```

```python
# SQLAlchemy: use joinedload or selectinload
from sqlalchemy.orm import selectinload

posts = session.query(Post).options(selectinload(Post.author)).all()
```

---

### Error Hotspot (`error-hotspot`)

**Threshold:** Error rate >= **20%** on an endpoint (minimum 2 requests).

**What it detects:** Endpoints that frequently return error status codes (4xx-5xx).

**How to fix:** Check response bodies for error details and stack traces. Common causes: missing validation, unhandled null cases, database connection issues.

---

### Unhandled Error (`error`)

**Threshold:** Any uncaught exception during request handling.

**What it detects:** Errors that crash request handlers without being caught.

**How to fix:**
```typescript
// Wrap async handlers
app.get('/api/data', async (req, res, next) => {
  try {
    const data = await fetchData();
    res.json(data);
  } catch (err) {
    next(err);  // pass to error-handling middleware
  }
});
```

---

## Warning Severity

### Slow Endpoint (`slow`)

**Threshold:** Average latency >= **1000ms** (minimum 2 requests).

**What it detects:** Endpoints where total response time exceeds 1 second. Includes time breakdown showing where time is spent: DB queries, fetch calls, or application code.

**How to fix:** The insight tells you the dominant category:
- **DB-heavy:** Optimize queries, add indexes, reduce query count
- **Fetch-heavy:** Parallelize upstream calls, add caching, reduce call count
- **App-heavy:** Profile application code, check for CPU-bound operations

---

### Query-Heavy Endpoint (`query-heavy`)

**Threshold:** Average queries per request > **5** (minimum 2 requests).

**What it detects:** Endpoints making too many database queries per request.

**How to fix:**
```sql
-- Combine multiple queries with JOINs
SELECT posts.*, users.name as author_name
FROM posts
JOIN users ON users.id = posts.author_id
WHERE posts.published = true;

-- Instead of separate queries for posts and authors
```

---

### Duplicate API Call (`duplicate`)

**Threshold:** Same API endpoint called multiple times across actions. Shows top 3 by count.

**What it detects:** Redundant fetch calls — the same endpoint loaded repeatedly.

**How to fix:**
```typescript
// Lift fetch to parent component
// Use caching (React Query, SWR, or manual cache)
// Deduplicate with request coalescing

// React Query example
const { data } = useQuery(['users'], () => fetch('/api/users'));
// Subsequent useQuery('users') calls reuse the cached result
```

---

### Performance Regression (`regression`)

**Threshold:** Either:
- p95 latency increased by >= **200ms** AND >= **50%** compared to previous session
- Query count increased by >= **1.5x** (minimum 5 requests in both sessions)

**What it detects:** Endpoints that got slower or started making more queries since the last dev session.

**How to fix:** Check recent code changes for:
- New N+1 patterns introduced
- Removed query optimizations or caching
- Added middleware or processing steps
- New upstream service calls

---

### Cross-Endpoint Repeated Query (`cross-endpoint`)

**Threshold:** Same query runs on **3+ endpoints**, covering >= **50%** of all endpoints, with >= **5 total occurrences**.

**What it detects:** A query that runs on most endpoints, signaling it should be in middleware or cached.

**How to fix:**
```typescript
// Move repeated query to middleware
app.use(async (req, res, next) => {
  req.currentUser = await db.query('SELECT * FROM users WHERE id = $1', [req.userId]);
  next();
});

// Or cache the result
const userCache = new Map();
```

---

### Redundant Query (`redundant-query`)

**Threshold:** Exact same SQL with identical parameters runs **2+ times** in a single request.

**What it detects:** The same query (same SQL, same params) executing multiple times within one request handler.

**How to fix:**
```typescript
// Cache the first result
const getUser = memoize(async (id) => db.query('SELECT * FROM users WHERE id = $1', [id]));

// Or lift the query to a shared variable
const user = await getUser(userId);
// Use `user` in multiple places instead of re-querying
```

---

### Large Result Set (`high-rows`)

**Threshold:** Query returns **100+ rows**, occurring 2+ times.

**What it detects:** Queries fetching many rows, which slows responses and uses excess memory.

**How to fix:**
```sql
-- Add LIMIT and pagination
SELECT * FROM products ORDER BY created_at DESC LIMIT 20 OFFSET 0;

-- Or filter with WHERE
SELECT * FROM orders WHERE status = 'pending' AND created_at > NOW() - INTERVAL '7 days';
```

---

### SELECT * Query (`select-star`)

**Threshold:** `SELECT *` query executed **2+ times**.

**What it detects:** Queries fetching all columns instead of specifying only needed ones.

**How to fix:**
```sql
-- Specify only required columns
SELECT id, name, email FROM users WHERE active = true;
-- Instead of: SELECT * FROM users WHERE active = true;
```

---

## Info Severity

### Response Overfetch (`response-overfetch`)

**Threshold:** Response has >= **8 fields** AND at least one of:
- 2+ internal ID fields (e.g., `role_id`, `org_id`)
- 30%+ null fields
- 12+ total fields

**What it detects:** API returning more data than the client likely needs.

**How to fix:**
```typescript
// Use a DTO or select specific fields
const userDTO = {
  id: user.id,
  name: user.name,
  avatar: user.avatar
};
return userDTO;
// Instead of returning the full database record
```

---

### Large Response (`large-response`)

**Threshold:** Average response size > **50KB** (51,200 bytes), minimum 2 requests.

**What it detects:** Large API responses that increase transfer time and client memory usage.

**How to fix:**
- Implement pagination for list endpoints
- Add field filtering (`?fields=id,name,email`)
- Enable gzip/brotli compression
- Return IDs and let client fetch details on demand
