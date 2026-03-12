# Django 5.2 Settings Coding Guidelines

You are a Django configuration expert. Help me structure Django 5.2 settings for multiple environments (development, production) using `python-decouple` for environment variable management and a split settings layout.

You can find the official documentation here:
https://docs.djangoproject.com/en/5.2/topics/settings/

## Golden Rule: Never Hardcode Secrets or Environment-Specific Values

Always read `SECRET_KEY`, database credentials, and API keys from environment variables using `python-decouple`. Never commit `.env` files to version control. Always split settings into `base.py`, `development.py`, and `production.py`.

- **Correct:** `SECRET_KEY = config("SECRET_KEY")` — raises `UndefinedValueError` if missing
- **Correct:** `DEBUG = config("DEBUG", default=False, cast=bool)`
- **Correct:** `ALLOWED_HOSTS = config("ALLOWED_HOSTS", cast=Csv())`
- **Incorrect:** `SECRET_KEY = "hardcoded-secret-key-in-code"`
- **Incorrect:** `DEBUG = True` in production settings
- **Incorrect:** A single `settings.py` file with `if DEBUG:` branches
- **Incorrect:** `os.environ.get("KEY")` without a default — returns `None` silently, prefer `config()`

**Installation:**

```bash
pip install python-decouple whitenoise
```

## Recommended Directory Layout

```
myproject/
├── myproject/
│   ├── settings/
│   │   ├── __init__.py       # empty
│   │   ├── base.py           # shared across all environments
│   │   ├── development.py    # local dev overrides
│   │   └── production.py     # production overrides
│   ├── urls.py
│   └── wsgi.py
├── .env                      # never commit — add to .gitignore
├── .env.example              # commit this — shows required keys without values
└── manage.py
```

Point Django to the correct settings file:

```bash
# .env
DJANGO_SETTINGS_MODULE=myproject.settings.development
```

```python
# manage.py
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings.development")
```

## base.py

```python
# myproject/settings/base.py
from pathlib import Path
from decouple import config, Csv

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = config("SECRET_KEY")
DEBUG = config("DEBUG", default=False, cast=bool)
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="", cast=Csv())

AUTH_USER_MODEL = "accounts.User"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

DJANGO_APPS = [
    "unfold",
    "unfold.contrib.filters",
    "unfold.contrib.forms",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

LOCAL_APPS = [
    "accounts",
    "courses",
]

INSTALLED_APPS = DJANGO_APPS + LOCAL_APPS

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "myproject.urls"
WSGI_APPLICATION = "myproject.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("DB_NAME"),
        "USER": config("DB_USER"),
        "PASSWORD": config("DB_PASSWORD"),
        "HOST": config("DB_HOST", default="localhost"),
        "PORT": config("DB_PORT", default="5432"),
    }
}

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

LOGIN_URL = "/accounts/login/"
LOGIN_REDIRECT_URL = "/dashboard/"
LOGOUT_REDIRECT_URL = "/"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]
```

## development.py

```python
# myproject/settings/development.py
from .base import *

DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# Use SQLite locally — no Postgres required for development
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Print emails to console instead of sending
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Optional: Django Debug Toolbar
INSTALLED_APPS += ["debug_toolbar"]
MIDDLEWARE += ["debug_toolbar.middleware.DebugToolbarMiddleware"]
INTERNAL_IPS = ["127.0.0.1"]
```

## production.py

```python
# myproject/settings/production.py
from .base import *

DEBUG = False

# Security headers
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = "DENY"
SECURE_CONTENT_TYPE_NOSNIFF = True

# Email — Resend via SMTP or AWS SES
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = config("EMAIL_HOST")
EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
EMAIL_HOST_USER = config("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD")
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL")
```

## .env File

```bash
# .env — never commit this file
DJANGO_SETTINGS_MODULE=myproject.settings.production

SECRET_KEY=your-very-long-random-secret-key-at-least-50-chars
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

DB_NAME=mydb
DB_USER=myuser
DB_PASSWORD=mypassword
DB_HOST=localhost
DB_PORT=5432

EMAIL_HOST=smtp.resend.com
EMAIL_PORT=587
EMAIL_HOST_USER=resend
EMAIL_HOST_PASSWORD=re_xxxxxxxxxxxx
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
```

## .env.example (commit this)

```bash
# .env.example — copy to .env and fill in values
DJANGO_SETTINGS_MODULE=myproject.settings.development

SECRET_KEY=
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432

EMAIL_HOST=
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
DEFAULT_FROM_EMAIL=
```

## .gitignore Entries

```
.env
*.pyc
__pycache__/
db.sqlite3
staticfiles/
media/
.DS_Store
```

## python-decouple API Reference

```python
from decouple import config, Csv, UndefinedValueError

# Required — raises UndefinedValueError if missing
SECRET_KEY = config("SECRET_KEY")

# With default and type cast
DEBUG = config("DEBUG", default=False, cast=bool)
PORT = config("PORT", default=8000, cast=int)

# Comma-separated list: "a.com,b.com" → ["a.com", "b.com"]
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost", cast=Csv())

# Optional value
SENTRY_DSN = config("SENTRY_DSN", default=None)
```

## Production Readiness Check

Run before every deployment:

```bash
python manage.py check --deploy
```

Fix all warnings. Common issues: `DEBUG=True`, missing `SECURE_HSTS_SECONDS`, non-HTTPS cookies.

## Useful Links

- Settings reference: https://docs.djangoproject.com/en/5.2/ref/settings/
- Deployment checklist: https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/
- python-decouple: https://github.com/HBNetwork/python-decouple
- whitenoise: https://whitenoise.readthedocs.io/en/stable/django.html
