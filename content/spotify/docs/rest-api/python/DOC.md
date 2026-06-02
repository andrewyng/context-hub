---
name: rest-api
description: "Spotify Web API - Music streaming, playlists, playback control, and audio metadata"
metadata:
  languages: "python"
  versions: "v1"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "spotify,music,playlists,audio,mood,streaming,api"
---

# Spotify Web API - Python Reference (httpx)

## Golden Rule

All requests go to `https://api.spotify.com/v1`. Authentication requires an **OAuth2 access token** -- there is no API key auth. Use Authorization Code with PKCE flow for user-specific operations (playback, library). Use Client Credentials flow for public catalog searches. Tokens expire after **1 hour** -- always handle 401 by refreshing. Rate limits are per-app in a rolling 30-second window; the API returns `429` with a `Retry-After` header.

## Installation

```bash
pip install httpx
```

All examples use `httpx` with async/await. For scripts that need a synchronous entrypoint:

```python
import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{BASE_URL}/search",
            headers=HEADERS,
            params={"q": "focus playlist", "type": "playlist", "limit": 5},
        )
        print(resp.json())

asyncio.run(main())
```

## Base URL

```
https://api.spotify.com/v1
```

Token endpoints:
```
https://accounts.spotify.com/api/token
https://accounts.spotify.com/authorize
```

```python
import os

ACCESS_TOKEN = os.environ["SPOTIFY_ACCESS_TOKEN"]
BASE_URL = "https://api.spotify.com/v1"
HEADERS = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
```

## Authentication

Spotify uses **OAuth 2.0** exclusively. Choose the flow based on your needs:

### Client Credentials (Public Data Only)

For searching catalog, getting track metadata -- no user data access.

```python
import base64

async def get_client_token(client: httpx.AsyncClient) -> str:
    client_id = os.environ["SPOTIFY_CLIENT_ID"]
    client_secret = os.environ["SPOTIFY_CLIENT_SECRET"]
    credentials = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()

    resp = await client.post(
        "https://accounts.spotify.com/api/token",
        headers={
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data={"grant_type": "client_credentials"},
    )
    resp.raise_for_status()
    return resp.json()["access_token"]  # Expires in 3600 seconds
```

### Authorization Code with PKCE (User Data)

For playback control, library access, playlist management. Recommended for all user-facing apps.

```python
import hashlib
import secrets

def generate_pkce_pair() -> tuple[str, str]:
    verifier = secrets.token_urlsafe(64)[:128]
    challenge = base64.urlsafe_b64encode(
        hashlib.sha256(verifier.encode()).digest()
    ).decode().rstrip("=")
    return verifier, challenge

def build_auth_url(client_id: str, redirect_uri: str, scopes: list[str]) -> tuple[str, str]:
    verifier, challenge = generate_pkce_pair()
    scope = " ".join(scopes)
    url = (
        f"https://accounts.spotify.com/authorize?"
        f"client_id={client_id}&response_type=code&redirect_uri={redirect_uri}"
        f"&scope={scope}&code_challenge_method=S256&code_challenge={challenge}"
    )
    return url, verifier

async def exchange_code(
    client: httpx.AsyncClient,
    code: str,
    verifier: str,
    client_id: str,
    redirect_uri: str,
) -> dict:
    resp = await client.post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "client_id": client_id,
            "code_verifier": verifier,
        },
    )
    resp.raise_for_status()
    return resp.json()  # {"access_token": ..., "refresh_token": ..., "expires_in": 3600}
```

### Common OAuth Scopes

| Scope | Access |
|---|---|
| `user-read-private` | User profile details |
| `user-read-email` | User email |
| `playlist-read-private` | Private playlists |
| `playlist-modify-public` | Create/edit public playlists |
| `playlist-modify-private` | Create/edit private playlists |
| `user-library-read` | Saved tracks/albums |
| `user-library-modify` | Save/remove tracks/albums |
| `user-read-playback-state` | Current playback state |
| `user-modify-playback-state` | Control playback |
| `user-read-currently-playing` | Currently playing track |
| `user-read-recently-played` | Recently played tracks |
| `user-top-read` | Top artists and tracks |
| `streaming` | Web Playback SDK (Premium) |

## Rate Limiting

Rate limits are calculated per app in a **rolling 30-second window**. The exact limit depends on your app's quota mode (development vs extended).

When rate limited, the API returns `429` with a `Retry-After` header (seconds).

```python
import asyncio

async def spotify_request(
    client: httpx.AsyncClient,
    method: str,
    path: str,
    params: dict = None,
    json_data: dict = None,
    max_retries: int = 3,
) -> httpx.Response:
    for attempt in range(max_retries):
        resp = await client.request(
            method,
            f"{BASE_URL}{path}",
            headers=HEADERS,
            params=params,
            json=json_data,
        )
        if resp.status_code == 429:
            wait = int(resp.headers.get("Retry-After", 2 ** attempt))
            await asyncio.sleep(wait)
            continue
        if resp.status_code == 401:
            raise Exception("Access token expired -- refresh and retry")
        resp.raise_for_status()
        return resp
    raise Exception("Max retries exceeded due to rate limiting")
```

## Methods

### Search

Search the Spotify catalog for tracks, artists, albums, playlists, shows, or episodes.

**Parameters:**
- `q` (str) -- Search query. Supports field filters: `artist:Beethoven`, `genre:focus`, `year:2020-2025`
- `type` (str) -- Comma-separated: `track`, `artist`, `album`, `playlist`, `show`, `episode`
- `limit` (int) -- Max results per type (default 5, max 10 as of Feb 2026)
- `offset` (int) -- Pagination offset
- `market` (str) -- ISO 3166-1 country code

```python
async def search(
    client: httpx.AsyncClient,
    query: str,
    types: str = "track",
    limit: int = 10,
    market: str = "US",
) -> dict:
    resp = await spotify_request(client, "GET", "/search", params={
        "q": query,
        "type": types,
        "limit": limit,
        "market": market,
    })
    return resp.json()

# Usage -- find focus playlists
results = await search(client, "focus study concentration", types="playlist", limit=5)
for p in results["playlists"]["items"]:
    print(f"{p['name']} -- {p['tracks']['total']} tracks")
```

### Get a Track

```python
async def get_track(client: httpx.AsyncClient, track_id: str, market: str = "US") -> dict:
    resp = await spotify_request(client, "GET", f"/tracks/{track_id}", params={"market": market})
    return resp.json()

# Returns: {"name": ..., "artists": [...], "album": {...}, "duration_ms": ..., "preview_url": ...}
```

### Get Audio Features

Get audio analysis data for tracks (tempo, energy, valence/mood, danceability).

```python
async def get_audio_features(client: httpx.AsyncClient, track_ids: list[str]) -> list:
    resp = await spotify_request(client, "GET", "/audio-features", params={
        "ids": ",".join(track_ids),
    })
    return resp.json()["audio_features"]

# Returns per track: {"energy": 0.8, "valence": 0.6, "tempo": 120.0, "danceability": 0.7, ...}
```

### Playlists

#### Get a Playlist

```python
async def get_playlist(client: httpx.AsyncClient, playlist_id: str, fields: str = None) -> dict:
    params = {}
    if fields:
        params["fields"] = fields  # e.g., "name,tracks.items(track(name,artists))"
    resp = await spotify_request(client, "GET", f"/playlists/{playlist_id}", params=params)
    return resp.json()
```

#### Get Playlist Items

```python
async def get_playlist_items(
    client: httpx.AsyncClient,
    playlist_id: str,
    limit: int = 50,
    offset: int = 0,
) -> dict:
    resp = await spotify_request(client, "GET", f"/playlists/{playlist_id}/items", params={
        "limit": limit,
        "offset": offset,
    })
    return resp.json()
```

#### Create a Playlist

```python
async def create_playlist(
    client: httpx.AsyncClient,
    user_id: str,
    name: str,
    public: bool = False,
    description: str = "",
) -> dict:
    resp = await spotify_request(client, "POST", f"/users/{user_id}/playlists", json_data={
        "name": name,
        "public": public,
        "description": description,
    })
    return resp.json()
```

#### Add Items to a Playlist

```python
async def add_to_playlist(
    client: httpx.AsyncClient,
    playlist_id: str,
    uris: list[str],
    position: int = None,
) -> dict:
    payload = {"uris": uris}  # e.g., ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh"]
    if position is not None:
        payload["position"] = position
    resp = await spotify_request(client, "POST", f"/playlists/{playlist_id}/items", json_data=payload)
    return resp.json()
```

### Player (Requires Premium + user-modify-playback-state scope)

#### Get Current Playback

```python
async def get_playback(client: httpx.AsyncClient) -> dict | None:
    resp = await spotify_request(client, "GET", "/me/player")
    if resp.status_code == 204:
        return None  # No active device
    return resp.json()
```

#### Start/Resume Playback

```python
async def start_playback(
    client: httpx.AsyncClient,
    device_id: str = None,
    context_uri: str = None,
    uris: list[str] = None,
) -> None:
    params = {}
    if device_id:
        params["device_id"] = device_id
    payload = {}
    if context_uri:
        payload["context_uri"] = context_uri  # e.g., "spotify:playlist:37i9dQZF1DX..."
    elif uris:
        payload["uris"] = uris
    await spotify_request(client, "PUT", "/me/player/play", params=params, json_data=payload)
```

### User Library

```python
async def get_saved_tracks(client: httpx.AsyncClient, limit: int = 50, offset: int = 0) -> dict:
    resp = await spotify_request(client, "GET", "/me/tracks", params={
        "limit": limit,
        "offset": offset,
    })
    return resp.json()

async def save_tracks(client: httpx.AsyncClient, track_ids: list[str]) -> None:
    await spotify_request(client, "PUT", "/me/tracks", json_data={"ids": track_ids})

async def get_top_items(
    client: httpx.AsyncClient,
    item_type: str = "tracks",
    time_range: str = "medium_term",
    limit: int = 20,
) -> dict:
    resp = await spotify_request(client, "GET", f"/me/top/{item_type}", params={
        "time_range": time_range,  # short_term (4 weeks), medium_term (6 months), long_term (years)
        "limit": limit,
    })
    return resp.json()
```

### Get Current User Profile

```python
async def get_me(client: httpx.AsyncClient) -> dict:
    resp = await spotify_request(client, "GET", "/me")
    return resp.json()
```

## Error Handling

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 204 | No Content (success, no body) |
| 400 | Bad Request -- invalid parameters |
| 401 | Unauthorized -- expired or invalid token |
| 403 | Forbidden -- bad OAuth scope or Premium required |
| 404 | Not Found -- resource does not exist |
| 429 | Too Many Requests -- rate limited |

```python
class SpotifyError(Exception):
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(f"[{status_code}] {message}")

async def safe_spotify_request(client: httpx.AsyncClient, method: str, path: str, **kwargs) -> dict | None:
    try:
        resp = await spotify_request(client, method, path, **kwargs)
        if resp.status_code == 204:
            return None
        return resp.json()
    except httpx.HTTPStatusError as e:
        body = e.response.json() if e.response.content else {}
        error = body.get("error", {})
        raise SpotifyError(
            e.response.status_code,
            error.get("message", "Unknown error"),
        ) from e
```

## Common Pitfalls

1. **Tokens expire after 1 hour.** Always handle 401 by refreshing the token using the refresh_token grant. Store refresh tokens securely.

2. **Search `limit` max reduced to 10 (Feb 2026).** The default is now 5. If you need more results, paginate using `offset`.

3. **Playlist track endpoints renamed to `/items` (Feb 2026).** The old `/tracks` path still works but is deprecated. Use `/playlists/{id}/items` for new code.

4. **Player endpoints require Premium.** Free-tier users get 403 on playback control endpoints. Check the user's `product` field from `/me` before attempting player operations.

5. **Audio features may return null entries.** If a track ID is invalid or the track is unavailable, the corresponding entry in the `audio_features` array is `null`. Always filter nulls.

6. **Use `fields` parameter to reduce payload size.** Playlist responses can be very large. Use Spotify's field filtering syntax: `fields=items(track(name,artists(name)))`.

7. **Market parameter affects availability.** Passing `market` returns only tracks available in that country. Omitting it may return tracks the user cannot play.

8. **URIs vs IDs.** Some endpoints accept Spotify URIs (`spotify:track:xxx`), others accept bare IDs. Check the endpoint docs. Playlist add/remove always uses URIs.

9. **`valence` is the mood metric.** In audio features, `valence` ranges 0.0 (sad/angry) to 1.0 (happy/cheerful). Useful for building mood-based playlists.

10. **Dev mode limits are strict.** Apps in development mode have much lower rate limits. Apply for extended quota mode before deploying to multiple users.
