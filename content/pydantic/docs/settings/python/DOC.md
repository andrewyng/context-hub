---
name: settings
description: "pydantic-settings 2.14.1 package guide for typed application settings, dotenv files, CLI parsing, and secret sources in Python"
metadata:
  languages: "python"
  versions: "2.14.1"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "pydantic-settings,python,configuration,environment,settings,secrets,cli"
---

# pydantic-settings Python Package Guide

## What It Is

`pydantic-settings` adds typed application settings on top of Pydantic v2. Use it when config should come from environment variables, `.env` files, mounted secret files, CLI flags, or extra config sources while still being validated into normal Python types.

Reach for it when you want:

- one typed settings object for app startup
- automatic coercion from env strings to Python values
- nested settings models
- source priority you can customize
- optional integrations for TOML, YAML, AWS Secrets Manager, Azure Key Vault, or Google Secret Manager

## Install

Pin the version your project expects:

```bash
python -m pip install "pydantic-settings==2.14.1"
```

Common alternatives:

```bash
uv add "pydantic-settings==2.14.1"
poetry add "pydantic-settings==2.14.1"
```

Optional extras published on PyPI:

```bash
python -m pip install "pydantic-settings[toml]==2.14.1"
python -m pip install "pydantic-settings[yaml]==2.14.1"
python -m pip install "pydantic-settings[aws-secrets-manager]==2.14.1"
python -m pip install "pydantic-settings[azure-key-vault]==2.14.1"
python -m pip install "pydantic-settings[gcp-secret-manager]==2.14.1"
```

## Core Pattern

Use `BaseSettings` for startup config, not for request payloads or domain models.

```python
from pydantic import BaseModel, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

class DatabaseSettings(BaseModel):
    host: str = "localhost"
    port: int = 5432
    user: str
    password: SecretStr

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="APP_",
        env_file=".env",
        env_nested_delimiter="__",
        extra="ignore",
    )

    debug: bool = False
    log_level: str = "INFO"
    database: DatabaseSettings

settings = Settings()

print(settings.debug)
print(settings.database.host)
print(settings.database.password.get_secret_value())
```

Example environment:

```dotenv
APP_DEBUG=true
APP_DATABASE='{"user":"app","password":"secret"}'
APP_DATABASE__HOST=db.internal
APP_DATABASE__PORT=5433
```

Important behavior:

- Complex values such as `list`, `dict`, and nested models are parsed from JSON strings by default.
- With `env_nested_delimiter="__"`, nested variables such as `APP_DATABASE__HOST` override values from the top-level JSON env var.
- Nested settings models should be normal Pydantic models such as `BaseModel`, not `BaseSettings`.

## Environment Naming, Aliases, And Prefixes

By default, `BaseSettings` looks for env vars that match the field name, optionally prefixed by `env_prefix`.

If the external env name should differ from the Python attribute name, use `validation_alias`:

```python
from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="APP_")

    api_key: str = Field(
        validation_alias=AliasChoices("OPENAI_API_KEY", "APP_API_KEY")
    )
```

Notes:

- `validation_alias` changes input names without changing the attribute name.
- `AliasChoices(...)` is useful during migrations when old and new env var names must both work.
- `env_prefix` does not apply to fields with an alias, so declare the exact env names you want in the alias.

## Dotenv And Secrets Files

Use `.env` loading for local development and `secrets_dir` for mounted secrets in containers:

```python
from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        secrets_dir="/run/secrets",
        extra="ignore",
    )

    database_url: str
    api_token: SecretStr
```

Operational notes:

- `.env` loading checks the current working directory unless you pass a specific path.
- `extra="forbid"` is the default for settings. That can make unrelated keys in a shared `.env` fail validation, so `extra="ignore"` is often safer for app config.
- Secret files are read by filename, so `/run/secrets/api_token` maps to `api_token`.
- `secrets_dir` is lower priority than init kwargs, env vars, and dotenv values unless you customize source order.

## CLI Parsing

`pydantic-settings` can parse CLI arguments into the same settings model:

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings, cli_parse_args=True):
    dry_run: bool = False
    workers: int = 4

settings = Settings()
print(settings.model_dump())
```

Example:

```bash
python app.py --dry_run=true --workers=8
```

Notes:

- CLI support is opt-in with `cli_parse_args=True`.
- When enabled, CLI arguments are the highest-priority source by default.
- This is useful for scripts and internal tools where you want one schema for env vars and command-line overrides.

## Custom Sources And Source Priority

The default priority is:

1. CLI arguments, if enabled
2. Initialization keyword arguments
3. Environment variables
4. `.env` file values
5. Secret files from `secrets_dir`
6. Field defaults

You can change source order or add file-backed sources with `settings_customise_sources(...)`:

```python
from pydantic_settings import (
    BaseSettings,
    PydanticBaseSettingsSource,
    PyprojectTomlConfigSettingsSource,
)

class Settings(BaseSettings):
    timeout_seconds: int = 30

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls,
        init_settings: PydanticBaseSettingsSource,
        env_settings: PydanticBaseSettingsSource,
        dotenv_settings: PydanticBaseSettingsSource,
        file_secret_settings: PydanticBaseSettingsSource,
    ) -> tuple[PydanticBaseSettingsSource, ...]:
        return (
            init_settings,
            env_settings,
            PyprojectTomlConfigSettingsSource(settings_cls),
            dotenv_settings,
            file_secret_settings,
        )
```

The first returned source has the highest priority. Built-in helpers documented upstream include JSON, `pyproject.toml`, TOML, and YAML config sources.

## External Secret Managers

The package ships optional source integrations for external secret stores. Install the matching extra and handle provider authentication separately.

Common patterns:

- AWS Secrets Manager: install `pydantic-settings[aws-secrets-manager]` and authenticate with normal AWS credentials resolution.
- Azure Key Vault: install `pydantic-settings[azure-key-vault]` and use Azure credentials such as `DefaultAzureCredential`.
- Google Secret Manager: install `pydantic-settings[gcp-secret-manager]` and use ADC or explicit Google credentials.

Important boundary:

- `pydantic-settings` validates and maps secret values; it is not an auth library.
- Provider IAM, service accounts, and cloud SDK credentials must already be configured correctly.

## Common Pitfalls

- `BaseSettings` moved out of `pydantic` in v2. Import it from `pydantic_settings`, not `pydantic`.
- The package name is `pydantic-settings`, but the import module is `pydantic_settings`.
- Defaults are validated for `BaseSettings` by default. If you need a non-validating default, set `validate_default=False` on the field or model config.
- Complex env values are JSON-decoded by default. If your env format is CSV or another custom string format, use `NoDecode`, `ForceDecode`, or a validator instead of assuming automatic parsing.
- `env_prefix` does not rewrite aliased fields. If you use `validation_alias` or `alias`, define the exact input names you expect.
- If nested env parsing splits too aggressively because your field names contain `_`, set `env_nested_max_split` explicitly.
- Reloading is not automatic. If you intentionally want to re-read sources into an existing mutable settings object, the docs show calling `__init__()` again.

## Version-Sensitive Notes

- As of May 29, 2026, PyPI lists `2.14.1`, which matches the version covered here.
- The official docs live under the main Pydantic docs site, not a separate `pydantic-settings` docs domain.
- This package is for the Pydantic v2 settings model. Older blog posts that import `BaseSettings` from `pydantic` are v1-era examples and should not be copied into new code.
- Python `>=3.10` is required for the current package release.
