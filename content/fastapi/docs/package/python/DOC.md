---
name: package
description: "FastAPI package guide for Python ASGI APIs, dependency injection, auth, and deployment"
metadata:
  languages: "python"
  versions: "0.136.3"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "fastapi,python,asgi,api,openapi,web,async"
---

# FastAPI Python Package Guide

## What It Is

FastAPI is a Python ASGI web framework for JSON APIs and backend services. It builds on Starlette and Pydantic, generates OpenAPI automatically, and includes dependency injection, validation, security helpers, and testing utilities.

Use this doc when you need to:

- build an HTTP API with typed request and response models
- organize routes with dependencies and routers
- configure auth, settings, uploads, CORS, and lifespan startup/shutdown
- avoid version-specific regressions in the `0.129.x` to `0.136.x` range

## Python And Install Requirements

- FastAPI `0.136.3` requires Python `>=3.10`.
- PyPI publishes extras: `standard`, `standard-no-fastapi-cloud-cli`, and `all`.
- `fastapi[standard]` is the easiest install for new apps because it brings in `uvicorn`, `fastapi-cli`, `httpx`, `jinja2`, and `python-multipart`.

### Recommended install

```bash
python -m venv .venv
source .venv/bin/activate
pip install "fastapi[standard]==0.136.3"
```

### Minimal install

Use this only if you intentionally manage the server and optional tooling yourself:

```bash
pip install "fastapi==0.136.3"
pip install "uvicorn[standard]"
```

### Useful optional packages

```bash
pip install pydantic-settings
pip install python-multipart
pip install httpx
```

- `pydantic-settings` is for environment-based config.
- `python-multipart` is required for form/file parsing.
- `httpx` is required for `fastapi.testclient.TestClient`.

## Minimal App

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}
```

Run it in development:

```bash
fastapi dev main.py
```

Or with Uvicorn directly:

```bash
uvicorn main:app --reload
```

Default generated docs and schema endpoints:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
- OpenAPI JSON: `http://127.0.0.1:8000/openapi.json`

## Path Operations And Request Models

FastAPI works best when you keep request validation, dependency injection, and routing explicit. Use Pydantic `BaseModel` for request bodies, and declare a `response_model` on the path operation when output should be filtered or documented.

```python
from typing import Annotated

from fastapi import APIRouter, Depends, FastAPI, HTTPException, Path, Query
from pydantic import BaseModel, Field

app = FastAPI(title="Inventory API")
router = APIRouter(prefix="/items", tags=["items"])

class ItemIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    price: float = Field(ge=0)
    tags: list[str] = []

class ItemOut(ItemIn):
    id: int

async def common_params(q: str | None = None, limit: int = 100):
    return {"q": q, "limit": limit}

@router.get("/", response_model=list[ItemOut])
async def list_items(
    params: Annotated[dict, Depends(common_params)],
    page: Annotated[int, Query(ge=1)] = 1,
):
    return []

@router.get("/{item_id}", response_model=ItemOut)
async def get_item(item_id: Annotated[int, Path(ge=1)]):
    raise HTTPException(status_code=404, detail="not found")

@router.post("/", status_code=201, response_model=ItemOut)
async def create_item(item: ItemIn):
    if item.price < 0:
        raise HTTPException(status_code=400, detail="price must be non-negative")
    return {"id": 1, **item.model_dump()}

app.include_router(router)
```

Notes:

- Prefer `Annotated[..., Depends(...)]`, `Annotated[..., Query(...)]`, and `Annotated[..., Path(...)]` for new code; positional `= Query(...)` defaults are an older style.
- Use Pydantic models for request bodies. Use `response_model=` when you want output filtering, schema documentation, or to hide internal fields.
- Split larger apps with `APIRouter` and `app.include_router(...)`.
- `response_model_exclude_unset=True` and `response_model_exclude_none=True` are useful when you want to omit unset fields from the response.

## Configuration And App Setup

### Constructor options you will actually use

```python
from fastapi import FastAPI

app = FastAPI(
    title="My API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
    openapi_url="/openapi.json",
    redirect_slashes=True,
)
```

Useful defaults and switches:

- `docs_url` defaults to `/docs`.
- `redoc_url` defaults to `/redoc`; set `None` to disable it.
- `openapi_url` controls the raw schema endpoint.
- `redirect_slashes=True` is the default and redirects `/items` to `/items/` when needed.

### Environment settings

FastAPI's docs use `pydantic-settings` for config instead of `pydantic.BaseSettings`.

```python
from functools import lru_cache
from typing import Annotated

from fastapi import Depends, FastAPI
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Awesome API"
    admin_email: str
    items_per_user: int = 50

@lru_cache
def get_settings() -> Settings:
    return Settings()

app = FastAPI()

@app.get("/info")
async def info(settings: Annotated[Settings, Depends(get_settings)]):
    return settings.model_dump()
```

Why this pattern matters:

- `@lru_cache` avoids rebuilding settings on every request.
- dependency-based settings are easy to override in tests.
- this matches the current upstream guidance for Pydantic v2-era FastAPI.

## Authentication And Security

FastAPI includes helpers for common auth flows. The common OAuth2 bearer pattern starts with `OAuth2PasswordBearer` and a dependency.

```python
from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.security import OAuth2PasswordBearer

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.get("/items/")
async def read_items(token: Annotated[str, Depends(oauth2_scheme)]):
    return {"token": token}
```

Important details:

- `tokenUrl="token"` is relative, so behind a prefix it resolves relative to the app.
- this only extracts the bearer token; you still need a token-issuing route and validation logic.
- the interactive docs will expose an `Authorize` button automatically.

## Middleware, Uploads, Background Tasks, Lifespan

### CORS

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Do not use `allow_origins=["*"]` together with credentialed browser auth unless that is truly what you want.

### File uploads

Install `python-multipart` before using `File()` or `UploadFile`.

```bash
pip install python-multipart
```

```python
from typing import Annotated

from fastapi import FastAPI, File, Form, UploadFile

app = FastAPI()

@app.post("/upload")
async def upload(
    file: Annotated[UploadFile, File()],
    description: Annotated[str, Form()] = "",
):
    contents = await file.read()
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(contents),
        "description": description,
    }

@app.post("/upload-many")
async def upload_many(files: Annotated[list[UploadFile], File()]):
    return [{"filename": f.filename} for f in files]
```

- `UploadFile` streams large files to disk and exposes `.file`, `.read()`, `.seek()`, and `.close()`.
- `bytes` parameters with `File()` load the whole upload into memory; use `UploadFile` for anything that may be large.

### Background tasks

Use `BackgroundTasks` for simple follow-up work tied to a request, not for durable job queues:

```python
from fastapi import BackgroundTasks, FastAPI

app = FastAPI()

def write_notification(email: str, message: str = ""):
    with open("log.txt", "w") as email_file:
        email_file.write(f"notification for {email}: {message}")

@app.post("/send-notification/{email}")
async def send_notification(email: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(write_notification, email, "some notification")
    return {"message": "Notification sent in the background"}
```

### Lifespan

Prefer `lifespan` over `@app.on_event("startup")` and `@app.on_event("shutdown")`.

```python
from contextlib import asynccontextmanager

from fastapi import FastAPI

state = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    state["ready"] = True
    yield
    state.clear()

app = FastAPI(lifespan=lifespan)
```

If you provide `lifespan`, the old startup/shutdown event handlers will not run.

### WebSockets

FastAPI exposes Starlette's WebSocket support directly. There is no separate package to install.

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

@app.websocket("/ws")
async def ws_echo(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"echo: {data}")
    except WebSocketDisconnect:
        return
```

- WebSocket routes use `@app.websocket(...)`, not `@app.get(...)`.
- `Depends(...)` works on WebSocket routes too, useful for auth checks.
- Close codes are passed via `await websocket.close(code=1008)`.

## Testing

If you installed plain `fastapi`, add `httpx` first:

```bash
pip install httpx pytest
```

```python
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/")
async def read_main():
    return {"msg": "Hello World"}

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"msg": "Hello World"}
```

For sync tests, keep test functions as normal `def`, not `async def`, unless you are intentionally using async test tooling.

## Common Pitfalls

- Installing only `fastapi` and then assuming `fastapi dev`, `TestClient`, or uploads will work without extra packages.
- Using `pydantic.BaseSettings` examples from older blog posts instead of `pydantic-settings`.
- Mixing `lifespan` with old `startup` and `shutdown` handlers and expecting both to execute.
- Forgetting that `tokenUrl` in `OAuth2PasswordBearer` is relative.
- Returning non-JSON-serializable objects without a response model or explicit serialization plan.
- Letting trailing-slash redirects surprise clients; set route shapes consistently or adjust `redirect_slashes`.
- Assuming file/form support exists without `python-multipart`.

## Version-Sensitive Notes For 0.136.3

- `0.136.3` is the current PyPI release as of `2026-05-29` and requires Python `>=3.10`.
- `0.136.x` is a patch line on top of `0.136.0`; check the upstream release notes for the exact fixes when troubleshooting.
- `0.135.0` added Server-Sent Events support.
- `0.134.0` added streaming JSON Lines and binary data with `yield`.
- `0.132.0` enabled strict JSON `Content-Type` checking by default. Clients that send JSON without a valid JSON content type now fail unless you explicitly disable it with `strict_content_type=False`.
- `0.131.0` deprecated `ORJSONResponse` and `UJSONResponse`. Avoid introducing new code that depends on those classes unless you are intentionally carrying older patterns.
- `0.130.0` improved JSON response serialization performance when using Pydantic return types or `response_model`.
- `0.129.0` dropped Python `3.9` support. Use Python `3.10+`.
- `0.129.2` also marked `fastapi-slim` as dropped; use `fastapi` or `fastapi[standard]`.

## Official Sources

- FastAPI docs: https://fastapi.tiangolo.com/
- FastAPI reference: https://fastapi.tiangolo.com/reference/
- FastAPI first steps: https://fastapi.tiangolo.com/tutorial/first-steps/
- FastAPI dependencies: https://fastapi.tiangolo.com/tutorial/dependencies/
- FastAPI settings: https://fastapi.tiangolo.com/advanced/settings/
- FastAPI security: https://fastapi.tiangolo.com/tutorial/security/first-steps/
- FastAPI CORS: https://fastapi.tiangolo.com/tutorial/cors/
- FastAPI lifespan events: https://fastapi.tiangolo.com/advanced/events/
- FastAPI testing: https://fastapi.tiangolo.com/tutorial/testing/
- FastAPI WebSockets: https://fastapi.tiangolo.com/advanced/websockets/
- FastAPI release notes: https://fastapi.tiangolo.com/release-notes/
- PyPI package page: https://pypi.org/project/fastapi/0.136.3/
