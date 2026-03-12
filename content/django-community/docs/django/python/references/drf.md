# Django REST Framework 3.16 Coding Guidelines

You are a Django REST Framework coding expert. Help me write DRF 3.16 code for building web APIs with Django 5.2, including serializers, viewsets, routers, authentication, permissions, and pagination.

You can find the official documentation here:
https://www.django-rest-framework.org/

## Golden Rule: Explicit Fields, Router Registration, raise_exception

Always prefer `ModelSerializer` over `Serializer` for model-backed resources. Never use `fields = '__all__'`. Always register ViewSets with a router — never call `.as_view()` on `@action` methods. Always use `is_valid(raise_exception=True)`.

- **Correct:** `fields = ["id", "title", "status", "created_at"]` — explicit field list
- **Correct:** `router.register(r"courses", CourseViewSet, basename="course")` — no trailing slash in prefix
- **Correct:** `serializer.is_valid(raise_exception=True)` — raises HTTP 400 automatically
- **Correct:** `get_permissions()` override for per-action permission logic
- **Correct:** `basename="course"` required when using `get_queryset()` without class-level `queryset`
- **Incorrect:** `fields = '__all__'` — exposes unintended fields, breaks on schema changes
- **Incorrect:** `router.register(r"courses/", ...)` — trailing slash causes double slash in URLs
- **Incorrect:** `CourseViewSet.as_view(...)` with `@action` — bypasses router setup, ignores `permission_classes`
- **Incorrect:** `if not serializer.is_valid(): return Response(serializer.errors)` — use `raise_exception=True`
- **Incorrect:** Accessing `request.user` in serializer `validate_*` without passing request context

**Installation:**

```bash
pip install djangorestframework
```

```python
# settings.py
INSTALLED_APPS = [
    ...
    "rest_framework",
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}
```

## Serializers

### ModelSerializer

```python
# courses/serializers.py
from rest_framework import serializers
from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ["id", "title", "description", "status", "instructor_name", "created_at"]
        read_only_fields = ["id", "created_at"]

    def get_instructor_name(self, obj):
        return obj.instructor.get_full_name() if obj.instructor else None
```

### Nested Serializer (read-only)

```python
class InstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class CourseDetailSerializer(serializers.ModelSerializer):
    instructor = InstructorSerializer(read_only=True)

    class Meta:
        model = Course
        fields = ["id", "title", "description", "status", "instructor", "created_at"]
        read_only_fields = ["id", "created_at"]
```

### Write Serializer with HiddenField for Current User

```python
class CourseCreateSerializer(serializers.ModelSerializer):
    instructor = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Course
        fields = ["id", "title", "description", "status", "instructor"]
        read_only_fields = ["id"]
```

`CurrentUserDefault` requires the request to be passed in the serializer context — ViewSets do this automatically.

### Validation and is_valid

Always call `is_valid(raise_exception=True)` — it raises `HTTP 400` automatically without manual error handling:

```python
# Correct
serializer = CourseSerializer(data=request.data)
serializer.is_valid(raise_exception=True)
serializer.save()

# Incorrect — verbose, avoid this pattern
if not serializer.is_valid():
    return Response(serializer.errors, status=400)
```

Custom field-level and cross-field validation:

```python
class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "title", "status"]

    def validate_title(self, value):
        # Field-level: validate_<field_name>, receives the field value
        if len(value) < 5:
            raise serializers.ValidationError("Title must be at least 5 characters.")
        return value

    def validate(self, data):
        # Object-level: cross-field, receives all validated data as dict
        if data.get("status") == "published" and not data.get("title"):
            raise serializers.ValidationError("Published courses must have a title.")
        return data
```

Note: if a field is declared with `required=False`, its `validate_<field_name>` is skipped when the field is absent.

### Partial Updates (PATCH)

```python
# Update only specific fields — partial=True skips required-field validation
serializer = CourseSerializer(course, data={"status": "published"}, partial=True)
serializer.is_valid(raise_exception=True)
serializer.save()
```

### SerializerMethodField

```python
class CourseSerializer(serializers.ModelSerializer):
    enrollment_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ["id", "title", "enrollment_count", "is_enrolled"]

    def get_enrollment_count(self, obj):
        return obj.enrollments.count()

    def get_is_enrolled(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.enrollments.filter(user=request.user).exists()
        return False
```

---

## ViewSets

### ModelViewSet (full CRUD)

```python
# courses/views.py
from rest_framework import viewsets, permissions
from .models import Course
from .serializers import CourseSerializer


class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Course.objects.filter(instructor=self.request.user)

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)
```

### ReadOnlyModelViewSet (list + retrieve only)

```python
class PublicCourseViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Course.objects.filter(status=Course.Status.PUBLISHED)
```

### Per-Action Permissions — get_permissions()

The official pattern to vary permissions by action. Note: `self.action` is NOT available in `get_parsers()`, `get_authenticators()`, or `get_content_negotiator()` — only in `get_permissions()` and view methods.

```python
class CourseViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        return Course.objects.filter(status=Course.Status.PUBLISHED)
```

### Per-Action Serializers

```python
class CourseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return CourseCreateSerializer
        return CourseDetailSerializer

    def get_queryset(self):
        return Course.objects.filter(instructor=self.request.user)
```

### Custom @action

`@action` defaults to GET. Use `methods` for other verbs. Supports `http.HTTPMethod` enum (Python 3.11+). Can override `permission_classes`, `serializer_class`, `filter_backends` per-action.

```python
from http import HTTPMethod
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status


class CourseViewSet(viewsets.ModelViewSet):
    ...

    @action(detail=True, methods=[HTTPMethod.POST], permission_classes=[permissions.IsAuthenticated])
    def publish(self, request, pk=None):
        course = self.get_object()
        if course.instructor != request.user:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        course.status = Course.Status.PUBLISHED
        course.save(update_fields=["status"])
        return Response({"status": "published"})

    @action(detail=False, methods=[HTTPMethod.GET])
    def published(self, request):
        # Always use paginate_queryset for list @actions
        qs = Course.objects.filter(status=Course.Status.PUBLISHED)
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
```

### Multi-method Mapping on Single @action

Map multiple HTTP methods to different methods on the same URL path:

```python
@action(detail=True, methods=["put"], url_path="password", url_name="change_password")
def set_password(self, request, pk=None):
    """Update the user's password."""
    ...

@set_password.mapping.delete
def delete_password(self, request, pk=None):
    """Delete the user's password."""
    ...
```

Note: additional mappings do not accept arguments.

---

## Routers and URLs

```python
# courses/urls.py
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet

router = DefaultRouter()
# ⚠️ No trailing slash in prefix — DRF appends slashes automatically
# ⚠️ basename required when ViewSet uses get_queryset() without class-level queryset
router.register(r"courses", CourseViewSet, basename="course")

urlpatterns = router.urls
```

```python
# myproject/urls.py
from django.urls import path, include

urlpatterns = [
    path("api/v1/", include("courses.urls")),
    # With namespace:
    # path("api/v1/", include((router.urls, "app_name"))),
]
```

**`basename` is mandatory** when `get_queryset()` is used without a class-level `queryset`:
```python
# This raises an error — DRF cannot derive basename from the model
router.register(r"courses", CourseViewSet)  # ❌ if no queryset attr

# Correct
router.register(r"courses", CourseViewSet, basename="course")  # ✅
```

**UUID lookup** — restrict `pk` to UUID format:
```python
class CourseViewSet(viewsets.ModelViewSet):
    lookup_field = "pk"
    lookup_value_regex = "[0-9a-f-]{36}"  # UUID pattern
```

**No trailing slash** (e.g. for React Native or mobile clients):
```python
router = DefaultRouter(trailing_slash=False)
```

Generated URL names for `CourseViewSet` (used in `reverse()`):

| URL | Method | Action | URL Name |
|-----|--------|--------|----------|
| `/api/v1/courses/` | GET | list | `course-list` |
| `/api/v1/courses/` | POST | create | `course-list` |
| `/api/v1/courses/{pk}/` | GET | retrieve | `course-detail` |
| `/api/v1/courses/{pk}/` | PUT/PATCH | update | `course-detail` |
| `/api/v1/courses/{pk}/` | DELETE | destroy | `course-detail` |
| `/api/v1/courses/{pk}/publish/` | POST | publish (custom) | `course-publish` |
| `/api/v1/courses/published/` | GET | published (custom) | `course-published` |

---

## Permissions

### Built-in Permission Classes

```python
from rest_framework.permissions import (
    IsAuthenticated,
    IsAdminUser,
    IsAuthenticatedOrReadOnly,
    AllowAny,
)
```

### Custom Object Permission

```python
# courses/permissions.py
from rest_framework import permissions


class IsInstructorOrReadOnly(permissions.BasePermission):
    """Allow read to anyone, write only to the course instructor."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.instructor == request.user


class IsOwner(permissions.BasePermission):
    """Allow access only to the object owner."""

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
```

```python
class CourseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsInstructorOrReadOnly]
```

---

## Authentication

### Session + Token Auth (mixed)

```python
# settings.py
INSTALLED_APPS = [
    ...
    "rest_framework",
    "rest_framework.authtoken",  # needed for TokenAuthentication
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.TokenAuthentication",
    ],
}
```

```bash
python manage.py migrate  # creates authtoken_token table
```

```python
# Create token manually
from rest_framework.authtoken.models import Token

token = Token.objects.create(user=user)
print(token.key)
```

### Auto-generate Token on User Creation (signal)

```python
# signals.py
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
```

Token usage in requests:
```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

### Login endpoint (built-in)

```python
# urls.py
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path("api/v1/auth/token/", obtain_auth_token),
]
```

---

## Pagination

### PageNumberPagination (global)

```python
# settings.py
REST_FRAMEWORK = {
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}
```

Response format:
```json
{
    "count": 100,
    "next": "http://api.example.com/courses/?page=2",
    "previous": null,
    "results": [...]
}
```

### Custom Pagination Class

```python
# core/pagination.py
from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
```

```python
class CourseViewSet(viewsets.ModelViewSet):
    pagination_class = StandardPagination
```

---

## Filtering

```bash
pip install django-filter
```

```python
# settings.py
INSTALLED_APPS = [..., "django_filters"]

REST_FRAMEWORK = {
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
}
```

```python
class CourseViewSet(viewsets.ModelViewSet):
    filterset_fields = ["status", "instructor"]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "title"]
    ordering = ["-created_at"]
```

Usage:
```
GET /api/v1/courses/?status=published
GET /api/v1/courses/?search=python
GET /api/v1/courses/?ordering=-created_at
```

---

## Error Handling

DRF returns structured error responses automatically. For custom errors:

```python
from rest_framework.exceptions import ValidationError, PermissionDenied, NotFound


# In a view or serializer
raise ValidationError({"title": ["This title already exists."]})
raise PermissionDenied("You do not have permission to publish this course.")
raise NotFound("Course not found.")
```

Standard error response format:
```json
{
    "detail": "Not found."
}
```

```json
{
    "title": ["This field is required."],
    "status": ["Invalid choice."]
}
```

---

## Useful Links

- DRF documentation: https://www.django-rest-framework.org/
- Serializers: https://www.django-rest-framework.org/api-guide/serializers/
- ViewSets: https://www.django-rest-framework.org/api-guide/viewsets/
- Routers: https://www.django-rest-framework.org/api-guide/routers/
- Permissions: https://www.django-rest-framework.org/api-guide/permissions/
- Authentication: https://www.django-rest-framework.org/api-guide/authentication/
- Filtering: https://www.django-rest-framework.org/api-guide/filtering/
- Pagination: https://www.django-rest-framework.org/api-guide/pagination/
