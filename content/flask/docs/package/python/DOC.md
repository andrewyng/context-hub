---
name: package
description: "Flask 3.1.3 package guide for building and testing Python web applications"
metadata:
  languages: "python"
  versions: "3.1.3"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "flask,python,web,wsgi,jinja,werkzeug"
---

# Flask Python Package Guide

## Install

Flask 3.1.3 requires Python 3.9+. Released 2026-02-19, it is still the current release on PyPI as of 2026-05-29.

```bash
python -m venv .venv
source .venv/bin/activate
pip install "Flask==3.1.3"
```

Useful extras:

```bash
pip install "Flask[dotenv]==3.1.3"
pip install "Flask[async]==3.1.3"
```

- `dotenv` adds `.env` / `.flaskenv` loading support for the `flask` CLI.
- `async` enables `async def` views and other async request hooks.

## Minimal App

```python
from flask import Flask

app = Flask(__name__)

@app.get("/")
def healthcheck():
    return {"ok": True}
```

Run it with the CLI:

```bash
flask --app app run --debug
```

Important:

- Do not name your module `flask.py`; it conflicts with the package import.
- Use `--app` unless your entry file is named `app.py` or `wsgi.py`.
- Use `--debug` at startup rather than trying to flip `DEBUG` later in code.
- The built-in server is for development only, not production.

## App Factory And Blueprints

For any non-trivial project, prefer an application factory and blueprints. This makes testing easier and avoids binding extension state too early.

`myapp/__init__.py`

```python
from flask import Flask

from .extensions import db, login_manager


def create_app(test_config: dict | None = None) -> Flask:
    app = Flask(__name__, instance_relative_config=True)

    app.config.from_mapping(
        SECRET_KEY="dev-only-change-me",
        DATABASE_URL="sqlite:///app.db",
    )

    if test_config:
        app.config.update(test_config)
    else:
        app.config.from_prefixed_env()

    db.init_app(app)
    login_manager.init_app(app)

    from .views import bp as main_bp
    from .api import bp as api_bp
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix="/api")

    return app
```

`myapp/extensions.py`

```python
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

db = SQLAlchemy()
login_manager = LoginManager()
```

`myapp/views.py`

```python
from flask import Blueprint, current_app, jsonify

bp = Blueprint("main", __name__)


@bp.get("/")
def index():
    return jsonify(
        app_name=current_app.name,
        debug=current_app.debug,
    )
```

`myapp/api.py`

```python
from flask import Blueprint, jsonify, request

bp = Blueprint("api", __name__)


@bp.get("/items")
def list_items():
    return jsonify(items=[])


@bp.post("/items")
def create_item():
    payload = request.get_json()
    return jsonify(id=1, **payload), 201
```

Run a factory app:

```bash
flask --app myapp:create_app run --debug
```

Flask will auto-detect a factory named `create_app` or `make_app`.

## Routes, Request, And Response

### Route methods and path params

Flask 3.x prefers method-specific decorators (`@app.get`, `@app.post`, ...) over `methods=[...]`.

```python
from flask import Flask, abort, jsonify, request

app = Flask(__name__)


@app.get("/users/<int:user_id>")
def get_user(user_id: int):
    verbose = request.args.get("verbose") == "1"

    user = {"id": user_id, "name": "Ada"}
    if not user:
        abort(404)

    if verbose:
        user["debug"] = {"remote_addr": request.remote_addr}

    return jsonify(user)


@app.post("/users")
def create_user():
    payload = request.get_json(force=False, silent=False)
    if not payload or "name" not in payload:
        abort(400)

    return jsonify(id=123, name=payload["name"]), 201


@app.route("/legacy", methods=["GET", "POST"])
def legacy():
    if request.method == "POST":
        ...
    return "ok"
```

Converters supported in URL rules: `string` (default), `int`, `float`, `path`, `uuid`, `any`.

### Reading request data

- `request.args` for query parameters
- `request.form` for HTML form fields
- `request.files` for uploads
- `request.get_json()` for JSON request bodies
- `request.headers`, `request.cookies`, `request.remote_addr`
- `abort(status_code)` for simple HTTP errors

### Building responses

```python
from flask import Response, jsonify, make_response, redirect, url_for


@app.get("/redirect")
def go():
    return redirect(url_for("get_user", user_id=1))


@app.get("/raw")
def raw():
    response = make_response("hello")
    response.status_code = 202
    response.headers["X-Server"] = "flask"
    return response


@app.get("/csv")
def csv():
    return Response("a,b\n1,2\n", mimetype="text/csv")
```

Dict or list return values are auto-JSON-serialized.

## Jinja2 Templates

```python
from flask import Flask, render_template

app = Flask(__name__)


@app.get("/hello/<name>")
def hello(name: str):
    return render_template("hello.html", name=name, items=["a", "b"])
```

`templates/hello.html`

```html
<!doctype html>
<title>{{ name }}</title>
<h1>Hi {{ name|title }}</h1>
<ul>
  {% for item in items %}
    <li>{{ item }}</li>
  {% else %}
    <li>none</li>
  {% endfor %}
</ul>
{{ url_for('static', filename='app.css') }}
```

- Templates live under `templates/`
- Static files live under `static/`
- `__name__` on the `Flask(...)` app tells Flask where to find those resources
- Jinja auto-escapes HTML; use `|safe` deliberately, not by default
- Use `{% extends "base.html" %}` and `{% block %}` for layout inheritance

## Sessions

```python
from flask import Flask, redirect, session, url_for

app = Flask(__name__)
app.config["SECRET_KEY"] = "replace-in-production"


@app.post("/login")
def login():
    session["user_id"] = 42
    session.permanent = True
    return redirect(url_for("me"))


@app.get("/me")
def me():
    return {"user_id": session.get("user_id")}


@app.post("/logout")
def logout():
    session.clear()
    return redirect(url_for("me"))
```

Flask's built-in session uses a signed cookie, not a server-side session store. Keep session payloads small and non-sensitive.

## Configuration and Secrets

Flask configuration lives on `app.config`, which behaves like a dict.

```python
app.config.update(
    TESTING=False,
    SECRET_KEY="replace-me",
    TRUSTED_HOSTS=["example.com", ".example.com"],
    MAX_CONTENT_LENGTH=16 * 1024 * 1024,
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_SAMESITE="Lax",
)
```

Loading patterns:

```python
app.config.from_pyfile("config.py")            # /instance/config.py
app.config.from_object("myapp.settings")        # importable module or class
app.config.from_envvar("MYAPP_SETTINGS")        # path read from env var
app.config.from_prefixed_env()                  # FLASK_FOO -> app.config["FOO"]
```

With the default `FLASK_` prefix:

```bash
export FLASK_SECRET_KEY="$(python -c 'import secrets; print(secrets.token_hex())')"
export FLASK_MAIL_ENABLED=false
flask --app myapp:create_app run --debug
```

Key config to know in 3.1.x:

- `SECRET_KEY`: required for sessions, flash messages, and many extensions.
- `SECRET_KEY_FALLBACKS`: rotate signing keys without immediately invalidating active sessions.
- `TRUSTED_HOSTS`: validates the incoming host header during routing.
- `MAX_CONTENT_LENGTH`: caps request body size.
- `MAX_FORM_MEMORY_SIZE` and `MAX_FORM_PARTS`: 3.1 multipart form limits.
- `SESSION_COOKIE_SECURE`, `SESSION_COOKIE_SAMESITE`, `SESSION_COOKIE_PARTITIONED`.
- `TESTING`: enable in tests so exceptions propagate and extensions switch into test-friendly behavior.

## Error Handlers

```python
from flask import jsonify
from werkzeug.exceptions import HTTPException


@app.errorhandler(404)
def not_found(err):
    return jsonify(error="not_found"), 404


@app.errorhandler(HTTPException)
def http_error(err):
    return jsonify(error=err.name, code=err.code), err.code


@app.errorhandler(Exception)
def server_error(err):
    app.logger.exception("unhandled error")
    return jsonify(error="server_error"), 500
```

Error handlers can also be registered on blueprints with `@bp.errorhandler(...)` and apply only to routes under that blueprint.

## App Context vs Request Context

Flask uses two stacks of contexts. Both are pushed automatically while handling a request.

- **App context**: `current_app`, `g`. Active whenever any Flask code runs against an app (CLI commands, background jobs you bind manually, request handlers).
- **Request context**: `request`, `session`. Active only while handling an HTTP request.

When working outside a request (CLI tasks, scripts, background workers), push contexts manually:

```python
with app.app_context():
    # current_app, g available; request/session not
    do_offline_work()

with app.test_request_context("/?x=1"):
    # request, session also available
    assert request.args["x"] == "1"
```

`g` is a per-request scratchpad. It is reset on every request; do not use it for cross-request state.

## Async Views

Flask 3.1.3 supports async views and async request hooks if installed with the `async` extra.

```python
from flask import Flask, jsonify

app = Flask(__name__)


@app.get("/aggregate")
async def aggregate():
    result = await fetch_remote_data()
    return jsonify(result)


@app.before_request
async def before():
    ...
```

Important limitations:

- Flask remains a WSGI framework. Each async view runs on a worker thread's event loop.
- One worker still handles one request/response cycle.
- Async helps with concurrent IO inside a view, not with serving more requests per worker.
- Do not spawn background tasks with `asyncio.create_task()` from a view; unfinished tasks are cancelled when the async view completes.

If most of your stack is async-first, or you need websockets and long-lived async workloads, an ASGI-native framework may be a better fit.

## Extension Hooks

Most extensions follow `Extension(app=None)` + `extension.init_app(app)` so they cooperate with the factory pattern.

```python
# myapp/extensions.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
```

```python
# myapp/__init__.py
from .extensions import db


def create_app():
    app = Flask(__name__)
    app.config.from_prefixed_env()
    db.init_app(app)
    return app
```

App-level lifecycle hooks for custom logic:

```python
@app.before_request
def open_db():
    g.db = connect()


@app.teardown_request
def close_db(exc):
    db_conn = g.pop("db", None)
    if db_conn is not None:
        db_conn.close()


@app.context_processor
def inject_globals():
    return {"site_name": "Acme"}
```

## Testing

The official docs recommend `pytest` and Flask's built-in test client / CLI runner.

`tests/conftest.py`

```python
import pytest

from myapp import create_app


@pytest.fixture()
def app():
    app = create_app({"TESTING": True, "SECRET_KEY": "test-secret"})
    yield app


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def runner(app):
    return app.test_cli_runner()
```

`tests/test_app.py`

```python
from flask import session


def test_index(client):
    response = client.get("/")
    assert response.status_code == 200


def test_redirect_chain(client):
    response = client.get("/logout", follow_redirects=True)
    assert response.status_code == 200
    assert response.history


def test_modify_session(client):
    with client.session_transaction() as sess:
        sess["user_id"] = 1

    response = client.get("/me")
    assert response.json["user_id"] == 1


def test_context_access(client):
    with client:
        client.post("/login")
        assert session["user_id"] == 42
```

## Deployment

Do not deploy the development server. Use a production WSGI server or managed platform, for example:

- Gunicorn
- Waitress
- mod_wsgi
- uWSGI
- gevent-based hosting

Common production concerns:

- terminate TLS before Flask or at the reverse proxy
- set `TRUSTED_HOSTS`
- set secure cookie flags
- configure body/form limits
- if behind a proxy, wrap with `werkzeug.middleware.proxy_fix.ProxyFix` before trusting forwarded headers

## Common Pitfalls

- Module named `flask.py`: breaks imports.
- Missing `SECRET_KEY`: sessions and flash messages will not work correctly.
- Late debug changes: `DEBUG` may behave inconsistently if changed after startup; use `flask --debug`.
- Using `SERVER_NAME` as host protection: in 3.1 it no longer restricts requests to that domain; use `TRUSTED_HOSTS`.
- Large uploads with no limits: set `MAX_CONTENT_LENGTH`, and for multipart forms also set `MAX_FORM_MEMORY_SIZE` and `MAX_FORM_PARTS`.
- Assuming Flask sessions are encrypted server-side: they are signed cookies by default, so don't store secrets or large blobs in them.
- Binding extensions directly inside module import paths: prefer `extension = Extension()` and `extension.init_app(app)` in the factory.
- Copying old blog posts that use `FLASK_ENV` or `app.env`: those were removed in Flask 2.3.
- Relying on `flask.__version__`: deprecated since 3.0. Use `importlib.metadata.version("flask")`.
- Using `g` to store cross-request state: it is reset every request.

## Version-Sensitive Notes for 3.1.3

- `3.1.3` is the current PyPI release as of 2026-05-29 (released 2026-02-19).
- `3.1.3` is a security-fix release and should not otherwise change behavior relative to the latest feature release.
- `3.1.2` (2025-08-19) fixed async `stream_with_context` behavior and corrected session state when using `follow_redirects` in tests.
- `3.1.1` (2025-05-13) fixed signing key selection order when `SECRET_KEY_FALLBACKS` is enabled.
- `3.1.0` (2024-11-13) added `SECRET_KEY_FALLBACKS`, `TRUSTED_HOSTS`, `MAX_FORM_MEMORY_SIZE`, `MAX_FORM_PARTS`, and `SESSION_COOKIE_PARTITIONED`.
- `3.1.0` also changed `SERVER_NAME` behavior so it no longer restricts incoming requests to that domain.

## Official Sources

- Flask installation: https://flask.palletsprojects.com/en/stable/installation/
- Flask quickstart: https://flask.palletsprojects.com/en/stable/quickstart/
- Flask configuration: https://flask.palletsprojects.com/en/stable/config/
- Flask testing: https://flask.palletsprojects.com/en/stable/testing/
- Flask async support: https://flask.palletsprojects.com/en/stable/async-await/
- Flask application factories: https://flask.palletsprojects.com/en/stable/patterns/appfactories/
- Flask blueprints: https://flask.palletsprojects.com/en/stable/blueprints/
- Flask app context: https://flask.palletsprojects.com/en/stable/appcontext/
- Flask request context: https://flask.palletsprojects.com/en/stable/reqcontext/
- Flask error handling: https://flask.palletsprojects.com/en/stable/errorhandling/
- Flask deployment: https://flask.palletsprojects.com/en/stable/deploying/
- Flask changelog: https://flask.palletsprojects.com/en/stable/changes/
- Flask release page: https://github.com/pallets/flask/releases/tag/3.1.3
- PyPI package: https://pypi.org/project/Flask/
