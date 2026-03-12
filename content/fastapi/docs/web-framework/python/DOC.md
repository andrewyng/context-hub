---
name: web-framework
description: "FastAPI framework for building high-performance REST APIs with Python, featuring automatic OpenAPI docs, Pydantic v2 validation, async support, dependency injection, and type safety"
metadata:
  languages: "python"
  versions: "0.115.0"
  updated-on: "2025-07-15"
  source: community
  tags: "fastapi,python,web,api,rest,pydantic,async"
---

# FastAPI Coding Guidelines

You are a FastAPI expert. Help write production-quality FastAPI applications using modern patterns with FastAPI 0.115+ and Pydantic v2.

Official docs: https://fastapi.tiangolo.com/

## Golden Rule: Use Pydantic v2 Models Everywhere

FastAPI 0.100+ ships with **Pydantic v2** (not v1). Pydantic v2 uses `model_config` instead of the inner `class Config`. Always use typed Pydantic models for request bodies and responses — never use raw `dict`.

**Installation:**

```bash
pip install "fastapi[standard]"
# Installs fastapi, uvicorn[standard], pydantic v2, python-multipart, email-validator
```

**Run dev server:**

```bash
fastapi dev main.py        # Hot-reload dev server (FastAPI CLI, v0.111+)
uvicorn main:app --reload  # Alternative
```

## App Setup

```python
from fastapi import FastAPI

app = FastAPI(
    title="My API",
    version="1.0.0",
    description="API description shown in /docs",
)
```

Interactive docs auto-generated at `/docs` (Swagger UI) and `/redoc`.

## Pydantic v2 Models

**Always use Pydantic models for request bodies and responses. Never use `dict`.**

```python
from pydantic import BaseModel, Field, model_validator
from typing import Optional
from datetime import datetime

# ✅ CORRECT — Pydantic v2 style
class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., pattern=r"^[\w.-]+@[\w.-]+\.[a-z]{2,}$")
    age: Optional[int] = Field(None, ge=0, le=150)

    # v2-style config — NOT inner class Config
    model_config = {"str_strip_whitespace": True}

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}  # replaces orm_mode=True in v1

# ❌ WRONG — v1 patterns, do NOT use
class BadModel(BaseModel):
    name: str
    class Config:          # v1 style — DO NOT USE in v2
        orm_mode = True    # use from_attributes=True instead
```

**Common v1 → v2 migration gotchas:**
- `orm_mode = True` → `model_config = {"from_attributes": True}`
- `class Config` → `model_config` dict at class level
- `validator` decorator → `field_validator` / `model_validator`
- `schema_extra` → `json_schema_extra`

## Route Decorators

```python
from fastapi import FastAPI, status

app = FastAPI()

@app.get("/items", status_code=status.HTTP_200_OK)
async def list_items():
    ...

@app.post("/items", status_code=status.HTTP_201_CREATED)
async def create_item(item: ItemCreate) -> ItemResponse:
    ...

@app.put("/items/{item_id}", status_code=status.HTTP_200_OK)
async def update_item(item_id: int, item: ItemUpdate) -> ItemResponse:
    ...

@app.patch("/items/{item_id}")
async def partial_update(item_id: int, item: ItemUpdate) -> ItemResponse:
    ...

@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: int):
    ...
```

Always declare return type annotations — FastAPI uses them for response serialization and docs generation.

## Path and Query Parameters

```python
from fastapi import FastAPI, Query, Path
from typing import Optional

app = FastAPI()

# Path parameter — type-validated automatically
@app.get("/items/{item_id}")
async def get_item(
    item_id: int = Path(..., ge=1, description="The item ID"),
) -> ItemResponse:
    ...

# Query parameters — optional with defaults
@app.get("/items")
async def list_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, min_length=1),
    tags: list[str] = Query(default=[]),
) -> list[ItemResponse]:
    ...

# Mixed path + query + body
@app.put("/users/{user_id}/items/{item_id}")
async def update_user_item(
    user_id: int,
    item_id: int,
    q: Optional[str] = None,
    item: ItemUpdate = ...,  # request body (Pydantic model)
) -> ItemResponse:
    ...
```

FastAPI distinguishes path, query, and body parameters by type: primitives without a path match → query; Pydantic models → request body.

## Request Body

```python
from fastapi import FastAPI
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    price: float
    in_stock: bool = True

app = FastAPI()

@app.post("/items", status_code=201)
async def create_item(item: Item) -> Item:
    return item  # fully validated and typed
```

## Async Handlers

**Always use `async def` for route handlers.** Use `def` only for CPU-bound work (FastAPI runs sync handlers in a thread pool, which adds overhead).

```python
import httpx
import asyncio

# ✅ CORRECT — async I/O
@app.get("/data")
async def fetch_data():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com/data")
    return response.json()

# ✅ OK for CPU-bound or blocking libs (FastAPI wraps in threadpool)
@app.get("/compute")
def heavy_computation():
    result = run_blocking_cpu_work()
    return {"result": result}

# ❌ WRONG — never block the event loop in async handlers
@app.get("/bad")
async def bad_handler():
    import time
    time.sleep(5)       # blocks event loop — use asyncio.sleep instead
    import requests
    requests.get("...")  # blocks — use httpx.AsyncClient instead
```

## HTTPException and Error Handling

```python
from fastapi import FastAPI, HTTPException, status

app = FastAPI()

@app.get("/items/{item_id}")
async def get_item(item_id: int) -> ItemResponse:
    item = await db.get_item(item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item {item_id} not found",
        )
    return item

# Custom exception handler
from fastapi import Request
from fastapi.responses import JSONResponse

class AppError(Exception):
    def __init__(self, message: str, code: int = 400):
        self.message = message
        self.code = code

@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.code,
        content={"error": exc.message},
    )
```

## Dependency Injection with `Depends`

FastAPI's DI system is composable and works across parameters, routes, and routers.

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# Simple dependency — database session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session          # tears down after request

# Auth dependency
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    user = await verify_token(token, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# Use dependencies in routes
@app.get("/me")
async def read_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return current_user

# Scoped / role-based dependency
def require_role(role: str):
    async def checker(user: User = Depends(get_current_user)):
        if user.role != role:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return checker

@app.delete("/admin/users/{user_id}")
async def admin_delete(
    user_id: int,
    _: User = Depends(require_role("admin")),
):
    ...
```

## APIRouter — Modular Apps

```python
# routers/items.py
from fastapi import APIRouter

router = APIRouter(prefix="/items", tags=["items"])

@router.get("/")
async def list_items() -> list[ItemResponse]: ...

@router.post("/", status_code=201)
async def create_item(item: ItemCreate) -> ItemResponse: ...

# main.py
from fastapi import FastAPI
from routers import items, users

app = FastAPI()
app.include_router(items.router)
app.include_router(users.router)
```

## Lifespan Events (Startup/Shutdown)

Use the `lifespan` context manager (v0.95+). Deprecated: `@app.on_event`.

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await db_pool.connect()
    await cache.connect()
    yield
    # Shutdown
    await db_pool.disconnect()
    await cache.disconnect()

app = FastAPI(lifespan=lifespan)
```

## Middleware

```python
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://myapp.com"],  # use ["*"] only in dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom middleware — request timing
@app.middleware("http")
async def add_timing_header(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed = time.perf_counter() - start
    response.headers["X-Process-Time"] = f"{elapsed:.4f}s"
    return response
```

## Background Tasks

```python
from fastapi import FastAPI, BackgroundTasks

app = FastAPI()

async def send_email(email: str, message: str):
    # I/O-bound — runs after response is sent
    await email_client.send(email, message)

@app.post("/register")
async def register(user: UserCreate, background_tasks: BackgroundTasks) -> UserResponse:
    new_user = await create_user(user)
    background_tasks.add_task(send_email, user.email, "Welcome!")
    return new_user
```

Use `BackgroundTasks` for fire-and-forget I/O. For heavy/long-running jobs, use a task queue (Celery, ARQ, Dramatiq).

## Response Models and Serialization

```python
class UserInternal(BaseModel):
    id: int
    name: str
    email: str
    hashed_password: str  # should NOT be exposed

class UserPublic(BaseModel):
    id: int
    name: str
    email: str

# response_model filters output — hashed_password excluded automatically
@app.get("/users/{user_id}", response_model=UserPublic)
async def get_user(user_id: int) -> UserInternal:
    return await db.get_user(user_id)

# model_dump(exclude_unset=True) for PATCH semantics
@app.patch("/users/{user_id}", response_model=UserPublic)
async def patch_user(user_id: int, update: UserUpdate) -> UserInternal:
    return await db.patch_user(user_id, update.model_dump(exclude_unset=True))
```

## Status Codes

```python
from fastapi import status
# Use named constants — not magic numbers
status.HTTP_200_OK           # 200
status.HTTP_201_CREATED      # 201
status.HTTP_204_NO_CONTENT   # 204
status.HTTP_400_BAD_REQUEST  # 400
status.HTTP_401_UNAUTHORIZED # 401
status.HTTP_403_FORBIDDEN    # 403
status.HTTP_404_NOT_FOUND    # 404
status.HTTP_422_UNPROCESSABLE_ENTITY  # auto-raised on validation error
status.HTTP_500_INTERNAL_SERVER_ERROR # 500
```

## Anti-Patterns to Avoid

```python
# ❌ WRONG: raw dict response — loses validation and docs
@app.get("/items/{id}")
async def get_item(id: int):
    return {"id": id, "name": "Foo"}  # no type safety, no schema

# ✅ CORRECT: use Pydantic model
@app.get("/items/{id}")
async def get_item(id: int) -> ItemResponse:
    return ItemResponse(id=id, name="Foo")

# ❌ WRONG: v1-style orm_mode
class Item(BaseModel):
    class Config:
        orm_mode = True

# ✅ CORRECT: v2 from_attributes
class Item(BaseModel):
    model_config = {"from_attributes": True}

# ❌ WRONG: blocking call in async handler
@app.get("/slow")
async def slow():
    import requests
    return requests.get("https://api.example.com").json()

# ✅ CORRECT: async I/O
@app.get("/fast")
async def fast():
    async with httpx.AsyncClient() as c:
        return (await c.get("https://api.example.com")).json()

# ❌ WRONG: deprecated on_event
@app.on_event("startup")
async def startup():
    await db.connect()

# ✅ CORRECT: lifespan context manager
@asynccontextmanager
async def lifespan(app):
    await db.connect()
    yield
    await db.disconnect()
```

## Complete Minimal Example

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import Optional

# --- Models ---
class ItemCreate(BaseModel):
    name: str = Field(..., min_length=1)
    price: float = Field(..., gt=0)
    description: Optional[str] = None

class ItemResponse(BaseModel):
    id: int
    name: str
    price: float
    description: Optional[str]

# --- In-memory store (replace with real DB) ---
_store: dict[int, dict] = {}
_counter = 0

# --- Lifespan ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up")
    yield
    print("Shutting down")

# --- App ---
app = FastAPI(title="Items API", lifespan=lifespan)

@app.post("/items", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(item: ItemCreate) -> ItemResponse:
    global _counter
    _counter += 1
    _store[_counter] = item.model_dump()
    return ItemResponse(id=_counter, **_store[_counter])

@app.get("/items/{item_id}", response_model=ItemResponse)
async def get_item(item_id: int) -> ItemResponse:
    if item_id not in _store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return ItemResponse(id=item_id, **_store[item_id])

@app.get("/items", response_model=list[ItemResponse])
async def list_items(skip: int = 0, limit: int = 20) -> list[ItemResponse]:
    items = [ItemResponse(id=k, **v) for k, v in _store.items()]
    return items[skip : skip + limit]
```

## References

- [Advanced Topics](references/advanced.md) — JWT auth, file uploads, WebSockets, async SQLAlchemy, testing
- [FastAPI Official Docs](https://fastapi.tiangolo.com/)
- [Pydantic v2 Migration Guide](https://docs.pydantic.dev/latest/migration/)
