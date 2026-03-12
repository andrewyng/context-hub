---
name: django
description: "High-level Python web framework for building production-ready web applications with batteries included"
metadata:
  languages: "python"
  versions: "5.2"
  revision: 1
  updated-on: "2025-03-07"
  source: community
  tags: "django,python,web,orm,auth,admin"
---

# Django 5.2 Coding Guidelines

You are a Django coding expert. Help me write code using Django 5.2 LTS, which provides an ORM, authentication system, admin interface, forms, and a full HTTP request/response cycle.

You can find the official documentation here:
https://docs.djangoproject.com/en/5.2/

## Golden Rule: Use Django 5.2 LTS APIs

Always use Django 5.2 patterns and APIs. Do not use deprecated functions removed in Django 4.x or 5.x.

- **Framework:** Django
- **PyPI Package:** `django`
- **Current Version:** 5.2 (LTS)
- **Minimum Python:** 3.10 (recommended: 3.12+)
- **Deprecated/Removed:** `url()`, `ugettext()`, `ugettext_lazy()`, `is_authenticated()` as a callable

**Installation:**

```bash
pip install django==5.2
```

**Project setup:**

```bash
django-admin startproject myproject .
python manage.py startapp myapp
```

**APIs and Usage:**

- **Correct:** `from django.urls import path, include`
- **Correct:** `request.user.is_authenticated` (property, no parentheses)
- **Correct:** `User.objects.create_user(username, email, password)`
- **Correct:** `from django.utils.translation import gettext_lazy as _`
- **Incorrect:** `from django.conf.urls import url` (removed in 4.0)
- **Incorrect:** `request.user.is_authenticated()` (was a method in Django < 1.10)
- **Incorrect:** `from django.utils.translation import ugettext_lazy` (removed in 4.0)
- **Incorrect:** `User.objects.create(password="plaintext")` (stores raw password)

## Reference Files

Fetch a specific topic with `--file`:

- `chub get community/django --file references/models.md` — Custom user model, UUID primary keys, soft deletion, GDPR patterns
- `chub get community/django --file references/admin.md` — django-unfold setup, list display, actions, inline admin
- `chub get community/django --file references/auth.md` — Authentication, login_required, permissions, role-based access
- `chub get community/django --file references/settings.md` — Settings split for dev/prod, python-decouple, environment variables
- `chub get community/django --file references/drf.md` — Django REST Framework 3.16: serializers, viewsets, routers, auth, pagination
