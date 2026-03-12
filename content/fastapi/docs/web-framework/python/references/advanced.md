# FastAPI Advanced Topics

## JWT Authentication

```python
# pip install python-jose[cryptography] passlib[bcrypt]
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel

SECRET_KEY = "your-secret-key"  # use a strong random key in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = await db.get_user_by_username(token_data.username)
    if user is None:
        raise credentials_exception
    return user


# Login endpoint
@app.post("/auth/token", response_model=Token)
async def login(form: OAuth2PasswordRequestForm = Depends()):
    user = await db.get_user_by_username(form.username)
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": user.username})
    return Token(access_token=token, token_type="bearer")


@app.get("/me")
async def read_me(user: User = Depends(get_current_user)) -> UserPublic:
    return user
```

## File Uploads

```python
# pip install python-multipart (included in fastapi[standard])
from fastapi import FastAPI, File, UploadFile, HTTPException
from pathlib import Path
import aiofiles

app = FastAPI()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Validate content type
    allowed_types = {"image/jpeg", "image/png", "image/gif", "application/pdf"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="File type not allowed")

    # Stream to disk safely
    dest = UPLOAD_DIR / file.filename
    size = 0
    async with aiofiles.open(dest, "wb") as out:
        while chunk := await file.read(65536):
            size += len(chunk)
            if size > MAX_FILE_SIZE:
                dest.unlink(missing_ok=True)
                raise HTTPException(status_code=413, detail="File too large")
            await out.write(chunk)

    return {"filename": file.filename, "size": size, "content_type": file.content_type}


# Multiple files
@app.post("/upload/multiple")
async def upload_multiple(files: list[UploadFile] = File(...)):
    results = []
    for file in files:
        content = await file.read()
        results.append({"filename": file.filename, "size": len(content)})
    return results
```

## WebSockets

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict

app = FastAPI()


class ConnectionManager:
    def __init__(self):
        self._connections: Dict[str, WebSocket] = {}

    async def connect(self, client_id: str, ws: WebSocket):
        await ws.accept()
        self._connections[client_id] = ws

    def disconnect(self, client_id: str):
        self._connections.pop(client_id, None)

    async def send(self, client_id: str, message: str):
        if ws := self._connections.get(client_id):
            await ws.send_text(message)

    async def broadcast(self, message: str):
        for ws in self._connections.values():
            await ws.send_text(message)


manager = ConnectionManager()


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(client_id, websocket)
    try:
        await manager.broadcast(f"{client_id} joined")
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"{client_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(client_id)
        await manager.broadcast(f"{client_id} left")
```

## Async SQLAlchemy Integration

```python
# pip install sqlalchemy[asyncio] asyncpg
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import select
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends

DATABASE_URL = "postgresql+asyncpg://user:password@localhost/dbname"

engine = create_async_engine(DATABASE_URL, pool_size=10, max_overflow=20)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class ItemORM(Base):
    __tablename__ = "items"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column()
    price: Mapped[float] = mapped_column()


# Dependency — yields session, auto-closes after request
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


# Pydantic v2 — from_attributes required to read ORM objects
class ItemResponse(BaseModel):
    id: int
    name: str
    price: float
    model_config = {"from_attributes": True}


@app.get("/items/{item_id}", response_model=ItemResponse)
async def get_item(item_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ItemORM).where(ItemORM.id == item_id))
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=404, detail="Not found")
    return item


@app.post("/items", response_model=ItemResponse, status_code=201)
async def create_item(data: ItemCreate, db: AsyncSession = Depends(get_db)):
    item = ItemORM(**data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


# Lifespan — create/drop tables
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(lifespan=lifespan)
```

## Testing with TestClient and httpx

```python
# pip install httpx pytest pytest-anyio
import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport

from main import app  # your FastAPI app


# --- Synchronous tests (TestClient) ---
client = TestClient(app)

def test_create_item():
    response = client.post("/items", json={"name": "Widget", "price": 9.99})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Widget"
    assert data["price"] == 9.99
    assert "id" in data

def test_get_item_not_found():
    response = client.get("/items/99999")
    assert response.status_code == 404

def test_list_items_pagination():
    response = client.get("/items?skip=0&limit=5")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


# --- Async tests (httpx + anyio) ---
@pytest.mark.anyio
async def test_create_item_async():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.post("/items", json={"name": "Gadget", "price": 19.99})
    assert response.status_code == 201
    assert response.json()["name"] == "Gadget"


# --- Override dependencies in tests ---
from fastapi import Depends
from main import get_db, get_current_user

async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

async def override_get_current_user():
    return User(id=1, name="Test User", email="test@example.com", role="user")

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user

def test_authenticated_route():
    response = client.get("/me")
    assert response.status_code == 200
    assert response.json()["name"] == "Test User"

# Restore after tests
def teardown():
    app.dependency_overrides.clear()
```

## Server-Sent Events (SSE) Streaming

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio

app = FastAPI()

async def event_generator(topic: str):
    """Yields SSE-formatted strings."""
    for i in range(10):
        yield f"data: message {i} on {topic}\n\n"
        await asyncio.sleep(1)
    yield "data: [DONE]\n\n"

@app.get("/stream/{topic}")
async def stream(topic: str):
    return StreamingResponse(
        event_generator(topic),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
```

## Settings with Pydantic v2 BaseSettings

```python
# pip install pydantic-settings
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "My API"
    database_url: str
    secret_key: str
    debug: bool = False
    allowed_origins: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()


# Use as dependency
@app.get("/info")
async def info(settings: Settings = Depends(get_settings)):
    return {"app": settings.app_name, "debug": settings.debug}
```
