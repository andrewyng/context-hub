---
name: package
description: "Django package guide for Python projects using the official Django 6.0 docs"
metadata:
  languages: "python"
  versions: "6.0.5"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "django,python,web,framework,orm,templates,admin"
---

# Django Python Package Guide

## Golden Rule

Use the Django 6.0 docs for setup and behavior, and stay on the latest 6.0.x patch if your project is pinned to the 6.0 series. As of May 29, 2026, PyPI lists `Django 6.0.5` (released 2026-05-05) as the current 6.0.x patch.

## Install

Use a virtual environment and pin the version your project expects:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "Django==6.0.5"
```

Common alternatives:

```bash
uv add "Django==6.0.5"
poetry add "Django==6.0.5"
```

Optional password hasher extras published on PyPI:

```bash
python -m pip install "Django[argon2]==6.0.5"
python -m pip install "Django[bcrypt]==6.0.5"
```

## Initialize A Project

Create a project, apply built-in migrations, and run the dev server:

```bash
django-admin startproject mysite
cd mysite
python manage.py migrate
python manage.py runserver
```

The generated project includes these important files:

- `manage.py`: command entry point for migrations, dev server, shell, and admin tasks
- `mysite/settings.py`: installed apps, database config, middleware, templates, static config
- `mysite/urls.py`: root URL router
- `mysite/asgi.py`: ASGI application entry point
- `mysite/wsgi.py`: WSGI application entry point

## Project And App Structure

A Django project is a Python package that contains one or more apps. Each app should be a focused unit of functionality (auth, billing, polls, etc.) that can theoretically be reused across projects.

```text
mysite/
  manage.py
  mysite/
    __init__.py
    settings.py
    urls.py
    asgi.py
    wsgi.py
  polls/
    __init__.py
    admin.py
    apps.py
    models.py
    views.py
    urls.py
    migrations/
    templates/polls/
    static/polls/
```

Create an app and register it:

```bash
python manage.py startapp polls
```

```python
# mysite/settings.py
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "polls.apps.PollsConfig",
]
```

## Models And Migrations

Models are plain Python classes that subclass `django.db.models.Model`. Each model maps to one DB table.

```python
# polls/models.py
from django.db import models


class Question(models.Model):
    question_text = models.CharField(max_length=200)
    pub_date = models.DateTimeField("date published")

    def __str__(self) -> str:
        return self.question_text


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="choices")
    choice_text = models.CharField(max_length=200)
    votes = models.IntegerField(default=0)
```

Generate and apply migrations:

```bash
python manage.py makemigrations polls
python manage.py migrate
```

Useful inspection commands:

```bash
python manage.py sqlmigrate polls 0001
python manage.py showmigrations
python manage.py shell
```

`makemigrations` writes migration files; `migrate` runs them. You need both.

## Views

### Function-based views

```python
# polls/views.py
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render

from .models import Question


def index(request):
    latest = Question.objects.order_by("-pub_date")[:5]
    return render(request, "polls/index.html", {"latest_question_list": latest})


def detail(request, question_id: int):
    question = get_object_or_404(Question, pk=question_id)
    return render(request, "polls/detail.html", {"question": question})
```

### Class-based views

```python
# polls/views.py
from django.views.generic import DetailView, ListView

from .models import Question


class IndexView(ListView):
    template_name = "polls/index.html"
    context_object_name = "latest_question_list"

    def get_queryset(self):
        return Question.objects.order_by("-pub_date")[:5]


class DetailView(DetailView):
    model = Question
    template_name = "polls/detail.html"
```

## URL Routing

```python
# polls/urls.py
from django.urls import path

from . import views

app_name = "polls"
urlpatterns = [
    path("", views.index, name="index"),
    path("<int:question_id>/", views.detail, name="detail"),
]
```

```python
# mysite/urls.py
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("polls/", include("polls.urls")),
    path("admin/", admin.site.urls),
]
```

Reverse URLs with `reverse()` or `{% url %}` to avoid hard-coding paths:

```python
from django.urls import reverse

reverse("polls:detail", kwargs={"question_id": 3})
```

## Templates

Keep app templates namespaced under the app name to avoid collisions:

```text
polls/
  templates/
    polls/
      index.html
      detail.html
```

```html
{# polls/templates/polls/index.html #}
{% if latest_question_list %}
  <ul>
  {% for q in latest_question_list %}
    <li><a href="{% url 'polls:detail' q.id %}">{{ q.question_text }}</a></li>
  {% endfor %}
  </ul>
{% else %}
  <p>No polls available.</p>
{% endif %}
```

Configure template engines in `settings.py`:

```python
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]
```

Django 6.0 also ships template partials (`{% partialdef %}` / `{% partial %}`) for reusable template fragments.

## Forms

```python
# polls/forms.py
from django import forms

from .models import Question


class QuestionForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = ["question_text", "pub_date"]


class SearchForm(forms.Form):
    q = forms.CharField(max_length=200, required=False)
```

```python
# polls/views.py
from django.shortcuts import redirect, render

from .forms import QuestionForm


def new_question(request):
    if request.method == "POST":
        form = QuestionForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("polls:index")
    else:
        form = QuestionForm()
    return render(request, "polls/new.html", {"form": form})
```

Always include `{% csrf_token %}` inside `<form method="post">` blocks.

## Admin

```python
# polls/admin.py
from django.contrib import admin

from .models import Choice, Question


class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 2


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("question_text", "pub_date")
    list_filter = ("pub_date",)
    search_fields = ("question_text",)
    inlines = [ChoiceInline]
```

Create an admin user:

```bash
python manage.py createsuperuser
```

## ORM And QuerySets

QuerySets are lazy. They do not hit the database until iterated, sliced (without a step), or coerced.

```python
from django.db.models import Count, F, Q

# Filtering
Question.objects.filter(pub_date__year=2026)
Question.objects.exclude(question_text__icontains="test")
Question.objects.filter(Q(pub_date__year=2026) | Q(question_text__startswith="Hi"))

# Ordering, slicing
Question.objects.order_by("-pub_date")[:10]

# Aggregation and annotation
Question.objects.annotate(num_choices=Count("choices")).filter(num_choices__gt=0)

# Updates without loading rows
Question.objects.filter(pk=1).update(question_text=F("question_text"))

# Related lookups
Question.objects.filter(choices__votes__gt=10).distinct()
Question.objects.select_related("author").prefetch_related("choices")

# Single object
Question.objects.get(pk=1)            # raises DoesNotExist / MultipleObjectsReturned
Question.objects.filter(pk=1).first() # returns None if missing

# Create / update
q, created = Question.objects.get_or_create(question_text="Hi", defaults={"pub_date": now()})
Question.objects.update_or_create(pk=1, defaults={"question_text": "Updated"})
```

Use `select_related()` for one-to-one and many-to-one joins, `prefetch_related()` for many-to-many and reverse relations to avoid N+1 queries.

### Async ORM

Django supports async ORM methods alongside sync ones:

```python
async def latest_questions():
    qs = Question.objects.order_by("-pub_date")
    async for q in qs:
        print(q.question_text)

    first = await qs.afirst()
    count = await qs.acount()
    obj = await Question.objects.aget(pk=1)
    await Question.objects.acreate(question_text="async", pub_date=now())
```

Most sync ORM methods have an `a`-prefixed async variant (`aget`, `acreate`, `asave`, `adelete`, `afilter` not needed since `filter` is lazy, `aiterator`, etc.). Iterating querysets with `async for` works directly.

## Settings Essentials

Django loads settings from the module pointed to by `DJANGO_SETTINGS_MODULE`. The default `manage.py`, `asgi.py`, and `wsgi.py` created by `startproject` set this for you.

For production, keep secrets and environment-specific values outside source control. A common pattern is to split settings into `base.py`, `dev.py`, and `prod.py`, then select the active module with `DJANGO_SETTINGS_MODULE`.

Minimum production settings to review explicitly:

- `DEBUG = False`
- `ALLOWED_HOSTS = ["your-domain.example"]`
- `CSRF_TRUSTED_ORIGINS = ["https://your-domain.example"]` when needed behind HTTPS proxies or cross-origin admin flows
- `SECRET_KEY` from an environment variable
- `SECRET_KEY_FALLBACKS` when rotating keys
- `DATABASES` from environment-specific config
- `STATIC_ROOT` and static file serving strategy
- `SECURE_PROXY_SSL_HEADER` and `SECURE_SSL_REDIRECT` when terminating TLS at a proxy

Example environment-driven settings:

```python
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DEBUG = os.getenv("DJANGO_DEBUG", "").lower() == "true"
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]
ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
CSRF_TRUSTED_ORIGINS = [
    origin for origin in os.getenv("DJANGO_CSRF_TRUSTED_ORIGINS", "").split(",") if origin
]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ["DB_NAME"],
        "USER": os.environ["DB_USER"],
        "PASSWORD": os.environ["DB_PASSWORD"],
        "HOST": os.environ["DB_HOST"],
        "PORT": os.getenv("DB_PORT", "5432"),
    }
}
```

## Middleware

Middleware are classes that wrap every request/response. They run top-to-bottom on request and bottom-to-top on response.

```python
# settings.py
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
```

Custom middleware:

```python
class RequestTimingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response["X-Server"] = "django"
        return response
```

Django 6.0 also added built-in Content Security Policy middleware; configure via `SECURE_CSP` and `SECURE_CSP_REPORT_ONLY` and include `django.middleware.csp.ContentSecurityPolicyMiddleware`.

## Authentication Basics

The `django.contrib.auth` app provides `User`, password hashing, sessions, login views, and permissions out of the box.

```python
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, permission_required
from django.shortcuts import redirect, render


def sign_in(request):
    if request.method == "POST":
        user = authenticate(
            request,
            username=request.POST["username"],
            password=request.POST["password"],
        )
        if user is not None:
            login(request, user)
            return redirect("polls:index")
    return render(request, "registration/login.html")


@login_required
def my_polls(request):
    return render(request, "polls/mine.html", {"polls": request.user.polls.all()})


@permission_required("polls.change_question")
def edit(request, pk):
    ...
```

Class-based equivalents:

```python
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.views.generic import ListView


class MyPolls(LoginRequiredMixin, ListView):
    model = Question
    template_name = "polls/mine.html"
```

Hook custom user models via `AUTH_USER_MODEL = "accounts.User"` early in a project's life. Migrating after data exists is painful.

## ASGI vs WSGI

Use the generated application object with your server instead of `runserver` in production.

ASGI:

```python
from django.core.asgi import get_asgi_application

application = get_asgi_application()
```

WSGI:

```python
from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
```

Use ASGI if your stack needs async views, long-lived connections, or additional ASGI tooling. Use WSGI for conventional sync deployments.

## Common Commands

```bash
python manage.py runserver
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py shell
python manage.py test
python manage.py collectstatic
python manage.py check --deploy
```

## Common Pitfalls

- Do not use `runserver` in production. Deploy the ASGI or WSGI application behind a real application server.
- `makemigrations` writes migration files; `migrate` applies them. Agents often do one and forget the other.
- New apps must be added to `INSTALLED_APPS` before model discovery, app configs, admin registration, and template loading behave as expected.
- Keep templates under `templates/<app_name>/...`; flat template names collide quickly in larger projects.
- Set `ALLOWED_HOSTS` before turning `DEBUG` off or you will get `DisallowedHost` errors.
- Keep `SECRET_KEY` out of the repo. Django 6.0 supports `SECRET_KEY_FALLBACKS` for staged rotation.
- The deployment checklist is not optional. Run `python manage.py check --deploy` against production settings before release.
- Async Django is not the same as "everything is non-blocking". Avoid calling blocking libraries directly from async views.
- N+1 queries are easy to hit with related objects in templates; reach for `select_related`/`prefetch_related`.

## Version-Sensitive Notes For Django 6.0

- Django 6.0 requires Python 3.12 or later.
- Django 6.0.5 (2026-05-05) is the current 6.0.x patch on PyPI.
- The Django 6.0 release adds built-in Content Security Policy support, template partials, and a task framework. Many third-party blog posts will not cover them correctly yet.
- Check the 6.0.x release notes before copying examples from early 6.0 articles, especially around security fixes and bugfixes.
- If a project still targets Python 3.10 or 3.11, it cannot move to Django 6.0 without a Python upgrade.

## Official Sources

- Django 6.0 docs root: https://docs.djangoproject.com/en/6.0/
- Installation guide: https://docs.djangoproject.com/en/6.0/intro/install/
- Tutorial part 1: https://docs.djangoproject.com/en/6.0/intro/tutorial01/
- Tutorial part 2: https://docs.djangoproject.com/en/6.0/intro/tutorial02/
- Models and databases: https://docs.djangoproject.com/en/6.0/topics/db/
- Async support: https://docs.djangoproject.com/en/6.0/topics/async/
- Settings topic guide: https://docs.djangoproject.com/en/6.0/topics/settings/
- Middleware: https://docs.djangoproject.com/en/6.0/topics/http/middleware/
- Authentication: https://docs.djangoproject.com/en/6.0/topics/auth/
- Deployment checklist: https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/
- ASGI deployment: https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
- WSGI deployment: https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
- Django 6.0 release notes: https://docs.djangoproject.com/en/6.0/releases/6.0/
- Django 6.0.5 release notes: https://docs.djangoproject.com/en/6.0/releases/6.0.5/
- PyPI package page: https://pypi.org/project/django/
