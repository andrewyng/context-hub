---
name: rest-api
description: "Google Classroom REST API - Manage courses, assignments, students, and submissions"
metadata:
  languages: "python"
  versions: "v1"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "google-classroom,education,courses,assignments,students,teachers,api"
---

# Google Classroom REST API - Python Reference (httpx)

## Golden Rule

All requests go to `https://classroom.googleapis.com/v1`. Authentication requires **OAuth 2.0** with Google-issued access tokens -- there is no API key option for most endpoints. The API is designed for Google Workspace for Education accounts but also works with consumer Google accounts for limited use. Choose the most restrictive OAuth scope that fits your needs. Pagination uses `pageToken`/`nextPageToken` pattern. Always request a GCP project with the Classroom API enabled.

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
            f"{BASE_URL}/courses",
            headers=HEADERS,
            params={"pageSize": 20},
        )
        print(resp.json())

asyncio.run(main())
```

## Base URL

```
https://classroom.googleapis.com/v1
```

```python
import os

ACCESS_TOKEN = os.environ["GOOGLE_ACCESS_TOKEN"]
BASE_URL = "https://classroom.googleapis.com/v1"
HEADERS = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
```

## Authentication

Google Classroom uses **OAuth 2.0** exclusively. Obtain tokens via the Google OAuth2 flow with appropriate scopes.

### Common OAuth Scopes

| Scope | Access |
|---|---|
| `classroom.courses` | Create, edit, delete courses |
| `classroom.courses.readonly` | View courses |
| `classroom.coursework.students` | Manage coursework and submissions for students |
| `classroom.coursework.students.readonly` | View coursework and submissions |
| `classroom.coursework.me` | Manage own coursework submissions |
| `classroom.coursework.me.readonly` | View own submissions |
| `classroom.rosters` | Manage course rosters |
| `classroom.rosters.readonly` | View course rosters |
| `classroom.profile.emails` | View student/teacher emails |
| `classroom.profile.photos` | View student/teacher photos |
| `classroom.announcements` | Create and manage announcements |
| `classroom.announcements.readonly` | View announcements |
| `classroom.topics` | Manage course topics |
| `classroom.topics.readonly` | View course topics |

All scope URLs are prefixed with `https://www.googleapis.com/auth/`.

### Token Refresh Pattern

```python
async def refresh_access_token(
    client: httpx.AsyncClient,
    client_id: str,
    client_secret: str,
    refresh_token: str,
) -> str:
    resp = await client.post(
        "https://oauth2.googleapis.com/token",
        data={
            "client_id": client_id,
            "client_secret": client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        },
    )
    resp.raise_for_status()
    return resp.json()["access_token"]
```

## Rate Limiting

Google Classroom API follows Google's standard quota system. Default quotas are per-project and include:
- Read requests per minute per user
- Write requests per minute per user

Check the Google Cloud Console > APIs & Services > Quotas for your exact limits. When exceeded, the API returns `429` with a `Retry-After` header.

```python
import asyncio

async def classroom_request(
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

## Pagination

Google Classroom uses `pageToken`/`nextPageToken` pagination.

```python
async def paginate(
    client: httpx.AsyncClient,
    path: str,
    result_key: str,
    params: dict = None,
    page_size: int = 100,
) -> list:
    all_items = []
    request_params = {**(params or {}), "pageSize": page_size}

    while True:
        resp = await classroom_request(client, "GET", path, params=request_params)
        data = resp.json()
        all_items.extend(data.get(result_key, []))

        next_token = data.get("nextPageToken")
        if not next_token:
            break
        request_params["pageToken"] = next_token

    return all_items
```

## Methods

### Courses

#### List Courses

**Parameters:**
- `studentId` (str) -- Filter to courses where this user is a student (`me` for current user)
- `teacherId` (str) -- Filter to courses where this user is a teacher
- `courseStates` (str) -- Filter by state: `ACTIVE`, `ARCHIVED`, `PROVISIONED`, `DECLINED`, `SUSPENDED`
- `pageSize` (int) -- Max results per page (default 100)

```python
async def list_courses(
    client: httpx.AsyncClient,
    student_id: str = None,
    teacher_id: str = None,
    course_states: list[str] = None,
) -> list:
    params = {}
    if student_id:
        params["studentId"] = student_id
    if teacher_id:
        params["teacherId"] = teacher_id
    if course_states:
        params["courseStates"] = course_states
    return await paginate(client, "/courses", "courses", params)

# Usage
my_courses = await list_courses(client, student_id="me", course_states=["ACTIVE"])
for c in my_courses:
    print(f"{c['id']}: {c['name']} -- {c.get('section', '')}")
```

#### Create a Course

```python
async def create_course(
    client: httpx.AsyncClient,
    name: str,
    section: str = None,
    description: str = None,
    room: str = None,
    owner_id: str = "me",
) -> dict:
    payload = {"name": name, "ownerId": owner_id}
    if section:
        payload["section"] = section
    if description:
        payload["descriptionHeading"] = description
    if room:
        payload["room"] = room
    resp = await classroom_request(client, "POST", "/courses", json_data=payload)
    return resp.json()
```

#### Get / Update / Delete a Course

```python
async def get_course(client: httpx.AsyncClient, course_id: str) -> dict:
    resp = await classroom_request(client, "GET", f"/courses/{course_id}")
    return resp.json()

async def update_course(client: httpx.AsyncClient, course_id: str, update_mask: str, **kwargs) -> dict:
    resp = await classroom_request(
        client, "PATCH", f"/courses/{course_id}",
        params={"updateMask": update_mask},
        json_data=kwargs,
    )
    return resp.json()

async def delete_course(client: httpx.AsyncClient, course_id: str) -> None:
    await classroom_request(client, "DELETE", f"/courses/{course_id}")
```

### Course Work (Assignments)

#### List Course Work

```python
async def list_coursework(
    client: httpx.AsyncClient,
    course_id: str,
    course_work_states: list[str] = None,
    order_by: str = None,
) -> list:
    params = {}
    if course_work_states:
        params["courseWorkStates"] = course_work_states
    if order_by:
        params["orderBy"] = order_by  # e.g., "dueDate asc", "updateTime desc"
    return await paginate(client, f"/courses/{course_id}/courseWork", "courseWork", params)

# Usage
assignments = await list_coursework(client, "123456", course_work_states=["PUBLISHED"])
for a in assignments:
    print(f"{a['title']} -- due: {a.get('dueDate', 'no date')}")
```

#### Create Course Work

```python
async def create_coursework(
    client: httpx.AsyncClient,
    course_id: str,
    title: str,
    work_type: str = "ASSIGNMENT",
    description: str = "",
    max_points: float = 100,
    due_date: dict = None,
    due_time: dict = None,
    state: str = "PUBLISHED",
) -> dict:
    payload = {
        "title": title,
        "workType": work_type,  # ASSIGNMENT, SHORT_ANSWER_QUESTION, MULTIPLE_CHOICE_QUESTION
        "description": description,
        "maxPoints": max_points,
        "state": state,
    }
    if due_date:
        payload["dueDate"] = due_date  # {"year": 2026, "month": 4, "day": 1}
    if due_time:
        payload["dueTime"] = due_time  # {"hours": 23, "minutes": 59}
    resp = await classroom_request(client, "POST", f"/courses/{course_id}/courseWork", json_data=payload)
    return resp.json()

# Usage
assignment = await create_coursework(
    client, "123456",
    title="Week 5 Reading Response",
    description="Write a 300-word response to Chapter 5.",
    max_points=50,
    due_date={"year": 2026, "month": 4, "day": 1},
    due_time={"hours": 23, "minutes": 59},
)
```

### Student Submissions

#### List Submissions

```python
async def list_submissions(
    client: httpx.AsyncClient,
    course_id: str,
    coursework_id: str,
    states: list[str] = None,
) -> list:
    params = {}
    if states:
        params["states"] = states  # NEW, CREATED, TURNED_IN, RETURNED, RECLAIMED_BY_STUDENT
    return await paginate(
        client,
        f"/courses/{course_id}/courseWork/{coursework_id}/studentSubmissions",
        "studentSubmissions",
        params,
    )
```

#### Grade and Return a Submission

```python
async def grade_submission(
    client: httpx.AsyncClient,
    course_id: str,
    coursework_id: str,
    submission_id: str,
    grade: float,
) -> dict:
    resp = await classroom_request(
        client, "PATCH",
        f"/courses/{course_id}/courseWork/{coursework_id}/studentSubmissions/{submission_id}",
        params={"updateMask": "assignedGrade,draftGrade"},
        json_data={"assignedGrade": grade, "draftGrade": grade},
    )
    return resp.json()

async def return_submission(
    client: httpx.AsyncClient,
    course_id: str,
    coursework_id: str,
    submission_id: str,
) -> None:
    await classroom_request(
        client, "POST",
        f"/courses/{course_id}/courseWork/{coursework_id}/studentSubmissions/{submission_id}:return",
    )
```

### Students and Teachers

```python
async def list_students(client: httpx.AsyncClient, course_id: str) -> list:
    return await paginate(client, f"/courses/{course_id}/students", "students")

async def list_teachers(client: httpx.AsyncClient, course_id: str) -> list:
    return await paginate(client, f"/courses/{course_id}/teachers", "teachers")

async def add_student(client: httpx.AsyncClient, course_id: str, email: str) -> dict:
    resp = await classroom_request(
        client, "POST", f"/courses/{course_id}/students",
        json_data={"userId": email},
    )
    return resp.json()
```

### Announcements

```python
async def list_announcements(
    client: httpx.AsyncClient,
    course_id: str,
    states: list[str] = None,
) -> list:
    params = {}
    if states:
        params["announcementStates"] = states
    return await paginate(client, f"/courses/{course_id}/announcements", "announcements", params)

async def create_announcement(
    client: httpx.AsyncClient,
    course_id: str,
    text: str,
    state: str = "PUBLISHED",
) -> dict:
    resp = await classroom_request(
        client, "POST", f"/courses/{course_id}/announcements",
        json_data={"text": text, "state": state},
    )
    return resp.json()
```

### Topics

```python
async def list_topics(client: httpx.AsyncClient, course_id: str) -> list:
    return await paginate(client, f"/courses/{course_id}/topics", "topic")

async def create_topic(client: httpx.AsyncClient, course_id: str, name: str) -> dict:
    resp = await classroom_request(
        client, "POST", f"/courses/{course_id}/topics",
        json_data={"name": name},
    )
    return resp.json()
```

## Error Handling

| Code | Meaning |
|---|---|
| 200 | Success |
| 400 | Bad Request -- invalid parameters |
| 401 | Unauthorized -- expired or invalid token |
| 403 | Forbidden -- insufficient scope or not a course member |
| 404 | Not Found -- course or resource does not exist |
| 409 | Conflict -- resource already exists (e.g., student already enrolled) |
| 429 | Too Many Requests -- quota exceeded |

```python
class ClassroomError(Exception):
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(f"[{status_code}] {message}")

async def safe_classroom_request(client: httpx.AsyncClient, method: str, path: str, **kwargs) -> dict | None:
    try:
        resp = await classroom_request(client, method, path, **kwargs)
        if resp.status_code == 204:
            return None
        return resp.json()
    except httpx.HTTPStatusError as e:
        body = e.response.json() if e.response.content else {}
        error = body.get("error", {})
        raise ClassroomError(
            e.response.status_code,
            error.get("message", "Unknown error"),
        ) from e
```

## Common Pitfalls

1. **Enable the Classroom API in GCP Console first.** You must enable the Google Classroom API for your GCP project before making any requests.

2. **Due dates use separate date and time objects.** The `dueDate` is `{"year": YYYY, "month": M, "day": D}` and `dueTime` is `{"hours": H, "minutes": M}` in UTC. These are not ISO 8601 strings.

3. **`updateMask` is required for PATCH requests.** You must specify which fields are being updated as a comma-separated string in the `updateMask` query parameter.

4. **Course states affect visibility.** Only `ACTIVE` courses are visible to students. `ARCHIVED` courses are read-only. Use `courseStates` filter to find non-active courses.

5. **User IDs can be `me` or an email.** Use `"me"` for the authenticated user. For other users, pass their email address or numeric ID.

6. **Grading requires two fields.** Set both `assignedGrade` (visible to student) and `draftGrade` (teacher's working grade). Then call the `:return` action to make the grade visible.

7. **`workType` is immutable after creation.** You cannot change an assignment to a quiz or vice versa after it is created.

8. **Consumer Google accounts have limited access.** The full Classroom experience is designed for Google Workspace for Education. Consumer accounts can create courses but face restrictions on roster management.

9. **409 on duplicate enrollment is expected.** Adding a student who is already enrolled returns 409. Handle this as a success case in your code.

10. **Submissions have a lifecycle.** States progress: `NEW` -> `CREATED` -> `TURNED_IN` -> `RETURNED`. Use `:turnIn`, `:return`, `:reclaim` actions to advance the state.
