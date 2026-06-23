# Brakit Security Rules Reference

8 high-confidence rules that scan live API traffic. Each rule runs against every request/response pair in real time.

---

## Critical Severity

### Exposed Secret (`exposed-secret`)

**Detects:** Response JSON contains fields like `password`, `api_key`, `client_secret`, `secret_key`, `auth_token` with real values (minimum 4 characters, not masked with `***`).

**Example trigger:**
```json
// GET /api/users/1 response
{
  "id": 1,
  "email": "alice@example.com",
  "password": "$2b$10$abc123hashedvalue",
  "api_key": "sk-live-abc123def456"
}
```

**How to fix:**
```typescript
// Strip sensitive fields before returning
const { password, api_key, ...safeUser } = user;
return safeUser;

// Or use a DTO / select specific fields
const user = await db.query('SELECT id, email, name FROM users WHERE id = $1', [id]);
```

---

### Token in URL (`token-in-url`)

**Detects:** Auth tokens passed as query parameters instead of headers. Checks for: `token`, `api_key`, `secret`, `password`, `access_token`, `session_id` in the URL query string.

**Example trigger:**
```
GET /api/data?access_token=eyJhbGciOiJIUzI1NiJ9...&user_id=42
```

**How to fix:**
```typescript
// WRONG: token in URL
fetch('/api/data?access_token=eyJ...');

// CORRECT: token in Authorization header
fetch('/api/data', {
  headers: { 'Authorization': 'Bearer eyJ...' }
});
```

---

### Stack Trace Leak (`stack-trace-leak`)

**Detects:** Internal stack traces sent to the client in error responses. Matches patterns like `at Module._compile`, `File "..."`, `Traceback (most recent call last)`.

**Example trigger:**
```json
// 500 response
{
  "error": "TypeError: Cannot read property 'id' of undefined\n    at UserController.getUser (/app/src/controllers/user.ts:42:15)\n    at Module._compile (node:internal/modules/cjs/loader:1234:14)"
}
```

**How to fix:**
```typescript
// Add error-handling middleware
app.use((err, req, res, next) => {
  console.error(err);  // log internally
  res.status(500).json({ error: 'Internal server error' });  // generic message to client
});
```

```python
# FastAPI
@app.exception_handler(Exception)
async def generic_handler(request, exc):
    logger.error(f"Unhandled: {exc}")
    return JSONResponse(status_code=500, content={"error": "Internal server error"})
```

---

### Error Info Leak (`error-info-leak`)

**Detects:** Error responses (4xx-5xx) containing sensitive internal details:
- Database connection strings (`postgresql://`, `mysql://`, `mongodb://`)
- SQL query fragments (`SELECT`, `INSERT`, `UPDATE`, `DELETE` with table names)
- Secret values (same patterns as exposed-secret rule)

**Example trigger:**
```json
// 500 response
{
  "error": "connection refused: postgresql://admin:pass@db.internal:5432/myapp",
  "query": "SELECT * FROM users WHERE email = 'alice@example.com'"
}
```

**How to fix:**
```typescript
// Sanitize error responses — never forward raw error messages
app.use((err, req, res, next) => {
  // Log full error internally
  logger.error({ err, url: req.url });
  // Return generic message
  res.status(500).json({ error: 'Something went wrong' });
});
```

---

## Warning Severity

### PII in Response (`response-pii-leak`)

**Detects:**
- API echoes back email addresses in responses
- Full user records with internal IDs (8+ fields indicates a full DB record)
- Lists containing email addresses (2+ items with emails)
- Unambiguous PII fields: `phone`, `ssn`, `social_security`, `date_of_birth`, `address`, `credit_card`, `passport`

**Example trigger:**
```json
// GET /api/users response returning full records
[
  {
    "id": 1,
    "email": "alice@example.com",
    "created_at": "2024-01-01",
    "internal_role_id": 5,
    "password_hash": "...",
    "last_login_ip": "192.168.1.1",
    "phone": "+1-555-0123",
    "ssn": "123-45-6789"
  }
]
```

**How to fix:**
```typescript
// Return only the fields the client needs
const users = await db.query('SELECT id, name, avatar FROM users');
// Instead of: SELECT * FROM users
```

---

### Insecure Cookie (`insecure-cookie`)

**Detects:** `Set-Cookie` headers missing `HttpOnly` or `SameSite` flags.

**Example trigger:**
```
Set-Cookie: session=abc123; Path=/
```

**How to fix:**
```typescript
res.cookie('session', token, {
  httpOnly: true,      // prevents JavaScript access
  sameSite: 'lax',     // prevents CSRF
  secure: true,        // HTTPS only
  maxAge: 86400000
});
```

```python
# FastAPI
response.set_cookie("session", token, httponly=True, samesite="lax", secure=True)
```

---

### Sensitive Logs (`sensitive-logs`)

**Detects:** Console output containing secret or token values. Matches patterns like `password`, `secret`, `token`, `api_key` followed by values of 8+ characters.

**Example trigger:**
```typescript
console.log('User login:', { email: 'alice@example.com', password: 'hunter2secret' });
console.log(`API key: sk-live-abc123def456ghi789`);
```

**How to fix:**
```typescript
// Redact sensitive fields before logging
const { password, ...safeData } = loginPayload;
console.log('User login:', safeData);

// Or use a logging library with redaction
logger.info('Login attempt', { email: user.email });  // only log what's needed
```

---

### CORS + Credentials (`cors-credentials`)

**Detects:** Response has both `Access-Control-Allow-Origin: *` (wildcard) and `Access-Control-Allow-Credentials: true`. This combination is forbidden by browsers and indicates a misconfiguration.

**Example trigger:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
```

**How to fix:**
```typescript
// Specify explicit origins instead of wildcard
app.use(cors({
  origin: ['https://myapp.com', 'http://localhost:3000'],
  credentials: true
}));
```

```python
# FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://myapp.com", "http://localhost:3000"],
    allow_credentials=True,
)
```
