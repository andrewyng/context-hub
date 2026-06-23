# Django 5.2 Models Coding Guidelines

You are a Django coding expert. Help me write Django 5.2 model code including custom user models, UUID primary keys, soft deletion, field choices, and abstract base classes.

You can find the official documentation here:
https://docs.djangoproject.com/en/5.2/topics/db/models/

## Golden Rule: Define a Custom User Model Before Any Migration

Always replace the default `User` model before running `python manage.py migrate` for the first time. Changing `AUTH_USER_MODEL` after migrations have been applied requires resetting the entire database.

- **Correct:** Define `AbstractUser` subclass, set `AUTH_USER_MODEL` in settings, then migrate
- **Correct:** Use `uuid.uuid4` for primary keys on models exposed in URLs
- **Correct:** Use `models.TextChoices` / `models.IntegerChoices` for field enumerations
- **Correct:** Use `blank=True` (not `null=True`) for optional `CharField` / `TextField`
- **Incorrect:** Running `migrate` before defining a custom user model
- **Incorrect:** `User.objects.create(password="plaintext")` — always use `create_user()`
- **Incorrect:** `null=True` on `CharField` or `TextField` — creates two empty states
- **Incorrect:** Omitting `on_delete` on `ForeignKey` — it is required in Django 5.x
- **Incorrect:** `models.ForeignKey(..., on_delete=models.CASCADE)` without `related_name` on multiple FKs to same model

## Custom User Model

```python
# accounts/models.py
import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        db_table = "users"
```

```python
# settings.py
AUTH_USER_MODEL = "accounts.User"
```

```python
# accounts/apps.py
from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "accounts"
```

Register in `INSTALLED_APPS` as `"accounts.apps.AccountsConfig"` or simply `"accounts"`.

## Abstract Base Model with UUID and Timestamps

Use this as the base for all models to ensure consistent primary keys and audit timestamps.

```python
# core/models.py
import uuid
from django.db import models


class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
```

Usage:

```python
from core.models import BaseModel


class Course(BaseModel):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    instructor = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="courses",
    )
```

## Soft Deletion (GDPR-Ready)

Soft deletion marks records as deleted without removing them from the database. Use when you need audit trails or GDPR right-to-erasure workflows (anonymize instead of hard-delete).

### QuerySet and Manager

```python
# core/models.py
from django.db import models
from django.utils import timezone


class SoftDeleteQuerySet(models.QuerySet):
    def delete(self):
        return self.update(deleted_at=timezone.now())

    def hard_delete(self):
        return super().delete()

    def alive(self):
        return self.filter(deleted_at__isnull=True)

    def dead(self):
        return self.filter(deleted_at__isnull=False)


class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db).alive()


class SoftDeleteModel(models.Model):
    deleted_at = models.DateTimeField(null=True, blank=True, default=None)

    objects = SoftDeleteManager()       # default: excludes deleted records
    all_objects = models.Manager()      # bypasses soft-delete filter

    def delete(self, using=None, keep_parents=False):
        self.deleted_at = timezone.now()
        self.save(update_fields=["deleted_at"])

    def hard_delete(self):
        super().delete()

    def restore(self):
        self.deleted_at = None
        self.save(update_fields=["deleted_at"])

    @property
    def is_deleted(self):
        return self.deleted_at is not None

    class Meta:
        abstract = True
```

### Combined Base with UUID + Soft Delete

```python
class BaseModel(SoftDeleteModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
```

### Usage

```python
# Soft-delete a single record
course.delete()

# Restore a soft-deleted record
course.restore()

# Hard-delete (permanent)
course.hard_delete()

# Query only active records (default behavior)
Course.objects.all()

# Query including deleted records
Course.all_objects.all()
Course.all_objects.filter(deleted_at__isnull=False)
```

## Field Choices with TextChoices

Prefer `models.TextChoices` over raw string tuples — enables autocompletion and prevents typos.

```python
class Course(BaseModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        ARCHIVED = "archived", "Archived"

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )
```

Usage:

```python
# Assign
course.status = Course.Status.PUBLISHED

# Filter
Course.objects.filter(status=Course.Status.PUBLISHED)

# Check
if course.status == Course.Status.DRAFT:
    ...

# Human-readable label
course.get_status_display()  # "Published"
```

## ForeignKey Patterns

```python
# Correct — required fields
instructor = models.ForeignKey(
    "accounts.User",
    on_delete=models.CASCADE,
    related_name="courses",
)

# Correct — nullable FK
category = models.ForeignKey(
    "Category",
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="courses",
)

# Incorrect — missing on_delete
instructor = models.ForeignKey("accounts.User")

# Incorrect — null=True on CharField
title = models.CharField(max_length=255, null=True)  # use blank=True instead
```

## GeneratedField (Django 5.0+)

Use for values always derived from other fields — avoids keeping them in sync manually.

```python
from django.db.models import GeneratedField, Value
from django.db.models.functions import Concat


class UserProfile(BaseModel):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    full_name = GeneratedField(
        expression=Concat("first_name", Value(" "), "last_name"),
        output_field=models.CharField(max_length=201),
        db_persist=True,
    )
```

## Useful Links

- Models documentation: https://docs.djangoproject.com/en/5.2/topics/db/models/
- Field reference: https://docs.djangoproject.com/en/5.2/ref/models/fields/
- QuerySet API: https://docs.djangoproject.com/en/5.2/ref/models/querysets/
- Managers: https://docs.djangoproject.com/en/5.2/topics/db/managers/
- Migrations: https://docs.djangoproject.com/en/5.2/topics/migrations/
